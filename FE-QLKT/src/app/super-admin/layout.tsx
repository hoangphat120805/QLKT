import MainLayout from '@/components/MainLayout';

export default function SuperAdminLayout({ children }) {
  return <MainLayout role="SUPER_ADMIN">{children}</MainLayout>;
}
