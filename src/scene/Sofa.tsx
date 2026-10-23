import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import Station from './Station'
import Turntable from './Turntable'
import { C } from './materials'
import { fabricTexture, rugTexture } from '../lib/textures'
import { BookStack } from './detail'

/** 地毯流苏：短边上一排细条，最能说明"这是一块铺上去的毯子" */
function Fringe({
  x,
  z,
  count,
  span,
  length,
  vertical,
}: {
  x: number
  z: number
  count: number
  span: number
  length: number
  vertical: boolean
}) {
  // 96 根流苏如果各自一个 mesh 就是 96 次 draw call，合成一个 instanced 只算一次
  const ref = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    if (!ref.current) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      vertical ? Math.PI / 2 : 0,
    )
    const scale = new THREE.Vector3(1, 1, 1)
    const p = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      const t = -span / 2 + (i / (count - 1)) * span
      p.set(x + (vertical ? 0 : t), 0.006, z + (vertical ? t : 0))
      m.compose(p, q, scale)
      ref.current.setMatrixAt(i, m)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [x, z, count, span, vertical])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.012, 0.004, length]} />
      <meshStandardMaterial color="#6a5a48" roughness={1} />
    </instancedMesh>
  )
}

export default function Sofa() {
  const fab = useMemo(() => fabricTexture(), [])
  const rug = useMemo(() => rugTexture(), [])

  return (
    <group position={[2.9, 0, -0.55]}>
      <Station id="contact" hitbox={[3.0, 1.9, 3.1]} hitboxPosition={[0, 0.95, 0.55]} ring={[0, 0.02, 1.35]} ringSize={1.55}>
        {/* 地毯：外圈 + 内圈 + 流苏 */}
        <RoundedBox args={[3.9, 0.02, 2.9]} radius={0.08} smoothness={3} position={[0, 0.011, 1.15]}>
          <meshStandardMaterial map={rug} color={C.rug} roughness={1} />
        </RoundedBox>
        <RoundedBox args={[3.44, 0.008, 2.44]} radius={0.06} smoothness={3} position={[0, 0.022, 1.15]}>
          <meshStandardMaterial map={rug} color="#4c3f34" roughness={1} />
        </RoundedBox>
        {/* 内圈一道细包边，四条边而不是一个圆 */}
        {[
          [0, 1.15 - 1.22, 3.44, 0.014],
          [0, 1.15 + 1.22, 3.44, 0.014],
          [-1.72, 1.15, 0.014, 2.44],
          [1.72, 1.15, 0.014, 2.44],
        ].map(([x, z, w, d], i) => (
          <mesh key={i} position={[x, 0.027, z]}>
            <boxGeometry args={[w, 0.006, d]} />
            <meshStandardMaterial color="#5a4a3b" roughness={1} />
          </mesh>
        ))}
        <Fringe x={0} z={2.62} count={27} span={3.82} length={0.1} vertical={false} />
        <Fringe x={0} z={-0.32} count={27} span={3.82} length={0.1} vertical={false} />
        <Fringe x={1.97} z={1.15} count={21} span={2.82} length={0.1} vertical />
        <Fringe x={-1.97} z={1.15} count={21} span={2.82} length={0.1} vertical />

        {/* 沙发主体：底座内收一点，看起来是"坐箱"而不是一块砖 */}
        <RoundedBox args={[2.6, 0.34, 1.0]} radius={0.05} smoothness={3} position={[0, 0.27, 0]}>
          <meshStandardMaterial map={fab} color={C.fabric} roughness={0.94} />
        </RoundedBox>
        <RoundedBox args={[2.44, 0.12, 0.9]} radius={0.04} smoothness={3} position={[0, 0.12, 0]}>
          <meshStandardMaterial map={fab} color={C.fabricDeep} roughness={0.96} />
        </RoundedBox>

        {/* 靠背：三段软包，缝在中间 */}
        {[-0.86, 0, 0.86].map((x, i) => (
          <group key={i}>
            <RoundedBox args={[0.84, 0.72, 0.26]} radius={0.075} smoothness={3} position={[x, 0.76, -0.4]} rotation={[-0.06, 0, 0]}>
              <meshStandardMaterial map={fab} color={C.fabricDeep} roughness={0.96} />
            </RoundedBox>
            {/* 侧缝 */}
            {i < 2 && (
              <mesh position={[x + 0.43, 0.76, -0.34]} rotation={[0, 0, 0.02]}>
                <boxGeometry args={[0.006, 0.6, 0.02]} />
                <meshStandardMaterial color="#1e232b" roughness={1} />
              </mesh>
            )}
          </group>
        ))}
        {/* 靠背顶部一条压边 */}
        <mesh position={[0, 1.1, -0.42]}>
          <boxGeometry args={[2.5, 0.014, 0.2]} />
          <meshStandardMaterial map={fab} color="#333a44" roughness={1} />
        </mesh>

        {/* 扶手：柱状抱枕封口，比方盒更像沙发 */}
        {[-1.19, 1.19].map((x, i) => (
          <group key={i}>
            <RoundedBox args={[0.24, 0.5, 1.0]} radius={0.075} smoothness={3} position={[x, 0.47, -0.02]}>
              <meshStandardMaterial map={fab} color={C.fabric} roughness={0.94} />
            </RoundedBox>
            <mesh position={[x, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.9, 1]}>
              <cylinderGeometry args={[0.115, 0.115, 0.92, 20]} />
              <meshStandardMaterial map={fab} color="#39414c" roughness={0.98} />
            </mesh>
          </group>
        ))}

        {/* 坐垫：下层厚垫 + 上层软包，前缘略塌 */}
        {[-0.6, 0.6].map((x, i) => (
          <group key={i}>
            <RoundedBox args={[1.14, 0.16, 0.86]} radius={0.055} smoothness={3} position={[x, 0.5, 0.05]}>
              <meshStandardMaterial map={fab} color="#333a44" roughness={0.98} />
            </RoundedBox>
            <RoundedBox args={[1.1, 0.05, 0.82]} radius={0.035} smoothness={3} position={[x, 0.585, 0.07]}>
              <meshStandardMaterial map={fab} color="#39414b" roughness={1} />
            </RoundedBox>
            {/* 坐垫前缘缝线 */}
            <mesh position={[x, 0.6, 0.48]}>
              <boxGeometry args={[1.06, 0.004, 0.006]} />
              <meshStandardMaterial color="#1e232b" roughness={1} />
            </mesh>
            {/* 两侧缝线 */}
            {[-0.55, 0.55].map((dx) => (
              <mesh key={dx} position={[x + dx, 0.6, 0.06]}>
                <boxGeometry args={[0.006, 0.004, 0.78]} />
                <meshStandardMaterial color="#1e232b" roughness={1} />
              </mesh>
            ))}
          </group>
        ))}

        {/* 抱枕：两个带中缝的方枕 */}
        <group position={[-0.74, 0.82, -0.16]} rotation={[0.14, 0.2, -0.14]}>
          <RoundedBox args={[0.42, 0.42, 0.15]} radius={0.075} smoothness={3}>
            <meshStandardMaterial color="#6b5140" roughness={0.98} />
          </RoundedBox>
          <mesh position={[0, 0, 0.077]}>
            <boxGeometry args={[0.34, 0.004, 0.004]} />
            <meshStandardMaterial color="#4a382c" roughness={1} />
          </mesh>
        </group>
        <group position={[0.8, 0.8, -0.18]} rotation={[0.1, -0.28, 0.1]}>
          <RoundedBox args={[0.38, 0.38, 0.14]} radius={0.07} smoothness={3}>
            <meshStandardMaterial color="#4c5a55" roughness={0.98} />
          </RoundedBox>
          <mesh position={[0, 0, 0.072]}>
            <boxGeometry args={[0.3, 0.004, 0.004]} />
            <meshStandardMaterial color="#333e3a" roughness={1} />
          </mesh>
        </group>

        {/* 搭在右扶手上的毯子：三层错位的薄板 + 下摆 */}
        <group position={[1.19, 0.86, 0.22]} rotation={[0, 0.06, -0.04]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[i * 0.008, -i * 0.006, i * 0.02]} rotation={[0.02 * i, 0.05 * i, 0]}>
              <boxGeometry args={[0.3, 0.012, 0.44]} />
              <meshStandardMaterial color={i === 1 ? '#5a4a3e' : '#6a5a4a'} roughness={1} />
            </mesh>
          ))}
          <mesh position={[0.01, -0.34, 0.02]} rotation={[0.12, 0, 0]}>
            <boxGeometry args={[0.3, 0.34, 0.012]} />
            <meshStandardMaterial color="#6a5a4a" roughness={1} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={`f${i}`} position={[-0.12 + i * 0.04, -0.5, 0.06]} rotation={[0.12, 0, 0]}>
              <boxGeometry args={[0.008, 0.05, 0.004]} />
              <meshStandardMaterial color="#7a6a58" roughness={1} />
            </mesh>
          ))}
        </group>

        {/* 锥形木脚 */}
        {[
          [-1.12, -0.42],
          [1.12, -0.42],
          [-1.12, 0.42],
          [1.12, 0.42],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.065, 0]} rotation={[0, 0, 0.06]}>
              <cylinderGeometry args={[0.026, 0.04, 0.13, 10]} />
              <meshStandardMaterial color={C.woodDark} roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.005, 0]}>
              <cylinderGeometry args={[0.042, 0.042, 0.01, 10]} />
              <meshStandardMaterial color="#1b1a18" roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* 茶几：桌面 + 下层搁板 + 三条腿 + 留声机 */}
        <group position={[0, 0, 1.35]}>
          <mesh position={[0, 0.43, 0]}>
            <cylinderGeometry args={[0.74, 0.74, 0.055, 44]} />
            <meshStandardMaterial color={C.wood} roughness={0.58} metalness={0.04} />
          </mesh>
          {/* 桌面边缘的圆角封边 */}
          <mesh position={[0, 0.399, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.018, 44]} />
            <meshStandardMaterial color={C.woodDark} roughness={0.66} />
          </mesh>
          {/* 下层搁板 */}
          <mesh position={[0, 0.155, 0]}>
            <cylinderGeometry args={[0.52, 0.52, 0.026, 36]} />
            <meshStandardMaterial color={C.woodDark} roughness={0.7} />
          </mesh>
          {/* 三条外张的腿 */}
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2 + 0.5
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.42, 0.2, Math.sin(a) * 0.42]}
                rotation={[Math.sin(a) * 0.1, 0, -Math.cos(a) * 0.1]}
              >
                <cylinderGeometry args={[0.022, 0.03, 0.4, 10]} />
                <meshStandardMaterial color={C.metalDark} roughness={0.48} metalness={0.45} />
              </mesh>
            )
          })}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.014, 16]} />
            <meshStandardMaterial color={C.metalDark} roughness={0.6} metalness={0.3} />
          </mesh>

          <Turntable />

          {/* 茶几上的卡片与书堆 */}
          <mesh position={[0.44, 0.462, 0.36]} rotation={[-Math.PI / 2, 0, 0.34]}>
            <planeGeometry args={[0.22, 0.3]} />
            <meshStandardMaterial color="#d8d1c2" roughness={0.95} />
          </mesh>
          <mesh position={[0.44, 0.464, 0.36]} rotation={[-Math.PI / 2, 0, 0.34]}>
            <planeGeometry args={[0.14, 0.012]} />
            <meshBasicMaterial color="#8a8172" />
          </mesh>
          <BookStack
            position={[-0.46, 0.458, 0.3]}
            rotation={[0, 0.5, 0]}
            widths={[0.2, 0.17, 0.19]}
            colors={['#6b5140', '#3f4a5c', '#8a7355']}
          />
        </group>

        {/* 落地灯：锥形灯罩 + 细杆 + 配重底盘 */}
        <group position={[-1.62, 0, -0.32]}>
          <mesh position={[0, 0.016, 0]}>
            <cylinderGeometry args={[0.19, 0.21, 0.032, 26]} />
            <meshStandardMaterial color={C.metalDark} roughness={0.4} metalness={0.55} />
          </mesh>
          <mesh position={[0, 0.82, 0]}>
            <cylinderGeometry args={[0.018, 0.022, 1.6, 12]} />
            <meshStandardMaterial color={C.metal} roughness={0.3} metalness={0.78} />
          </mesh>
          <mesh position={[0, 1.68, 0]}>
            <cylinderGeometry args={[0.185, 0.27, 0.26, 30, 1, true]} />
            <meshStandardMaterial color="#3a3128" emissive="#ff9a5c" emissiveIntensity={0.9} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 1.552, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.25, 26]} />
            <meshBasicMaterial color="#ffe2c0" />
          </mesh>
          <pointLight position={[0, 1.5, 0]} intensity={2.2} distance={6} decay={2} color="#ffb87a" />
        </group>
      </Station>
    </group>
  )
}
