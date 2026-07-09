'use client';
import { useState } from 'react';

interface GameState {
  gameId: string;
  boardState: string;
  boardSize: number;
  komi: number;
}

interface MoveResult {
  move: { color: string; position: string };
  boardState: string;
  nextMove: string;
  gameOver: boolean;
  score?: string;
}

export default function TestBackendPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [moveResult, setMoveResult] = useState<MoveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState('');
  const [color, setColor] = useState<'B' | 'W'>('B');

  const createNewGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/new_game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardSize: 19,
          komi: 7.5,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGameState(data.game);
        setMoveResult(null);
      } else {
        setError(data.error || 'Failed to create new game');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const makeMove = async () => {
    if (!gameState || !position) {
      setError('Please create a game first and enter a position');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/game_move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: gameState.gameId,
          color,
          position,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMoveResult(data.move);
        setGameState(prev => (prev ? { ...prev, boardState: data.move.boardState } : null));
        setPosition('');
      } else {
        setError(data.error || 'Failed to make move');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">KataGo API Test</h1>

      <div className="space-y-6">
        {/* New Game Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Create New Game</h2>
          <button
            onClick={createNewGame}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create New Game'}
          </button>
        </div>

        {/* Game State Display */}
        {gameState && (
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Game State</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <strong>Game ID:</strong> {gameState.gameId}
              </div>
              <div>
                <strong>Board Size:</strong> {gameState.boardSize}
              </div>
              <div>
                <strong>Komi:</strong> {gameState.komi}
              </div>
            </div>
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">Board State:</h3>
              <pre className="text-sm font-mono whitespace-pre-wrap">{gameState.boardState}</pre>
            </div>
          </div>
        )}

        {/* Make Move Section */}
        {gameState && (
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Make Move</h2>
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Color:</label>
                <select
                  value={color}
                  onChange={e => setColor(e.target.value as 'B' | 'W')}
                  className="border rounded px-3 py-2"
                >
                  <option value="B">Black</option>
                  <option value="W">White</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position:</label>
                <input
                  type="text"
                  value={position}
                  onChange={e => setPosition(e.target.value.toUpperCase())}
                  placeholder="e.g., A1, T19"
                  className="border rounded px-3 py-2 w-24"
                />
              </div>
              <button
                onClick={makeMove}
                disabled={loading || !position}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Making Move...' : 'Make Move'}
              </button>
            </div>
          </div>
        )}

        {/* Move Result Display */}
        {moveResult && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Move Result</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <strong>Move:</strong> {moveResult.move.color} at {moveResult.move.position}
              </div>
              <div>
                <strong>AI Response:</strong> {moveResult.nextMove}
              </div>
              <div>
                <strong>Game Over:</strong> {moveResult.gameOver ? 'Yes' : 'No'}
              </div>
              {moveResult.score && (
                <div>
                  <strong>Score:</strong> {moveResult.score}
                </div>
              )}
            </div>
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">Updated Board State:</h3>
              <pre className="text-sm font-mono whitespace-pre-wrap">{moveResult.boardState}</pre>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
