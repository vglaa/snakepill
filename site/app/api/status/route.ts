import { NextResponse } from 'next/server';
import { getSystemStatus, updateSystemStats, getEligiblePlayers } from '@/lib/server/supabase';

export async function GET() {
  try {
    await updateSystemStats();
    const status = await getSystemStatus();
    const eligible = await getEligiblePlayers();

    return NextResponse.json({
      ...status,
      eligibleCount: eligible?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
