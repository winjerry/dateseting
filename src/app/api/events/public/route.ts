import { NextRequest, NextResponse } from 'next/server';
import { findEventByEventNo, EventStatus } from '@/shared/models/event';
import { getActiveIcebreakers, initializeDefaultIcebreakers } from '@/shared/models/icebreaker';
import { getMatchStats, getParticipantsCount } from '@/shared/models/participant';

// 公开活动信息API，无需登录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventNo = searchParams.get('eventNo');

    if (!eventNo) {
      return NextResponse.json(
        { error: 'Event number is required' },
        { status: 400 }
      );
    }

    const event = await findEventByEventNo(eventNo);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 获取实时参与人数 (直接从 participant 表计数，保证准确性)
    const realTimeParticipantCount = await getParticipantsCount(event.id);

    // 检查活动状态
    const isAcceptingRegistrations = 
      event.status === EventStatus.ACTIVE || 
      event.status === EventStatus.PAID;

    const isFull = realTimeParticipantCount >= event.capacity;

    // 确保破冰指南已初始化
    await initializeDefaultIcebreakers();
    
    // 获取破冰指南
    const icebreakers = await getActiveIcebreakers();

    // 获取统计数据 (提交人数)
    const stats = await getMatchStats(event.id);

    return NextResponse.json({
      success: true,
      event: {
        eventNo: event.eventNo,
        name: event.name,
        description: event.description,
        location: event.location,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        eventEndTime: event.eventEndTime,
        capacity: event.capacity,
        currentParticipants: realTimeParticipantCount, // 使用实时计数
        submittedChoicesCount: stats.submittedChoices,
        status: event.status,
        isAcceptingRegistrations,
        isFull,
      },
      icebreakers,
    });
  } catch (error) {
    console.error('Error getting public event:', error);
    return NextResponse.json(
      { error: 'Failed to get event' },
      { status: 500 }
    );
  }
}
