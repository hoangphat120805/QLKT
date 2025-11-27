'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Typography,
  Breadcrumb,
  message,
  ConfigProvider,
  theme as antdTheme,
  Spin,
  Space,
  Tag,
} from 'antd';
import { Loading } from '@/components/ui/loading';
import { useTheme } from '@/components/theme-provider';
import { HomeOutlined, EyeOutlined, TrophyOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { apiClient } from '@/lib/api-client';

const { Title, Text } = Typography;

interface Unit {
  id: string;
  ma_don_vi: string;
  ten_don_vi: string;
  CoQuanDonVi?: {
    id: string;
    ten_don_vi: string;
    ma_don_vi: string;
  };
}

export default function ManagerUnitsPage() {
  const { theme } = useTheme();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [allAwards, setAllAwards] = useState<any[]>([]);
  const [awardsLoading, setAwardsLoading] = useState(false);

  useEffect(() => {
    fetchUnits();
    fetchAllAwards();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getMyUnits();
      if (result.success) {
        const data = result.data;
        if (Array.isArray(data)) {
          setUnits(data);
        } else {
          setUnits([]);
        }
      } else {
        message.error(result.message || 'Không thể tải danh sách đơn vị');
        setUnits([]);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      message.error('Không thể tải danh sách đơn vị');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAwards = async () => {
    try {
      setAwardsLoading(true);
      const result = await apiClient.getUnitAnnualAwards({ limit: 1000 });
      console.log('Awards fetch result:', result);

      if (result.success) {
        const data = result.data.items;
        if (Array.isArray(data)) {
          setAllAwards(data);
        } else if (data && Array.isArray(data.awards)) {
          setAllAwards(data.awards);
        } else {
          setAllAwards([]);
        }
      } else {
        message.error(result.message || 'Không thể tải danh sách khen thưởng');
        setAllAwards([]);
      }
    } catch (error) {
      console.error('Error fetching all awards:', error);
      message.error('Không thể tải danh sách khen thưởng');
      setAllAwards([]);
    } finally {
      setAwardsLoading(false);
    }
  };

  const handleViewUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
  };

  const columns: TableColumnsType<Unit> = [
    {
      title: 'Mã đơn vị',
      dataIndex: 'ma_don_vi',
      key: 'ma_don_vi',
      width: 150,
    },
    {
      title: 'Tên đơn vị',
      dataIndex: 'ten_don_vi',
      key: 'ten_don_vi',
      width: 300,
    },
    {
      title: 'Cơ quan đơn vị',
      key: 'co_quan_don_vi',
      render: (_, record) => {
        if (record.CoQuanDonVi) {
          return record.CoQuanDonVi.ten_don_vi;
        }
        return 'Cơ quan chính';
      },
      width: 200,
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <div className="p-6">
        <Breadcrumb
          items={[
            {
              href: '/manager/dashboard',
              title: (
                <>
                  <HomeOutlined />
                  <span>Dashboard</span>
                </>
              ),
            },
            {
              title: 'Quản lý Đơn vị',
            },
          ]}
        />

        <div className="mt-4">
          <Title level={2}>Quản lý Đơn vị</Title>
          <Text type="secondary">
            Quản lý và xem chi tiết các đơn vị trực thuộc cùng tất cả khen thưởng
          </Text>
        </div>

        <Card className="mt-6">
          <Table
            columns={columns}
            dataSource={units}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn vị`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {selectedUnitId && (
          <Card className="mt-6">
            <Title level={3}>Chi tiết đơn vị</Title>
            {(() => {
              const selectedUnit = units.find(u => u.id === selectedUnitId);
              if (!selectedUnit) return null;
              return (
                <div>
                  <p>
                    <strong>Mã đơn vị:</strong> {selectedUnit.ma_don_vi}
                  </p>
                  <p>
                    <strong>Tên đơn vị:</strong> {selectedUnit.ten_don_vi}
                  </p>
                  <p>
                    <strong>Cơ quan đơn vị:</strong>{' '}
                    {selectedUnit.CoQuanDonVi
                      ? selectedUnit.CoQuanDonVi.ten_don_vi
                      : 'Cơ quan chính'}
                  </p>
                </div>
              );
            })()}
          </Card>
        )}

        <Card className="mt-6">
          <Title level={3}>Tất cả khen thưởng của các đơn vị</Title>
          {awardsLoading ? (
            <Spin size="large" />
          ) : (
            <Table
              columns={[
                {
                  title: 'Mã đơn vị',
                  key: 'ma_don_vi',
                  render: (_, record) =>
                    record?.DonViTrucThuoc?.ma_don_vi ?? record?.CoQuanDonVi?.ma_don_vi ?? '',
                },
                {
                  title: 'Tên đơn vị',
                  key: 'ten_don_vi',
                  render: (_, record) =>
                    record?.DonViTrucThuoc?.ten_don_vi ?? record?.CoQuanDonVi?.ten_don_vi ?? '',
                },
                {
                  title: 'Danh hiệu',
                  dataIndex: 'danh_hieu',
                  key: 'danh_hieu',
                  render: danhHieu => <Tag color="blue">{danhHieu || 'Chưa có'}</Tag>,
                },
                {
                  title: 'Số quyết định',
                  dataIndex: 'so_quyet_dinh',
                  key: 'so_quyet_dinh',
                },
                {
                  title: 'Năm',
                  dataIndex: 'nam',
                  key: 'nam',
                },
              ]}
              dataSource={allAwards}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khen thưởng`,
              }}
              scroll={{ x: 800 }}
            />
          )}
        </Card>
      </div>
    </ConfigProvider>
  );
}
