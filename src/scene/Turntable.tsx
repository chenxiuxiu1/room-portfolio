import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { Cable, Screw } from './detail'
import { woodTexture } from '../lib/textures'
import { useRoom } from '../lib/store'
import { damp } from '../lib/camera'

/**
 * 桌面留声机：木箱 + 转盘 + 唱臂 + 铜喇叭。
 * 喇叭是这台机器唯一的「表情」，所以它得是铜的、有卷边、朝斜后方张开。
 */
export default function Turntable() {
  const disc = useRef<THREE.Mesh>(null)
  const arm = useRef<THREE.Group>(null)
  const hornMat = useRef<THREE.MeshStandardMaterial>(null)
  const hot = useRoom((s) => s.hovered === 'contact' || s.active === 'contact')
  const wood = useMemo(() => woodTexture([3, 3]), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    if (disc.current) disc.current.rotation.y += dt * (hot ? 2.4 : 0.32)
    if (arm.current) arm.current.rotation.y = damp(arm.current.rotation.y, hot ? -0.36 : -0.1, 4, dt)
    if (hornMat.current) {
      hornMat.current.emissiveIntensity = damp(hornMat.current.emissiveIntensity, hot ? 0.42 : 0.1, 3, dt)
    }
  })

  return (
    <group position={[0, 0.446, 0]}>
      {/* 木箱：上下两道线脚，中间是箱体 */}
      <RoundedBox args={[0.74, 0.1, 0.52]} radius={0.01} smoothness={2} position={[0, 0.062, 0]}>
        <meshStandardMaterial map={wood} color="#6a4a33" roughness={0.5} metalness={0.04} />
      </RoundedBox>
      <mesh position={[0, 0.118, 0]}>
        <boxGeometry args={[0.76, 0.014, 0.54]} />
        <meshStandardMaterial map={wood} color="#7d5a3f" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.006, 0]}>
        <boxGeometry args={[0.72, 0.012, 0.5]} />
        <meshStandardMaterial color="#1b1512" roughness={0.9} />
      </mesh>
      {/* 四角铜护角 */}
      {[
        [-0.36, 0.33],
        [0.36, 0.33],
        [-0.36, -0.25],
        [0.36, -0.25],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.062, z]}>
          <boxGeometry args={[0.02, 0.096, 0.02]} />
          <meshStandardMaterial color="#b08a55" roughness={0.34} metalness={0.85} />
        </mesh>
      ))}

      {/* 转盘凹槽 + 唱盘 */}
      <mesh position={[-0.08, 0.126, 0]}>
        <cylinderGeometry args={[0.235, 0.235, 0.014, 40]} />
        <meshStandardMaterial color="#211a15" roughness={0.75} />
      </mesh>
      <mesh ref={disc} position={[-0.08, 0.138, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.012, 44]} />
        <meshStandardMaterial color="#111114" roughness={0.32} metalness={0.25} />
      </mesh>
      {/* 唱片沟槽：几圈极细的环，转起来才有"盘在转"的感觉 */}
      {[0.075, 0.105, 0.135, 0.165].map((r, i) => (
        <mesh key={i} position={[-0.08, 0.145, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.0016, 48]} />
          <meshBasicMaterial color="#2b2b30" transparent opacity={0.85} />
        </mesh>
      ))}
      {/* 唱片标签 + 中心轴 */}
      <mesh position={[-0.08, 0.146, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.058, 32]} />
        <meshStandardMaterial color="#b6513a" roughness={0.68} />
      </mesh>
      <mesh position={[-0.08, 0.149, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.054, 0.058, 32]} />
        <meshBasicMaterial color="#e0d6c2" />
      </mesh>
      <mesh position={[-0.08, 0.152, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.016, 10]} />
        <meshStandardMaterial color="#c9c4ba" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 唱臂：底座 + 臂杆 + 配重 + 唱头 */}
      <mesh position={[0.235, 0.14, -0.155]}>
        <cylinderGeometry args={[0.036, 0.042, 0.03, 16]} />
        <meshStandardMaterial color="#8f949c" roughness={0.28} metalness={0.85} />
      </mesh>
      <group ref={arm} position={[0.235, 0.156, -0.155]} rotation={[0, -0.1, 0]}>
        <mesh position={[0, 0, 0.115]}>
          <boxGeometry args={[0.014, 0.012, 0.25]} />
          <meshStandardMaterial color="#b9bec6" roughness={0.24} metalness={0.9} />
        </mesh>
        {/* 配重 */}
        <mesh position={[0, 0.002, -0.045]}>
          <cylinderGeometry args={[0.026, 0.026, 0.045, 14]} />
          <meshStandardMaterial color="#3b3f46" roughness={0.42} metalness={0.6} />
        </mesh>
        {/* 唱头 */}
        <mesh position={[0, -0.014, 0.24]} rotation={[0.24, 0, 0]}>
          <boxGeometry args={[0.028, 0.022, 0.05]} />
          <meshStandardMaterial color="#2a2a2e" roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.026, 0.25]}>
          <boxGeometry args={[0.008, 0.014, 0.008]} />
          <meshStandardMaterial color="#c9a06a" roughness={0.35} metalness={0.8} />
        </mesh>
        {/* 升降杆 */}
        <mesh position={[0.03, 0.006, 0.02]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.005, 0.005, 0.06, 8]} />
          <meshStandardMaterial color="#9aa0a8" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* 喇叭颈：一段弯管从箱体后侧伸上来 */}
      <Cable
        points={[
          [0.25, 0.128, -0.19],
          [0.3, 0.3, -0.235],
          [0.31, 0.46, -0.225],
        ]}
        radius={0.026}
        color="#b08a55"
      />

      {/* 铜喇叭：外张的锥口 + 卷边 */}
      <group position={[0.31, 0.62, -0.225]} rotation={[0.16, 0.42, 0]}>
        <mesh>
          <cylinderGeometry args={[0.235, 0.03, 0.32, 36, 1, true]} />
          <meshStandardMaterial
            ref={hornMat}
            color="#c69a5f"
            emissive="#ff9b4d"
            emissiveIntensity={0.1}
            roughness={0.3}
            metalness={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <torusGeometry args={[0.235, 0.011, 8, 36]} />
          <meshStandardMaterial color="#d3a970" roughness={0.24} metalness={0.92} />
        </mesh>
        {/* 喇叭内壁的一圈暗环，避免开口像个纯色圆片 */}
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.11, 0.08, 0.03, 28, 1, true]} />
          <meshStandardMaterial color="#8a6a42" roughness={0.55} metalness={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 面板：两个旋钮 + 铭牌 + 指示灯 */}
      {[-0.28, -0.2].map((x, i) => (
        <group key={i} position={[x, 0.075, 0.262]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.024, 0.018, 16]} />
            <meshStandardMaterial color="#1e1a17" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.005, 0.005, 0.018]} />
            <meshStandardMaterial color="#c9a06a" roughness={0.35} metalness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.12, 0.078, 0.262]}>
        <planeGeometry args={[0.22, 0.038]} />
        <meshStandardMaterial color="#c9a06a" roughness={0.3} metalness={0.75} emissive="#8a5f2c" emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0.29, 0.09, 0.262]}>
        <circleGeometry args={[0.011, 12]} />
        <meshBasicMaterial color={hot ? '#6ee7d7' : '#2c4a4a'} />
      </mesh>

      {[0, 1].map((i) => (
        <Screw key={i} position={[i ? 0.31 : -0.31, 0.075, 0.262]} size={0.008} color="#a08a68" />
      ))}
    </group>
  )
}
