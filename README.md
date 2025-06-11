
# Dependencies
yarn add three @types/three @react-three/fiber @react-three/drei

# compress GLB model
```
gltf-pipeline -i public/glb/room.glb -o public/glb/room.draco.glb --draco.compressionLevel=7
gltf-pipeline -i public/container.glb -o public/container.draco.glb --draco.compressionLevel=7
gltf-pipeline -i public/glb/goboard.glb -o public/glb/goboard.draco.glb --draco.compressionLevel=7
gltf-pipeline -i public/glb/roomBaked.glb -o public/glb/roomBaked.draco.glb --draco.compressionLevel=7