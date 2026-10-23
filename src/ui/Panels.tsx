import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { site, books, skillGroups, socials, timeline, works } from '../content/site'
import type { WorkItem } from '../types'
import { useRoom } from '../lib/store'
import WorkCover from './WorkCover'

const EASE = [0.16, 1, 0.3, 1] as const

function WorkCard({ work, onOpen }: { work: WorkItem; onOpen: () => void }) {
  return (
    <article>
      <button
        type="button"
        onClick={onOpen}
        className="group block w-full text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/60"
        aria-label={`查看作品 ${work.title}`}
      >
        <WorkCover
          work={work}
          className="aspect-[16/9] w-full ring-1 ring-inset ring-paper/8 transition-[box-shadow] duration-500 group-hover:ring-ember/25"
        />
        <div className="mt-4 flex items-baseline gap-3">
          <span className="font-mono text-[10px] tracking-[0.16em] text-ember/75">{work.code}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-paper/15 to-transparent" />
          <span className="font-mono text-[10px] tracking-[0.16em] text-paper/40">{work.year}</span>
        </div>
        <h3 className="mt-3 text-[26px] font-medium leading-none tracking-[-0.01em] text-paper/95 transition-colors duration-500 group-hover:text-ember">
          {work.title}
        </h3>
        <p className="mt-2 text-[11px] tracking-[0.14em] text-paper/45">{work.subtitle}</p>
        <p className="mt-3 line-clamp-2 text-[12.5px] leading-[1.95] text-paper/60">{work.desc}</p>
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {work.tags.map((t) => (
            <span
              key={t}
              className="border border-paper/10 px-2 py-[3px] font-mono text-[9.5px] tracking-[0.1em] text-paper/45 transition-colors duration-500 group-hover:border-ember/25 group-hover:text-paper/65"
            >
              {t}
            </span>
          ))}
          <span className="ml-auto font-mono text-[10px] tracking-[0.1em] text-paper/40 transition-colors duration-500 group-hover:text-ember">
            详情 ↗
          </span>
        </div>
      </button>
    </article>
  )
}

function WorkDetail({ work, onBack }: { work: WorkItem; onBack: () => void }) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="group flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-paper/50 transition-colors duration-400 hover:text-ember focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/60"
      >
        <span className="transition-transform duration-400 ease-expo group-hover:-translate-x-0.5">
          ←
        </span>
        返回作品列表
      </button>

      <WorkCover work={work} className="mt-5 aspect-[16/9] w-full" showCode={false} />

      <div className="mt-6 flex items-start justify-between gap-4 border-b border-paper/10 pb-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.2em] text-ember/75">{work.code}</p>
          <h3 className="mt-2 text-[28px] font-medium leading-none tracking-[-0.01em] text-paper/95">
            {work.title}
          </h3>
          <p className="mt-2 text-[11px] tracking-[0.14em] text-paper/45">{work.subtitle}</p>
        </div>
        <div className="shrink-0 text-right font-mono text-[10px] leading-[1.9] tracking-[0.08em] text-paper/50">
          <p>{work.role}</p>
          <p className="text-paper/35">{work.period}</p>
        </div>
      </div>

      <p className="mt-5 whitespace-pre-line text-[13px] leading-[2] text-paper/70">{work.detail}</p>

      <div className="mt-7">
        <p className="font-mono text-[10px] tracking-[0.24em] text-paper/40">要点</p>
        <ul className="mt-4 space-y-3">
          {work.highlights.map((h) => (
            <li key={h} className="relative pl-5 text-[12.5px] leading-[1.9] text-paper/60">
              <span className="absolute left-0 top-[11px] h-px w-2.5 bg-ember/60" />
              {h}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-7 flex flex-wrap gap-1.5">
        {work.tags.map((t) => (
          <span
            key={t}
            className="border border-paper/10 px-2 py-[3px] font-mono text-[9.5px] tracking-[0.1em] text-paper/45"
          >
            {t}
          </span>
        ))}
      </div>

      {work.link !== '#' ? (
        <a
          href={work.link}
          target={work.link.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="group mt-8 inline-flex items-center gap-2 border border-paper/15 px-4 py-2.5 font-mono text-[10px] tracking-[0.16em] text-paper/70 transition-colors duration-500 hover:border-ember/50 hover:text-ember focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/60"
        >
          打开项目
          <span className="transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            ↗
          </span>
        </a>
      ) : (
        <p className="mt-8 border border-paper/8 px-4 py-3 font-mono text-[10px] tracking-[0.12em] text-paper/35">
          线上地址暂未公开，想看细节可以直接来信。
        </p>
      )}
    </div>
  )
}

export function WorksPanel() {
  const [openCode, setOpenCode] = useState<string | null>(null)
  const open = openCode ? works.find((w) => w.code === openCode) ?? null : null

  // 进入详情 / 返回列表时回到顶部，避免停在上一屏的滚动位置
  useEffect(() => {
    document.getElementById('panel-scroll')?.scrollTo({ top: 0 })
  }, [openCode])

  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.div
          key={open.code}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <WorkDetail work={open} onBack={() => setOpenCode(null)} />
        </motion.div>
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 18 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="space-y-9"
        >
          {works.map((w) => (
            <WorkCard key={w.code} work={w} onOpen={() => setOpenCode(w.code)} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function AboutPanel() {
  const setBook = useRoom((s) => s.setBook)

  return (
    <div>
      <p className="text-[13px] leading-[2] text-paper/70">{site.intro}</p>

      <div className="mt-8 grid grid-cols-3 gap-2 border-y border-paper/10 py-5">
        {[
          ['04', '年经验'],
          ['12', '个交付'],
          ['02', '个开源'],
        ].map(([n, l]) => (
          <div key={l}>
            <p className="font-mono text-[22px] leading-none tracking-tight text-paper/90">{n}</p>
            <p className="mt-2 text-[10px] tracking-[0.16em] text-paper/40">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <p className="font-mono text-[10px] tracking-[0.28em] text-paper/40">TIMELINE</p>
        <div className="mt-5 space-y-7">
          {timeline.map((t, i) => (
            <motion.div
              key={t.year}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.09, ease: EASE }}
              className="relative pl-5"
            >
              <span className="absolute left-0 top-[7px] h-[5px] w-[5px] rounded-full bg-ember/80" />
              <span className="absolute left-[2px] top-[18px] h-[calc(100%+10px)] w-px bg-gradient-to-b from-paper/15 to-transparent" />
              <p className="font-mono text-[10px] tracking-[0.2em] text-ember/75">{t.year}</p>
              <p className="mt-1.5 text-[14px] tracking-[0.02em] text-paper/90">{t.title}</p>
              <p className="mt-1.5 text-[12px] leading-[1.85] text-paper/55">{t.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-9">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.28em] text-paper/40">SHELF</span>
          <span className="h-px flex-1 bg-gradient-to-r from-paper/12 to-transparent" />
          <span className="font-mono text-[10px] tracking-[0.1em] text-paper/30">
            {String(books.length).padStart(2, '0')}
          </span>
        </div>
        <ul className="mt-4">
          {books.map((b, i) => (
            <li key={b.id} className="border-b border-paper/8">
              <button
                type="button"
                onClick={() => setBook(b.id)}
                className="group flex w-full items-baseline gap-3 py-3 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/60"
              >
                <span className="font-mono text-[9.5px] tracking-[0.1em] text-paper/25">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[13px] tracking-[0.02em] text-paper/80 transition-colors duration-400 group-hover:text-ember">
                  {b.title}
                </span>
                <span className="ml-auto shrink-0 text-[10px] tracking-[0.06em] text-paper/35">
                  {b.author}
                </span>
                <span className="w-3 shrink-0 text-[10px] text-paper/25 transition-colors duration-400 group-hover:text-ember">
                  ↗
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10.5px] leading-[1.9] text-paper/30">
          书架上摆的就是这些书，书脊上的字是现场画上去的。点书名可以直接打开阅读笔记。
        </p>
      </div>

      <p className="mt-9 border-l border-ember/40 pl-4 text-[11.5px] leading-[1.9] text-paper/45">
        「与其做十个能用的页面，不如做一个让人想待一会儿的房间。」
      </p>
    </div>
  )
}

export function SkillsPanel() {
  return (
    <div className="space-y-9">
      {skillGroups.map((g, gi) => (
        <div key={g.title}>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.24em] text-paper/40">
              0{gi + 1} / {g.title}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-paper/12 to-transparent" />
          </div>
          <div className="mt-5 space-y-4">
            {g.items.map((it, i) => (
              <div key={it.name}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[12.5px] tracking-[0.04em] text-paper/80">{it.name}</span>
                  <span className="font-mono text-[10px] tracking-[0.1em] text-paper/40">
                    {Math.round(it.level * 100)}
                  </span>
                </div>
                <div className="mt-2 h-px w-full bg-paper/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${it.level * 100}%` }}
                    transition={{ duration: 1.1, delay: 0.15 + gi * 0.1 + i * 0.06, ease: EASE }}
                    className="h-px bg-gradient-to-r from-ember/70 to-ember/30"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="border border-paper/10 p-4">
        <p className="font-mono text-[10px] tracking-[0.24em] text-paper/40">ALSO</p>
        <p className="mt-2 text-[12px] leading-[1.9] text-paper/60">
          摄影、排版、机械键盘、在深夜调一个只有 8px 的对齐。这些不进简历，但都会进界面。
        </p>
      </div>
    </div>
  )
}

export function ContactPanel() {
  return (
    <div>
      <p className="text-[13px] leading-[2] text-paper/65">
        有项目、有想法，或者只是想聊聊某个交互怎么实现——都欢迎。 通常 24 小时内回信。
      </p>

      <a href={`mailto:${site.email}`} className="group mt-7 block border-y border-paper/10 py-6">
        <p className="font-mono text-[10px] tracking-[0.26em] text-paper/40">EMAIL</p>
        <p className="mt-2 flex items-center justify-between text-[19px] tracking-[0.01em] text-paper/90 transition-colors duration-500 group-hover:text-ember">
          {site.email}
          <span className="font-mono text-[13px] text-paper/40 transition-transform duration-500 ease-expo group-hover:translate-x-1 group-hover:text-ember">
            ↗
          </span>
        </p>
      </a>

      <div className="mt-7 space-y-0">
        {socials.slice(1).map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between border-b border-paper/8 py-3.5"
          >
            <span className="font-mono text-[10px] tracking-[0.22em] text-paper/40">{s.label}</span>
            <span className="flex items-center gap-2 text-[12px] tracking-[0.03em] text-paper/65 transition-colors duration-500 group-hover:text-paper/95">
              {s.value}
              <span className="font-mono text-[10px] text-paper/30 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </span>
          </a>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-2">
        <span className="h-[5px] w-[5px] rounded-full bg-mint/80" />
        <p className="font-mono text-[10px] tracking-[0.16em] text-paper/45">{site.availability}</p>
      </div>

      <p className="mt-8 text-[11px] leading-[1.9] text-paper/35">
        这间房间的所有家具都由基础几何体拼成，没有引入任何模型文件。 改一句文案，只要编辑{' '}
        <span className="font-mono text-paper/50">src/content/site.ts</span>。
      </p>
    </div>
  )
}
