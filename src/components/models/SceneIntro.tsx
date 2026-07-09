import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { useCameraAnimation } from '@/hooks/useCameraAnimation'
import { useSceneEntry } from '@/contexts/SceneEntryContext'

const INTRO_DURATION = 2200

const INTRO_FROM = {
  position: new THREE.Vector3(-2, 8.5, 16),
  target: new THREE.Vector3(0, 1.2, -2),
}

const INTRO_TO = {
  position: new THREE.Vector3(2, 5, 4),
  target: new THREE.Vector3(0, 2, 0),
}

export default function SceneIntro() {
  const { controls } = useThree()
  const { animateCamera } = useCameraAnimation()
  const { startIntroFade, finishIntro } = useSceneEntry()
  const hasPlayed = useRef(false)

  useEffect(() => {
    if (hasPlayed.current || !controls) return
    hasPlayed.current = true

    const timer = window.setTimeout(() => {
      startIntroFade()
      animateCamera(
        controls as OrbitControlsImpl,
        INTRO_FROM,
        INTRO_TO,
        INTRO_DURATION,
        finishIntro,
      )
    }, 400)

    return () => window.clearTimeout(timer)
  }, [controls, animateCamera, startIntroFade, finishIntro])

  return null
}
