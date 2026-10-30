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
  const cardRef = useRef<HTMLDivElement>(null)
  const prevFocus = useRef<HTMLElement | null>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (station) {
      if (wasOpen.current) return
      wasOpen.current = true
      prevFocus.current = document.activeElement as HTMLElement | null
      const id = window.setTimeout(() => closeRef.current?.focus(), 160)
      // 锁住 body 滚动，防止面板滚到底后背景跟着动
      document.body.style.overflow = 'hidden'
      return () => window.clearTimeout(id)
    }

    if (!wasOpen.current) return
    wasOpen.current = false
    document.body.style.overflow = ''
    const target = prevFocus.current
    const id = window.setTimeout(() => target?.focus?.(), 120)
    return () => window.clearTimeout(id)
  }, [station])

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
        <>
          {/* 桌面端：居中卡片覆盖层；移动端：全屏底部面板 */}
          {mobile ? (
            <motion.aside
              key="panel"
              id="section-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="panel-title"
              onKeyDown={trap}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.6, ease: EASE }}
              className="fixed inset-0 z-40 flex flex-col bg-ink"
            >
              <div className="flex justify-center pt-2.5">
                <span className="h-[3px] w-9 rounded-full bg-paper/20" />
              </div>

              <header className="flex shrink-0 items-start justify-between border-b border-paper/8 px-6 pb-5 pt-4">
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
                className="thin-scroll flex-1 overflow-y-auto overscroll-contain px-6 pb-12 pt-7"
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

              <footer className="flex shrink-0 items-center justify-between border-t border-paper/8 px-6 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3.5">
                <span className="font-mono text-[10px] tracking-[0.12em] text-paper/55">{site.email}</span>
                <span className="font-mono text-[10px] tracking-[0.12em] text-paper/45">下滑关闭</span>
              </footer>
            </motion.aside>
          ) : (
            <>
              {/* 桌面遮罩：点击背景关闭 + 轻微压暗 */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm"
                onClick={() => setActive(null)}
              />

              {/* 居中卡片 */}
              <motion.aside
                key="panel"
                id="section-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="panel-title"
                onKeyDown={trap}
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="fixed inset-0 z-40 flex items-center justify-center p-8"
              >
                <div
                  ref={cardRef}
                  className="flex max-h-[85vh] w-full max-w-[640px] flex-col rounded-2xl border border-paper/10 bg-ink/90 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <header className="flex shrink-0 items-start justify-between border-b border-paper/8 px-8 pb-5 pt-7">
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
                    className="thin-scroll flex-1 overflow-y-auto overscroll-contain px-8 pb-10 pt-7"
                  >
                    <motion.div
                      key={station.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
                    >
                      <PanelBody id={station.id} />
                    </motion.div>
                  </div>

                  <footer className="flex shrink-0 items-center justify-between border-t border-paper/8 px-8 pb-5 pt-3.5">
                    <span className="font-mono text-[10px] tracking-[0.12em] text-paper/55">{site.email}</span>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-paper/45">ESC 关闭</span>
                  </footer>
                </div>
              </motion.aside>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  )
}