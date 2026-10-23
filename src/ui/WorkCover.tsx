import type { ReactNode } from 'react'
import type { CoverPattern, WorkItem } from '../types'

function Pattern({ kind, a, b }: { kind: CoverPattern; a: string; b: string }): ReactNode {
  if (kind === 'wave') {
    return (
      <g fill="none" strokeLinecap="round">
        {Array.from({ length: 7 }).map((_, i) => {
          const y = 34 + i * 25
          const amp = 17 - i * 1.5
          const d = `M -20 ${y} C 60 ${y - amp}, 110 ${y + amp}, 180 ${y} S 300 ${y - amp}, 420 ${y}`
          return (
            <path
              key={i}
              d={d}
              stroke={i % 2 ? b : a}
              strokeWidth={i === 3 ? 1.3 : 0.8}
              opacity={0.14 + i * 0.09}
            />
          )
        })}
        <line x1={212} y1={0} x2={212} y2={225} stroke={a} strokeWidth={0.6} opacity={0.24} />
        <circle cx={212} cy={109} r={3.2} fill={a} opacity={0.9} />
      </g>
    )
  }

  if (kind === 'orbit') {
    return (
      <g fill="none">
        {[0, 60, 120].map((deg, i) => (
          <ellipse
            key={deg}
            cx={200}
            cy={112}
            rx={118}
            ry={44}
            stroke={i === 0 ? a : b}
            strokeWidth={0.8}
            opacity={i === 0 ? 0.7 : 0.38}
            transform={`rotate(${deg} 200 112)`}
          />
        ))}
        <circle cx={200} cy={112} r={27} stroke={a} strokeWidth={0.8} opacity={0.5} />
        <circle cx={200} cy={112} r={6} stroke={a} strokeWidth={0.7} opacity={0.4} />
        <circle cx={200} cy={112} r={2.6} fill={a} opacity={0.95} />
        <circle cx={318} cy={112} r={2.4} fill={b} opacity={0.9} />
      </g>
    )
  }

  if (kind === 'prism') {
    return (
      <g>
        <polygon
          points="200,31 264,68 200,105 136,68"
          fill={a}
          fillOpacity={0.16}
          stroke={a}
          strokeWidth={0.9}
          strokeOpacity={0.8}
        />
        <polygon
          points="264,68 264,142 200,179 200,105"
          fill={b}
          fillOpacity={0.08}
          stroke={b}
          strokeWidth={0.9}
          strokeOpacity={0.5}
        />
        <polygon
          points="136,68 136,142 200,179 200,105"
          fill="#000"
          fillOpacity={0.35}
          stroke={a}
          strokeWidth={0.9}
          strokeOpacity={0.32}
        />
        <polygon
          points="200,7 232,25 200,43 168,25"
          fill={b}
          fillOpacity={0.12}
          stroke={b}
          strokeWidth={0.7}
          strokeOpacity={0.55}
        />
        <line x1={136} y1={196} x2={264} y2={196} stroke={a} strokeWidth={0.6} opacity={0.28} />
        <line x1={200} y1={188} x2={200} y2={204} stroke={a} strokeWidth={0.6} opacity={0.4} />
      </g>
    )
  }

  return (
    <g>
      {Array.from({ length: 14 }).map((_, i) => (
        <line
          key={i}
          x1={28 + i * 26.5}
          y1={26}
          x2={28 + i * 26.5}
          y2={199}
          stroke={b}
          strokeWidth={0.6}
          opacity={0.1 + (i % 3) * 0.07}
        />
      ))}
      <line x1={28} y1={112} x2={372} y2={112} stroke={a} strokeWidth={0.7} opacity={0.34} />
      <circle cx={200} cy={112} r={62} stroke={a} strokeWidth={0.9} fill="none" opacity={0.62} />
      <circle cx={200} cy={112} r={7} fill={a} opacity={0.8} />
      <circle cx={200} cy={112} r={20} stroke={a} strokeWidth={0.6} fill="none" opacity={0.3} />
    </g>
  )
}

export default function WorkCover({
  work,
  className = '',
  showCode = true,
}: {
  work: WorkItem
  className?: string
  showCode?: boolean
}) {
  const [a, b] = work.palette

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(130% 110% at 16% 0%, ${a}26 0%, transparent 56%), linear-gradient(155deg, #12141b 0%, #080a0f 72%)`,
      }}
    >
      <svg
        viewBox="0 0 400 225"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <Pattern kind={work.cover} a={a} b={b} />
      </svg>

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg, transparent 52%, rgba(7,8,12,0.7) 100%)' }}
      />

      {showCode && (
        <span
          className="absolute left-3.5 top-3.5 font-mono text-[9px] tracking-[0.2em]"
          style={{ color: a, opacity: 0.8 }}
        >
          {work.code}
        </span>
      )}
    </div>
  )
}
