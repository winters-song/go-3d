
# Dependencies
yarn add three @types/three @react-three/fiber @react-three/drei

# compress GLB model
```
gltf-pipeline -i public/container.glb -o public/container.draco.glb --draco.compressionLevel=7