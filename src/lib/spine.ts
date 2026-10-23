import * as THREE from 'three'
import type { Book } from '../types'

const cache = new Map<string, THREE.CanvasTexture>()

// 书脊字号很小，宋体在十几像素下会糊成一片；用黑体保证可读性
const SANS = '"Microsoft YaHei", "Hiragino Sans GB", "Noto Sans SC", sans-serif'

/**
 * 书脊贴图：竖排书名 + 作者，现场用 canvas 画。
 * 画布长宽比跟书脊正面完全一致（0.333 ≈ 0.154 / 0.464），
 * 否则贴上去文字会被横向拉宽，这也是之前"看不清"的一半原因。
 */
export function spineTexture(book: Book): THREE.CanvasTexture {
  const hit = cache.get(book.id)
  if (hit) return hit

  const W = 256
  const H = 768
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 布面底色 + 顶部压暗，纸面才有卷进书脊的弧度
  ctx.fillStyle = book.color
  ctx.fillRect(0, 0, W, H)
  const shade = ctx.createLinearGradient(0, 0, W, 0)
  shade.addColorStop(0, 'rgba(0,0,0,0.34)')
  shade.addColorStop(0.16, 'rgba(0,0,0,0.02)')
  shade.addColorStop(0.72, 'rgba(255,255,255,0.05)')
  shade.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, W, H)

  // 布面书脊的细微竖纹
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  for (let x = 10; x < W; x += 5) ctx.fillRect(x, 0, 1, H)
  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  for (let x = 13; x < W; x += 5) ctx.fillRect(x, 0, 1, H)

  // 上下堵头布：真的精装书都有这两道横向织带，也是"这是一本书"的记号
  const band = (y: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    ctx.fillRect(0, y, W, 26)
    ctx.fillStyle = 'rgba(246,238,224,0.5)'
    for (let x = 0; x < W; x += 9) ctx.fillRect(x, y + 3, 4, 20)
  }
  band(24)
  band(H - 48)

  // 顶部压印线
  ctx.fillStyle = 'rgba(240,226,196,0.42)'
  ctx.fillRect(46, 70, 164, 2)

  // 书名：竖排，按书脊高度自适应字号
  let size = 86
  ctx.font = `700 ${size}px ${SANS}`
  while (ctx.measureText(book.title).width > 560 && size > 32) {
    size -= 2
    ctx.font = `700 ${size}px ${SANS}`
  }
  const titleWidth = ctx.measureText(book.title).width
  const titleTop = Math.max(100, 58 + (560 - titleWidth) / 2)
  ctx.save()
  ctx.translate(104, titleTop)
  ctx.rotate(Math.PI / 2)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(0,0,0,0.34)'
  ctx.font = `700 ${size}px ${SANS}`
  ctx.fillText(book.title, 1.5, 1.5)
  ctx.fillStyle = '#fbf4e6'
  ctx.fillText(book.title, 0, 0)
  ctx.restore()

  // 书名与作者之间的细线
  const ruleY = Math.min(H - 108, titleTop + titleWidth + 24)
  ctx.fillStyle = 'rgba(246,238,224,0.34)'
  ctx.fillRect(52, ruleY, 152, 1.5)

  // 作者：靠右一列竖排，从下往上读到书名下方
  const authorSize = 26
  ctx.font = `500 ${authorSize}px ${SANS}`
  const authorWidth = ctx.measureText(book.author).width
  const authorTop = Math.max(ruleY + 18, H - 78 - authorWidth)
  ctx.save()
  ctx.translate(196, authorTop)
  ctx.rotate(Math.PI / 2)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(250,243,229,0.88)'
  ctx.font = `500 ${authorSize}px ${SANS}`
  ctx.fillText(book.author, 0, 0)
  ctx.restore()

  // 底部的小标记，像出版社的 colophon
  ctx.save()
  ctx.translate(104, H - 68)
  ctx.rotate(Math.PI / 2)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(250,243,229,0.5)'
  ctx.font = `600 17px ${SANS}`
  ctx.fillText('ROOM · 01', 0, 0)
  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 16
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  cache.set(book.id, tex)
  return tex
}
