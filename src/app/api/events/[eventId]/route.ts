import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/core/auth/session';
import { findEventById, updateEventById, deleteEvent } from '@/shared/models/event';
import { getParticipantsByEventId, getMatchStats } from '@/shared/models/participant';

type RouteParams = { params: Promise<{ eventId: string }> };

// 获取活动详情
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { eventId } = await params;
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const event = await findEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 验证是否是组织者
    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 获取参与者列表
    const participants = await getParticipantsByEventId(eventId);
    
    // 获取匹配统计
    const matchStats = await getMatchStats(eventId);

    return NextResponse.json({
      success: true,
      event,
      participants,
      matchStats,
    });
  } catch (error) {
    console.error('Error getting event:', error);
    return NextResponse.json(
      { error: 'Failed to get event' },
      { status: 500 }
    );
  }
}

// 更新活动
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { eventId } = await params;
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const event = await findEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatedEvent = await updateEventById(eventId, body);

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// 删除活动
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { eventId } = await params;
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const event = await findEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await deleteEvent(eventId);

    return NextResponse.json({
      success: true,
      message: 'Event deleted',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
