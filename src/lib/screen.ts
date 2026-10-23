import * as THREE from 'three'

let cached: THREE.CanvasTexture | null = null

const MONO = '"JetBrains Mono", "Cascadia Mono", Consolas, "Courier New", monospace'
const SANS = '"Microsoft YaHei", "Hiragino Sans GB", "Noto Sans SC", sans-serif'

/** 屏幕上的一行代码。真写一版 tokenizer 不值当，直接按正则切词上色 */
const CODE = [
  "import { useRef } from 'react'",
  "import { useFrame } from '@react-three/fiber'",
  "import { damp } from '../lib/camera'",
  '',
  '/** 把拖拽映射成环视角度 */',
  'export function Rig() {',
  '  const orbit = useRef({ yaw: 0, pitch: 0 })',
  '  const spin = useRef({ yaw: 0, pitch: 0 })',
  '',
  '  useFrame((_, delta) => {',
  '    const dt = Math.min(delta, 0.05)',
  '    // 抬手后按 e^-2.5t 衰减着继续转',
  '    orbit.current.yaw += spin.current.yaw * dt',
  '    spin.current.yaw *= Math.exp(-2.5 * dt)',
  '',
  '    camera.lookAt(0, 1.2, 0)',
  '  })',
  '',
  '  return null',
  '}',
  '',
  '// TODO: 窗外那颗星还没接上',
]

const COLORS = {
  base: '#c9d5de',
  key: '#c792ea',
  str: '#a3cf9a',
  num: '#f2b47a',
  com: '#5b6c78',
  fn: '#7fd1c1',
  punct: '#7f8f9b',
}

const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'function',
  'const',
  'let',
  'return',
  'if',
  'else',
  'new',
  'type',
  'interface',
  'default',
  'async',
  'await',
])

const FNS = new Set(['useRef', 'useFrame', 'useMemo', 'useThree', 'Math', 'camera', 'damp', 'min', 'exp', 'lookAt'])

const TOKEN = /(\/\/.*$|'[^']*'|"[^"]*"|`[^`]*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|\s+|[^\w\s])/g

function paint(ctx: CanvasRenderingContext2D, line: string, x: number, y: number) {
  if (!line) return
  const parts = line.match(TOKEN) ?? [line]
  let cx = x
  for (const p of parts) {
    let color = COLORS.base
    if (p.startsWith('//')) color = COLORS.com
    else if (p[0] === "'" || p[0] === '"' || p[0] === '`') color = COLORS.str
    else if (KEYWORDS.has(p)) color = COLORS.key
    else if (FNS.has(p)) color = COLORS.fn
    else if (/^\d/.test(p)) color = COLORS.num
    else if (/^[^\w\s]$/.test(p)) color = COLORS.punct
    ctx.fillStyle = color
    ctx.fillText(p, cx, y)
    cx += ctx.measureText(p).width
  }
}

/**
 * 显示器贴图：一整间 IDE 的截图，现画。
 * 之前屏幕上只有几条色块，远看像一块开机测试图；
 * 有了标签页、文件树、带语法高亮的代码和状态栏，它才像"正在用"。
 */
export function screenTexture(): THREE.CanvasTexture {
  if (cached) return cached

  const W = 1024
  const H = 576
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 底色：偏青的深灰，纯黑在 PBR 里会死掉
  ctx.fillStyle = '#0b1114'
  ctx.fillRect(0, 0, W, H)

  /* ---------- 标题栏 ---------- */
  ctx.fillStyle = '#0e161a'
  ctx.fillRect(0, 0, W, 40)
  ctx.fillStyle = '#1a242a'
  ctx.fillRect(0, 39, W, 1)
  ;['#4a3a3c', '#4a4436', '#364a3f'].forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(20 + i * 17, 20, 5, 0, Math.PI * 2)
    ctx.fill()
  })

  const tabs = [
    { name: 'App.tsx', x: 96, w: 112, on: false },
    { name: 'Rig.tsx', x: 208, w: 108, on: true },
    { name: 'camera.ts', x: 316, w: 122, on: false },
  ]
  ctx.font = `500 13px ${MONO}`
  for (const t of tabs) {
    if (t.on) {
      ctx.fillStyle = '#111c21'
      ctx.fillRect(t.x, 0, t.w, 40)
      ctx.fillStyle = '#ff8a5b'
      ctx.fillRect(t.x, 0, t.w, 2)
    }
    ctx.fillStyle = t.on ? '#e6eef3' : '#5f7180'
    ctx.fillText(t.name, t.x + 16, 26)
    ctx.fillStyle = t.on ? '#ff8a5b' : '#3d4d58'
    ctx.beginPath()
    ctx.arc(t.x + t.w - 18, 20, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  /* ---------- 左侧文件树 ---------- */
  ctx.fillStyle = '#0a1013'
  ctx.fillRect(0, 40, 216, H - 40)
  ctx.fillStyle = '#151f24'
  ctx.fillRect(215, 40, 1, H - 40)

  ctx.font = `600 10px ${SANS}`
  ctx.fillStyle = '#57666f'
  ctx.fillText('EXPLORER', 16, 66)

  const files: { n: string; y: number; dir?: boolean; open?: boolean; lvl?: number; on?: boolean }[] = [
    { n: 'src', y: 94, dir: true, open: true },
    { n: 'scene', y: 118, dir: true, open: true, lvl: 1 },
    { n: 'Rig.tsx', y: 142, lvl: 2, on: true },
    { n: 'Desk.tsx', y: 164, lvl: 2 },
    { n: 'Shelf.tsx', y: 186, lvl: 2 },
    { n: 'lib', y: 210, dir: true, lvl: 1 },
    { n: 'camera.ts', y: 234, lvl: 2 },
    { n: 'spine.ts', y: 256, lvl: 2 },
    { n: 'ui', y: 280, dir: true, lvl: 1 },
    { n: 'App.tsx', y: 304, lvl: 2 },
    { n: 'index.css', y: 326, lvl: 2 },
  ]
  ctx.font = `500 13px ${MONO}`
  for (const f of files) {
    const x = 16 + (f.lvl ?? 0) * 16
    if (f.on) {
      ctx.fillStyle = '#16232a'
      ctx.fillRect(0, f.y - 14, 214, 22)
      ctx.fillStyle = '#ff8a5b'
      ctx.fillRect(0, f.y - 14, 2, 22)
    }
    if (f.dir) {
      ctx.fillStyle = '#5f7180'
      ctx.fillText(f.open ? '▾' : '▸', x, f.y)
      ctx.fillStyle = '#7b8d99'
      ctx.fillText(f.n, x + 14, f.y)
    } else {
      ctx.fillStyle = f.on ? '#ff8a5b' : '#4a5b66'
      ctx.fillRect(x + 2, f.y - 8, 6, 8)
      ctx.fillStyle = f.on ? '#e6eef3' : '#8b9ca7'
      ctx.fillText(f.n, x + 14, f.y)
    }
  }

  /* ---------- 编辑区 ---------- */
  const editX = 216
  const editW = 676
  ctx.fillStyle = '#0c1317'
  ctx.fillRect(editX, 40, editW, H - 40)
  ctx.fillStyle = '#121b20'
  ctx.fillRect(editX, 40, 44, H - 40)

  ctx.font = `500 15px ${MONO}`
  const lineH = 22
  const top = 74

  // 当前行高亮
  const activeLine = 11
  ctx.fillStyle = 'rgba(110,231,215,0.055)'
  ctx.fillRect(editX + 44, top + activeLine * lineH - 16, editW - 44, lineH)
  ctx.fillStyle = '#ff8a5b'
  ctx.fillRect(editX + 44, top + activeLine * lineH - 16, 2, lineH)

  CODE.forEach((line, i) => {
    const y = top + i * lineH
    // 行号
    ctx.font = `500 12px ${MONO}`
    ctx.fillStyle = i === activeLine ? '#c3d3dd' : '#3f4f5a'
    ctx.textAlign = 'right'
    ctx.fillText(String(i + 1), editX + 34, y)
    ctx.textAlign = 'left'

    // 代码
    ctx.font = `500 15px ${MONO}`
    paint(ctx, line, editX + 58, y)
  })

  /* ---------- 右侧 minimap ---------- */
  ctx.fillStyle = '#0a1114'
  ctx.fillRect(892, 40, 132, H - 40)
  ctx.fillStyle = '#141e23'
  ctx.fillRect(892, 40, 1, H - 40)
  for (let i = 0; i < 46; i++) {
    const y = 54 + i * 10.4
    const w = 26 + ((i * 37) % 70)
    ctx.fillStyle = i === activeLine ? 'rgba(255,138,91,0.5)' : `rgba(140,170,190,${0.08 + (i % 5) * 0.02})`
    ctx.fillRect(902, y, w, 3)
    if (i % 4 === 0) {
      ctx.fillStyle = 'rgba(110,231,215,0.14)'
      ctx.fillRect(902 + w + 6, y, 18 + (i % 3) * 10, 3)
    }
  }

  /* ---------- 状态栏 ---------- */
  const sy = H - 28
  ctx.fillStyle = '#0e1a20'
  ctx.fillRect(0, sy, W, 28)
  ctx.fillStyle = '#1d2b33'
  ctx.fillRect(0, sy, W, 1)

  ctx.font = `600 12px ${MONO}`
  ctx.fillStyle = '#ff8a5b'
  ctx.fillText('main*', 16, sy + 19)
  ctx.font = `500 12px ${MONO}`
  ctx.fillStyle = '#6d818d'
  ctx.fillText('✓ 0', 70, sy + 19)
  ctx.fillStyle = '#b08a55'
  ctx.fillText('⚠ 2', 108, sy + 19)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#7d919d'
  ctx.fillText('Ln 12, Col 24', 760, sy + 19)
  ctx.fillStyle = '#566a76'
  ctx.fillText('UTF-8', 848, sy + 19)
  ctx.fillText('TypeScript', 960, sy + 19)
  ctx.textAlign = 'left'

  // 屏内一层很淡的偏色，纯平的面板会显得像贴纸
  const glow = ctx.createLinearGradient(0, 40, 0, H)
  glow.addColorStop(0, 'rgba(120,200,220,0.05)')
  glow.addColorStop(0.5, 'rgba(0,0,0,0)')
  glow.addColorStop(1, 'rgba(0,0,0,0.16)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 40, W, H - 40)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 16
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  cached = tex
  return tex
}
