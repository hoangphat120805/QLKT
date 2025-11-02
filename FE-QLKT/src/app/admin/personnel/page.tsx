// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Space,
  Breadcrumb,
  Typography,
  Modal,
  message,
  Tag,
  Popconfirm,
  ConfigProvider,
  theme as antdTheme,
} from 'antd';
import { Loading } from '@/components/ui/loading';
import { useTheme } from '@/components/theme-provider';
import {
  PlusOutlined,
  HomeOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

const { Title, Text } = Typography;

export default function PersonnelPage() {
  const { theme } = useTheme();
  const [personnel, setPersonnel] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [tableLoading, setTableLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [personnelRes, unitsRes] = await Promise.all([
        apiClient.getPersonnel(),
        apiClient.getUnits(),
      ]);

      // Map data để có don_vi_name và chuc_vu_name từ Prisma relations
      const personnelData = (personnelRes.data?.personnel || []).map(p => ({
        ...p,
        don_vi_name: p.DonVi?.ten_don_vi || '-',
        chuc_vu_name: p.ChucVu?.ten_chuc_vu || '-',
      }));

      setPersonnel(personnelData);
      setUnits(unitsRes.data || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setTableLoading(true);
      await apiClient.deletePersonnel(id.toString());
      message.success('Xóa quân nhân thành công');
      loadData();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    } finally {
      setTableLoading(false);
    }
  };

  const filteredPersonnel = personnel.filter(p => {
    const matchesSearch =
      p.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) || p.cccd.includes(searchTerm);
    const matchesUnit = selectedUnit === 'ALL' || p.don_vi_id?.toString() === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  const columns = [
    {
      title: 'CCCD',
      dataIndex: 'cccd',
      key: 'cccd',
      width: 140,
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
      width: 200,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'don_vi_name',
      key: 'don_vi_name',
      width: 200,
      render: text => <Tag color="blue">{text || '-'}</Tag>,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'chuc_vu_name',
      key: 'chuc_vu_name',
      width: 180,
      render: text => <Tag color="green">{text || '-'}</Tag>,
    },
    {
      title: 'Ngày nhập ngũ',
      dataIndex: 'ngay_nhap_ngu',
      key: 'ngay_nhap_ngu',
      width: 140,
      render: date => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => router.push(`/admin/personnel/${record.id}`)}
          >
            Xem
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa quân nhân này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && personnel.length === 0) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <Loading fullScreen message="Đang tải danh sách quân nhân..." size="large" />
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
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            {
              title: (
                <Link href="/admin/dashboard">
                  <HomeOutlined />
                </Link>
              ),
            },
            {
              title: 'Quản lý Quân nhân',
            },
          ]}
        />

        {/* Header */}
        <div
          style={{
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
              Quản lý Quân nhân
            </Title>
            <Text type="secondary">
              Quản lý thông tin quân nhân trong hệ thống ({filteredPersonnel.length} quân nhân)
            </Text>
          </div>
          <Space>
            <Link href="/admin/annual-rewards/bulk">
              <Button size="large" icon={<PlusOutlined />}>
                Thêm danh hiệu đồng loạt
              </Button>
            </Link>
            <Link href="/admin/personnel/create">
              <Button type="primary" size="large" icon={<PlusOutlined />}>
                Thêm Quân nhân
              </Button>
            </Link>
          </Space>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space wrap style={{ width: '100%' }} size="middle">
              <div style={{ flex: 1, minWidth: 300 }}>
                <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
                  Tìm kiếm
                </Text>
                <Input
                  placeholder="Nhập tên hoặc số CCCD để tìm kiếm..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  size="large"
                  allowClear
                />
              </div>
              <div style={{ minWidth: 250 }}>
                <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
                  Đơn vị
                </Text>
                <Select
                  value={selectedUnit}
                  onChange={setSelectedUnit}
                  style={{ width: '100%' }}
                  size="large"
                  suffixIcon={<FilterOutlined />}
                >
                  <Select.Option value="ALL">Tất cả đơn vị ({units.length})</Select.Option>
                  {units.map(unit => (
                    <Select.Option key={unit.id} value={unit.id.toString()}>
                      {unit.ten_don_vi}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Space>
          </Space>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredPersonnel}
            rowKey="id"
            loading={loading || tableLoading}
            pagination={{
              total: filteredPersonnel.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: total => `Tổng ${total} quân nhân`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: 'Không có dữ liệu',
            }}
          />
        </Card>
      </div>
    </ConfigProvider>
  );
}
