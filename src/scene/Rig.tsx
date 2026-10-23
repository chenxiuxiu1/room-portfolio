import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OVERVIEW, OVERVIEW_MOBILE, damp } from '../lib/camera'
import { pointerState } from '../lib/pointer'
import { useRoom } from '../lib/store'
import { stations } from '../content/site'
import type { SectionId } from '../types'

const UP = new THREE.Vector3(0, 1, 0)

/** 穿窗：先进到窗前，再穿出去，两段机位保证相机真的从窗户中心飞出去 */
const PORTAL_IN = {
  position: new THREE.Vector3(-1.05, 2.2, -2.05),
  target: new THREE.Vector3(-1.05, 2.2, -18),
  fov: 38,
}
const PORTAL_OUT = {
  position: new THREE.Vector3(-1.05, 2.75, -11.5),
  target: new THREE.Vector3(0, 4.2, -30),
  fov: 58,
}

/** 相机：总览 → 物件聚焦 → 穿窗进入星空，全程支持拖拽环视 */
export default function Rig() {
  const { camera, gl, size, setDpr } = useThree()
  const active = useRoom((s) => s.active)
  const space = useRoom((s) => s.space)
  const quality = useRoom((s) => s.quality)
  const setQuality = useRoom((s) => s.setQuality)

  const look = useRef(new THREE.Vector3().copy(OVERVIEW.target))
  /** 环视角度：拖拽时逐帧直接吃掉，不能再插值一次，否则手到了画面还没到 */
  const orbit = useRef({ yaw: 0, pitch: 0 })
  /** 抬手后的角速度（rad/s），指数衰减——像拨了一下转盘，而不是松手就刹死 */
  const spin = useRef({ yaw: 0, pitch: 0 })
  /** 每帧把当前档位允许的范围存下来，pointermove 里据此即时截断 */
  const lim = useRef({ yaw: 1.15, pitch: 0.46 })
  const prevOrbit = useRef({ yaw: 0, pitch: 0 })
  /** 平滑后的视差，避免指针事件和 rAF 不同步造成的抖动 */
  const parallax = useRef({ x: 0, y: 0 })
  const first = useRef(true)
  const reduced = useRef(false)
  const spaceT = useRef(0)
  const prevActive = useRef<SectionId | null>(null)
  /** 机位是否刚换过：换机位要慢速运镜，环视才要跟手 */
  const pose = useRef<{ active: SectionId | null; space: boolean }>({ active: null, space: false })
  const perf = useRef({ frames: 0, span: 0, low: 0 })

  const tmp = useMemo(
    () => ({
      baseP: new THREE.Vector3(),
      baseT: new THREE.Vector3(),
      offset: new THREE.Vector3(),
      right: new THREE.Vector3(),
      screenRight: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      wantLook: new THREE.Vector3(),
    }),
    [],
  )

  useEffect(() => {
    pointerState.fine = window.matchMedia('(pointer: fine)').matches
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // 渲染分辨率分三档：原生 / 1.5 / 1。关键是避免「非整数重采样」——
  // dpr 取 1.35 这类值会让渲染像素和屏幕像素错开成怪异比例，画出来反而比 1:1 更脏。
  // 1.5 是 2x 屏上的 3/4 分辨率（缩放比恒为 4:3），观感几乎无损，却省掉 44% 的像素。
  useEffect(() => {
    const native = Math.min(window.devicePixelRatio || 1, 2)
    const px = size.width * size.height
    let dpr = quality === 2 ? native : quality === 1 ? Math.min(native, 1.5) : 1
    // 4K@2x 这类超大画布核显扛不住，退回干净的 1:1
    if (px * dpr * dpr > 8_300_000) dpr = 1
    setDpr(dpr)
  }, [quality, size.width, size.height, setDpr])

  // 每次进入板块都回到设计好的机位，之后才允许自由环视
  useEffect(() => {
    if (active === prevActive.current) return
    prevActive.current = active
    orbit.current.yaw = 0
    orbit.current.pitch = 0
    spin.current.yaw = 0
    spin.current.pitch = 0
    prevOrbit.current.yaw = 0
    prevOrbit.current.pitch = 0
  }, [active])

  useEffect(() => {
    spaceT.current = 0
    orbit.current.yaw = 0
    orbit.current.pitch = 0
    spin.current.yaw = 0
    spin.current.pitch = 0
    prevOrbit.current.yaw = 0
    prevOrbit.current.pitch = 0
  }, [space])

  useEffect(() => {
    const el = gl.domElement
    const restore = () => {
      pointerState.down = false
      if (el.style.pointerEvents === 'none') el.style.pointerEvents = ''
    }
    const onDown = (e: PointerEvent) => {
      pointerState.down = true
      pointerState.moved = 0
      pointerState.x = e.clientX
      pointerState.y = e.clientY
      // 上次留下的惯性不能带进这次拖拽，否则一按下去画面自己还在转
      spin.current.yaw = 0
      spin.current.pitch = 0
      prevOrbit.current.yaw = orbit.current.yaw
      prevOrbit.current.pitch = orbit.current.pitch
    }
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      pointerState.nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointerState.ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
      const dx = e.clientX - pointerState.x
      const dy = e.clientY - pointerState.y
      if (pointerState.down) {
        pointerState.moved += Math.hypot(dx, dy)
        if (pointerState.moved > 4) {
          // 手感：横向拖两百来像素走完总览的全部可转范围，纵向稍慢一点；
          // 障碍只剩边界，不再有插值延迟（见 useFrame 里的 follow 分支）
          const k = e.pointerType === 'touch' ? 0.7 : 1
          const l = lim.current
          orbit.current.yaw = THREE.MathUtils.clamp(
            orbit.current.yaw - dx * 0.0054 * k,
            -l.yaw,
            l.yaw,
          )
          orbit.current.pitch = THREE.MathUtils.clamp(
            orbit.current.pitch + dy * 0.0034 * k,
            -l.pitch,
            l.pitch,
          )
        }
        // 确认是拖拽之后，把画布的指针事件摘掉：
        // R3F 会对每个 pointermove 做一次全场景 raycast，拖拽时每秒上百次，是卡顿的主要来源。
        // 相机环视走 window 上的监听，不受影响；抬手时恢复。
        if (pointerState.moved > 6 && el.style.pointerEvents !== 'none') {
          el.style.pointerEvents = 'none'
        }
      }
      pointerState.x = e.clientX
      pointerState.y = e.clientY
    }
    const onUp = () => restore()
    // 鼠标掠出窗口时视差要回中，否则画面会一直歪在一边
    const onLeave = () => {
      pointerState.nx = 0
      pointerState.ny = 0
      restore()
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    document.documentElement.addEventListener('pointerleave', onLeave)
    // 拖拽中切走窗口时 pointerup 不一定送达，不兜住会让画布永久失去交互
    window.addEventListener('blur', onLeave)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [gl])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const state = useRoom.getState()
    const mobile = size.width < 768
    const station = active ? stations.find((s) => s.id === active) : null

    // 不同环视档位允许的范围不同：宇宙里最自由，总览收得最紧
    // 范围放宽：灵敏度提高后如果边界还卡在原处，手一拨就到墙，
    // “不够灵敏”的体感其实有一半来自撞边回弹
    const limits = space
      ? { yaw: 1.95, pitch: 0.64 }
      : station
        ? { yaw: 1.4, pitch: 0.6 }
        : { yaw: 1.15, pitch: 0.46 }
    lim.current.yaw = limits.yaw
    lim.current.pitch = limits.pitch

    // 换机位那一瞬间要交给慢速阻尼去做运镜，不能按「跟手」的档位硬切
    const retarget = pose.current.active !== active || pose.current.space !== space
    pose.current.active = active
    pose.current.space = space

    // 环视：拖拽中直接跟手，这里再插值一次就是「手到了画面还没到」；
    // 抬手后把最后一帧的角速度按 e^-2.5t 衰减着继续转，停下来才有分量感
    const o = orbit.current
    const sp = spin.current
    const clampOrbit = () => {
      o.yaw = THREE.MathUtils.clamp(o.yaw, -limits.yaw, limits.yaw)
      o.pitch = THREE.MathUtils.clamp(o.pitch, -limits.pitch, limits.pitch)
    }
    let orbiting = pointerState.down
    if (pointerState.down) {
      // 用「这一帧转了多少 / dt」当作角速度，平滑一下再存，避免帧率抖动把它算飞
      const inv = 1 / Math.max(dt, 1 / 240)
      sp.yaw = damp(sp.yaw, (o.yaw - prevOrbit.current.yaw) * inv, 18, dt)
      sp.pitch = damp(sp.pitch, (o.pitch - prevOrbit.current.pitch) * inv, 18, dt)
      clampOrbit()
    } else if (Math.abs(sp.yaw) > 0.003 || Math.abs(sp.pitch) > 0.003) {
      orbiting = true
      o.yaw += sp.yaw * dt
      o.pitch += sp.pitch * dt
      const decay = Math.exp(-2.5 * dt)
      sp.yaw *= decay
      sp.pitch *= decay
      clampOrbit()
      // 撞到边界就把惯性收掉，否则会贴着边一直抽
      if (Math.abs(o.yaw) >= limits.yaw - 1e-4) sp.yaw = 0
      if (Math.abs(o.pitch) >= limits.pitch - 1e-4) sp.pitch = 0
    } else {
      sp.yaw = 0
      sp.pitch = 0
      clampOrbit()
    }
    prevOrbit.current.yaw = o.yaw
    prevOrbit.current.pitch = o.pitch

    let basePos: THREE.Vector3
    let baseTarget: THREE.Vector3
    let baseFov: number
    let lambda: number

    if (space) {
      spaceT.current += dt
      const entering = spaceT.current < 1.05
      if (entering) {
        basePos = PORTAL_IN.position
        baseTarget = PORTAL_IN.target
        baseFov = PORTAL_IN.fov
        lambda = 6
      } else {
        basePos = PORTAL_OUT.position
        baseTarget = PORTAL_OUT.target
        baseFov = PORTAL_OUT.fov
        lambda = 2.6
      }
    } else if (station) {
      basePos = tmp.baseP.set(...station.pose.position)
      baseTarget = tmp.baseT.set(...station.pose.target)
      baseFov = station.pose.fov ?? 36
      lambda = 4.6
    } else {
      basePos = tmp.baseP.copy(mobile ? OVERVIEW_MOBILE.position : OVERVIEW.position)
      baseTarget = tmp.baseT.copy(mobile ? OVERVIEW_MOBILE.target : OVERVIEW.target)
      baseFov = mobile ? OVERVIEW_MOBILE.fov : OVERVIEW.fov
      lambda = 4.4
    }

    // 用户在转视角（或惯性未停）时相机必须紧跟；换机位时保持上面的慢速运镜
    const follow = orbiting && !retarget

    const offset = tmp.offset.copy(basePos).sub(baseTarget)
    if (!reduced.current) {
      offset.applyAxisAngle(UP, o.yaw)
      tmp.right.crossVectors(offset, UP).normalize()
      offset.applyAxisAngle(tmp.right, o.pitch)

      // 鼠标视差只留在总览；拖拽期间完全冻结（而不是回中），
      // 否则按下鼠标那一瞬画面会自己平移一下，看着像没抓住
      if (!station && !space && !pointerState.down) {
        parallax.current.x = damp(parallax.current.x, pointerState.nx, 3.6, dt)
        parallax.current.y = damp(parallax.current.y, pointerState.ny, 3.6, dt)
      }
      if (!station && !space) {
        // 沿「屏幕右」平移，而不是世界 X 轴：等轴测下世界 X 在屏幕上是斜的，
        // 鼠标左右一动画面就斜着飘，这是上一版看着别扭的直接原因
        tmp.screenRight.crossVectors(UP, offset).normalize()
        offset.addScaledVector(tmp.screenRight, parallax.current.x * 0.58)
        offset.y -= parallax.current.y * 0.36
      }
    }
    const desired = tmp.desired.copy(baseTarget).add(offset)

    if (reduced.current || first.current) {
      first.current = false
      camera.position.copy(desired)
      look.current.copy(baseTarget)
      const persp = camera as THREE.PerspectiveCamera
      persp.fov = baseFov
      persp.updateProjectionMatrix()
      camera.lookAt(look.current)
      if (reduced.current) return
    } else if (follow) {
      // 跟手阶段不做位置插值：orbit 已经是指针位移的直映射，
      // 再叠一层阻尼会让手和画面差出两三帧，灵敏度调多高都觉得“黏”
      camera.position.copy(desired)
      look.current.copy(baseTarget)
      camera.lookAt(look.current)
    } else {
      camera.position.x = damp(camera.position.x, desired.x, lambda, dt)
      camera.position.y = damp(camera.position.y, desired.y, lambda, dt)
      camera.position.z = damp(camera.position.z, desired.z, lambda, dt)

      tmp.wantLook.copy(baseTarget)
      look.current.x = damp(look.current.x, tmp.wantLook.x, lambda, dt)
      look.current.y = damp(look.current.y, tmp.wantLook.y, lambda, dt)
      look.current.z = damp(look.current.z, tmp.wantLook.z, lambda, dt)
      camera.lookAt(look.current)
    }

    // 焦距单独一段：放在 else 里的话，切完板块马上开始拖拽就会把它冻在上一档的 fov 上
    const persp = camera as THREE.PerspectiveCamera
    if (Math.abs(persp.fov - baseFov) > 0.01) {
      persp.fov = damp(persp.fov, baseFov, 3, dt)
      persp.updateProjectionMatrix()
    }

    // 帧率不足时自动降级：只从「高」降到「标准」，不把用户自己选的档再往下拽
    if (!state.booted || state.quality === 0) return
    const m = perf.current
    m.frames += 1
    m.span += dt
    if (m.span >= 0.9) {
      const fps = m.frames / m.span
      m.frames = 0
      m.span = 0
      // 46fps 是不流畅的门槛（低于它拖动就会看出卡顿），36 太宽容了
      m.low = fps < 46 ? m.low + 1 : 0
      if (m.low >= 2 && state.quality === 2) {
        setQuality(1)
        m.low = 0
      }
    }
  }, -1)

  return null
}
