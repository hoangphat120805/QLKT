'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Breadcrumb,
  Popconfirm,
  message,
  Spin,
  ConfigProvider,
  theme as antdTheme,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  LeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api-client';
import axiosInstance from '@/utils/axiosInstance';
import { useTheme } from '@/components/theme-provider';

const { Title, Paragraph } = Typography;

interface RewardRecord {
  id: string;
  nam: number;
  danh_hieu: string;
  cap_bac?: string;
  chuc_vu?: string;
  ghi_chu?: string;
  so_quyet_dinh?: string;
  file_quyet_dinh?: string;
  nhan_bkbqp: boolean;
  so_quyet_dinh_bkbqp?: string;
  file_quyet_dinh_bkbqp?: string;
  nhan_cstdtq: boolean;
  so_quyet_dinh_cstdtq?: string;
  file_quyet_dinh_cstdtq?: string;
}

export default function AnnualRewardsPage() {
  const params = useParams();
  const personnelId = params?.id as string;
  const { theme } = useTheme();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<any>(null);
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [personnelId]);

  async function loadData() {
    try {
      setLoading(true);
      const [personnelRes, rewardsRes] = await Promise.all([
        apiClient.getPersonnelById(personnelId),
        apiClient.getAnnualRewardsByPersonnel(personnelId),
      ]);

      if (personnelRes.success) {
        setPersonnel(personnelRes.data);
      }
      if (rewardsRes.success) {
        setRewards(rewardsRes.data || []);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (reward?: any) => {
    if (reward) {
      setEditingReward(reward);
      form.setFieldsValue({
        nam: reward.nam?.toString() || new Date().getFullYear().toString(),
        danh_hieu: reward.danh_hieu || '',
      });
    } else {
      setEditingReward(null);
      form.setFieldsValue({
        nam: new Date().getFullYear().toString(),
        danh_hieu: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingReward(null);
    form.resetFields();
  };

  const onSubmit = async (values: any) => {
    try {
      setSubmitting(true);

      const payload = {
        nam: parseInt(values.nam),
        danh_hieu: values.danh_hieu,
        cap_bac: values.cap_bac || null,
        chuc_vu: values.chuc_vu || null,
        ghi_chu: values.ghi_chu || null,
      };

      const res = editingReward
        ? await apiClient.updateAnnualReward(editingReward.id, payload)
        : await apiClient.createAnnualReward(personnelId, payload);

      if (res.success) {
        message.success(
          editingReward ? 'Cập nhật khen thưởng thành công' : 'Thêm khen thưởng thành công'
        );
        handleCloseDialog();
        loadData();
      } else {
        message.error(res.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDecisionFile = async (soQuyetDinh: string, filePath?: string | null) => {
    try {
      let filename: string | null = null;

      // Nếu đã có file_path trong record, dùng luôn
      if (filePath) {
        filename = filePath.split('/').pop() || null;
      } else {
        // Nếu chưa có file_path, tìm từ DB dựa trên số quyết định
        const response = await apiClient.getDecisionBySoQuyetDinh(soQuyetDinh);
        if (response.success && response.data?.file_path) {
          filename = response.data.file_path.split('/').pop() || null;
        }
      }

      if (filename) {
        // Tải file về bằng axios với responseType: 'blob'
        const response = await axiosInstance.get(`/api/proposals/uploads/${filename}`, {
          responseType: 'blob',
        });
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `${soQuyetDinh}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        message.success('Tải file thành công');
      } else {
        message.warning('Không tìm thấy file quyết định');
      }
    } catch (error: any) {
      console.error('Error downloading decision file:', error);
      message.error('Lỗi khi tải file quyết định');
    }
  };

  const columns: ColumnsType<RewardRecord> = [
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 100,
      align: 'center',
    },
    {
      title: 'Danh hiệu',
      dataIndex: 'danh_hieu',
      key: 'danh_hieu',
      width: 200,
      align: 'center',
      render: (text: string) => text || '-',
    },
    {
      title: 'Cấp bậc',
      dataIndex: 'cap_bac',
      key: 'cap_bac',
      width: 120,
      align: 'center',
      render: (text: string) => text || '-',
    },
    {
      title: 'Chức vụ',
      dataIndex: 'chuc_vu',
      key: 'chuc_vu',
      width: 180,
      render: (text: string) => text || '-',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghi_chu',
      key: 'ghi_chu',
      width: 200,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Nhận BKBQP',
      dataIndex: 'nhan_bkbqp',
      key: 'nhan_bkbqp',
      width: 120,
      align: 'center',
      render: (value: boolean) => (value ? <Tag color="green">Có</Tag> : <Tag>Không</Tag>),
    },
    {
      title: 'Nhận CSTDTQ',
      dataIndex: 'nhan_cstdtq',
      key: 'nhan_cstdtq',
      width: 120,
      align: 'center',
      render: (value: boolean) => (value ? <Tag color="green">Có</Tag> : <Tag>Không</Tag>),
    },
    {
      title: 'Số quyết định',
      dataIndex: 'so_quyet_dinh',
      key: 'so_quyet_dinh',
      width: 300,
      align: 'center',
      render: (text: string, record: RewardRecord) => {
        const items = [];

        if (record.so_quyet_dinh) {
          items.push(
            <div key="general">
              {record.so_quyet_dinh.trim() !== '' ? (
                record.file_quyet_dinh ? (
                  <a
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenDecisionFile(record.so_quyet_dinh!, record.file_quyet_dinh);
                    }}
                    style={{
                      color: '#52c41a',
                      fontWeight: 500,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    {record.so_quyet_dinh}
                  </a>
                ) : (
                  <span style={{ color: '#999', fontWeight: 400 }}>{record.so_quyet_dinh}</span>
                )
              ) : (
                <span style={{ color: '#999', fontWeight: 400 }}>Chưa có</span>
              )}
            </div>
          );
        }
        if (record.so_quyet_dinh_bkbqp) {
          items.push(
            <div key="bkbqp">
              BKBQP:{' '}
              {record.so_quyet_dinh_bkbqp.trim() !== '' ? (
                record.file_quyet_dinh_bkbqp ? (
                  <a
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenDecisionFile(
                        record.so_quyet_dinh_bkbqp!,
                        record.file_quyet_dinh_bkbqp
                      );
                    }}
                    style={{
                      color: '#52c41a',
                      fontWeight: 500,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    {record.so_quyet_dinh_bkbqp}
                  </a>
                ) : (
                  <span style={{ color: '#999', fontWeight: 400 }}>
                    {record.so_quyet_dinh_bkbqp}
                  </span>
                )
              ) : (
                <span style={{ color: '#999', fontWeight: 400 }}>Chưa có</span>
              )}
            </div>
          );
        }

        if (record.so_quyet_dinh_cstdtq) {
          items.push(
            <div key="cstdtq">
              CSTDTQ:{' '}
              {record.so_quyet_dinh_cstdtq.trim() !== '' ? (
                record.file_quyet_dinh_cstdtq ? (
                  <a
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenDecisionFile(
                        record.so_quyet_dinh_cstdtq!,
                        record.file_quyet_dinh_cstdtq
                      );
                    }}
                    style={{
                      color: '#52c41a',
                      fontWeight: 500,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    {record.so_quyet_dinh_cstdtq}
                  </a>
                ) : (
                  <span style={{ color: '#999', fontWeight: 400 }}>
                    {record.so_quyet_dinh_cstdtq}
                  </span>
                )
              ) : (
                <span style={{ color: '#999', fontWeight: 400 }}>Chưa có</span>
              )}
            </div>
          );
        }

        return items.length > 0 ? <div>{items}</div> : '-';
      },
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <div style={{ padding: '24px' }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link href="/manager/dashboard">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/manager/personnel">Quân nhân</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={`/manager/personnel/${personnelId}`}>{personnel?.ho_ten}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Khen thưởng hàng năm</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <Space style={{ marginBottom: 8 }}>
              <Link href={`/manager/personnel/${personnelId}`}>
                <Button icon={<LeftOutlined />}>Quay lại</Button>
              </Link>
            </Space>
            <Title level={2} style={{ marginTop: 8, marginBottom: 8 }}>
              Khen thưởng hàng năm
            </Title>
            {personnel && (
              <Paragraph style={{ fontSize: 14, color: '#666', marginBottom: 0 }}>
                Quân nhân: {personnel.ho_ten}
              </Paragraph>
            )}
          </div>
          <Link href={`/manager/proposals/create`}>
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm khen thưởng
            </Button>
          </Link>
        </div>

        {/* Table */}
        {loading ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#666' }}>Đang tải dữ liệu...</div>
            </div>
          </Card>
        ) : (
          <Card>
            <Table
              columns={columns}
              dataSource={rewards}
              rowKey="id"
              pagination={false}
              locale={{
                emptyText: 'Chưa có dữ liệu khen thưởng',
              }}
            />
          </Card>
        )}
      </div>
    </ConfigProvider>
  );
}
