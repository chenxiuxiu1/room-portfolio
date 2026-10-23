import { useRef, type ReactNode } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { SectionId, Vec3 } from '../types'
import { useRoom } from '../lib/store'
import { damp } from '../lib/camera'
import { pointerState } from '../lib/pointer'

interface StationProps {
  id: SectionId
  /** 局部命中盒尺寸 */
  hitbox: Vec3
  hitboxPosition?: Vec3
  /** 地面指示光环位置（局部坐标） */
  ring?: Vec3
  ringSize?: number
  children: ReactNode
}

/**
 * 可交互物件包装器：负责命中检测、悬停上浮、地面光环。
 * 视觉变化由各物件自己根据 store 里的 hovered/active 决定。
 */
export default function Station({
  id,
  hitbox,
  hitboxPosition = [0, 0, 0],
  ring,
  ringSize = 1.1,
  children,
}: StationProps) {
  const setHovered = useRoom((s) => s.setHovered)
  const setActive = useRoom((s) => s.setActive)
  const hovered = useRoom((s) => s.hovered === id)
  const active = useRoom((s) => s.active === id)

  const inner = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const lift = useRef(0)
  // 触屏没有 hover，命中区放大一点，别让用户戳空气
  const narrow = useThree((s) => s.size.width < 768)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const want = hovered && !active ? 1 : 0
    lift.current = damp(lift.current, want, 7, dt)
    if (inner.current) inner.current.position.y = lift.current * 0.075
    const r = ringRef.current
    if (r) {
      r.visible = lift.current > 0.015
      const mat = r.material as THREE.MeshBasicMaterial
      mat.opacity = lift.current * 0.42
      r.scale.setScalar(0.9 + lift.current * 0.12)
    }
  })

  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (!pointerState.fine) return
    setHovered(id)
  }
  const leave = () => {
    if (useRoom.getState().hovered === id) setHovered(null)
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (pointerState.moved > 9) return
    e.stopPropagation()
    setActive(id)
  }

  return (
    <group>
      <group ref={inner}>{children}</group>

      <mesh
        position={hitboxPosition}
        onPointerOver={enter}
        onPointerOut={leave}
        onClick={click}
      >
        <boxGeometry
          args={
            narrow
              ? [hitbox[0] * 1.22, hitbox[1] * 1.12, hitbox[2] * 1.22]
              : hitbox
          }
        />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {ring && (
        <mesh ref={ringRef} position={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <ringGeometry args={[ringSize * 0.92, ringSize, 64]} />
          <meshBasicMaterial
            color="#ff8a5b"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  )
}
