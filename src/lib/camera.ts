import * as THREE from 'three'

/** 等轴测构图用的默认机位（透视相机 + 小 fov 逼近正交） */
export const OVERVIEW = {
  position: new THREE.Vector3(11.3, 9.5, 11.3),
  target: new THREE.Vector3(0, 1.4, 0),
  fov: 33,
}

/** 移动端：抬高拉远，允许左右裁切，靠底部导航兵底 */
export const OVERVIEW_MOBILE = {
  position: new THREE.Vector3(13.9, 11.7, 13.9),
  target: new THREE.Vector3(0, 1.0, 0),
  fov: 34,
}

export const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

/** 与 CSS 同一条缓动，供 JS 侧 lerp 使用 */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

export const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt))
