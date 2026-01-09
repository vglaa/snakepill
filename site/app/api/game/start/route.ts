import { NextRequest, NextResponse } from 'next/server';
import { getPlayer, createPlayer, createGameSession, updateOnlinePlayer } from '@/lib/server/supabase';
import { isValidWalletAddress } from '@/lib/server/solana';
import { generateSessionId } from '@/lib/server/utils';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    const sessionId = generateSessionId();

    let player = null;
    let playerId = null;

    if (walletAddress && isValidWalletAddress(walletAddress)) {
      player = await getPlayer(walletAddress);
      if (!player) {
        player = await createPlayer(walletAddress);
      }
      playerId = player.id;
    }

    const session = await createGameSession(playerId, walletAddress || null);

    await updateOnlinePlayer(sessionId, walletAddress || null, true);

    return NextResponse.json({
      sessionId,
      gameSessionId: session.id,
      player
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
