import { useEffect, useRef } from 'react'
import { stations } from '../content/site'
import { useRoom } from '../lib/store'

/**
 * 自绘光标：十字准星。
 * 中心一个菱形标记，四条刻线常驻；悬停可交互物件时刻线向外张开成取景框，
 * 右侧出现物件名。不用圆环 —— 实心圆压在深色木作上像蒙了层玻璃，把画面拖脏。
 */
export default function Cursor() {
  const body = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const hovered = useRoom((s) => s.hovered)
  const active = useRoom((s) => s.active)
  const text = hovered ? stations.find((s) => s.id === hovered)?.cn : null

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    // 只有自绘光标真的跑起来了，才隐藏系统光标
    document.documentElement.classList.add('cursor-ready')
    let mx = -200
    let my = -200
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      // 直接写 transform，不经过 React 状态，指针事件再密也不掉帧
      if (body.current) {
        body.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`
      }
      if (label.current) {
        label.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`
      }
    }
    const onDown = () => document.documentElement.style.setProperty('--press', '0.7')
    const onUp = () => document.documentElement.style.setProperty('--press', '1')
    const onLeave = () => {
      if (body.current) body.current.style.opacity = '0'
      if (label.current) label.current.style.opacity = '0'
    }
    const onEnter = () => {
      if (body.current) body.current.style.opacity = '1'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.documentElement.addEventListener('pointerenter', onEnter)

    // 初始位置补一次，避免鼠标没动过光标停在左上角
    raf = requestAnimationFrame(() => {
      if (body.current) body.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`
    })

    return () => {
      document.documentElement.classList.remove('cursor-ready')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.documentElement.removeEventListener('pointerenter', onEnter)
      cancelAnimationFrame(raf)
    }
  }, [])

  const hot = Boolean(text) && !active

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden md:block">
      <div ref={body} className="crosshair absolute left-0 top-0 will-change-transform" data-hot={hot ? '1' : '0'}>
        <div className="crosshair-inner">
          <span className="crosshair-dot" />
          <span className="crosshair-arm crosshair-arm-t" />
          <span className="crosshair-arm crosshair-arm-r" />
          <span className="crosshair-arm crosshair-arm-b" />
          <span className="crosshair-arm crosshair-arm-l" />
        </div>
      </div>

      <div ref={label} className="absolute left-0 top-0 will-change-transform">
        <div className="crosshair-label" data-show={hot ? '1' : '0'}>
          <span className="crosshair-label-rule" />
          <span className="crosshair-label-text">{text ?? ''}</span>
        </div>
      </div>
    </div>
  )
}
