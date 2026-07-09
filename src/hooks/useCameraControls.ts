import { useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { useCameraAnimation } from '@/hooks/useCameraAnimation'

export function useCameraControls(controlsRef: React.RefObject<OrbitControlsImpl | null>) {
  const { animateCamera } = useCameraAnimation()

  const handleCameraTopView = useCallback(() => {
    if (!controlsRef.current) return

    animateCamera(
      controlsRef.current,
      {
        position: controlsRef.current.object.position.clone(),
        target: controlsRef.current.target.clone(),
      },
      {
        position: new THREE.Vector3(0, 6.5, 0.1),
        target: new THREE.Vector3(0, 2, 0),
      },
      1000,
    )
  }, [controlsRef, animateCamera])

  return { handleCameraTopView }
}
