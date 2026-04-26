import { NextResponse } from 'next/server';
import { envConfigs } from '@/config';
import { updateEventStatuses } from '@/shared/models/event';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    if (!envConfigs.cron_secret) {
      return new NextResponse('CRON_SECRET is not configured', { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${envConfigs.cron_secret}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await updateEventStatuses();
    
    return NextResponse.json({
      success: true,
      message: `Updated ${result.updated} events`,
      details: result.details
    });
  } catch (error: any) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
