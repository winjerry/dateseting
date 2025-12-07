import { NextRequest, NextResponse } from 'next/server';
import { findEventByEventNo, EventStatus } from '@/shared/models/event';
import { getActiveIcebreakers, initializeDefaultIcebreakers } from '@/shared/models/icebreaker';

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

    // 检查活动状态
    const isAcceptingRegistrations = 
      event.status === EventStatus.ACTIVE || 
      event.status === EventStatus.PAID;

    const isFull = event.currentParticipants >= event.capacity;

    // 确保破冰指南已初始化
    await initializeDefaultIcebreakers();
    
    // 获取破冰指南
    const icebreakers = await getActiveIcebreakers();

    return NextResponse.json({
      success: true,
      event: {
        eventNo: event.eventNo,
        name: event.name,
        description: event.description,
        location: event.location,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        capacity: event.capacity,
        currentParticipants: event.currentParticipants,
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
