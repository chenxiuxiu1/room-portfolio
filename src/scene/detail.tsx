import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { C } from './materials'

type V3 = [number, number, number]

/** 沉头螺钉：家具上一排小金属点，廉价感基本就是被这种细节消掉的 */
export function Screw({
  position,
  size = 0.012,
  color = '#8f949c',
  flat = true,
}: {
  position: V3
  size?: number
  color?: string
  /** 吸附面朝上（默认）；竖着装时传 false 由外层旋转 */
  flat?: boolean
}) {
  return (
    <group position={position} rotation={flat ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[size, size * 0.82, size * 0.42, 12]} />
        <meshStandardMaterial color={color} roughness={0.32} metalness={0.88} />
      </mesh>
      <mesh position={[0, size * 0.22, 0]}>
        <boxGeometry args={[size * 1.35, size * 0.1, size * 0.18]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.62} />
      </mesh>
    </group>
  )
}

/** 线缆：从桌面垂到地上再绕到墙角，房间立刻有了"有人住"的证据 */
export function Cable({
  points,
  radius = 0.007,
  color = '#191c22',
}: {
  points: V3[]
  radius?: number
  color?: string
}) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
      false,
      'catmullrom',
      0.4,
    )
    return new THREE.TubeGeometry(curve, 40, radius, 6, false)
  }, [points, radius])

  useEffect(() => () => geo.dispose(), [geo])

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.62} metalness={0.08} />
    </mesh>
  )
}

/** 一摞随手放的书：宽度厚度都不齐，才不像摆件 */
export function BookStack({
  position,
  rotation = [0, 0, 0],
  colors = ['#7c5a48', '#46565a', '#8a7355', '#5c4a52'],
  widths = [0.26, 0.23, 0.28, 0.21],
}: {
  position: V3
  rotation?: V3
  colors?: string[]
  widths?: number[]
}) {
  const items = useMemo(
    () =>
      widths.map((w, i) => ({
        w,
        d: w * 0.72,
        h: 0.028 + (i % 3) * 0.006,
        y: widths.slice(0, i).reduce((s, _, k) => s + 0.03 + (k % 3) * 0.006, 0),
        r: (i % 2 === 0 ? 1 : -1) * (0.04 + i * 0.03),
        c: colors[i % colors.length],
      })),
    [widths, colors],
  )

  return (
    <group position={position} rotation={rotation}>
      {items.map((b, i) => (
        <RoundedBox
          key={i}
          args={[b.w, b.h, b.d]}
          radius={0.004}
          smoothness={2}
          position={[0, b.y + b.h / 2, 0]}
          rotation={[0, b.r, 0]}
        >
          <meshStandardMaterial color={b.c} roughness={0.88} />
        </RoundedBox>
      ))}
    </group>
  )
}

/** 笔筒 + 几支笔：笔身高度和倾角都不同，才像真在用 */
export function PenCup({ position, scale = 1 }: { position: V3; scale?: number }) {
  const pens = useMemo(
    () => [
      { x: 0.012, z: 0.008, h: 0.19, tilt: 0.07, dir: 0.4, c: '#2a2f36' },
      { x: -0.018, z: -0.012, h: 0.16, tilt: -0.11, dir: 1.9, c: '#ff8a5b' },
      { x: 0.004, z: -0.02, h: 0.21, tilt: 0.04, dir: 3.1, c: '#c9c2b2' },
      { x: -0.006, z: 0.018, h: 0.14, tilt: 0.14, dir: 5.2, c: '#4a5560' },
    ],
    [],
  )

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.042, 0.038, 0.11, 18, 1, true]} />
        <meshStandardMaterial color="#3c3a36" roughness={0.5} metalness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.002, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.006, 18]} />
        <meshStandardMaterial color="#2a2825" roughness={0.7} />
      </mesh>
      {pens.map((p, i) => (
        <group key={i} position={[p.x, 0.075, p.z]} rotation={[Math.cos(p.dir) * p.tilt, 0, Math.sin(p.dir) * p.tilt]}>
          <mesh position={[0, p.h / 2, 0]}>
            <cylinderGeometry args={[0.0055, 0.0055, p.h, 8]} />
            <meshStandardMaterial color={p.c} roughness={0.42} metalness={0.15} />
          </mesh>
          <mesh position={[0, p.h + 0.004, 0]}>
            <coneGeometry args={[0.0058, 0.012, 8]} />
            <meshStandardMaterial color={p.c} roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** 小盆栽：陶盆 + 几片压扁的椭球叶子 */
export function PlantPot({ position, scale = 1 }: { position: V3; scale?: number }) {
  const leaves = useMemo(
    () => [
      { a: 0.3, r: 0.11, y: 0.2, s: 1.0, tilt: 0.5 },
      { a: 1.5, r: 0.13, y: 0.26, s: 1.15, tilt: 0.35 },
      { a: 2.7, r: 0.1, y: 0.18, s: 0.86, tilt: 0.62 },
      { a: 3.9, r: 0.12, y: 0.24, s: 1.05, tilt: 0.42 },
      { a: 5.1, r: 0.09, y: 0.16, s: 0.78, tilt: 0.7 },
    ],
    [],
  )

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.085, 0.062, 0.15, 20]} />
        <meshStandardMaterial color="#6b5545" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.078, 0.078, 0.012, 20]} />
        <meshStandardMaterial color="#2c2620" roughness={1} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh
          key={i}
          position={[Math.cos(l.a) * l.r, l.y, Math.sin(l.a) * l.r]}
          rotation={[Math.cos(l.a) * l.tilt, l.a, Math.sin(l.a) * l.tilt]}
          scale={[0.05 * l.s, 0.012 * l.s, 0.085 * l.s]}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={i % 2 ? C.leaf : C.leafDark} roughness={0.82} />
        </mesh>
      ))}
    </group>
  )
}

/** 耳机：头梁 + 两个耳罩，挂在桌沿或支架上 */
export function Headphones({ position, rotation = [0, 0, 0] }: { position: V3; rotation?: V3 }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <torusGeometry args={[0.085, 0.009, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#22262d" roughness={0.55} metalness={0.2} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.085, 0, 0]}>
          <mesh position={[0, -0.018, 0]}>
            <cylinderGeometry args={[0.042, 0.045, 0.028, 16]} />
            <meshStandardMaterial color="#2c3138" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.032, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
            <meshStandardMaterial color="#14171c" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
