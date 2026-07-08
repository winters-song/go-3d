# KataGo API Documentation

This document describes the Next.js API routes for integrating with KataGo GTP service for Go game functionality.

## Prerequisites

1. **KataGo Installation**: Make sure KataGo is installed on your system
2. **Model Files**: Ensure the KataGo model and config files are available at the specified paths
3. **Next.js Setup**: The API routes are built for Next.js 13+ with App Router

## API Endpoints

### 1. Create New Game

**Endpoint**: `POST /api/new_game`

**Description**: Creates a new Go game session with KataGo AI

**Request Body**:
```json
{
  "boardSize": 19,
  "komi": 7.5
}
```

**Parameters**:
- `boardSize` (optional): Board size (default: 19)
- `komi` (optional): Komi value (default: 7.5)

**Response**:
```json
{
  "success": true,
  "game": {
    "gameId": "1703123456789",
    "boardSize": 19,
    "komi": 7.5,
    "boardState": "   A B C D E F G H J K L M N O P Q R S T\n19 . . . . . . . . . . . . . . . . . .\n18 . . . . . . . . . . . . . . . . . .\n17 . . . . . . . . . . . . . . . . . .\n..."
  }
}
```

### 2. Make Game Move

**Endpoint**: `POST /api/game_move`

**Description**: Makes a move in an active game and gets AI response

**Request Body**:
```json
{
  "gameId": "1703123456789",
  "color": "B",
  "position": "A1"
}
```

**Parameters**:
- `gameId` (required): Game ID from new_game response
- `color` (required): Player color ("B" for Black, "W" for White)
- `position` (required): Move position in Go notation (e.g., "A1", "T19")

**Response**:
```json
{
  "success": true,
  "move": {
    "move": {
      "color": "B",
      "position": "A1"
    },
    "boardState": "   A B C D E F G H J K L M N O P Q R S T\n19 . . . . . . . . . . . . . . . . . .\n18 . . . . . . . . . . . . . . . . . .\n17 . . . . . . . . . . . . . . . . . .\n...",
    "nextMove": "T19",
    "gameOver": false
  }
}
```

**Game Over Response**:
```json
{
  "success": true,
  "move": {
    "move": {
      "color": "W",
      "position": "T19"
    },
    "boardState": "...",
    "nextMove": "pass",
    "gameOver": true,
    "score": "B+3.5"
  }
}
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Create a new game
const createGame = async () => {
  const response = await fetch('/api/new_game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ boardSize: 19, komi: 7.5 })
  })
  const data = await response.json()
  return data.game
}

// Make a move
const makeMove = async (gameId: string, color: 'B' | 'W', position: string) => {
  const response = await fetch('/api/game_move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, color, position })
  })
  const data = await response.json()
  return data.move
}

// Example usage
const playGame = async () => {
  // Create new game
  const game = await createGame()
  console.log('Game created:', game.gameId)
  
  // Make first move
  const moveResult = await makeMove(game.gameId, 'B', 'A1')
  console.log('AI response:', moveResult.nextMove)
  
  // Continue playing...
}
```

### cURL Examples

```bash
# Create new game
curl -X POST http://localhost:3000/api/new_game \
  -H "Content-Type: application/json" \
  -d '{"boardSize": 19, "komi": 7.5}'

# Make move
curl -X POST http://localhost:3000/api/game_move \
  -H "Content-Type: application/json" \
  -d '{"gameId": "1703123456789", "color": "B", "position": "A1"}'
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description"
}
```

**Common Error Codes**:
- `400`: Bad Request (invalid parameters)
- `404`: Game not found
- `500`: Internal Server Error (KataGo issues)

## Coordinate System

The API uses standard Go notation:
- Columns: A-T (skipping I)
- Rows: 1-19 (for 19x19 board)
- Examples: A1, T19, K10

## Utility Functions

The project includes utility functions in `src/utils/goUtils.ts`:

```typescript
import { coordsToIndex, indexToCoords, isValidPosition, isValidColor } from '@/utils/goUtils'

// Convert coordinates to array indices
const indices = coordsToIndex('A1', 19) // [0, 18]

// Convert array indices to coordinates
const coords = indexToCoords(0, 18, 19) // "A1"

// Validate position format
const isValid = isValidPosition('A1') // true

// Validate color
const isValidColor = isValidColor('B') // true
```

## Testing

Visit `/test-backend` in your application to test the API endpoints with a user interface.

## Notes

- Games are stored in memory and will be lost on server restart
- For production, implement proper database storage
- KataGo processes are managed per game session
- The API automatically handles AI responses after each move 