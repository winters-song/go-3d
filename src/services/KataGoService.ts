import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

// File-based storage for active games
const GAMES_FILE = join(process.cwd(), 'games.json');

interface GameData {
  gameId: string;
  boardSize: number;
  komi: number;
  boardState: string;
  moves: Array<{ color: 'B' | 'W'; position: string }>;
  createdAt: number;
}

class GameStorage {
  private games: Map<string, GameData> = new Map();

  constructor() {
    this.loadGames();
  }

  private loadGames() {
    try {
      if (existsSync(GAMES_FILE)) {
        const data = readFileSync(GAMES_FILE, 'utf-8');
        const gamesArray = JSON.parse(data);
        this.games = new Map(gamesArray);
      }
    } catch (error) {
      console.error('Error loading games:', error);
      this.games = new Map();
    }
  }

  private saveGames() {
    try {
      const gamesArray = Array.from(this.games.entries());
      writeFileSync(GAMES_FILE, JSON.stringify(gamesArray, null, 2));
    } catch (error) {
      console.error('Error saving games:', error);
    }
  }

  set(gameId: string, gameData: GameData) {
    this.games.set(gameId, gameData);
    this.saveGames();
  }

  get(gameId: string): GameData | undefined {
    return this.games.get(gameId);
  }

  delete(gameId: string) {
    this.games.delete(gameId);
    this.saveGames();
  }

  has(gameId: string): boolean {
    return this.games.has(gameId);
  }
}

export class KataGoService {
  private process: any = null;
  private gameId: string | null = null;
  private static gameStorage = new GameStorage();

  private createKataGoProcess() {
    return spawn(
      'katago',
      [
        'gtp',
        '-model',
        '/usr/local/Cellar/katago/1.15.3/share/katago/g170-b30c320x2-s4824661760-d1229536699.bin.gz',
        '-config',
        '/usr/local/Cellar/katago/1.15.3/share/katago/configs/gtp_example.cfg',
      ],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );
  }

  private async waitForKataGoReady(process: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const startupMessages: string[] = [];

      const onStdout = (data: Buffer) => {
        const message = data.toString('utf-8');
        if (message.includes('GTP ready')) {
          process.stdout.removeListener('data', onStdout);
          process.stderr.removeListener('data', onStderr);
          resolve();
        }
      };

      const onStderr = (data: Buffer) => {
        const message = data.toString('utf-8');
        startupMessages.push(message);

        // Check if this looks like an error (not just startup info)
        if (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
          process.stdout.removeListener('data', onStdout);
          process.stderr.removeListener('data', onStderr);
          reject(new Error(`KataGo startup error: ${message}`));
        }

        // If we see the ready message or enough startup info, consider it ready
        if (message.includes('GTP ready') || startupMessages.length > 5) {
          process.stdout.removeListener('data', onStdout);
          process.stderr.removeListener('data', onStderr);
          resolve();
        }
      };

      process.stdout.on('data', onStdout);
      process.stderr.on('data', onStderr);

      // Timeout after 10 seconds
      setTimeout(() => {
        process.stdout.removeListener('data', onStdout);
        process.stderr.removeListener('data', onStderr);
        resolve(); // Assume ready if no error after timeout
      }, 10000);
    });
  }

  private async sendCommand(process: any, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let response = '';

      const onData = (data: Buffer) => {
        response += data.toString('utf-8');
        if (response.includes('\n\n')) {
          process.stdout.removeListener('data', onData);
          resolve(response.trim());
        }
      };

      const onError = (data: Buffer) => {
        const errorMessage = data.toString('utf-8');
        // Only treat as error if it's not just informational
        if (
          errorMessage.toLowerCase().includes('error') ||
          errorMessage.toLowerCase().includes('failed')
        ) {
          process.stdout.removeListener('data', onData);
          process.stderr.removeListener('data', onError);
          reject(new Error(`KataGo error: ${errorMessage}`));
        }
      };

      process.stdout.on('data', onData);
      process.stderr.on('data', onError);

      process.stdin.write(command + '\n');
    });
  }

  async newGame(boardSize: number = 19, komi: number = 7.5): Promise<any> {
    try {
      this.process = this.createKataGoProcess();

      // Wait for KataGo to be ready
      await this.waitForKataGoReady(this.process);

      // Initialize the game
      await this.sendCommand(this.process, `boardsize ${boardSize}`);
      await this.sendCommand(this.process, `komi ${komi}`);
      await this.sendCommand(this.process, 'clear_board');

      const boardState = await this.sendCommand(this.process, 'showboard');

      const gameId = Date.now().toString();
      this.gameId = gameId;

      // Store game data
      const gameData: GameData = {
        gameId,
        boardSize,
        komi,
        boardState: this.formatBoardState(boardState),
        moves: [],
        createdAt: Date.now(),
      };

      KataGoService.gameStorage.set(gameId, gameData);

      return {
        success: true,
        boardSize,
        komi,
        boardState: gameData.boardState,
        gameId,
      };
    } catch (error) {
      console.error('Error creating new game:', error);
      throw error;
    }
  }

  async makeMove(color: 'B' | 'W', position: string): Promise<any> {
    if (!this.process) {
      throw new Error('No active game session');
    }

    try {
      // Make the move
      await this.sendCommand(this.process, `play ${color} ${position}`);

      // Get the board state after the move
      const boardState = await this.sendCommand(this.process, 'showboard');

      // Generate next move for the opponent
      const nextColor = color === 'B' ? 'W' : 'B';
      const nextMove = await this.sendCommand(this.process, `genmove ${nextColor}`);

      // Update stored game data
      if (this.gameId) {
        const gameData = KataGoService.gameStorage.get(this.gameId);
        if (gameData) {
          gameData.moves.push({ color, position });
          gameData.boardState = this.formatBoardState(boardState);
          KataGoService.gameStorage.set(this.gameId, gameData);
        }
      }

      // Check if the game is over (pass move)
      if (nextMove.includes('= pass')) {
        const score = await this.sendCommand(this.process, 'final_score');
        return {
          success: true,
          move: { color, position },
          boardState: this.formatBoardState(boardState),
          nextMove: 'pass',
          gameOver: true,
          score,
        };
      }

      // Extract the actual move from the response
      const moveMatch = nextMove.match(/= ([A-Z]\d+)/);
      const aiMove = moveMatch ? moveMatch[1] : null;

      return {
        success: true,
        move: { color, position },
        boardState: this.formatBoardState(boardState),
        nextMove: aiMove,
        gameOver: false,
      };
    } catch (error) {
      console.error('Error making move:', error);
      throw error;
    }
  }

  private formatBoardState(boardStr: string): string {
    const lines = boardStr.split('\n');
    if (lines.length > 0) {
      lines.shift(); // Remove first line
    }

    // Format the board display
    const formattedLines = lines.map((line, index) => {
      if (index === 0) {
        return '   ' + line;
      }
      if (/^\d+/.test(line.trim())) {
        // Format row numbers
        const modifiedLine = line.replace(/^(\d+)/, match =>
          match.length === 1 ? ' ' + match : match
        );
        // Add spaces after X and O
        return modifiedLine.replace(/([OX])(\d+)/g, '$1 ');
      }
      return line;
    });

    let output = formattedLines.join('\n');

    // Remove "Next player" and everything after
    const nextPlayerIndex = output.indexOf('Next player');
    if (nextPlayerIndex !== -1) {
      output = output.substring(0, nextPlayerIndex);
    }

    return output;
  }

  destroy() {
    if (this.process) {
      this.process.stdin.end();
      this.process.kill();
      this.process = null;
    }
  }

  // Static method to get a game by ID
  static getGame(gameId: string): GameData | undefined {
    return this.gameStorage.get(gameId);
  }

  // Static method to check if a game exists
  static hasGame(gameId: string): boolean {
    return this.gameStorage.has(gameId);
  }

  // Static method to create a new KataGoService instance for an existing game
  static async createFromGameId(gameId: string): Promise<KataGoService> {
    const gameData = this.gameStorage.get(gameId);
    if (!gameData) {
      throw new Error('Game not found');
    }

    const service = new KataGoService();
    service.gameId = gameId;

    // Recreate the KataGo process and replay all moves
    service.process = service.createKataGoProcess();
    await service.waitForKataGoReady(service.process);

    // Initialize the game
    await service.sendCommand(service.process, `boardsize ${gameData.boardSize}`);
    await service.sendCommand(service.process, `komi ${gameData.komi}`);
    await service.sendCommand(service.process, 'clear_board');

    // Replay all moves
    for (const move of gameData.moves) {
      await service.sendCommand(service.process, `play ${move.color} ${move.position}`);
    }

    return service;
  }
}

// Legacy export for backward compatibility
export const activeGames = new Map<string, KataGoService>();
