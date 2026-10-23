import { RoundedBox } from '@react-three/drei'
import Piano from './Piano'
import Guitar from './Guitar'

/** 钢琴组：靠后墙右侧 */
export function PianoUnit() {
  return (
    <group position={[2.95, 0, -4.44]}>
      <Piano />
    </group>
  )
}

export function GuitarUnit() {
  return (
    <group position={[1.12, 0, -4.52]} rotation={[0, 0.14, 0]}>
      <Guitar />
    </group>
  )
}

export function MusicRug() {
  return (
    <group position={[2.95, 0, -3.62]}>
      <RoundedBox args={[2.34, 0.012, 1.18]} radius={0.05} smoothness={3} position={[0, 0.006, 0]}>
        <meshStandardMaterial color="#3b2b23" roughness={1} />
      </RoundedBox>
      <RoundedBox args={[2.02, 0.006, 0.92]} radius={0.04} smoothness={3} position={[0, 0.013, 0]}>
        <meshStandardMaterial color="#4a3629" roughness={1} />
      </RoundedBox>
    </group>
  )
}

/** 琴凳：木架 + 布面坐垫 */
export function Bench() {
  return (
    <group position={[2.95, 0, -3.44]}>
      <RoundedBox args={[0.68, 0.07, 0.34]} radius={0.012} smoothness={2} position={[0, 0.43, 0]}>
        <meshStandardMaterial color="#241a15" roughness={0.45} />
      </RoundedBox>
      <RoundedBox args={[0.64, 0.036, 0.3]} radius={0.012} smoothness={2} position={[0, 0.48, 0]}>
        <meshStandardMaterial color="#3e3228" roughness={0.98} />
      </RoundedBox>
      {[
        [-0.28, -0.12],
        [0.28, -0.12],
        [-0.28, 0.12],
        [0.28, 0.12],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <boxGeometry args={[0.034, 0.4, 0.034]} />
          <meshStandardMaterial color="#241a15" roughness={0.5} />
        </mesh>
      ))}
      {[-0.12, 0.12].map((z, i) => (
        <mesh key={i} position={[0, 0.1, z]}>
          <boxGeometry args={[0.54, 0.026, 0.026]} />
          <meshStandardMaterial color="#2c2019" roughness={0.55} />
        </mesh>
      ))}
    </group>
  )
}
