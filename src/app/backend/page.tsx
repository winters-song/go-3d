'use client';
import { useEffect, useState } from 'react';

// Backend API functions
const backendAPI = {
  // Handle incoming messages
  handleMessage: async (message: any) => {
    console.log('Backend received message:', message);

    const { id, type, payload } = message;

    switch (type) {
      case 'new_game':
        console.log('New game request received:', payload);
        try {
          const response = await fetch('/api/new_game', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          return {
            id,
            type: 'new_game_response',
            payload: result,
          };
        } catch (error) {
          console.error('Error creating new game:', error);
          return {
            id,
            type: 'new_game_response',
            payload: {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          };
        }

      case 'game_move':
        console.log('Game move request received:', payload);
        try {
          const response = await fetch('/api/game_move', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          return {
            id,
            type: 'game_move_response',
            payload: result,
          };
        } catch (error) {
          console.error('Error playing move:', error);
          return {
            id,
            type: 'game_move_response',
            payload: {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          };
        }

      default:
        return {
          id,
          type: 'error',
          payload: { message: 'Unknown message type' },
        };
    }
  },
};

export default function BackendPage() {
  useEffect(() => {
    // Set up message listener for iframe communication
    const handleMessage = async (event: MessageEvent) => {
      // Only accept messages from the parent window
      if (event.source !== window.parent) {
        return;
      }

      try {
        const response = await backendAPI.handleMessage(event.data);
        // Send response back to parent
        window.parent.postMessage(response, '*');
      } catch (error) {
        console.error('Error processing message:', error);
        // Send error response back to parent
        window.parent.postMessage(
          {
            id: event.data?.id,
            type: 'error',
            payload: {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
          '*'
        );
      }
    };

    window.addEventListener('message', handleMessage);

    // Expose API to parent window
    // ;(window as any).backendAPI = backendAPI

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return <div>{/* Backend page - handles API communication */}</div>;
}
