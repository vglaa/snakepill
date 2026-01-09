'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };

export interface GameState {
  snake: Position[];
  pill: Position;
  goldenPill: Position | null;
  direction: Direction;
  score: number;
  pillsEaten: number;
  isPlaying: boolean;
  isGameOver: boolean;
  gameOverReason: 'wall' | 'self' | 'quit' | null;
  playtimeSeconds: number;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 80;
const SPEED_INCREASE = 2;
const GOLDEN_PILL_CHANCE = 0.1;

const getRandomPosition = (snake: Position[]): Position => {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
};

const initialState: GameState = {
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  pill: { x: 15, y: 10 },
  goldenPill: null,
  direction: 'RIGHT',
  score: 0,
  pillsEaten: 0,
  isPlaying: false,
  isGameOver: false,
  gameOverReason: null,
  playtimeSeconds: 0,
};

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speedRef = useRef(INITIAL_SPEED);

  const resetGame = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    directionRef.current = 'RIGHT';
    speedRef.current = INITIAL_SPEED;

    setGameState({
      ...initialState,
      pill: getRandomPosition(initialState.snake),
    });
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    setGameState(prev => ({ ...prev, isPlaying: true, isGameOver: false }));
  }, [resetGame]);

  const endGame = useCallback((reason: 'wall' | 'self' | 'quit') => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isGameOver: true,
      gameOverReason: reason,
    }));
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[newDirection] !== directionRef.current) {
      directionRef.current = newDirection;
    }
  }, []);

  const moveSnake = useCallback(() => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.isGameOver) return prev;

      const head = { ...prev.snake[0] };
      const direction = directionRef.current;

      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame('wall');
        return { ...prev, isPlaying: false, isGameOver: true, gameOverReason: 'wall' };
      }

      // Check self collision
      if (prev.snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame('self');
        return { ...prev, isPlaying: false, isGameOver: true, gameOverReason: 'self' };
      }

      const newSnake = [head, ...prev.snake];
      let newScore = prev.score;
      let newPillsEaten = prev.pillsEaten;
      let newPill = prev.pill;
      let newGoldenPill = prev.goldenPill;
      let ate = false;

      // Check pill collision
      if (head.x === prev.pill.x && head.y === prev.pill.y) {
        newScore += 10;
        newPillsEaten += 1;
        ate = true;
        newPill = getRandomPosition(newSnake);

        // Maybe spawn golden pill
        if (Math.random() < GOLDEN_PILL_CHANCE && !newGoldenPill) {
          newGoldenPill = getRandomPosition(newSnake);
        }

        // Increase speed
        speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_INCREASE);
      }

      // Check golden pill collision
      if (newGoldenPill && head.x === newGoldenPill.x && head.y === newGoldenPill.y) {
        newScore += 50;
        newPillsEaten += 1;
        ate = true;
        newGoldenPill = null;
      }

      // Remove tail if didn't eat
      if (!ate) {
        newSnake.pop();
      }

      return {
        ...prev,
        snake: newSnake,
        pill: newPill,
        goldenPill: newGoldenPill,
        score: newScore,
        pillsEaten: newPillsEaten,
        direction: direction,
      };
    });
  }, [endGame]);

  // Game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      const runLoop = () => {
        moveSnake();
        gameLoopRef.current = setTimeout(runLoop, speedRef.current);
      };
      gameLoopRef.current = setTimeout(runLoop, speedRef.current);

      // Timer for playtime
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          playtimeSeconds: prev.playtimeSeconds + 1,
        }));
      }, 1000);

      return () => {
        if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState.isPlaying, gameState.isGameOver, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, changeDirection]);

  return {
    gameState,
    startGame,
    endGame,
    resetGame,
    changeDirection,
    gridSize: GRID_SIZE,
  };
}
