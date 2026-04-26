
import { db } from '@/core/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log('Adding gender column manually...');
    // Drizzle's execute might be different depending on driver, but let's try raw query via sql
    // For postgres-js (which seems to be used based on logs), db.execute(sql`...`) should work.
    
    await db().execute(sql`ALTER TABLE speed_participant ADD COLUMN IF NOT EXISTS gender text;`);
    
    console.log('Successfully added gender column.');
  } catch (error) {
    console.error('Error fixing DB:', error);
  } finally {
    process.exit(0);
  }
}

main();
