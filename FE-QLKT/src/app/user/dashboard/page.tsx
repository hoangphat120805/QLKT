'use client';

import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
  Statistic,
  Descriptions,
  Progress,
  Badge,
  Avatar,
  Divider,
  ConfigProvider,
  theme as antdTheme,
} from 'antd';
import {
  FileTextOutlined,
  LockOutlined,
  UserOutlined,
  TrophyOutlined,
  StarOutlined,
  CalendarOutlined,
  TeamOutlined,
  SafetyOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

const { Title, Text, Paragraph } = Typography;

export default function UserDashboard() {
  const { theme } = useTheme();
  const [displayName, setDisplayName] = useState('Quân nhân');
  const [personnelInfo, setPersonnelInfo] = useState<any>(null);
  const [annualProfile, setAnnualProfile] = useState<any>(null);
  const [serviceProfile, setServiceProfile] = useState<any>(null);
  const [contributionProfile, setContributionProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError('');

        // Lấy thông tin user từ localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user) {
          const name = (user.ho_ten || '').trim();
          const username = (user.username || '').trim();
          setDisplayName(name || username || 'Người dùng');
        }

        if (!user?.quan_nhan_id) {
          setError('Không tìm thấy thông tin quân nhân.');
          return;
        }

        // Lấy thông tin cá nhân
        const personnelRes = await apiClient.getPersonnelById(user.quan_nhan_id);
        if (personnelRes.success) {
          setPersonnelInfo(personnelRes.data);
        }

        const current_year = new Date().getFullYear();

        // Lấy hồ sơ hằng năm
        const annualRes = await apiClient.getAnnualProfile(user.quan_nhan_id, current_year);
        if (annualRes.success) {
          setAnnualProfile(annualRes.data);
        }

        // Lấy hồ sơ niên hạn
        const serviceRes = await apiClient.getServiceProfile(user.quan_nhan_id);
        if (serviceRes.success) {
          setServiceProfile(serviceRes.data);
        }

        const contributionRes = await apiClient.getContributionProfile(user.quan_nhan_id);
        if (contributionRes.success) {
          setContributionProfile(contributionRes.data);
        }
      } catch (err: any) {
        console.error('Error fetching profiles:', err);
        setError(err.message || 'Không thể tải hồ sơ. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Calculate service years
  const calculateServiceYears = () => {
    if (!personnelInfo?.ngay_nhap_ngu) return 0;
    const startDate = new Date(personnelInfo.ngay_nhap_ngu);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
  };

  // callculate service month when the years are calculated
  const calculateServiceMonths = () => {
    if (!personnelInfo?.ngay_nhap_ngu) return 0;
    const startDate = new Date(personnelInfo.ngay_nhap_ngu);
    const today = new Date();
    let months;
    months = (today.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += today.getMonth();
    months = months % 12;
    return months;
  };

  const serviceYears = calculateServiceYears();
  const serviceMonths = calculateServiceMonths();

  // Calculate progress for medals
  const getProgressData = (status: string, current: number, target: number) => {
    if (status === 'DA_NHAN') return { percent: 100, color: '#52c41a' };
    if (status === 'DU_DIEU_KIEN') return { percent: 100, color: '#1890ff' };
    const percent = Math.min((current / target) * 100, 100);
    return { percent, color: '#faad14' };
  };

  if (loading) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <div
          className={`flex items-center justify-center min-h-screen ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-900 to-gray-800'
              : 'bg-gradient-to-br from-blue-50 to-indigo-50'
          }`}
        >
          <Space direction="vertical" align="center" size="large">
            <Spin size="large" />
            <Text type="secondary">Đang tải thông tin...</Text>
          </Space>
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
      <div
        className={`min-h-screen ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        }`}
      >
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Hero Header with Avatar */}
          <Card
            style={{
              borderRadius: '12px',
              boxShadow:
                theme === 'dark' ? '0 4px 16px rgba(0, 0, 0, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              border: 'none',
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div
              style={{
                background:
                  theme === 'dark'
                    ? 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)'
                    : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                padding: '32px',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#2563eb',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                  }}
                />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      marginBottom: '12px',
                      color: '#ffffff',
                      fontSize: '28px',
                    }}
                  >
                    Xin chào, {personnelInfo?.ho_ten || displayName}!
                  </Title>
                  <Space size="large" wrap style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    <Space>
                      <TeamOutlined />
                      <span>
                        {personnelInfo?.DonViTrucThuoc?.ten_don_vi ||
                          personnelInfo?.CoQuanDonVi?.ten_don_vi ||
                          'N/A'}
                      </span>
                    </Space>
                    <Space>
                      <SafetyOutlined />
                      <span>{personnelInfo?.ChucVu?.ten_chuc_vu || 'N/A'}</span>
                    </Space>
                    <Space>
                      <CalendarOutlined />
                      <span>{serviceYears} năm phục vụ</span>
                    </Space>
                  </Space>
                </div>
              </div>
            </div>
          </Card>

          {error && <Alert message={error} type="error" showIcon className="shadow-sm" />}

          {/* Statistics Overview */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
              <Card
              hoverable
              style={{
                borderRadius: '10px',
                boxShadow:
                  theme === 'dark' ? '0 1px 6px rgba(0, 0, 0, 0.35)' : '0 1px 4px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: theme === 'dark' ? '#1e3a8a' : '#e6f0ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow:
                  theme === 'dark'
                        ? '0 1px 3px rgba(59, 130, 246, 0.3)'
                        : '0 1px 3px rgba(59, 130, 246, 0.2)',
                  }}
              >
                  <StarOutlined
                    style={{
                      fontSize: '26px',
                      color: theme === 'dark' ? '#60a5fa' : '#2563eb',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: '4px',
                      color: theme === 'dark' ? '#cbd5e1' : '#475569',
                    }}
                  >
                    Tổng CSTDCS
                  </Text>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: theme === 'dark' ? '#e5e7eb' : '#0f172a',
                      lineHeight: '1.1',
                    }}
                  >
                    {annualProfile?.tong_cstdcs || 0}
                  </div>
                </div>
              </div>
              </Card>

              <Card
              hoverable
              style={{
                borderRadius: '10px',
                boxShadow:
                  theme === 'dark' ? '0 1px 6px rgba(0, 0, 0, 0.35)' : '0 1px 4px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: theme === 'dark' ? '#0b3d2e' : '#e8f5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow:
                  theme === 'dark'
                        ? '0 1px 3px rgba(16, 185, 129, 0.3)'
                        : '0 1px 3px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <RocketOutlined
                    style={{
                      fontSize: '26px',
                      color: theme === 'dark' ? '#34d399' : '#059669',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: '4px',
                      color: theme === 'dark' ? '#cbd5e1' : '#475569',
                    }}
                  >
                      Tổng NCKH
                  </Text>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: theme === 'dark' ? '#e5e7eb' : '#0f172a',
                      lineHeight: '1.1',
                    }}
                  >
                    {Array.isArray(annualProfile?.tong_nckh)
                      ? annualProfile.tong_nckh.length
                      : annualProfile?.tong_nckh || 0}
                  </div>
                </div>
              </div>
              </Card>

              <Card
              hoverable
              style={{
                borderRadius: '10px',
                boxShadow:
                  theme === 'dark' ? '0 1px 6px rgba(0, 0, 0, 0.35)' : '0 1px 4px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: theme === 'dark' ? '#78350f' : '#fef9c3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow:
                  theme === 'dark'
                        ? '0 1px 3px rgba(234, 179, 8, 0.3)'
                        : '0 1px 3px rgba(234, 179, 8, 0.2)',
                  }}
                >
                  <TrophyOutlined
                    style={{
                      fontSize: '26px',
                      color: theme === 'dark' ? '#fbbf24' : '#d97706',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: '4px',
                      color: theme === 'dark' ? '#cbd5e1' : '#475569',
                    }}
                  >
                      CSTDCS liên tục
                  </Text>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: theme === 'dark' ? '#e5e7eb' : '#0f172a',
                      lineHeight: '1.1',
                    }}
                  >
                    {annualProfile?.cstdcs_lien_tuc || 0}
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 'normal',
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                        marginLeft: '4px',
                      }}
                    >
                      năm
                    </span>
                  </div>
                </div>
              </div>
              </Card>

              <Card
              hoverable
              style={{
                borderRadius: '10px',
                boxShadow:
                  theme === 'dark' ? '0 1px 6px rgba(0, 0, 0, 0.35)' : '0 1px 4px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: theme === 'dark' ? '#3b0764' : '#f3e8ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow:
                  theme === 'dark'
                        ? '0 1px 3px rgba(139, 92, 246, 0.3)'
                        : '0 1px 3px rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <ClockCircleOutlined
                    style={{
                      fontSize: '26px',
                      color: theme === 'dark' ? '#a78bfa' : '#7c3aed',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: '4px',
                      color: theme === 'dark' ? '#cbd5e1' : '#475569',
                    }}
                  >
                      Tháng cống hiến
                  </Text>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: theme === 'dark' ? '#e5e7eb' : '#0f172a',
                      lineHeight: '1.2',
                    }}
                  >
                    <div>{serviceYears} năm</div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 'normal',
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      {serviceMonths} tháng
                    </div>
                  </div>
                </div>
              </div>
              </Card>
          </div>

          {/* Personal Info Card */}
          {personnelInfo && (
            <Card
              title={
                <Space>
                  <UserOutlined className="text-blue-600" />
                  <span className="font-semibold">Thông tin cá nhân</span>
                </Space>
              }
              className="shadow-md border-0"
            >
              <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="middle">
                <Descriptions.Item label="Họ tên" labelStyle={{ fontWeight: 500 }}>
                  <Text strong>{personnelInfo.ho_ten}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="CCCD" labelStyle={{ fontWeight: 500 }}>
                  {personnelInfo.cccd}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh" labelStyle={{ fontWeight: 500 }}>
                  {personnelInfo.ngay_sinh ? formatDate(personnelInfo.ngay_sinh) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Đơn vị" labelStyle={{ fontWeight: 500 }}>
                  <Badge
                    color="blue"
                    text={
                      personnelInfo.DonViTrucThuoc?.ten_don_vi ||
                      personnelInfo.CoQuanDonVi?.ten_don_vi ||
                      'N/A'
                    }
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Cấp bậc" labelStyle={{ fontWeight: 500 }}>
                  <Badge color="purple" text={personnelInfo.cap_bac || 'N/A'} />
                </Descriptions.Item>
                <Descriptions.Item label="Chức vụ" labelStyle={{ fontWeight: 500 }}>
                  <Badge color="green" text={personnelInfo.ChucVu?.ten_chuc_vu || 'N/A'} />
                </Descriptions.Item>
                <Descriptions.Item label="Ngày nhập ngũ" labelStyle={{ fontWeight: 500 }}>
                  {personnelInfo.ngay_nhap_ngu ? formatDate(personnelInfo.ngay_nhap_ngu) : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Profile Cards */}
          <Row gutter={[16, 16]}>
            {/* Annual Profile Card */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <TrophyOutlined className="text-orange-600" />
                    <span className="font-semibold">Hồ sơ Khen thưởng Hằng năm</span>
                  </Space>
                }
                className="shadow-md border-0 h-full"
              >
                {annualProfile ? (
                  <Space direction="vertical" className="w-full" size="large">
                    {annualProfile.goi_y && (
                      <Alert
                        message={<span className="font-semibold">Đề xuất khen thưởng</span>}
                        description={annualProfile.goi_y}
                        type="info"
                        showIcon
                        icon={<RocketOutlined />}
                        className={
                          theme === 'dark'
                            ? 'border-blue-700 bg-blue-900/30'
                            : 'border-blue-200 bg-blue-50'
                        }
                      />
                    )}

                    <Divider orientation="left" className="!my-4">
                      <Text strong className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Tiến độ đạt được
                      </Text>
                    </Divider>

                    {/* Progress for BKBQP */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Text strong>Bằng khen BQP</Text>
                        <Badge
                          status={annualProfile.du_dieu_kien_bkbqp ? 'success' : 'default'}
                          text={annualProfile.du_dieu_kien_bkbqp ? 'Đủ điều kiện' : 'Chưa đủ'}
                        />
                      </div>
                      <Progress
                        percent={
                          annualProfile.du_dieu_kien_bkbqp
                            ? 100
                            : Math.min((annualProfile.cstdcs_lien_tuc / 2) * 100, 100)
                        }
                        status={annualProfile.du_dieu_kien_bkbqp ? 'success' : 'active'}
                        strokeColor={annualProfile.du_dieu_kien_bkbqp ? '#52c41a' : '#1890ff'}
                        format={percent => `${annualProfile.cstdcs_lien_tuc || 0}/2 năm`}
                      />
                      <Text type="secondary" className="text-xs">
                        Yêu cầu: 2 năm CSTDCS liên tục + 1 NCKH trong 2 năm đó (NCKH hiện có:{' '}
                        {annualProfile.tong_nckh || 0})
                      </Text>
                    </div>

                    {/* Progress for CSTDTQ */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Text strong>CSTĐ Toàn quân</Text>
                        <Badge
                          status={annualProfile.du_dieu_kien_cstdtq ? 'success' : 'default'}
                          text={annualProfile.du_dieu_kien_cstdtq ? 'Đủ điều kiện' : 'Chưa đủ'}
                        />
                      </div>
                      <Progress
                        percent={
                          annualProfile.du_dieu_kien_cstdtq
                            ? 100
                            : Math.min((annualProfile.cstdcs_lien_tuc / 3) * 100, 100)
                        }
                        status={annualProfile.du_dieu_kien_cstdtq ? 'success' : 'active'}
                        strokeColor={annualProfile.du_dieu_kien_cstdtq ? '#52c41a' : '#faad14'}
                        format={percent => `${annualProfile.cstdcs_lien_tuc || 0}/3 năm`}
                      />
                      <Text type="secondary" className="text-xs">
                        Yêu cầu: 3 năm CSTDCS liên tục + 1 NCKH năm thứ 3 + 1 NCKH năm 1 hoặc 2
                        (NCKH hiện có: {annualProfile.tong_nckh || 0})
                      </Text>
                    </div>
                  </Space>
                ) : (
                  <Alert message="Chưa có dữ liệu hồ sơ hằng năm" type="warning" showIcon />
                )}
              </Card>
            </Col>

            {/* Service Profile Card */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <SafetyOutlined className="text-purple-600" />
                    <span className="font-semibold">Hồ sơ Khen thưởng Niên hạn</span>
                  </Space>
                }
                className="shadow-md border-0 h-full"
              >
                {serviceProfile ? (
                  <Space direction="vertical" className="w-full" size="large">
                    {serviceProfile.goi_y && (
                      <Alert
                        message={<span className="font-semibold">Đề xuất khen thưởng</span>}
                        description={serviceProfile.goi_y}
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                        className={
                          theme === 'dark'
                            ? 'border-green-700 bg-green-900/30'
                            : 'border-green-200 bg-green-50'
                        }
                      />
                    )}

                    <Divider orientation="left" className="!my-4">
                      <Text strong className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Huân chương Chiến sỹ Vẻ vang
                      </Text>
                    </Divider>

                    {/* HCCSVV - Hạng Ba */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Text strong>Hạng Ba (10 năm)</Text>
                        <Badge
                          status={
                            serviceProfile.hccsvv_hang_ba_status === 'DA_NHAN'
                              ? 'success'
                              : serviceProfile.hccsvv_hang_ba_status === 'DU_DIEU_KIEN'
                              ? 'processing'
                              : 'default'
                          }
                          text={
                            serviceProfile.hccsvv_hang_ba_status === 'DA_NHAN'
                              ? 'Đã nhận'
                              : serviceProfile.hccsvv_hang_ba_status === 'DU_DIEU_KIEN'
                              ? 'Đủ điều kiện'
                              : 'Chưa đủ'
                          }
                        />
                      </div>
                      <Progress
                        {...getProgressData(serviceProfile.hccsvv_hang_ba_status, serviceYears, 10)}
                        format={() => `${serviceYears}/10 năm`}
                      />
                    </div>

                    {/* HCCSVV - Hạng Nhì */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Text strong>Hạng Nhì (15 năm)</Text>
                        <Badge
                          status={
                            serviceProfile.hccsvv_hang_nhi_status === 'DA_NHAN'
                              ? 'success'
                              : serviceProfile.hccsvv_hang_nhi_status === 'DU_DIEU_KIEN'
                              ? 'processing'
                              : 'default'
                          }
                          text={
                            serviceProfile.hccsvv_hang_nhi_status === 'DA_NHAN'
                              ? 'Đã nhận'
                              : serviceProfile.hccsvv_hang_nhi_status === 'DU_DIEU_KIEN'
                              ? 'Đủ điều kiện'
                              : 'Chưa đủ'
                          }
                        />
                      </div>
                      <Progress
                        {...getProgressData(
                          serviceProfile.hccsvv_hang_nhi_status,
                          serviceYears,
                          15
                        )}
                        format={() => `${serviceYears}/15 năm`}
                      />
                    </div>

                    {/* HCCSVV - Hạng Nhất */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Text strong>Hạng Nhất (20 năm)</Text>
                        <Badge
                          status={
                            serviceProfile.hccsvv_hang_nhat_status === 'DA_NHAN'
                              ? 'success'
                              : serviceProfile.hccsvv_hang_nhat_status === 'DU_DIEU_KIEN'
                              ? 'processing'
                              : 'default'
                          }
                          text={
                            serviceProfile.hccsvv_hang_nhat_status === 'DA_NHAN'
                              ? 'Đã nhận'
                              : serviceProfile.hccsvv_hang_nhat_status === 'DU_DIEU_KIEN'
                              ? 'Đủ điều kiện'
                              : 'Chưa đủ'
                          }
                        />
                      </div>
                      <Progress
                        {...getProgressData(
                          serviceProfile.hccsvv_hang_nhat_status,
                          serviceYears,
                          20
                        )}
                        format={() => `${serviceYears}/20 năm`}
                      />
                    </div>

                    <Divider orientation="left" className="!my-4">
                      <Text strong className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Huân chương Bảo vệ Tổ quốc
                      </Text>
                    </Divider>

                    {/* HCBVTQ - Hạng Ba */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Text strong>Hạng Ba (180 tháng)</Text>
                        <Badge
                          status={
                            contributionProfile.hcbvtq_hang_ba_status === 'DA_NHAN'
                              ? 'success'
                              : contributionProfile.hcbvtq_hang_ba_status === 'DU_DIEU_KIEN'
                              ? 'processing'
                              : 'default'
                          }
                          text={
                            contributionProfile.hcbvtq_hang_ba_status === 'DA_NHAN'
                              ? 'Đã nhận'
                              : contributionProfile.hcbvtq_hang_ba_status === 'DU_DIEU_KIEN'
                              ? 'Đủ điều kiện'
                              : 'Chưa đủ'
                          }
                        />
                      </div>
                      <Progress
                        {...getProgressData(
                          contributionProfile.hcbvtq_hang_ba_status,
                          contributionProfile.months_07 + contributionProfile.months_08 || 0,
                          180
                        )}
                        format={() =>
                          `${
                            contributionProfile.months_07 + contributionProfile.months_08 || 0
                          }/180 tháng`
                        }
                      />
                    </div>

                    {/* HCBVTQ - Hạng Nhì */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Text strong>Hạng Nhì (240 tháng)</Text>
                        <Badge
                          status={
                            contributionProfile.hcbvtq_hang_nhi_status === 'DA_NHAN'
                              ? 'success'
                              : contributionProfile.hcbvtq_hang_nhi_status === 'DU_DIEU_KIEN'
                              ? 'processing'
                              : 'default'
                          }
                          text={
                            contributionProfile.hcbvtq_hang_nhi_status === 'DA_NHAN'
                              ? 'Đã nhận'
                              : contributionProfile.hcbvtq_hang_nhi_status === 'DU_DIEU_KIEN'
                              ? 'Đủ điều kiện'
                              : 'Chưa đủ'
                          }
                        />
                      </div>
                      <Progress
                        {...getProgressData(
                          contributionProfile.hcbvtq_hang_nhi_status,
                          contributionProfile.months_08 + contributionProfile.months_0910 || 0,
                          240
                        )}
                        format={() =>
                          `${
                            contributionProfile.months_08 + contributionProfile.months_0910 || 0
                          }/240 tháng`
                        }
                      />
                    </div>

                    {/* HCBVTQ - Hạng Nhất */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Text strong>Hạng Nhất (300 tháng)</Text>
                        <Badge
                          status={
                            contributionProfile.hcbvtq_hang_nhat_status === 'DA_NHAN'
                              ? 'success'
                              : contributionProfile.hcbvtq_hang_nhat_status === 'DU_DIEU_KIEN'
                              ? 'processing'
                              : 'default'
                          }
                          text={
                            contributionProfile.hcbvtq_hang_nhat_status === 'DA_NHAN'
                              ? 'Đã nhận'
                              : contributionProfile.hcbvtq_hang_nhat_status === 'DU_DIEU_KIEN'
                              ? 'Đủ điều kiện'
                              : 'Chưa đủ'
                          }
                        />
                      </div>
                      <Progress
                        {...getProgressData(
                          contributionProfile.hcbvtq_hang_nhat_status,
                          contributionProfile.months_0910 || 0,
                          300
                        )}
                        format={() => `${contributionProfile.months_0910 || 0}/300 tháng`}
                      />
                    </div>
                  </Space>
                ) : (
                  <Alert message="Chưa có dữ liệu hồ sơ niên hạn" type="warning" showIcon />
                )}
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Card
            title={
              <Space>
                <RocketOutlined className="text-blue-600" />
                <span className="font-semibold">Thao tác nhanh</span>
              </Space>
            }
            className="shadow-md border-0"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Link href="/user/profile" className="block">
                  <Card
                    hoverable
                    className={`text-center h-full ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-700'
                        : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                    }`}
                  >
                    <FileTextOutlined className="text-4xl text-blue-600 mb-3" />
                    <Title level={5} className="!mb-1">
                      Lịch sử chi tiết
                    </Title>
                    <Text type="secondary" className="text-sm">
                      Xem đầy đủ thông tin hồ sơ
                    </Text>
                  </Card>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Link href="/user/settings" className="block">
                  <Card
                    hoverable
                    className={`text-center h-full ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-700'
                        : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
                    }`}
                  >
                    <LockOutlined className="text-4xl text-purple-600 mb-3" />
                    <Title level={5} className="!mb-1">
                      Đổi mật khẩu
                    </Title>
                    <Text type="secondary" className="text-sm">
                      Cập nhật mật khẩu bảo mật
                    </Text>
                  </Card>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  className={`text-center h-full cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-700'
                      : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  }`}
                  onClick={() => window.location.reload()}
                >
                  <CheckCircleOutlined className="text-4xl text-green-600 mb-3" />
                  <Title level={5} className="!mb-1">
                    Làm mới dữ liệu
                  </Title>
                  <Text type="secondary" className="text-sm">
                    Cập nhật thông tin mới nhất
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Footer Info */}
          <div className="text-center py-6">
            <Text type="secondary" className="text-sm">
              Dữ liệu được cập nhật lần cuối: {formatDateTime(new Date())}
            </Text>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
