import { site, skillGroups, socials, timeline, works } from '../content/site'

/**
 * 视觉上不可见、但读屏与搜索引擎可读的完整正文。
 * 3D 房间里的抽屉是条件渲染的，初始 DOM 里没有任何内容，这份副本补上。
 */
export default function SrContent() {
  return (
    <div className="sr-only">
      <p>
        {site.name}（{site.latin}），{site.role}。{site.tagline}。
      </p>
      <p>{site.intro}</p>

      <section aria-label="作品">
        <h2>作品</h2>
        {works.map((w) => (
          <article key={w.code}>
            <h3>
              {w.title} —— {w.subtitle}（{w.year}）
            </h3>
            <p>{w.desc}</p>
            <p>{w.detail}</p>
            <ul>
              {w.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            {w.link !== '#' && (
              <a href={w.link} target={w.link.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                打开项目
              </a>
            )}
          </article>
        ))}
      </section>

      <section aria-label="技能">
        <h2>技能</h2>
        {skillGroups.map((g) => (
          <div key={g.title}>
            <h3>{g.title}</h3>
            <ul>
              {g.items.map((it) => (
                <li key={it.name}>
                  {it.name}，掌握程度 {Math.round(it.level * 100)}%
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-label="经历">
        <h2>经历</h2>
        <ul>
          {timeline.map((t) => (
            <li key={t.year}>
              {t.year}，{t.title}：{t.detail}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="联系方式">
        <h2>联系方式</h2>
        <p>
          邮箱：
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <p>
          所在地：{site.location}；{site.availability}
        </p>
        <ul>
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.href}>{s.label}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
