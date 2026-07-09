'use client'

import { useEffect, useState } from 'react'
import { useSceneEntry } from '@/contexts/SceneEntryContext'

const OVERLAY_BG =
  'radial-gradient(ellipse at 30% 20%, rgba(88, 72, 48, 0.35) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(40, 60, 40, 0.25) 0%, transparent 50%), linear-gradient(165deg, #14110e 0%, #1c1814 45%, #121510 100%)'

export default function SceneEntryOverlay() {
  const { phase, progress } = useSceneEntry()
  const [fading, setFading] = useState(false)
  const pct = Math.min(100, Math.round(progress))
  const visible = phase !== 'done'

  useEffect(() => {
    document.body.classList.toggle('scene-entry-active', visible)
    return () => document.body.classList.remove('scene-entry-active')
  }, [visible])

  useEffect(() => {
    if (phase !== 'intro') {
      setFading(false)
      return
    }
    const frame = requestAnimationFrame(() => setFading(true))
    return () => cancelAnimationFrame(frame)
  }, [phase])

  if (!visible) return null

  return (
    <div
      className={`scene-entry-overlay${fading ? ' scene-entry-overlay--fade' : ''}`}
      style={{ background: OVERLAY_BG }}
      aria-hidden={fading}
    >
      {phase === 'loading' && (
        <div className="scene-entry-overlay__content">
          <p className="scene-entry-overlay__eyebrow">Washitsu · 和室</p>
          <h1 className="scene-entry-overlay__title">Go 3D</h1>
          <p className="scene-entry-overlay__subtitle">于庭园与棋盘之间，落子对弈</p>

          <div className="scene-entry-overlay__bar" aria-hidden="true">
            <div
              className="scene-entry-overlay__bar-fill"
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="scene-entry-overlay__progress">加载场景 {pct}%</p>
          <p className="scene-entry-overlay__hint">榻榻米 · 庭园 HDR · Draco 模型</p>
        </div>
      )}
    </div>
  )
}
