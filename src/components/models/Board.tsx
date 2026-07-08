import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { ThreeEvent, useThree } from '@react-three/fiber'
import Stone from './Stone'
import Head from './Head'
import { ContactShadows } from '@react-three/drei'

export default function Board({ player }: { player: any }) {
  const [hoverCell, setHoverCell] = useState<{ col: number, row: number } | null>(null)
  const [lastPlacedStone, setLastPlacedStone] = useState<{ col: number, row: number } | null>(null)
  const [showShadow, setShowShadow] = useState(false)
  const planeRef = useRef<THREE.Mesh>(null!)
  const { gl, controls } = useThree()
  const boardSize = 19
  const gridScale = 2.83
  const boardScale = 3
  const offset = gridScale / 2
  const unitLength = gridScale / (boardSize - 1)

  // Convert board coordinates (col, row) to world position
  const boardToWorldPosition = (col: number, row: number): [number, number, number] => {
    return [
      col * unitLength - offset,
      1.625, // Height above board
      row * unitLength - offset
    ]
  }


  const getValidBoardPosition = (intersectionPoint: THREE.Vector3) => {
    // Convert to board coordinates (0-18)
    const x = Math.floor((intersectionPoint.x + offset + unitLength / 2) / unitLength)
    const y = boardSize - 1 - Math.floor((intersectionPoint.y + offset + unitLength / 2) / unitLength)

    // Validate position is within board
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) return null

    // Check if position is already occupied
    const isOccupied = player.pieces[y * boardSize + x] !== 0
    if (isOccupied) return null

    return {
      boardX: x,
      boardY: y
    }
  }

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (!planeRef.current || !player) return

    if(player.options.readonly || player.clientColor !== player.currentColor) {
      setHoverCell(null)
      gl.domElement.style.cursor = 'default'
      return
    }

    // Get intersection point in local coordinates
    const intersectionPoint = event.point.clone()
    planeRef.current.worldToLocal(intersectionPoint)

    const position = getValidBoardPosition(intersectionPoint)
    if (position) {
      setHoverCell({ col: position.boardX, row: position.boardY })
      gl.domElement.style.cursor = 'pointer'
    } else {
      setHoverCell(null)
      gl.domElement.style.cursor = 'default'
    }
  }

  const handlePointerLeave = () => {
    setHoverCell(null)
    gl.domElement.style.cursor = 'default'
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (!planeRef.current || !player) return

    if(player.options.readonly || player.clientColor !== player.currentColor) {
      return
    }

    // Get intersection point in local coordinates
    const intersectionPoint = event.point.clone()
    planeRef.current.worldToLocal(intersectionPoint)

    const position = getValidBoardPosition(intersectionPoint)
    if (!position) return

    const { boardX, boardY } = position
    player.shoot(boardX, boardY)

    // player.add(1, boardX, boardY, false)
    
    // 此时页面不会重新渲染，需要改变state
    // Store the last placed stone position
    // setLastPlacedStone({ col: boardX, row: boardY })

    // Switch player
    // setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black')
    // setHoverCell(null)
  }

  // Prevent OrbitControls from capturing events when interacting with the board
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    
    // Only change cursor if we're hovering over a valid position
    if (hoverCell) {
      gl.domElement.style.cursor = 'pointer'
    }

    // Temporarily disable orbit controls
    if (controls) {
      // @ts-expect-error - disable orbit controls temporarily
      controls.enabled = false
    }

    // Handle the click
    handleClick(event as unknown as ThreeEvent<MouseEvent>)
  }

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    
    // Reset cursor based on hover state
    gl.domElement.style.cursor = hoverCell ? 'pointer' : 'default'

    // Re-enable orbit controls
    if (controls) {
      // @ts-expect-error - re-enable orbit controls
      controls.enabled = true
    }
  }

  useEffect(() => {
    if(player){
      player.onSetHead((params: { col: number, row: number } | null) => {
        setLastPlacedStone(params)
      })
    }
  }, [player])

  useEffect(() => {
    setTimeout(() => {
      setShowShadow(true)
      console.log('showShadow', showShadow)
    }, 3000)
  }, [])

  return (
    <>
      {/* Grid texture plane */}
      {/* <mesh rotation-x={-Math.PI * 0.5} position-y={1.604} >
        <planeGeometry args={[gridScale, gridScale]} />
        <meshBasicMaterial transparent opacity={1} map={gridTexture} color={'white'} />
        <meshLambertMaterial transparent opacity={1} map={gridTexture} emissive={'cyan'} emissiveIntensity={1.4} toneMapped={false} /> 
      </mesh> */}


      {/* Invisible plane for click detection */}
      <mesh
        ref={planeRef}
        rotation-x={-Math.PI * 0.5}
        position-y={1.62}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        userData={{ board: true }}
      >
        <planeGeometry args={[boardScale, boardScale]} />
        <meshStandardMaterial visible={false} />
      </mesh>

      {/* Preview stone */}
      {hoverCell && (
        <mesh position={boardToWorldPosition(hoverCell.col, hoverCell.row)} scale-y={0.4}>
          <sphereGeometry args={[0.07, 32, 32]} />
          <meshStandardMaterial
            color={player.currentColor === 1 ? '#000000' : '#ffffff'}
            transparent
            opacity={0.5}
            roughness={0.4}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* Render stones */}
      {player?.pieces.map((stoneValue: number, index: number) => {
        if (stoneValue === 0) return null;
        const row = Math.floor(index / boardSize);
        const col = index % boardSize;
        const position = boardToWorldPosition(col, row);
        const color = stoneValue === 1 ? 'black' : 'white';

        return (
          <Stone
            key={index}
            position={position}
            color={color}
          />
        );
      })}

      {/* Render head marker on last stone */}
      {lastPlacedStone && (
        <Head
          position={boardToWorldPosition(lastPlacedStone.col, lastPlacedStone.row)}
          stoneColor={player.pieces[lastPlacedStone.row * boardSize + lastPlacedStone.col] === 1 ? 'black' : 'white'}
        />
      )}

    </>
  )
}
