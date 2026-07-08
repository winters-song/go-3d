# Dependencies
yarn add three @types/three @react-three/fiber @react-three/drei

# compress GLB model
```
gltf-pipeline -i public/glb/room-baked.glb -o public/glb/room-baked.draco.glb --draco.compressionLevel=7
gltf-pipeline -i public/glb/room-baked3.glb -o public/glb/room-baked.draco.glb --draco.compressionLevel=7
gltf-pipeline -i public/glb/company.glb -o public/glb/company.draco.glb --draco.compressionLevel=7

# Go 3D Application

A 3D Go game application built with Next.js, Three.js, and React Three Fiber.

## Features

- 3D Go board with interactive stones
- Real-time backend communication via iframe
- Model manipulation (color, position)
- Game move handling
- Sound effects
- Camera controls

## Backend Communication

The application uses an iframe-based backend communication system where:

1. **Backend Page**: Located at `/src/app/backend/page.tsx`, serves as the backend logic
2. **Communication Service**: `BackendCommunication` class handles postMessage communication
3. **Iframe Integration**: The backend is embedded as a hidden iframe in the main page

### How it works

1. The main page loads with a hidden iframe pointing to `/backend`
2. The `BackendCommunication` service is connected to the iframe
3. Messages are sent via `postMessage` between the main page and iframe
4. The backend processes messages and sends responses back

### Message Types

- `request_model_info` - Get current model state
- `request_scene_config` - Get scene configuration
- `update_model_color` - Update model color
- `update_model_position` - Update model position
- `game_move` - Send a game move
- `play_sound` - Play a sound effect
- `update_camera` - Update camera position
- `toggle_lighting` - Toggle scene lighting
- `update_environment` - Update environment

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Testing Backend Communication

Visit `http://localhost:3000/test-backend` to test the iframe communication system.

## Project Structure

```
src/
├── app/
│   ├── backend/           # Backend iframe page
│   ├── test-backend/      # Backend communication test page
│   └── page.tsx          # Main application page
├── components/
│   ├── BackendControls.tsx  # UI controls for backend communication
│   └── ...
├── services/
│   └── BackendCommunication.ts  # Communication service
└── ...
```

## Usage Examples

### Basic Communication

```typescript
import { backendComm } from '@/services/BackendCommunication'

// Update model color
await backendComm.updateModelColor('#ff0000')

// Send game move
await backendComm.sendGameMove({ col: 3, row: 3, color: 1 })

// Listen for updates
backendComm.on('model_update', (data) => {
  console.log('Model updated:', data)
})
```

### Model Manipulation

```typescript
// Update model position
await backendComm.updateModelPosition([1, 2, 3])

// Update multiple properties
await backendComm.updateModel({
  color: '#00ff00',
  position: [0, 1, 0]
})
```

### Scene Configuration

```typescript
// Toggle lighting
await backendComm.toggleLighting(false)

// Update camera
await backendComm.updateCameraPosition([5, 5, 5])

// Update environment
await backendComm.updateEnvironment('forest')
```

## Backend State

The backend maintains the following state:

- **Model State**: Color, position, visibility
- **Scene Config**: Lighting, environment, camera settings
- **Message Queue**: Recent messages for debugging

## Benefits of Iframe Approach

1. **No separate server needed** - Backend runs within the same Next.js application
2. **Isolated environment** - Backend logic is separated from frontend
3. **Real-time communication** - Fast postMessage communication
4. **Easy debugging** - Can access backend page directly at `/backend`
5. **No CORS issues** - Same-origin communication

## Troubleshooting

### Iframe not loading
- Check that the backend page is accessible at `/backend`
- Verify the iframe src is correct

### Communication not working
- Check browser console for errors
- Verify the iframe is properly connected to the communication service
- Test communication using the test page at `/test-backend`

### Messages not received
- Check that message types match between frontend and backend
- Verify the message listener is properly set up
- Check for any JavaScript errors in the backend iframe
