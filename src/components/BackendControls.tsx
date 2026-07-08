import React, { useState, useEffect, useRef } from 'react'

export default function BackendControls() {
  const [status, setStatus] = useState('')
  const [gameId, setGameId] = useState('')
  const [moveInput, setMoveInput] = useState('')
  const [color, setColor] = useState('B')
  const [boardSize, setBoardSize] = useState(19)
  const [komi, setKomi] = useState(7.5)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Set up message listener for backend responses
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our backend iframe
      if (event.source !== iframeRef.current?.contentWindow) {
        return
      }

      const { type, payload } = event.data
      
      switch (type) {
        case 'new_game_response':
          if (payload.success) {
            setGameId(payload.game.gameId)
            setStatus(`New game created successfully! Game ID: ${payload.game.gameId}`)
          } else {
            setStatus(`Failed to create game: ${payload.error}`)
          }
          break
          
        case 'game_move_response':
          if (payload.success) {
            setStatus(`Move played successfully! Position: ${moveInput.toUpperCase()}, Color: ${color}`)
            setMoveInput('')
            // Toggle color for next move
            setColor(color === 'B' ? 'W' : 'B')
          } else {
            setStatus(`Failed to play move: ${payload.error}`)
          }
          break
          
        default:
          console.log('Unknown message type:', type)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [moveInput, color])

  const sendMessageToBackend = (type: string, payload: any = {}) => {
    if (!iframeRef.current?.contentWindow) {
      setStatus('Backend iframe not ready')
      return
    }

    const message = {
      id: Date.now(),
      type,
      payload,
      timestamp: Date.now()
    }

    console.log('Sending message to backend:', message)
    iframeRef.current.contentWindow.postMessage(message, '*')
  }

  const handleCreateNewGame = () => {
    setStatus('Creating new game...')
    sendMessageToBackend('new_game', {
      boardSize,
      komi
    })
  }

  const handlePlayMove = () => {
    if (!gameId) {
      setStatus('Please create a game first')
      return
    }

    if (!moveInput.trim()) {
      setStatus('Please enter a move position (e.g., A1, T19)')
      return
    }

    setStatus('Playing move...')
    sendMessageToBackend('game_move', {
      gameId,
      color,
      position: moveInput.trim().toUpperCase()
    })
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      zIndex: 1000,
      minWidth: '350px'
    }}>
      <h3>Backend Controls</h3>
      
      {/* Hidden iframe for backend communication */}
      <iframe
        ref={iframeRef}
        src="/backend"
        style={{ display: 'none' }}
        title="Backend Communication"
      />
      
      {/* New Game Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #444', borderRadius: '5px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Create New Game</h4>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Board Size:</label>
          <select 
            value={boardSize} 
            onChange={(e) => setBoardSize(Number(e.target.value))}
            style={{
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              padding: '5px',
              borderRadius: '3px',
              width: '100%'
            }}
          >
            <option value={9}>9x9</option>
            <option value={13}>13x13</option>
            <option value={19}>19x19</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Komi:</label>
          <input
            type="number"
            value={komi}
            onChange={(e) => setKomi(Number(e.target.value))}
            step="0.5"
            style={{
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              padding: '5px',
              borderRadius: '3px',
              width: '100%'
            }}
          />
        </div>

        <button
          onClick={handleCreateNewGame}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Create New Game
        </button>
      </div>

      {/* Play Move Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #444', borderRadius: '5px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Play Move</h4>
        
        {gameId && (
          <div style={{ marginBottom: '10px', fontSize: '12px', color: '#aaa' }}>
            Game ID: {gameId}
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Color:</label>
          <select 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            style={{
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              padding: '5px',
              borderRadius: '3px',
              width: '100%'
            }}
          >
            <option value="B">Black</option>
            <option value="W">White</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Position (e.g., A1, T19):</label>
          <input
            type="text"
            value={moveInput}
            onChange={(e) => setMoveInput(e.target.value)}
            placeholder="Enter position (e.g., A1, T19)"
            style={{
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              padding: '5px',
              borderRadius: '3px',
              width: '100%'
            }}
          />
        </div>

        <button
          onClick={handlePlayMove}
          disabled={!gameId}
          style={{
            background: gameId ? '#2196F3' : '#666',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: gameId ? 'pointer' : 'not-allowed',
            width: '100%'
          }}
        >
          Play Move
        </button>
      </div>

      {/* Status Display */}
      {status && (
        <div style={{
          padding: '10px',
          background: status.includes('Failed') ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
          borderRadius: '4px',
          fontSize: '14px',
          wordBreak: 'break-word'
        }}>
          {status}
        </div>
      )}
    </div>
  )
} 