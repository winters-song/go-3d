"use client"
import * as THREE from 'three'
import { Canvas, } from '@react-three/fiber'
import { useRef, Suspense } from 'react'
import { useGLTF, Preload, Stats, Environment } from "@react-three/drei"
import Loader from '@/components/models/Loader'
import Lights from '@/components/models/Lights'
import GoboardPlayer from '@/components/go/GoboardPlayer'
import BottomBar from '@/components/ui/BottomBar'
import RightSidebar from '@/components/ui/RightSidebar'
import GoboardPanel from '@/components/models/GoboardPanel'
import CursorManager from '@/components/CursorManager'

function SceneContent() {
  const { scene: roomScene } = useGLTF('/glb/room-baked.draco.glb')
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
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={<Loader />}>
          <Environment files="/hdri/forest_sm.jpg" background={'only'} />
          <CursorManager />
          <Lights />
          <GoboardPanel player={player}/>
          <SceneContent />
          <Stats className="stats" />
        </Suspense>
        <Preload all />
      </Canvas>

      <BottomBar player={player} />
    </>
  );
}

useGLTF.preload('/glb/room-baked.draco.glb') 
