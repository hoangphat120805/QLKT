'use client';

import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  Button,
  Card,
  ConfigProvider,
  Space,
  Typography,
  message,
  theme as antdTheme,
} from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { Loading } from '@/components/ui/loading';
import { apiClient } from '@/lib/api-client';

const { Title, Text } = Typography;

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString('vi-VN') : '-';

const InfoTable = ({
  items,
}: {
  items: Array<{ label: string; value?: React.ReactNode }>
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 rounded-lg">
      <tbody>
        {items.map(item => (
          <tr
            key={item.label}
            className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
          >
            <td className="px-4 py-3 text-sm font-semibold w-48 text-gray-600 dark:text-gray-400">
              {item.label}
            </td>
            <td className="px-4 py-3 text-base text-gray-800 dark:text-gray-200 break-words">
              {item.value ?? '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function ManagerPersonnelDetailPage() {
  const params = useParams();
  const personnelId = params?.id as string;
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const personnelRes = await apiClient.getPersonnelById(personnelId);

        if (personnelRes.success) {
          setPersonnel(personnelRes.data);
        } else {
          message.error(personnelRes.message || 'Không thể tải thông tin quân nhân');
          setPersonnel(null);
        }
      } catch (error: any) {
        message.error(error?.message || 'Không thể tải dữ liệu quân nhân');
        setPersonnel(null);
      } finally {
        setLoading(false);
      }
    };

    if (personnelId) {
      load();
    }
  }, [personnelId]);

  if (loading) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <Loading fullScreen message="Đang tải thông tin quân nhân..." size="large" />
      </ConfigProvider>
    );
  }

  if (!personnel) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <div className="p-6 space-y-4">
          <Title level={3}>Không tìm thấy quân nhân</Title>
          <Link href="/manager/personnel">
            <Button icon={<ArrowLeftOutlined />}>Quay lại danh sách</Button>
          </Link>
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <div className="p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { title: <Link href="/manager/dashboard">Dashboard</Link> },
            { title: <Link href="/manager/personnel">Quân nhân đơn vị</Link> },
            { title: personnel.ho_ten },
          ]}
        />

        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Space size="large">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <UserOutlined className="text-3xl text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Title level={3} className="!mb-1">
                  {personnel.ho_ten}
                </Title>
                <Text type="secondary">CCCD: {personnel.cccd || '-'}</Text>
              </div>
            </Space>
            <Link href="/manager/personnel">
              <Button icon={<ArrowLeftOutlined />}>Quay lại</Button>
            </Link>
          </div>
        </Card>

        <Card title="Thông tin cá nhân" className="shadow-sm">
          <InfoTable
            items={
              [
                { label: 'Họ và tên', value: personnel.ho_ten || '-' },
                { label: 'CCCD', value: personnel.cccd || '-' },
                { label: 'Số điện thoại', value: personnel.so_dien_thoai || '-' },
                { label: 'Ngày sinh', value: formatDate(personnel.ngay_sinh) },
                { label: 'Ngày nhập ngũ', value: formatDate(personnel.ngay_nhap_ngu) },
                { label: 'Ngày xuất ngũ', value: formatDate(personnel.ngay_xuat_ngu) },
                { label: 'Chức vụ', value: personnel.ChucVu?.ten_chuc_vu || '-' },
                { label: 'Cơ quan đơn vị', value: personnel.CoQuanDonVi?.ten_don_vi || '-' },
                // Chỉ hiển thị "Đơn vị trực thuộc" nếu không phải manager (có don_vi_truc_thuoc_id)
                personnel.don_vi_truc_thuoc_id
                  ? { label: 'Đơn vị trực thuộc', value: personnel.DonViTrucThuoc?.ten_don_vi || '-' }
                  : null,
              ].filter((item): item is { label: string; value?: React.ReactNode } => item !== null)
            }
          />
        </Card>
      </div>
    </ConfigProvider>
  );
}
