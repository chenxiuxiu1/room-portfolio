import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './scene/Scene'
import Hud from './ui/Hud'
import Boot from './ui/Boot'
import Cursor from './ui/Cursor'
import SectionPanel from './ui/SectionPanel'
import BookPanel from './ui/BookPanel'
import StaticFallback from './ui/StaticFallback'
import ErrorBoundary from './ui/ErrorBoundary'
import HintToast from './ui/HintToast'
import SrContent from './ui/SrContent'
import { useRoom } from './lib/store'
import { pointerState } from './lib/pointer'
import { detectWebGL } from './lib/webgl'
import { stations } from './content/site'

export default function App() {
  // 没有 WebGL 就不要给用户看一片黑
  const [fallback, setFallback] = useState<'webgl' | 'error' | null>(() =>
    detectWebGL() ? null : 'webgl',
  )
  const active = useRoom((s) => s.active)
  const book = useRoom((s) => s.book)

  // 浏览器前进/后退时同步面板
  useEffect(() => {
    const onPop = () => useRoom.getState().syncFromUrl()
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const s = useRoom.getState()
        if (s.book) s.setBook(null)
        else if (s.space) s.setSpace(false)
        else s.setActive(null)
        return
      }
      const n = Number(e.key)
      if (n >= 1 && n <= stations.length) {
        const target = stations[n - 1]
        const cur = useRoom.getState().active
        useRoom.getState().setActive(cur === target.id ? null : target.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (fallback) {
    return (
      <div className="grain relative h-full w-full overflow-hidden bg-ink">
        <StaticFallback reason={fallback} />
      </div>
    )
  }

  return (
    <div className="grain relative h-full w-full overflow-hidden bg-ink">
      <div aria-hidden={active || book ? true : undefined} className="absolute inset-0">
        <ErrorBoundary fallback={<StaticFallback reason="error" />}>
          <Canvas
            dpr={[1, 2]}
            gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
            camera={{ position: [11.3, 9.5, 11.3], fov: 33, near: 0.1, far: 260 }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener(
                'webglcontextlost',
                (event) => {
                  event.preventDefault()
                  setFallback('webgl')
                },
                { once: true },
              )
            }}
            onPointerMissed={() => {
              // 拖拽环视结束时不要误关面板
              if (pointerState.moved > 9) return
              const s = useRoom.getState()
              if (s.book) s.setBook(null)
              s.setActive(null)
            }}
          >
            <Scene />
          </Canvas>
        </ErrorBoundary>
      </div>

      <Hud />
      <SectionPanel />
      <BookPanel />
      <HintToast />
      <Cursor />
      <Boot />
      <SrContent />
    </div>
  )
}
