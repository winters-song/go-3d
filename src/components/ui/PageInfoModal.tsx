'use client'

import { useEffect } from 'react'
import { CloseIcon } from './icons'

interface PageInfoModalProps {
  open: boolean
  onClose: () => void
}

const FEATURES = [
  '3D 和室场景：榻榻米、庭园 HDR 环境光与 Draco 烘焙模型',
  '阴雨 ASMR 氛围：背景雨声与场景共同营造宁静的雨天沉浸感',
  '棋谱浏览：底部控制栏支持逐步前进、后退与跳转',
  '文件操作：新建棋局或导入 SGF 棋谱文件',
  '视角控制：锁定/解锁相机、俯视视角与全屏模式',
]

export default function PageInfoModal({ open, onClose }: PageInfoModalProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-info-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/30 animate-[modal-fade-in_0.25s_ease-out]"
        aria-label="关闭"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-white/60 bg-white/75 backdrop-blur-md p-6 text-neutral-800 shadow-2xl animate-[modal-fade-in_0.25s_ease-out]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/60 hover:text-neutral-700 cursor-pointer"
          aria-label="关闭"
        >
          <CloseIcon />
        </button>

        <div className="text-center">
          <p className="mb-1 text-xs tracking-[0.35em] uppercase text-neutral-400">
            Washitsu · 和室
          </p>
          <h2 id="page-info-title" className="mb-3 text-2xl font-light tracking-wide text-neutral-900">
            Go 3D
          </h2>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-neutral-600">
          一款将围棋对弈与日式和室 3D 场景结合的沉浸式体验。3D 场景与背景雨声音效共同营造阴雨天的
          ASMR 氛围，让你在宁静中观棋、复盘。
        </p>

        <h3 className="mb-3 text-xs font-medium tracking-widest uppercase text-neutral-400">
          功能简介
        </h3>
        <ul className="space-y-2.5 text-sm leading-relaxed text-neutral-600">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
