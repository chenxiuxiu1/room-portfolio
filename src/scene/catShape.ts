import * as THREE from 'three'

/**
 * 躯干用「放样」而不是堆球：
 * 沿脊柱给一串椭圆截面，再把它们连成一张连续的皮。
 * 堆球永远做不出猫那种「胸深、腰收、胯宽」的长条形，侧看就是一只熊。
 */
type Station = {
  /** 沿身体轴向的位置（+z 朝头，-z 朝尾） */
  z: number
  /** 截面半宽 */
  w: number
  /** 截面半高 */
  h: number
  /** 截面中心高度 */
  y: number
}

/** 从尾根到脖颈，卧姿。数值是照着照片里的侧影量的 */
const BODY: Station[] = [
  { z: -0.245, w: 0.075, h: 0.072, y: 0.118 },
  { z: -0.215, w: 0.132, h: 0.118, y: 0.136 },
  { z: -0.16, w: 0.166, h: 0.142, y: 0.146 },
  { z: -0.09, w: 0.176, h: 0.152, y: 0.15 },
  { z: -0.01, w: 0.164, h: 0.146, y: 0.15 },
  { z: 0.06, w: 0.157, h: 0.145, y: 0.152 },
  { z: 0.13, w: 0.161, h: 0.149, y: 0.156 },
  { z: 0.19, w: 0.138, h: 0.129, y: 0.166 },
  { z: 0.228, w: 0.1, h: 0.097, y: 0.181 },
]

/** 贴垫子的那一面轻微压平，猫才不会像悬空的球 */
const FLOOR = 0.008

export function buildBodyGeometry(seg = 26) {
  const positions: number[] = []
  const indices: number[] = []
  const n = BODY.length

  for (const s of BODY) {
    // 整体压低一点：背线低于头，才留得出脖子，不然头会像海豹一样长在背上
    const hh = s.h * 0.88
    const yy = s.y - 0.012
    for (let j = 0; j < seg; j++) {
      const a = (j / seg) * Math.PI * 2
      const cx = Math.cos(a)
      const sy = Math.sin(a)
      let y = yy + sy * hh
      if (y < FLOOR) y = FLOOR + (y - FLOOR) * 0.22
      positions.push(cx * s.w, y, s.z)
    }
  }

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * seg + j
      const b = i * seg + ((j + 1) % seg)
      const c = (i + 1) * seg + j
      const d = (i + 1) * seg + ((j + 1) % seg)
      indices.push(a, c, b, b, c, d)
    }
  }

  // 两端封口：中心点 + 扇形三角（绕序朝外，否则会被背面剔除，露出垫子）
  const capStart = positions.length / 3
  positions.push(0, BODY[0].y - 0.012, BODY[0].z)
  const capEnd = positions.length / 3
  positions.push(0, BODY[n - 1].y - 0.012, BODY[n - 1].z)
  for (let j = 0; j < seg; j++) {
    const jn = (j + 1) % seg
    indices.push(capStart, jn, j)
    const base = (n - 1) * seg
    indices.push(capEnd, base + j, base + jn)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}
