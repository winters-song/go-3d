import * as THREE from 'three'

export default function Feet({ scene }: { scene: THREE.Group }) {
  const x = 1
  const y = 0.5
  const scale = 6

  // Create clones of the scene for each position
  const scene1 = scene.clone(true)
  const scene2 = scene.clone(true)
  const scene3 = scene.clone(true)
  const scene4 = scene.clone(true)

  return (
    <>
      <primitive object={scene1} position={[-x, y, -x]} scale={scale} />
      <primitive object={scene2} position={[x, y, -x]} scale={scale} />
      <primitive object={scene3} position={[-x, y, x]} scale={scale} />
      <primitive object={scene4} position={[x, y, x]} scale={scale} />
    </>
  )
} 