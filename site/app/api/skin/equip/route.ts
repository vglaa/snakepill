import { NextRequest, NextResponse } from 'next/server';
import { equipSkin } from '@/lib/server/supabase';
import { isValidWalletAddress } from '@/lib/server/solana';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, skinId } = await request.json();

    if (!walletAddress || !isValidWalletAddress(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    if (!skinId) {
      return NextResponse.json({ error: 'Skin ID required' }, { status: 400 });
    }

    const player = await equipSkin(walletAddress, skinId);
    return NextResponse.json({ success: true, player });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
