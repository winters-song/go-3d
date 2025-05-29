"use client"
import * as THREE from 'three'
import { Canvas, ThreeEvent, useLoader } from '@react-three/fiber'
import { useRef, useState, Suspense, useEffect } from 'react'
import {ContactShadows, OrbitControls, useGLTF, Preload, useProgress, Html, useHelper, useTexture, RoundedBox} from "@react-three/drei"

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div style={{ color: 'black', fontSize: '1.2em' }}>
        Loading... {progress.toFixed(0)}%
      </div>
    </Html>
  )
}

function WoodenBase({ woodTexture }: { woodTexture: THREE.Texture }) {
  return (
    <RoundedBox 
      args={[3.04, 0.88, 3.04]} // width, height, depth
      radius={0.02} // border radius
      smoothness={4} // Optional: number of subdivisions
      position={[0, 1.16, 0]} // Positioned just below the board surface
      receiveShadow
    >
      <meshStandardMaterial 
        map={woodTexture}
        roughness={0.35} // Lower roughness for more visible reflections
        metalness={0.0} // Keep non-metallic for wood
        envMapIntensity={1.5} // Increased to enhance reflection visibility
      />
    </RoundedBox>
  )
}

function Stone({ position, color }: { position: [number, number, number], color: 'black' | 'white' }) {
  const materialProps = color === 'black' ? {
    color: '#000000',
    roughness: 0.337,
    metalness: 0.0,
    envMapIntensity: 1.0
  } : {
    color: '#ffffff',
    roughness: 0.2,
    metalness: 0.0,
    envMapIntensity: 1.0
  }

  return (
    <mesh position={position} scale-y={0.4} castShadow >
      <sphereGeometry args={[0.07, 32, 32]} />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  )
}

function Board({ gridTexture, player }: { gridTexture: THREE.Texture, player: any }) {
  // const { scene } = useGLTF('/goboard.draco.glb')
  const [stones, setStones] = useState<Array<{ position: [number, number, number], color: 'black' | 'white' }>>([])
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black')
  const [hoverPosition, setHoverPosition] = useState<[number, number, number] | null>(null)
  const planeRef = useRef<THREE.Mesh>(null!)
  const boardSize = 19
  const gridScale = 2.8
  const boardScale = 3
  const offset = gridScale / 2
  const unitLength = gridScale / (boardSize - 1)
  
  useEffect(() => {
    console.log('Board rendered because of:', {
      stonesLength: stones.length,
      currentPlayer
    })
  }, [stones, currentPlayer])

  const getValidBoardPosition = (intersectionPoint: THREE.Vector3) => {
    // Convert to board coordinates (0-18)
    const x = Math.floor((intersectionPoint.x + offset + unitLength/2) / unitLength)
    const y = boardSize - 1 - Math.floor((intersectionPoint.y + offset + unitLength/2) / unitLength)
    
    // Validate position is within board
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) return null
    
    // Check if position is already occupied
    const isOccupied = player.stones[x * boardSize + y] !== 0
    if (isOccupied) return null

    return {
      boardX: x,
      boardY: y,
      worldPosition: [
        x * unitLength - offset,
        1.625, // Height above board
        y * unitLength - offset
      ] as [number, number, number]
    }
  }

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (!planeRef.current) return

    // Get intersection point in local coordinates
    const intersectionPoint = event.point.clone()
    planeRef.current.worldToLocal(intersectionPoint)

    const position = getValidBoardPosition(intersectionPoint)
    setHoverPosition(position ? position.worldPosition : null)
  }

  const handlePointerLeave = () => {
    setHoverPosition(null)
  }
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (!planeRef.current) return

    // Get intersection point in local coordinates
    const intersectionPoint = event.point.clone()
    planeRef.current.worldToLocal(intersectionPoint)

    const position = getValidBoardPosition(intersectionPoint)
    if (!position) return

    const { boardX, boardY, worldPosition } = position
    player.stones[boardX * boardSize + boardY] = currentPlayer === 'black' ? 1 : 2
    
    const newStone = {
      position: worldPosition,
      color: currentPlayer
    }
    
    setStones([...stones, newStone])
    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black')
    setHoverPosition(null)
  }

  return (
    <>
      {/* <primitive object={scene} position={[0, 0, 0]} scale={6} /> */}
      
      {/* Grid texture plane */}
      <mesh rotation-x={-Math.PI * 0.5} position-y={1.604} >
        <planeGeometry args={[gridScale, gridScale]} />
        <meshBasicMaterial transparent opacity={1} map={gridTexture} />
      </mesh>

      {/* Invisible plane for click detection */}
      <mesh 
        ref={planeRef}
        rotation-x={-Math.PI * 0.5} 
        position-y={1.61}
        onPointerDown={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <planeGeometry args={[boardScale, boardScale]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Preview stone */}
      {hoverPosition && (
        <mesh position={hoverPosition} scale-y={0.4}>
          <sphereGeometry args={[0.07, 32, 32]} />
          <meshStandardMaterial
            color={currentPlayer === 'black' ? '#000000' : '#ffffff'}
            transparent
            opacity={0.5}
            roughness={0.4}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* Render stones */}
      {stones.map((stone, index) => (
        <Stone key={index} position={stone.position} color={stone.color} />
      ))}
    </>
  )
}

function Lights() {
  const light1 = useRef<THREE.DirectionalLight>(null!)
  const light2 = useRef<THREE.DirectionalLight>(null!)
  const light3 = useRef<THREE.DirectionalLight>(null!)
  
  // useHelper(light1, THREE.DirectionalLightHelper, 1, 'red')
  // useHelper(light2, THREE.DirectionalLightHelper, 1, 'green')
  // useHelper(light3, THREE.DirectionalLightHelper, 1, 'blue')

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        ref={light1}
        position={[5, 10, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight 
        ref={light2}
        position={[-5, 3, -5]} 
        intensity={0.4} 
        castShadow
      />
      <directionalLight 
        ref={light3}
        position={[0, 2, -10]} 
        intensity={0.2} 
        color={'#ffffff'}
      />
    </>
  )
}

function PlayerAvatars() {
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<number>(1.5) // Default aspect ratio (width/height)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Base dimensions for avatar planes
  const avatarWidth = 2
  const avatarHeight = avatarWidth / aspectRatio

  useEffect(() => {
    console.log("Initializing webcam...");
    
    const initCamera = async () => {
      try {
        console.log("Requesting camera permission...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 } 
          } 
        });
        
        console.log("Camera permission granted, initializing video element");
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Create texture only after video has started playing
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            
            // Get actual video dimensions and set aspect ratio
            if (videoRef.current) {
              const videoWidth = videoRef.current.videoWidth;
              const videoHeight = videoRef.current.videoHeight;
              const videoAspectRatio = videoWidth / videoHeight;
              console.log(`Video dimensions: ${videoWidth}x${videoHeight}, aspect ratio: ${videoAspectRatio}`);
              setAspectRatio(videoAspectRatio);
            }
            
            videoRef.current?.play()
              .then(() => {
                console.log("Video playback started");
                const texture = new THREE.VideoTexture(videoRef.current!);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                setVideoTexture(texture);
                console.log("Video texture created");
              })
              .catch(err => {
                console.error("Error playing video:", err);
                setCameraError("Error playing video");
              });
          };
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setCameraError(err instanceof Error ? err.message : "Unknown error accessing camera");
      }
    };

    initCamera();

    return () => {
      // Cleanup
      if (videoRef.current?.srcObject) {
        console.log("Cleaning up camera stream");
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      {/* Front player plane (White player) */}
      <mesh position={[0, 2, 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[avatarWidth, avatarHeight]} />
        <meshStandardMaterial color="#ffffff" side={THREE.FrontSide} />
      </mesh>

      {/* Back player plane with webcam (Black player) */}
      <mesh position={[0, 2, -2]}>
        <planeGeometry args={[avatarWidth, avatarHeight]} />
        {videoTexture ? (
          <meshBasicMaterial 
            map={videoTexture}
            side={THREE.FrontSide}
          />
        ) : (
          <meshStandardMaterial 
            color={cameraError ? "#ff0000" : "#333333"}
            side={THREE.FrontSide}
          />
        )}
      </mesh>

      {/* Camera error message */}
      {cameraError && (
        <Html position={[0, 2, -2]} center>
          <div style={{ 
            color: 'white', 
            backgroundColor: 'rgba(255,0,0,0.7)', 
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '300px',
            textAlign: 'center'
          }}>
            Camera error: {cameraError}
          </div>
        </Html>
      )}

      {/* Hidden video element */}
      <Html>
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          autoPlay
          playsInline
          muted
          width="640"
          height="480"
        />
      </Html>
    </>
  );
}

function Feet({ scene }: { scene: THREE.Group }) {
  const x = 1
  const y = 0.5
  const scale = 6

  // Create clones of the scene for each position
  const scene1 = scene.clone(true)
  const scene2 = scene.clone(true)
  const scene3 = scene.clone(true)
  const scene4 = scene.clone(true)

  return (
    <>
      <primitive object={scene1} position={[-x, y, -x]} scale={scale} receiveShadow />
      <primitive object={scene2} position={[x, y, -x]} scale={scale} receiveShadow />
      <primitive object={scene3} position={[-x, y, x]} scale={scale} receiveShadow />
      <primitive object={scene4} position={[x, y, x]} scale={scale} receiveShadow />
    </>
  )
}

function Scene() {
  const gridTexture = useTexture('/goboard_grid.png')
  const woodTexture = useTexture('/wood.jpg')
  const { scene: feetScene } = useGLTF('/feet.draco.glb')
  // Configure textures
  gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping
  gridTexture.repeat.set(1, 1)
  
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping
  woodTexture.repeat.set(1, 1)
  woodTexture.offset.set(0, 0)

  const player = useRef<{
    stones: number[]
  }>({
    stones: new Array(361).fill(0),
  })

  return (
    <>
      <ContactShadows position-y={0} opacity={0.5} blur={0.5} scale={10} frames={1} />
      <OrbitControls 
        enablePan={false} 
        maxPolarAngle={Math.PI / 2} 
        minDistance={3} 
        maxDistance={10}
        target={[0, 1.16, 0]}
      />
      <Lights />
      <Board gridTexture={gridTexture} player={player.current} />
      <WoodenBase woodTexture={woodTexture} />
      {/* <PlayerAvatars /> */}
      <Feet scene={feetScene} />
      <Preload all />
    </>
  )
}

export default function Home() {
  return (
    <Canvas 
      style={{width: '100vw', height: '100vh'}} 
      camera={{ position: [2, 5, 4], fov: 45 }}
      shadows="soft"
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

useGLTF.preload('/goboard.draco.glb')
