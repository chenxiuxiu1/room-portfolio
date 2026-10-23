import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import Station from './Station'
import { C } from './materials'
import { fabricTexture, rugTexture } from '../lib/textures'
import { useRoom } from '../lib/store'
import { damp } from '../lib/camera'

/** 黑胶唱片，hover 时加速旋转 */
function Turntable() {
  const disc = useRef<THREE.Mesh>(null)
  const arm = useRef<THREE.Group>(null)
  const hot = useRoom((s) => s.hovered === 'contact' || s.active === 'contact')

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    if (disc.current) disc.current.rotation.y += dt * (hot ? 2.6 : 0.35)
    if (arm.current) arm.current.rotation.y = damp(arm.current.rotation.y, hot ? -0.34 : -0.12, 4, dt)
  })

  return (
    <group position={[0, 0.475, 0]}>
      <RoundedBox args={[0.66, 0.09, 0.5]} radius={0.014} smoothness={2}>
        <meshStandardMaterial color="#2b2622" roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.048, 0]}>
        <boxGeometry args={[0.6, 0.01, 0.44]} />
        <meshStandardMaterial color="#3a332c" roughness={0.75} />
      </mesh>

      <mesh ref={disc} position={[-0.07, 0.075, 0]}>
        <cylinderGeometry args={[0.185, 0.185, 0.014, 40]} />
        <meshStandardMaterial color="#111114" roughness={0.34} metalness={0.25} />
      </mesh>
      <mesh position={[-0.07, 0.083, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.055, 0.064, 32]} />
        <meshBasicMaterial color="#c85f3f" />
      </mesh>
      <mesh position={[-0.07, 0.084, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.008, 12]} />
        <meshBasicMaterial color="#d9d2c4" />
      </mesh>

      <mesh position={[0.235, 0.088, -0.16]}>
        <cylinderGeometry args={[0.028, 0.028, 0.05, 16]} />
        <meshStandardMaterial color="#59524a" roughness={0.5} metalness={0.5} />
      </mesh>
      <group ref={arm} position={[0.235, 0.1, -0.16]} rotation={[0, -0.12, 0]}>
        <mesh position={[0, 0, 0.12]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.016, 0.014, 0.26]} />
          <meshStandardMaterial color="#9aa0a8" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.012, 0.245]}>
          <boxGeometry args={[0.03, 0.03, 0.045]} />
          <meshStandardMaterial color="#2a2a2e" roughness={0.6} />
        </mesh>
      </group>

      {/* 唱片机正面的小指示灯 */}
      <mesh position={[-0.24, 0.02, 0.251]}>
        <circleGeometry args={[0.012, 10]} />
        <meshBasicMaterial color={C.mint} />
      </mesh>
    </group>
  )
}

export default function Sofa() {
  const fab = useMemo(() => fabricTexture(), [])
  const rug = useMemo(() => rugTexture(), [])

  return (
    <group position={[2.9, 0, -0.55]}>
      <Station id="contact" hitbox={[3.0, 1.9, 3.1]} hitboxPosition={[0, 0.95, 0.55]} ring={[0, 0.02, 1.35]} ringSize={1.55}>
        {/* 地毯 */}
        <RoundedBox args={[3.9, 0.022, 2.9]} radius={0.08} smoothness={3} position={[0, 0.012, 1.15]}>
          <meshStandardMaterial map={rug} color={C.rug} roughness={1} />
        </RoundedBox>
        <RoundedBox args={[3.5, 0.008, 2.5]} radius={0.06} smoothness={3} position={[0, 0.023, 1.15]}>
          <meshStandardMaterial map={rug} color="#4c3f34" roughness={1} />
        </RoundedBox>

        {/* 沙发底座 */}
        <RoundedBox args={[2.6, 0.42, 1.05]} radius={0.06} smoothness={3} position={[0, 0.3, 0]}>
          <meshStandardMaterial map={fab} color={C.fabric} roughness={0.94} />
        </RoundedBox>

        {/* 靠背 */}
        <RoundedBox args={[2.6, 0.74, 0.24]} radius={0.07} smoothness={3} position={[0, 0.75, -0.4]} rotation={[-0.06, 0, 0]}>
          <meshStandardMaterial map={fab} color={C.fabricDeep} roughness={0.96} />
        </RoundedBox>

        {/* 扶手 */}
        {[-1.19, 1.19].map((x, i) => (
          <RoundedBox key={i} args={[0.22, 0.56, 1.05]} radius={0.07} smoothness={3} position={[x, 0.56, 0]}>
            <meshStandardMaterial map={fab} color={C.fabric} roughness={0.94} />
          </RoundedBox>
        ))}

        {/* 坐垫 */}
        {[-0.57, 0.57].map((x, i) => (
          <RoundedBox key={i} args={[1.12, 0.15, 0.84]} radius={0.055} smoothness={3} position={[x, 0.55, 0.05]}>
            <meshStandardMaterial map={fab} color="#333a44" roughness={0.98} />
          </RoundedBox>
        ))}

        {/* 靠枕 */}
        <RoundedBox args={[0.42, 0.42, 0.15]} radius={0.06} smoothness={3} position={[-0.72, 0.78, -0.2]} rotation={[0.12, 0.16, -0.12]}>
          <meshStandardMaterial color="#6b5140" roughness={0.98} />
        </RoundedBox>
        <RoundedBox args={[0.38, 0.38, 0.14]} radius={0.06} smoothness={3} position={[0.78, 0.76, -0.22]} rotation={[0.1, -0.24, 0.1]}>
          <meshStandardMaterial color="#4c5a55" roughness={0.98} />
        </RoundedBox>

        {/* 沙发脚 */}
        {[
          [-1.1, 0.045, -0.42],
          [1.1, 0.045, -0.42],
          [-1.1, 0.045, 0.42],
          [1.1, 0.045, 0.42],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <cylinderGeometry args={[0.04, 0.03, 0.09, 12]} />
            <meshStandardMaterial color={C.woodDark} roughness={0.6} />
          </mesh>
        ))}

        {/* 茶几 */}
        <group position={[0, 0, 1.35]}>
          <mesh position={[0, 0.43, 0]}>
            <cylinderGeometry args={[0.74, 0.74, 0.06, 40]} />
            <meshStandardMaterial color={C.wood} roughness={0.6} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.395, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.02, 40]} />
            <meshStandardMaterial color={C.woodDark} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.4, 16]} />
            <meshStandardMaterial color={C.metalDark} roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.34, 0.36, 0.03, 32]} />
            <meshStandardMaterial color={C.metalDark} roughness={0.55} metalness={0.35} />
          </mesh>

          <Turntable />

          {/* 茶几上的卡片 */}
          <mesh position={[0.42, 0.465, 0.34]} rotation={[-Math.PI / 2, 0, 0.34]}>
            <planeGeometry args={[0.22, 0.3]} />
            <meshStandardMaterial color="#d8d1c2" roughness={0.95} />
          </mesh>
          <mesh position={[0.42, 0.467, 0.34]} rotation={[-Math.PI / 2, 0, 0.34]}>
            <planeGeometry args={[0.14, 0.012]} />
            <meshBasicMaterial color="#8a8172" />
          </mesh>
        </group>

        {/* 沙发旁的落地灯 */}
        <group position={[-1.62, 0, -0.32]}>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.2, 0.22, 0.04, 24]} />
            <meshStandardMaterial color={C.metalDark} roughness={0.45} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.82, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 1.6, 12]} />
            <meshStandardMaterial color={C.metal} roughness={0.35} metalness={0.7} />
          </mesh>
          <mesh position={[0, 1.68, 0]}>
            <cylinderGeometry args={[0.2, 0.28, 0.26, 28, 1, true]} />
            <meshStandardMaterial color="#3a3128" emissive="#ff9a5c" emissiveIntensity={0.9} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 1.56, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.26, 24]} />
            <meshBasicMaterial color="#ffe2c0" />
          </mesh>
          <pointLight position={[0, 1.5, 0]} intensity={2.2} distance={6} decay={2} color="#ffb87a" />
        </group>
      </Station>
    </group>
  )
}
