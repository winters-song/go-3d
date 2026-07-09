'use client';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import { OrbitControls, Stats, useGLTF, useAnimations } from '@react-three/drei';
import { useControls, button } from 'leva';

function AnimatedModel() {
  const { scene, animations } = useGLTF('/glb/anim.glb');
  const groupRef = useRef<THREE.Group>(null!);
  const { actions, names } = useAnimations(animations, groupRef);
  const controlsRef = useRef<any>(null);

  // Leva controls
  const controls = useControls('Animation Controls', {
    playJump: button(() => {
      if (actions['Jump']) {
        // Stop all animations first
        Object.values(actions).forEach(action => {
          if (action) action.stop();
        });

        // Play the Jump animation with no loop and clamp to final frame
        const jumpAction = actions['Jump'];
        jumpAction.setLoop(THREE.LoopOnce, 0).clampWhenFinished = true; // This makes it stay at the last keyframe
        jumpAction.reset().play();
      }
    }),
    reset: button(() => {
      if (actions['Jump']) {
        // Reset the animation to initial state
        const jumpAction = actions['Jump'];
        jumpAction.stop();
        jumpAction.reset();
      }
    }),
  });

  // Store controls reference
  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

  // Log available animations
  useEffect(() => {
    console.log('Available animations:', names);
  }, [names]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function Scene() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);

  return (
    <>
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={20}
      />

      {/* Model */}
      <AnimatedModel />
    </>
  );
}

export default function AnimationPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{
          position: [3, 3, 3],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          alpha: false,
        }}
      >
        <Stats />
        <Scene />
      </Canvas>
    </div>
  );
}
