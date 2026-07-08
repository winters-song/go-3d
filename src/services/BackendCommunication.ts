"use client"

// PostMessage communication service for iframe backend communication
export class BackendCommunication {
  private messageId = 0
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private iframeRef: HTMLIFrameElement | null = null
  private pendingMessages: Map<number, { resolve: (value: any) => void; reject: (error: any) => void }> = new Map()

  constructor() {
    // Only setup message listener if we're in the browser
    if (typeof window !== 'undefined') {
      this.setupMessageListener()
    }
  }

  setIframe(iframe: HTMLIFrameElement) {
    this.iframeRef = iframe
  }

  private setupMessageListener() {
    if (typeof window === 'undefined') return
    
    window.addEventListener('message', (event) => {
      // Only accept messages from our iframe
      if (event.source !== this.iframeRef?.contentWindow) {
        return
      }

      console.log('Received message from backend iframe:', event.data)
      
      const { id, type, payload } = event.data
      
      // Handle response to pending messages
      if (id && this.pendingMessages.has(id)) {
        console.log(`Found matching pending message with id: ${id}`)
        const { resolve } = this.pendingMessages.get(id)!
        this.pendingMessages.delete(id)
        resolve(event.data)
        return
      }

      // Log if we have an id but no matching pending message
      if (id) {
        console.log(`Received message with id ${id} but no matching pending message found`)
      }

      // Handle different message types
      switch (type) {
        case 'game_move_response':
          console.log('Game move response received:', payload)
          break;
        default:
          console.log('Unknown message type:', type)
      }

      // Notify listeners
      this.notifyListeners(type, payload)
    })
  }

  private notifyListeners(type: string, payload: any) {
    const typeListeners = this.listeners.get(type)
    if (typeListeners) {
      typeListeners.forEach(listener => listener(payload))
    }
  }

  // Add listener for specific message types
  on(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)
  }

  // Remove listener
  off(type: string, callback: (data: any) => void) {
    const typeListeners = this.listeners.get(type)
    if (typeListeners) {
      typeListeners.delete(callback)
    }
  }

  async sendMessage(type: string, payload: any = {}) {
    if (typeof window === 'undefined') {
      throw new Error('Backend communication not available during SSR')
    }
    
    if (!this.iframeRef?.contentWindow) {
      throw new Error('Backend iframe not ready')
    }

    const message = {
      id: ++this.messageId,
      type,
      payload,
      timestamp: Date.now()
    }

    console.log('Sending message to backend iframe:', message)
    
    return new Promise((resolve, reject) => {
      // Store the promise handlers
      this.pendingMessages.set(message.id, { resolve, reject })
      
      // Send message to iframe
      this.iframeRef!.contentWindow!.postMessage(message, '*')
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingMessages.has(message.id)) {
          this.pendingMessages.delete(message.id)
          reject(new Error(`Message timeout for type: ${type}, id: ${message.id}`))
        }
      }, 5000)
    })
  }

  // Game-specific methods
  async sendGameMove(move: { col: number; row: number; color: number }) {
    return this.sendMessage('game_move', move)
  }

  async requestGameState() {
    return this.sendMessage('request_game_state')
  }

  // Audio control methods
  async playSound(soundName: string) {
    return this.sendMessage('play_sound', { sound: soundName })
  }
}

// Create a singleton instance
export const backendComm = new BackendCommunication() 