import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useRoom } from '../lib/store'

const FUR = '#e7e2d8'
const FUR_DEEP = '#d3cdc1'
const PINK = '#c98d8d'
const EYE = '#7fa287'
const RED = '#b23a3a'
const GOLD = '#d8a544'
const NEST = '#8fa993'
const NEST_IN = '#cdc1a9'

/** 窝的位置。猫从这里出发，绕房间一圈再回来 */
const HOME: [number, number] = [4.2, 2.05]
/** 散步路线（世界坐标 XZ），刻意绕开茶几和椅子 */
const PATH: [number, number][] = [
  [4.2, 2.05],
  [3.6, 1.6],
  [2.0, 1.9],
  [0.6, 1.0],
  [-1.2, 1.3],
  [-2.6, 1.7],
  [-1.2, 2.7],
  [1.2, 3.0],
  [3.4, 2.7],
]

const LINES = ['喵。', '团团在看着你。', '别摸了，在忙。', '这间房还行。', '窗外的星星，是真的吗？']
/** 模型原点比脚底高一点，抵消掉才刚好站在地上 */
const GROUND = -0.062

/** 团团：白猫、绿眼、红项圈金铃铛。会在房间里自己散步 */
export default function Cat() {
  const space = useRoom((s) => s.space)
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const legs = useRef<(THREE.Group | null)[]>([])
  const [hot, setHot] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const tailCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.24, -0.2),
        new THREE.Vector3(0.16, 0.16, -0.28),
        new THREE.Vector3(0.3, 0.12, -0.12),
        new THREE.Vector3(0.32, 0.14, 0.08),
        new THREE.Vector3(0.26, 0.19, 0.2),
      ]),
    [],
  )

  const walk = useRef({
    i: 0,
    mode: 'idle' as 'idle' | 'walk',
    timer: 3.5,
    x: HOME[0],
    z: HOME[1],
    dir: 0.55,
    lift: 0.055,
  })

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const s = walk.current
    const t = state.clock.elapsedTime

    if (s.mode === 'idle') {
      s.timer -= dt
      if (s.timer <= 0) {
        s.mode = 'walk'
        s.i = (s.i + 1) % PATH.length
      }
    } else {
      const [tx, tz] = PATH[s.i]
      const dx = tx - s.x
      const dz = tz - s.z
      const dist = Math.hypot(dx, dz)
      if (dist < 0.07) {
        s.mode = 'idle'
        // 回窝会多趴一会儿
        s.timer = s.i === 0 ? 9 : 2.6 + Math.random() * 4.2
      } else {
        const speed = 0.46
        s.x += (dx / dist) * speed * dt
        s.z += (dz / dist) * speed * dt
        const want = Math.atan2(dx, dz)
        let diff = want - s.dir
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        s.dir += diff * Math.min(1, dt * 5.5)
      }
    }

    const walking = s.mode === 'walk'
    const bob = walking ? Math.abs(Math.sin(t * 7.2)) * 0.022 : Math.sin(t * 1.55) * 0.006
    const homeDist = Math.hypot(s.x - HOME[0], s.z - HOME[1])
    // 窝里比地板高一层垫子，进出时平滑过渡
    s.lift += ((homeDist < 0.42 ? 0.055 : 0) - s.lift) * Math.min(1, dt * 5)

    if (root.current) {
      root.current.position.set(s.x, GROUND + bob + s.lift, s.z)
      root.current.rotation.y = s.dir
    }
    if (body.current) body.current.scale.y = 1 + Math.sin(t * 1.55) * 0.012
    if (tail.current) {
      tail.current.rotation.y = Math.sin(t * 0.72) * (walking ? 0.26 : 0.16)
      tail.current.rotation.x = Math.sin(t * 0.48) * 0.05 + (walking ? -0.18 : 0)
    }
    if (head.current) {
      head.current.rotation.y = walking ? Math.sin(t * 0.9) * 0.05 : Math.sin(t * 0.33) * 0.1
      head.current.rotation.z = Math.sin(t * 0.21) * 0.025
    }
    if (eyes.current) eyes.current.scale.y = t % 4.3 < 0.11 ? 0.12 : 1

    // 四条腿交替摆：前后各一对
    legs.current.forEach((leg, i) => {
      if (!leg) return
      leg.rotation.x = walking ? Math.sin(t * 8 + (i % 2) * Math.PI) * 0.46 : 0
    })
  })

  if (space) return null

  return (
    <>
      {/* 窝固定在原地，猫会离开它 */}
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
        ref={root}
        position={[HOME[0], GROUND + 0.055, HOME[1]]}
        rotation={[0, 0.55, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHot(true)
        }}
        onPointerOut={() => setHot(false)}
        onClick={(e) => {
          e.stopPropagation()
          setMsg(LINES[Math.floor(Math.random() * LINES.length)])
          window.setTimeout(() => setMsg(null), 2600)
        }}
      >
        <group ref={body}>
          {/* 后身与胸 */}
          <mesh position={[0, 0.27, -0.06]} scale={[1, 0.88, 1.06]}>
            <sphereGeometry args={[0.2, 32, 24]} />
            <meshStandardMaterial color={FUR} roughness={0.94} />
          </mesh>
          <mesh position={[0, 0.36, 0.07]} scale={[0.96, 1.08, 0.9]}>
            <sphereGeometry args={[0.155, 32, 24]} />
            <meshStandardMaterial color={FUR} roughness={0.94} />
          </mesh>

          {/* 后腿（可摆动） */}
          {[-0.15, 0.15].map((x, i) => (
            <group
              key={`bl-${i}`}
              ref={(el) => {
                legs.current[2 + i] = el
              }}
              position={[x, 0.28, -0.04]}
            >
              <mesh position={[0, -0.06, 0]} scale={[0.9, 0.82, 1.1]}>
                <sphereGeometry args={[0.11, 24, 20]} />
                <meshStandardMaterial color={FUR_DEEP} roughness={0.96} />
              </mesh>
              <mesh position={[0, -0.16, 0.03]} scale={[1, 0.8, 1.2]}>
                <sphereGeometry args={[0.05, 18, 14]} />
                <meshStandardMaterial color="#f0ebe2" roughness={0.9} />
              </mesh>
            </group>
          ))}

          {/* 前腿（可摆动） */}
          {[-0.072, 0.072].map((x, i) => (
            <group
              key={`fl-${i}`}
              ref={(el) => {
                legs.current[i] = el
              }}
              position={[x, 0.29, 0.14]}
            >
              <mesh position={[0, -0.09, 0]}>
                <capsuleGeometry args={[0.042, 0.16, 6, 14]} />
                <meshStandardMaterial color={FUR} roughness={0.94} />
              </mesh>
              <mesh position={[0, -0.19, 0.03]} scale={[1.05, 0.72, 1.25]}>
                <sphereGeometry args={[0.045, 20, 16]} />
                <meshStandardMaterial color="#f0ebe2" roughness={0.9} />
              </mesh>
            </group>
          ))}

          {/* 头 */}
          <group ref={head} position={[0, 0.55, 0.11]}>
            <mesh scale={[1.06, 0.94, 0.98]}>
              <sphereGeometry args={[0.145, 36, 28]} />
              <meshStandardMaterial color={FUR} roughness={0.94} />
            </mesh>
            {[-0.1, 0.1].map((x, i) => (
              <mesh key={i} position={[x, -0.035, 0.03]} scale={[0.9, 0.8, 0.85]}>
                <sphereGeometry args={[0.075, 20, 16]} />
                <meshStandardMaterial color={FUR} roughness={0.95} />
              </mesh>
            ))}

            {/* 耳朵 */}
            {[-0.082, 0.082].map((x, i) => (
              <group
                key={i}
                position={[x, 0.115, -0.005]}
                rotation={[0, 0, x > 0 ? -0.28 : 0.28]}
              >
                <mesh>
                  <coneGeometry args={[0.052, 0.1, 4]} />
                  <meshStandardMaterial color={FUR} roughness={0.95} flatShading />
                </mesh>
                <mesh position={[0, 0.004, 0.012]} scale={[0.7, 0.72, 0.5]}>
                  <coneGeometry args={[0.052, 0.1, 4]} />
                  <meshStandardMaterial color={PINK} roughness={0.9} flatShading />
                </mesh>
              </group>
            ))}

            {/* 眼睛 */}
            <group ref={eyes}>
              {[-0.058, 0.058].map((x, i) => (
                <group key={i} position={[x, 0.012, 0.128]}>
                  <mesh scale={[1, 1, 0.55]}>
                    <sphereGeometry args={[0.028, 20, 16]} />
                    <meshStandardMaterial color={EYE} roughness={0.25} metalness={0.1} />
                  </mesh>
                  <mesh position={[0, 0, 0.013]} scale={[0.62, 1, 0.4]}>
                    <sphereGeometry args={[0.019, 16, 12]} />
                    <meshBasicMaterial color="#101410" />
                  </mesh>
                  <mesh position={[-0.007, 0.009, 0.022]} scale={[1, 1, 0.4]}>
                    <sphereGeometry args={[0.006, 10, 8]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                </group>
              ))}
            </group>

            {/* 鼻子与嘴 */}
            <mesh
              position={[0, -0.032, 0.142]}
              rotation={[0, 0, Math.PI]}
              scale={[1, 0.8, 0.6]}
            >
              <coneGeometry args={[0.016, 0.016, 3]} />
              <meshStandardMaterial color={PINK} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.052, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.014, 0.0028, 6, 16, Math.PI]} />
              <meshBasicMaterial color="#6d5a58" />
            </mesh>

            {/* 胡须 */}
            {[-1, 1].map((side) =>
              [0.02, 0.0, -0.02].map((dy, i) => (
                <mesh
                  key={`${side}-${i}`}
                  position={[side * 0.055, -0.02 + dy, 0.135]}
                  rotation={[0, 0, side * (0.42 - i * 0.12)]}
                >
                  <cylinderGeometry args={[0.0016, 0.0016, 0.13, 4]} />
                  <meshBasicMaterial color="#f2ede4" transparent opacity={0.65} />
                </mesh>
              )),
            )}
          </group>

          {/* 项圈与铃铛 */}
          <mesh position={[0, 0.44, 0.1]} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
            <torusGeometry args={[0.1, 0.013, 8, 28]} />
            <meshStandardMaterial color={RED} roughness={0.62} />
          </mesh>
          <mesh position={[0, 0.385, 0.185]}>
            <sphereGeometry args={[0.028, 18, 14]} />
            <meshStandardMaterial
              color={GOLD}
              roughness={0.25}
              metalness={0.85}
              emissive="#6b4a12"
              emissiveIntensity={0.25}
            />
          </mesh>
          <mesh position={[0, 0.375, 0.208]}>
            <boxGeometry args={[0.012, 0.0025, 0.004]} />
            <meshBasicMaterial color="#5a3c0c" />
          </mesh>
        </group>

        {/* 尾巴绕在身侧 */}
        <group ref={tail}>
          <mesh>
            <tubeGeometry args={[tailCurve, 28, 0.033, 8, false]} />
            <meshStandardMaterial color={FUR} roughness={0.95} />
          </mesh>
          <mesh position={[0.26, 0.19, 0.21]} scale={[1, 0.9, 1]}>
            <sphereGeometry args={[0.036, 16, 12]} />
            <meshStandardMaterial color="#f0ebe2" roughness={0.9} />
          </mesh>
        </group>

        {(hot || msg) && (
          <Html
            position={[0, 0.86, 0]}
            center
            zIndexRange={[26, 0]}
            style={{ pointerEvents: 'none' }}
          >
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
