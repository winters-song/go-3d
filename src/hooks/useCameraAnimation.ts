import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useCallback } from 'react';

export interface CameraKeyframe {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export function useCameraAnimation() {
  const invalidate = useThree(state => state.invalidate);

  const animateCamera = useCallback(
    (
      controls: OrbitControlsImpl,
      from: CameraKeyframe,
      to: CameraKeyframe,
      duration = 1800,
      onComplete?: () => void
    ) => {
      controls.object.position.copy(from.position);
      controls.target.copy(from.target);
      controls.update();
      invalidate();

      const startTime = Date.now();

      const tick = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const eased =
          progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        controls.object.position.lerpVectors(from.position, to.position, eased);
        controls.target.lerpVectors(from.target, to.target, eased);
        controls.update();
        invalidate();

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          onComplete?.();
        }
      };

      requestAnimationFrame(tick);
    },
    [invalidate]
  );

  return { animateCamera };
}
