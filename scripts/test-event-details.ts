
import { db } from '@/core/db';
import { event } from '@/config/db/schema';
import { getEventWithDetails } from '@/shared/models/event';

async function main() {
  try {
    console.log('Fetching events from DB...');
    const events = await db().select().from(event).limit(5);
    
    if (events.length === 0) {
      console.log('No events found in DB.');
      return;
    }

    console.log(`Found ${events.length} events.`);
    const targetEvent = events[0];
    console.log(`Testing getEventWithDetails for event ID: ${targetEvent.id}`);

    const details = await getEventWithDetails(targetEvent.id);
    
    if (details) {
      console.log('Successfully fetched details:');
      console.log('Event Name:', details.event.name);
      console.log('Participants count:', details.participants.length);
    } else {
      console.error('Failed to fetch details (returned null)');
    }

  } catch (error) {
    console.error('Error in test script:', error);
  } finally {
    process.exit(0);
  }
}

main();
