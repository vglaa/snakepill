'use client';

import { useEffect, useState } from 'react';
import { supabase, type Skin } from '@/lib/supabase';
import { usePlayerWallet } from '@/hooks/useWallet';
import { formatPoints } from '@/lib/wallet';

const API_URL = '/api';

export function SkinShop() {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const { player, connected, buySkin, equipSkin } = usePlayerWallet();

  useEffect(() => {
    const fetchSkins = async () => {
      try {
        const res = await fetch(`${API_URL}/skins`);
        if (res.ok) {
          const data = await res.json();
          setSkins(data);
        }
      } catch (error) {
        console.error('Error fetching skins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkins();
  }, []);

  const handleSkinAction = async (skin: Skin) => {
    if (!connected) {
      alert('Connect your wallet first!');
      return;
    }

    const isOwned = player?.owned_skins?.includes(skin.id);
    const isEquipped = player?.current_skin === skin.id;

    if (isEquipped) return;

    if (isOwned) {
      await equipSkin(skin.id);
    } else {
      if (player && player.total_points < skin.cost_points) {
        alert(`Not enough points! Need ${formatPoints(skin.cost_points)}, have ${formatPoints(player.total_points)}`);
        return;
      }
      await buySkin(skin.id);
    }
  };

  const getButtonText = (skin: Skin) => {
    if (!connected) return `${formatPoints(skin.cost_points)} pts`;

    const isOwned = player?.owned_skins?.includes(skin.id);
    const isEquipped = player?.current_skin === skin.id;

    if (isEquipped) return 'Equipped';
    if (isOwned) return 'Equip';
    if (skin.cost_points === 0) return 'Free';
    return `${formatPoints(skin.cost_points)} pts`;
  };

  const getButtonClass = (skin: Skin) => {
    if (!connected) return 'bg-card border-border text-text-muted';

    const isOwned = player?.owned_skins?.includes(skin.id);
    const isEquipped = player?.current_skin === skin.id;

    if (isEquipped) return 'bg-green-primary text-black cursor-default';
    if (isOwned) return 'bg-green-secondary/20 border-green-primary text-green-primary hover:bg-green-secondary/40';
    return 'bg-card border-border text-text hover:border-green-primary';
  };

  return (
    <div className="game-card bg-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">&#x1F6D2;</span>
          <h3 className="font-retro text-xs text-green-primary">SKIN SHOP</h3>
        </div>
        {player && (
          <div className="text-sm">
            <span className="text-text-muted">Your Points: </span>
            <span className="text-green-primary font-bold">{formatPoints(player.total_points)}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center text-text-muted py-4">Loading skins...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {skins.map((skin) => {
            const isOwned = player?.owned_skins?.includes(skin.id);
            const isEquipped = player?.current_skin === skin.id;

            return (
              <button
                key={skin.id}
                onClick={() => handleSkinAction(skin)}
                disabled={isEquipped}
                className={`
                  skin-item p-3 rounded-lg border transition-all
                  ${isOwned ? 'owned' : ''}
                  ${isEquipped ? 'equipped' : ''}
                  ${getButtonClass(skin)}
                `}
              >
                {/* Skin Preview */}
                <div
                  className={`w-full aspect-square rounded-lg mb-2 ${skin.is_animated ? 'animate-rainbow' : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${skin.color_primary}, ${skin.color_secondary})`,
                  }}
                />

                {/* Skin Name */}
                <p className="text-sm font-bold mb-1">{skin.name}</p>

                {/* Price/Status */}
                <p className="text-xs">
                  {getButtonText(skin)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {!connected && (
        <p className="text-center text-text-muted text-sm mt-4">
          Connect your wallet to buy and equip skins!
        </p>
      )}
    </div>
  );
}
