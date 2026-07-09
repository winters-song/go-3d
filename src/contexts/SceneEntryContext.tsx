'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type SceneEntryPhase = 'loading' | 'intro' | 'done'

interface SceneEntryContextValue {
  phase: SceneEntryPhase
  progress: number
  setProgress: (progress: number) => void
  startIntroFade: () => void
  finishIntro: () => void
}

const SceneEntryContext = createContext<SceneEntryContextValue | null>(null)

export function SceneEntryProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<SceneEntryPhase>('loading')
  const [progress, setProgress] = useState(0)

  const startIntroFade = useCallback(() => {
    setPhase('intro')
  }, [])

  const finishIntro = useCallback(() => {
    setPhase('done')
  }, [])

  const value = useMemo(
    () => ({
      phase,
      progress,
      setProgress,
      startIntroFade,
      finishIntro,
    }),
    [phase, progress, startIntroFade, finishIntro],
  )

  return (
    <SceneEntryContext.Provider value={value}>
      {children}
    </SceneEntryContext.Provider>
  )
}

export function useSceneEntry() {
  const ctx = useContext(SceneEntryContext)
  if (!ctx) {
    throw new Error('useSceneEntry must be used within SceneEntryProvider')
  }
  return ctx
}
