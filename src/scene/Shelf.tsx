import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox, Html } from '@react-three/drei'
import Station from './Station'
import { BOOK_COLORS, C } from './materials'
import { books } from '../content/site'
import type { Book } from '../types'
import { spineTexture } from '../lib/spine'
import { woodTexture } from '../lib/textures'
import { Cable, PlantPot, Screw } from './detail'
import { useRoom } from '../lib/store'
import { pointerState } from '../lib/pointer'
import { damp } from '../lib/camera'

/** 四层的书底高度，与层板对齐 */
const ROW_Y = [0.09, 0.65, 1.21, 1.77]
// 真书放大了一圈：书脊宽 0.16、高 0.47，贴图上去的字在书架特写里能读
const REAL_W = 0.16
const REAL_H = 0.47
const REAL_D = 0.5
const GAP = 0.014
/** 每层从 books 数组里取哪几本 */
const LAYOUT = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7],
  [8, 9],
]
/** 每层真书的起始 x，给陈列物腾出位置，不再和望远镜抢同一块地方 */
const BOOK_X = [-0.52, -1.02, -0.62, -0.86]
/** 每层给陈列物让出的空档 [from, to] */
const RESERVED: ([number, number] | null)[] = [null, [0.36, 0.9], [-0.3, 0.72], [-0.1, 0.28]]

interface FillerSpec {
  x: number
  w: number
  h: number
  y: number
  color: string
  tilt: number
  depth: number
}

/** 一本真书：书脊贴图由 title 现场绘制，点开是阅读面板 */
function RealBook({ book, position }: { book: Book; position: [number, number, number] }) {
  const setBook = useRoom((s) => s.setBook)
  const [hot, setHot] = useState(false)
  const group = useRef<THREE.Group>(null)
  const tex = useMemo(() => spineTexture(book), [book])

  useFrame((_, delta) => {
    if (!group.current) return
    // 悬停时整本书向外抽出，不只是往前挤两厘米——书脊要离开书架的阴影
    group.current.position.z = damp(
      group.current.position.z,
      hot ? 0.19 : 0.1,
      9,
      Math.min(delta, 0.05),
    )
  })

  return (
    <group ref={group} position={position}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          setHot(true)
        }}
        onPointerOut={() => setHot(false)}
        onClick={(e) => {
          e.stopPropagation()
          if (pointerState.moved > 5) return
          setBook(book.id)
        }}
      >
        <boxGeometry args={[REAL_W, REAL_H, REAL_D]} />
        <meshStandardMaterial color={book.color} roughness={0.86} />
      </mesh>

      {/* 书脊：正面贴一层带字的纸 */}
      <mesh position={[0, 0, REAL_D / 2 + 0.002]}>
        <planeGeometry args={[REAL_W - 0.006, REAL_H - 0.006]} />
        <meshStandardMaterial
          map={tex}
          emissive="#ffe9c4"
          emissiveMap={tex}
          emissiveIntensity={hot ? 0.62 : 0.07}
          roughness={0.9}
        />
      </mesh>

      {hot && (
        <Html
          position={[0, REAL_H / 2 + 0.12, 0]}
          center
          zIndexRange={[24, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="whitespace-nowrap rounded-sm border px-3 py-1.5"
            style={{
              borderColor: 'rgba(255,180,120,0.4)',
              background: 'rgba(10,10,12,0.82)',
              color: '#f0e6d4',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span className="text-[12px] tracking-[0.08em]">{book.title}</span>
            <span className="ml-2 text-[10px] tracking-[0.06em] opacity-65">{book.author}</span>
          </div>
        </Html>
      )}
    </group>
  )
}

/** 古董望远镜：三节铜筒 + 日晷底座 */
function Telescope({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.5, 0.06]}>
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.024, 16]} />
        <meshStandardMaterial color="#2b2118" roughness={0.6} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.008, 0.012, 0.08, 8]} />
        <meshStandardMaterial color="#b08a55" roughness={0.3} metalness={0.85} />
      </mesh>
      <group position={[0, 0.12, 0]} rotation={[0.5, 0, 0]}>
        <mesh position={[0, 0, 0.07]}>
          <cylinderGeometry args={[0.042, 0.048, 0.16, 18]} />
          <meshStandardMaterial color="#8a6a42" roughness={0.34} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0, 0.17]}>
          <cylinderGeometry args={[0.032, 0.04, 0.1, 18]} />
          <meshStandardMaterial color="#a57c4a" roughness={0.3} metalness={0.88} />
        </mesh>
        <mesh position={[0, 0, 0.225]}>
          <cylinderGeometry args={[0.036, 0.036, 0.014, 18]} />
          <meshStandardMaterial color="#1b1712" roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

/** 小音箱：箱体 + 喇叭单元 + 网罩 */
function Speaker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -0.22, 0]}>
      <RoundedBox args={[0.2, 0.3, 0.16]} radius={0.012} smoothness={2} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#262a30" roughness={0.72} metalness={0.12} />
      </RoundedBox>
      {[0.1, 0.22].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0.081]}>
            <cylinderGeometry args={[i ? 0.042 : 0.058, i ? 0.042 : 0.058, 0.006, 24]} />
            <meshStandardMaterial color="#14181d" roughness={0.5} />
          </mesh>
          <mesh position={[0, y, 0.086]}>
            <circleGeometry args={[i ? 0.03 : 0.042, 24]} />
            <meshStandardMaterial color="#3a4048" roughness={0.55} metalness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.045, 0.082]}>
        <circleGeometry args={[0.01, 12]} />
        <meshBasicMaterial color={C.mint} />
      </mesh>
    </group>
  )
}

/** 书架正面朝局部 +Z，整体绕 Y 转 90° 后朝向房间内 */
export default function Shelf() {
  const wood = useMemo(() => woodTexture([2, 2]), [])
  const woodFine = useMemo(() => woodTexture([4, 4]), [])

  // 填充书：真书之间的空位，用随机宽度凑满，保持书架密度
  const filler = useMemo<FillerSpec[]>(() => {
    let seed = 20261023
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }

    const out: FillerSpec[] = []
    ROW_Y.forEach((base, row) => {
      const start = BOOK_X[row] + LAYOUT[row].length * (REAL_W + GAP) + 0.03
      const skip = RESERVED[row]

      let x = start
      while (x < 1.02) {
        const w = 0.048 + rand() * 0.052
        if (x + w > 1.04) break
        if (!(skip && x > skip[0] && x < skip[1])) {
          const h = 0.27 + rand() * 0.13
          out.push({
            x: x + w / 2,
            w,
            h,
            y: base,
            color: BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)],
            tilt: rand() > 0.9 ? (rand() - 0.5) * 0.14 : 0,
            depth: 0.48 + rand() * 0.1,
          })
        }
        x += w + 0.007
      }
    })
    return out
  }, [])

  return (
    <group position={[-4.52, 0, -2.7]} rotation={[0, Math.PI / 2, 0]}>
      <Station
        id="about"
        hitbox={[2.34, 2.8, 0.34]}
        hitboxPosition={[0, 1.36, -0.22]}
        ring={[0, 0.02, 0.34]}
        ringSize={1.15}
      >
        {/* 背板：分三段，竖缝让后面不是一整块板 */}
        {[-0.74, 0, 0.74].map((x, i) => (
          <mesh key={i} position={[x, 1.31, -0.39]}>
            <boxGeometry args={[0.72, 2.56, 0.028]} />
            <meshStandardMaterial map={woodFine} color={C.woodDark} roughness={0.92} />
          </mesh>
        ))}

        {/* 侧板：倒角 + 木纹 */}
        {[-1.07, 1.07].map((x, i) => (
          <RoundedBox key={i} args={[0.06, 2.6, 0.82]} radius={0.006} smoothness={2} position={[x, 1.3, 0]}>
            <meshStandardMaterial map={wood} color={C.wood} roughness={0.7} />
          </RoundedBox>
        ))}

        {/* 顶板 / 底板 / 隔板 + 前沿深色封边 */}
        {[0.03, 0.62, 1.18, 1.74, 2.57].map((y, i) => (
          <group key={i}>
            <RoundedBox args={[2.2, 0.06, 0.82]} radius={0.006} smoothness={2} position={[0, y, 0]}>
              <meshStandardMaterial map={wood} color={C.wood} roughness={0.7} />
            </RoundedBox>
            <mesh position={[0, y, 0.408]}>
              <boxGeometry args={[2.2, 0.03, 0.024]} />
              <meshStandardMaterial map={woodFine} color={C.woodDark} roughness={0.62} />
            </mesh>
          </group>
        ))}

        {/* 顶部线脚：书架有个收头，不然像立在墙边的一个箱子 */}
        <mesh position={[0, 2.615, 0.02]}>
          <boxGeometry args={[2.3, 0.03, 0.86]} />
          <meshStandardMaterial map={woodFine} color={C.woodLight} roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.585, 0.435]}>
          <boxGeometry args={[2.3, 0.036, 0.03]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.55} />
        </mesh>
        {/* 底部踢脚内收 */}
        <mesh position={[0, 0.015, 0.38]}>
          <boxGeometry args={[2.16, 0.05, 0.04]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.7} />
        </mesh>

        {/* 每一层最里面一道阴影，增加纵深 */}
        {ROW_Y.map((y, i) => (
          <mesh key={`s${i}`} position={[0, y + 0.2, -0.33]}>
            <planeGeometry args={[2.06, 0.42]} />
            <meshBasicMaterial color="#0d0e12" transparent opacity={0.5} />
          </mesh>
        ))}

        {/* 真书 */}
        {LAYOUT.map((ids, row) =>
          ids.map((idx, i) => {
            const book = books[idx % books.length]
            return (
              <RealBook
                key={book.id}
                book={book}
                position={[
                  BOOK_X[row] + i * (REAL_W + GAP) + REAL_W / 2,
                  ROW_Y[row] + REAL_H / 2,
                  0.1,
                ]}
              />
            )
          }),
        )}

        {/* 填充书 */}
        {filler.map((b, i) => (
          <mesh
            key={i}
            position={[b.x, b.y + b.h / 2, 0.02]}
            rotation={[0, 0, b.tilt]}
          >
            <boxGeometry args={[b.w, b.h, b.depth]} />
            <meshStandardMaterial color={b.color} roughness={0.86} />
          </mesh>
        ))}

        {/* 书架射灯：书脊原本埋在层板的阴影里，一盏贴身的光比调高环境光有效得多 */}
        <pointLight position={[0.1, 2.4, 1.05]} intensity={2.1} distance={4} decay={2} color="#ffd7ab" />

        {/* ---- 陈列物 ---- */}
        {/* 第一层左端：望远镜 */}
        <Telescope position={[-0.88, 0.09, 0.02]} />
        {/* 第二层空档：小音箱 + 它的线 */}
        <Speaker position={[0.6, 0.65, 0.0]} />
        <Cable
          points={[
            [0.6, 0.7, -0.08],
            [0.78, 0.66, -0.16],
            [0.98, 0.5, -0.2],
          ]}
          radius={0.004}
          color="#15181d"
        />
        {/* 第三层：相框 + 小绿植 */}
        <group position={[0.46, 1.21, -0.06]} rotation={[0, 0.14, 0]}>
          <mesh>
            <boxGeometry args={[0.44, 0.56, 0.03]} />
            <meshStandardMaterial color="#2a221b" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.38, 0.5]} />
            <meshStandardMaterial color="#6b5540" roughness={0.95} />
          </mesh>
          <mesh position={[0.02, 0.04, 0.02]}>
            <circleGeometry args={[0.13, 24]} />
            <meshBasicMaterial color="#e09a63" />
          </mesh>
          <mesh position={[-0.06, -0.14, 0.02]}>
            <planeGeometry args={[0.3, 0.12]} />
            <meshBasicMaterial color="#3a2c22" />
          </mesh>
        </group>
        <PlantPot position={[-0.05, 1.21, 0.02]} scale={0.62} />
        {/* 第四层：一只小座钟 */}
        <group position={[0.08, 1.77, 0.0]} rotation={[0, 0.3, 0]}>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.14, 0.04, 0.1]} />
            <meshStandardMaterial color="#3a2c22" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.11, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.028, 24]} />
            <meshStandardMaterial color="#3a2c22" roughness={0.5} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.11, 0.016]}>
            <circleGeometry args={[0.062, 24]} />
            <meshStandardMaterial color="#e4dccb" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.128, 0.019]}>
            <boxGeometry args={[0.005, 0.04, 0.002]} />
            <meshBasicMaterial color="#26201a" />
          </mesh>
          <mesh position={[0.014, 0.11, 0.019]}>
            <boxGeometry args={[0.028, 0.005, 0.002]} />
            <meshBasicMaterial color="#26201a" />
          </mesh>
        </group>

        {/* 顶部的陶罐 */}
        <mesh position={[-0.62, 2.72, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 0.26, 20]} />
          <meshStandardMaterial color="#5b4a3c" roughness={0.88} />
        </mesh>
        <mesh position={[-0.62, 2.87, 0]}>
          <torusGeometry args={[0.09, 0.016, 8, 20]} />
          <meshStandardMaterial color="#5b4a3c" roughness={0.8} />
        </mesh>

        {/* 顶部的小书堆 */}
        <RoundedBox args={[0.46, 0.05, 0.3]} radius={0.008} position={[0.55, 2.645, 0]} rotation={[0, 0.2, 0]}>
          <meshStandardMaterial color="#7c5a48" roughness={0.9} />
        </RoundedBox>
        <RoundedBox args={[0.4, 0.045, 0.27]} radius={0.008} position={[0.58, 2.695, 0.02]} rotation={[0, -0.1, 0]}>
          <meshStandardMaterial color="#46565a" roughness={0.9} />
        </RoundedBox>

        {/* 侧板上的螺钉：板式家具的连接件 */}
        {[0.09, 0.65, 1.21, 1.77].map((y, i) => (
          <Screw key={i} position={[1.07, y + 0.3, 0.4]} size={0.007} color={C.metal} />
        ))}
      </Station>
    </group>
  )
}
