import * as THREE from 'three'

/** 等轴测构图用的默认机位（透视相机 + 小 fov 逼近正交）
 *  俯角 30°，距离 21：整座岛（含前沿地面）都在画面内。
 *  之前机位太近，最前面的地板角被裁出画外，房间看着“站不住” */
export const OVERVIEW = {
  position: new THREE.Vector3(12.9, 11.5, 12.9),
  target: new THREE.Vector3(0.1, 1.05, 0.1),
  fov: 34,
}

/** 移动端：抬高拉远，允许左右裁切，靠底部导航兵底 */
export const OVERVIEW_MOBILE = {
  position: new THREE.Vector3(15.4, 13.9, 15.4),
  target: new THREE.Vector3(0, 0.8, 0),
  fov: 34,
}

export const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

/** 与 CSS 同一条缓动，供 JS 侧 lerp 使用 */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

export const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt))
