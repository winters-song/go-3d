import { useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'


const noShadowList = ['Glass01','Glass02','Glass004','HDR_ball']

export default function Room({ scene }: { scene: THREE.Group }) {
  
  // Apply transformations or materials as needed
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        console.log(child.name)
        if(noShadowList.includes(child.name)) {
          console.log('glass', child.name)
          child.castShadow = false
          child.receiveShadow = false
        }else{
          child.castShadow = true
          child.receiveShadow = true
        }

        if(child.name === 'HDR_ball') {
          child.visible = false
        }

        // Log detailed material info for tatami mesh
        if (child.name.toLowerCase().includes('tatami') && child instanceof THREE.Mesh) {
          console.log('Found tatami mesh:', child.name)
          
          if (child.material) {
            // Handle single material
            if (!Array.isArray(child.material)) {
              const material = child.material as THREE.Material
              console.log('Tatami material type:', material.type)
              console.log('Tatami material:', {
                uuid: material.uuid,
                name: material.name,
                transparent: material.transparent,
                opacity: (material as any).opacity,
                side: material.side
              })
              
              // Additional properties for common material types
              if (material instanceof THREE.MeshStandardMaterial) {
                console.log('Tatami standard material properties:', {
                  color: material.color.getHexString(),
                  roughness: material.roughness,
                  metalness: material.metalness,
                  emissive: material.emissive.getHexString(),
                  emissiveIntensity: material.emissiveIntensity
                })
                
                // Texture information
                if (material.map) {
                  console.log('Tatami diffuse texture:', {
                    name: material.map.name,
                    uuid: material.map.uuid,
                    repeat: material.map.repeat,
                    offset: material.map.offset
                  })
                }
                
                if (material.normalMap) {
                  console.log('Tatami normal map:', { 
                    exists: true,
                    name: material.normalMap.name
                  })
                  material.normalMap = null;
                }
                
                if (material.roughnessMap) {
                  console.log('Tatami roughness map:', { 
                    exists: true,
                    name: material.roughnessMap.name
                  })
                  material.roughnessMap = null;
                }
              }
            } else {
              // Handle material array
              console.log('Tatami has multiple materials:', child.material.length)
              child.material.forEach((mat, index) => {
                console.log(`Tatami material [${index}]:`, {
                  type: mat.type,
                  name: mat.name
                })
              })
            }
          }
        }
        
        // if (child instanceof THREE.Mesh) {
        //   console.log(child.name)
        //   if(glassList.includes(child.name)) {
        //     console.log('glass', child.name)
        //     child.castShadow = false
        //     child.receiveShadow = false
        //   }else{
        //     child.castShadow = true
        //     child.receiveShadow = true
        //   }
        // }
      })
    }
  }, [scene])

  return <primitive object={scene} position={[0, 0, 0]} />
}