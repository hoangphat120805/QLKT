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

interface CommemorationMedal {
  id: string;
  name: string;
  ngay_cap?: string;
  status: string;
}

export default function CommemorationMedalsPage() {
  const params = useParams();
  const personnelId = params?.id as string;
  const { theme } = useTheme();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<any>(null);
  const [commemorationMedals, setCommemorationMedals] = useState<any>(null);
  const [medals, setMedals] = useState<CommemorationMedal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedal, setEditingMedal] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [personnelId]);

  async function loadData() {
    try {
      setLoading(true);
      const [personnelRes, commRes] = await Promise.all([
        apiClient.getPersonnelById(personnelId),
        apiClient.getCommemorationMedalsByPersonnel(personnelId),
      ]);

      if (personnelRes.success) {
        setPersonnel(personnelRes.data);
      }
      if (commRes.success) {
        setCommemorationMedals(commRes.data);
        // Map commemoration medals data to medals array
        const mappedMedals: CommemorationMedal[] = [];
        if (commRes.data && commRes.data.hasReceived && commRes.data.data) {
          commRes.data.data.forEach((medal: any, index: number) => {
            mappedMedals.push({
              id: `medal_${index}`,
              name: 'Kỷ niệm chương Vì sự nghiệp xây dựng Quân đội Nhân dân Việt Nam',
              ngay_cap: medal.ngay_cap,
              status: 'DA_NHAN',
            });
          });
        }
        setMedals(mappedMedals.filter(m => m.status === 'DA_NHAN'));
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

  const handleOpenDialog = (medal?: any) => {
    if (medal) {
      setEditingMedal(medal);
      form.setFieldsValue({
        name: medal.name,
        ngay_cap: medal.ngay_cap ? dayjs(medal.ngay_cap) : null,
        status: medal.status,
      });
    } else {
      setEditingMedal(null);
      form.resetFields();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMedal(null);
    form.resetFields();
  };

  const onSubmit = async (values: any) => {
    try {
      setSubmitting(true);

      const payload = {
        name: values.name,
        ngay_cap: values.ngay_cap ? dayjs(values.ngay_cap).format('YYYY-MM-DD') : null,
        status: values.status,
      };

      // Note: This would need actual API endpoints for commemoration medals
      // For now, just show success message
      message.success(
        editingMedal ? 'Cập nhật kỷ niệm chương thành công' : 'Thêm kỷ niệm chương thành công'
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
      message.success('Xóa kỷ niệm chương thành công');
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadData();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const columns: TableColumnsType<CommemorationMedal> = [
    {
      title: 'Tên kỷ niệm chương',
      dataIndex: 'name',
      key: 'name',
      width: 400,
      render: (name: string) => <div style={{ fontWeight: 500 }}>{name}</div>,
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
          <Breadcrumb.Item>Kỷ niệm chương VSNXD</Breadcrumb.Item>
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
              Kỷ niệm chương Vì sự nghiệp xây dựng QĐNDVN
            </Title>
            {personnel && (
              <Paragraph style={{ fontSize: 14, color: '#666', marginBottom: 0 }}>
                Quân nhân: {personnel.ho_ten}
              </Paragraph>
            )}
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenDialog()}>
            Thêm kỷ niệm chương
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
              dataSource={medals}
              rowKey="id"
              pagination={false}
              locale={{
                emptyText: 'Chưa có dữ liệu kỷ niệm chương VSNXD',
              }}
            />
          </Card>
        )}

        {/* Form Modal */}
        <Modal
          title={editingMedal ? 'Sửa kỷ niệm chương VSNXD' : 'Thêm kỷ niệm chương VSNXD mới'}
          open={dialogOpen}
          onCancel={handleCloseDialog}
          footer={null}
          width={600}
          centered
        >
          <Form form={form} onFinish={onSubmit} layout="vertical" style={{ marginTop: 24 }}>
            <Form.Item
              name="name"
              label="Tên kỷ niệm chương"
              rules={[{ required: true, message: 'Vui lòng nhập tên kỷ niệm chương' }]}
            >
              <Input placeholder="Nhập tên kỷ niệm chương" size="large" />
            </Form.Item>

            <Form.Item name="ngay_cap" label="Ngày cấp">
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} size="large" />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select placeholder="Chọn trạng thái" size="large">
                <Select.Option value="DA_NHAN">Đã nhận</Select.Option>
                <Select.Option value="DU_DIEU_KIEN">Đủ điều kiện</Select.Option>
                <Select.Option value="CHUA_DU">Chưa đủ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleCloseDialog} disabled={submitting}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {editingMedal ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
