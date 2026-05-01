import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/core/auth/session';
import {
  EventType,
  findEventById,
  getEventWithDetails,
  incrementEventCapacity,
  updateEventById,
} from '@/shared/models/event';

const updateEventSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  location: z.string().min(1).optional(),
  eventDate: z.string().optional(),
  eventTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  eventEndTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  capacity: z.number().int().positive().optional(),
  increaseCapacity: z.boolean().optional(),
  choiceDeadline: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const { eventId } = params;
    const result = await getEventWithDetails(eventId);

    if (!result) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Optional: Check if user is the organizer
    if (result.event.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fix: Ensure currentParticipants matches the actual list length
    // This resolves issues where the event table count is out of sync with the participant table
    if (result.participants) {
      result.event.currentParticipants = result.participants.length;
    }

    // 实时计算活动状态（修正 cron job 未及时更新的情况）
    const evt = result.event;
    if (evt.status !== 'cancelled' && evt.status !== 'draft' && evt.status !== 'matched') {
      const now = new Date();
      const dateStr = evt.eventDate instanceof Date 
        ? evt.eventDate.toISOString().split('T')[0] 
        : String(evt.eventDate).split('T')[0];
      const eventStart = new Date(`${dateStr}T${evt.eventTime}`);
      let eventEnd: Date;
      if (evt.eventEndTime) {
        eventEnd = new Date(`${dateStr}T${evt.eventEndTime}`);
      } else {
        eventEnd = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);
      }

      let newStatus = evt.status;
      if (now > eventEnd) newStatus = 'completed';
      else if (now >= eventStart && now <= eventEnd) newStatus = 'active';

      if (newStatus !== evt.status) {
        evt.status = newStatus;
        updateEventById(evt.id, { status: newStatus }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      event: result.event,
      participants: result.participants,
    });
  } catch (error: any) {
    console.error('Error fetching event details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const { eventId } = params;
    const event = await findEventById(eventId);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 实时计算活动状态，禁止编辑已结束或已取消的活动
    let effectiveStatus = event.status;
    if (event.status !== 'cancelled' && event.status !== 'draft' && event.status !== 'matched') {
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
      if (now > eventEnd) effectiveStatus = 'completed';
    }

    if (effectiveStatus === 'completed' || effectiveStatus === 'cancelled' || effectiveStatus === 'matched') {
      return NextResponse.json(
        { error: 'Cannot edit a completed, matched, or cancelled event' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { increaseCapacity, capacity, eventDate, choiceDeadline, ...rest } = validation.data;

    let updatedEvent = event;

    if (increaseCapacity) {
      const incrementBy = event.eventType === EventType.LARGE ? 200 : 100;
      const capacityUpdated = await incrementEventCapacity(event.id, incrementBy);
      if (capacityUpdated) {
        updatedEvent = capacityUpdated;
      }
    } else if (typeof capacity === 'number') {
      if (capacity < event.currentParticipants) {
        return NextResponse.json(
          { error: 'Capacity cannot be lower than current participants' },
          { status: 400 }
        );
      }

      const capacityUpdated = await updateEventById(event.id, { capacity });
      if (capacityUpdated) {
        updatedEvent = capacityUpdated;
      }
    }

    const updatePayload = {
      ...rest,
      ...(eventDate ? { eventDate: new Date(eventDate) } : {}),
      ...(choiceDeadline ? { choiceDeadline: new Date(choiceDeadline) } : {}),
    };

    if (Object.keys(updatePayload).length > 0) {
      const detailUpdated = await updateEventById(event.id, updatePayload);
      if (detailUpdated) {
        updatedEvent = detailUpdated;
      }
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}
