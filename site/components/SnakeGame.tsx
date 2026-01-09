'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/useGame';
import { usePlayerWallet } from '@/hooks/useWallet';
import { formatTime, formatPoints } from '@/lib/wallet';

const CELL_SIZE = 20;
const CANVAS_SIZE = 400;

const SKIN_COLORS: Record<string, { primary: string; secondary: string }> = {
  classic: { primary: '#4ade80', secondary: '#22c55e' },
  neon: { primary: '#22d3ee', secondary: '#0891b2' },
  gold: { primary: '#fbbf24', secondary: '#f59e0b' },
  fire: { primary: '#ef4444', secondary: '#dc2626' },
  rainbow: { primary: '#a855f7', secondary: '#ec4899' },
  diamond: { primary: '#f0f9ff', secondary: '#e0f2fe' },
};

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, startGame, endGame, changeDirection, gridSize } = useGame();
  const { player, startGameSession, endGameSession, sendHeartbeat } = usePlayerWallet();
  const [sessionData, setSessionData] = useState<{ sessionId: string; gameSessionId: string } | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  const currentSkin = player?.current_skin || 'classic';
  const colors = SKIN_COLORS[currentSkin] || SKIN_COLORS.classic;

  // Start game handler
  const handleStart = useCallback(async () => {
    const session = await startGameSession();
    if (session) {
      setSessionData({ sessionId: session.sessionId, gameSessionId: session.gameSessionId });
    }
    startGame();
  }, [startGame, startGameSession]);

  // End game handler
  useEffect(() => {
    if (gameState.isGameOver && sessionData) {
      endGameSession(
        sessionData.sessionId,
        sessionData.gameSessionId,
        gameState.score,
        gameState.playtimeSeconds,
        gameState.pillsEaten,
        gameState.gameOverReason || 'quit'
      );
      setSessionData(null);
    }
  }, [gameState.isGameOver, sessionData, gameState.score, gameState.playtimeSeconds, gameState.pillsEaten, gameState.gameOverReason, endGameSession]);

  // Heartbeat
  useEffect(() => {
    if (gameState.isPlaying && sessionData) {
      heartbeatRef.current = setInterval(() => {
        sendHeartbeat(sessionData.sessionId, true);
      }, 30000);

      return () => {
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      };
    }
  }, [gameState.isPlaying, sessionData, sendHeartbeat]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake
    gameState.snake.forEach((segment, index) => {
      const isHead = index === 0;

      // Rainbow animation for rainbow skin
      if (currentSkin === 'rainbow') {
        const hue = (Date.now() / 20 + index * 20) % 360;
        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
      } else {
        ctx.fillStyle = isHead ? colors.primary : colors.secondary;
      }

      // Draw rounded rectangle for each segment
      const x = segment.x * CELL_SIZE + 1;
      const y = segment.y * CELL_SIZE + 1;
      const size = CELL_SIZE - 2;
      const radius = 4;

      ctx.beginPath();
      ctx.roundRect(x, y, size, size, radius);
      ctx.fill();

      // Add glow effect for diamond skin
      if (currentSkin === 'diamond' && isHead) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw pill
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(
      gameState.pill.x * CELL_SIZE + CELL_SIZE / 2,
      gameState.pill.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw golden pill if exists
    if (gameState.goldenPill) {
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(
        gameState.goldenPill.x * CELL_SIZE + CELL_SIZE / 2,
        gameState.goldenPill.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [gameState, colors, gridSize, currentSkin]);

  // Mobile touch controls
  const handleTouch = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameState.isPlaying) {
      changeDirection(direction);
    }
  }, [gameState.isPlaying, changeDirection]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score and Timer */}
      <div className="flex items-center gap-8 text-lg">
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Score:</span>
          <span className="text-green-primary font-bold">{formatPoints(gameState.score)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Time:</span>
          <span className="text-yellow-gold font-bold">{formatTime(gameState.playtimeSeconds)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Pills:</span>
          <span className="text-pink-pill font-bold">{gameState.pillsEaten}</span>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="game-canvas rounded-lg border border-border"
        />

        {/* Start/Game Over Overlay */}
        {(!gameState.isPlaying || gameState.isGameOver) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            {gameState.isGameOver ? (
              <>
                <h2 className="font-retro text-red-500 text-lg mb-2">GAME OVER</h2>
                <p className="text-text-muted mb-4">
                  {gameState.gameOverReason === 'wall' ? 'Hit the wall!' : 'Hit yourself!'}
                </p>
                <p className="text-green-primary text-xl mb-6">
                  Final Score: {formatPoints(gameState.score)}
                </p>
              </>
            ) : (
              <>
                <h2 className="font-retro text-green-primary text-lg mb-4">SNAKEPILL</h2>
                <p className="text-text-muted text-sm mb-6 text-center px-4">
                  Use arrow keys or WASD to move<br />
                  Eat pills to grow and score points!
                </p>
              </>
            )}
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-green-primary text-black font-bold rounded-lg hover:bg-green-secondary transition-colors"
            >
              {gameState.isGameOver ? 'PLAY AGAIN' : 'START GAME'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden grid grid-cols-3 gap-2 w-48">
        <div />
        <button
          onTouchStart={() => handleTouch('UP')}
          className="touch-control p-4 bg-card border border-border rounded-lg active:bg-green-primary active:text-black"
        >
          &#x25B2;
        </button>
        <div />
        <button
          onTouchStart={() => handleTouch('LEFT')}
          className="touch-control p-4 bg-card border border-border rounded-lg active:bg-green-primary active:text-black"
        >
          &#x25C0;
        </button>
        <button
          onTouchStart={() => handleTouch('DOWN')}
          className="touch-control p-4 bg-card border border-border rounded-lg active:bg-green-primary active:text-black"
        >
          &#x25BC;
        </button>
        <button
          onTouchStart={() => handleTouch('RIGHT')}
          className="touch-control p-4 bg-card border border-border rounded-lg active:bg-green-primary active:text-black"
        >
          &#x25B6;
        </button>
      </div>

      {/* Player Stats */}
      {player && (
        <div className="text-sm text-text-muted">
          Total Points: <span className="text-green-primary">{formatPoints(player.total_points)}</span>
          {' | '}
          Games: <span className="text-yellow-gold">{player.games_played}</span>
          {' | '}
          Best: <span className="text-pink-pill">{formatPoints(player.highest_score)}</span>
        </div>
      )}
    </div>
  );
}
