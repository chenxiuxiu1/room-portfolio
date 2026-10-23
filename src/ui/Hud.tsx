import { useEffect, useState } from 'react'
import { navHint, site, stations } from '../content/site'
import { useRoom } from '../lib/store'

export default function Hud() {
  const active = useRoom((s) => s.active)
  const setActive = useRoom((s) => s.setActive)
  const booted = useRoom((s) => s.booted)
  const theme = useRoom((s) => s.theme)
  const setTheme = useRoom((s) => s.setTheme)
  const space = useRoom((s) => s.space)
  const setSpace = useRoom((s) => s.setSpace)
  const quality = useRoom((s) => s.quality)
  const setQuality = useRoom((s) => s.setQuality)
  const [time, setTime] = useState('--:--')

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }
    tick()
    const id = window.setInterval(tick, 15000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 transition-[opacity,visibility] duration-700 md:px-9 md:pb-8 md:pt-8"
      style={{ opacity: booted ? 1 : 0, visibility: booted ? 'visible' : 'hidden' }}
    >
      <header className="flex items-start justify-between">
        <div>
          <h1 className="sr-only">
            {site.name} —— {site.role}
          </h1>
          <div className="flex items-center gap-3">
            <span className="relative flex h-[5px] w-[5px]">
              <span className="absolute inset-0 animate-ping rounded-full bg-ember/60" />
              <span className="relative h-[5px] w-[5px] rounded-full bg-ember" />
            </span>
            <span className="text-[12px] font-medium tracking-[0.42em] text-paper/95">{site.brand}</span>
          </div>
          <p className="mt-2 pl-[17px] text-[10px] leading-relaxed tracking-[0.2em] text-paper/55">
            {space ? 'DEEP FIELD / 悬浮房间之外' : site.tagline}
          </p>
        </div>

        <div className="text-right font-mono text-[10px] leading-[2] tracking-[0.14em] text-paper/60">
          <p>
            {time} <span className="text-paper/40">/</span> {site.location}
          </p>
          <p className="text-mint/75">{site.availability}</p>
          {!space && (
            <button
              type="button"
              onClick={() => setTheme(theme === 'night' ? 'dusk' : 'night')}
              aria-label={`切换到${theme === 'night' ? '黄昏' : '夜色'}氛围`}
              className="pointer-events-auto mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-paper/45 transition-colors hover:text-ember focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/60"
            >
              <span
                className={
                  'h-[6px] w-[6px] rounded-full transition-colors duration-500 ' +
                  (theme === 'night' ? 'bg-[#8cbbec]' : 'bg-ember')
                }
              />
              {theme === 'night' ? '夜色' : '黄昏'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setQuality(((quality + 1) % 3) as 0 | 1 | 2)}
            aria-label="切换渲染画质"
            className="pointer-events-auto mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-paper/45 transition-colors hover:text-ember focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/60"
          >
            <span
              className={
                'h-[6px] w-[6px] rounded-sm transition-colors duration-500 ' +
                (quality === 2 ? 'bg-ember' : quality === 1 ? 'bg-paper/55' : 'bg-paper/25')
              }
            />
            {quality === 2 ? '画质 高' : quality === 1 ? '画质 中' : '画质 低'}
          </button>
        </div>
      </header>

      <footer className="flex items-end justify-between gap-5">
        {space ? (
          <>
            <button
              type="button"
              onClick={() => setSpace(false)}
              className="pointer-events-auto inline-flex min-h-[40px] items-center gap-2 border border-paper/20 px-3.5 py-2 font-mono text-[10px] tracking-[0.18em] text-paper/80 transition-all duration-500 hover:border-ember/60 hover:text-paper focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/60"
            >
              <span aria-hidden="true">←</span>
              返回房间 / ESC
            </button>
            <p className="hidden max-w-[240px] text-right font-mono text-[10px] leading-[1.9] tracking-[0.12em] text-paper/50 md:block">
              拖拽环视星野 · 点窗户进出
            </p>
          </>
        ) : (
          <>
            <nav className="pointer-events-auto grid w-full grid-cols-4 gap-1.5 md:flex md:w-auto md:flex-wrap">
          {stations.map((s) => {
            const on = active === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(on ? null : s.id)}
                aria-expanded={on}
                aria-controls="section-panel"
                className={
                  'group min-h-[40px] border px-2 py-2 transition-all duration-500 ease-expo focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/60 md:px-3 ' +
                  (on
                    ? 'border-ember/55 bg-ember/10'
                    : 'border-paper/12 hover:border-paper/35 hover:bg-paper/[0.04]')
                }
              >
                <span className="flex items-center justify-center gap-1.5 md:justify-start md:gap-2">
                  <span
                    className={
                      'font-mono text-[10px] tracking-[0.08em] transition-colors ' +
                      (on ? 'text-ember' : 'text-paper/50')
                    }
                  >
                    {s.code}
                  </span>
                  <span
                    className={
                      'text-[11px] tracking-[0.14em] transition-colors ' +
                      (on ? 'text-paper' : 'text-paper/75 group-hover:text-paper/95')
                    }
                  >
                    {s.cn}
                  </span>
                </span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="返回总览"
            className={
              'hidden border py-1.5 text-[10px] tracking-[0.18em] transition-all duration-500 ease-expo focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/60 md:block md:px-3 md:py-2 ' +
              (active
                ? 'pointer-events-auto border-paper/18 text-paper/70 hover:border-paper/40 hover:text-paper/95'
                : 'pointer-events-none border-transparent text-transparent')
            }
          >
            总览 / ESC
          </button>
        </nav>

            <p className="hidden max-w-[220px] text-right font-mono text-[10px] leading-[1.9] tracking-[0.12em] text-paper/50 md:block">
              {navHint}
            </p>
          </>
        )}
      </footer>
    </div>
  )
}
