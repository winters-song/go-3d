"use client"
import * as THREE from 'three'
import { Canvas, } from '@react-three/fiber'
import { useRef, Suspense, useEffect, useState } from 'react'
import { useGLTF, Preload, Stats, Environment, ContactShadows } from "@react-three/drei"
import { useControls } from 'leva'
import Loader from '@/components/models/Loader'
import Lights from '@/components/models/Lights'
import GoboardPlayer from '@/components/go/GoboardPlayer'
import BottomBar from '@/components/ui/BottomBar'
import RightSidebar from '@/components/ui/RightSidebar'
import GoboardPanel from '@/components/models/GoboardPanel'
import CursorManager from '@/components/CursorManager'
import { Bloom, EffectComposer } from '@react-three/postprocessing'

function SceneContent() {
  const { scene: roomScene } = useGLTF('/glb/company.glb')

  // const { position, scale } = useControls('Room Scene', {
  //   position: {
  //     value: [0, 0, 0],
  //     step: 0.1,
  //     label: 'Position'
  //   },
  //   scale: {
  //     value: [1, 1, 1],
  //     step: 0.1,
  //     label: 'Scale'
  //   },
  // })

  useEffect(() => {
    console.log(roomScene)
    roomScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log(child.name)
        if (child.name.includes('立方体005')) {
          // Change material from Basic to Standard, keeping the same texture
          if (child.material) {
            child.material = new THREE.MeshStandardMaterial({
              map: child.material.map,
              color: child.material.color ? child.material.color.clone() : new THREE.Color(0xffffff),
              roughness: 0.5,
              metalness: 0.2
            });
          }
          child.receiveShadow = true
          // child.visible = false
        }
      }
    })
  }, [roomScene])
  
  return (
    <primitive 
      object={roomScene} 
      position={[2.95, 6.94, -3.3]}
      scale={[8.6, 8.6, 8.6]}
    />
  )
}

export default function Home() {
  const player = new GoboardPlayer({
    boardOptions: {
      showOrder: false,
      showCoordinates: false,
      playConfirm: false
    }
  });

  return (
    <>
      <RightSidebar player={player} />

      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        camera={{ position: [-20, 20, 50], fov: 45 }}
        shadows={{
          enabled: true,
          type: THREE.PCFSoftShadowMap,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
        frameloop="demand"
      >
        <color attach="background" args={['skyblue']} />
        <Suspense fallback={<Loader />}>
          <ContactShadows position-y={-4} opacity={0.5} blur={2} scale={50} frames={1}/>
          <CursorManager />
          <Lights />
          <GoboardPanel player={player} />
          <SceneContent />
          <Stats className="stats" />
          {/* <EffectComposer>
            <Bloom intensity={0.1} luminanceThreshold={0.3} luminanceSmoothing={1} />
          </EffectComposer> */}
        </Suspense>
        <Preload all />
      </Canvas>

      <BottomBar player={player} />
    </>
  );
}

useGLTF.preload('/glb/company.glb') 
