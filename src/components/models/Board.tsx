import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'
import Stone from './Stone'
import Head from './Head'

export default function Board({ gridTexture, player }: { gridTexture: THREE.Texture, player: any }) {
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black')
  const [hoverCell, setHoverCell] = useState<{ col: number, row: number } | null>(null)
  const [lastPlacedStone, setLastPlacedStone] = useState<{ col: number, row: number } | null>(null)
  const planeRef = useRef<THREE.Mesh>(null!)
  const boardSize = 19
  const gridScale = 2.8
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
  
  useEffect(() => {
    console.log('Board rendered because of:', {
      stonesCount: player.stones.filter((stone: number) => stone !== 0).length,
      currentPlayer
    })
  }, [player.stones, currentPlayer])

  const getValidBoardPosition = (intersectionPoint: THREE.Vector3) => {
    // Convert to board coordinates (0-18)
    const x = Math.floor((intersectionPoint.x + offset + unitLength/2) / unitLength)
    const y = boardSize - 1 - Math.floor((intersectionPoint.y + offset + unitLength/2) / unitLength)
    
    // Validate position is within board
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) return null
    
    // Check if position is already occupied
    const isOccupied = player.stones[y * boardSize + x] !== 0
    if (isOccupied) return null

    return {
      boardX: x,
      boardY: y
    }
  }

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (!planeRef.current) return

    // Get intersection point in local coordinates
    const intersectionPoint = event.point.clone()
    planeRef.current.worldToLocal(intersectionPoint)

    const position = getValidBoardPosition(intersectionPoint)
    setHoverCell(position ? { col: position.boardX, row: position.boardY } : null)
  }

  const handlePointerLeave = () => {
    setHoverCell(null)
  }
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (!planeRef.current) return

    // Get intersection point in local coordinates
    const intersectionPoint = event.point.clone()
    planeRef.current.worldToLocal(intersectionPoint)

    const position = getValidBoardPosition(intersectionPoint)
    if (!position) return

    const { boardX, boardY } = position
    const stoneIndex = boardY * boardSize + boardX
    
    // Update the stones array in player object
    player.stones[stoneIndex] = currentPlayer === 'black' ? 1 : 2
    
    // Store the last placed stone position
    setLastPlacedStone({ col: boardX, row: boardY })
    
    // Switch player
    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black')
    setHoverCell(null)
  }

  return (
    <>
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
      {hoverCell && (
        <mesh position={boardToWorldPosition(hoverCell.col, hoverCell.row)} scale-y={0.4}>
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
      {player.stones.map((stoneValue: number, index: number) => {
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
          stoneColor={player.stones[lastPlacedStone.row * boardSize + lastPlacedStone.col] === 1 ? 'black' : 'white'} 
        />
      )}
    </>
  )
}
