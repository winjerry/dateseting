
import { db } from '@/core/db';
import { createEvent, EventStatus, EventType } from '@/shared/models/event';

async function main() {
  try {
    console.log('Testing createEvent...');
    const result = await createEvent({
      organizerId: 'mock-organizer-id',
      name: 'Test Event',
      location: 'Test Loc',
      eventDate: new Date(),
      eventTime: '12:00',
      eventType: EventType.STANDARD,
      capacity: 100,
      price: 4900,
      status: EventStatus.DRAFT,
    });
    console.log('Success:', result);
  } catch (e) {
    console.error('Failed:', e);
  }
}

main().then(() => process.exit(0));
