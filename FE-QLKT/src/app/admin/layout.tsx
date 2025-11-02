'use client';

import MainLayout from '@/components/MainLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout role="ADMIN">{children}</MainLayout>;
}


