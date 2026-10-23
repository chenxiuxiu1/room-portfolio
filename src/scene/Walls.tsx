import { useMemo, useState } from 'react'
import { RoundedBox, Html } from '@react-three/drei'
import * as THREE from 'three'
import { C } from './materials'
import { wallTexture } from '../lib/textures'
import { useRoom } from '../lib/store'
import { pointerState } from '../lib/pointer'

/** 后墙上的窗：也是通往星野的入口 */
function Window() {
  const [hot, setHot] = useState(false)
  const setSpace = useRoom((s) => s.setSpace)

  const stars = useMemo(() => {
    const count = 90
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 2.3
      arr[i * 3 + 1] = (Math.random() - 0.5) * 1.34
      arr[i * 3 + 2] = Math.random() * 0.05
    }
    return arr
  }, [])

  return (
    <group position={[-1.05, 2.2, -4.9]}>
      <mesh>
        <planeGeometry args={[2.5, 1.5]} />
        <meshBasicMaterial color={C.glass} />
      </mesh>

      {/* 城市天际线剪影 */}
      {[
        [-0.9, -0.62, 0.42, 0.26],
        [-0.52, -0.55, 0.24, 0.4],
        [-0.24, -0.64, 0.3, 0.22],
        [0.1, -0.5, 0.18, 0.5],
        [0.34, -0.6, 0.34, 0.3],
        [0.72, -0.56, 0.22, 0.38],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y + h / 2 - 0.2, 0.012]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#16232e" />
        </mesh>
      ))}

      <points position={[0, 0, 0.02]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stars, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#cfe6ff" size={0.026} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
      </points>

      {/* 窗框 */}
      {[
        [0, 0.74, 2.66, 0.055],
        [0, -0.74, 2.66, 0.055],
        [-1.3, 0, 0.055, 1.5],
        [1.3, 0, 0.055, 1.5],
        [0, 0, 0.045, 1.46],
      ].map(([x, y, w, h], i) => (
        <mesh key={`f${i}`} position={[x, y, 0.06]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#2a2f38" />
        </mesh>
      ))}

      {/* 窗台 */}
      <RoundedBox args={[2.86, 0.08, 0.24]} radius={0.02} position={[0, -0.8, 0.09]}>
        <meshStandardMaterial color={C.trim} roughness={0.7} />
      </RoundedBox>

      {/* 悬停时窗内透出的一层冷光 */}
      <mesh position={[0, 0, 0.071]} visible={hot}>
        <planeGeometry args={[2.56, 1.56]} />
        <meshBasicMaterial
          color="#8fc2f0"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 点击区：覆盖整扇窗 */}
      <mesh
        position={[0, 0, 0.1]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHot(true)
        }}
        onPointerOut={() => setHot(false)}
        onClick={(e) => {
          e.stopPropagation()
          if (pointerState.moved > 9) return
          setSpace(true)
        }}
      >
        <planeGeometry args={[2.5, 1.5]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Html position={[0, 0.02, 0.14]} center zIndexRange={[22, 0]} style={{ pointerEvents: 'none' }}>
        <div
          className="pointer-events-none whitespace-nowrap rounded-sm border px-2.5 py-1 font-mono text-[10px] tracking-[0.22em] transition-all duration-300"
          style={{
            opacity: hot ? 1 : 0,
            transform: `translateY(${hot ? 0 : 6}px)`,
            borderColor: 'rgba(143,194,240,0.45)',
            background: 'rgba(8,12,20,0.72)',
            color: '#d6e6f7',
            backdropFilter: 'blur(6px)',
          }}
        >
          进入星野 / ENTER
        </div>
      </Html>
    </group>
  )
}

/** 后墙右侧的软木板，钉着几张便签 */
function Pinboard() {
  const notes = useMemo(
    () => [
      { x: -0.72, y: 0.34, w: 0.34, h: 0.3, c: '#e2c187', r: 0.06 },
      { x: -0.3, y: 0.46, w: 0.28, h: 0.26, c: '#d98b6a', r: -0.05 },
      { x: 0.16, y: 0.3, w: 0.36, h: 0.32, c: '#b9c9a8', r: 0.03 },
      { x: 0.62, y: 0.44, w: 0.26, h: 0.28, c: '#cfd6dd', r: -0.08 },
      { x: -0.46, y: -0.16, w: 0.3, h: 0.34, c: '#dcd3c2', r: -0.03 },
      { x: 0.3, y: -0.14, w: 0.32, h: 0.26, c: '#c9a58a', r: 0.05 },
    ],
    [],
  )

  return (
    <group position={[3.05, 2.28, -4.9]}>
      <RoundedBox args={[2.3, 1.45, 0.06]} radius={0.02}>
        <meshStandardMaterial color="#4a3b2c" roughness={0.95} />
      </RoundedBox>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[2.18, 1.33]} />
        <meshStandardMaterial color="#5c4a37" roughness={1} />
      </mesh>
      {notes.map((n, i) => (
        <group key={i} position={[n.x, n.y, 0.05]} rotation={[0, 0, n.r]}>
          <mesh>
            <planeGeometry args={[n.w, n.h]} />
            <meshStandardMaterial color={n.c} roughness={0.9} />
          </mesh>
          <mesh position={[0, n.h / 2 - 0.035, 0.008]}>
            <circleGeometry args={[0.016, 10]} />
            <meshBasicMaterial color="#2b2119" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.705, 0]}>
        <boxGeometry args={[2.34, 0.03, 0.08]} />
        <meshStandardMaterial color={C.woodLight} roughness={0.6} />
      </mesh>
    </group>
  )
}

export default function Walls() {
  const wall = useMemo(() => wallTexture(), [])

  return (
    <group>
      {/* 后墙 / 左墙 */}
      <mesh position={[0, 1.7, -5]}>
        <boxGeometry args={[10.2, 3.4, 0.18]} />
        <meshStandardMaterial map={wall} color={C.wall} roughness={0.96} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-5, 1.7, 0]}>
        <boxGeometry args={[0.18, 3.4, 10.2]} />
        <meshStandardMaterial map={wall} color={C.wall} roughness={0.96} side={THREE.DoubleSide} />
      </mesh>

      {/* 护墙板：下半墙一层深色木饰面，空间立刻有了上下层次 */}
      <mesh position={[0, 0.55, -4.895]}>
        <boxGeometry args={[9.98, 0.92, 0.035]} />
        <meshStandardMaterial color="#34291f" roughness={0.82} metalness={0.06} />
      </mesh>
      <mesh position={[-4.895, 0.55, 0]}>
        <boxGeometry args={[0.035, 0.92, 9.98]} />
        <meshStandardMaterial color="#34291f" roughness={0.82} metalness={0.06} />
      </mesh>
      {/* 护墙板压顶线条 */}
      <mesh position={[0, 1.02, -4.872]}>
        <boxGeometry args={[9.98, 0.045, 0.055]} />
        <meshStandardMaterial color="#4d3c2d" roughness={0.55} metalness={0.14} />
      </mesh>
      <mesh position={[-4.872, 1.02, 0]}>
        <boxGeometry args={[0.055, 0.045, 9.98]} />
        <meshStandardMaterial color="#4d3c2d" roughness={0.55} metalness={0.14} />
      </mesh>

      {/* 踢脚线 */}
      <mesh position={[0, 0.09, -4.89]}>
        <boxGeometry args={[9.98, 0.18, 0.05]} />
        <meshStandardMaterial color={C.trim} roughness={0.65} metalness={0.2} />
      </mesh>
      <mesh position={[-4.89, 0.09, 0]}>
        <boxGeometry args={[0.05, 0.18, 9.98]} />
        <meshStandardMaterial color={C.trim} roughness={0.65} metalness={0.2} />
      </mesh>

      {/* 墙顶收边 + 一条极淡的导光带，最能去"廉价感"的一笔 */}
      <mesh position={[0, 3.36, -4.89]}>
        <boxGeometry args={[10.02, 0.045, 0.07]} />
        <meshBasicMaterial color="#333a45" />
      </mesh>
      <mesh position={[-4.89, 3.36, 0]}>
        <boxGeometry args={[0.07, 0.045, 10.02]} />
        <meshBasicMaterial color="#333a45" />
      </mesh>
      <mesh position={[0, 3.31, -4.86]}>
        <boxGeometry args={[10, 0.006, 0.018]} />
        <meshBasicMaterial color={C.ember} transparent opacity={0.12} />
      </mesh>
      <mesh position={[-4.86, 3.31, 0]}>
        <boxGeometry args={[0.018, 0.006, 10]} />
        <meshBasicMaterial color={C.ember} transparent opacity={0.12} />
      </mesh>

      <Window />
      <Pinboard />
    </group>
  )
}
