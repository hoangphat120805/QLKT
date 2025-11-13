'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Breadcrumb,
  Typography,
  Space,
  Modal,
  message,
  ConfigProvider,
  theme as antdTheme,
  Spin,
} from 'antd';
import { Loading } from '@/components/ui/loading';
import { useTheme } from '@/components/theme-provider';
import { UnitForm } from '@/components/categories/unit-form';
import { UnitsTable } from '@/components/categories/units-table';
import { apiClient } from '@/lib/api-client';
import {
  PlusOutlined,
  HomeOutlined,
  SyncOutlined,
  ApartmentOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function UnitsPage() {
  const { theme } = useTheme();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const unitsRes = await apiClient.getUnits();
      setUnits(unitsRes.data || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (unit?: any) => {
    setEditingUnit(unit || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUnit(null);
  };

  const totalPersonnel = units.reduce((sum, unit) => sum + (unit.so_luong || 0), 0);

  if (loading && units.length === 0) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <Loading fullScreen message="Đang tải danh sách đơn vị..." size="large" />
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
            <Link href="/admin/dashboard">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Quản lý Đơn vị</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <Title
              level={1}
              style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <div
                style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ApartmentOutlined style={{ fontSize: '32px', color: '#fff' }} />
              </div>
              Quản lý Đơn vị
            </Title>
            <Text type="secondary" style={{ display: 'block', marginTop: '8px', fontSize: '15px' }}>
              Quản lý thông tin tổ chức, đơn vị và quân số trong hệ thống
            </Text>
          </div>
          <Button
            icon={<SyncOutlined spin={loading} />}
            onClick={loadData}
            disabled={loading}
            size="large"
          >
            Làm mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#e0f2fe',
                  borderRadius: '12px',
                  display: 'flex',
                }}
              >
                <ApartmentOutlined style={{ fontSize: '24px', color: '#0284c7' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Tổng số đơn vị
                </Text>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0284c7' }}>
                  {units.length}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '12px',
                  display: 'flex',
                }}
              >
                <UserOutlined style={{ fontSize: '24px', color: '#16a34a' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Tổng quân số
                </Text>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>
                  {totalPersonnel}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '12px',
                  display: 'flex',
                }}
              >
                <TeamOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Quân số TB/Đơn vị
                </Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {units.length > 0 ? Math.round(totalPersonnel / units.length) : 0}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {loading ? (
          <Card style={{ textAlign: 'center', padding: '48px' }}>
            <Space direction="vertical" size="large">
              <Spin size="large" />
              <Text type="secondary" style={{ fontSize: '18px', fontWeight: 500 }}>
                Đang tải dữ liệu đơn vị...
              </Text>
            </Space>
          </Card>
        ) : (
          <div>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Title level={3} style={{ margin: 0 }}>
                  Danh sách Đơn vị
                </Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenDialog()}
                  size="large"
                >
                  Thêm Đơn vị
                </Button>
              </div>
              <Card style={{ padding: 0 }}>
                <UnitsTable units={units} onEdit={handleOpenDialog} onRefresh={loadData} />
              </Card>
            </Space>
          </div>
        )}

        <Modal
          title={
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              <ApartmentOutlined style={{ marginRight: '8px', color: '#0284c7' }} />
              {editingUnit ? 'Sửa Đơn vị' : 'Thêm Đơn vị mới'}
            </span>
          }
          open={dialogOpen}
          onCancel={handleCloseDialog}
          footer={null}
          width={800}
          destroyOnClose
        >
          <UnitForm unit={editingUnit} onSuccess={loadData} onClose={handleCloseDialog} />
        </Modal>
      </div>
    </ConfigProvider>
  );
}
