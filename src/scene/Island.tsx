import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { C } from './materials'
import { floorTexture } from '../lib/textures'

/** 悬浮岛：地板 + 倒方锥基座 + 底部光晕 */
export default function Island() {
  const floor = useMemo(() => floorTexture(), [])

  return (
    <group>
      <RoundedBox args={[10, 0.52, 10]} radius={0.06} smoothness={3} position={[0, -0.26, 0]}>
        <meshStandardMaterial map={floor} color="#eef0f6" roughness={0.82} metalness={0.06} />
      </RoundedBox>

      {/* 倒方锥：半径 = 边长/√2，四段即正方形 */}
      <mesh position={[0, -1.92, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[7.071, 0.85, 2.8, 4, 1]} />
        <meshStandardMaterial color={C.floorEdge} roughness={0.92} metalness={0.12} />
      </mesh>

      {/* 基座底部的细光边 */}
      <group rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, -3.33, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 0.84, 4, 1]} />
          <meshBasicMaterial color="#6fb0e8" transparent opacity={0.45} />
        </mesh>
      </group>

      {/* 地板外沿一圈暖色导光条 */}
      <group rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, -0.56, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[7.04, 7.08, 4, 1]} />
          <meshBasicMaterial color="#e07a4f" transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  )
}
