
import { db } from '@/core/db';
import { event, participant, participantChoice } from '@/config/db/schema';
import { createParticipant, submitParticipantChoices, ParticipantStatus, RegistrationSource } from '@/shared/models/participant';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

import { v4 as uuidv4 } from 'uuid';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    console.log('🎉 Starting Live Event Simulation...');

    // 1. Get the latest active event
    // const events = await db().select().from(event).limit(1);
    const targetEventNo = 'EVT-20260117-63US';
    const events = await db().select().from(event).where(eq(event.eventNo, targetEventNo)).limit(1);
    
    if (events.length === 0) {
      console.error(`❌ Event ${targetEventNo} not found.`);
      process.exit(1);
    }
    const targetEvent = events[0];
    console.log(`📍 Target Event: ${targetEvent.name} (${targetEvent.eventNo})`);
    console.log(`   Capacity: ${targetEvent.capacity}`);
    console.log('-----------------------------------');

    // 2. Simulate Registration Phase
    const TOTAL_PARTICIPANTS = 30; // Simulate 30 users for demo
    const createdParticipants: any[] = [];

    console.log('🚀 Phase 1: Registration (Simulating users joining...)');
    
    for (let i = 0; i < TOTAL_PARTICIPANTS; i++) {
      const gender = i % 2 === 0 ? 'male' : 'female';
      const name = faker.person.fullName({ sex: gender });
      
      const p = await createParticipant({
        eventId: targetEvent.id,
        name: name,
        age: faker.number.int({ min: 20, max: 40 }),
        gender: gender,
        email: faker.internet.email({ firstName: name }),
        phone: faker.phone.number(),
        interests: JSON.stringify(faker.helpers.arrayElements(['Travel', 'Music', 'Food', 'Sports', 'Art', 'Tech'], { min: 2, max: 4 })),
        photoUrl: faker.image.avatar(),
        registrationSource: RegistrationSource.LINK,
        status: ParticipantStatus.REGISTERED,
      });

      createdParticipants.push(p);
      console.log(`   [${i + 1}/${TOTAL_PARTICIPANTS}] + User joined: ${name}`);
      
      // Random delay to simulate real-time joining (200ms - 800ms)
      await delay(faker.number.int({ min: 200, max: 800 }));
    }

    console.log('✅ Phase 1 Complete. All participants registered.');
    console.log('-----------------------------------');

    // 3. Simulate Interaction/Choice Phase
    console.log('🚀 Phase 2: Choices (Simulating users submitting choices...)');
    
    // Shuffle participants to simulate random submission order
    const shuffledParticipants = faker.helpers.shuffle([...createdParticipants]);

    for (const p of shuffledParticipants) {
      // Pick 1-3 random targets to "like"
      const targets = faker.helpers.arrayElements(
        createdParticipants.filter(t => t.id !== p.id), // Don't pick self
        { min: 1, max: 3 }
      );
      
      const targetIds = targets.map(t => t.id);
      
      await submitParticipantChoices(p.id, targetEvent.id, targetIds);
      
      console.log(`   📝 ${p.name} submitted choices (${targets.length} picks)`);
      
      // Random delay (500ms - 1500ms)
      await delay(faker.number.int({ min: 500, max: 1500 }));
    }

    console.log('✅ Phase 2 Complete. All choices submitted.');
    console.log('🎉 Simulation Finished!');

  } catch (error) {
    console.error('❌ Error during simulation:', error);
  } finally {
    process.exit(0);
  }
}

main();
