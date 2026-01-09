import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/server/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const leaderboard = await getLeaderboard(limit);
    return NextResponse.json(leaderboard);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
