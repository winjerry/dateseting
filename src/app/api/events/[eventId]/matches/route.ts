import { NextRequest, NextResponse } from 'next/server';
import { calculateMatches, getMatchStats } from '@/shared/models/participant';
import { getServerSession } from '@/core/auth/session';
import { EventStatus, findEventById } from '@/shared/models/event';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const { eventId } = params;
    const event = await findEventById(eventId);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (event.status !== EventStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Matches can only be calculated after the event ends' },
        { status: 400 }
      );
    }

    // Perform calculation
    await calculateMatches(eventId);
    
    // Get results
    const stats = await getMatchStats(eventId);

    return NextResponse.json({
      success: true,
      matchCount: stats.totalMatches,
      stats
    });
  } catch (error: any) {
    console.error('Error calculating matches:', error);
    return NextResponse.json(
      { error: 'Failed to calculate matches' },
      { status: 500 }
    );
  }
}
