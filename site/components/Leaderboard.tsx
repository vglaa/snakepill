'use client';

import { useEffect, useState } from 'react';
import { supabase, type LeaderboardEntry } from '@/lib/supabase';
import { formatWallet, formatPoints } from '@/lib/wallet';

const API_URL = '/api';

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/leaderboard?limit=10`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard' },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return '&#x1F947;';
      case 1: return '&#x1F948;';
      case 2: return '&#x1F949;';
      default: return `${position + 1}.`;
    }
  };

  return (
    <div className="game-card bg-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">&#x1F3C6;</span>
        <h3 className="font-retro text-xs text-green-primary">LEADERBOARD</h3>
      </div>

      {loading ? (
        <div className="text-center text-text-muted py-4">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-text-muted py-4">No scores yet</div>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="leaderboard-row flex items-center justify-between py-1.5 px-2 rounded"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-6 text-center"
                  dangerouslySetInnerHTML={{ __html: getMedalEmoji(index) }}
                />
                <span className="text-sm font-mono text-text-muted">
                  {entry.username || formatWallet(entry.wallet_address)}
                </span>
              </div>
              <span className="text-green-primary font-bold text-sm">
                {formatPoints(entry.score)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
