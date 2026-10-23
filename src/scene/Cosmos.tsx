import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useRoom } from '../lib/store'

/**
 * 星点统一材质：用 gl_PointCoord 现场画一个圆，不依赖任何贴图。
 * 上一版用 canvas 贴图做 sprite，在大尺寸下会露出方形边缘，这里彻底换掉。
 */
function StarPoints({
  positions,
  colors,
  size,
  opacity,
}: {
  positions: Float32Array
  colors: Float32Array
  size: number
  opacity: number
}) {
  const height = useThree((s) => s.size.height)
  const dpr = useThree((s) => s.viewport.dpr)

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uSize: { value: size },
          uScale: { value: height * dpr * 0.5 },
          uOpacity: { value: opacity },
        },
        vertexShader: `
          attribute vec3 color;
          varying vec3 vColor;
          uniform float uSize;
          uniform float uScale;
          void main() {
            vColor = color;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = max(1.2, uSize * (uScale / max(0.001, -mv.z)));
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          uniform float uOpacity;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.0, d);
            a *= a;
            gl_FragColor = vec4(vColor, a * uOpacity);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [size, opacity, height, dpr],
  )

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <primitive object={mat} attach="material" />
    </points>
  )
}

/** 星云用的软噪声贴图：几十层低透明度径向渐变叠起来 */
function nebulaTexture(tint: [number, number, number]) {
  const size = 512
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  for (let i = 0; i < 46; i++) {
    const x = size / 2 + (Math.random() - 0.5) * size * 0.86
    const y = size / 2 + (Math.random() - 0.5) * size * 0.72
    const r = 34 + Math.random() * 130
    const a = 0.018 + Math.random() * 0.05
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${tint[0]},${tint[1]},${tint[2]},${a})`)
    g.addColorStop(0.55, `rgba(${tint[0]},${tint[1]},${tint[2]},${a * 0.45})`)
    g.addColorStop(1, `rgba(${tint[0]},${tint[1]},${tint[2]},0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** 气态行星的表面：一圈圈被扰动的纬向云带 */
function gasTexture() {
  const w = 1024
  const h = 512
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#15213a'
  ctx.fillRect(0, 0, w, h)

  const bands = ['#1b2a49', '#274066', '#39567f', '#56759e', '#8ea6c6', '#c4d2e4', '#3d5c8a', '#1f3355']
  let y = -20
  while (y < h + 20) {
    const bh = 10 + Math.random() * 46
    ctx.fillStyle = bands[Math.floor(Math.random() * bands.length)]
    ctx.globalAlpha = 0.28 + Math.random() * 0.4
    const wobble = Math.random() * 6
    const freq = 0.004 + Math.random() * 0.008
    const phase = Math.random() * Math.PI * 2
    ctx.beginPath()
    for (let x = 0; x <= w; x += 8) {
      const yy = y + Math.sin(x * freq + phase) * wobble
      if (x === 0) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    }
    for (let x = w; x >= 0; x -= 8) {
      const yy = y + bh + Math.sin(x * freq + phase + 0.6) * wobble
      ctx.lineTo(x, yy)
    }
    ctx.closePath()
    ctx.fill()
    y += bh * 0.62
  }
  ctx.globalAlpha = 1

  const top = ctx.createLinearGradient(0, 0, 0, h * 0.22)
  top.addColorStop(0, 'rgba(6,12,24,0.85)')
  top.addColorStop(1, 'rgba(6,12,24,0)')
  ctx.fillStyle = top
  ctx.fillRect(0, 0, w, h * 0.22)
  const bottom = ctx.createLinearGradient(0, h, 0, h * 0.78)
  bottom.addColorStop(0, 'rgba(6,12,24,0.9)')
  bottom.addColorStop(1, 'rgba(6,12,24,0)')
  ctx.fillStyle = bottom
  ctx.fillRect(0, h * 0.78, w, h * 0.22)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.anisotropy = 4
  return tex
}

/** 远景星点：整个天球的底色 */
function StarField() {
  const quality = useRoom((s) => s.quality)
  const group = useRef<THREE.Group>(null)

  const data = useMemo(() => {
    const n = quality === 0 ? 3200 : 7400
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const warm = new THREE.Color('#ffe6c4')
    const cool = new THREE.Color('#b9cdf2')
    const tmp = new THREE.Color()
    for (let i = 0; i < n; i++) {
      const r = 42 + Math.pow(Math.random(), 0.7) * 76
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.86 + 4
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 24
      tmp.lerpColors(cool, warm, Math.random() * Math.random())
      col[i * 3] = tmp.r
      col[i * 3 + 1] = tmp.g
      col[i * 3 + 2] = tmp.b
    }
    return { pos, col }
  }, [quality])

  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.0035
  })

  return (
    <group ref={group}>
      <StarPoints positions={data.pos} colors={data.col} size={0.16} opacity={0.95} />
    </group>
  )
}

/** 银河带：一条斜跨天区的密集星尘，中心暖、边缘冷 */
function GalaxyBand() {
  const quality = useRoom((s) => s.quality)

  const data = useMemo(() => {
    const n = quality === 0 ? 2600 : 6800
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const core = new THREE.Color('#f2e3c8')
    const edge = new THREE.Color('#7f9ed6')
    const tmp = new THREE.Color()
    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * 210
      const t = Math.abs(x) / 105
      const spread = 5 + (1 - t) * 13
      pos[i * 3] = x
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.8 - 6
      tmp.lerpColors(edge, core, Math.pow(1 - t, 1.6))
      col[i * 3] = tmp.r
      col[i * 3 + 1] = tmp.g
      col[i * 3 + 2] = tmp.b
    }
    return { pos, col }
  }, [quality])

  return (
    <group rotation={[0.62, 0.18, -0.46]}>
      <StarPoints positions={data.pos} colors={data.col} size={0.13} opacity={0.5} />
    </group>
  )
}

/** 远处的螺旋星系：两条臂 + 明亮的核球 */
function Spiral() {
  const quality = useRoom((s) => s.quality)
  const group = useRef<THREE.Group>(null)

  const data = useMemo(() => {
    const n = quality === 0 ? 3600 : 9600
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const core = new THREE.Color('#ffd9a6')
    const mid = new THREE.Color('#cfd6ff')
    const edge = new THREE.Color('#6f8fdc')
    const tmp = new THREE.Color()

    for (let i = 0; i < n; i++) {
      const t = Math.pow(Math.random(), 0.62)
      const arm = i % 2
      const angle =
        t * 5.6 + (arm * Math.PI * 2) / 2 + (Math.random() - 0.5) * (0.62 - t * 0.3)
      const r = 1.4 + t * 17
      const spread = 0.5 + t * 1.6
      pos[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * (0.3 + t * 0.55) * (1 - t * 0.45)
      pos[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * spread

      if (t < 0.22) tmp.lerpColors(core, mid, t / 0.22)
      else tmp.lerpColors(mid, edge, (t - 0.22) / 0.78)
      col[i * 3] = tmp.r
      col[i * 3 + 1] = tmp.g
      col[i * 3 + 2] = tmp.b
    }
    return { pos, col }
  }, [quality])

  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.014
  })

  return (
    <group position={[30, 15, -82]} rotation={[0.92, 0.24, 0.36]}>
      <group ref={group}>
        <StarPoints positions={data.pos} colors={data.col} size={0.2} opacity={0.85} />
      </group>
    </group>
  )
}

/** 星云：粒子云 + 两张始终面向相机的软噪声，粒子给颗粒，噪声给气体 */
function Nebula() {
  const quality = useRoom((s) => s.quality)
  const group = useRef<THREE.Group>(null)
  const sheets = useRef<THREE.Mesh[]>([])
  const { camera } = useThree()

  const sheetsTex = useMemo(
    () => [nebulaTexture([150, 120, 255]), nebulaTexture([90, 170, 220])],
    [],
  )

  const clouds = useMemo(
    () => [
      { center: [-19, 9, -46] as const, color: '#6a55e8', spread: 10, n: 720 },
      { center: [18, -4, -52] as const, color: '#2f86b8', spread: 9, n: 640 },
      { center: [0, 20, -60] as const, color: '#b26a44', spread: 11, n: 520 },
      { center: [-30, -9, -38] as const, color: '#8c4f8f', spread: 7, n: 420 },
      { center: [26, 18, -40] as const, color: '#3f6f9f', spread: 7, n: 380 },
    ],
    [],
  )

  const data = useMemo(
    () =>
      clouds.map((c) => {
        const n = quality === 0 ? Math.round(c.n * 0.4) : c.n
        const pos = new Float32Array(n * 3)
        const col = new Float32Array(n * 3)
        const tint = new THREE.Color(c.color)
        for (let i = 0; i < n; i++) {
          const r = Math.pow(Math.random(), 0.6) * c.spread
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          pos[i * 3] = c.center[0] + r * Math.sin(phi) * Math.cos(theta)
          pos[i * 3 + 1] = c.center[1] + r * Math.cos(phi) * 0.55
          pos[i * 3 + 2] = c.center[2] + r * Math.sin(phi) * Math.sin(theta) * 0.75
          const f = 0.55 + Math.random() * 0.45
          col[i * 3] = tint.r * f
          col[i * 3 + 1] = tint.g * f
          col[i * 3 + 2] = tint.b * f
        }
        return { pos, col }
      }),
    [clouds, quality],
  )

  useFrame((state) => {
    if (group.current) group.current.rotation.y = -state.clock.elapsedTime * 0.004
    sheets.current.forEach((m) => {
      if (m) m.quaternion.copy(camera.quaternion)
    })
  })

  return (
    <group ref={group}>
      {data.map((d, i) => (
        <StarPoints key={i} positions={d.pos} colors={d.col} size={1.25} opacity={0.14} />
      ))}

      {[
        { pos: [-20, 9, -58] as const, tex: 0, size: [52, 34] as const, op: 0.55 },
        { pos: [18, -4, -62] as const, tex: 1, size: [46, 30] as const, op: 0.45 },
      ].map((s, i) => (
        <mesh
          key={`sheet-${i}`}
          ref={(el) => {
            if (el) sheets.current[i] = el
          }}
          position={s.pos}
        >
          <planeGeometry args={[s.size[0], s.size[1]]} />
          <meshBasicMaterial
            map={sheetsTex[s.tex]}
            transparent
            opacity={s.op}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

/** 带环的气态巨行星 + 一颗暖色小行星 */
function Planet() {
  const { camera } = useThree()
  const glow = useRef<THREE.Mesh>(null)
  const body = useRef<THREE.Mesh>(null)
  const moon = useRef<THREE.Group>(null)
  const tex = useMemo(() => gasTexture(), [])

  useFrame((state, delta) => {
    if (glow.current) glow.current.lookAt(camera.position)
    if (body.current) body.current.rotation.y += delta * 0.05
    if (moon.current) {
      const t = state.clock.elapsedTime * 0.16
      moon.current.position.set(Math.cos(t) * 8.6, 7.2 + Math.sin(t) * 1.2, Math.sin(t) * 6.4 - 2)
    }
  })

  return (
    <group position={[0, 4.5, -34]}>
      <mesh ref={body} rotation={[0.18, 0, 0.14]}>
        <sphereGeometry args={[2.6, 96, 64]} />
        <meshStandardMaterial map={tex} roughness={0.92} metalness={0.04} />
      </mesh>

      {/* 大气边缘：贴相机的环形光 */}
      <mesh ref={glow} position={[0, 0, 0.1]}>
        <ringGeometry args={[2.6, 2.94, 128]} />
        <meshBasicMaterial
          color="#7fa8e8"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 行星环：内环实、外环淡，两层叠出厚度 */}
      <mesh rotation={[1.22, 0.2, 0.34]}>
        <ringGeometry args={[3.42, 4.18, 160]} />
        <meshBasicMaterial
          color="#a8bfe0"
          transparent
          opacity={0.24}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[1.22, 0.2, 0.34]}>
        <ringGeometry args={[4.34, 4.66, 160]} />
        <meshBasicMaterial
          color="#8ea8ce"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 卫星，缓慢绕行 */}
      <group ref={moon}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 24]} />
          <meshStandardMaterial color="#8d8796" roughness={0.95} />
        </mesh>
      </group>
    </group>
  )
}

/** 远处一颗暖色行星，与主行星拉开色温差 */
function EmberPlanet() {
  return (
    <group position={[-24, 14, -56]}>
      <mesh>
        <sphereGeometry args={[1.15, 48, 32]} />
        <meshStandardMaterial
          color="#7d3f33"
          roughness={0.9}
          emissive="#3a140e"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <ringGeometry args={[1.15, 1.32, 64]} />
        <meshBasicMaterial
          color="#e08a63"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/** 流星：一颗亮头 + 几颗递减的尾迹球 */
function Meteor() {
  const group = useRef<THREE.Group>(null)
  const state = useRef({
    t: 9,
    from: new THREE.Vector3(),
    dir: new THREE.Vector3(0.6, -0.4, -0.6),
  })
  const dirV = new THREE.Vector3(0, 0, 1)

  const tail = [
    { z: 0, r: 0.085, o: 1 },
    { z: -0.9, r: 0.06, o: 0.62 },
    { z: -1.8, r: 0.044, o: 0.4 },
    { z: -2.7, r: 0.03, o: 0.24 },
    { z: -3.6, r: 0.02, o: 0.13 },
  ]

  useFrame((_, delta) => {
    const s = state.current
    s.t += delta
    const g = group.current
    if (!g) return

    if (s.t > 1.5) {
      s.t = 0
      s.from.set(-44 + Math.random() * 34, 16 + Math.random() * 20, -54 + Math.random() * 22)
      s.dir
        .set(0.5 + Math.random() * 0.5, -0.55 - Math.random() * 0.3, 0.2 + Math.random() * 0.4)
        .normalize()
    }

    if (s.t < 0.4) {
      g.visible = false
      return
    }

    const p = (s.t - 0.4) / 1.1
    if (p > 1) {
      g.visible = false
      return
    }

    g.visible = true
    g.position.copy(s.from).addScaledVector(s.dir, p * 46)
    g.quaternion.setFromUnitVectors(dirV, s.dir)
    const fade = 1 - Math.pow(p, 2.4)
    g.scale.setScalar(0.6 + fade * 0.9)
    g.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
      mat.opacity = tail[i].o * fade
    })
  })

  return (
    <group ref={group} visible={false}>
      {tail.map((t, i) => (
        <mesh key={i} position={[0, 0, t.z]}>
          <sphereGeometry args={[t.r, 12, 10]} />
          <meshBasicMaterial
            color="#eaf3ff"
            transparent
            opacity={t.o}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

/** 近景尘埃：贴着相机路径，环视时有视差，空间才是立体的 */
function Dust() {
  const quality = useRoom((s) => s.quality)
  const group = useRef<THREE.Group>(null)

  const data = useMemo(() => {
    const n = quality === 0 ? 700 : 1800
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 54
      pos[i * 3 + 1] = -4 + Math.random() * 26
      pos[i * 3 + 2] = -4 - Math.random() * 34
      const f = 0.45 + Math.random() * 0.5
      col[i * 3] = 0.62 * f
      col[i * 3 + 1] = 0.7 * f
      col[i * 3 + 2] = 0.85 * f
    }
    return { pos, col }
  }, [quality])

  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.04) * 0.06
  })

  return (
    <group ref={group}>
      <StarPoints positions={data.pos} colors={data.col} size={0.045} opacity={0.55} />
    </group>
  )
}

/** 窗外的星野：只有在 space 模式下才挂载 */
export default function Cosmos() {
  return (
    <group>
      <pointLight position={[-16, 20, -14]} intensity={900} distance={80} decay={2} color="#cfe2ff" />
      <directionalLight position={[-8, 12, 6]} intensity={1.1} color="#9fc2f0" />
      <StarField />
      <GalaxyBand />
      <Spiral />
      <Nebula />
      <Planet />
      <EmberPlanet />
      <Meteor />
      <Dust />
    </group>
  )
}
