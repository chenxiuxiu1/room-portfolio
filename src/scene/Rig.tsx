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
  const orbit = useRef({ yaw: 0, pitch: 0 })
  /** 平滑后的视差，避免指针事件和 rAF 不同步造成的抖动 */
  const parallax = useRef({ x: 0, y: 0 })
  const first = useRef(true)
  const reduced = useRef(false)
  const spaceT = useRef(0)
  const prevActive = useRef<SectionId | null>(null)
  const perf = useRef({ frames: 0, span: 0, low: 0 })

  const tmp = useMemo(
    () => ({
      baseP: new THREE.Vector3(),
      baseT: new THREE.Vector3(),
      offset: new THREE.Vector3(),
      right: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      wantLook: new THREE.Vector3(),
    }),
    [],
  )

  useEffect(() => {
    pointerState.fine = window.matchMedia('(pointer: fine)').matches
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // 渲染分辨率只取 1 / 1.5 / 2 三档：非整数 dpr（如 1.35）会让渲染像素和屏幕像素错位，
  // 画面反而更脏——这是上一版看着发糊的直接原因
  useEffect(() => {
    const target = quality === 2 ? 3840 : quality === 1 ? 2400 : 1200
    const raw = target / Math.max(size.width, 320)
    const next = raw >= 1.85 ? 2 : raw >= 1.2 ? 1.5 : 1
    setDpr(Math.min(next, 2))
  }, [quality, size.width, setDpr])

  // 每次进入板块都回到设计好的机位，之后才允许自由环视
  useEffect(() => {
    if (active === prevActive.current) return
    prevActive.current = active
    orbit.current.yaw = 0
    orbit.current.pitch = 0
  }, [active])

  useEffect(() => {
    spaceT.current = 0
    orbit.current.yaw = 0
    orbit.current.pitch = 0
  }, [space])

  useEffect(() => {
    const el = gl.domElement
    const onDown = (e: PointerEvent) => {
      pointerState.down = true
      pointerState.moved = 0
      pointerState.x = e.clientX
      pointerState.y = e.clientY
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
          // 拖动幅度：一屏幕宽约转 170°，跟手优先
          const k = e.pointerType === 'touch' ? 0.7 : 1
          orbit.current.yaw = THREE.MathUtils.clamp(
            orbit.current.yaw - dx * 0.0048 * k,
            -1.35,
            1.35,
          )
          orbit.current.pitch = THREE.MathUtils.clamp(
            orbit.current.pitch + dy * 0.0028 * k,
            -0.55,
            0.55,
          )
        }
      }
      pointerState.x = e.clientX
      pointerState.y = e.clientY
    }
    const onUp = () => {
      pointerState.down = false
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [gl])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const state = useRoom.getState()
    const mobile = size.width < 768
    const station = active ? stations.find((s) => s.id === active) : null

    // 不同模式下允许的环视范围不同：宇宙里最自由，聚焦时受限于机位
    const limits = space
      ? { yaw: 1.5, pitch: 0.5 }
      : station
        ? { yaw: 0.95, pitch: 0.45 }
        : { yaw: 0.5, pitch: 0.28 }
    orbit.current.yaw = THREE.MathUtils.clamp(orbit.current.yaw, -limits.yaw, limits.yaw)
    orbit.current.pitch = THREE.MathUtils.clamp(orbit.current.pitch, -limits.pitch, limits.pitch)

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

    const offset = tmp.offset.copy(basePos).sub(baseTarget)
    if (!reduced.current) {
      offset.applyAxisAngle(UP, orbit.current.yaw)
      tmp.right.crossVectors(offset, UP).normalize()
      offset.applyAxisAngle(tmp.right, orbit.current.pitch)

      // 鼠标视差只留在总览，且拖拽时不叠加，避免两种运动打架
      const wantX = !station && !space && !pointerState.down ? pointerState.nx : 0
      const wantY = !station && !space && !pointerState.down ? pointerState.ny : 0
      parallax.current.x = damp(parallax.current.x, wantX, 5.5, dt)
      parallax.current.y = damp(parallax.current.y, wantY, 5.5, dt)
      if (!station && !space) {
        offset.x += parallax.current.x * 1.7
        offset.y -= parallax.current.y * 0.95
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
    } else {
      camera.position.x = damp(camera.position.x, desired.x, lambda, dt)
      camera.position.y = damp(camera.position.y, desired.y, lambda, dt)
      camera.position.z = damp(camera.position.z, desired.z, lambda, dt)

      tmp.wantLook.copy(baseTarget)
      look.current.x = damp(look.current.x, tmp.wantLook.x, lambda, dt)
      look.current.y = damp(look.current.y, tmp.wantLook.y, lambda, dt)
      look.current.z = damp(look.current.z, tmp.wantLook.z, lambda, dt)
      camera.lookAt(look.current)

      const persp = camera as THREE.PerspectiveCamera
      if (Math.abs(persp.fov - baseFov) > 0.01) {
        persp.fov = damp(persp.fov, baseFov, 3, dt)
        persp.updateProjectionMatrix()
      }
    }

    // 帧率不足时自动降级：只从「高」降到「标准」，不把用户自己选的档再往下拽
    if (!state.booted || state.quality === 0) return
    const m = perf.current
    m.frames += 1
    m.span += dt
    if (m.span >= 1.2) {
      const fps = m.frames / m.span
      m.frames = 0
      m.span = 0
      m.low = fps < 36 ? m.low + 1 : 0
      if (m.low >= 2 && state.quality === 2) {
        setQuality(1)
        m.low = 0
      }
    }
  }, -1)

  return null
}
