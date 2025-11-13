'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  Tag,
  Space,
  Typography,
  Breadcrumb,
  message,
  ConfigProvider,
  theme as antdTheme,
  Spin,
  Popover,
} from 'antd';
import { Loading } from '@/components/ui/loading';
import { useTheme } from '@/components/theme-provider';
import {
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  HomeOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { apiClient } from '@/lib/api-client';

const { Title, Paragraph, Text } = Typography;

interface ThanhTichKhoaHoc {
  id: number;
  loai: string;
  mo_ta: string;
  status: string;
}

interface Award {
  id: number;
  cccd: string;
  ho_ten: string;
  don_vi: string;
  chuc_vu: string;
  nam: number;
  danh_hieu: string | null;
  nhan_bkbqp: boolean;
  so_quyet_dinh_bkbqp: string | null;
  nhan_cstdtq: boolean;
  so_quyet_dinh_cstdtq: string | null;
  thanh_tich_khoa_hoc?: ThanhTichKhoaHoc[];
}

export default function ManagerAwardsPage() {
  const { theme } = useTheme();
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [managerUnitId, setManagerUnitId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    nam: '',
    danh_hieu: '',
  });

  // Lấy thông tin đơn vị của manager
  useEffect(() => {
    const getManagerUnit = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.quan_nhan_id) {
          const res = await apiClient.getPersonnelById(user.quan_nhan_id);
          if (res.success && res.data?.don_vi_id) {
            setManagerUnitId(res.data.don_vi_id);
          } else {
            message.error('Không thể xác định đơn vị quản lý.');
          }
        } else {
          message.error('Không tìm thấy thông tin quân nhân của quản lý.');
        }
      } catch (error) {
        console.error('Error getting manager unit:', error);
        message.error('Có lỗi xảy ra khi lấy thông tin đơn vị');
      }
    };

    getManagerUnit();
  }, []);

  useEffect(() => {
    if (managerUnitId !== null) {
      fetchAwards();
    }
  }, [managerUnitId, filters]);

  const fetchAwards = async () => {
    if (managerUnitId === null) return;

    try {
      setLoading(true);
      const params: any = {
        don_vi_id: managerUnitId,
        limit: 1000,
      };
      if (filters.nam) params.nam = parseInt(filters.nam);
      if (filters.danh_hieu) params.danh_hieu = filters.danh_hieu;

      const result = await apiClient.getAwards(params);
      if (result.success) {
        setAwards(result.data.awards || result.data || []);
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
      message.error('Không thể tải danh sách khen thưởng');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (managerUnitId === null) {
      message.error('Không thể xác định đơn vị quản lý');
      return;
    }

    try {
      setExporting(true);
      const params: any = {
        don_vi_id: managerUnitId,
      };
      if (filters.nam) params.nam = parseInt(filters.nam);
      if (filters.danh_hieu) params.danh_hieu = filters.danh_hieu;

      const blob = await apiClient.exportAwards(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `khen_thuong_don_vi_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('Xuất file thành công');
    } catch (error) {
      console.error('Error exporting awards:', error);
      message.error('Xuất file thất bại');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchAwards();
  };

  const columns: TableColumnsType<Award> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'CCCD',
      dataIndex: 'cccd',
      key: 'cccd',
      width: 150,
      align: 'center',
      render: text => <Text style={{ fontFamily: 'monospace' }}>{text}</Text>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
      width: 180,
      align: 'center',
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'chuc_vu',
      key: 'chuc_vu',
      width: 120,
      align: 'center',
      render: text => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 80,
      align: 'center',
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Danh hiệu',
      dataIndex: 'danh_hieu',
      key: 'danh_hieu',
      width: 120,
      align: 'center',
      render: text => (text ? <Tag color="blue">{text}</Tag> : <Text type="secondary">N/A</Text>),
    },
    {
      title: 'BKBQP',
      dataIndex: 'nhan_bkbqp',
      key: 'nhan_bkbqp',
      width: 100,
      align: 'center',
      render: value =>
        value ? (
          <CheckOutlined style={{ color: '#52c41a', fontSize: 16, fontWeight: 'bold' }} />
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Số QĐ BKBQP',
      dataIndex: 'so_quyet_dinh_bkbqp',
      key: 'so_quyet_dinh_bkbqp',
      width: 150,
      align: 'center',
      render: text => <Text type="secondary">{text || '-'}</Text>,
    },
    {
      title: 'CSTĐTQ',
      dataIndex: 'nhan_cstdtq',
      key: 'nhan_cstdtq',
      width: 100,
      align: 'center',
      render: value =>
        value ? (
          <CheckOutlined style={{ color: '#1890ff', fontSize: 16, fontWeight: 'bold' }} />
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Số QĐ CSTĐTQ',
      dataIndex: 'so_quyet_dinh_cstdtq',
      key: 'so_quyet_dinh_cstdtq',
      width: 150,
      align: 'center',
      render: text => <Text type="secondary">{text || '-'}</Text>,
    },
    {
      title: 'NCKH/SKKH',
      dataIndex: 'thanh_tich_khoa_hoc',
      key: 'thanh_tich_khoa_hoc',
      width: 120,
      align: 'center',
      render: (thanhTichList: ThanhTichKhoaHoc[]) => {
        if (!thanhTichList || thanhTichList.length === 0) {
          return <Text type="secondary">-</Text>;
        }

        const content = (
          <div style={{ maxWidth: 400 }}>
            {thanhTichList.map((tt, index) => (
              <div key={tt.id} style={{ marginBottom: index < thanhTichList.length - 1 ? 12 : 0 }}>
                <div>
                  <Tag color={tt.loai === 'NCKH' ? 'blue' : 'green'}>{tt.loai}</Tag>
                  {tt.status === 'APPROVED' ? (
                    <Tag color="success">Đã duyệt</Tag>
                  ) : (
                    <Tag color="warning">Chờ duyệt</Tag>
                  )}
                </div>
                <Text style={{ fontSize: 12 }}>{tt.mo_ta}</Text>
              </div>
            ))}
          </div>
        );

        return (
          <Popover content={content} title="Thành tích khoa học" trigger="hover">
            <Tag color="cyan" style={{ cursor: 'pointer' }}>
              {thanhTichList.length} công trình
            </Tag>
          </Popover>
        );
      },
    },
  ];

  if (loading && awards.length === 0 && managerUnitId !== null) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <Loading fullScreen message="Đang tải danh sách khen thưởng..." size="large" />
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
        <Breadcrumb style={{ marginBottom: '16px' }}>
          <Breadcrumb.Item href="/">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>Manager</Breadcrumb.Item>
          <Breadcrumb.Item>Khen Thưởng Đơn Vị</Breadcrumb.Item>
        </Breadcrumb>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Khen Thưởng Đơn Vị
            </Title>
            <Paragraph type="secondary" style={{ marginTop: '4px', marginBottom: 0 }}>
              Danh sách khen thưởng các quân nhân trong đơn vị
            </Paragraph>
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
            size="large"
          >
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </Button>
        </div>

        {/* Filters */}
        <Card
          title={
            <Space>
              <FilterOutlined />
              Bộ lọc
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Năm
              </Text>
              <Input
                type="number"
                placeholder="Ví dụ: 2024"
                value={filters.nam}
                onChange={e => handleFilterChange('nam', e.target.value)}
              />
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Danh hiệu
              </Text>
              <Input
                placeholder="CSTDCS, CSTT"
                value={filters.danh_hieu}
                onChange={e => handleFilterChange('danh_hieu', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
                style={{ width: '100%' }}
              >
                Tìm kiếm
              </Button>
            </div>
          </div>
        </Card>

        {/* Awards Table */}
        <Card title={`Danh sách khen thưởng (${awards.length})`}>
          <Spin spinning={loading} tip="Đang tải...">
            {!loading && awards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#8c8c8c' }}>
                <p>Chưa có dữ liệu khen thưởng</p>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={awards}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showTotal: total => `Tổng ${total} bản ghi`,
                }}
                scroll={{ x: 1200 }}
                bordered
              />
            )}
          </Spin>
        </Card>
      </div>
    </ConfigProvider>
  );
}
