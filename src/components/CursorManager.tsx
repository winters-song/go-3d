import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CursorManagerProps {
  isCameraLocked: boolean
}

export default function CursorManager({ isCameraLocked }: CursorManagerProps) {
  const { gl, camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect()
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Update the raycaster
      raycaster.current.setFromCamera(mouse.current, camera)

      // Find intersections with objects that have board: true in userData
      const intersects = raycaster.current.intersectObjects(scene.children, true)
      const isOverBoard = intersects.some(intersect => 
        intersect.object.userData?.board === true
      )

      // If not over the board and camera is unlocked, show grab cursor
      if (!isOverBoard && !isCameraLocked) {
        gl.domElement.style.cursor = 'grab'
      }
    }

    const handleMouseDown = () => {
      // When mouse is down and camera is unlocked, show grabbing cursor
      if (!isCameraLocked) {
        gl.domElement.style.cursor = 'grabbing'
      }
    }

    const handleMouseUp = () => {
      // Reset to grab cursor when mouse is released
      if (!isCameraLocked) {
        gl.domElement.style.cursor = 'grab'
      }
    }

    // Add event listeners
    gl.domElement.addEventListener('mousemove', handleMouseMove)
    gl.domElement.addEventListener('mousedown', handleMouseDown)
    gl.domElement.addEventListener('mouseup', handleMouseUp)

    // Reset cursor when component unmounts or camera is locked
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove)
      gl.domElement.removeEventListener('mousedown', handleMouseDown)
      gl.domElement.removeEventListener('mouseup', handleMouseUp)
      gl.domElement.style.cursor = 'default'
    }
  }, [gl, camera, scene, isCameraLocked])

  return null
} 