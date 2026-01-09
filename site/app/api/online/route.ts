import { NextResponse } from 'next/server';
import { getOnlineCount } from '@/lib/server/supabase';

export async function GET() {
  try {
    const count = await getOnlineCount();
    return NextResponse.json({ count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
