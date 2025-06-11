"use client"
import * as THREE from 'three'
import { Canvas, } from '@react-three/fiber'
import { useRef, Suspense, useEffect } from 'react'
import { OrbitControls, useGLTF, Preload, useTexture, Stats, Environment, Sky } from "@react-three/drei"
import { useControls } from 'leva'
import Loader from '@/components/models/Loader'
import Lights from '@/components/models/Lights'
import PlayerAvatars from '@/components/models/PlayerAvatars'
import Board from '@/components/models/Board'
import Room from '@/components/models/Room'
import SunLights from '@/components/models/SunLights'
import GoBoard from '@/components/models/GoBoard'

/**
 * Main Scene component that sets up the 3D environment
 * - Handles environment controls via Leva
 * - Sets up shadows, camera controls, and lighting
 * - Manages loading states and performance monitoring
 * - Renders the main SceneContent component
 */
function Scene() {


  // Move the resource loading to a separate component that can be properly suspended
  return (
    <>
      <OrbitControls
        // enablePan={false} 
        // maxPolarAngle={Math.PI / 2} 
        // minDistance={3} 
        // maxDistance={10}
        target={[0, 1.16, 0]}
        makeDefault
      />
      {/* <Lights /> */}
      <SunLights />
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
  const { scene: roomScene } = useGLTF('/glb/room.draco.glb')


  const { showRoom, showSky } = useControls({
    showRoom: {
      value: true,
      label: '显示房间'
    },
    showSky: {
      value: true,
      label: '显示天空'
    }
  })

  // Get room position and scale from SceneContent controls
  const { roomPosition, roomScale } = useControls('Room Settings', {
    roomPosition: {
      value: [-5.7, -0.85, 10.3],
      step: 0.05,
      label: '房间位置'
    },
    roomScale: {
      value: 3.5,
      min: 0.1,
      max: 5,
      step: 0.1,
      label: '房间大小'
    },
  })

  // Sky controls
  const { sunPosition, turbidity, rayleigh, mieCoefficient, mieDirectionalG } = useControls('Sky Settings', {
    sunPosition: {
      value: [100, 0.01, 25],
      step: 0.1,
      label: '太阳位置'
    },
    turbidity: {
      value: 5,
      min: 0,
      max: 20,
      step: 0.1,
      label: '浑浊度'
    },
    rayleigh: {
      value: 3,
      min: 0,
      max: 4,
      step: 0.01,
      label: '瑞利散射'
    },
    mieCoefficient: {
      value: 0.005,
      min: 0,
      max: 0.1,
      step: 0.001,
      label: '米氏系数'
    },
    mieDirectionalG: {
      value: 0.9,
      min: 0,
      max: 1,
      step: 0.01,
      label: '米氏方向'
    }
  })

  // Configure textures after loading
  gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping
  gridTexture.repeat.set(1, 1)


  const player = useRef<{
    stones: number[]
    printBoard: () => void
  }>({
    stones: new Array(361).fill(0),
    printBoard: function () {
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
      <GoBoard />
      {/* <Environment files="/hdri/forest.jpg" background={'only'}  /> */}
      {/* <PlayerAvatars /> */}

      {showSky && (
        <Sky 
          distance={450000} 
          sunPosition={sunPosition} 
          turbidity={turbidity} 
          rayleigh={rayleigh} 
          mieCoefficient={mieCoefficient} 
          mieDirectionalG={mieDirectionalG} 
        />
      )}

      {showRoom &&
        <group position={roomPosition as [number, number, number]} scale={roomScale}>
          <Room scene={roomScene} />
        </group>}

    </>
  )
}

export default function Home() {
  return (
    <Canvas
      style={{ width: '100vw', height: '100vh' }}
      camera={{ position: [2, 5, 4], fov: 45 }}
      shadows={{
        enabled: true,
        type: THREE.PCFSoftShadowMap
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

useGLTF.preload('/glb/room.draco.glb') 
