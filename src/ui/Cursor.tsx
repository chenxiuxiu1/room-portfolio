import { useEffect, useRef } from 'react'
import { stations } from '../content/site'
import { useRoom } from '../lib/store'

/** 自绘光标：小点瞬时跟随、外环惯性跟随，悬停可交互物件时张开 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const hovered = useRoom((s) => s.hovered)
  const active = useRoom((s) => s.active)
  const label = hovered ? stations.find((s) => s.id === hovered)?.cn : null

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    // 只有自绘光标真的跑起来了，才隐藏系统光标
    document.documentElement.classList.add('cursor-ready')
    let mx = -200
    let my = -200
    let rx = -200
    let ry = -200
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
    }
    const onDown = () => {
      if (ring.current) ring.current.style.setProperty('--press', '0.82')
    }
    const onUp = () => {
      if (ring.current) ring.current.style.setProperty('--press', '1')
    }
    const loop = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    raf = requestAnimationFrame(loop)
    return () => {
      document.documentElement.classList.remove('cursor-ready')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden md:block">
      <div ref={dot} className="absolute left-0 top-0 h-[5px] w-[5px] rounded-full bg-paper/90 mix-blend-difference" />
      <div ref={ring} className="absolute left-0 top-0">
        <div
          className="flex items-center justify-center rounded-full border transition-[width,height,border-color,background-color] duration-500 ease-expo"
          style={{
            width: label ? 62 : 30,
            height: label ? 62 : 30,
            marginLeft: label ? -31 : -15,
            marginTop: label ? -31 : -15,
            borderColor: label ? 'rgba(255,138,91,0.85)' : 'rgba(233,229,221,0.32)',
            backgroundColor: label ? 'rgba(255,138,91,0.08)' : 'transparent',
            transform: 'scale(var(--press, 1))',
          }}
        >
          <span
            className="font-mono text-[9px] tracking-[0.12em] text-ember transition-opacity duration-300"
            style={{ opacity: label && !active ? 1 : 0 }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}
