import { NextResponse } from 'next/server';
import { getSkins } from '@/lib/server/supabase';

export async function GET() {
  try {
    const skins = await getSkins();
    return NextResponse.json(skins);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
