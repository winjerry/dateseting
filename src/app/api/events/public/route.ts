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

    // 实时计算活动状态（不依赖 cron job）
    let effectiveStatus = event.status;
    if (event.status !== EventStatus.CANCELLED && event.status !== EventStatus.DRAFT && event.status !== EventStatus.MATCHED) {
      const now = new Date();
      const dateStr = event.eventDate instanceof Date 
        ? event.eventDate.toISOString().split('T')[0] 
        : String(event.eventDate).split('T')[0];
      const eventStart = new Date(`${dateStr}T${event.eventTime}`);
      let eventEnd: Date;
      if (event.eventEndTime) {
        eventEnd = new Date(`${dateStr}T${event.eventEndTime}`);
      } else {
        eventEnd = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000); // 默认2小时
      }

      if (now > eventEnd) {
        effectiveStatus = EventStatus.COMPLETED;
      } else if (now >= eventStart && now <= eventEnd) {
        effectiveStatus = EventStatus.ACTIVE;
      }
    }

    // 检查活动状态
    const isAcceptingRegistrations = 
      effectiveStatus === EventStatus.ACTIVE || 
      effectiveStatus === EventStatus.PAID;

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
        status: effectiveStatus,
        choiceDeadline: event.choiceDeadline,
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
