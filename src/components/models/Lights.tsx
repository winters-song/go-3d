import * as THREE from 'three'
import { useRef } from 'react'
import { useHelper } from '@react-three/drei'

export default function Lights() {
  const light1 = useRef<THREE.DirectionalLight>(null!)
  const light2 = useRef<THREE.DirectionalLight>(null!)
  const light3 = useRef<THREE.DirectionalLight>(null!)
  
  // useHelper(light1, THREE.DirectionalLightHelper, 1, 'red')
  // useHelper(light2, THREE.DirectionalLightHelper, 1, 'green')
  // useHelper(light3, THREE.DirectionalLightHelper, 1, 'blue')

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight 
        ref={light1}
        position={[10, 5, 0]} 
        intensity={3} 
        // castShadow 
        // shadow-mapSize={[1024, 1024]}
        // shadow-camera-left={-10}
        // shadow-camera-right={10}
        // shadow-camera-top={10}
        // shadow-camera-bottom={-10}
        // shadow-camera-near={0.1}
        // shadow-camera-far={50}
      />
      {/* <directionalLight 
        ref={light2}
        position={[-5, 3, -5]} 
        intensity={0.4} 
      /> */}
      {/* <directionalLight 
        ref={light3}
        position={[0, 2, -10]} 
        intensity={0.2} 
        color={'#ffffff'}
      /> */}
    </>
  )
} 