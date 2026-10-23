import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import Station from './Station'
import { C } from './materials'
import { woodTexture } from '../lib/textures'
import { screenTexture } from '../lib/screen'
import { Cable, Headphones, PenCup, PlantPot, Screw } from './detail'
import { useRoom } from '../lib/store'
import { damp } from '../lib/camera'

/** 键盘键帽：4 行 × 14 列，空格键单独拉长；WASD 与 Esc 换暖色，像一把真在用的键盘 */
const KEYS = (() => {
  const out: { x: number; z: number; w: number; accent?: boolean }[] = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 14; c++) {
      if (r === 3 && c > 3 && c < 10) continue
      out.push({
        x: -0.325 + c * 0.05,
        z: -0.075 + r * 0.05,
        w: 0.038,
        accent: (r === 0 && c === 0) || (r === 1 && c === 2) || (r === 2 && c >= 1 && c <= 3),
      })
    }
  }
  out.push({ x: 0.005, z: 0.075, w: 0.29 })
  return out
})()

export default function Desk() {
  const lit = useRoom((s) => s.hovered === 'works' || s.active === 'works')
  const reduced = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const wood = useMemo(() => woodTexture([2, 2]), [])
  const woodFine = useMemo(() => woodTexture([4, 4]), [])
  const screen = useMemo(() => screenTexture(), [])
  const keys = useRef<THREE.InstancedMesh>(null)

  // 五十六个键帽逐个渲染就是五十六次 draw call，合成 instanced 后只算一次；
  // 颜色也走 instanceColor，所以 WASD 能单独上色
  useEffect(() => {
    if (!keys.current) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const p = new THREE.Vector3()
    const s = new THREE.Vector3()
    const col = new THREE.Color()
    KEYS.forEach((k, i) => {
      p.set(0.18 + k.x, 1.053, 0.32 + k.z)
      s.set(k.w / 0.038, 1, 1)
      m.compose(p, q, s)
      keys.current!.setMatrixAt(i, m)
      keys.current!.setColorAt(i, col.set(k.accent ? '#e0703f' : '#242830'))
    })
    keys.current.instanceMatrix.needsUpdate = true
    if (keys.current.instanceColor) keys.current.instanceColor.needsUpdate = true
  }, [])
  const screenMat = useRef<THREE.MeshStandardMaterial>(null)
  const screenLight = useRef<THREE.PointLight>(null)
  const scan = useRef<THREE.Mesh>(null)
  const lampLight = useRef<THREE.PointLight>(null)
  const shadeMat = useRef<THREE.MeshStandardMaterial>(null)
  const cursorMat = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    if (screenMat.current) {
      screenMat.current.emissiveIntensity = damp(screenMat.current.emissiveIntensity, lit ? 1.3 : 0.86, 5, dt)
    }
    if (screenLight.current) {
      screenLight.current.intensity = damp(screenLight.current.intensity, lit ? 1.5 : 0.85, 5, dt)
    }
    if (lampLight.current) {
      lampLight.current.intensity = damp(lampLight.current.intensity, lit ? 4.2 : 2.4, 4, dt)
    }
    if (shadeMat.current) {
      shadeMat.current.emissiveIntensity = damp(shadeMat.current.emissiveIntensity, lit ? 2.4 : 1.1, 4, dt)
    }

    if (reduced) return
    // 一条很淡的高亮行在代码区里缓缓下走，像编辑器在自动滚动；
    // 光标继续闪，屏幕才不像一张打印出来的截图
    const t = state.clock.elapsedTime
    if (scan.current) {
      const p = (t * 0.06) % 1
      scan.current.position.y = 0.294 - p * 0.604
      scan.current.scale.y = 0.7 + Math.sin(p * Math.PI) * 0.7
    }
    if (cursorMat.current) {
      cursorMat.current.opacity = t % 1.1 < 0.6 ? 0.95 : 0.08
    }
  })

  return (
    <group position={[-3.2, 0, -0.2]} rotation={[0, Math.PI / 2, 0]}>
      <Station id="works" hitbox={[2.7, 2.4, 2.2]} hitboxPosition={[0, 1.2, 0.5]} ring={[0, 0.02, 0.25]} ringSize={1.5}>
        {/* 桌面：木纹 + 前缘封边 + 下方一层托板，从侧面看是有厚度的 */}
        <RoundedBox args={[2.6, 0.072, 1.15]} radius={0.012} smoothness={3} position={[0, 0.986, 0]}>
          <meshStandardMaterial map={wood} color={C.woodLight} roughness={0.52} metalness={0.03} />
        </RoundedBox>
        <mesh position={[0, 0.948, 0]}>
          <boxGeometry args={[2.54, 0.026, 1.09]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.955, 0.567]}>
          <boxGeometry args={[2.6, 0.026, 0.026]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.55} />
        </mesh>

        {/* 锥形桌腿：上粗下细，向外微张，比四根等宽方柱稳重得多 */}
        {[
          [-1.16, -0.46, -0.014, 0.014],
          [1.16, -0.46, -0.014, -0.014],
          [-1.16, 0.46, 0.014, 0.014],
          [1.16, 0.46, 0.014, -0.014],
        ].map(([x, z, rx, rz], i) => (
          <group key={i}>
            <mesh position={[x, 0.462, z]} rotation={[rx * 8, 0, rz * 8]}>
              <cylinderGeometry args={[0.026, 0.038, 0.905, 14]} />
              <meshStandardMaterial color={C.metalDark} roughness={0.48} metalness={0.55} />
            </mesh>
            <mesh position={[x, 0.009, z]}>
              <cylinderGeometry args={[0.04, 0.042, 0.018, 14]} />
              <meshStandardMaterial color="#15171b" roughness={0.85} />
            </mesh>
          </group>
        ))}
        {/* 后侧横撑，给桌腿一个受力逻辑 */}
        <mesh position={[0, 0.19, -0.46]}>
          <boxGeometry args={[2.28, 0.024, 0.024]} />
          <meshStandardMaterial color={C.metalDark} roughness={0.5} metalness={0.5} />
        </mesh>

        {/* 抽屉柜：柜体与面板分层，缝隙用深色托底 */}
        <RoundedBox args={[0.72, 0.86, 1.0]} radius={0.01} position={[0.86, 0.43, 0]}>
          <meshStandardMaterial map={wood} color={C.wood} roughness={0.56} />
        </RoundedBox>
        <mesh position={[0.86, 0.862, 0]}>
          <boxGeometry args={[0.74, 0.022, 1.02]} />
          <meshStandardMaterial map={woodFine} color={C.woodLight} roughness={0.5} />
        </mesh>
        {[0.17, 0.44, 0.71].map((y, i) => (
          <group key={i}>
            {/* 抽屉缝：面板背后垫一块更深的板，缝隙就有了深度 */}
            <mesh position={[0.86, y, 0.501]}>
              <boxGeometry args={[0.68, 0.26, 0.012]} />
              <meshStandardMaterial color="#1a1410" roughness={0.95} />
            </mesh>
            <RoundedBox args={[0.66, 0.232, 0.022]} radius={0.005} smoothness={2} position={[0.86, y, 0.512]}>
              <meshStandardMaterial map={woodFine} color={C.woodDark} roughness={0.58} />
            </RoundedBox>
            {/* 拉手：一根横杆 + 两个支座，比一根扁条像真五金 */}
            <mesh position={[0.86, y, 0.531]}>
              <cylinderGeometry args={[0.0075, 0.0075, 0.24, 10]} />
              <meshStandardMaterial color={C.metal} roughness={0.28} metalness={0.85} />
            </mesh>
            {[-0.1, 0.1].map((dx) => (
              <mesh key={dx} position={[0.86 + dx, y, 0.526]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.018, 8]} />
                <meshStandardMaterial color={C.metal} roughness={0.3} metalness={0.8} />
              </mesh>
            ))}
            <Screw position={[0.86 - 0.29, y, 0.523]} size={0.008} color={C.metal} />
            <Screw position={[0.86 + 0.29, y, 0.523]} size={0.008} color={C.metal} />
          </group>
        ))}

        {/* 显示器底座：底板 + 立柱 + 转轴 */}
        <RoundedBox args={[0.74, 0.018, 0.4]} radius={0.008} smoothness={2} position={[0.2, 1.031, -0.1]}>
          <meshStandardMaterial color={C.metalDark} roughness={0.3} metalness={0.7} />
        </RoundedBox>
        <mesh position={[0.2, 1.24, -0.14]}>
          <boxGeometry args={[0.062, 0.4, 0.05]} />
          <meshStandardMaterial color={C.metal} roughness={0.28} metalness={0.78} />
        </mesh>
        <mesh position={[0.2, 1.42, -0.14]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.036, 0.036, 0.1, 14]} />
          <meshStandardMaterial color={C.metalDark} roughness={0.34} metalness={0.7} />
        </mesh>

        <group position={[0.2, 1.68, -0.13]} rotation={[-0.04, 0, 0]}>
          {/* 背板 */}
          <RoundedBox args={[1.5, 0.88, 0.032]} radius={0.01} smoothness={2}>
            <meshStandardMaterial color="#12151b" roughness={0.5} metalness={0.35} />
          </RoundedBox>
          {/* 屏幕本体：一张现场画出来的 IDE 截图，标签页、文件树、语法高亮、状态栏都在 */}
          <mesh position={[0, 0, 0.019]}>
            <planeGeometry args={[1.4, 0.79]} />
            <meshStandardMaterial
              ref={screenMat}
              map={screen}
              emissiveMap={screen}
              emissive="#ffffff"
              emissiveIntensity={0.86}
              color="#8f9ba3"
              roughness={0.18}
              metalness={0.06}
            />
          </mesh>
          {/* 面板玻璃：一层极淡的反射，屏幕才不是一张平贴的纸 */}
          <mesh position={[0, 0, 0.0205]}>
            <planeGeometry args={[1.4, 0.79]} />
            <meshStandardMaterial
              color="#cfe8ff"
              transparent
              opacity={0.06}
              roughness={0.05}
              metalness={0.9}
              depthWrite={false}
            />
          </mesh>
          {/* 自动滚动的高亮行 + 闪烁光标 */}
          <mesh ref={scan} position={[0.06, 0.294, 0.0215]}>
            <planeGeometry args={[0.92, 0.03]} />
            <meshBasicMaterial
              color="#6ee7d7"
              transparent
              opacity={0.11}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[-0.02, -0.028, 0.0215]}>
            <planeGeometry args={[0.011, 0.026]} />
            <meshBasicMaterial ref={cursorMat} color="#8ff2e2" transparent opacity={0.95} />
          </mesh>
          {/* 四边窄边框，屏幕才不像贴在黑板上 */}
          {[
            [0, 0.415, 1.44, 0.022],
            [0, -0.415, 1.44, 0.022],
            [-0.714, 0, 0.022, 0.83],
            [0.714, 0, 0.022, 0.83],
          ].map(([x, y, w, h], i) => (
            <mesh key={i} position={[x, y, 0.021]}>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial color="#0c0e12" roughness={0.72} metalness={0.2} />
            </mesh>
          ))}
          {/* 顶部摄像头，一小点就够——显示器不是一块标语牌 */}
          <mesh position={[0, 0.451, 0.012]}>
            <boxGeometry args={[0.09, 0.022, 0.02]} />
            <meshStandardMaterial color="#0b0e12" roughness={0.5} />
          </mesh>
          <mesh position={[0.026, 0.451, 0.023]}>
            <circleGeometry args={[0.007, 12]} />
            <meshBasicMaterial color="#16333b" />
          </mesh>
          <mesh position={[0.026, 0.451, 0.0235]}>
            <circleGeometry args={[0.0032, 8]} />
            <meshBasicMaterial color="#6ee7d7" />
          </mesh>
        </group>

        {/* 屏幕往桌面上洒的冷光，键盘与手腕才有了“在用”的环境 */}
        <pointLight ref={screenLight} position={[0.2, 1.58, 0.42]} intensity={0.85} distance={2.4} decay={2} color="#8fd8e6" />

        {/* 桌垫 */}
        <RoundedBox args={[1.06, 0.006, 0.46]} radius={0.02} smoothness={2} position={[0.18, 1.026, 0.3]}>
          <meshStandardMaterial color="#20242b" roughness={0.94} />
        </RoundedBox>

        {/* 键盘：底板 + 键帽阵列 */}
        <RoundedBox args={[0.82, 0.024, 0.3]} radius={0.007} smoothness={2} position={[0.18, 1.038, 0.32]}>
          <meshStandardMaterial color="#171a20" roughness={0.55} metalness={0.2} />
        </RoundedBox>
        {KEYS.length > 0 && (
          <instancedMesh ref={keys} args={[undefined, undefined, KEYS.length]}>
            <boxGeometry args={[0.038, 0.012, 0.04]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </instancedMesh>
        )}
        {/* 鼠标：球体 + 滚轮 + 侧键 + 一条暗橙灯条 */}
        <mesh position={[0.78, 1.038, 0.34]} scale={[1, 0.55, 1]}>
          <sphereGeometry args={[0.062, 16, 12]} />
          <meshStandardMaterial color="#1c1f25" roughness={0.42} metalness={0.25} />
        </mesh>
        <mesh position={[0.78, 1.062, 0.306]}>
          <boxGeometry args={[0.014, 0.008, 0.026]} />
          <meshStandardMaterial color="#0e1116" roughness={0.35} />
        </mesh>
        <mesh position={[0.752, 1.048, 0.352]}>
          <boxGeometry args={[0.007, 0.014, 0.026]} />
          <meshStandardMaterial color="#2b3038" roughness={0.55} />
        </mesh>
        <mesh position={[0.78, 1.065, 0.34]}>
          <boxGeometry args={[0.012, 0.006, 0.07]} />
          <meshBasicMaterial color="#ff8a5b" transparent opacity={0.5} />
        </mesh>

        {/* 台灯：底座 + 灯杆 + 灯罩 + 灯丝 */}
        <mesh position={[-1.0, 1.032, -0.22]}>
          <cylinderGeometry args={[0.13, 0.14, 0.026, 24]} />
          <meshStandardMaterial color={C.metalDark} roughness={0.36} metalness={0.7} />
        </mesh>
        <mesh position={[-1.0, 1.41, -0.22]}>
          <cylinderGeometry args={[0.022, 0.026, 0.75, 12]} />
          <meshStandardMaterial color={C.metal} roughness={0.32} metalness={0.78} />
        </mesh>
        <mesh position={[-1.0, 1.82, -0.22]}>
          <cylinderGeometry args={[0.105, 0.185, 0.2, 24, 1, true]} />
          <meshStandardMaterial
            ref={shadeMat}
            color="#3a2a20"
            emissive="#ff8a3d"
            emissiveIntensity={1.1}
            roughness={0.6}
            metalness={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[-1.0, 1.727, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.168, 24]} />
          <meshBasicMaterial color="#ffd9b0" />
        </mesh>
        <pointLight ref={lampLight} position={[-1.0, 1.62, -0.22]} intensity={2.4} distance={5.5} decay={2} color="#ffb46b" />

        {/* 桌面上的东西：纸、笔筒、耳机、小盆栽、马克杯 */}
        <mesh position={[-0.42, 1.024, 0.32]} rotation={[-Math.PI / 2, 0, 0.1]}>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial color="#cfc8ba" roughness={0.95} />
        </mesh>
        <mesh position={[-0.36, 1.026, 0.26]} rotation={[-Math.PI / 2, 0, -0.16]}>
          <planeGeometry args={[0.24, 0.32]} />
          <meshStandardMaterial color="#ddd6c8" roughness={0.96} />
        </mesh>
        <PenCup position={[1.06, 1.024, 0.06]} />
        <Headphones position={[-0.78, 1.06, 0.44]} rotation={[0, 0.5, 0]} />
        <PlantPot position={[-1.18, 1.024, 0.34]} scale={0.86} />
        <group position={[1.02, 1.024, -0.3]}>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.055, 0.048, 0.14, 20, 1, true]} />
            <meshStandardMaterial color={C.paper} roughness={0.72} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.002, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.006, 20]} />
            <meshStandardMaterial color="#c9c2b4" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.068, 0]}>
            <circleGeometry args={[0.048, 20]} />
            <meshStandardMaterial color="#2a1d14" roughness={0.4} />
          </mesh>
          <mesh position={[0.062, 0.082, 0]} rotation={[0, 0, -0.3]}>
            <torusGeometry args={[0.032, 0.009, 8, 16, Math.PI]} />
            <meshStandardMaterial color={C.paper} roughness={0.72} />
          </mesh>
        </group>

        {/* 线缆：从显示器后方垂到地上 */}
        <Cable
          points={[
            [0.2, 1.03, -0.3],
            [0.28, 0.82, -0.46],
            [0.32, 0.3, -0.53],
            [0.05, 0.012, -0.6],
            [-0.62, 0.01, -0.66],
          ]}
          radius={0.007}
        />

        {/* 椅子：分体靠背 + 缝线坐垫 + 五星脚 */}
        <group position={[0.05, 0, 1.14]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.028, 0.034, 0.34, 12]} />
            <meshStandardMaterial color={C.metalDark} roughness={0.4} metalness={0.6} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 + 0.32
            return (
              <group key={i} rotation={[0, a, 0]}>
                <mesh position={[0, 0.075, 0.15]} rotation={[0.1, 0, 0]}>
                  <boxGeometry args={[0.042, 0.026, 0.3]} />
                  <meshStandardMaterial color={C.metalDark} roughness={0.45} metalness={0.5} />
                </mesh>
                <mesh position={[0, 0.036, 0.29]}>
                  <sphereGeometry args={[0.032, 12, 10]} />
                  <meshStandardMaterial color="#14161a" roughness={0.8} />
                </mesh>
              </group>
            )
          })}
          <RoundedBox args={[0.7, 0.085, 0.64]} radius={0.032} smoothness={3} position={[0, 0.5, 0]}>
            <meshStandardMaterial color={C.fabric} roughness={0.92} />
          </RoundedBox>
          {/* 坐垫缝线：两条横向压线 */}
          {[-0.1, 0.12].map((z, i) => (
            <mesh key={i} position={[0, 0.541, z]}>
              <boxGeometry args={[0.64, 0.004, 0.006]} />
              <meshStandardMaterial color="#2b313a" roughness={1} />
            </mesh>
          ))}
          {/* 靠背三段 */}
          {[-0.22, 0, 0.22].map((x, i) => (
            <RoundedBox
              key={i}
              args={[0.212, 0.54, 0.07]}
              radius={0.026}
              smoothness={3}
              position={[x, 0.81, 0.3]}
              rotation={[-0.09, 0, 0]}
            >
              <meshStandardMaterial color={C.fabricDeep} roughness={0.95} />
            </RoundedBox>
          ))}
        </group>
      </Station>
    </group>
  )
}
