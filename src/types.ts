export type SectionId = 'works' | 'about' | 'skills' | 'contact'

export type Vec3 = [number, number, number]

export interface CameraPose {
  position: Vec3
  target: Vec3
  fov?: number
}

export interface StationDef {
  id: SectionId
  /** 序号，用于 HUD */
  code: string
  label: string
  cn: string
  hint: string
  /** 悬浮标签锚点（世界坐标） */
  anchor: Vec3
  /** 聚焦机位 */
  pose: CameraPose
}

export type CoverPattern = 'grid' | 'orbit' | 'prism' | 'wave'

export interface WorkItem {
  code: string
  title: string
  subtitle: string
  year: string
  tags: string[]
  desc: string
  link: string
  /** 程序化封面形态，不依赖任何图片资源 */
  cover: CoverPattern
  /** 封面主色（两色） */
  palette: [string, string]
  /** 我在项目里的角色 */
  role: string
  /** 时间跨度 */
  period: string
  /** 三条要点 */
  highlights: string[]
  /** 详情正文 */
  detail: string
}

export interface SkillGroup {
  title: string
  items: { name: string; level: number }[]
}

export interface TimelineItem {
  year: string
  title: string
  detail: string
}

export interface SocialLink {
  label: string
  value: string
  href: string
}

export interface Book {
  id: string
  /** 书脊上印的名字 */
  title: string
  author: string
  /** 书脊底色 */
  color: string
  /** 分类，显示在阅读面板右上 */
  tag: string
  /** 为什么留着它 / 读到的一句话 */
  note: string
}
