/** 全局指针状态：用来区分「拖拽环视」和「点击物件」 */
export const pointerState = {
  down: false,
  moved: 0,
  /** 归一化坐标 -1..1 */
  nx: 0,
  ny: 0,
  x: 0,
  y: 0,
  /** 精细指针（鼠标/触控板）才启用 hover 与拖拽环视 */
  fine:
    typeof window !== 'undefined' ? window.matchMedia('(pointer: fine)').matches : true,
}
