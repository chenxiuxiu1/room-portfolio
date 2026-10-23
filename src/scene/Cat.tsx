import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useRoom } from '../lib/store'
import { pointerState } from '../lib/pointer'
import { damp } from '../lib/camera'
import { furBumpTexture } from '../lib/textures'
import { buildBodyGeometry } from './catShape'

/** 团团的取色：白毛不是纯白，受光处偏暖、腹面偏灰，才有体积 */
const FUR = '#f5f0e6'
const FUR_DEEP = '#e2dbcd'
const FUR_SHADE = '#c9c1b1'
const EAR_IN = '#c98f8c'
const NOSE = '#b9807f'
const IRIS = '#7d9b80'
const RED = '#b23a3a'
const GOLD = '#d8a544'
const NEST = '#8fa993'
const NEST_IN = '#cdc1a9'

/** 窝的位置。猫现在不再乱走，就住在里面 */
const HOME: [number, number] = [4.2, 2.05]
/** 垫子上表面高度 */
const CUSHION = 0.09

const LINES = ['喵。', '团团在看着你。', '别摸了，在睡。', '这间房还行。', '窗外的星星，是真的吗？']

/**
 * 团团：白英短、绿眼、红项圈金铃铛。
 *
 * 上一版是站着走路的球猫——走路的解剖结构最难骗人，越看越假。
 * 这一版按照片改成卧姿：躯干用放样做出「胸深腰收胯宽」，耳朵是三角，
 * 只有呼吸、耳朵抖、尾尖摆、眨眼、转头这几个细节，不加任何夸张动作。
 */
export default function Cat() {
  const space = useRoom((s) => s.space)
  const [hot, setHot] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const chest = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const earL = useRef<THREE.Group>(null)
  const earR = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const tailTip = useRef<THREE.Group>(null)

  /** 行为状态：四个细节各自随机，不同步才像活的 */
  const st = useRef({ blink: 2.6, ear: 3.4, earSide: 0, flick: 0, yaw: 0, pitch: 0 })

  const furBump = useMemo(() => furBumpTexture(), [])
  const bodyGeo = useMemo(() => buildBodyGeometry(26), [])

  // 白毛的关键是 sheen（绒面反射），纯 standard 材质只会像塑料
  const mats = useMemo(() => {
    const fur = new THREE.MeshPhysicalMaterial({
      color: FUR,
      roughness: 0.84,
      sheen: 0.95,
      sheenColor: new THREE.Color('#fff8ec'),
      sheenRoughness: 0.58,
      bumpMap: furBump,
      bumpScale: 0.012,
    })
    const furDeep = new THREE.MeshPhysicalMaterial({
      color: FUR_DEEP,
      roughness: 0.88,
      sheen: 0.7,
      sheenColor: new THREE.Color('#f7eddd'),
      sheenRoughness: 0.7,
      bumpMap: furBump,
      bumpScale: 0.012,
    })
    // 放样的皮是手工封口的，双面渲染兜住任何绕序问题，代价只有一个网格
    const body = fur.clone()
    body.side = THREE.DoubleSide
    return {
      fur,
      furDeep,
      body,
      shade: new THREE.MeshStandardMaterial({ color: FUR_SHADE, roughness: 0.95 }),
      ear: new THREE.MeshStandardMaterial({ color: EAR_IN, roughness: 0.92 }),
      nose: new THREE.MeshPhysicalMaterial({
        color: NOSE,
        roughness: 0.3,
        clearcoat: 0.7,
        clearcoatRoughness: 0.35,
      }),
      iris: new THREE.MeshPhysicalMaterial({
        color: IRIS,
        roughness: 0.16,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        emissive: new THREE.Color('#16241a'),
        emissiveIntensity: 0.7,
      }),
      pupil: new THREE.MeshBasicMaterial({ color: '#0d110c' }),
      glint: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      whisker: new THREE.MeshBasicMaterial({ color: '#f8f3e9', transparent: true, opacity: 0.5 }),
      collar: new THREE.MeshStandardMaterial({ color: RED, roughness: 0.66 }),
      gold: new THREE.MeshStandardMaterial({
        color: GOLD,
        roughness: 0.24,
        metalness: 0.9,
        emissive: new THREE.Color('#6b4a12'),
        emissiveIntensity: 0.3,
      }),
    }
  }, [furBump])

  useEffect(() => {
    return () => {
      Object.values(mats).forEach((m) => m.dispose())
      bodyGeo.dispose()
      furBump.dispose()
    }
  }, [mats, bodyGeo, furBump])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const s = st.current

    // 呼吸：整条躯干极小的起伏，让轮廓不完全静止
    if (chest.current) {
      const b = Math.sin(t * 1.1)
      chest.current.scale.set(1 + b * 0.011, 1 + b * 0.018, 1 + b * 0.014)
    }

    // 头：悬停时跟着指针转，平时缓慢游移
    const wantYaw = hot
      ? THREE.MathUtils.clamp(pointerState.nx * 0.5, -0.55, 0.55)
      : Math.sin(t * 0.31) * 0.15
    const wantPitch = hot
      ? THREE.MathUtils.clamp(-pointerState.ny * 0.22, -0.18, 0.18)
      : Math.sin(t * 0.23 + 1.2) * 0.05
    s.yaw = damp(s.yaw, wantYaw, 2.2, dt)
    s.pitch = damp(s.pitch, wantPitch, 2.2, dt)
    if (head.current) {
      head.current.rotation.y = s.yaw
      head.current.rotation.x = s.pitch + Math.sin(t * 1.1) * 0.008
      head.current.rotation.z = Math.sin(t * 0.19) * 0.018
    }

    // 眨眼：3~6 秒一次，闭合约 0.12 秒
    s.blink -= dt
    if (eyes.current) {
      const closed = s.blink < 0.12
      eyes.current.scale.y = closed ? 0.08 : damp(eyes.current.scale.y, 1, 26, dt)
      if (s.blink <= 0) s.blink = 3 + Math.random() * 3.2
    }

    // 耳朵：随机单侧抽动，比两边一起抽更像活物
    s.ear -= dt
    if (s.ear <= 0) {
      s.ear = 3.5 + Math.random() * 4.5
      s.earSide = Math.random() > 0.5 ? 1 : -1
      s.flick = 0.22
    }
    if (s.flick > 0) s.flick = Math.max(0, s.flick - dt)
    const flickAmt = Math.sin((0.22 - s.flick) * 42) * (s.flick / 0.22) * 0.2
    if (earL.current) {
      earL.current.rotation.z = 0.3 + Math.sin(t * 0.7) * 0.02 + (s.earSide < 0 ? flickAmt : 0)
    }
    if (earR.current) {
      earR.current.rotation.z = -0.3 - Math.sin(t * 0.7) * 0.02 - (s.earSide > 0 ? flickAmt : 0)
    }

    // 尾巴：整体极缓地摆，尾尖另有一层相位延迟（follow-through）
    if (tail.current) tail.current.rotation.y = Math.sin(t * 0.55) * 0.045
    if (tailTip.current) {
      tailTip.current.rotation.y = Math.sin(t * 0.85 - 0.9) * (hot ? 0.18 : 0.1)
      tailTip.current.rotation.x = Math.sin(t * 0.62 - 1.4) * 0.05
    }
  })

  if (space) return null

  return (
    <>
      {/* 窝固定在原地 */}
      <group position={[HOME[0], 0, HOME[1]]}>
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.44, 0.14, 14, 36]} />
          <meshStandardMaterial color={NEST} roughness={0.98} />
        </mesh>
        <mesh position={[0, 0.075, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.47, 0.09, 12, 36]} />
          <meshStandardMaterial color="#7e9884" roughness={1} />
        </mesh>
        <mesh position={[0, 0.055, 0]}>
          <cylinderGeometry args={[0.45, 0.4, 0.07, 32]} />
          <meshStandardMaterial color={NEST_IN} roughness={1} />
        </mesh>
        <mesh position={[0, 0.008, 0]}>
          <cylinderGeometry args={[0.5, 0.46, 0.02, 32]} />
          <meshStandardMaterial color="#5d7361" roughness={1} />
        </mesh>
      </group>

      <group
        position={[HOME[0], CUSHION, HOME[1]]}
        rotation={[0, 0.62, 0]}
        scale={1.18}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHot(true)
        }}
        onPointerOut={() => setHot(false)}
        onClick={(e) => {
          e.stopPropagation()
          if (pointerState.moved > 9) return
          setMsg(LINES[Math.floor(Math.random() * LINES.length)])
          window.setTimeout(() => setMsg(null), 2600)
        }}
      >
        {/* 躯干：一张连续的放样皮，胸深腰收胯宽 */}
        <group ref={chest}>
          <mesh geometry={bodyGeo} material={mats.body} />
        </group>

        {/* 后腿收在身侧，只留一道轮廓（不要做成两个球，会读成解剖错误） */}
        {[-1, 1].map((side) => (
          <mesh
            key={`haunch-${side}`}
            material={mats.furDeep}
            position={[side * 0.108, 0.062, -0.06]}
            scale={[0.6, 0.62, 1.15]}
          >
            <sphereGeometry args={[0.085, 24, 18]} />
          </mesh>
        ))}
        {/* 露在身侧的 hind paw */}
        <mesh material={mats.fur} position={[0.142, 0.03, 0.05]} scale={[0.6, 0.42, 1.05]}>
          <sphereGeometry args={[0.045, 20, 16]} />
        </mesh>

        {/* 脖子：把头和胸接上，不然就是一颗悬空的球 */}
        <mesh material={mats.fur} position={[0, 0.238, 0.176]} scale={[1.02, 0.92, 0.98]}>
          <sphereGeometry args={[0.086, 28, 20]} />
        </mesh>

        {/* 前腿：照片里两只前爪并着伸在前头 */}
        {[-1, 1].map((side) => (
          <group key={`front-${side}`} position={[side * 0.055, 0.078, 0.182]} rotation={[-0.28, 0, 0]}>
            <mesh material={mats.fur} position={[0, 0.004, -0.012]}>
              <capsuleGeometry args={[0.032, 0.075, 6, 14]} />
            </mesh>
            <mesh material={mats.fur} position={[0, -0.042, 0.038]} scale={[0.82, 0.5, 1.1]}>
              <sphereGeometry args={[0.042, 22, 16]} />
            </mesh>
            {/* 爪趾的三道缝 */}
            {[-0.014, 0, 0.014].map((x) => (
              <mesh key={x} material={mats.shade} position={[x, -0.052, 0.072]} scale={[0.16, 0.24, 0.55]}>
                <sphereGeometry args={[0.011, 8, 6]} />
              </mesh>
            ))}
          </group>
        ))}

        {/* 头 */}
        <group ref={head} position={[0, 0.306, 0.2]} scale={0.9}>
          {/* 颅骨：英短是宽扁的圆，不是正球 */}
          <mesh material={mats.fur} scale={[1.14, 1.02, 1]}>
            <sphereGeometry args={[0.118, 40, 30]} />
          </mesh>
          {/* 腮：白英短最认得出的一块 */}
          {[-1, 1].map((side) => (
            <mesh
              key={`cheek-${side}`}
              material={mats.fur}
              position={[side * 0.066, -0.028, 0.014]}
              scale={[1, 0.88, 0.86]}
            >
              <sphereGeometry args={[0.058, 28, 22]} />
            </mesh>
          ))}
          {/* 口鼻 + 下巴：别做太大，猫的嘴在脸的下三分之一处 */}
          <mesh material={mats.fur} position={[0, -0.044, 0.081]} scale={[1.16, 0.78, 0.82]}>
            <sphereGeometry args={[0.036, 28, 22]} />
          </mesh>
          <mesh material={mats.fur} position={[0, -0.072, 0.058]} scale={[1, 0.66, 0.86]}>
            <sphereGeometry args={[0.024, 20, 16]} />
          </mesh>
          {/* 鼻梁：撑出侧脸那条弧度 */}
          <mesh material={mats.fur} position={[0, -0.002, 0.089]} scale={[0.9, 0.96, 0.78]}>
            <sphereGeometry args={[0.033, 24, 18]} />
          </mesh>

          {/* 耳朵：三角耳是猫最强的识别信号，圆片会立刻变成熊 */}
          <group ref={earL} position={[-0.072, 0.098, -0.008]} rotation={[0.1, -0.34, 0.3]}>
            <mesh material={mats.fur} scale={[1, 1, 0.5]}>
              <coneGeometry args={[0.054, 0.11, 16]} />
            </mesh>
            <mesh material={mats.ear} position={[0, -0.006, 0.018]} scale={[0.6, 0.76, 0.22]}>
              <coneGeometry args={[0.054, 0.11, 14]} />
            </mesh>
          </group>
          <group ref={earR} position={[0.072, 0.098, -0.008]} rotation={[0.1, 0.34, -0.3]}>
            <mesh material={mats.fur} scale={[1, 1, 0.5]}>
              <coneGeometry args={[0.054, 0.11, 16]} />
            </mesh>
            <mesh material={mats.ear} position={[0, -0.006, 0.018]} scale={[0.6, 0.76, 0.22]}>
              <coneGeometry args={[0.054, 0.11, 14]} />
            </mesh>
          </group>

          {/* 眼睛：小一号、往眼眶里沉，加一片上眼睑压住上缘，才不会像玻璃球 */}
          <group ref={eyes}>
            {[-1, 1].map((side) => (
              <group
                key={`eye-${side}`}
                position={[side * 0.045, 0.006, 0.101]}
                rotation={[0, side * 0.28, 0]}
              >
                <mesh material={mats.iris} scale={[1, 1, 0.62]}>
                  <sphereGeometry args={[0.027, 24, 18]} />
                </mesh>
                <mesh material={mats.pupil} position={[0, 0, 0.013]} scale={[0.32, 0.9, 0.28]}>
                  <sphereGeometry args={[0.024, 18, 14]} />
                </mesh>
                <mesh material={mats.glint} position={[-0.006, 0.007, 0.021]} scale={[1, 1, 0.4]}>
                  <sphereGeometry args={[0.005, 10, 8]} />
                </mesh>
              </group>
            ))}
          </group>

          {/* 鼻子：小三角，湿润清漆 */}
          <mesh
            material={mats.nose}
            position={[0, -0.036, 0.108]}
            rotation={[0, 0, Math.PI]}
            scale={[1, 0.72, 0.55]}
          >
            <coneGeometry args={[0.012, 0.014, 3]} />
          </mesh>
          {/* 嘴：一道向下的弧线 */}
          <mesh material={mats.shade} position={[0, -0.056, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.01, 0.0018, 6, 16, Math.PI]} />
          </mesh>

          {/* 胡须：短一点、细一点，往外飘而不是往下垂 */}
          {[-1, 1].map((side) =>
            [0.012, -0.006].map((dy, i) => (
              <mesh
                key={`w-${side}-${i}`}
                material={mats.whisker}
                position={[side * 0.044, -0.026 + dy, 0.098]}
                rotation={[0, 0, side * (0.34 - i * 0.24)]}
              >
                <cylinderGeometry args={[0.0011, 0.0011, 0.085, 4]} />
              </mesh>
            )),
          )}
        </group>

        {/* 项圈与铃铛：贴着脖子根 */}
        <mesh material={mats.collar} position={[0, 0.228, 0.164]} rotation={[1.18, 0, 0]}>
          <torusGeometry args={[0.077, 0.0085, 8, 30]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 0.182, 0.207]}>
          <sphereGeometry args={[0.02, 18, 14]} />
        </mesh>
        <mesh material={mats.shade} position={[0, 0.176, 0.224]}>
          <boxGeometry args={[0.009, 0.002, 0.0035]} />
        </mesh>

        {/* 尾巴：贴地绕在靠近观众这一侧，才看得见 */}
        <group ref={tail}>
          <mesh material={mats.fur}>
            <tubeGeometry
              args={[
                new THREE.CatmullRomCurve3([
                  new THREE.Vector3(0.1, 0.1, -0.19),
                  new THREE.Vector3(0.2, 0.052, -0.11),
                  new THREE.Vector3(0.235, 0.04, 0.0),
                  new THREE.Vector3(0.2, 0.038, 0.1),
                  new THREE.Vector3(0.11, 0.038, 0.16),
                ]),
                32,
                0.04,
                10,
                false,
              ]}
            />
          </mesh>
          <group ref={tailTip} position={[0.11, 0.038, 0.16]}>
            <mesh material={mats.fur} position={[0.025, 0, 0.004]} scale={[1.05, 0.94, 1]}>
              <sphereGeometry args={[0.038, 20, 16]} />
            </mesh>
          </group>
        </group>

        {(hot || msg) && (
          <Html position={[0, 0.62, 0.1]} center zIndexRange={[26, 0]} style={{ pointerEvents: 'none' }}>
            <div
              className="whitespace-nowrap rounded-sm border px-2.5 py-1 text-[10px] tracking-[0.16em] transition-opacity duration-300"
              style={{
                borderColor: 'rgba(216,165,68,0.4)',
                background: 'rgba(10,10,12,0.78)',
                color: '#efe6d6',
                backdropFilter: 'blur(6px)',
              }}
            >
              {msg ?? '团团 · TUANTUAN'}
            </div>
          </Html>
        )}
      </group>
    </>
  )
}
