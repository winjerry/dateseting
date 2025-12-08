import { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { requireAdminAccess } from '@/core/rbac/permission';
import { LocaleDetector } from '@/shared/blocks/common';
import { DashboardLayout } from '@/shared/blocks/dashboard/layout';
import { Sidebar as SidebarType } from '@/shared/types/blocks/dashboard';

/**
 * Admin layout to manage datas
 * NOTE: Auth check temporarily disabled for development preview
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireAdminAccess({ redirectUrl: `/no-permission`, locale });

  const t = await getTranslations('admin');
  const sidebar: SidebarType = t.raw('sidebar');

  return (
    <DashboardLayout sidebar={sidebar}>
      <LocaleDetector />
      {children}
    </DashboardLayout>
  );
}
