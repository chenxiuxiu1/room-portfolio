import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Station from './Station'
import { useRoom } from '../lib/store'
import { damp } from '../lib/camera'

/** 用 canvas 画一张抽象海报，避免引入任何图片资源 */
function usePosterTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 560
    canvas.height = 760
    const ctx = canvas.getContext('2d')!
    if (!ctx) return null

    ctx.fillStyle = '#101218'
    ctx.fillRect(0, 0, 560, 760)

    // 细网格
    ctx.strokeStyle = 'rgba(255,255,255,0.035)'
    ctx.lineWidth = 1
    for (let x = 0; x <= 560; x += 28) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 760)
      ctx.stroke()
    }
    for (let y = 0; y <= 760; y += 28) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(560, y)
      ctx.stroke()
    }

    // 主圆
    const g = ctx.createLinearGradient(120, 160, 430, 470)
    g.addColorStop(0, '#ffb07c')
    g.addColorStop(0.55, '#ff8a5b')
    g.addColorStop(1, '#b8462a')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(288, 318, 172, 0, Math.PI * 2)
    ctx.fill()

    // 月食式挖空
    ctx.fillStyle = '#101218'
    ctx.beginPath()
    ctx.arc(228, 268, 148, 0, Math.PI * 2)
    ctx.fill()

    // 细线
    ctx.strokeStyle = 'rgba(233,229,221,0.55)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(64, 560)
    ctx.lineTo(496, 560)
    ctx.stroke()

    // 文字
    ctx.fillStyle = 'rgba(233,229,221,0.5)'
    ctx.font = '500 17px "JetBrains Mono", monospace'
    ctx.letterSpacing = '6px'
    ctx.fillText('SKILLS / 03', 64, 78)

    ctx.fillStyle = '#e9e5dd'
    ctx.font = '600 44px "Space Grotesk", sans-serif'
    ctx.letterSpacing = '1px'
    ctx.fillText('FORM', 64, 622)
    ctx.fillText('FOLLOWS', 64, 674)
    ctx.fillText('FEELING', 64, 726)

    ctx.fillStyle = 'rgba(233,229,221,0.4)'
    ctx.font = '400 14px "JetBrains Mono", monospace'
    ctx.letterSpacing = '4px'
    ctx.fillText('ROOM 01 — 2026', 64, 100)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [])
}

export default function Skills() {
  const tex = usePosterTexture()
  const hot = useRoom((s) => s.hovered === 'skills' || s.active === 'skills')
  const posterMat = useRef<THREE.MeshStandardMaterial>(null)
  const halo = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    if (posterMat.current) {
      posterMat.current.emissiveIntensity = damp(posterMat.current.emissiveIntensity, hot ? 0.55 : 0.12, 5, dt)
    }
    if (halo.current) {
      halo.current.opacity = damp(halo.current.opacity, hot ? 0.16 : 0.04, 4, dt)
    }
  })

  return (
    <group position={[-4.86, 2.02, 2.62]} rotation={[0, Math.PI / 2, 0]}>
      <Station id="skills" hitbox={[1.5, 2.0, 0.5]} hitboxPosition={[0, 0, 0.18]} ring={[0, -1.98, 0.3]} ringSize={0.9}>
        {/* 背光 */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[1.6, 2.0]} />
          <meshBasicMaterial ref={halo} color="#ff8a5b" transparent opacity={0.04} depthWrite={false} />
        </mesh>

        {/* 画框 */}
        <mesh position={[0, 0, 0.015]}>
          <boxGeometry args={[1.3, 1.72, 0.03]} />
          <meshStandardMaterial color="#191b21" roughness={0.55} metalness={0.3} />
        </mesh>

        {/* 画面 */}
        <mesh position={[0, 0, 0.034]}>
          <planeGeometry args={[1.18, 1.6]} />
          <meshStandardMaterial
            ref={posterMat}
            map={tex ?? undefined}
            emissiveMap={tex ?? undefined}
            emissive="#ffffff"
            emissiveIntensity={0.12}
            roughness={0.8}
          />
        </mesh>

        {/* 下方的小铭牌 */}
        <mesh position={[0.44, -0.78, 0.045]}>
          <boxGeometry args={[0.34, 0.06, 0.01]} />
          <meshStandardMaterial color="#8a8172" roughness={0.5} metalness={0.4} />
        </mesh>
      </Station>
    </group>
  )
}
