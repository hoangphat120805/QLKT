import MainLayout from '@/components/MainLayout';

export default function UserLayout({ children }) {
  return <MainLayout role="USER">{children}</MainLayout>;
}
