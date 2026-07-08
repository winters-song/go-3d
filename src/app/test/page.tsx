"use client"
import { Canvas } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import {OrbitControls, Stats, useGLTF } from "@react-three/drei"
import { backendComm } from '@/services/BackendCommunication'
import BackendControls from '@/components/BackendControls'
import GradientBackground from '@/components/models/GradientBackground'

function Scene() {
  const { scene } = useGLTF('/glb/bake.glb')
  
  return (
    <>
      <OrbitControls />
      <primitive object={scene} position={[0,0,0]} />
      <GradientBackground />
    </>
  )
}

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Connect the iframe to the backend communication service
    if (iframeRef.current) {
      backendComm.setIframe(iframeRef.current)
    }
  }, [])

  return (
    <>
      <BackendControls />
      
      {/* Hidden iframe for backend communication */}
      <iframe
        ref={iframeRef}
        src="http://localhost:3000/backend"
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '1px',
          height: '1px',
          border: 'none'
        }}
        title="Backend"
      />
      
      <Canvas style={{width: '100vw', height: '100vh'}} camera={{
        position: [3,3,3]
      }} frameloop="demand">
        <Stats />
        <Scene />
      </Canvas>
    </>
  );
}
