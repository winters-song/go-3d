import { useThree } from "@react-three/fiber"
import { useMemo, useEffect } from "react"
import * as THREE from "three"

export default function GradientBackground() {
  const { scene } = useThree()

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#001c54')
    gradient.addColorStop(0.2, '#023fa1')
    gradient.addColorStop(0.6, '#26a8ff')
    gradient.addColorStop(1, '#26a8ff')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1, 256)
    const tex = new THREE.CanvasTexture(canvas)
    tex.magFilter = THREE.LinearFilter
    tex.minFilter = THREE.LinearFilter
    return tex
  }, [])

  useEffect(() => {
    scene.background = texture
    return () => { scene.background = null }
  }, [scene, texture])

  return null
}