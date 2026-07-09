'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type SceneEntryPhase = 'loading' | 'ready' | 'intro' | 'done';

interface MusicHandlers {
  prime: () => void;
  play: () => void;
}

interface SceneEntryContextValue {
  phase: SceneEntryPhase;
  progress: number;
  setProgress: (progress: number) => void;
  markReady: () => void;
  enterScene: () => void;
  finishIntro: () => void;
  registerMusicHandlers: (handlers: MusicHandlers) => void;
}

const SceneEntryContext = createContext<SceneEntryContextValue | null>(null);

export function SceneEntryProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<SceneEntryPhase>('loading');
  const [progress, setProgress] = useState(0);
  const musicHandlersRef = useRef<MusicHandlers | null>(null);

  const markReady = useCallback(() => {
    setPhase(current => (current === 'loading' ? 'ready' : current));
  }, []);

  const enterScene = useCallback(() => {
    musicHandlersRef.current?.prime();
    setPhase('intro');
  }, []);

  const finishIntro = useCallback(() => {
    musicHandlersRef.current?.play();
    setPhase('done');
  }, []);

  const registerMusicHandlers = useCallback((handlers: MusicHandlers) => {
    musicHandlersRef.current = handlers;
  }, []);

  const value = useMemo(
    () => ({
      phase,
      progress,
      setProgress,
      markReady,
      enterScene,
      finishIntro,
      registerMusicHandlers,
    }),
    [phase, progress, markReady, enterScene, finishIntro, registerMusicHandlers]
  );

  return <SceneEntryContext.Provider value={value}>{children}</SceneEntryContext.Provider>;
}

export function useSceneEntry() {
  const ctx = useContext(SceneEntryContext);
  if (!ctx) {
    throw new Error('useSceneEntry must be used within SceneEntryProvider');
  }
  return ctx;
}
