import { NextResponse } from 'next/server';

import { getServerSession } from '@/core/auth/session';
import { findEventById } from '@/shared/models/event';
import { getParticipantsByEventId } from '@/shared/models/participant';

function escapeCsvValue(value: string | number | null | undefined): string {
  const normalized = String(value ?? '');
  if (normalized.includes(',') || normalized.includes('"') || normalized.includes('\n')) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export async function GET(
  request: Request,
  props: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const event = await findEventById(params.eventId);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const participants = await getParticipantsByEventId(event.id, { limit: 5000 });
    const rows = [
      ['Name', 'Email', 'Phone', 'Age', 'Registered At'],
      ...participants.map((item) => [
        item.name,
        item.email,
        item.phone || '',
        item.age,
        item.registeredAt ? item.registeredAt.toISOString() : '',
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="participants-${event.eventNo}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting participants:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export participants' },
      { status: 500 }
    );
  }
}
