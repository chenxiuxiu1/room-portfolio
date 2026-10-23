import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { C } from './materials'
import { useRoom } from '../lib/store'

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 角落里的琴叶榕 */
function Plant() {
  const leaves = useMemo(
    () => [
      { y: 1.05, a: 0.1, r: 0.05, len: 0.42, rot: 0.45 },
      { y: 1.25, a: 1.5, r: 0.08, len: 0.46, rot: 0.7 },
      { y: 1.15, a: 3.0, r: 0.06, len: 0.38, rot: 0.3 },
      { y: 1.42, a: 4.3, r: 0.04, len: 0.44, rot: 0.6 },
      { y: 1.34, a: 5.5, r: 0.07, len: 0.4, rot: 0.5 },
      { y: 1.62, a: 2.2, r: 0.03, len: 0.34, rot: 0.55 },
      { y: 1.55, a: 0.6, r: 0.05, len: 0.36, rot: 0.35 },
      { y: 1.78, a: 3.9, r: 0.02, len: 0.3, rot: 0.5 },
      { y: 1.88, a: 1.2, r: 0.02, len: 0.28, rot: 0.65 },
    ],
    [],
  )

  return (
    <group position={[4.62, 0, 4.3]}>
      {/* 花盆 */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.31, 0.24, 0.6, 24]} />
        <meshStandardMaterial color="#6d5a4a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[0.31, 0.022, 10, 28]} />
        <meshStandardMaterial color="#7d6855" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.585, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.29, 24]} />
        <meshStandardMaterial color="#2a211a" roughness={1} />
      </mesh>

      {/* 主茎 */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.022, 0.036, 0.85, 10]} />
        <meshStandardMaterial color="#4a3d2c" roughness={0.9} />
      </mesh>

      {/* 叶子 */}
      {leaves.map((l, i) => {
        const x = Math.cos(l.a) * l.r
        const z = Math.sin(l.a) * l.r
        return (
          <group key={i} position={[x, l.y, z]} rotation={[0, -l.a, l.rot]}>
            <mesh scale={[1, 0.06, 1]}>
              <sphereGeometry args={[l.len, 14, 10]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? C.leafDark : C.leaf}
                roughness={0.72}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/** 地上的书堆与球，补一点"有人住"的痕迹 */
function Clutter() {
  return (
    <group position={[-3.95, 0, 3.62]}>
      <mesh position={[0, 0.04, 0]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.36]} />
        <meshStandardMaterial color="#7a5a44" roughness={0.9} />
      </mesh>
      <mesh position={[0.02, 0.11, 0.02]} rotation={[0, -0.16, 0]}>
        <boxGeometry args={[0.46, 0.06, 0.33]} />
        <meshStandardMaterial color="#41545a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.02, 0.165, -0.01]} rotation={[0, 0.46, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.3]} />
        <meshStandardMaterial color="#8a7c62" roughness={0.9} />
      </mesh>
      <mesh position={[0.36, 0.12, 0.26]}>
        <sphereGeometry args={[0.12, 20, 16]} />
        <meshStandardMaterial color="#8f8a80" roughness={0.65} />
      </mesh>
    </group>
  )
}

/** 空中的细尘 —— 让光有体积 */
function Dust() {
  const group = useRef<THREE.Group>(null)
  const quality = useRoom((s) => s.quality)
  const reduced = useMemo(prefersReduced, [])

  const positions = useMemo(() => {
    const n = quality === 0 ? 120 : 260
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 9.4
      arr[i * 3 + 1] = 0.15 + Math.random() * 3.1
      arr[i * 3 + 2] = (Math.random() - 0.5) * 9.4
    }
    return arr
  }, [quality])

  useFrame((state) => {
    if (!group.current || reduced) return
    const t = state.clock.elapsedTime
    group.current.rotation.y = t * 0.012
    group.current.position.y = Math.sin(t * 0.24) * 0.12
  })

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#f2dcc0"
          size={0.022}
          sizeAttenuation
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

/** 窗外光落到地板上的冷色光斑 */
function FloorGlow() {
  return (
    <mesh position={[-0.6, 0.006, -2.6]} rotation={[-Math.PI / 2, 0, 0.2]} scale={[2.2, 1.9, 1]}>
      <circleGeometry args={[1, 40]} />
      <meshBasicMaterial color="#7fa8cc" transparent opacity={0.018} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

/** 岛外远处的星尘：让悬浮感成立，也让纯黑背景有纵深 */
function Stars() {
  const quality = useRoom((s) => s.quality)
  const space = useRoom((s) => s.space)

  const positions = useMemo(() => {
    const n = quality === 0 ? 360 : 720
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 16 + Math.random() * 16
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.7 - 1
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    return arr
  }, [quality])

  return (
    <points visible={!space}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#a8c2e0"
        size={0.1}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function Decor() {
  return (
    <group>
      <Plant />
      <Clutter />
      <Dust />
      <FloorGlow />
      <Stars />
    </group>
  )
}
