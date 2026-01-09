import { NextRequest, NextResponse } from 'next/server';
import { getPlayer, updatePlayer, endGameSession, removeOnlinePlayer } from '@/lib/server/supabase';
import { isValidWalletAddress } from '@/lib/server/solana';
import { calculatePoints } from '@/lib/server/utils';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, gameSessionId, score, playtimeSeconds, pillsEaten, reason, walletAddress } = await request.json();

    const session = await endGameSession(gameSessionId, score, playtimeSeconds, pillsEaten, reason);

    await removeOnlinePlayer(sessionId);

    if (walletAddress && isValidWalletAddress(walletAddress)) {
      const player = await getPlayer(walletAddress);
      if (player) {
        const totalPoints = calculatePoints(score, playtimeSeconds, pillsEaten);

        await updatePlayer(walletAddress, {
          total_points: player.total_points + totalPoints,
          total_playtime_seconds: player.total_playtime_seconds + playtimeSeconds,
          games_played: player.games_played + 1,
          highest_score: Math.max(player.highest_score, score)
        });
      }
    }

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
