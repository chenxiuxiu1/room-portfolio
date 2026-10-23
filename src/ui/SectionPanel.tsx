import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { site, stations } from '../content/site'
import { useRoom } from '../lib/store'
import { useMobile } from '../lib/useMobile'
import { AboutPanel, ContactPanel, SkillsPanel, WorksPanel } from './Panels'

const EASE = [0.16, 1, 0.3, 1] as const

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, textarea, select'

function PanelBody({ id }: { id: string }) {
  if (id === 'works') return <WorksPanel />
  if (id === 'about') return <AboutPanel />
  if (id === 'skills') return <SkillsPanel />
  return <ContactPanel />
}

export default function SectionPanel() {
  const active = useRoom((s) => s.active)
  const setActive = useRoom((s) => s.setActive)
  const booted = useRoom((s) => s.booted)
  const mobile = useMobile()
  const station = active ? stations.find((s) => s.id === active) : null

  const closeRef = useRef<HTMLButtonElement>(null)
  const prevFocus = useRef<HTMLElement | null>(null)
  const wasOpen = useRef(false)

  // 打开时把焦点移进面板，关闭后还给触发它的按钮
  useEffect(() => {
    if (station) {
      if (wasOpen.current) return
      wasOpen.current = true
      prevFocus.current = document.activeElement as HTMLElement | null
      const id = window.setTimeout(() => closeRef.current?.focus(), 160)
      return () => window.clearTimeout(id)
    }

    if (!wasOpen.current) return
    wasOpen.current = false
    const target = prevFocus.current
    const id = window.setTimeout(() => target?.focus?.(), 120)
    return () => window.clearTimeout(id)
  }, [station])

  // Tab 在面板内循环，不要漏到背后的 HUD 上
  const trap = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const root = document.getElementById('section-panel')
    if (!root) return
    const list = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    )
    if (!list.length) return

    const first = list[0]
    const last = list[list.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <AnimatePresence>
      {station && booted && (
        <motion.aside
          key="panel"
          id="section-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="panel-title"
          onKeyDown={trap}
          initial={mobile ? { y: '100%' } : { x: '104%' }}
          animate={mobile ? { y: 0 } : { x: 0 }}
          exit={mobile ? { y: '100%' } : { x: '104%' }}
          transition={{ duration: 0.85, ease: EASE }}
          className={
            mobile
              ? 'fixed inset-x-0 bottom-0 z-40 flex h-[79dvh] flex-col rounded-t-[18px] border-t border-paper/12 bg-ink/90 backdrop-blur-2xl'
              : 'fixed right-0 top-0 z-40 flex h-full w-[min(536px,45vw)] flex-col border-l border-paper/10 bg-ink/80 backdrop-blur-2xl'
          }
        >
          {mobile && (
            <div className="flex justify-center pt-2.5">
              <span className="h-[3px] w-9 rounded-full bg-paper/20" />
            </div>
          )}

          <header className="flex shrink-0 items-start justify-between border-b border-paper/8 px-6 pb-5 pt-5 md:px-8 md:pt-7">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-ember/75">
                {station.code} — {station.label}
              </p>
              <h2
                id="panel-title"
                className="mt-2.5 text-[24px] font-medium tracking-[0.04em] text-paper/95"
              >
                {station.cn}
              </h2>
              <p className="mt-1.5 text-[10px] tracking-[0.16em] text-paper/40">{station.hint}</p>
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={() => setActive(null)}
              aria-label="关闭面板"
              className="group relative mt-1 h-9 w-9 shrink-0 rounded-full border border-paper/12 transition-colors duration-500 hover:border-ember/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/60"
            >
              <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-paper/50 transition-colors duration-500 group-hover:bg-ember" />
              <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-paper/50 transition-colors duration-500 group-hover:bg-ember" />
            </button>
          </header>

          <div
            id="panel-scroll"
            className="thin-scroll flex-1 overflow-y-auto overscroll-contain px-6 pb-12 pt-7 md:px-8"
          >
            <motion.div
              key={station.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            >
              <PanelBody id={station.id} />
            </motion.div>
          </div>

          <footer className="flex shrink-0 items-center justify-between border-t border-paper/8 px-6 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3.5 md:px-8">
            <span className="font-mono text-[10px] tracking-[0.12em] text-paper/55">{site.email}</span>
            <span className="font-mono text-[10px] tracking-[0.12em] text-paper/45">ESC 关闭</span>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
