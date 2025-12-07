import { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';

import { LocaleDetector } from '@/shared/blocks/common';
import { OrganizerLayout } from '@/shared/blocks/organizer';

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

  // TODO: Add organizer authentication check
  // await requireOrganizerAccess({ redirectUrl: `/sign-in`, locale });

  return (
    <OrganizerLayout>
      <LocaleDetector />
      {children}
    </OrganizerLayout>
  );
}
