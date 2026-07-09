import * as THREE from 'three';
import { useRef } from 'react';
import { useHelper } from '@react-three/drei';
import { useControls } from 'leva';

export default function SunsetLights() {
  const { sunlightColor, sunlightIntensity } = useControls('Sunset Light', {
    sunlightColor: {
      value: '#f5cf70',
      label: 'Color',
    },
    sunlightIntensity: {
      value: 7,
      min: 0,
      max: 20,
      step: 0.1,
      label: 'Intensity',
    },
  });

  const sunLight = useRef<THREE.DirectionalLight>(null!);
  const fillLight = useRef<THREE.DirectionalLight>(null!);
  const rimLight = useRef<THREE.DirectionalLight>(null!);

  // Uncomment these for debugging light positions
  // useHelper(sunLight, THREE.DirectionalLightHelper, 1, '#ff9930')
  // useHelper(fillLight, THREE.DirectionalLightHelper, 1, '#ff6e1d')
  // useHelper(rimLight, THREE.DirectionalLightHelper, 1, '#00ffff')

  return (
    <>
      {/* Low-intensity warm ambient light for overall scene illumination */}
      <ambientLight intensity={1} color="#ccccff" />

      {/* Main sunset directional light - orange/golden */}
      <directionalLight
        ref={sunLight}
        position={[16, 10, 4]}
        intensity={sunlightIntensity}
        color={sunlightColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00001}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={20}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
      />

      <directionalLight ref={fillLight} color="#ffcc66" position={[0, 5, -10]} intensity={0.2} />
      {/* <directionalLight 
        ref={rimLight}
        color="#ffcc66"
        position={[-13, 5, -0]} 
        intensity={0.5} 
      /> */}
    </>
  );
}
