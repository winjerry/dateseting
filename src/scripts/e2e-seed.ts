
import { createEvent, EventStatus, EventType } from '@/shared/models/event';
import { createParticipant, submitParticipantChoices, ParticipantStatus, RegistrationSource } from '@/shared/models/participant';

async function main() {
  try {
    console.log('--- Starting E2E Data Seeding ---');

    console.log('1. Creating Event...');
    const event = await createEvent({
      organizerId: 'mock-organizer-id',
      name: 'E2E Demo Event',
      location: 'Virtual',
      eventDate: new Date(),
      eventTime: '19:00',
      eventType: EventType.STANDARD,
      capacity: 100,
      price: 4900,
      status: EventStatus.ACTIVE, // Set to ACTIVE so we can calc matches? Or Draft? Draft is fine.
    });
    console.log(`   Event Created: ${event.id} (${event.eventNo})`);

    console.log('2. Creating Participant 1 (Wei Hai)...');
    const p1 = await createParticipant({
      eventId: event.id,
      name: 'Wei Hai',
      email: 'weihai1233@gmail.com',
      age: 30,
      status: ParticipantStatus.REGISTERED,
      registrationSource: RegistrationSource.LINK,
      // other optional fields
    });
    console.log(`   P1 ID: ${p1.id}`);

    console.log('3. Creating Participant 2 (Alice)...');
    const p2 = await createParticipant({
      eventId: event.id,
      name: 'Alice Test',
      email: 'alice@test.com',
      age: 26,
      status: ParticipantStatus.REGISTERED,
      registrationSource: RegistrationSource.LINK,
    });
    console.log(`   P2 ID: ${p2.id}`);

    console.log('4. Submitting Mutual Choices...');
    await submitParticipantChoices(p1.id, event.id, [p2.id]);
    await submitParticipantChoices(p2.id, event.id, [p1.id]);
    console.log('   Choices Submitted.');

    console.log('--- Seeding Complete ---');
    console.log('Navigate to:', `http://localhost:3000/my-events/${event.id}`);
    
    // Output for next tool to parse
    console.log(`OUTPUT_EVENT_ID=${event.id}`);

  } catch (e) {
    console.error('Seeding Failed:', e);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
