import { NextRequest, NextResponse } from 'next/server'
import { KataGoService } from '@/services/KataGoService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { boardSize = 19, komi = 7.5 } = body

    const kataGoService = new KataGoService()
    const gameData = await kataGoService.newGame(boardSize, komi)
    
    // The game is now automatically stored in persistent storage
    // No need to manually store it in activeGames

    return NextResponse.json({
      success: true,
      game: gameData
    })
  } catch (error) {
    console.error('Error in new_game API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 