import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
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
    <group position={[-4.1, 0, 3.5]}>
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

/** 阅读角：圆毯 + 边桌 + 蒲团。把画面左下的空地变成一块“可以坐下”的地方 */
function CornerSet() {
  return (
    <group>
      {/* 圆毯：家具都是方的，一块圆的能把它们拢在一起 */}
      <mesh position={[-2.15, 0.008, 2.4]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <circleGeometry args={[1.42, 64]} />
        <meshStandardMaterial color="#443a31" roughness={1} />
      </mesh>
      <mesh position={[-2.15, 0.011, 2.4]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <ringGeometry args={[1.24, 1.36, 64]} />
        <meshStandardMaterial color="#5b4c40" roughness={1} />
      </mesh>

      {/* 边桌：圆桌面 + 单柱 + 底盘，桌上两本书一只陶碗 */}
      <group position={[-2.72, 0, 3.42]}>
        <mesh position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.31, 0.31, 0.035, 36]} />
          <meshStandardMaterial color={C.wood} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.437, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.014, 36]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.66} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.035, 0.045, 0.44, 14]} />
          <meshStandardMaterial color={C.metalDark} roughness={0.45} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.024, 24]} />
          <meshStandardMaterial color={C.metalDark} roughness={0.5} metalness={0.35} />
        </mesh>
        <mesh position={[-0.06, 0.505, 0.03]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.24, 0.04, 0.17]} />
          <meshStandardMaterial color="#7c5a48" roughness={0.9} />
        </mesh>
        <mesh position={[-0.04, 0.537, 0.02]} rotation={[0, 0.12, 0]}>
          <boxGeometry args={[0.21, 0.034, 0.15]} />
          <meshStandardMaterial color="#46565a" roughness={0.9} />
        </mesh>
        <mesh position={[0.13, 0.51, -0.08]}>
          <cylinderGeometry args={[0.055, 0.04, 0.045, 20]} />
          <meshStandardMaterial color="#6b5545" roughness={0.85} />
        </mesh>
      </group>

      {/* 蒲团：中间压了一个坑，没有这个坑就是一块蛋糕 */}
      <group position={[-1.28, 0, 3.15]}>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.34, 0.35, 0.28, 28]} />
          <meshStandardMaterial color="#6b5b4a" roughness={1} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <torusGeometry args={[0.31, 0.018, 8, 28]} />
          <meshStandardMaterial color="#5a4a3c" roughness={1} />
        </mesh>
        <mesh position={[0, 0.285, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 28]} />
          <meshStandardMaterial color="#60503f" roughness={1} />
        </mesh>
        <mesh position={[0, 0.29, 0]}>
          <sphereGeometry args={[0.022, 10, 8]} />
          <meshStandardMaterial color="#4a3a2e" roughness={1} />
        </mesh>
      </group>
    </group>
  )
}

/** 入口地垫：给悬浮岛一个“门口”，而不是家具凭空落在板上 */
function DoorMat() {
  return (
    <group position={[-0.2, 0, 4.32]} rotation={[0, 0.05, 0]}>
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 0.86]} />
        <meshStandardMaterial color="#3c423f" roughness={1} />
      </mesh>
      <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.28, 0.74]} />
        <meshStandardMaterial color="#4a514c" roughness={1} />
      </mesh>
      {[-0.42, -0.28, -0.14, 0, 0.14, 0.28, 0.42].map((z, i) => (
        <mesh key={i} position={[0, 0.013, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 0.008]} />
          <meshStandardMaterial color="#363c38" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/** 后墙左段的挂钟：窗和书架之间那块空白，用时间填上 */
function WallClock() {
  const ticks = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2)
  return (
    <group position={[-3.92, 2.42, -4.86]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.05, 32]} />
        <meshStandardMaterial color={C.woodDark} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.027]}>
        <circleGeometry args={[0.2, 40]} />
        <meshStandardMaterial color="#ded6c6" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <torusGeometry args={[0.205, 0.012, 8, 40]} />
        <meshStandardMaterial color={C.metal} roughness={0.3} metalness={0.8} />
      </mesh>
      {ticks.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.172, Math.sin(a) * 0.172, 0.031]} rotation={[0, 0, a]}>
          <boxGeometry args={[0.006, i % 3 === 0 ? 0.026 : 0.014, 0.004]} />
          <meshBasicMaterial color="#2c2620" />
        </mesh>
      ))}
      {/* 指针以圆心为轴，不能把盒子直接斜过来——那样两根针会离开轴心 */}
      <group position={[0, 0, 0.033]} rotation={[0, 0, -0.7]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.008, 0.12, 0.004]} />
          <meshBasicMaterial color="#26201a" />
        </mesh>
      </group>
      <group position={[0, 0, 0.034]} rotation={[0, 0, 1.9]}>
        <mesh position={[0, 0.085, 0]}>
          <boxGeometry args={[0.005, 0.17, 0.004]} />
          <meshBasicMaterial color="#26201a" />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.035]}>
        <circleGeometry args={[0.012, 12]} />
        <meshBasicMaterial color="#8a5a3a" />
      </mesh>
    </group>
  )
}

/** 左墙书桌上方的一对小幅画：墙面有东西可看，房间才不会像仓库 */
function WallPrints() {
  return (
    <>
      {[
        { y: 2.28, z: 0.92, w: 0.34, h: 0.44, c: '#8a6a52', r: 0.02 },
        { y: 2.36, z: 1.5, w: 0.28, h: 0.36, c: '#3f4a5c', r: -0.02 },
      ].map((f, i) => (
        <group key={i} position={[-4.87, f.y, f.z]} rotation={[0, Math.PI / 2, f.r]}>
          <mesh>
            <boxGeometry args={[f.w, f.h, 0.03]} />
            <meshStandardMaterial color="#1c1916" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[f.w - 0.05, f.h - 0.05]} />
            <meshStandardMaterial color={f.c} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.02, 0.02]}>
            <circleGeometry args={[f.w * 0.22, 20]} />
            <meshBasicMaterial color="#e7d9c2" transparent opacity={0.75} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** 后墙上沿的轨道射灯：三个头加一条导轨，是室内设计里最省事的一笔 */
function TrackLight() {
  return (
    <group position={[0.35, 3.18, -4.74]}>
      <mesh>
        <boxGeometry args={[4.4, 0.05, 0.05]} />
        <meshStandardMaterial color="#1d2126" roughness={0.5} metalness={0.4} />
      </mesh>
      {[-1.5, -0.1, 1.4].map((x, i) => (
        <group key={i} position={[x, -0.03, 0]} rotation={[-0.36, 0, 0.02]}>
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.052, 0.062, 0.13, 16]} />
            <meshStandardMaterial color="#262b31" roughness={0.45} metalness={0.4} />
          </mesh>
          {/* 灯口一圈暖光：从俯视角度看得到，又不用朝向错误的发光面 */}
          <mesh position={[0, -0.125, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.045, 0.006, 6, 16]} />
            <meshBasicMaterial color="#ffd9b0" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

const SLEEVE_COLORS = ['#6a4b3a', '#38474f', '#7a4550', '#4b5a44', '#5a4a68', '#7d6a4f']

/** 唱片箱：留声机得有续作，否则一屋子的音乐只剩一台机器。
 *  摆在沙发前的空地上，既是前景的锚点，也把“听黑胶”这件事说圆 */
function RecordCrate() {
  const sleeves = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: -0.235 + i * 0.058,
        tilt: (((i * 7) % 5) - 2) * 0.024,
        yaw: (((i * 13) % 7) - 3) * 0.026,
        c: SLEEVE_COLORS[i % SLEEVE_COLORS.length],
      })),
    [],
  )

  return (
    <group position={[1.28, 0, 3.06]} rotation={[0, 0.34, 0]}>
      {/* 箱底与四壁：刻意做成开口，盖上板子就只是一坨 */}
      <mesh position={[0, 0.028, 0]}>
        <boxGeometry args={[0.66, 0.04, 0.5]} />
        <meshStandardMaterial color={C.woodDark} roughness={0.74} />
      </mesh>
      {[-0.24, 0.24].map((z, i) => (
        <mesh key={`f${i}`} position={[0, 0.17, z]}>
          <boxGeometry args={[0.66, 0.3, 0.028]} />
          <meshStandardMaterial color={C.wood} roughness={0.68} />
        </mesh>
      ))}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={`s${i}`} position={[x, 0.17, 0]}>
          <boxGeometry args={[0.028, 0.3, 0.5]} />
          <meshStandardMaterial color={C.wood} roughness={0.68} />
        </mesh>
      ))}
      {/* 上沿收口：没有这一圈，箱口看着像被切了一刀 */}
      {[-0.24, 0.24].map((z, i) => (
        <mesh key={`r${i}`} position={[0, 0.325, z]}>
          <boxGeometry args={[0.7, 0.026, 0.056]} />
          <meshStandardMaterial color={C.woodLight} roughness={0.56} />
        </mesh>
      ))}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={`rr${i}`} position={[x, 0.325, 0]}>
          <boxGeometry args={[0.056, 0.026, 0.52]} />
          <meshStandardMaterial color={C.woodLight} roughness={0.56} />
        </mesh>
      ))}
      {/* 侧面的提手孔 */}
      {[-0.345, 0.345].map((x, i) => (
        <mesh key={`h${i}`} position={[x, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.14, 0.02, 0.02]} />
          <meshStandardMaterial color="#1d1a16" roughness={0.9} />
        </mesh>
      ))}

      {/* 立在箱里的唱片：露出一截封套上沿，一眼就认得出 */}
      {sleeves.map((s, i) => (
        <mesh key={i} position={[s.x, 0.2, 0]} rotation={[0, s.yaw, s.tilt]}>
          <boxGeometry args={[0.014, 0.32, 0.31]} />
          <meshStandardMaterial color={s.c} roughness={0.86} />
        </mesh>
      ))}

      {/* 靠在箱外的两张封套和一张拿出来听的黑胶 */}
      {[
        [-0.14, -0.02],
        [0.03, 0.03],
      ].map(([x, rz], i) => (
        <group key={`p${i}`} position={[x, 0.155, 0.3]} rotation={[-0.3, 0, rz]}>
          <mesh>
            <boxGeometry args={[0.29, 0.29, 0.008]} />
            <meshStandardMaterial color={i ? '#42535c' : '#7d5a44'} roughness={0.9} />
          </mesh>
          <mesh position={[0.04, 0.05, 0.006]}>
            <circleGeometry args={[0.075, 20]} />
            <meshBasicMaterial color={i ? '#e0c79a' : '#c9d5de'} />
          </mesh>
          <mesh position={[-0.06, -0.09, 0.006]}>
            <planeGeometry args={[0.16, 0.014]} />
            <meshBasicMaterial color="#dfe6ea" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
      <group position={[0.25, 0.155, 0.3]} rotation={[-0.3, 0, 0.04]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.145, 0.145, 0.006, 30]} />
          <meshStandardMaterial color="#121317" roughness={0.34} metalness={0.32} />
        </mesh>
        <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.002, 30]} />
          <meshBasicMaterial color="#1c1d22" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <circleGeometry args={[0.05, 20]} />
          <meshStandardMaterial color="#c1704a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.006]}>
          <circleGeometry args={[0.007, 10]} />
          <meshBasicMaterial color="#0b0b0d" />
        </mesh>
      </group>
    </group>
  )
}

/** 角落里的藤筐：书架和墙之间那一小块死角，空着像是忘了摆东西 */
function CornerBasket() {
  return (
    <group position={[-4.28, 0, -4.32]} rotation={[0, 0.42, 0]}>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.27, 0.21, 0.34, 22, 1, true]} />
        <meshStandardMaterial color="#6b5843" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* 三圈横向的编织棱，藤编的轮廓不是直的 */}
      {[0.07, 0.17, 0.27].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.213 + i * 0.028, 0.012, 6, 26]} />
          <meshStandardMaterial color="#7a6650" roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.272, 0.021, 8, 26]} />
        <meshStandardMaterial color="#5d4b39" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.21, 22]} />
        <meshStandardMaterial color="#4f4033" roughness={1} />
      </mesh>

      {/* 搭在筐沿上的一条毯子：卷起来才有厚度 */}
      <mesh position={[0.02, 0.39, -0.03]} rotation={[0.1, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 0.44, 18]} />
        <meshStandardMaterial color="#8b7f6d" roughness={1} />
      </mesh>
      {[-0.22, 0.22].map((dx, i) => (
        <mesh key={i} position={[0.02 + dx, 0.39 + i * 0.004, -0.03]} rotation={[0.1, 0, Math.PI / 2]}>
          <torusGeometry args={[0.038, 0.016, 6, 14]} />
          <meshStandardMaterial color="#7c7060" roughness={1} />
        </mesh>
      ))}

      {/* 倚在筐边的一本杂志 */}
      <RoundedBox
        args={[0.2, 0.26, 0.014]}
        radius={0.006}
        smoothness={2}
        position={[-0.24, 0.13, 0.14]}
        rotation={[0.24, -0.3, 0.16]}
      >
        <meshStandardMaterial color="#b8a98f" roughness={0.92} />
      </RoundedBox>
    </group>
  )
}

/** 门垫边上的拖鞋：一个房间有没有人，最后就差这一双 */
function Slippers() {
  return (
    <group position={[0.74, 0, 4.44]} rotation={[0, -0.22, 0]}>
      {[
        { x: -0.09, z: 0.02, r: 0.03 },
        { x: 0.09, z: -0.06, r: -0.05 },
      ].map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} rotation={[0, p.r, 0]}>
          <RoundedBox args={[0.13, 0.045, 0.27]} radius={0.018} smoothness={2} position={[0, 0.024, 0]}>
            <meshStandardMaterial color="#6f6154" roughness={1} />
          </RoundedBox>
          <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.126, 0.266]} />
            <meshStandardMaterial color="#4c423a" roughness={1} />
          </mesh>
          {/* 鞋面的束带 */}
          <RoundedBox args={[0.138, 0.045, 0.075]} radius={0.016} smoothness={2} position={[0, 0.05, -0.06]}>
            <meshStandardMaterial color="#87775f" roughness={0.96} />
          </RoundedBox>
        </group>
      ))}
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
      <CornerSet />
      <DoorMat />
      <WallClock />
      <WallPrints />
      <TrackLight />
      <RecordCrate />
      <CornerBasket />
      <Slippers />
      <Dust />
      <FloorGlow />
      <Stars />
    </group>
  )
}
