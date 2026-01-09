import { NextRequest, NextResponse } from 'next/server';
import { checkAllEligibility } from '@/lib/server/holder-checker';
import { cleanupOfflinePlayers } from '@/lib/server/supabase';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cleanup offline players
    await cleanupOfflinePlayers();

    // Run eligibility check
    const result = await checkAllEligibility();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
