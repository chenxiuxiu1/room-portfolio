import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const WOOD = '#3d2a1d'
const WOOD_EDGE = '#523a27'
const KEY_W = '#efe9dc'
const KEY_B = '#14110f'
const BRASS = '#c39a64'

/** 立式钢琴：整块胡桃木箱体 + 逐键排列的两组八度 */
export default function Piano() {
  const keys = useMemo(() => {
    const white: number[] = []
    for (let i = 0; i < 14; i++) white.push(-0.65 + i * 0.1)
    const black: number[] = []
    for (let oct = 0; oct < 2; oct++) {
      for (const i of [0, 1, 3, 4, 5]) {
        black.push(-0.65 + (oct * 7 + i) * 0.1 + 0.05)
      }
    }
    return { white, black }
  }, [])

  return (
    <group>
      {/* 下裙板与底座 */}
      <RoundedBox args={[1.46, 0.42, 0.5]} radius={0.012} smoothness={2} position={[0, 0.44, -0.05]}>
        <meshStandardMaterial color={WOOD} roughness={0.44} metalness={0.08} />
      </RoundedBox>
      <RoundedBox args={[1.5, 0.09, 0.52]} radius={0.01} smoothness={2} position={[0, 0.675, -0.05]}>
        <meshStandardMaterial color={WOOD_EDGE} roughness={0.4} metalness={0.1} />
      </RoundedBox>

      {/* 前腿 + 后轮 */}
      {[-0.67, 0.67].map((x, i) => (
        <group key={i} position={[x, 0, 0.16]}>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.09, 0.24, 0.11]} />
            <meshStandardMaterial color={WOOD} roughness={0.42} metalness={0.08} />
          </mesh>
          <mesh position={[0, 0.015, 0]}>
            <boxGeometry args={[0.1, 0.03, 0.12]} />
            <meshStandardMaterial color={BRASS} roughness={0.35} metalness={0.8} />
          </mesh>
        </group>
      ))}
      {[-0.62, 0.62].map((x, i) => (
        <mesh key={`w${i}`} position={[x, 0.06, -0.26]}>
          <cylinderGeometry args={[0.035, 0.035, 0.11, 12]} />
          <meshStandardMaterial color="#191411" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {/* 三个踏板 */}
      {[-0.14, 0, 0.14].map((x, i) => (
        <mesh key={i} position={[x, 0.17, 0.27]} rotation={[0.12, 0, 0]}>
          <boxGeometry args={[0.062, 0.018, 0.1]} />
          <meshStandardMaterial color={BRASS} roughness={0.32} metalness={0.85} />
        </mesh>
      ))}

      {/* 主箱体 */}
      <RoundedBox args={[1.55, 0.54, 0.56]} radius={0.014} smoothness={2} position={[0, 0.98, -0.02]}>
        <meshStandardMaterial color={WOOD} roughness={0.42} metalness={0.08} />
      </RoundedBox>
      {/* 顶盖，边缘一条亮边把体块分开 */}
      <RoundedBox args={[1.6, 0.05, 0.62]} radius={0.008} smoothness={2} position={[0, 1.275, -0.02]}>
        <meshStandardMaterial color="#2c211a" roughness={0.34} metalness={0.12} />
      </RoundedBox>
      <mesh position={[0, 1.302, -0.02]}>
        <boxGeometry args={[1.61, 0.008, 0.63]} />
        <meshStandardMaterial color="#4a3729" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* 键盘台 */}
      <mesh position={[0, 0.735, 0.3]}>
        <boxGeometry args={[1.5, 0.05, 0.15]} />
        <meshStandardMaterial color="#1d1511" roughness={0.5} />
      </mesh>
      {keys.white.map((x, i) => (
        <mesh key={`k${i}`} position={[x, 0.778, 0.325]}>
          <boxGeometry args={[0.088, 0.026, 0.145]} />
          <meshStandardMaterial color={KEY_W} roughness={0.36} metalness={0.02} />
        </mesh>
      ))}
      {keys.black.map((x, i) => (
        <mesh key={`b${i}`} position={[x, 0.794, 0.3]}>
          <boxGeometry args={[0.052, 0.03, 0.095]} />
          <meshStandardMaterial color={KEY_B} roughness={0.3} metalness={0.05} />
        </mesh>
      ))}
      {/* 琴键前挡 */}
      <mesh position={[0, 0.762, 0.402]}>
        <boxGeometry args={[1.52, 0.046, 0.022]} />
        <meshStandardMaterial color={WOOD_EDGE} roughness={0.4} />
      </mesh>

      {/* 翻起的键盘盖 */}
      <mesh position={[0, 0.9, 0.278]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[1.5, 0.17, 0.028]} />
        <meshStandardMaterial color="#1f1712" roughness={0.44} metalness={0.1} />
      </mesh>

      {/* 谱架 + 摊开的乐谱 */}
      <mesh position={[0, 1.06, 0.17]} rotation={[-0.34, 0, 0]}>
        <boxGeometry args={[1.06, 0.34, 0.016]} />
        <meshStandardMaterial color="#2a1f18" roughness={0.55} />
      </mesh>
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={i} position={[x, 1.062, 0.185]} rotation={[-0.34, 0, 0]}>
          <planeGeometry args={[0.26, 0.34]} />
          <meshStandardMaterial color="#ded6c6" roughness={0.94} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 1.06, 0.19]} rotation={[-0.34, 0, 0]}>
        <planeGeometry args={[0.012, 0.34]} />
        <meshStandardMaterial color="#b9ae9a" roughness={0.9} />
      </mesh>

      {/* 铭牌 */}
      <mesh position={[0, 0.9, 0.262]}>
        <planeGeometry args={[0.3, 0.042]} />
        <meshStandardMaterial color="#c9a06a" roughness={0.3} metalness={0.7} emissive="#8a5f2c" emissiveIntensity={0.18} />
      </mesh>

      {/* 顶盖上的一叠乐谱 */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.42 + i * 0.012, 1.306 + i * 0.008, -0.1]} rotation={[0, 0.12 - i * 0.05, 0]}>
          <boxGeometry args={[0.3, 0.008, 0.22]} />
          <meshStandardMaterial color={i === 2 ? '#d8d0c0' : '#cfc6b4'} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}
