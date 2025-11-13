'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Breadcrumb,
  ConfigProvider,
  theme as antdTheme,
  Descriptions,
  Tag,
  message,
} from 'antd';
import { Loading } from '@/components/ui/loading';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { apiClient } from '@/lib/api-client';

const { Title } = Typography;

export default function PersonnelDetailPage() {
  const { theme } = useTheme();
  const params = useParams();
  const personnelId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<any>(null);
  const [serviceProfile, setServiceProfile] = useState<any>(null);
  const [annualProfile, setAnnualProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [personnelRes, serviceRes, annualRes] = await Promise.all([
          apiClient.getPersonnelById(personnelId),
          apiClient.getServiceProfile(personnelId),
          apiClient.getAnnualProfile(personnelId),
        ]);

        if (personnelRes.success) {
          setPersonnel(personnelRes.data);
        } else {
          message.error(personnelRes.message || 'Lỗi khi lấy thông tin quân nhân');
        }

        if (serviceRes.success) {
          setServiceProfile(serviceRes.data);
        }

        if (annualRes.success) {
          setAnnualProfile(annualRes.data);
        }
      } catch (error: any) {
        message.error(error.message || 'Lỗi khi lấy thông tin');
      } finally {
        setLoading(false);
      }
    };

    if (personnelId) {
      fetchData();
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
      <div className="space-y-4 p-6">
        <Title level={2}>Không tìm thấy quân nhân</Title>
        <Link href="/admin/personnel">
          <Button icon={<ArrowLeftOutlined />}>Quay lại</Button>
        </Link>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { title: <Link href="/admin/dashboard">Dashboard</Link> },
            { title: <Link href="/admin/personnel">Quân nhân</Link> },
            { title: `#${personnel.id}` },
          ]}
          className="mb-2 sm:mb-0"
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Link href="/admin/personnel">
              <Button icon={<ArrowLeftOutlined />} size="middle" className="w-full sm:w-auto">
                Quay lại
              </Button>
            </Link>
            <Title level={2} className="!mb-0 text-lg sm:text-2xl">
              Chi tiết Quân nhân
            </Title>
          </div>
          <Space wrap className="w-full sm:w-auto">
            <Link
              href={`/admin/personnel/${personnelId}/edit`}
              className="block sm:inline-block w-full sm:w-auto"
            >
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="middle"
                className="w-full sm:w-auto"
              >
                Chỉnh sửa
              </Button>
            </Link>
          </Space>
        </div>

        {/* Personnel Information Card */}
        <Card title="Thông tin cá nhân" className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Descriptions
              bordered
              column={{ xs: 1, sm: 1, md: 2, lg: 2 }}
              size="middle"
              labelStyle={{ fontWeight: 600, minWidth: '120px' }}
              contentStyle={{ padding: '12px 16px', wordBreak: 'break-word', maxWidth: '100%' }}
            >
              <Descriptions.Item label="ID">{personnel.id}</Descriptions.Item>
              <Descriptions.Item label="Họ và tên">{personnel.ho_ten}</Descriptions.Item>
              <Descriptions.Item label="CCCD">{personnel.cccd}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {personnel.ngay_sinh
                  ? new Date(personnel.ngay_sinh).toLocaleDateString('vi-VN')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nhập ngũ">
                {personnel.ngay_nhap_ngu
                  ? new Date(personnel.ngay_nhap_ngu).toLocaleDateString('vi-VN')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Đơn vị">
                {personnel.DonVi?.ten_don_vi || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Chức vụ">
                {personnel.ChucVu?.ten_chuc_vu || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Card>

        {/* Quick Links Card */}
        <Card title="Quản lý chi tiết" className="shadow-sm">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Link href={`/admin/personnel/${personnelId}/position-history`}>
                <Button block size="large" type="default">
                  📋 Lịch sử chức vụ
                </Button>
              </Link>
              <Link href={`/admin/personnel/${personnelId}/annual-rewards`}>
                <Button block size="large" type="default">
                  🏆 Danh hiệu hằng năm
                </Button>
              </Link>
              <Link href={`/admin/personnel/${personnelId}/scientific-achievements`}>
                <Button block size="large" type="default">
                  🔬 Thành tích khoa học
                </Button>
              </Link>
            </div>
          </Space>
        </Card>

        {/* Service Profile Card - Hồ sơ Niên hạn */}
        {serviceProfile && (
          <Card
            title="🎖️ Hồ sơ Niên hạn (Khen thưởng theo thâm niên)"
            className="shadow-sm"
            bodyStyle={{ padding: '24px', overflow: 'visible' }}
          >
            <div className="space-y-6 w-full">
              {/* Huân chương Chiến sỹ Vẻ vang */}
              <div className="w-full">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Huân chương Chiến sỹ Vẻ vang
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                  {/* HC Chiến sỹ VV - Hạng Ba */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      HC Chiến sỹ VV - Hạng Ba
                    </div>
                    <div className="space-y-2">
                      <Tag
                        color={
                          serviceProfile.hccsvv_hang_ba_status === 'DA_NHAN'
                            ? 'green'
                            : serviceProfile.hccsvv_hang_ba_status === 'DU_DIEU_KIEN'
                              ? 'orange'
                              : 'default'
                        }
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          padding: '4px 12px',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          display: 'inline-block',
                          maxWidth: '100%',
                        }}
                      >
                        {serviceProfile.hccsvv_hang_ba_status === 'DA_NHAN'
                          ? 'Đã nhận'
                          : serviceProfile.hccsvv_hang_ba_status === 'DU_DIEU_KIEN'
                            ? 'Đủ điều kiện'
                            : 'Chưa đủ điều kiện'}
                      </Tag>
                      {serviceProfile.hccsvv_hang_ba_ngay && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Ngày:{' '}
                          {new Date(serviceProfile.hccsvv_hang_ba_ngay).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HC Chiến sỹ VV - Hạng Nhì */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      HC Chiến sỹ VV - Hạng Nhì
                    </div>
                    <div className="space-y-2">
                      <Tag
                        color={
                          serviceProfile.hccsvv_hang_nhi_status === 'DA_NHAN'
                            ? 'green'
                            : serviceProfile.hccsvv_hang_nhi_status === 'DU_DIEU_KIEN'
                              ? 'orange'
                              : 'default'
                        }
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          padding: '4px 12px',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          display: 'inline-block',
                          maxWidth: '100%',
                        }}
                      >
                        {serviceProfile.hccsvv_hang_nhi_status === 'DA_NHAN'
                          ? 'Đã nhận'
                          : serviceProfile.hccsvv_hang_nhi_status === 'DU_DIEU_KIEN'
                            ? 'Đủ điều kiện'
                            : 'Chưa đủ điều kiện'}
                      </Tag>
                      {serviceProfile.hccsvv_hang_nhi_ngay && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Ngày:{' '}
                          {new Date(serviceProfile.hccsvv_hang_nhi_ngay).toLocaleDateString(
                            'vi-VN'
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HC Chiến sỹ VV - Hạng Nhất */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      HC Chiến sỹ VV - Hạng Nhất
                    </div>
                    <div className="space-y-2">
                      <Tag
                        color={
                          serviceProfile.hccsvv_hang_nhat_status === 'DA_NHAN'
                            ? 'green'
                            : serviceProfile.hccsvv_hang_nhat_status === 'DU_DIEU_KIEN'
                              ? 'orange'
                              : 'default'
                        }
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          padding: '4px 12px',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          display: 'inline-block',
                          maxWidth: '100%',
                        }}
                      >
                        {serviceProfile.hccsvv_hang_nhat_status === 'DA_NHAN'
                          ? 'Đã nhận'
                          : serviceProfile.hccsvv_hang_nhat_status === 'DU_DIEU_KIEN'
                            ? 'Đủ điều kiện'
                            : 'Chưa đủ điều kiện'}
                      </Tag>
                      {serviceProfile.hccsvv_hang_nhat_ngay && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Ngày:{' '}
                          {new Date(serviceProfile.hccsvv_hang_nhat_ngay).toLocaleDateString(
                            'vi-VN'
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Huân chương Bảo vệ Tổ quốc */}
              <div className="w-full">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Huân chương Bảo vệ Tổ quốc
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
                  {/* Tháng cống hiến tích lũy */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Tháng cống hiến tích lũy
                    </div>
                    <div className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {serviceProfile.hcbvtq_total_months || 0} tháng
                    </div>
                  </div>

                  {/* HC Bảo vệ TQ - Hạng Ba */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      HC Bảo vệ TQ - Hạng Ba
                    </div>
                    <Tag
                      color={
                        serviceProfile.hcbvtq_hang_ba_status === 'DA_NHAN'
                          ? 'green'
                          : serviceProfile.hcbvtq_hang_ba_status === 'DU_DIEU_KIEN'
                            ? 'orange'
                            : 'default'
                      }
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        padding: '4px 12px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        display: 'inline-block',
                        maxWidth: '100%',
                      }}
                    >
                      {serviceProfile.hcbvtq_hang_ba_status === 'DA_NHAN'
                        ? 'Đã nhận'
                        : serviceProfile.hcbvtq_hang_ba_status === 'DU_DIEU_KIEN'
                          ? 'Đủ điều kiện'
                          : 'Chưa đủ điều kiện'}
                    </Tag>
                  </div>

                  {/* HC Bảo vệ TQ - Hạng Nhì */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      HC Bảo vệ TQ - Hạng Nhì
                    </div>
                    <Tag
                      color={
                        serviceProfile.hcbvtq_hang_nhi_status === 'DA_NHAN'
                          ? 'green'
                          : serviceProfile.hcbvtq_hang_nhi_status === 'DU_DIEU_KIEN'
                            ? 'orange'
                            : 'default'
                      }
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        padding: '4px 12px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        display: 'inline-block',
                        maxWidth: '100%',
                      }}
                    >
                      {serviceProfile.hcbvtq_hang_nhi_status === 'DA_NHAN'
                        ? 'Đã nhận'
                        : serviceProfile.hcbvtq_hang_nhi_status === 'DU_DIEU_KIEN'
                          ? 'Đủ điều kiện'
                          : 'Chưa đủ điều kiện'}
                    </Tag>
                  </div>

                  {/* HC Bảo vệ TQ - Hạng Nhất */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      HC Bảo vệ TQ - Hạng Nhất
                    </div>
                    <Tag
                      color={
                        serviceProfile.hcbvtq_hang_nhat_status === 'DA_NHAN'
                          ? 'green'
                          : serviceProfile.hcbvtq_hang_nhat_status === 'DU_DIEU_KIEN'
                            ? 'orange'
                            : 'default'
                      }
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        padding: '4px 12px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        display: 'inline-block',
                        maxWidth: '100%',
                      }}
                    >
                      {serviceProfile.hcbvtq_hang_nhat_status === 'DA_NHAN'
                        ? 'Đã nhận'
                        : serviceProfile.hcbvtq_hang_nhat_status === 'DU_DIEU_KIEN'
                          ? 'Đủ điều kiện'
                          : 'Chưa đủ điều kiện'}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Gợi ý */}
              {serviceProfile.goi_y && (
                <div className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-blue-50 dark:bg-gray-900">
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    💡 Gợi ý
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                    {serviceProfile.goi_y}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Annual Profile Card - Hồ sơ Hằng năm */}
        {annualProfile && (
          <Card
            title="🏅 Hồ sơ Hằng năm (Khen thưởng theo thành tích)"
            className="shadow-sm"
            bodyStyle={{ padding: '24px', overflow: 'visible' }}
          >
            <div className="space-y-6 w-full">
              {/* Thống kê */}
              <div className="w-full">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Thống kê
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                  {/* Tổng CSTDCS */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Tổng CSTDCS
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {annualProfile.tong_cstdcs || 0}{' '}
                      <span className="text-base font-normal">năm</span>
                    </div>
                  </div>

                  {/* CSTDCS liên tục */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      CSTDCS liên tục
                    </div>
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                      {annualProfile.cstdcs_lien_tuc || 0}{' '}
                      <span className="text-base font-normal">năm</span>
                    </div>
                  </div>

                  {/* Tổng NCKH/SKKH */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Tổng NCKH/SKKH
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {annualProfile.tong_nckh || 0}{' '}
                      <span className="text-base font-normal">công trình</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Điều kiện khen thưởng */}
              <div className="w-full">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Điều kiện khen thưởng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {/* Điều kiện BKBQP */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Bằng khen BQP
                    </div>
                    <Tag
                      color={annualProfile.du_dieu_kien_bkbqp ? 'green' : 'default'}
                      style={{ margin: 0, fontSize: '14px', padding: '4px 12px' }}
                    >
                      {annualProfile.du_dieu_kien_bkbqp ? 'Đủ điều kiện' : 'Chưa đủ điều kiện'}
                    </Tag>
                  </div>

                  {/* Điều kiện CSTDTQ */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Chiến sỹ thi đua Toàn quân
                    </div>
                    <Tag
                      color={annualProfile.du_dieu_kien_cstdtq ? 'green' : 'default'}
                      style={{ margin: 0, fontSize: '14px', padding: '4px 12px' }}
                    >
                      {annualProfile.du_dieu_kien_cstdtq ? 'Đủ điều kiện' : 'Chưa đủ điều kiện'}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Gợi ý */}
              {annualProfile.goi_y && (
                <div className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-blue-50 dark:bg-gray-900">
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    💡 Gợi ý
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                    {annualProfile.goi_y}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </ConfigProvider>
  );
}
