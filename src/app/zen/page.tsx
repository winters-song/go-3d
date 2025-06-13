"use client"
import * as THREE from 'three'
import { Canvas, } from '@react-three/fiber'
import { useRef, Suspense, useEffect, useState } from 'react'
import { OrbitControls, useGLTF, Preload, useTexture, Stats, Environment, ContactShadows, Html } from "@react-three/drei"
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import Loader from '@/components/models/Loader'
import Lights from '@/components/models/Lights'
import GoboardPlayer from '@/components/go/GoboardPlayer'
import BottomBar from '@/components/ui/BottomBar'
import RightSidebar from '@/components/ui/RightSidebar'
import GoboardPanel from '@/components/models/GoboardPanel'
import CursorManager from '@/components/CursorManager'

function SceneContent() {
  // Load all textures and models here, safely inside a suspended component
  const { scene: roomScene } = useGLTF('/glb/room-baked.draco.glb')

  return (
    <primitive object={roomScene} position={[0, 0.21, -0.01]} scale={3.2} />
  )
}

export default function Home() {
  const [isCameraLocked, setIsCameraLocked] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const player = new GoboardPlayer({
    boardOptions: {
      showOrder: false,
      showCoordinates: false,
      playConfirm: false
    }
  });

  const handleNewFile = () => {
    // TODO: Implement new file functionality
    console.log('New file clicked');
    player.newSgf();
  };

  const handleOpenFile = () => {
    // TODO: Implement open file functionality
    console.log('Open file clicked');

    const upload = (file: Blob) => {
      let fileReader = new FileReader();
      fileReader.onload = e => {
        let sgf = fileReader.result as string;
  
        player.changeData(sgf, 1)
        player.toEnd()
      };
  
      fileReader.readAsText(file);
  
      return false;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sgf';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        upload(target.files[0]);
      }
    };
    input.click();
  };

  const handleLockToggle = (locked: boolean) => {
    setIsCameraLocked(locked);
  };

  const handleCameraTopView = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      // Store the current camera position and target
      const startPosition = controls.object.position.clone();
      const startTarget = controls.target.clone();
      
      // Calculate the end position (directly above the board)
      const endPosition = new THREE.Vector3(0, 6.5, 0.1);
      const endTarget = new THREE.Vector3(0, 1.16, 0);
      
      // Animation parameters
      const duration = 1000; // 1 second
      const startTime = Date.now();
      
      // Animation function
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out function
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Interpolate position and target
        controls.object.position.lerpVectors(startPosition, endPosition, easeProgress);
        controls.target.lerpVectors(startTarget, endTarget, easeProgress);
        
        // Update controls
        controls.update();
        
        // Continue animation if not complete
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }
      
      // Start animation
      animate();
    }
  };

  return (
    <>
      <RightSidebar 
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onLockToggle={handleLockToggle}
        onCameraTopView={handleCameraTopView}
      />

      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        camera={{ position: [2, 5, 4], fov: 45 }}
        // shadows={{
        //   enabled: true,
        //   type: THREE.PCFShadowMap
        // }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={<Loader />}>
          <Environment files="/hdri/forest_sm.jpg" background={'only'} />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minDistance={3}
            maxDistance={10}
            target={[0, 1.16, 0]}
            makeDefault
            enabled={!isCameraLocked}
          />
          <CursorManager isCameraLocked={isCameraLocked} />
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
