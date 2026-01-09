import { NextResponse } from 'next/server';
import { getEligiblePlayers } from '@/lib/server/supabase';

export async function GET() {
  try {
    const eligible = await getEligiblePlayers();
    return NextResponse.json(eligible);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
