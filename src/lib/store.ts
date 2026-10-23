import { create } from 'zustand'
import type { SectionId } from '../types'
import { site, stations } from '../content/site'

export type Quality = 0 | 1 | 2
export type Theme = 'night' | 'dusk'

const THEME_KEY = 'room01:theme'

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'night'
  try {
    return window.localStorage.getItem(THEME_KEY) === 'dusk' ? 'dusk' : 'night'
  } catch {
    return 'night'
  }
}

const isValidSection = (v: unknown): v is SectionId =>
  typeof v === 'string' && stations.some((s) => s.id === v)

/** 桌面默认满画质（Retina 全分辨率 + MSAA），掉帧时 Rig 会自动降级 */
function detectQuality(): Quality {
  if (typeof window === 'undefined') return 1
  const nav = navigator as Navigator & { deviceMemory?: number }
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const cores = nav.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8
  if (coarse || cores <= 4 || memory <= 4) return 0
  return 2
}

/** 首屏直接读 URL，刷新与分享都能落到同一个板块 */
function readSectionFromUrl(): SectionId | null {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('s')
  return isValidSection(raw) ? raw : null
}

/** ?s=space 可以直接落到星野，分享出去也能直接看窗外 */
function readSpaceFromUrl(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('s') === 'space'
}

interface RoomState {
  booted: boolean
  /** 场景已经渲染出第一帧（真实就绪，而不是定时器） */
  sceneReady: boolean
  active: SectionId | null
  hovered: SectionId | null
  /** 0 省电 / 1 标准 / 2 高画质 */
  quality: Quality
  /** 夜色 / 黄昏 两套灯光预设 */
  theme: Theme
  /** 是否已从窗户进入星空 */
  space: boolean
  /** 正在阅读的书（books 的 id） */
  book: string | null
  setBooted: (v: boolean) => void
  setSceneReady: (v: boolean) => void
  setActive: (id: SectionId | null) => void
  setHovered: (id: SectionId | null) => void
  setQuality: (q: Quality) => void
  setSpace: (v: boolean) => void
  setBook: (id: string | null) => void
  setTheme: (t: Theme) => void
  /** 浏览器前进/后退时从 URL 回填状态，不写入历史 */
  syncFromUrl: () => void
}

function writeUrl(id: SectionId | 'space' | null) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (id) url.searchParams.set('s', id)
  else url.searchParams.delete('s')
  const next = `${url.pathname}${url.search}${url.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next !== current) window.history.pushState({ s: id }, '', next)

  if (id === 'space') {
    document.title = `星野 · ${site.brand}`
    return
  }
  const station = id ? stations.find((s) => s.id === id) : null
  document.title = station ? `${station.cn} · ${site.brand}` : `${site.brand} · ${site.tagline}`
}

export const useRoom = create<RoomState>((set) => ({
  booted: false,
  sceneReady: false,
  active: readSectionFromUrl(),
  hovered: null,
  quality: detectQuality(),
  theme: readTheme(),
  space: readSpaceFromUrl(),
  book: null,
  setBooted: (booted) => set({ booted }),
  setSceneReady: (sceneReady) => set({ sceneReady }),
  setActive: (active) => {
    set({ active, hovered: null, space: false, book: null })
    writeUrl(active)
  },
  setHovered: (hovered) => set({ hovered }),
  setQuality: (quality) => set({ quality }),
  setSpace: (space) => {
    set({ space, active: null, hovered: null, book: null })
    writeUrl(space ? 'space' : null)
  },
  setBook: (book) => set({ book, active: null, hovered: null }),
  setTheme: (theme) => {
    set({ theme })
    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* 隐私模式写不进去就算了 */
    }
  },
  syncFromUrl: () => {
    if (readSpaceFromUrl()) set({ space: true, active: null, hovered: null, book: null })
    else set({ space: false, active: readSectionFromUrl(), hovered: null, book: null })
  },
}))
