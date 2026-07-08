import { useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'

export function useCameraControls(controlsRef: React.RefObject<OrbitControlsImpl | null>) {
  const handleCameraTopView = useCallback(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      // Store the current camera position and target
      const startPosition = controls.object.position.clone();
      const startTarget = controls.target.clone();
      
      // Calculate the end position (directly above the board)
      const endPosition = new THREE.Vector3(0, 6.5, 0.1);
      const endTarget = new THREE.Vector3(0, 2, 0);
      
      // Animation parameters
      const duration = 1000; // 1 second
      const startTime = Date.now();
      
      // Animation function
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out function
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Interpolate position and target
        controls.object.position.lerpVectors(startPosition, endPosition, easeProgress);
        controls.target.lerpVectors(startTarget, endTarget, easeProgress);
        
        // Update controls
        controls.update();
        
        // Continue animation if not complete
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }
      
      // Start animation
      animate();
    }
  }, [controlsRef]);

  return { handleCameraTopView };
} 