import { useEffect, useRef, useState } from 'react'
import { site } from '../content/site'
import { useRoom } from '../lib/store'

const STEPS = ['载入几何体', '布置家具', '接上电路', '点亮台灯', '校准取景框']

/** 最短展示，避免一闪而过；最长兜底，避免永远卡住 */
const MIN_MS = 720
const MAX_MS = 8000

export default function Boot() {
  const booted = useRoom((s) => s.booted)
  const sceneReady = useRoom((s) => s.sceneReady)
  const setBooted = useRoom((s) => s.setBooted)
  const [minElapsed, setMinElapsed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [gone, setGone] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const ready = sceneReady && minElapsed

  // 淡出用 CSS 过渡而不是动画库：rAF 被暂停（后台标签页）时也能走完，不会永远盖住 HUD
  useEffect(() => {
    if (!booted) return
    const id = window.setTimeout(() => setGone(true), 900)
    return () => window.clearTimeout(id)
  }, [booted])

  // 进度条交给 CSS transform，主线程卡顿时也能平滑前进
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      barRef.current?.style.setProperty('--boot', '0.92'),
    )
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (ready) barRef.current?.style.setProperty('--boot', '1')
  }, [ready])

  useEffect(() => {
    const id = window.setTimeout(() => setMinElapsed(true), MIN_MS)
    return () => window.clearTimeout(id)
  }, [])

  // 后台标签页里定时器会被重度节流，切回前台时不再等这段最短时长
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') setMinElapsed(true)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  // 场景没真的画出第一帧之前，进度最多停在 92%
  useEffect(() => {
    if (booted || sceneReady) return
    let raf = 0
    const start = performance.now()
    const tick = () => {
      const t = (performance.now() - start) / 1000
      setProgress(Math.min(0.92, (1 - Math.exp(-t / 0.55)) * 0.96))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [booted, sceneReady])

  useEffect(() => {
    if (booted || !sceneReady || !minElapsed) return
    setProgress(1)
    const id = window.setTimeout(() => setBooted(true), 340)
    return () => window.clearTimeout(id)
  }, [booted, sceneReady, minElapsed, setBooted])

  useEffect(() => {
    if (booted) return
    const id = window.setTimeout(() => setBooted(true), MAX_MS)
    return () => window.clearTimeout(id)
  }, [booted, setBooted])

  const pct = Math.round(progress * 100)
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length))]
  if (gone) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-ink p-6 md:p-10"
      aria-hidden={booted}
      style={{
        opacity: booted ? 0 : 1,
        pointerEvents: booted ? 'none' : 'auto',
        transition: 'opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity',
      }}
    >
          <div className="flex items-start justify-between">
            <p className="font-mono text-[10px] tracking-[0.34em] text-paper/45">ROOM 01 / BOOT</p>
            <p className="font-mono text-[10px] tracking-[0.24em] text-paper/30">v1.0</p>
          </div>

          <div className="mx-auto w-full max-w-[420px]">
            <p className="text-[11px] tracking-[0.3em] text-paper/40">{site.tagline}</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-[13px] tracking-[0.16em] text-paper/70">
                {sceneReady ? '就绪' : step}
              </span>
              <span className="font-mono text-[32px] leading-none tracking-tight text-paper/90">
                {String(pct).padStart(3, '0')}
                <span className="text-[13px] text-paper/35">%</span>
              </span>
            </div>
            <div className="relative mt-4 h-[2px] w-full overflow-hidden bg-paper/10">
              <div
                ref={barRef}
                className={
                  'absolute inset-y-0 left-0 w-full bg-ember ' +
                  (ready ? 'boot-bar boot-bar-done' : 'boot-bar')
                }
              />
            </div>
            <div className="mt-3 flex justify-between font-mono text-[9px] tracking-[0.18em] text-paper/30">
              <span>ISOMETRIC STUDIO</span>
              <span>{sceneReady ? 'READY' : 'WEBGL'}</span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <p className="max-w-[240px] text-[10px] leading-relaxed tracking-[0.08em] text-paper/30">
              正在把一间房间搬进浏览器，请稍候。
            </p>
            <span className="font-mono text-[9px] tracking-[0.2em] text-paper/25">©2026</span>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-ember/[0.07] to-transparent boot-sweep" />
    </div>
  )
}
