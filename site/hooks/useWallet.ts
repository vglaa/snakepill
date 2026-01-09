'use client';

import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import type { Player } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function usePlayerWallet() {
  const { publicKey, connected } = useSolanaWallet();
  const [player, setPlayer] = useState<Player | null>(null);
  const [eligibility, setEligibility] = useState<{
    isEligible: boolean;
    holdingUSD: number;
    playtimeSeconds: number;
    minHoldingRequired: number;
    minPlaytimeRequired: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const walletAddress = publicKey?.toBase58() || null;

  const fetchPlayer = useCallback(async () => {
    if (!walletAddress) {
      setPlayer(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/leaderboard/${walletAddress}`);
      if (res.ok) {
        const data = await res.json();
        setPlayer(data);
      } else {
        setPlayer(null);
      }
    } catch (error) {
      console.error('Error fetching player:', error);
    }
  }, [walletAddress]);

  const fetchEligibility = useCallback(async () => {
    if (!walletAddress) {
      setEligibility(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/eligible/${walletAddress}`);
      if (res.ok) {
        const data = await res.json();
        setEligibility(data);
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error);
    }
  }, [walletAddress]);

  const startGameSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setLoading(false);
    }
    return null;
  }, [walletAddress]);

  const endGameSession = useCallback(async (
    sessionId: string,
    gameSessionId: string,
    score: number,
    playtimeSeconds: number,
    pillsEaten: number,
    reason: string
  ) => {
    try {
      const res = await fetch(`${API_URL}/game/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          gameSessionId,
          score,
          playtimeSeconds,
          pillsEaten,
          reason,
          walletAddress,
        }),
      });

      if (res.ok) {
        await fetchPlayer();
        await fetchEligibility();
      }
    } catch (error) {
      console.error('Error ending game:', error);
    }
  }, [walletAddress, fetchPlayer, fetchEligibility]);

  const sendHeartbeat = useCallback(async (sessionId: string, isPlaying: boolean) => {
    try {
      await fetch(`${API_URL}/game/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, walletAddress, isPlaying }),
      });
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  }, [walletAddress]);

  const buySkin = useCallback(async (skinId: string) => {
    if (!walletAddress) return false;

    try {
      const res = await fetch(`${API_URL}/skin/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, skinId }),
      });

      if (res.ok) {
        await fetchPlayer();
        return true;
      }
      const error = await res.json();
      alert(error.error || 'Failed to buy skin');
    } catch (error) {
      console.error('Error buying skin:', error);
    }
    return false;
  }, [walletAddress, fetchPlayer]);

  const equipSkin = useCallback(async (skinId: string) => {
    if (!walletAddress) return false;

    try {
      const res = await fetch(`${API_URL}/skin/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, skinId }),
      });

      if (res.ok) {
        await fetchPlayer();
        return true;
      }
    } catch (error) {
      console.error('Error equipping skin:', error);
    }
    return false;
  }, [walletAddress, fetchPlayer]);

  useEffect(() => {
    if (connected && walletAddress) {
      fetchPlayer();
      fetchEligibility();
    } else {
      setPlayer(null);
      setEligibility(null);
    }
  }, [connected, walletAddress, fetchPlayer, fetchEligibility]);

  return {
    walletAddress,
    connected,
    player,
    eligibility,
    loading,
    startGameSession,
    endGameSession,
    sendHeartbeat,
    buySkin,
    equipSkin,
    refreshPlayer: fetchPlayer,
    refreshEligibility: fetchEligibility,
  };
}
