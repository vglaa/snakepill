'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/useGame';
import { usePlayerWallet } from '@/hooks/useWallet';
import { formatTime, formatPoints } from '@/lib/wallet';

const CELL_SIZE = 20;
const CANVAS_SIZE = 400;

// Nokia-style pixel art colors
const SKIN_COLORS: Record<string, { primary: string; secondary: string; bg: string }> = {
  classic: { primary: '#9bbc0f', secondary: '#8bac0f', bg: '#306230' },
  neon: { primary: '#00ffff', secondary: '#00cccc', bg: '#0a2a2a' },
  gold: { primary: '#ffd700', secondary: '#daa520', bg: '#2a2000' },
  fire: { primary: '#ff4500', secondary: '#cc3700', bg: '#2a0a00' },
  rainbow: { primary: '#ff00ff', secondary: '#cc00cc', bg: '#1a0a1a' },
  diamond: { primary: '#ffffff', secondary: '#e0e0e0', bg: '#1a1a2a' },
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

  // Draw game - Pixel Art Nokia Style
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Disable anti-aliasing for pixel art
    ctx.imageSmoothingEnabled = false;

    // Dark green Nokia-style background
    ctx.fillStyle = '#0f380f';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw subtle pixel grid pattern
    ctx.fillStyle = '#0d320d';
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw border frame (Nokia screen style)
    ctx.strokeStyle = '#9bbc0f';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CANVAS_SIZE - 2, CANVAS_SIZE - 2);

    // Draw snake - pixel blocks (no rounded corners)
    gameState.snake.forEach((segment, index) => {
      const isHead = index === 0;
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;

      // Rainbow animation for rainbow skin
      if (currentSkin === 'rainbow') {
        const hue = (Date.now() / 20 + index * 30) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      } else {
        ctx.fillStyle = isHead ? colors.primary : colors.secondary;
      }

      // Pixel block - no rounded corners
      ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

      // Add pixel detail to head
      if (isHead) {
        ctx.fillStyle = '#000';
        // Eyes based on direction
        const eyeSize = 3;
        const eyeOffset = 4;

        if (gameState.direction === 'RIGHT') {
          ctx.fillRect(x + CELL_SIZE - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(x + CELL_SIZE - eyeOffset - eyeSize, y + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (gameState.direction === 'LEFT') {
          ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(x + eyeOffset, y + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (gameState.direction === 'UP') {
          ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(x + CELL_SIZE - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
        } else {
          ctx.fillRect(x + eyeOffset, y + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
          ctx.fillRect(x + CELL_SIZE - eyeOffset - eyeSize, y + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
        }
      }

      // Diamond glow effect
      if (currentSkin === 'diamond') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    });

    // Draw pill - pixel style square with inner detail
    const pillX = gameState.pill.x * CELL_SIZE;
    const pillY = gameState.pill.y * CELL_SIZE;

    // Outer pill
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(pillX + 2, pillY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    // Inner highlight
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(pillX + 4, pillY + 4, 4, 4);

    // Draw golden pill if exists - pixel style
    if (gameState.goldenPill) {
      const gx = gameState.goldenPill.x * CELL_SIZE;
      const gy = gameState.goldenPill.y * CELL_SIZE;

      // Animated glow
      const glowIntensity = Math.sin(Date.now() / 200) * 0.3 + 0.7;

      // Outer golden pill
      ctx.fillStyle = `rgba(251, 191, 36, ${glowIntensity})`;
      ctx.fillRect(gx + 1, gy + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      // Inner highlight
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(gx + 4, gy + 4, 6, 6);
      // Sparkle
      ctx.fillStyle = '#fff';
      ctx.fillRect(gx + 5, gy + 5, 2, 2);
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
      {/* Score and Timer - Pixel style */}
      <div className="flex items-center gap-6 text-base font-retro">
        <div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-xl border border-border">
          <span className="text-text-muted text-xs">SCORE</span>
          <span className="text-green-primary">{formatPoints(gameState.score)}</span>
        </div>
        <div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-xl border border-border">
          <span className="text-text-muted text-xs">TIME</span>
          <span className="text-yellow-gold">{formatTime(gameState.playtimeSeconds)}</span>
        </div>
        <div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-xl border border-border">
          <span className="text-text-muted text-xs">PILLS</span>
          <span className="text-pink-pill">{gameState.pillsEaten}</span>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="game-canvas rounded-none"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Start/Game Over Overlay */}
        {(!gameState.isPlaying || gameState.isGameOver) && (
          <div className="absolute inset-0 bg-[#0f380f]/95 flex flex-col items-center justify-center">
            {gameState.isGameOver ? (
              <>
                <h2 className="font-retro text-[#9bbc0f] text-xl mb-4 pixel-text">GAME OVER</h2>
                <p className="text-[#8bac0f] mb-2 font-retro text-xs">
                  {gameState.gameOverReason === 'wall' ? 'HIT THE WALL!' : 'HIT YOURSELF!'}
                </p>
                <p className="text-[#9bbc0f] text-lg mb-6 font-retro">
                  SCORE: {formatPoints(gameState.score)}
                </p>
              </>
            ) : (
              <>
                <h2 className="font-retro text-[#9bbc0f] text-xl mb-6 pixel-text">SNAKEPILL</h2>
                <div className="text-[#8bac0f] text-xs mb-6 text-center font-retro leading-6">
                  <p>ARROW KEYS OR WASD</p>
                  <p>TO MOVE</p>
                  <p className="mt-2">EAT PILLS TO GROW!</p>
                </div>
              </>
            )}
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-[#9bbc0f] text-[#0f380f] font-retro text-sm hover:bg-[#8bac0f] transition-colors border-2 border-[#0f380f]"
            >
              {gameState.isGameOver ? 'PLAY AGAIN' : 'START'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls - Pixel style */}
      <div className="md:hidden grid grid-cols-3 gap-2 w-48">
        <div />
        <button
          onTouchStart={() => handleTouch('UP')}
          className="touch-control p-4 bg-[#306230] border-2 border-[#9bbc0f] text-[#9bbc0f] font-retro active:bg-[#9bbc0f] active:text-[#0f380f]"
        >
          &#x25B2;
        </button>
        <div />
        <button
          onTouchStart={() => handleTouch('LEFT')}
          className="touch-control p-4 bg-[#306230] border-2 border-[#9bbc0f] text-[#9bbc0f] font-retro active:bg-[#9bbc0f] active:text-[#0f380f]"
        >
          &#x25C0;
        </button>
        <button
          onTouchStart={() => handleTouch('DOWN')}
          className="touch-control p-4 bg-[#306230] border-2 border-[#9bbc0f] text-[#9bbc0f] font-retro active:bg-[#9bbc0f] active:text-[#0f380f]"
        >
          &#x25BC;
        </button>
        <button
          onTouchStart={() => handleTouch('RIGHT')}
          className="touch-control p-4 bg-[#306230] border-2 border-[#9bbc0f] text-[#9bbc0f] font-retro active:bg-[#9bbc0f] active:text-[#0f380f]"
        >
          &#x25B6;
        </button>
      </div>

      {/* Player Stats */}
      {player && (
        <div className="text-xs text-text-muted font-mono bg-card/50 px-4 py-2 rounded-xl border border-border">
          <span className="text-green-primary">{formatPoints(player.total_points)}</span> pts
          {' | '}
          <span className="text-yellow-gold">{player.games_played}</span> games
          {' | '}
          Best: <span className="text-pink-pill">{formatPoints(player.highest_score)}</span>
        </div>
      )}
    </div>
  );
}
