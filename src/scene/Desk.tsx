import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import Station from './Station'
import { C } from './materials'
import { useRoom } from '../lib/store'
import { damp } from '../lib/camera'

/** 屏幕里的假代码行 */
const CODE_ROWS = [
  { y: 0.29, w: 0.5, c: '#6ee7d7', o: 0.85 },
  { y: 0.22, w: 0.82, c: '#8b93a1', o: 0.5 },
  { y: 0.15, w: 0.38, c: '#ff8a5b', o: 0.75 },
  { y: 0.08, w: 0.68, c: '#8b93a1', o: 0.4 },
  { y: 0.01, w: 0.28, c: '#6ee7d7', o: 0.6 },
  { y: -0.06, w: 0.74, c: '#8b93a1', o: 0.35 },
  { y: -0.13, w: 0.46, c: '#8b93a1', o: 0.5 },
  { y: -0.2, w: 0.6, c: '#ff8a5b', o: 0.55 },
  { y: -0.27, w: 0.34, c: '#8b93a1', o: 0.3 },
]

export default function Desk() {
  const lit = useRoom((s) => s.hovered === 'works' || s.active === 'works')
  const reduced = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const screenMat = useRef<THREE.MeshStandardMaterial>(null)
  const lampLight = useRef<THREE.PointLight>(null)
  const shadeMat = useRef<THREE.MeshStandardMaterial>(null)
  const rowMats = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const cursorMat = useRef<THREE.MeshBasicMaterial>(null)

  const rows = useMemo(() => CODE_ROWS, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    if (screenMat.current) {
      screenMat.current.emissiveIntensity = damp(screenMat.current.emissiveIntensity, lit ? 1.9 : 0.62, 5, dt)
    }
    if (lampLight.current) {
      lampLight.current.intensity = damp(lampLight.current.intensity, lit ? 4.2 : 2.4, 4, dt)
    }
    if (shadeMat.current) {
      shadeMat.current.emissiveIntensity = damp(shadeMat.current.emissiveIntensity, lit ? 2.4 : 1.1, 4, dt)
    }

    if (reduced) return
    // 屏幕里的代码在慢慢“执行”：行亮度像扫描波一样走过，光标在闪
    const t = state.clock.elapsedTime
    rowMats.current.forEach((m, i) => {
      if (!m) return
      const wave = Math.sin(t * 1.5 - i * 0.85) * 0.5 + 0.5
      m.opacity = CODE_ROWS[i].o * (0.5 + wave * 0.8)
    })
    if (cursorMat.current) {
      cursorMat.current.opacity = t % 1.1 < 0.6 ? 0.95 : 0.08
    }
  })

  return (
    <group position={[-3.2, 0, -0.2]} rotation={[0, Math.PI / 2, 0]}>
      <Station id="works" hitbox={[2.7, 2.4, 2.2]} hitboxPosition={[0, 1.2, 0.5]} ring={[0, 0.02, 0.25]} ringSize={1.5}>
        {/* 桌面 */}
        <RoundedBox args={[2.6, 0.09, 1.15]} radius={0.02} smoothness={2} position={[0, 0.98, 0]}>
          <meshStandardMaterial color={C.woodLight} roughness={0.62} metalness={0.04} />
        </RoundedBox>
        <mesh position={[0, 0.93, 0]}>
          <boxGeometry args={[2.56, 0.03, 1.11]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.8} />
        </mesh>

        {/* 桌腿 */}
        {[
          [-1.2, 0.467, -0.5],
          [-1.2, 0.467, 0.5],
          [1.2, 0.467, -0.5],
          [1.2, 0.467, 0.5],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <boxGeometry args={[0.075, 0.935, 0.075]} />
            <meshStandardMaterial color={C.metalDark} roughness={0.55} metalness={0.5} />
          </mesh>
        ))}

        {/* 抽屉柜 */}
        <RoundedBox args={[0.74, 0.88, 1.02]} radius={0.015} position={[0.86, 0.44, 0]}>
          <meshStandardMaterial color={C.wood} roughness={0.7} />
        </RoundedBox>
        {[0.19, 0.45, 0.71].map((y, i) => (
          <group key={i}>
            <mesh position={[0.86, y, 0.516]}>
              <boxGeometry args={[0.62, 0.19, 0.028]} />
              <meshStandardMaterial color={C.woodDark} roughness={0.66} />
            </mesh>
            <mesh position={[0.86, y, 0.536]}>
              <boxGeometry args={[0.2, 0.014, 0.018]} />
              <meshStandardMaterial color={C.metal} roughness={0.32} metalness={0.75} />
            </mesh>
          </group>
        ))}

        {/* 显示器 */}
        <mesh position={[0.2, 1.043, -0.12]}>
          <boxGeometry args={[0.66, 0.03, 0.38]} />
          <meshStandardMaterial color={C.metalDark} roughness={0.42} metalness={0.6} />
        </mesh>
        <mesh position={[0.2, 1.23, -0.16]}>
          <boxGeometry args={[0.075, 0.37, 0.075]} />
          <meshStandardMaterial color={C.metal} roughness={0.4} metalness={0.65} />
        </mesh>

        <group position={[0.2, 1.66, -0.13]} rotation={[-0.04, 0, 0]}>
          <RoundedBox args={[1.46, 0.86, 0.045]} radius={0.012} smoothness={2}>
            <meshStandardMaterial color="#15181e" roughness={0.5} metalness={0.35} />
          </RoundedBox>
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[1.36, 0.78]} />
            <meshStandardMaterial
              ref={screenMat}
              color="#0a1a20"
              emissive="#1d4f58"
              emissiveIntensity={0.62}
              roughness={0.24}
            />
          </mesh>
          {/* 屏幕内容：几行假代码 + 一条左侧色带 */}
          <mesh position={[-0.61, 0, 0.028]}>
            <planeGeometry args={[0.05, 0.78]} />
            <meshBasicMaterial color="#12262c" />
          </mesh>
          {rows.map((r, i) => (
            <mesh key={i} position={[-0.36 + r.w / 2, r.y, 0.028]}>
              <planeGeometry args={[r.w, 0.022]} />
              <meshBasicMaterial
                ref={(m) => {
                  rowMats.current[i] = m
                }}
                color={r.c}
                transparent
                opacity={r.o}
              />
            </mesh>
          ))}
          {/* 光标 */}
          <mesh position={[-0.3, -0.34, 0.028]}>
            <planeGeometry args={[0.045, 0.026]} />
            <meshBasicMaterial ref={cursorMat} color="#6ee7d7" transparent opacity={0.95} />
          </mesh>
        </group>

        {/* 键盘 / 鼠标 */}
        <RoundedBox args={[0.8, 0.022, 0.28]} radius={0.008} smoothness={2} position={[0.2, 1.035, 0.32]}>
          <meshStandardMaterial color="#1a1d23" roughness={0.62} />
        </RoundedBox>
        <RoundedBox args={[0.09, 0.035, 0.14]} radius={0.012} smoothness={2} position={[0.78, 1.038, 0.34]}>
          <meshStandardMaterial color="#1a1d23" roughness={0.5} />
        </RoundedBox>

        {/* 马克杯 */}
        <mesh position={[1.02, 1.095, -0.26]}>
          <cylinderGeometry args={[0.055, 0.05, 0.14, 18]} />
          <meshStandardMaterial color={C.paper} roughness={0.72} />
        </mesh>

        {/* 台灯 */}
        <mesh position={[-1.0, 1.038, -0.22]}>
          <cylinderGeometry args={[0.13, 0.13, 0.026, 24]} />
          <meshStandardMaterial color={C.metalDark} roughness={0.38} metalness={0.7} />
        </mesh>
        <mesh position={[-1.0, 1.41, -0.22]}>
          <cylinderGeometry args={[0.026, 0.026, 0.73, 12]} />
          <meshStandardMaterial color={C.metal} roughness={0.35} metalness={0.75} />
        </mesh>
        <mesh position={[-1.0, 1.82, -0.22]}>
          <cylinderGeometry args={[0.11, 0.19, 0.2, 24, 1, true]} />
          <meshStandardMaterial
            ref={shadeMat}
            color="#3a2a20"
            emissive="#ff8a3d"
            emissiveIntensity={1.1}
            roughness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[-1.0, 1.725, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.17, 24]} />
          <meshBasicMaterial color="#ffd9b0" />
        </mesh>
        <pointLight ref={lampLight} position={[-1.0, 1.62, -0.22]} intensity={2.4} distance={5.5} decay={2} color="#ffb46b" />

        {/* 桌面纸张 */}
        <mesh position={[-0.4, 1.026, 0.28]} rotation={[-Math.PI / 2, 0, 0.12]}>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial color="#cfc8ba" roughness={0.95} />
        </mesh>

        {/* 椅子 */}
        <group position={[0.05, 0, 1.15]}>
          <RoundedBox args={[0.7, 0.08, 0.64]} radius={0.03} smoothness={3} position={[0, 0.5, 0]}>
            <meshStandardMaterial color={C.fabric} roughness={0.92} />
          </RoundedBox>
          <RoundedBox args={[0.7, 0.56, 0.075]} radius={0.03} smoothness={3} position={[0, 0.8, 0.3]} rotation={[-0.08, 0, 0]}>
            <meshStandardMaterial color={C.fabricDeep} roughness={0.94} />
          </RoundedBox>
          {[
            [-0.3, 0.23, -0.25],
            [-0.3, 0.23, 0.25],
            [0.3, 0.23, -0.25],
            [0.3, 0.23, 0.25],
          ].map((p, i) => (
            <mesh key={i} position={p as [number, number, number]}>
              <boxGeometry args={[0.042, 0.46, 0.042]} />
              <meshStandardMaterial color={C.metalDark} roughness={0.5} metalness={0.55} />
            </mesh>
          ))}
        </group>
      </Station>
    </group>
  )
}
