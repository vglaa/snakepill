import { NextRequest, NextResponse } from 'next/server';
import { getPlayer } from '@/lib/server/supabase';
import { isValidWalletAddress } from '@/lib/server/solana';
import { checkPlayerEligibility } from '@/lib/server/holder-checker';
import { config } from '@/lib/server/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;

    if (!isValidWalletAddress(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const player = await getPlayer(wallet);
    if (!player) {
      return NextResponse.json({
        isEligible: false,
        reason: 'No player record',
        playtimeSeconds: 0,
        minPlaytimeRequired: config.eligibility.minPlaytimeSeconds
      });
    }

    if (player.total_playtime_seconds < config.eligibility.minPlaytimeSeconds) {
      return NextResponse.json({
        isEligible: false,
        reason: 'Not enough playtime',
        playtimeSeconds: player.total_playtime_seconds,
        minPlaytimeRequired: config.eligibility.minPlaytimeSeconds
      });
    }

    const eligibility = await checkPlayerEligibility(wallet);

    return NextResponse.json({
      isEligible: eligibility.isEligible,
      holdingUSD: eligibility.holdingUSD,
      minHoldingRequired: eligibility.minRequired,
      playtimeSeconds: player.total_playtime_seconds,
      minPlaytimeRequired: config.eligibility.minPlaytimeSeconds
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
