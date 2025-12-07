import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/core/auth/session';
import {
  createEvent,
  EventType,
  EventStatus,
  EVENT_PRICES,
  EVENT_CAPACITIES,
} from '@/shared/models/event';

// 创建活动请求验证
const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  eventDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  eventTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  eventType: z.enum([EventType.STANDARD, EventType.LARGE]),
});

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const validation = createEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, description, location, eventDate, eventTime, eventType } = validation.data;

    // 创建活动
    const event = await createEvent({
      organizerId: session.user.id,
      name,
      description,
      location,
      eventDate: new Date(eventDate),
      eventTime,
      eventType,
      capacity: EVENT_CAPACITIES[eventType],
      price: EVENT_PRICES[eventType],
      status: EventStatus.DRAFT,
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
