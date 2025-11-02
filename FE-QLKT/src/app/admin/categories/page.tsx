'use client';

import { useEffect, useState } from 'react';
import { Button, Breadcrumb, Card, Tabs, Select, Modal, Typography, Spin, message } from 'antd';
import { PlusOutlined, HomeOutlined, LoadingOutlined } from '@ant-design/icons';
import { UnitForm } from '@/components/categories/unit-form';
import { UnitsTable } from '@/components/categories/units-table';
import { PositionForm } from '@/components/categories/position-form';
import { PositionsTable } from '@/components/categories/positions-table';
import { ContributionGroupForm } from '@/components/categories/contribution-group-form';
import { ContributionGroupsTable } from '@/components/categories/contribution-groups-table';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CategoriesPage() {
  const [units, setUnits] = useState([]);
  const [positions, setPositions] = useState([]);
  const [contributionGroups, setContributionGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'unit' | 'position' | 'group'>('unit');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [activeTab, setActiveTab] = useState('units');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [unitsRes, positionsRes, groupsRes] = await Promise.all([
        apiClient.getUnits(),
        apiClient.getPositions(),
        apiClient.getContributionGroups(),
      ]);
      setUnits(unitsRes.data || []);
      setPositions(positionsRes.data || []);
      setContributionGroups(groupsRes.data || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (type: 'unit' | 'position' | 'group', item?: any) => {
    setDialogType(type);
    setEditingItem(item || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const filteredPositions =
    selectedUnit === 'ALL' ? positions : positions.filter(p => p.don_vi_id?.toString() === selectedUnit);

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <Breadcrumb.Item>
          <Link href="/admin/dashboard">
            <HomeOutlined />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Quản lý Danh mục</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #9333ea' }}>
        <Title level={1} style={{
          margin: 0,
          background: 'linear-gradient(to right, #9333ea, #db2777)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Quản lý Danh mục
        </Title>
        <Text type="secondary" style={{ fontSize: '16px', marginTop: '8px', display: 'block' }}>
          Quản lý đơn vị ({units.length}), chức vụ ({positions.length}) và nhóm công hiến ({contributionGroups.length})
        </Text>
      </div>

      {loading ? (
        <Card style={{ padding: '48px', textAlign: 'center' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <div style={{ marginTop: '16px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 500 }}>Đang tải dữ liệu danh mục...</Text>
          </div>
        </Card>
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'units',
              label: `Đơn vị (${units.length})`,
              children: (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Title level={2} style={{ margin: 0, color: '#9333ea' }}>Danh sách Đơn vị</Title>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleOpenDialog('unit')}
                    >
                      Thêm Đơn vị
                    </Button>
                  </div>
                  <Card style={{ padding: 0, borderTop: '4px solid #9333ea' }}>
                    <UnitsTable
                      units={units}
                      onEdit={unit => handleOpenDialog('unit', unit)}
                      onRefresh={loadData}
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: 'positions',
              label: `Chức vụ (${positions.length})`,
              children: (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                    <Title level={2} style={{ margin: 0, color: '#9333ea' }}>Danh sách Chức vụ</Title>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Select
                        value={selectedUnit}
                        onChange={setSelectedUnit}
                        style={{ width: 288 }}
                        placeholder="Chọn Đơn vị"
                      >
                        <Option value="ALL">Tất cả Đơn vị ({units.length})</Option>
                        {units.map(unit => (
                          <Option key={unit.id} value={unit.id.toString()}>
                            {unit.ten_don_vi}
                          </Option>
                        ))}
                      </Select>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenDialog('position')}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                  <Card style={{ padding: 0, borderTop: '4px solid #9333ea' }}>
                    <PositionsTable
                      positions={filteredPositions}
                      onEdit={pos => handleOpenDialog('position', pos)}
                      onRefresh={loadData}
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: 'groups',
              label: `Nhóm Công hiến (${contributionGroups.length})`,
              children: (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Title level={2} style={{ margin: 0, color: '#9333ea' }}>Danh sách Nhóm Công hiến</Title>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleOpenDialog('group')}
                    >
                      Thêm Nhóm
                    </Button>
                  </div>
                  <Card style={{ padding: 0, borderTop: '4px solid #9333ea' }}>
                    <ContributionGroupsTable
                      groups={contributionGroups}
                      onEdit={group => handleOpenDialog('group', group)}
                      onRefresh={loadData}
                    />
                  </Card>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal
        open={dialogOpen}
        onCancel={handleCloseDialog}
        footer={null}
        width={800}
        style={{ maxHeight: '90vh' }}
        title={
          dialogType === 'unit' ? (editingItem ? 'Sửa Đơn vị' : 'Thêm Đơn vị mới') :
          dialogType === 'position' ? (editingItem ? 'Sửa Chức vụ' : 'Thêm Chức vụ mới') :
          (editingItem ? 'Sửa Nhóm Công hiến' : 'Thêm Nhóm mới')
        }
      >
        {dialogType === 'unit' && (
          <UnitForm unit={editingItem} onSuccess={loadData} onClose={handleCloseDialog} />
        )}

        {dialogType === 'position' && (
          <PositionForm
            position={editingItem}
            contributionGroups={contributionGroups}
            units={units}
            onSuccess={loadData}
            onClose={handleCloseDialog}
          />
        )}

        {dialogType === 'group' && (
          <ContributionGroupForm
            group={editingItem}
            onSuccess={loadData}
            onClose={handleCloseDialog}
          />
        )}
      </Modal>
    </div>
  );
}
