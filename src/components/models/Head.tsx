import * as THREE from 'three'

interface HeadProps {
  position: [number, number, number]
  stoneColor: 'black' | 'white'
}

export default function Head({ position, stoneColor }: HeadProps) {
  // Position significantly above the stone to be visible
  const [x, y, z] = position
  const headPosition: [number, number, number] = [x, y + 0.028, z]
  
  // Use contrasting color (white for black stones, black for white stones)
  const headColor = stoneColor === 'black' ? '#ffffff' : '#000000'
  
  return (
    <mesh position={headPosition} rotation-x={-Math.PI * 0.5}>
      <ringGeometry args={[0.027, 0.042, 16]} />
      <meshBasicMaterial color={headColor} />
    </mesh>
  )
} 