'use client'

import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import { useSceneEntry } from '@/contexts/SceneEntryContext'

/** Reports asset loading progress from inside the Canvas tree. */
export default function LoadingReporter() {
  const { progress } = useProgress()
  const { setProgress } = useSceneEntry()

  useEffect(() => {
    setProgress(progress)
  }, [progress, setProgress])

  return null
}
