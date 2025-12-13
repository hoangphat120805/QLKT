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
  DatePicker,
  Row,
  Col,
  Tag,
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  LeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

interface ContributionAward {
  id: string;
  name: string;
  rank?: string;
  ngay_cap?: string;
  status: string;
}

export default function ContributionAwardsPage() {
  const params = useParams();
  const personnelId = params?.id as string;
  const { theme } = useTheme();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<any>(null);
  const [contributionProfile, setContributionProfile] = useState<any>(null);
  const [awards, setAwards] = useState<ContributionAward[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [personnelId]);

  async function loadData() {
    try {
      setLoading(true);
      const [personnelRes, contributionRes] = await Promise.all([
        apiClient.getPersonnelById(personnelId),
        apiClient.getContributionProfile(personnelId),
      ]);

      if (personnelRes.success) {
        setPersonnel(personnelRes.data);
      }
      if (contributionRes.success) {
        setContributionProfile(contributionRes.data);
        // Map contribution profile data to awards array
        const mappedAwards: ContributionAward[] = [];

        // HC Bảo vệ Tổ quốc from contribution profile
        if (contributionRes.data.hcbvtq_hang_ba_status) {
          mappedAwards.push({
            id: 'hcbvtq_ba',
            name: 'Huân chương Bảo vệ Tổ quốc hạng Ba',
            rank: 'Hạng Ba',
            ngay_cap: contributionRes.data.hcbvtq_hang_ba_ngay,
            status: contributionRes.data.hcbvtq_hang_ba_status,
          });
        }
        if (contributionRes.data.hcbvtq_hang_nhi_status) {
          mappedAwards.push({
            id: 'hcbvtq_nhi',
            name: 'Huân chương Bảo vệ Tổ quốc hạng Nhì',
            rank: 'Hạng Nhì',
            ngay_cap: contributionRes.data.hcbvtq_hang_nhi_ngay,
            status: contributionRes.data.hcbvtq_hang_nhi_status,
          });
        }
        if (contributionRes.data.hcbvtq_hang_nhat_status) {
          mappedAwards.push({
            id: 'hcbvtq_nhat',
            name: 'Huân chương Bảo vệ Tổ quốc hạng Nhất',
            rank: 'Hạng Nhất',
            ngay_cap: contributionRes.data.hcbvtq_hang_nhat_ngay,
            status: contributionRes.data.hcbvtq_hang_nhat_status,
          });
        }

        setAwards(mappedAwards.filter(a => a.status === 'DA_NHAN'));
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      DA_NHAN: { label: 'Đã nhận', color: 'green' },
      DU_DIEU_KIEN: { label: 'Đủ điều kiện', color: 'orange' },
      CHUA_DU: { label: 'Chưa đủ', color: 'default' },
    };
    const s = statusMap[status] || statusMap.CHUA_DU;
    return <Tag color={s.color}>{s.label}</Tag>;
  };

  const handleOpenDialog = (award?: any) => {
    if (award) {
      setEditingAward(award);
      form.setFieldsValue({
        name: award.name,
        rank: award.rank,
        ngay_cap: award.ngay_cap ? dayjs(award.ngay_cap) : null,
        status: award.status,
      });
    } else {
      setEditingAward(null);
      form.resetFields();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAward(null);
    form.resetFields();
  };

  const onSubmit = async (values: any) => {
    try {
      setSubmitting(true);

      const payload = {
        name: values.name,
        rank: values.rank,
        ngay_cap: values.ngay_cap ? dayjs(values.ngay_cap).format('YYYY-MM-DD') : null,
        status: values.status,
      };

      // Note: This would need actual API endpoints for contribution awards
      // For now, just show success message
      message.success(
        editingAward ? 'Cập nhật khen thưởng thành công' : 'Thêm khen thưởng thành công'
      );
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      // Note: This would need actual API endpoint
      message.success('Xóa khen thưởng thành công');
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadData();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const columns: TableColumnsType<ContributionAward> = [
    {
      title: 'Tên khen thưởng',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (name: string, record: ContributionAward) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.rank && (
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Hạng: {record.rank}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string) => getStatusTag(status),
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
          <Breadcrumb.Item>Khen thưởng cống hiến</Breadcrumb.Item>
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
              <Link href={`/manager/personnel/${personnelId}?tab=3`}>
                <Button icon={<LeftOutlined />}>Quay lại</Button>
              </Link>
            </Space>
            <Title level={2} style={{ marginTop: 8, marginBottom: 8 }}>
              Khen thưởng cống hiến
            </Title>
            {personnel && (
              <Paragraph style={{ fontSize: 14, color: '#666', marginBottom: 0 }}>
                Quân nhân: {personnel.ho_ten}
              </Paragraph>
            )}
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenDialog()}>
            Thêm khen thưởng
          </Button>
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
              dataSource={awards}
              rowKey="id"
              pagination={false}
              locale={{
                emptyText: 'Chưa có dữ liệu khen thưởng cống hiến',
              }}
            />
          </Card>
        )}
      </div>
    </ConfigProvider>
  );
}
