import { Html } from '@react-three/drei'
import { stations } from '../content/site'
import { useRoom } from '../lib/store'
import { pointerState } from '../lib/pointer'

/**
 * 悬浮在各物件上方的技术标注。
 * 移动端没有 hover，标签必须自己能被点开，否则用户只会看到一堆点不动的字。
 */
export default function Hotspots() {
  const hovered = useRoom((s) => s.hovered)
  const active = useRoom((s) => s.active)
  const booted = useRoom((s) => s.booted)
  const space = useRoom((s) => s.space)
  const setActive = useRoom((s) => s.setActive)
  const setHovered = useRoom((s) => s.setHovered)

  if (!booted || space) return null

  return (
    <>
      {stations.map((s) => {
        const on = hovered === s.id || active === s.id
        const hidden = active === s.id

        return (
          <Html
            key={s.id}
            position={s.anchor}
            center
            zIndexRange={[24, 0]}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <button
              type="button"
              onClick={() => setActive(s.id)}
              onPointerEnter={() => {
                if (pointerState.fine) setHovered(s.id)
              }}
              onPointerLeave={() => {
                if (useRoom.getState().hovered === s.id) setHovered(null)
              }}
              aria-label={`${s.cn}：${s.hint}`}
              aria-hidden={hidden}
              tabIndex={hidden ? -1 : 0}
              className="flex items-center gap-2 whitespace-nowrap rounded-sm px-2 py-2 transition-all duration-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/70"
              style={{
                pointerEvents: hidden ? 'none' : 'auto',
                opacity: hidden ? 0 : on ? 1 : 0.72,
                transform: `translateY(${on ? -4 : 0}px) scale(${on ? 1.04 : 1})`,
                touchAction: 'manipulation',
              }}
            >
              <span
                className="block h-px transition-all duration-500"
                style={{ width: on ? 26 : 14, background: on ? '#ff8a5b' : 'rgba(233,229,221,0.35)' }}
              />
              <span className="font-mono text-[10px] tracking-[0.22em] text-ember/90">{s.code}</span>
              <span className="text-[11px] tracking-[0.16em] text-paper/85">{s.cn}</span>
            </button>
          </Html>
        )
      })}
    </>
  )
}
