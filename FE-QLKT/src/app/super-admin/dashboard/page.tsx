'use client';

import { useState, useEffect } from 'react';
import { Card, Breadcrumb, Typography, ConfigProvider, theme as antdTheme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  SettingOutlined,
  FundOutlined,
  BankOutlined,
  FileTextOutlined,
  RiseOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Loading } from '@/components/ui/loading';
import { useTheme } from '@/components/theme-provider';

const { Title, Text } = Typography;

export default function SuperAdminDashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalPersonnel: 0,
    totalUnits: 0,
    totalLogs: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [accountsRes, personnelRes, logsRes] = await Promise.all([
          apiClient.getAccounts({ page: 1, limit: 1 }),
          apiClient.getPersonnel({ page: 1, limit: 1 }),
          apiClient.getSystemLogs({ page: 1, limit: 1 }),
        ]);

        setStats({
          totalAccounts: accountsRes?.data?.pagination?.total || 0,
          totalPersonnel: personnelRes?.data?.pagination?.total || 0,
          totalUnits: 0,
          totalLogs: logsRes?.data?.pagination?.total || 0,
          recentActivity: 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Tổng tài khoản',
      value: stats.totalAccounts,
      icon: UserOutlined,
      bgColor: '#e0f2fe',
      iconColor: '#0284c7',
      link: '/super-admin/accounts',
    },
    {
      title: 'Quản lý tài khoản',
      value: 'Xem',
      icon: SafetyOutlined,
      bgColor: '#dcfce7',
      iconColor: '#16a34a',
      link: '/super-admin/accounts',
    },
    {
      title: 'Nhật ký hệ thống',
      value: stats.totalLogs,
      icon: FileTextOutlined,
      bgColor: '#f3e8ff',
      iconColor: '#9333ea',
      link: '/super-admin/system-logs',
    },
    {
      title: 'Tạo tài khoản mới',
      value: '+',
      icon: FundOutlined,
      bgColor: '#fed7aa',
      iconColor: '#ea580c',
      link: '/super-admin/accounts/create',
    },
  ];

  const quickActions = [
    {
      title: 'Quản lý tài khoản',
      description: 'Xem danh sách và quản lý tài khoản người dùng',
      icon: UserOutlined,
      iconColor: '#0284c7',
      bgColor: '#e0f2fe',
      link: '/super-admin/accounts',
    },
    {
      title: 'Tạo tài khoản mới',
      description: 'Thêm tài khoản và quân nhân mới vào hệ thống',
      icon: SafetyOutlined,
      iconColor: '#16a34a',
      bgColor: '#dcfce7',
      link: '/super-admin/accounts/create',
    },
    {
      title: 'Nhật ký hệ thống',
      description: 'Xem lịch sử hoạt động và thay đổi trong hệ thống',
      icon: FileTextOutlined,
      iconColor: '#9333ea',
      bgColor: '#f3e8ff',
      link: '/super-admin/system-logs',
    },
    {
      title: 'Cài đặt hệ thống',
      description: 'Quản lý cấu hình và thiết lập hệ thống',
      icon: BankOutlined,
      iconColor: '#ea580c',
      bgColor: '#fed7aa',
      link: '/super-admin/dashboard',
    },
  ];

  if (loading) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <Loading fullScreen message="Đang tải thống kê hệ thống..." size="large" />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
          <DashboardOutlined style={{ fontSize: '24px', color: '#0284c7' }} />
        </div>
        <div>
          <Title level={1} style={{ margin: 0 }}>Bảng điều khiển</Title>
          <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>
            Chào mừng đến với hệ thống quản lý - Super Admin
          </Text>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          const isNumber = typeof stat.value === 'number';
          return (
            <Link key={index} href={stat.link}>
              <Card hoverable style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                      {stat.title}
                    </Text>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                      {loading && isNumber ? '...' : stat.value}
                    </div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: stat.bgColor, borderRadius: '8px' }}>
                    <IconComponent style={{ fontSize: '24px', color: stat.iconColor }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '14px' }}>
                  <ArrowRightOutlined style={{ fontSize: '16px' }} />
                  <span>Truy cập</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <Title level={2} style={{ marginBottom: '16px' }}>Thao tác nhanh</Title>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link key={index} href={action.link}>
                <Card hoverable style={{ cursor: 'pointer', height: '100%' }}>
                  <div style={{ padding: '12px', backgroundColor: action.bgColor, borderRadius: '8px', width: 'fit-content', marginBottom: '16px' }}>
                    <IconComponent style={{ fontSize: '24px', color: action.iconColor }} />
                  </div>
                  <Title level={4} style={{ marginBottom: '8px' }}>{action.title}</Title>
                  <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '16px' }}>
                    {action.description}
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7', fontSize: '14px' }}>
                    <span>Truy cập</span>
                    <ArrowRightOutlined style={{ fontSize: '16px' }} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Info */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '24px' }}>
          <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
            <SettingOutlined style={{ fontSize: '20px', color: '#16a34a' }} />
          </div>
          <div>
            <Title level={4} style={{ marginBottom: '8px' }}>Quyền quản trị Super Admin</Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Bạn có toàn quyền quản lý hệ thống, bao gồm tài khoản, quân nhân, đơn vị và xem nhật ký hoạt động.
              Vui lòng sử dụng các quyền này một cách cẩn thận và có trách nhiệm.
            </Text>
          </div>
        </div>
      </Card>
      </div>
    </ConfigProvider>
  );
}
