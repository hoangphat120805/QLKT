'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Typography,
  Tag,
  Breadcrumb,
  Spin,
  Alert,
  message,
  Space,
  Descriptions,
} from 'antd';
import {
  HomeOutlined,
  TrophyOutlined,
  StarOutlined,
  HistoryOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { calculateDuration, formatDate } from '@/lib/utils';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [personnelId, setPersonnelId] = useState<string | null>(null);
  const [personnelInfo, setPersonnelInfo] = useState<any>(null);
  const [annualRewards, setAnnualRewards] = useState<any[]>([]);
  const [scientificAchievements, setScientificAchievements] = useState<any[]>([]);
  const [positionHistory, setPositionHistory] = useState<any[]>([]);
  const [serviceProfile, setServiceProfile] = useState<any>(null);
  const [annualProfile, setAnnualProfile] = useState<any>(null);
  const [contributionProfile, setContributionProfile] = useState<any>(null);
  const [militaryFlag, setMilitaryFlag] = useState<any>(null);
  const [commemorationMedals, setCommemorationMedals] = useState<any>(null);

  const calculateYearsOfService = (ngayNhapNgu: string) => {
    if (!ngayNhapNgu) return 0;
    const now = new Date();
    const nhapNgu = new Date(ngayNhapNgu);
    return Math.floor((now.getTime() - nhapNgu.getTime()) / (1000 * 60 * 60 * 24 * 365));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy thông tin user từ localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!user?.quan_nhan_id) {
          message.error('Không tìm thấy thông tin quân nhân.');
          return;
        }

        setPersonnelId(user.quan_nhan_id);
        const currentYear = new Date().getFullYear();

        // Lấy dữ liệu song song
        const [
          personnelRes,
          annualRes,
          scientificRes,
          positionRes,
          serviceRes,
          annualProfileRes,
          contributionRes,
          militaryRes,
          commRes,
        ] = await Promise.all([
          apiClient.getPersonnelById(user.quan_nhan_id),
          apiClient.getAnnualRewardsByPersonnel(user.quan_nhan_id),
          apiClient.getPersonnelScientificAchievements(user.quan_nhan_id),
          apiClient.getPositionHistory(user.quan_nhan_id),
          apiClient.getServiceProfile(user.quan_nhan_id),
          apiClient.getAnnualProfile(user.quan_nhan_id, currentYear),
          apiClient.getContributionProfile(user.quan_nhan_id),
          apiClient.getMilitaryFlagByPersonnel(user.quan_nhan_id),
          apiClient.getCommemorationMedalsByPersonnel(user.quan_nhan_id),
        ]);

        if (personnelRes.success) {
          setPersonnelInfo(personnelRes.data);
        }

        if (annualRes.success) {
          setAnnualRewards(annualRes.data || []);
        }

        if (scientificRes.success) {
          setScientificAchievements(scientificRes.data || []);
        }

        if (positionRes.success) {
          setPositionHistory(positionRes.data || []);
        }

        if (serviceRes.success) {
          setServiceProfile(serviceRes.data);
        }

        if (annualProfileRes.success) {
          setAnnualProfile(annualProfileRes.data);
        }

        if (contributionRes.success) {
          setContributionProfile(contributionRes.data);
        }

        if (militaryRes.success) {
          setMilitaryFlag(militaryRes.data);
        }

        if (commRes.success) {
          setCommemorationMedals(commRes.data);
        }
      } catch (error: any) {
        console.error('Error fetching profile data:', error);
        message.error('Không thể tải dữ liệu hồ sơ');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Columns cho bảng danh hiệu hằng năm
  const annualRewardsColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 100,
      align: 'center' as const,
      sorter: (a: any, b: any) => a.nam - b.nam,
    },
    {
      title: 'Danh hiệu',
      dataIndex: 'danh_hieu',
      key: 'danh_hieu',
      render: (text: string) => {
        const colorMap: Record<string, string> = {
          CSTDCS: 'blue',
          CSTT: 'green',
          KHONG_DAT: 'red',
        };
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
      },
    },
    {
      title: 'Bằng khen BQP',
      dataIndex: 'nhan_bkbqp',
      key: 'nhan_bkbqp',
      align: 'center' as const,
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'default'}>{value ? 'Có' : 'Không'}</Tag>
      ),
    },
    {
      title: 'Số QĐ BKBQP',
      dataIndex: 'so_quyet_dinh_bkbqp',
      key: 'so_quyet_dinh_bkbqp',
      render: (text: string) => text || '-',
    },
    {
      title: 'CSTĐ Toàn quân',
      dataIndex: 'nhan_cstdtq',
      key: 'nhan_cstdtq',
      align: 'center' as const,
      render: (value: boolean) => (
        <Tag color={value ? 'blue' : 'default'}>{value ? 'Có' : 'Không'}</Tag>
      ),
    },
    {
      title: 'Số QĐ CSTDTQ',
      dataIndex: 'so_quyet_dinh_cstdtq',
      key: 'so_quyet_dinh_cstdtq',
      render: (text: string) => text || '-',
    },
  ];

  // Columns cho bảng thành tích khoa học
  const scientificColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 100,
      align: 'center' as const,
      sorter: (a: any, b: any) => a.nam - b.nam,
    },
    {
      title: 'Loại',
      dataIndex: 'loai',
      key: 'loai',
      width: 100,
      render: (text: string) => <Tag color={text === 'NCKH' ? 'purple' : 'orange'}>{text}</Tag>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'mo_ta',
      key: 'mo_ta',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (text: string) => (
        <Tag color={text === 'APPROVED' ? 'green' : 'gold'}>
          {text === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
        </Tag>
      ),
    },
  ];

  // Columns cho bảng lịch sử chức vụ
  const positionHistoryColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'ChucVu',
      key: 'ChucVu',
      render: (chucVu: any) => chucVu?.ten_chuc_vu || 'N/A',
    },
    {
      title: 'Nhóm cống hiến',
      dataIndex: 'ChucVu',
      key: 'nhom_cong_hien',
      render: (chucVu: any) => chucVu?.NhomCongHien?.ten_nhom || 'N/A',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'ngay_bat_dau',
      key: 'ngay_bat_dau',
      render: (date: string) => (date ? formatDate(date) : 'N/A'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'ngay_ket_thuc',
      key: 'ngay_ket_thuc',
      render: (date: string) => (date ? formatDate(date) : 'Hiện tại'),
    },
    {
      title: 'Thời gian',
      key: 'duration',
      align: 'center' as const,
      render: (_: any, record: any) => {
        if (!record.ngay_bat_dau) return '-';
        return calculateDuration(record.ngay_bat_dau, record.ngay_ket_thuc);
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link href="/manager/dashboard">
            <HomeOutlined />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Lịch sử chi tiết</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div>
        <Title level={2}>
          <UserOutlined /> Lịch sử chi tiết
        </Title>
        <Text type="secondary">Xem lịch sử danh hiệu, thành tích khoa học và chức vụ của bạn</Text>
      </div>

      {/* Thông tin cá nhân */}
      {personnelInfo && (
        <Card className="shadow-sm" bodyStyle={{ padding: '24px' }}>
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="middle">
            <Descriptions.Item label="Họ và tên" labelStyle={{ fontWeight: 600 }}>
              <Text strong style={{ fontSize: '16px' }}>
                {personnelInfo.ho_ten || '-'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Cấp bậc" labelStyle={{ fontWeight: 600 }}>
              {personnelInfo.cap_bac ? (
                <Tag color="purple" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {personnelInfo.cap_bac}
                </Tag>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Chức vụ" labelStyle={{ fontWeight: 600 }}>
              {personnelInfo.ChucVu?.ten_chuc_vu ? (
                <Tag color="green">{personnelInfo.ChucVu.ten_chuc_vu}</Tag>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="CCCD" labelStyle={{ fontWeight: 600 }}>
              {personnelInfo.cccd || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị" labelStyle={{ fontWeight: 600 }}>
              {personnelInfo.DonViTrucThuoc?.ten_don_vi ||
                personnelInfo.CoQuanDonVi?.ten_don_vi ||
                '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh" labelStyle={{ fontWeight: 600 }}>
              {personnelInfo.ngay_sinh ? formatDate(personnelInfo.ngay_sinh) : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Tabs */}
      <Card className="shadow-sm" bodyStyle={{ padding: '24px', overflow: 'visible' }}>
        <Tabs defaultActiveKey="1" size="large">
          {/* Tab 2: Thành tích khoa học */}
          <TabPane
            tab={
              <Space>
                <StarOutlined />
                Thành tích khoa học
              </Space>
            }
            key="2"
          >
            <div className="mb-4">
              <Text strong>Tổng số: {scientificAchievements.length}</Text>
            </div>
            <Table
              dataSource={scientificAchievements}
              columns={scientificColumns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: total => `Tổng ${total} bản ghi`,
              }}
              scroll={{ x: 800 }}
              bordered
              locale={{
                emptyText: (
                  <Alert
                    message="Chưa có dữ liệu"
                    description="Bạn chưa có thành tích khoa học nào"
                    type="info"
                    showIcon
                  />
                ),
              }}
            />
          </TabPane>

          {/* Tab 3: Lịch sử chức vụ */}
          <TabPane
            tab={
              <Space>
                <HistoryOutlined />
                Lịch sử chức vụ
              </Space>
            }
            key="3"
          >
            <div className="mb-4">
              <Text strong>Tổng số: {positionHistory.length}</Text>
            </div>
            <Table
              dataSource={positionHistory}
              columns={positionHistoryColumns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: total => `Tổng ${total} bản ghi`,
              }}
              scroll={{ x: 900 }}
              bordered
              locale={{
                emptyText: (
                  <Alert
                    message="Chưa có dữ liệu"
                    description="Bạn chưa có lịch sử chức vụ nào"
                    type="info"
                    showIcon
                  />
                ),
              }}
            />
          </TabPane>

          {/* Tab 4: Hồ sơ Niên hạn */}
          <TabPane tab={<Space>🎖️ Hồ sơ Niên hạn</Space>} key="4">
            {serviceProfile ? (
              <div className="space-y-6 w-full">
                {/* Huân chương Chiến sỹ Vẻ vang */}
                <div className="w-full">
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--ant-color-text)',
                      marginBottom: '16px',
                    }}
                  >
                    Huân chương Chiến sỹ Vẻ vang
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                    {/* HC Chiến sỹ VV - Hạng Ba */}
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
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
                            Ngày: {formatDate(serviceProfile.hccsvv_hang_ba_ngay)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HC Chiến sỹ VV - Hạng Nhì */}
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
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
                            Ngày: {formatDate(serviceProfile.hccsvv_hang_nhi_ngay)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HC Chiến sỹ VV - Hạng Nhất */}
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
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
                            Ngày: {formatDate(serviceProfile.hccsvv_hang_nhat_ngay)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Huân chương Bảo vệ Tổ quốc */}
                <div className="w-full">
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--ant-color-text)',
                      marginBottom: '16px',
                    }}
                  >
                    Huân chương Bảo vệ Tổ quốc
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
                    {/* Tháng cống hiến tích lũy */}
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
                        Tháng cống hiến tích lũy 0.7
                      </div>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 500,
                          color: 'var(--ant-color-text)',
                        }}
                      >
                        {contributionProfile?.months_07 || 0} tháng
                      </div>
                    </div>

                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
                        Tháng cống hiến tích lũy 0.8
                      </div>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 500,
                          color: 'var(--ant-color-text)',
                        }}
                      >
                        {contributionProfile?.months_08 || 0} tháng
                      </div>
                    </div>

                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
                        Tháng cống hiến tích lũy 0.9-1.0
                      </div>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 500,
                          color: 'var(--ant-color-text)',
                        }}
                      >
                        {contributionProfile?.months_0910 || 0} tháng
                      </div>
                    </div>

                    {/* HC Bảo vệ TQ - Hạng Ba */}
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
                        HC Bảo vệ TQ - Hạng Ba
                      </div>
                      <Tag
                        color={
                          contributionProfile?.hcbvtq_hang_ba_status === 'DA_NHAN'
                            ? 'green'
                            : contributionProfile?.hcbvtq_hang_ba_status === 'DU_DIEU_KIEN'
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
                        {contributionProfile?.hcbvtq_hang_ba_status === 'DA_NHAN'
                          ? 'Đã nhận'
                          : contributionProfile?.hcbvtq_hang_ba_status === 'DU_DIEU_KIEN'
                          ? 'Đủ điều kiện'
                          : 'Chưa đủ điều kiện'}
                      </Tag>
                    </div>

                    {/* HC Bảo vệ TQ - Hạng Nhì */}
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
                        HC Bảo vệ TQ - Hạng Nhì
                      </div>
                      <Tag
                        color={
                          contributionProfile?.hcbvtq_hang_nhi_status === 'DA_NHAN'
                            ? 'green'
                            : contributionProfile?.hcbvtq_hang_nhi_status === 'DU_DIEU_KIEN'
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
                        {contributionProfile?.hcbvtq_hang_nhi_status === 'DA_NHAN'
                          ? 'Đã nhận'
                          : contributionProfile?.hcbvtq_hang_nhi_status === 'DU_DIEU_KIEN'
                          ? 'Đủ điều kiện'
                          : 'Chưa đủ điều kiện'}
                      </Tag>
                    </div>

                    {/* HC Bảo vệ TQ - Hạng Nhất */}
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
                        HC Bảo vệ TQ - Hạng Nhất
                      </div>
                      <Tag
                        color={
                          contributionProfile?.hcbvtq_hang_nhat_status === 'DA_NHAN'
                            ? 'green'
                            : contributionProfile?.hcbvtq_hang_nhat_status === 'DU_DIEU_KIEN'
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
                        {contributionProfile?.hcbvtq_hang_nhat_status === 'DA_NHAN'
                          ? 'Đã nhận'
                          : contributionProfile?.hcbvtq_hang_nhat_status === 'DU_DIEU_KIEN'
                          ? 'Đủ điều kiện'
                          : 'Chưa đủ điều kiện'}
                      </Tag>
                    </div>
                  </div>
                </div>

                {/* Huân chương Quân kỳ Quyết thắng */}
                <div className="w-full">
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--ant-color-text)',
                      marginBottom: '16px',
                    }}
                  >
                    Huân chương Quân kỳ Quyết thắng
                  </h3>
                  <div className="grid grid-cols-1 gap-4 w-full">
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
                        Huân chương Quân kỳ Quyết thắng
                      </div>
                      <div className="space-y-2">
                        {militaryFlag && militaryFlag.hasReceived ? (
                          <Tag
                            color="green"
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
                            Đã nhận
                          </Tag>
                        ) : (
                          <div>
                            <Tag
                              color="default"
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
                              HC QKQT 25 năm
                            </Tag>
                            {(() => {
                              const yearsRequired = 25;
                              const yearsOfService = calculateYearsOfService(
                                personnelInfo?.ngay_nhap_ngu
                              );
                              const eligible = yearsOfService >= yearsRequired;
                              return eligible ? (
                                <Tag color="orange" style={{ marginLeft: 8 }}>
                                  Đủ điều kiện
                                </Tag>
                              ) : (
                                <Tag color="default" style={{ marginLeft: 8 }}>
                                  Chưa đủ ({yearsOfService}/{yearsRequired} năm)
                                </Tag>
                              );
                            })()}
                          </div>
                        )}
                        {militaryFlag &&
                          militaryFlag.hasReceived &&
                          militaryFlag.data &&
                          militaryFlag.data.length > 0 &&
                          militaryFlag.data[0].ngay_cap && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Ngày: {formatDate(militaryFlag.data[0].ngay_cap)}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kỷ niệm chương Vì sự nghiệp xây dựng QĐNDVN */}
                <div className="w-full">
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--ant-color-text)',
                      marginBottom: '16px',
                    }}
                  >
                    Kỷ niệm chương Vì sự nghiệp xây dựng Quân đội Nhân dân Việt Nam
                  </h3>
                  <div className="grid grid-cols-1 gap-4 w-full">
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
                        Kỷ niệm chương Vì sự nghiệp xây dựng QĐNDVN
                      </div>
                      <div className="space-y-2">
                        {commemorationMedals && commemorationMedals.hasReceived ? (
                          <Tag
                            color="green"
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
                            Đã nhận
                          </Tag>
                        ) : (
                          <div>
                            <Tag
                              color="default"
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
                              KNC VSNXD QDNDVN {personnelInfo?.gioi_tinh === 'NAM' ? 25 : 20} năm
                            </Tag>
                            {(() => {
                              const yearsRequired = personnelInfo?.gioi_tinh === 'NAM' ? 25 : 20;
                              const yearsOfService = calculateYearsOfService(
                                personnelInfo?.ngay_nhap_ngu
                              );
                              const eligible = yearsOfService >= yearsRequired;
                              return eligible ? (
                                <Tag color="orange" style={{ marginLeft: 8 }}>
                                  Đủ điều kiện
                                </Tag>
                              ) : (
                                <Tag color="default" style={{ marginLeft: 8 }}>
                                  Chưa đủ ({yearsOfService}/{yearsRequired} năm)
                                </Tag>
                              );
                            })()}
                          </div>
                        )}
                        {commemorationMedals &&
                          commemorationMedals.hasReceived &&
                          commemorationMedals.data &&
                          commemorationMedals.data.length > 0 &&
                          commemorationMedals.data[0].ngay_cap && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Ngày: {formatDate(commemorationMedals.data[0].ngay_cap)}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gợi ý */}
                {serviceProfile.goi_y && (
                  <div
                    className="w-full p-4 border rounded-lg"
                    style={{
                      borderColor: 'var(--ant-color-border)',
                      backgroundColor: 'var(--ant-color-info-bg)',
                    }}
                  >
                    <div
                      className="text-sm font-semibold mb-2"
                      style={{ color: 'var(--ant-color-text-secondary)' }}
                    >
                      💡 Gợi ý
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: 'var(--ant-color-text)',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {serviceProfile.goi_y}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert
                message="Chưa có dữ liệu"
                description="Hồ sơ niên hạn chưa được tính toán"
                type="info"
                showIcon
              />
            )}
          </TabPane>

          {/* Tab 5: Hồ sơ Hằng năm */}
          <TabPane tab={<Space>🏅 Hồ sơ Hằng năm</Space>} key="5">
            {annualProfile ? (
              <div className="space-y-6 w-full">
                {/* Thống kê */}
                <div className="w-full">
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--ant-color-text)',
                      marginBottom: '16px',
                    }}
                  >
                    Thống kê
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                    {/* Tổng CSTDCS */}
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
                        Tổng CSTDCS
                      </div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {annualProfile.tong_cstdcs || 0}{' '}
                        <span className="text-base font-normal">năm</span>
                      </div>
                    </div>

                    {/* CSTDCS liên tục */}
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
                        CSTDCS liên tục
                      </div>
                      <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                        {annualProfile.cstdcs_lien_tuc || 0}{' '}
                        <span className="text-base font-normal">năm</span>
                      </div>
                    </div>

                    {/* Tổng ĐTKH/SKKH */}
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
                        Tổng ĐTKH/SKKH
                      </div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {annualProfile.tong_nckh || 0}{' '}
                        <span className="text-base font-normal"></span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Điều kiện khen thưởng */}
                <div className="w-full">
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--ant-color-text)',
                      marginBottom: '16px',
                    }}
                  >
                    Điều kiện khen thưởng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Điều kiện BKBQP */}
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
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
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: 'var(--ant-color-border)',
                        backgroundColor: 'var(--ant-color-bg-container)',
                      }}
                    >
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: 'var(--ant-color-text-secondary)' }}
                      >
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
                  <div
                    className="w-full p-4 border rounded-lg"
                    style={{
                      borderColor: 'var(--ant-color-border)',
                      backgroundColor: 'var(--ant-color-info-bg)',
                    }}
                  >
                    <div
                      className="text-sm font-semibold mb-2"
                      style={{ color: 'var(--ant-color-text-secondary)' }}
                    >
                      💡 Gợi ý
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: 'var(--ant-color-text)',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {annualProfile.goi_y}
                    </div>
                  </div>
                )}

                <Table
                  dataSource={annualRewards}
                  columns={annualRewardsColumns}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showTotal: total => `Tổng ${total} bản ghi`,
                  }}
                  scroll={{ x: 1000 }}
                  bordered
                  locale={{
                    emptyText: (
                      <Alert
                        message="Chưa có dữ liệu"
                        description="Bạn chưa có danh hiệu hằng năm nào"
                        type="info"
                        showIcon
                      />
                    ),
                  }}
                />
              </div>
            ) : (
              <Alert
                message="Chưa có dữ liệu"
                description="Hồ sơ hằng năm chưa được tính toán"
                type="info"
                showIcon
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
