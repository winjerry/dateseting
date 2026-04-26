import { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { LocaleDetector } from '@/shared/blocks/common';
import { OrganizerLayout } from '@/shared/blocks/organizer';
import { getServerSession } from '@/core/auth/session';

/**
 * Organizer layout for event management
 * Uses simple top navigation instead of admin sidebar
 */
export default async function OrganizerEventsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getServerSession();
  
  if (!session?.user) {
    redirect(`/${locale}/sign-in?callbackUrl=/${locale}/my-events`);
  }

  return (
    <OrganizerLayout>
      <LocaleDetector />
      {children}
    </OrganizerLayout>
  );
}
