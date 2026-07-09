'use client';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { ContactShadows, OrbitControls } from '@react-three/drei';

export default function Home() {
  return (
    <Canvas
      style={{ width: '100vw', height: '100vh' }}
      camera={{ position: [0, 3, 3] }}
      color="white"
    >
      <ContactShadows position-y={-0.49} opacity={0.5} blur={2} scale={10} frames={1} />
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={10}
      />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} castShadow color={'red'} />

      <mesh position={[1, 1, 1]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={'white'} />
      </mesh>

      <mesh rotation-y={Math.PI * 0.25} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color={'white'} />
      </mesh>

      <mesh rotation-x={-Math.PI * 0.5} position-y={-0.5} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </Canvas>
  );
}
