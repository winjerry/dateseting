import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findEventByEventNo } from '@/shared/models/event';
import {
  findParticipantByEmailAndEventId,
  refreshParticipantChoiceToken,
} from '@/shared/models/participant';

const loginSchema = z.object({
  eventNo: z.string().min(1, 'Event number is required'),
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { eventNo, email } = validation.data;

    // 1. Find event
    const event = await findEventByEventNo(eventNo);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 2. Find participant
    const participant = await findParticipantByEmailAndEventId(event.id, email);
    
    if (!participant) {
      return NextResponse.json(
        { error: 'No registration found with this email for this event' },
        { status: 404 }
      );
    }

    const refreshedParticipant = await refreshParticipantChoiceToken(participant.id);
    const activeParticipant = refreshedParticipant || participant;

    // 3. Return token
    return NextResponse.json({
      success: true,
      participant: {
        id: activeParticipant.id,
        name: activeParticipant.name,
        choiceToken: activeParticipant.choiceToken,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
