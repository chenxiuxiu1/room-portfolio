import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox, Html } from '@react-three/drei'
import Station from './Station'
import { BOOK_COLORS, C } from './materials'
import { books } from '../content/site'
import type { Book } from '../types'
import { spineTexture } from '../lib/spine'
import { useRoom } from '../lib/store'
import { pointerState } from '../lib/pointer'
import { damp } from '../lib/camera'

/** 四层的书底高度，与层板对齐 */
const ROW_Y = [0.09, 0.65, 1.21, 1.77]
const REAL_W = 0.112
const REAL_H = 0.4
const REAL_D = 0.52
const GAP = 0.016
/** 每层从 books 数组里取哪几本 */
const LAYOUT = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7],
  [8, 9],
]

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
    group.current.position.z = damp(
      group.current.position.z,
      hot ? 0.034 : 0,
      10,
      Math.min(delta, 0.05),
    )
  })

  return (
    <group ref={group} position={position}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          setHot(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHot(false)
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (pointerState.moved > 9) return
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
          emissiveIntensity={hot ? 0.34 : 0}
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
            className="whitespace-nowrap rounded-sm border px-2.5 py-1 text-[10px] tracking-[0.14em]"
            style={{
              borderColor: 'rgba(255,180,120,0.4)',
              background: 'rgba(10,10,12,0.8)',
              color: '#f0e6d4',
              backdropFilter: 'blur(6px)',
            }}
          >
            {book.title} · {book.author}
          </div>
        </Html>
      )}
    </group>
  )
}

/** 书架正面朝局部 +Z，整体绕 Y 转 90° 后朝向房间内 */
export default function Shelf() {
  // 填充书：真书之间的空位，用随机宽度凑满，保持书架密度
  const filler = useMemo<FillerSpec[]>(() => {
    let seed = 20261023
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }

    const out: FillerSpec[] = []
    ROW_Y.forEach((base, row) => {
      const start = -1.02 + LAYOUT[row].length * (REAL_W + GAP) + 0.035
      // 第三层给相框让位，第二层留一段空
      const skipFrom = row === 2 ? -0.12 : row === 1 ? 0.36 : 99
      const skipTo = row === 2 ? 0.42 : row === 1 ? 0.9 : 99

      let x = start
      while (x < 1.02) {
        const w = 0.048 + rand() * 0.052
        if (x + w > 1.04) break
        if (!(x > skipFrom && x < skipTo)) {
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
        {/* 背板 */}
        <mesh position={[0, 1.3, -0.39]}>
          <boxGeometry args={[2.2, 2.6, 0.03]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.92} />
        </mesh>

        {/* 侧板 */}
        {[-1.07, 1.07].map((x, i) => (
          <mesh key={i} position={[x, 1.3, 0]}>
            <boxGeometry args={[0.06, 2.6, 0.82]} />
            <meshStandardMaterial color={C.wood} roughness={0.74} />
          </mesh>
        ))}

        {/* 顶板 / 底板 / 隔板 */}
        {[0.03, 0.62, 1.18, 1.74, 2.57].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <boxGeometry args={[2.2, 0.06, 0.82]} />
            <meshStandardMaterial color={C.wood} roughness={0.74} />
          </mesh>
        ))}

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
                  -1.02 + i * (REAL_W + GAP) + REAL_W / 2,
                  ROW_Y[row] + REAL_H / 2,
                  0.04,
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

        {/* 层板上的相框 */}
        <group position={[0.16, 1.21, -0.06]} rotation={[0, 0.14, 0]}>
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
        <RoundedBox args={[0.46, 0.05, 0.3]} radius={0.008} position={[0.55, 2.62, 0]} rotation={[0, 0.2, 0]}>
          <meshStandardMaterial color="#7c5a48" roughness={0.9} />
        </RoundedBox>
        <RoundedBox args={[0.4, 0.045, 0.27]} radius={0.008} position={[0.58, 2.67, 0.02]} rotation={[0, -0.1, 0]}>
          <meshStandardMaterial color="#46565a" roughness={0.9} />
        </RoundedBox>
      </Station>
    </group>
  )
}
