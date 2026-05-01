import { NextRequest, NextResponse } from 'next/server';
import { calculateMatches, getMatchStats } from '@/shared/models/participant';
import { getServerSession } from '@/core/auth/session';
import { EventStatus, findEventById, updateEventById } from '@/shared/models/event';

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

    // 已经匹配过的活动不允许重复匹配
    if (event.status === EventStatus.MATCHED) {
      return NextResponse.json(
        { error: 'Matches have already been calculated for this event' },
        { status: 400 }
      );
    }

    // 活动必须已结束才能计算匹配
    if (event.status !== EventStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Matches can only be calculated after the event ends' },
        { status: 400 }
      );
    }

    // 检查选择截止时间是否已过
    if (event.choiceDeadline && new Date() < new Date(event.choiceDeadline)) {
      return NextResponse.json(
        { error: 'Cannot calculate matches before the choice deadline' },
        { status: 400 }
      );
    }

    // Perform calculation
    await calculateMatches(eventId);

    // 更新活动状态为 matched（锁定选择）
    await updateEventById(eventId, { status: EventStatus.MATCHED });
    
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
