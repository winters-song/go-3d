"use client"
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import {OrbitControls, Stats, useGLTF, useHelper} from "@react-three/drei"

function Model() {
  const { scene } = useGLTF('/glb/bake.glb')
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log('Mesh found:', child.name)
        console.log('Material:', child.material)

        // child.material.color.set(0, 1, 0)
      }
    })
  }, [scene])
  
  return <primitive object={scene} />
}

function Scene() {
  const lightRef = useRef<THREE.DirectionalLight>(null!)
  useHelper(lightRef, THREE.DirectionalLightHelper, 1, 'red')
  
  return (
    <>
      <OrbitControls />
      {/* <directionalLight 
        ref={lightRef}
        position={[5, 5, 5]} 
        intensity={20} 
        color={'red'}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <ambientLight intensity={0.5} /> */}
      <Model />
    </>
  )
}

export default function Home() {
  return (
    <Canvas style={{width: '100vw', height: '100vh'}} camera={{
      position: [3,3,3]
    }}>
      <Stats />
      <Scene />
    </Canvas>
  );
}
