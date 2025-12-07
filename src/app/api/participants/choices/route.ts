import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findParticipantByToken, submitParticipantChoices, getParticipantsByEventId } from '@/shared/models/participant';
import { findEventById, EventStatus } from '@/shared/models/event';

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
        { error: 'Validation failed', details: validation.error.errors },
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

    // 检查是否已提交过
    if (participant.hasSubmittedChoices) {
      return NextResponse.json(
        { error: 'Choices already submitted' },
        { status: 400 }
      );
    }

    // 获取活动
    const event = await findEventById(participant.eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
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

    // 获取所有其他参与者
    const allParticipants = await getParticipantsByEventId(participant.eventId);
    const otherParticipants = allParticipants
      .filter(p => p.id !== participant.id)
      .map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        interests: p.interests ? JSON.parse(p.interests) : [],
        photoUrl: p.photoUrl,
      }));

    return NextResponse.json({
      success: true,
      hasSubmitted: participant.hasSubmittedChoices,
      participants: otherParticipants,
    });
  } catch (error) {
    console.error('Error getting participants for choices:', error);
    return NextResponse.json(
      { error: 'Failed to get participants' },
      { status: 500 }
    );
  }
}
