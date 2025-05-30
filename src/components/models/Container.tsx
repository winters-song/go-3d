import * as THREE from 'three'

export default function Container({ scene, woodTexture }: { scene: THREE.Group, woodTexture: THREE.Texture }) {
  // Clone scenes with true for nodes, but we need to handle materials separately
  const scene1 = scene.clone(true)
  const scene2 = scene.clone(true)
  
  // Ensure unique materials for each scene
  const ensureUniqueMaterials = (obj: THREE.Object3D) => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map(mat => mat.clone());
        } else {
          child.material = child.material.clone();
        }
      }
    });
  }
  
  // Create unique materials for each scene
  ensureUniqueMaterials(scene1);
  ensureUniqueMaterials(scene2);

  const x = 2.2
  const scale = 6

  // Helper function to enable shadows on all meshes
  const enableShadows = (obj: THREE.Object3D, color: 'black' | 'white') => {
    // Apply color-specific material properties
    const materialProps = color === 'black' ? {
      color: new THREE.Color('#000000'),
      roughness: 0.337,
      metalness: 0.0,
      envMapIntensity: 1.0
    } : {
      color: new THREE.Color('#ffffff'),
      roughness: 0.2,
      metalness: 0.0,
      envMapIntensity: 1.0
    }

    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        child.castShadow = true;

        // Make the "Sphere_Old_Wood_0" material brighter
        if (child.name === 'Sphere_Old_Wood_0' && child.material) {
          // Ensure the material has the necessary properties
          if (child.material instanceof THREE.MeshStandardMaterial) {
            // Increase emissive intensity for more brightness
            child.material.map = woodTexture;
            // Increase roughness to reduce specular highlights
            child.material.roughness = 0.35;
            // Increase metalness for more reflectivity
            child.material.metalness = 0.4;
          }
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
          // Apply material properties to all other meshes with standard materials
          Object.assign(child.material, materialProps);
        }
      }
    });
  }

  // Apply shadow settings
  enableShadows(scene1, 'black');
  enableShadows(scene2, 'white');

  return (
    <>
      <primitive
        object={scene1}
        position={[x, 0.1, 1]}
        scale={scale}
        castShadow
      />
      <primitive
        object={scene2}
        position={[-x, 0.1, -1]}
        scale={scale}
        castShadow
      />
    </>
  )
} 