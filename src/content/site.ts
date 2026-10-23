import type { Book, SocialLink, StationDef, SkillGroup, TimelineItem, WorkItem } from '../types'

/**
 * 站点全部文案集中在这里，改内容不需要碰组件。
 * 把下面这些占位信息换成你自己的即可。
 */
export const site = {
  brand: 'ROOM 01',
  name: '陈思远',
  latin: 'SIYUAN CHEN',
  role: '前端工程师 · 交互设计',
  tagline: '一间住在浏览器里的房间',
  intro:
    '我做界面，也做界面之外的那点空间感。白天写业务，夜里用 Three.js 和研究怎么让一个页面有重量、有温度、有呼吸。这间房间是我所有作品和习惯的收容所，点一下里面的东西，它们会告诉你我是谁。',
  location: '杭州 · 中国',
  availability: '2026 Q4 可接新项目',
  email: 'hello@room01.dev',
}

export const stations: StationDef[] = [
  {
    id: 'works',
    code: '01',
    label: 'WORKS',
    cn: '作品',
    hint: '书桌与屏幕',
    anchor: [-3.05, 2.35, -0.35],
    pose: { position: [0.9, 3.3, 2.4], target: [-3.15, 1.45, -0.3], fov: 36 },
  },
  {
    id: 'about',
    code: '02',
    label: 'ABOUT',
    cn: '关于',
    hint: '靠墙的书架',
    anchor: [-3.95, 2.95, -2.7],
    pose: { position: [-0.55, 2.85, 0.55], target: [-4.2, 1.55, -2.7], fov: 34 },
  },
  {
    id: 'skills',
    code: '03',
    label: 'SKILLS',
    cn: '技能',
    hint: '墙上的海报',
    anchor: [-4.15, 2.35, 2.62],
    pose: { position: [-0.4, 2.9, 5.0], target: [-4.7, 2.0, 2.62], fov: 36 },
  },
  {
    id: 'contact',
    code: '04',
    label: 'CONTACT',
    cn: '联系',
    hint: '沙发与茶几',
    anchor: [2.9, 1.8, 0.05],
    pose: { position: [1.5, 3.3, 4.3], target: [2.9, 0.95, -0.35], fov: 36 },
  },
]

export const works: WorkItem[] = [
  {
    code: 'W-01',
    title: '留声',
    subtitle: '纯前端音乐播放站点',
    year: '2026',
    tags: ['React', 'Web Audio', 'PWA'],
    desc: '一个不依赖后端的本地音乐播放器。自建音频队列、歌词滚动、封面取色，全部在浏览器里完成，断网也能放。',
    link: '#',
    cover: 'wave',
    palette: ['#ff8a5b', '#ffd0a8'],
    role: '设计 / 前端',
    period: '2026.03 – 2026.06',
    highlights: [
      '音频队列与播放状态全部落到 IndexedDB，刷新与断网都不丢进度',
      '从封面提取主色驱动界面，每张专辑有自己的配色',
      '首屏 gzip 控制在 120KB，冷启动到可播放 1.2 秒',
    ],
    detail:
      '起因很简单：想在自己的手机上听本地无损，但不想装一个满屏广告的播放器。于是把它做成了纯前端应用——没有账号、没有服务端、没有任何埋点。\n技术上最麻烦的是播放队列的一致性：切歌、续播、缓存回收都会让状态漂移。最后用一个单向的状态机兜住了所有分支，队列变更只允许走 dispatch，所有副作用收敛在一处。',
  },
  {
    code: 'W-02',
    title: 'PRISM OS',
    subtitle: '光场交互实验',
    year: '2026',
    tags: ['Three.js', 'GLSL', 'R3F'],
    desc: '把界面本身做成展品：每一片光都是一个可拖拽的容器，颜色与流动由同一套噪声场驱动，帧率不足时自动降低切片密度。',
    link: '#',
    cover: 'orbit',
    palette: ['#6ee7d7', '#8fb0e0'],
    role: '概念 / 图形开发',
    period: '2026.01 – 2026.04',
    highlights: [
      '自写着色器把噪声场、色散与景深压缩进单次 pass',
      '所有交互参数暴露成可序列化的 URL，方便复现某一帧',
      '按实测帧率动态调整切片密度，低端机也能跑满 60',
    ],
    detail:
      '这是一个关于「界面还能是什么形状」的练习。我没有做任何页面，只做了一片可以拨动的光。\n实现上，色散和流动共用同一张三维噪声，靠采样偏移量控制两者的耦合程度，这样颜色变化不会显得随机。最后把整套参数压成一段短码放进 URL，任何人调到一个满意的状态都可以直接分享出去。',
  },
  {
    code: 'W-03',
    title: 'ROOM 01',
    subtitle: '等轴测空间主页',
    year: '2026',
    tags: ['R3F', 'Isometric', 'Motion'],
    desc: '就是你正在看的这间房间。用基础几何体拼出全部家具，用一盏台灯当主光源，用推镜代替翻页。',
    link: '#',
    cover: 'prism',
    palette: ['#ff8a5b', '#6ee7d7'],
    role: '设计 / 前端 / 3D',
    period: '2026.10',
    highlights: [
      '全部家具由基础几何体拼装，没有引入任何模型文件',
      '程序化生成环境贴图，不下载 HDR 也能让 PBR 材质有层次',
      'hover / 点击 / 拖拽三种指针意图用位移阈值区分',
    ],
    detail:
      '我想要一个「可以待一会儿」的主页，而不是一张会滚动的简历。于是把信息拆成四件家具：书桌是作品，书架是经历，海报是技能，沙发是联系方式。\n难点在于动线的克制：镜头不能乱飞，转场要让用户知道自己在哪。最后用固定的四个机位 + 阻尼插值解决，返回总览永远回到同一个视角，用户的空间记忆不会被破坏。',
  },
  {
    code: 'W-04',
    title: 'SILENT FEED',
    subtitle: '极简阅读流',
    year: '2025',
    tags: ['TypeScript', 'IndexedDB'],
    desc: '一个只做一件事的阅读器：导入、排序、读。没有推荐算法，没有红点，进度存在本地。',
    link: '#',
    cover: 'grid',
    palette: ['#e9e5dd', '#8fb0e0'],
    role: '独立开发',
    period: '2025.07 – 2025.11',
    highlights: [
      'RSS 与网页剪藏统一成一种条目结构，导入即读',
      '全文搜索基于倒排索引，万级条目下响应低于 30ms',
      '零账号体系，所有数据只在本地浏览器',
    ],
    detail:
      '市面上的阅读器都在想办法让你多读一点、再读一点。我想要的恰恰相反：打开、读完、关掉。\n所以界面上只有一条时间线和一个搜索框，没有未读数字，没有推荐位。为了让「关掉」更干脆，我把同步做成了可选的导出文件，而不是后台常驻的云服务。',
  },
]

export const skillGroups: SkillGroup[] = [
  {
    title: '语言',
    items: [
      { name: 'TypeScript', level: 0.92 },
      { name: 'GLSL', level: 0.72 },
      { name: 'JavaScript', level: 0.9 },
      { name: 'Python', level: 0.55 },
    ],
  },
  {
    title: '框架',
    items: [
      { name: 'React', level: 0.94 },
      { name: 'Three.js / R3F', level: 0.82 },
      { name: 'Vite', level: 0.86 },
      { name: 'Tailwind', level: 0.88 },
    ],
  },
  {
    title: '手感',
    items: [
      { name: '动效设计', level: 0.8 },
      { name: 'Figma', level: 0.75 },
      { name: '性能调优', level: 0.78 },
      { name: '排版', level: 0.7 },
    ],
  },
]

export const timeline: TimelineItem[] = [
  {
    year: '2026',
    title: '把界面做成空间',
    detail: '开始用 Three.js 和着色器做前台交互，不再满足于二维的层级关系。',
  },
  {
    year: '2024',
    title: '独立接项目',
    detail: '从 0 到 1 交付了十余个中小型站点，学会在审美和排期之间找平衡。',
  },
  {
    year: '2022',
    title: '写第一行生产代码',
    detail: '正式进入前端，从组件库和业务表单开始，慢慢养成对 8px 的执念。',
  },
]

export const socials: SocialLink[] = [
  { label: 'EMAIL', value: 'hello@room01.dev', href: 'mailto:hello@room01.dev' },
  { label: 'GITHUB', value: 'github.com/yourname', href: 'https://github.com' },
  { label: 'X', value: '@yourname', href: 'https://x.com' },
  { label: 'BLOG', value: 'notes.room01.dev', href: '#' },
]

/**
 * 书架上的真书。书脊上的字由 title 现场绘制，点开是阅读面板。
 * 换书只需要改这个数组（4 层共 10 本，超过 10 本会在书架上循环摆放）。
 */
export const books: Book[] = [
  {
    id: 'zhu',
    title: '设计中的设计',
    author: '原研哉',
    color: '#c0553f',
    tag: 'DESIGN',
    note: '这本书真正说的不是设计，而是“重新看一遍已经看过的东西”。原研哉把“空”当成一种容器：不把话说满，让使用者把自己的经验填进去。我做界面时经常想起这个——留白不是没有内容，是把内容交给对方。',
  },
  {
    id: 'norman',
    title: '设计心理学',
    author: '唐·诺曼',
    color: '#4a6b78',
    tag: 'USABILITY',
    note: '每次有人问“这个按钮为什么没人点”，我都会想起书里那句关于门把手的话：如果一扇门需要贴“推”，那它已经失败了。后来我做任何交互，先问自己：能不能不写说明。',
  },
  {
    id: 'type',
    title: 'Thinking with Type',
    author: 'Ellen Lupton',
    color: '#c9a227',
    tag: 'TYPE',
    note: '不是排版史，是一本“怎么让字站好”的工具书。字距、行高、栅格这些事看着枯燥，但页面最后那点说不清的舒服，基本都藏在这些参数里。常翻常新。',
  },
  {
    id: 'mei',
    title: '美的历程',
    author: '李泽厚',
    color: '#7a5a46',
    tag: 'AESTHETICS',
    note: '把中国几千年的器物、绘画、诗歌串成一条线，读的时候会突然明白某些“好看的形状”到底从哪来。做东方气质的界面时，这本书比任何设计教程都有用。',
  },
  {
    id: 'sapiens',
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    color: '#556b4e',
    tag: 'HISTORY',
    note: '最启发我的是“共同想象”那一部分：公司、货币、国家都是故事。界面某种意义上也是——按钮背后什么都没有，但所有人相信点了会发生事，它就成了。',
  },
  {
    id: 'threebody',
    title: '三体',
    author: '刘慈欣',
    color: '#2f3a4e',
    tag: 'SCI-FI',
    note: '读它的时候总在想尺度：一个文明的时间以万年计，我们为一个像素争一下午。但这不矛盾——正因为尺度那么大，眼前这点认真才有意义。窗外的星星是从这里来的。',
  },
  {
    id: 'prince',
    title: '小王子',
    author: '圣埃克苏佩里',
    color: '#b98a3c',
    tag: 'FICTION',
    note: '每隔几年重读一次，每次读到的都不是同一本。小时候读的是星球和狐狸，现在读的是“你为你的玫瑰花费的时间”。做东西也一样，价值往往由投入的时间定义。',
  },
  {
    id: 'outsider',
    title: '局外人',
    author: '加缪',
    color: '#6b6f78',
    tag: 'FICTION',
    note: '一个不愿表演情绪的人被世界判了死刑。加缪写得极冷，但读完反而觉得自由：如果一切都没有预设的意义，那意义只能由自己给。',
  },
  {
    id: 'code',
    title: '代码大全',
    author: 'Steve McConnell',
    color: '#8a3f3a',
    tag: 'ENGINEERING',
    note: '厚得像砖，但每次重构前翻一翻总能找到一条对症的。最记得的是“变量名是最便宜的文档”——后来我改名字的时间，比写注释多得多。',
  },
  {
    id: 'csapp',
    title: '深入理解计算机系统',
    author: 'Bryant / O Hallaron',
    color: '#3f4f6b',
    tag: 'SYSTEMS',
    note: '前端也需要知道指针、内存和缓存。读完最大的收获不是会写 C，而是知道一行 JS 在机器里到底发生了什么——性能优化从此不再是玄学。',
  },
]

export const navHint = '拖动环视 · 点击物件 · ESC 返回'