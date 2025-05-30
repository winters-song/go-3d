import * as THREE from 'three'
import { RoundedBox } from "@react-three/drei"

export default function WoodenBase({ woodTexture }: { woodTexture: THREE.Texture }) {
  return (
    <RoundedBox 
      args={[3.04, 0.88, 3.04]} // width, height, depth
      radius={0.02} // border radius
      smoothness={2} // Optional: number of subdivisions
      position={[0, 1.16, 0]} // Positioned just below the board surface
      receiveShadow
      castShadow
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