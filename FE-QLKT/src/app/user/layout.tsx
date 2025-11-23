'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';

export default function UserLayout({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Kiểm tra authentication và authorization
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('role');

      if (!token) {
        // Chưa đăng nhập, redirect về login
        router.push('/login');
        return;
      }

      if (role !== 'USER') {
        // Không có quyền user, redirect về trang tương ứng với role
        if (role === 'SUPER_ADMIN') {
          router.push('/super-admin/dashboard');
        } else if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (role === 'MANAGER') {
          router.push('/manager/dashboard');
        } else {
          router.push('/login');
        }
      }

      setIsChecking(false);
    };

    checkAuth();

    // Lắng nghe sự kiện token được refresh
    const handleTokenRefreshed = () => {
      setIsChecking(true);
      checkAuth();
    };

    window.addEventListener('tokenRefreshed', handleTokenRefreshed);

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
    };
  }, [router]);

  // Hiển thị loading trong khi check auth
  if (isChecking) {
    return null;
  }

  return <MainLayout role="USER">{children}</MainLayout>;
}
