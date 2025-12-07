import { setRequestLocale } from 'next-intl/server';

import HomePage from './home/page';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePage />;
}
