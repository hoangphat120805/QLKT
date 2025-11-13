// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Card, Breadcrumb, Typography, message, ConfigProvider, theme as antdTheme } from 'antd';
import { FileTextOutlined, DashboardOutlined, FundOutlined } from '@ant-design/icons';
import { LogsFilter } from '@/components/system-logs/logs-filter';
import { LogsTable } from '@/components/system-logs/logs-table';
import { apiClient } from '@/lib/api-client';
import { Loading } from '@/components/ui/loading';
import { useTheme } from '@/components/theme-provider';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function ManagerSystemLogsPage() {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    startDate: undefined,
    endDate: undefined,
    actorRole: 'USER',
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getSystemLogs(filters);
        const payload: any = res?.data ?? res;
        const list: any[] = Array.isArray(payload)
          ? payload
          : payload?.logs || payload?.items || payload?.results || payload?.data || [];

        const normalized = list.map((l: any) => {
          const actionCombined = [l?.action, l?.resource].filter(Boolean).join('_').toUpperCase();
          const actorName =
            l?.Actor?.QuanNhan?.ho_ten || l?.Actor?.username || l?.actor_name || l?.actor_id;
          return {
            ...l,
            action: actionCombined,
            actor_name: actorName,
            details: l?.description ?? l?.details,
            created_at: l?.created_at ?? l?.createdAt ?? l?.time ?? l?.timestamp,
          };
        });

        setLogs(normalized);
      } catch (error) {
        message.error('Không thể tải nhật ký hệ thống');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [filters]);

  if (loading && logs.length === 0) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <Loading fullScreen message="Đang tải nhật ký hệ thống..." size="large" />
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
          <Breadcrumb.Item>
            <Link href="/manager/dashboard">
              <DashboardOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Nhật ký hệ thống</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
            <FundOutlined style={{ fontSize: '24px', color: '#0284c7' }} />
          </div>
          <div>
            <Title level={1} style={{ margin: 0 }}>
              Nhật ký Hệ thống
            </Title>
            <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>
              Xem lịch sử hoạt động và thay đổi trong hệ thống
            </Text>
          </div>
        </div>

        {/* Filter Section */}
        <LogsFilter onFilterChange={setFilters} />

        {/* Stats Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
              <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                <FileTextOutlined style={{ fontSize: '20px', color: '#16a34a' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Tổng nhật ký
                </Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{logs.length}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
              <div style={{ padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
                <FundOutlined style={{ fontSize: '20px', color: '#0284c7' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Hành động tạo
                </Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {logs.filter(l => l.action?.includes('CREATE')).length}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
              <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                <FundOutlined style={{ fontSize: '20px', color: '#dc2626' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Hành động xóa
                </Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {logs.filter(l => l.action?.includes('DELETE')).length}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Logs Table Card */}
        <Card>
          <div style={{ padding: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>
              Danh sách nhật ký
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginTop: '4px' }}>
              Tất cả hoạt động và thay đổi trong hệ thống
            </Text>
          </div>
          <div style={{ padding: 0 }}>
            <LogsTable logs={logs} loading={loading} />
          </div>
        </Card>
      </div>
    </ConfigProvider>
  );
}
