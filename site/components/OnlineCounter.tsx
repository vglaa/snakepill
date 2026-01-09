'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const API_URL = '/api';

export function OnlineCounter() {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    const fetchOnline = async () => {
      try {
        const res = await fetch(`${API_URL}/online`);
        if (res.ok) {
          const data = await res.json();
          setOnlineCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching online count:', error);
      }
    };

    fetchOnline();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('online_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'online_players' },
        () => {
          fetchOnline();
        }
      )
      .subscribe();

    // Poll every 30 seconds as backup
    const interval = setInterval(fetchOnline, 30000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="game-card bg-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">&#x1F3AE;</span>
        <h3 className="font-retro text-xs text-green-primary">ONLINE</h3>
      </div>
      <div className="flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl font-bold text-white count-animation">
            {onlineCount}
          </span>
          <p className="text-text-muted text-sm mt-1">players online</p>
        </div>
      </div>
      <div className="flex items-center justify-center mt-3">
        <div className="w-2 h-2 bg-green-primary rounded-full animate-pulse mr-2" />
        <span className="text-text-muted text-xs">Live</span>
      </div>
    </div>
  );
}
