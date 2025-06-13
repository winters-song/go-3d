export default function Stone({ position, color }: { position: [number, number, number], color: 'black' | 'white' }) {
  const materialProps = color === 'black' ? {
    color: '#000000',
    roughness: 0.337,
    metalness: 0.0,
  } : {
    color: '#ffffff',
    roughness: 0.2,
    metalness: 0.0,
  }

  return (
    <mesh position={position} scale-y={0.4} castShadow>
      <sphereGeometry args={[0.07, 16, 16]}  />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  )
} 