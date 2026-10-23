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

/** 木纹：直纹 + 导管孔 + 几道长年轮。
 *  底色接近白，与材质 color 相乘后才显木色，所以一套贴图能用在深浅不同的木器上。 */
export function woodTexture(repeat: [number, number] = [2, 2]) {
  return make(`wood-${repeat[0]}x${repeat[1]}`, 512, 512, repeat, (ctx) => {
    ctx.fillStyle = '#f2eee8'
    ctx.fillRect(0, 0, 512, 512)

    // 直纹：细密、平行，密度从这里定
    for (let i = 0; i < 170; i++) {
      const y = Math.random() * 512
      const h = 0.5 + Math.random() * 2.3
      const a = 0.04 + Math.random() * 0.15
      ctx.fillStyle =
        Math.random() > 0.45 ? `rgba(78,54,34,${a})` : `rgba(255,249,238,${a * 0.7})`
      ctx.fillRect(0, y, 512, h)
    }

    // 年轮：几道横贯的慢弯
    ctx.lineWidth = 1.5
    for (let i = 0; i < 6; i++) {
      const y0 = Math.random() * 512
      const amp = 3 + Math.random() * 5
      ctx.strokeStyle = `rgba(74,50,30,${0.05 + Math.random() * 0.08})`
      ctx.beginPath()
      for (let x = 0; x <= 512; x += 32) {
        const y = y0 + Math.sin((x / 512) * Math.PI * 2 + i * 1.7) * amp
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    // 导管孔：短而扁的暗点，木器表面不再是一块塑料
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      ctx.fillStyle = `rgba(58,38,22,${0.05 + Math.random() * 0.13})`
      ctx.beginPath()
      ctx.ellipse(x, y, 2.4 + Math.random() * 4, 0.5 + Math.random() * 0.7, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  })
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

/** 墙面：几乎看不见的细砂，打散大面积纯色
 *  注意：噪声颗粒如果小于 1 个屏幕像素，会在移动时闪烁成"满屏噪点"，
 *  所以这里用低透明度的软点、并降低重复次数，让它退成一层肌理而不是颗粒。 */
export function wallTexture() {
  return make('wall', 256, 256, [4, 1.6], (ctx) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 2200; i++) {
      const a = Math.random() * 0.035
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`
      ctx.beginPath()
      ctx.arc(Math.random() * 256, Math.random() * 256, 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

/** 绒毛：软团块 + 顺向细毛。只做 bumpMap，让白毛表面有走向，不至于像塑料 */
export function furBumpTexture() {
  const tex = make('fur-bump', 256, 256, [5, 5], (ctx) => {
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, 256, 256)

    // 低频团块：毛被光打出来的起伏
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const r = 8 + Math.random() * 18
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      const up = Math.random() > 0.5
      g.addColorStop(0, up ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)')
      g.addColorStop(1, 'rgba(128,128,128,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // 高频细毛：短促的顺向笔触
    ctx.lineCap = 'round'
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const a = Math.random() * Math.PI * 2
      const len = 3 + Math.random() * 5
      ctx.strokeStyle =
        Math.random() > 0.5 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
      ctx.stroke()
    }
  })
  // bumpMap 是数据贴图，不能走 sRGB
  tex.colorSpace = THREE.NoColorSpace
  return tex
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
