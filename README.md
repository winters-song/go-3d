
# Dependencies
yarn add three @types/three @react-three/fiber @react-three/drei

# compress GLB model
```
gltf-pipeline -i public/glb/room.glb -o public/glb/room.draco.glb --draco.compressionLevel=7
gltf-pipeline -i public/container.glb -o public/container.draco.glb --draco.compressionLevel=7
gltf-pipeline -i public/glb/goboard.glb -o public/glb/goboard.draco.glb --draco.compressionLevel=7
gltf-pipeline -i public/glb/room-baked.glb -o public/glb/room-baked.draco.glb --draco.compressionLevel=7
gltf-pipeline -i public/glb/room-baked2.glb -o public/glb/room-baked.draco.glb --draco.compressionLevel=7