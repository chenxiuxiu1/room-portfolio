import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing'
import { SMAAPreset } from 'postprocessing'
import Island from './Island'
import Walls from './Walls'
import Desk from './Desk'
import Shelf from './Shelf'
import Skills from './Skills'
import Sofa from './Sofa'
import Decor from './Decor'
import Cosmos from './Cosmos'
import { Bench, GuitarUnit, MusicRug, PianoUnit } from './MusicCorner'
import Cat from './Cat'
import Rig from './Rig'
import Hotspots from './Hotspots'
import { useRoom } from '../lib/store'

/** 程序化环境贴图：不用下载任何 HDR，也能让 PBR 材质有反射和层次 */
function Environment() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const rt = pmrem.fromScene(room, 0.04)
    scene.environment = rt.texture
    scene.environmentIntensity = 0.32
    room.dispose()
    pmrem.dispose()
    return () => {
      scene.environment = null
      rt.dispose()
    }
  }, [gl, scene])

  return null
}

/** 两套氛围预设：夜色偏冷、黄昏偏暖。切的是光，不是主题色 */
const PRESETS = {
  night: {
    ambient: 0.48,
    hemi: 0.55,
    key: 1.05,
    fill: 0.42,
    window: 2.6,
    wash: 1.2,
    sofa: 1.6,
    under: 5.5,
    env: 0.32,
    ambientColor: '#8fa4c6',
    keyColor: '#ffe3c8',
    windowColor: '#8cbbec',
    bg: '#07080c',
  },
  dusk: {
    ambient: 0.7,
    hemi: 0.88,
    key: 1.28,
    fill: 0.56,
    window: 3.6,
    wash: 1.7,
    sofa: 2.3,
    under: 2.4,
    env: 0.52,
    ambientColor: '#c3cad8',
    keyColor: '#ffd6a6',
    windowColor: '#ffc79a',
    bg: '#10131b',
  },
} as const

function Lighting() {
  const theme = useRoom((s) => s.theme)
  const space = useRoom((s) => s.space)
  const scene = useThree((s) => s.scene)

  const ambient = useRef<THREE.AmbientLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const key = useRef<THREE.DirectionalLight>(null)
  const fill = useRef<THREE.DirectionalLight>(null)
  const windowLight = useRef<THREE.PointLight>(null)
  const wash = useRef<THREE.PointLight>(null)
  const sofa = useRef<THREE.PointLight>(null)
  const under = useRef<THREE.PointLight>(null)

  const preset = PRESETS[theme]
  const target = useMemo(
    () => ({
      bg: new THREE.Color(space ? '#02030a' : preset.bg),
      ambient: new THREE.Color(preset.ambientColor),
      key: new THREE.Color(preset.keyColor),
      window: new THREE.Color(preset.windowColor),
    }),
    [preset, space],
  )

  // 两套设置之间做指数插值，切换时是一段缓慢的日落，不是一下子跳过去
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const k = 1 - Math.exp(-2.4 * dt)
    const approach = (light: THREE.Light | null, value: number) => {
      if (light) light.intensity += (value - light.intensity) * k
    }

    approach(ambient.current, preset.ambient)
    approach(hemi.current, preset.hemi)
    approach(key.current, preset.key)
    approach(fill.current, preset.fill)
    approach(windowLight.current, preset.window)
    approach(wash.current, preset.wash)
    approach(sofa.current, preset.sofa)
    approach(under.current, preset.under)

    ambient.current?.color.lerp(target.ambient, k)
    key.current?.color.lerp(target.key, k)
    windowLight.current?.color.lerp(target.window, k)

    if (scene.background instanceof THREE.Color) scene.background.lerp(target.bg, k)
    if (scene.fog instanceof THREE.Fog) scene.fog.color.lerp(target.bg, k)
    scene.environmentIntensity += (preset.env - scene.environmentIntensity) * k
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={preset.ambient} color={preset.ambientColor} />
      <hemisphereLight
        ref={hemi}
        intensity={preset.hemi}
        color="#4e6288"
        groundColor="#12141a"
      />
      <directionalLight
        ref={key}
        position={[8, 11, 6]}
        intensity={preset.key}
        color={preset.keyColor}
      />
      <directionalLight
        ref={fill}
        position={[-7, 6, -5]}
        intensity={preset.fill}
        color="#8fb0e0"
      />
      {/* 窗户方向打进来的冷光，把房间从“一片黑”里拉出来 */}
      <pointLight
        ref={windowLight}
        position={[-1.0, 2.3, -4.3]}
        intensity={preset.window}
        distance={9}
        decay={2}
        color={preset.windowColor}
      />
      {/* 顶部极淡的洗墙光，让墙面有层次 */}
      <pointLight
        ref={wash}
        position={[0.5, 4.4, 0.5]}
        intensity={preset.wash}
        distance={13}
        decay={2}
        color="#c3d4ee"
      />
      {/* 沙发右侧的补光，避免右侧整块压成纯黑 */}
      <pointLight
        ref={sofa}
        position={[4.3, 2.5, -3.0]}
        intensity={preset.sofa}
        distance={7}
        decay={2}
        color="#ffc79a"
      />
      {/* 岛底冷光：悬浮感的来源 */}
      <pointLight
        ref={under}
        position={[0, -3.4, 0]}
        intensity={preset.under}
        distance={9}
        decay={2}
        color="#3f78b8"
      />
    </>
  )
}

/** 首帧真正提交到屏幕后才算就绪，Boot 不用定时器骗自己 */
function ReadyPing() {
  const setSceneReady = useRoom((s) => s.setSceneReady)
  const done = useRef(false)

  useFrame(() => {
    if (done.current) return
    done.current = true
    // 再等一小段，让接触阴影与后期通道也都跑过一遍
    window.setTimeout(() => setSceneReady(true), 140)
  })

  return null
}

export default function Scene() {
  const quality = useRoom((s) => s.quality)
  const space = useRoom((s) => s.space)

  return (
    <>
      <color attach="background" args={[space ? '#02030a' : '#07080c']} />
      {!space && <fog attach="fog" args={['#07080c', 24, 54]} />}
      <Environment />

      {/* 环境：冷调环境光 + 暖调主光，冷暖对撞是质感的关键 */}
      <Lighting />

      <Rig />
      <Island />
      <Walls />
      <Desk />
      <Shelf />
      <Skills />
      <Sofa />
      <PianoUnit />
      <GuitarUnit />
      <Bench />
      <MusicRug />
      <Cat />
      <Decor />
      <Hotspots />
      {space && <Cosmos />}
      <ReadyPing />

      {quality > 0 && (
        <ContactShadows
          position={[0, 0.012, 0]}
          scale={18}
          far={5}
          blur={2.6}
          opacity={0.7}
          resolution={quality > 1 ? 1024 : 512}
          color="#05060a"
          frames={1}
        />
      )}

      {quality > 0 && (
        <EffectComposer multisampling={0}>
          <SMAA preset={SMAAPreset.HIGH} />
          <Bloom
            intensity={quality > 1 ? 0.46 : 0.3}
            luminanceThreshold={0.7}
            luminanceSmoothing={0.22}
          />
          <Vignette offset={0.2} darkness={space ? 0.5 : 0.72} eskil={false} />
        </EffectComposer>
      )}
    </>
  )
}
