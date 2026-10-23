import * as THREE from 'three'

/**
 * 程序化纹理。全部用 canvas 现画，不下载任何贴图。
 * 目的不是"看见纹理"，而是让大块纯色表面有微观起伏，去掉塑料感。
 */
const cache = new Map<string, THREE.CanvasTexture>()

function make(
  key: string,
  w: number,
  h: number,
  repeat: [number, number],
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat[0], repeat[1])
  tex.anisotropy = 16
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  cache.set(key, tex)
  return tex
}

/** 深色木地板：板缝 + 错缝 + 细木纹 */
export function floorTexture() {
  return make('floor', 512, 512, [5, 5], (ctx) => {
    ctx.fillStyle = '#23262d'
    ctx.fillRect(0, 0, 512, 512)

    const planks = 8
    const w = 512 / planks
    for (let i = 0; i < planks; i++) {
      const x = i * w
      const base = 38 + Math.random() * 9
      const g = ctx.createLinearGradient(x, 0, x + w, 0)
      g.addColorStop(0, `rgb(${base},${base + 1},${base + 5})`)
      g.addColorStop(0.52, `rgb(${base + 10},${base + 10},${base + 14})`)
      g.addColorStop(1, `rgb(${base},${base + 1},${base + 5})`)
      ctx.fillStyle = g
      ctx.fillRect(x + 1, 0, w - 2, 512)

      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(x, 0, 1.6, 512)

      ctx.strokeStyle = 'rgba(255,255,255,0.035)'
      ctx.lineWidth = 1
      for (let k = 0; k < 5; k++) {
        const gx = x + 6 + Math.random() * (w - 12)
        ctx.beginPath()
        ctx.moveTo(gx, 0)
        ctx.bezierCurveTo(gx + 3, 170, gx - 3, 340, gx + 1, 512)
        ctx.stroke()
      }

      const seam = 40 + Math.random() * 420
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(x, seam, w, 1.6)
    }

    for (let i = 0; i < 2400; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.045})`
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1)
    }
  })
}

/** 墙面：几乎看不见的细砂，打散大面积纯色 */
export function wallTexture() {
  return make('wall', 256, 256, [6, 2], (ctx) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 6000; i++) {
      const a = Math.random() * 0.05
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1)
    }
  })
}

/** 织物：细密经纬，沙发表面不再是一块塑料 */
export function fabricTexture() {
  return make('fabric', 128, 128, [3, 3], (ctx) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 128, 128)
    ctx.strokeStyle = 'rgba(0,0,0,0.09)'
    ctx.lineWidth = 1
    for (let i = 0; i < 128; i += 3) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 128)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(128, i)
      ctx.stroke()
    }
  })
}

/** 地毯：斜向编织 */
export function rugTexture() {
  return make('rug', 128, 128, [4, 3], (ctx) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 128, 128)
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 1.4
    for (let i = -128; i < 256; i += 5) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + 128, 128)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(i, 128)
      ctx.lineTo(i + 128, 0)
      ctx.stroke()
    }
  })
}
