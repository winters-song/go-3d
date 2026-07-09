"use client"
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useRef, Suspense, useEffect } from 'react'
import { useGLTF, Preload, Stats, Environment } from "@react-three/drei"
import Lights from '@/components/models/Lights'
import GoboardPlayer from '@/components/go/GoboardPlayer'
import BottomBar from '@/components/ui/BottomBar'
import RightSidebar from '@/components/ui/RightSidebar'
import GoboardPanel from '@/components/models/GoboardPanel'
import CursorManager from '@/components/CursorManager'
import SceneIntro from '@/components/models/SceneIntro'
import LoadingReporter from '@/components/models/LoadingReporter'
import SceneEntryOverlay from '@/components/ui/SceneEntryOverlay'

function SceneContent() {
  const { scene: roomScene } = useGLTF('/glb/room-baked.draco.glb')

  useEffect(() => {
    roomScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name.includes('WoodBase')) {
        child.receiveShadow = true
      }
    })
  }, [roomScene])

  return (
    <primitive object={roomScene} position={[0, 0.21, -0.01]} scale={3.2} />
  )
}

export default function Home() {
  const playerRef = useRef<GoboardPlayer | null>(null)
  if (!playerRef.current) {
    playerRef.current = new GoboardPlayer({
      boardOptions: {
        showOrder: false,
        showCoordinates: false,
        playConfirm: false
      }
    })
  }
  const player = playerRef.current

  return (
    <>
      <SceneEntryOverlay />
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
        <Suspense fallback={<LoadingReporter />}>
          <LoadingReporter />
          <Environment files='/hdri/forest_slope_1k.hdr' background={'only'} backgroundBlurriness={0.1} />
          <CursorManager />
          <Lights />
          <GoboardPanel player={player} />
          <SceneContent />
          <SceneIntro />
          <Stats className="stats" />
        </Suspense>
        <Preload all />
      </Canvas>

      <BottomBar player={player} />
    </>
  );
}

useGLTF.preload('/glb/room-baked.draco.glb')
