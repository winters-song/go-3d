import { useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

export default function GoBoard() {
  const { scene } = useGLTF('/glb/goboard.draco.glb')
  
  // Apply shadow settings to all meshes
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [scene])

  return <primitive object={scene} position={[0, 0, 0]} scale={6} rotation={[0, Math.PI, 0]} />
}

// Preload the model
useGLTF.preload('/glb/goboard.draco.glb') 