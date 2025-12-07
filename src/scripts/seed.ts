
import { db } from '@/core/db';
import { user } from '@/config/db/schema';

async function seed() {
  console.log('Seeding user...');
  try {
      await db().insert(user).values({
        id: 'mock-organizer-id',
        name: 'Demo Organizer',
        email: 'organizer@example.com',
        emailVerified: true,
      }).onConflictDoNothing();
      console.log('Seeded user successfully');
  } catch (e) {
      console.error('Error seeding:', e);
  }
}

seed().then(() => process.exit(0));
