'use client';

import { useEffect, useState } from 'react';
import { supabase, type Donate } from '@/lib/supabase';
import { formatWallet, formatSol } from '@/lib/wallet';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function DonateTable() {
  const [donates, setDonates] = useState<Donate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonates = async () => {
      try {
        const res = await fetch(`${API_URL}/donates?limit=10`);
        if (res.ok) {
          const data = await res.json();
          setDonates(data);
        }
      } catch (error) {
        console.error('Error fetching donates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonates();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('donates_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donates' },
        () => {
          fetchDonates();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const getHeartEmoji = (index: number) => {
    switch (index) {
      case 0: return '&#x1F49D;';
      case 1: return '&#x1F496;';
      case 2: return '&#x1F497;';
      default: return '&#x1F49C;';
    }
  };

  return (
    <div className="game-card bg-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">&#x1F49D;</span>
        <h3 className="font-retro text-xs text-pink-pill">TOP DONATES</h3>
      </div>

      {loading ? (
        <div className="text-center text-text-muted py-4">Loading...</div>
      ) : donates.length === 0 ? (
        <div className="text-center text-text-muted py-4">No donates yet</div>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {donates.map((donate, index) => (
            <div
              key={donate.id}
              className="leaderboard-row flex items-center justify-between py-1.5 px-2 rounded"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-6 text-center"
                  dangerouslySetInnerHTML={{ __html: getHeartEmoji(index) }}
                />
                <span className="text-sm font-mono text-text-muted">
                  {formatWallet(donate.wallet_address)}
                </span>
              </div>
              <span className="text-yellow-gold font-bold text-sm">
                {formatSol(donate.amount_sol)} SOL
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
