import { site, skillGroups, socials, timeline, works } from '../content/site'
import WorkCover from './WorkCover'

/**
 * 没有 WebGL、上下文丢失、或者 3D 崩溃时的兜底页面。
 * 内容与房间完全等价，只是换成了可滚动排版。
 */
export default function StaticFallback({ reason = 'webgl' }: { reason?: 'webgl' | 'error' }) {
  const notice =
    reason === 'error'
      ? '3D 场景没能启动，已切换为文字版。内容都在，只是换了一种呈现。'
      : '当前环境未启用 WebGL，已切换为文字版。内容完整可读。'

  return (
    <div className="thin-scroll relative z-[65] h-full w-full overflow-y-auto overscroll-contain bg-ink">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
        style={{
          background:
            'radial-gradient(80% 100% at 18% 0%, rgba(255,138,91,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[780px] px-6 pb-16 pt-10 md:px-10 md:pt-14">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-[5px] w-[5px] rounded-full bg-ember" />
            <span className="text-[10px] tracking-[0.06em] text-paper/40">
              {site.brand} / TEXT EDITION
            </span>
          </div>
          <a
            href={`mailto:${site.email}`}
            className="font-mono text-[10px] tracking-[0.14em] text-paper/55 transition-colors hover:text-ember"
          >
            {site.email}
          </a>
        </header>

        <p className="mt-8 border border-paper/10 px-4 py-3 font-mono text-[10px] leading-relaxed tracking-[0.08em] text-paper/45">
          {notice}
        </p>

        <section className="mt-12">
          <h1 className="text-[34px] font-medium leading-[1.15] tracking-[-0.02em] text-paper md:text-[44px]">
            {site.name}
            <span className="ml-3 align-middle font-mono text-[11px] font-normal tracking-[0.24em] text-paper/35">
              {site.latin}
            </span>
          </h1>
          <p className="mt-3 text-[12px] tracking-[0.2em] text-ember/80">{site.role}</p>
          <p className="mt-6 max-w-[620px] text-[13px] leading-[2] text-paper/70">{site.intro}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.14em] text-paper/40">
            <span>{site.location}</span>
            <span className="text-mint/70">{site.availability}</span>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.24em] text-ember/75">01 / WORKS</span>
            <span className="h-px flex-1 bg-gradient-to-r from-paper/15 to-transparent" />
          </div>

          <div className="mt-8 space-y-14">
            {works.map((w) => (
              <article key={w.code}>
                <WorkCover work={w} className="aspect-[16/9] w-full" showCode={false} />
                <div className="mt-5 flex items-start justify-between gap-4 border-b border-paper/10 pb-4">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-ember/70">
                      {w.code} · {w.year}
                    </p>
                    <h2 className="mt-2 text-[26px] font-medium leading-none tracking-[-0.01em] text-paper/95">
                      {w.title}
                    </h2>
                    <p className="mt-2 text-[11px] tracking-[0.14em] text-paper/45">{w.subtitle}</p>
                  </div>
                  <div className="shrink-0 text-right font-mono text-[10px] leading-[1.9] tracking-[0.08em] text-paper/50">
                    <p>{w.role}</p>
                    <p className="text-paper/35">{w.period}</p>
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-line text-[13px] leading-[2] text-paper/70">
                  {w.detail}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {w.highlights.map((h) => (
                    <li key={h} className="relative pl-5 text-[12.5px] leading-[1.9] text-paper/60">
                      <span className="absolute left-0 top-[11px] h-px w-2.5 bg-ember/60" />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {w.tags.map((t) => (
                    <span
                      key={t}
                      className="border border-paper/10 px-2 py-[3px] font-mono text-[9.5px] tracking-[0.1em] text-paper/45"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.24em] text-ember/75">02 / SKILLS</span>
            <span className="h-px flex-1 bg-gradient-to-r from-paper/15 to-transparent" />
          </div>

          <div className="mt-8 grid gap-10 md:grid-cols-3">
            {skillGroups.map((g) => (
              <div key={g.title}>
                <p className="font-mono text-[10px] tracking-[0.2em] text-paper/40">{g.title}</p>
                <div className="mt-4 space-y-3.5">
                  {g.items.map((it) => (
                    <div key={it.name}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[12px] text-paper/80">{it.name}</span>
                        <span className="font-mono text-[10px] text-paper/40">
                          {Math.round(it.level * 100)}
                        </span>
                      </div>
                      <div className="mt-2 h-px w-full bg-paper/10">
                        <div
                          className="h-px bg-gradient-to-r from-ember/70 to-ember/30"
                          style={{ width: `${it.level * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.24em] text-ember/75">
              03 / TIMELINE
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-paper/15 to-transparent" />
          </div>

          <div className="mt-8 space-y-7">
            {timeline.map((t) => (
              <div key={t.year} className="relative pl-5">
                <span className="absolute left-0 top-[7px] h-[5px] w-[5px] rounded-full bg-ember/80" />
                <p className="font-mono text-[10px] tracking-[0.2em] text-ember/75">{t.year}</p>
                <p className="mt-1.5 text-[14px] text-paper/90">{t.title}</p>
                <p className="mt-1.5 text-[12px] leading-[1.85] text-paper/55">{t.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.24em] text-ember/75">
              04 / CONTACT
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-paper/15 to-transparent" />
          </div>

          <a href={`mailto:${site.email}`} className="group mt-8 block border-y border-paper/10 py-6">
            <p className="font-mono text-[10px] tracking-[0.26em] text-paper/40">EMAIL</p>
            <p className="mt-2 flex items-center justify-between text-[20px] text-paper/90 transition-colors group-hover:text-ember">
              {site.email}
              <span className="text-[13px] text-paper/40">↗</span>
            </p>
          </a>

          <div className="mt-2">
            {socials.slice(1).map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between border-b border-paper/8 py-3.5"
              >
                <span className="font-mono text-[10px] tracking-[0.22em] text-paper/40">
                  {s.label}
                </span>
                <span className="text-[12px] text-paper/65 transition-colors group-hover:text-paper/95">
                  {s.value}
                </span>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-16 flex items-center justify-between border-t border-paper/8 pt-5 font-mono text-[10px] tracking-[0.14em] text-paper/30">
          <span>©2026 {site.brand}</span>
          <span>BUILT WITH REACT · THREE</span>
        </footer>
      </div>
    </div>
  )
}
