"use client"
import * as THREE from 'three'
import { Canvas, } from '@react-three/fiber'
import { useRef, Suspense, useEffect } from 'react'
import { useGLTF, Preload, Stats, Environment } from "@react-three/drei"
import Loader from '@/components/models/Loader'
import Lights from '@/components/models/Lights'
import GoboardPlayer from '@/components/go/GoboardPlayer'
import BottomBar from '@/components/ui/BottomBar'
import RightSidebar from '@/components/ui/RightSidebar'
import GoboardPanel from '@/components/models/GoboardPanel'
import CursorManager from '@/components/CursorManager'
import { Bloom, EffectComposer } from '@react-three/postprocessing'

function SceneContent() {
  const { scene: roomScene } = useGLTF('/glb/room-baked.draco.glb')

  useEffect(() => {
    console.log(roomScene)
    roomScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log(child.name)
        if (child.name.includes('WoodBase')) {
          child.receiveShadow = true
        }
      }
    })
  }, [roomScene])
  return (
    <primitive object={roomScene} position={[0, 0.21, -0.01]} scale={3.2} />
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
        camera={{ position: [2, 5, 4], fov: 45 }}
        shadows={{
          enabled: true,
          type: THREE.PCFShadowMap,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
        frameloop="demand"
      >
        <Suspense fallback={<Loader />}>
          <Environment files='/hdri/forest_slope_1k.hdr' background={'only'} backgroundBlurriness={0.1} />
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

useGLTF.preload('/glb/room-baked.draco.glb')
