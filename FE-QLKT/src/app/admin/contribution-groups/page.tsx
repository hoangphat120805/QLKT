'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Breadcrumb, Typography, Space, Spin, Modal, message } from 'antd';
import { ContributionGroupForm } from '@/components/categories/contribution-group-form';
import { ContributionGroupsTable } from '@/components/categories/contribution-groups-table';
import { apiClient } from '@/lib/api-client';
import {
  PlusOutlined,
  HomeOutlined,
  SyncOutlined,
  TeamOutlined,
  StarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function ContributionGroupsPage() {
  const [contributionGroups, setContributionGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const groupsRes = await apiClient.getContributionGroups();
      setContributionGroups(groupsRes.data || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (group?: any) => {
    setEditingGroup(group || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGroup(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <Breadcrumb.Item>
          <Link href="/admin/dashboard">
            <HomeOutlined />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Quản lý Nhóm Công hiến</Breadcrumb.Item>
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
          <Title level={1} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrophyOutlined style={{ fontSize: '32px', color: '#fff' }} />
            </div>
            Quản lý Nhóm Công hiến
          </Title>
          <Text type="secondary" style={{ display: 'block', marginTop: '8px', fontSize: '15px' }}>
            Quản lý và phân loại các nhóm công hiến trong hệ thống khen thưởng
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
                backgroundColor: '#f3e8ff',
                borderRadius: '12px',
                display: 'flex',
              }}
            >
              <TeamOutlined style={{ fontSize: '24px', color: '#9333ea' }} />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Tổng số nhóm
              </Text>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9333ea' }}>
                {contributionGroups.length}
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
              <StarOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Nhóm cao nhất
              </Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {contributionGroups.length > 0
                  ? Math.max(...contributionGroups.map(g => parseInt(g.ten_nhom.match(/\d+/)?.[0] || '0')))
                  : 0}
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
              Đang tải dữ liệu nhóm công hiến...
            </Text>
          </Space>
        </Card>
      ) : (
        <div>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                Danh sách Nhóm Công hiến
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenDialog()}
                size="large"
              >
                Thêm Nhóm
              </Button>
            </div>
            <Card style={{ padding: 0 }}>
              <ContributionGroupsTable
                groups={contributionGroups}
                onEdit={handleOpenDialog}
                onRefresh={loadData}
              />
            </Card>
          </Space>
        </div>
      )}

      <Modal
        title={
          <span style={{ fontSize: '18px', fontWeight: 600 }}>
            <TrophyOutlined style={{ marginRight: '8px', color: '#9333ea' }} />
            {editingGroup ? 'Sửa Nhóm Công hiến' : 'Thêm Nhóm mới'}
          </span>
        }
        open={dialogOpen}
        onCancel={handleCloseDialog}
        footer={null}
        width={800}
        destroyOnClose
      >
        <ContributionGroupForm
          group={editingGroup}
          onSuccess={loadData}
          onClose={handleCloseDialog}
        />
      </Modal>
    </div>
  );
}
