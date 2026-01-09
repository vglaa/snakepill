import { NextRequest, NextResponse } from 'next/server';
import { getDonates } from '@/lib/server/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const donates = await getDonates(limit);
    return NextResponse.json(donates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
