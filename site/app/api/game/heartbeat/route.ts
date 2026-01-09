import { NextRequest, NextResponse } from 'next/server';
import { updateOnlinePlayer } from '@/lib/server/supabase';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, walletAddress, isPlaying } = await request.json();

    await updateOnlinePlayer(sessionId, walletAddress || null, isPlaying);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
