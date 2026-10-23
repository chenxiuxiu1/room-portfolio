import * as THREE from 'three'
import type { Book } from '../types'

const cache = new Map<string, THREE.CanvasTexture>()

// 书脊字号很小，宋体在十几像素下会糊成一片；用黑体保证可读性
const SANS = '"Microsoft YaHei", "Hiragino Sans GB", "Noto Sans SC", sans-serif'

/**
 * 书脊贴图：竖排书名 + 作者，现场用 canvas 画。
 * 每本书只生成一次，之后从缓存取。
 */
export function spineTexture(book: Book): THREE.CanvasTexture {
  const hit = cache.get(book.id)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 640
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = book.color
  ctx.fillRect(0, 0, 128, 640)

  // 布面书脊的细微竖纹
  ctx.fillStyle = 'rgba(255,255,255,0.035)'
  for (let x = 8; x < 128; x += 6) ctx.fillRect(x, 0, 1, 640)
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  for (let x = 12; x < 128; x += 6) ctx.fillRect(x, 0, 1, 640)

  // 顶部压印线
  ctx.fillStyle = 'rgba(240,226,196,0.5)'
  ctx.fillRect(24, 34, 80, 2)

  let size = 56
  ctx.font = `700 ${size}px ${SANS}`
  while (ctx.measureText(book.title).width > 420 && size > 20) {
    size -= 2
    ctx.font = `700 ${size}px ${SANS}`
  }

  // 书名竖排、整体居中
  const titleWidth = ctx.measureText(book.title).width
  const titleY = Math.max(48, (640 - titleWidth) / 2)
  ctx.save()
  ctx.translate(68, titleY)
  ctx.rotate(Math.PI / 2)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#f8f1e3'
  ctx.font = `700 ${size}px ${SANS}`
  ctx.fillText(book.title, 0, 0)
  ctx.restore()

  // 作者竖排，从底部往上排，右下角收口
  ctx.font = `500 18px ${SANS}`
  const authorWidth = ctx.measureText(book.author).width
  const authorY = Math.max(titleY + titleWidth + 24, 606 - authorWidth)
  ctx.save()
  ctx.translate(104, authorY)
  ctx.rotate(Math.PI / 2)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(246,238,224,0.7)'
  ctx.font = `500 18px ${SANS}`
  ctx.fillText(book.author, 0, 0)
  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 16
  cache.set(book.id, tex)
  return tex
}
