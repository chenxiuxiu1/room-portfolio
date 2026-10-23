import { useMemo } from 'react'
import * as THREE from 'three'

const BODY = '#a9703f'
const BODY_SIDE = '#6d4527'
const FRET = '#c8c2b4'
const STRING = '#ddd6c6'

/** 木吉他：靠墙立在支架上，琴身用 Shape 挤出，侧面有厚度 */
export default function Guitar() {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0.28)
    s.bezierCurveTo(0.13, 0.28, 0.16, 0.18, 0.115, 0.11)
    s.bezierCurveTo(0.19, 0.05, 0.235, -0.05, 0.215, -0.15)
    s.bezierCurveTo(0.195, -0.27, 0.085, -0.33, 0, -0.33)
    s.bezierCurveTo(-0.085, -0.33, -0.195, -0.27, -0.215, -0.15)
    s.bezierCurveTo(-0.235, -0.05, -0.19, 0.05, -0.115, 0.11)
    s.bezierCurveTo(-0.16, 0.18, -0.13, 0.28, 0, 0.28)
    return s
  }, [])

  const strings = useMemo(
    () => Array.from({ length: 6 }, (_, i) => -0.0225 + i * 0.009),
    [],
  )

  return (
    <>
      {/* 支架 */}
      <group position={[0, 0, 0.02]}>
        <mesh position={[0, 0.014, 0]}>
          <boxGeometry args={[0.44, 0.028, 0.05]} />
          <meshStandardMaterial color="#2b2c31" roughness={0.4} metalness={0.5} />
        </mesh>
        {[-0.16, 0.16].map((x, i) => (
          <mesh key={i} position={[x, 0.075, 0]}>
            <boxGeometry args={[0.026, 0.15, 0.026]} />
            <meshStandardMaterial color="#34353a" roughness={0.38} metalness={0.55} />
          </mesh>
        ))}
        <mesh position={[0, 0.152, 0.01]}>
          <boxGeometry args={[0.36, 0.024, 0.045]} />
          <meshStandardMaterial color="#3a3b40" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.15, -0.05]} rotation={[0.42, 0, 0]}>
          <boxGeometry args={[0.36, 0.02, 0.03]} />
          <meshStandardMaterial color="#2b2c31" roughness={0.45} metalness={0.5} />
        </mesh>
      </group>

      <group position={[0, 0.47, 0]} rotation={[-0.1, 0.24, -0.05]} scale={0.92}>
        {/* 琴身 */}
        <mesh position={[0, 0, 0]}>
          <extrudeGeometry
            args={[
              shape,
              {
                depth: 0.08,
                bevelEnabled: true,
                bevelSize: 0.008,
                bevelThickness: 0.01,
                bevelSegments: 2,
                curveSegments: 18,
              },
            ]}
          />
          <meshStandardMaterial color={BODY} roughness={0.52} metalness={0.04} />
        </mesh>

        {/* 音孔 + 圈 */}
        <mesh position={[0, 0.14, 0.092]}>
          <circleGeometry args={[0.058, 28]} />
          <meshBasicMaterial color="#100c09" />
        </mesh>
        <mesh position={[0, 0.14, 0.0935]}>
          <ringGeometry args={[0.058, 0.068, 28]} />
          <meshStandardMaterial color={BODY_SIDE} roughness={0.6} />
        </mesh>

        {/* 护板 */}
        <mesh position={[0, 0.0, 0.0915]} rotation={[0, 0, -0.35]}>
          <circleGeometry args={[0.13, 20, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color="#3a2317" roughness={0.7} />
        </mesh>

        {/* 琴桥 */}
        <mesh position={[0, -0.15, 0.094]}>
          <boxGeometry args={[0.105, 0.02, 0.012]} />
          <meshStandardMaterial color="#241610" roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.165, 0.096]}>
          <boxGeometry args={[0.085, 0.008, 0.008]} />
          <meshStandardMaterial color="#d9d2c2" roughness={0.5} />
        </mesh>

        {/* 琴颈 + 指板 */}
        <mesh position={[0, 0.56, 0.06]}>
          <boxGeometry args={[0.054, 0.56, 0.042]} />
          <meshStandardMaterial color={BODY_SIDE} roughness={0.58} />
        </mesh>
        <mesh position={[0, 0.56, 0.083]}>
          <boxGeometry args={[0.058, 0.56, 0.008]} />
          <meshStandardMaterial color="#191310" roughness={0.55} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[0, 0.37 + i * 0.062, 0.089]}>
            <boxGeometry args={[0.056, 0.004, 0.003]} />
            <meshStandardMaterial color={FRET} roughness={0.32} metalness={0.7} />
          </mesh>
        ))}

        {/* 琴头 + 弦钮 */}
        <group position={[0, 0.895, 0.075]} rotation={[0.12, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.076, 0.17, 0.03]} />
            <meshStandardMaterial color="#241610" roughness={0.5} />
          </mesh>
          {[0.86, 0.9, 0.94].map((y, i) => (
            <group key={i}>
              <mesh position={[0.05, y - 0.895, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.011, 0.011, 0.032, 10]} />
                <meshStandardMaterial color={FRET} roughness={0.3} metalness={0.85} />
              </mesh>
              <mesh position={[-0.05, y - 0.895, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.011, 0.011, 0.032, 10]} />
                <meshStandardMaterial color={FRET} roughness={0.3} metalness={0.85} />
              </mesh>
            </group>
          ))}
        </group>

        {/* 六根弦 */}
        {strings.map((x, i) => (
          <mesh key={i} position={[x, 0.36, 0.093]}>
            <boxGeometry args={[0.0034, 0.99, 0.002]} />
            <meshStandardMaterial color={STRING} roughness={0.28} metalness={0.9} />
          </mesh>
        ))}
      </group>
    </>
  )
}
