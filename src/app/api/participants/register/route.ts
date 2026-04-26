import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findEventByEventNo, EventStatus } from '@/shared/models/event';
import {
  ParticipantStatus,
  RegistrationSource,
  registerParticipantForEvent,
} from '@/shared/models/participant';

// 注册请求验证
const registerSchema = z.object({
  eventNo: z.string().min(1, 'Event number is required'),
  name: z.string().min(1, 'Name is required').max(50),
  age: z.number().min(18, 'Must be 18 or older').max(100),
  gender: z.enum(['male', 'female', 'other']).optional(),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  interests: z.array(z.string()).optional(),
  photoUrl: z.string().url().optional(),
  source: z.enum([RegistrationSource.QR_CODE, RegistrationSource.LINK]).default(RegistrationSource.LINK),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { eventNo, name, age, gender, email, phone, interests, photoUrl, source } = validation.data;

    // 查找活动
    const event = await findEventByEventNo(eventNo);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 检查活动状态
    if (event.status !== EventStatus.ACTIVE && event.status !== EventStatus.PAID) {
      return NextResponse.json(
        { error: 'Event is not accepting registrations' },
        { status: 400 }
      );
    }

    // 创建参与者（事务化，防重复报名和超卖）
    const participant = await registerParticipantForEvent(event.id, {
      eventId: event.id,
      name,
      age,
      gender,
      email,
      phone,
      interests: interests ? JSON.stringify(interests) : null,
      photoUrl,
      registrationSource: source,
      status: ParticipantStatus.REGISTERED,
    });

    return NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        name: participant.name,
        registeredAt: participant.registeredAt,
        choiceToken: participant.choiceToken, // Return token for session
      },
      event: {
        id: event.id,
        name: event.name,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        location: event.location,
      },
    });
  } catch (error: any) {
    console.error('Error registering participant:', error);

    if (error?.message === 'EVENT_FULL') {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 });
    }

    if (error?.message === 'EMAIL_ALREADY_REGISTERED') {
      return NextResponse.json(
        { error: 'Email already registered for this event' },
        { status: 400 }
      );
    }

    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'Email already registered for this event' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}
