import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findParticipantByToken, submitParticipantChoices, getParticipantsByEventId, getParticipantChoices } from '@/shared/models/participant';
import { findEventById, EventStatus } from '@/shared/models/event';

// 实时计算活动状态（不依赖 cron job）
function getEffectiveEventStatus(event: any): string {
  // matched 和 cancelled/draft 状态不参与实时计算
  if (event.status === EventStatus.CANCELLED || event.status === EventStatus.DRAFT || event.status === EventStatus.MATCHED) {
    return event.status;
  }
  const now = new Date();
  const dateStr = event.eventDate instanceof Date 
    ? event.eventDate.toISOString().split('T')[0] 
    : String(event.eventDate).split('T')[0];
  const eventStart = new Date(`${dateStr}T${event.eventTime}`);
  let eventEnd: Date;
  if (event.eventEndTime) {
    eventEnd = new Date(`${dateStr}T${event.eventEndTime}`);
  } else {
    eventEnd = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);
  }
  if (now > eventEnd) return EventStatus.COMPLETED;
  if (now >= eventStart && now <= eventEnd) return EventStatus.ACTIVE;
  return event.status;
}

// 提交选择请求验证
const choicesSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  choices: z.array(z.string()).min(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = choicesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { token, choices } = validation.data;

    // 通过token查找参与者
    const participant = await findParticipantByToken(token);
    if (!participant) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 检查token是否过期
    if (participant.choiceTokenExpiresAt && new Date() > new Date(participant.choiceTokenExpiresAt)) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 401 }
      );
    }

    // 检查是否已提交过 - ALLOW UPDATE
    // if (participant.hasSubmittedChoices) {
    //   return NextResponse.json(
    //     { error: 'Choices already submitted' },
    //     { status: 400 }
    //   );
    // }

    // 获取活动
    const event = await findEventById(participant.eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 实时计算活动状态
    const effectiveStatus = getEffectiveEventStatus(event);

    // 已匹配的活动不允许再修改选择
    if (effectiveStatus === EventStatus.MATCHED || event.status === EventStatus.MATCHED) {
      return NextResponse.json(
        { error: 'Choices are locked. Matching has already been completed.' },
        { status: 400 }
      );
    }

    // 检查选择截止时间
    if (event.choiceDeadline && new Date() > new Date(event.choiceDeadline)) {
      return NextResponse.json(
        { error: 'The choice submission deadline has passed.' },
        { status: 400 }
      );
    }

    if (effectiveStatus !== EventStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Choices are only available after the event ends' },
        { status: 400 }
      );
    }

    // 验证选择的参与者ID是否有效
    const allParticipants = await getParticipantsByEventId(event.id);
    const validParticipantIds = allParticipants
      .filter(p => p.id !== participant.id)
      .map(p => p.id);

    const validChoices = choices.filter(id => validParticipantIds.includes(id));

    // 提交选择
    await submitParticipantChoices(participant.id, event.id, validChoices);

    return NextResponse.json({
      success: true,
      message: 'Choices submitted successfully',
      choicesCount: validChoices.length,
    });
  } catch (error) {
    console.error('Error submitting choices:', error);
    return NextResponse.json(
      { error: 'Failed to submit choices' },
      { status: 500 }
    );
  }
}

// 获取可选择的参与者列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const participant = await findParticipantByToken(token);
    if (!participant) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 检查token是否过期
    if (participant.choiceTokenExpiresAt && new Date() > new Date(participant.choiceTokenExpiresAt)) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 401 }
      );
    }

    const event = await findEventById(participant.eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 实时计算活动状态
    const effectiveStatus = getEffectiveEventStatus(event);
    const isMatched = effectiveStatus === EventStatus.MATCHED || event.status === EventStatus.MATCHED;
    const isDeadlinePassed = event.choiceDeadline ? new Date() > new Date(event.choiceDeadline) : false;
    const isLocked = isMatched || isDeadlinePassed;

    if (effectiveStatus !== EventStatus.COMPLETED && !isMatched) {
      return NextResponse.json(
        { error: 'Choices will open after the event ends' },
        { status: 400 }
      );
    }

    // 获取所有其他参与者
    const allParticipants = await getParticipantsByEventId(participant.eventId);
    const otherParticipants = allParticipants
      .filter(p => p.id !== participant.id)
      .map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        interests: p.interests ? JSON.parse(p.interests) : [],
        photoUrl: p.photoUrl,
      }));

    // 获取已选列表（如果有）
    let existingChoices: string[] = [];
    if (participant.hasSubmittedChoices) {
      existingChoices = await getParticipantChoices(participant.id);
    }

    return NextResponse.json({
      success: true,
      currentUser: {
        id: participant.id,
        name: participant.name,
        age: participant.age,
        photoUrl: participant.photoUrl,
      },
      hasSubmitted: participant.hasSubmittedChoices,
      participants: otherParticipants,
      choices: existingChoices,
      isLocked,
      choiceDeadline: event.choiceDeadline,
      lockReason: isMatched ? 'matched' : isDeadlinePassed ? 'deadline' : null,
    });
  } catch (error) {
    console.error('Error getting participants for choices:', error);
    return NextResponse.json(
      { error: 'Failed to get participants' },
      { status: 500 }
    );
  }
}
