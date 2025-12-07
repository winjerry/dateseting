import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/core/auth/session';
import { findEventById, EventStatus } from '@/shared/models/event';
import { calculateMatches, getMatchResults, getParticipantMatches } from '@/shared/models/participant';

type RouteParams = { params: Promise<{ eventId: string }> };

// 计算匹配
export async function POST(
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

    // 检查是否已经计算过匹配
    if (event.isMatchingCompleted) {
      const matches = await getMatchResults(eventId);
      return NextResponse.json({
        success: true,
        message: 'Matching already completed',
        matches,
        matchCount: matches.length,
      });
    }

    // 计算匹配
    const matches = await calculateMatches(eventId);

    return NextResponse.json({
      success: true,
      message: 'Matching completed successfully',
      matches,
      matchCount: matches.length,
    });
  } catch (error) {
    console.error('Error calculating matches:', error);
    return NextResponse.json(
      { error: 'Failed to calculate matches' },
      { status: 500 }
    );
  }
}

// 获取匹配结果
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

    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const matches = await getMatchResults(eventId);

    return NextResponse.json({
      success: true,
      isCompleted: event.isMatchingCompleted,
      matches,
      matchCount: matches.length,
    });
  } catch (error) {
    console.error('Error getting matches:', error);
    return NextResponse.json(
      { error: 'Failed to get matches' },
      { status: 500 }
    );
  }
}
