"use client"
import * as THREE from 'three'
import { Canvas,  } from '@react-three/fiber'
import { useRef, Suspense, useEffect } from 'react'
import {ContactShadows, OrbitControls, useGLTF, Preload, useProgress, Html, useHelper, useTexture, RoundedBox, Stats} from "@react-three/drei"
import Loader from '@/components/models/Loader'
import WoodenBase from '@/components/models/WoodenBase'
import Lights from '@/components/models/Lights'
import Feet from '@/components/models/Feet'
import Container from '@/components/models/Container'
import PlayerAvatars from '@/components/models/PlayerAvatars'
import Board from '@/components/models/Board'

function Scene() {
  // Move the resource loading to a separate component that can be properly suspended
  return (
    <>
      <ContactShadows position-y={0} opacity={0.5} blur={0.5} scale={10} frames={1} />
      <OrbitControls 
        enablePan={false} 
        maxPolarAngle={Math.PI / 2} 
        minDistance={3} 
        maxDistance={10}
        target={[0, 1.16, 0]}
        makeDefault
      />
      <Lights />
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
      <Preload all />
      <Stats className="stats" />
    </>
  )
}

function SceneContent() {
  // Load all textures and models here, safely inside a suspended component
  const gridTexture = useTexture('/goboard_grid.png')
  const woodTexture = useTexture('/wood.jpg')
  const { scene: feetScene } = useGLTF('/feet.draco.glb')
  const { scene: containerScene } = useGLTF('/container.draco.glb')
  
  // Configure textures after loading
  gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping
  gridTexture.repeat.set(1, 1)
  
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping
  woodTexture.repeat.set(1, 1)
  woodTexture.offset.set(0, 0)
  
  const player = useRef<{
    stones: number[]
    printBoard: () => void
  }>({
    stones: new Array(361).fill(0),
    printBoard: function() {
      const boardSize = 19;
      const rows = [];
      
      for (let y = 0; y < boardSize; y++) {
        let row = '';
        for (let x = 0; x < boardSize; x++) {
          const index = y * boardSize + x;
          const stone = this.stones[index];
          
          if (stone === 0) row += '. ';
          else if (stone === 1) row += 'X ';
          else if (stone === 2) row += 'O ';
        }
        rows.push(row.trim());
      }
      
      console.log(rows.join('\n'));
    }
  })

  useEffect(() => {
    // Expose the print function to the global window
    if (typeof window !== 'undefined') {
      (window as any).printGoBoard = () => {
        player.current.printBoard();
      }
    }
  }, []);

  return (
    <>
      <Board gridTexture={gridTexture} player={player.current} />
      <WoodenBase woodTexture={woodTexture} />
      {/* <PlayerAvatars /> */}
      <Feet scene={feetScene} />
      <Container scene={containerScene} woodTexture={woodTexture} />
    </>
  )
}

export default function Home() {
  return (
    <Canvas 
      style={{width: '100vw', height: '100vh'}} 
      camera={{ position: [2, 5, 4], fov: 45 }}
      shadows={{
        enabled: true,
        // type: THREE.PCFSoftShadowMap
      }}
      gl={{
        antialias: true
      }}
    >
      <Suspense fallback={<Loader />}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}

// useGLTF.preload('/goboard.draco.glb')
useGLTF.preload('/feet.draco.glb')
useGLTF.preload('/container.draco.glb')
