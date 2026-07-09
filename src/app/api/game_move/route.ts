import { NextRequest, NextResponse } from 'next/server';
import { KataGoService } from '@/services/KataGoService';
import { isValidPosition, isValidColor } from '@/utils/goUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, color, position } = body;

    if (!gameId || !color || !position) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: gameId, color, position' },
        { status: 400 }
      );
    }

    // Check if the game exists in persistent storage
    if (!KataGoService.hasGame(gameId)) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
    }

    // Validate color
    if (!isValidColor(color)) {
      return NextResponse.json(
        { success: false, error: 'Invalid color. Must be "B" or "W"' },
        { status: 400 }
      );
    }

    // Validate position format
    if (!isValidPosition(position)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position format. Must be like "A1" or "T19"' },
        { status: 400 }
      );
    }

    // Create a new KataGoService instance for this game
    const kataGoService = await KataGoService.createFromGameId(gameId);

    try {
      const moveResult = await kataGoService.makeMove(color, position);

      return NextResponse.json({
        success: true,
        move: moveResult,
      });
    } finally {
      // Clean up the KataGo process
      kataGoService.destroy();
    }
  } catch (error) {
    console.error('Error in game_move API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
