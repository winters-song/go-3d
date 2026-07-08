import { useRef, useEffect } from 'react'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useAppSelector } from '@/store/hooks'
import { useCameraControls } from '@/hooks/useCameraControls'

// Create a global event emitter for camera controls
const cameraEvents = {
  listeners: new Set<() => void>(),
  emit() {
    this.listeners.forEach(listener => listener());
  },
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
};

export function useCameraTopView() {
  return () => cameraEvents.emit();
}

export default function CursorManager() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const isCameraLocked = useAppSelector((state) => state.camera.isLocked);
  const { handleCameraTopView } = useCameraControls(controlsRef);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 't' || event.key === 'T') {
        handleCameraTopView();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleCameraTopView]);

  useEffect(() => {
    const cleanup = cameraEvents.subscribe(handleCameraTopView);
    return () => {
      cleanup();
    };
  }, [handleCameraTopView]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={50}
        target={[0, 2, 0]}
        makeDefault
        enabled={!isCameraLocked}
      />
    </>
  )
} 