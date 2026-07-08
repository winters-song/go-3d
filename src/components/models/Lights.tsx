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
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.01}
        shadow-camera-far={50}
        shadow-bias={0.001}
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