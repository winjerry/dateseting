import { headers } from 'next/headers';
import { getAuth } from '@/core/auth';

export async function getServerSession() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}
