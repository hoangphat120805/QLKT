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
import { useTheme } from '@/components/theme-provider';

const { Title, Paragraph } = Typography;

interface ScientificAchievement {
  id: string;
  nam: number;
  loai: string;
  mo_ta: string;
  status?: string;
  so_quyet_dinh?: string;
  file_quyet_dinh?: string;
}

export default function ScientificAchievementsPage() {
  const params = useParams();
  const personnelId = params?.id as string;
  const { theme } = useTheme();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<any>(null);
  const [achievements, setAchievements] = useState<ScientificAchievement[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [personnelId]);

  async function loadData() {
    try {
      setLoading(true);
      const [personnelRes, achievementsRes] = await Promise.all([
        apiClient.getPersonnelById(personnelId),
        apiClient.getPersonnelScientificAchievements(personnelId),
      ]);

      if (personnelRes.success) {
        setPersonnel(personnelRes.data);
      }
      if (achievementsRes.success) {
        setAchievements(achievementsRes.data || []);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (achievement?: any) => {
    if (achievement) {
      setEditingAchievement(achievement);
      form.setFieldsValue({
        nam: achievement.nam?.toString() || new Date().getFullYear().toString(),
        loai: achievement.loai || '',
        mo_ta: achievement.mo_ta || '',
        status: achievement.status || '',
      });
    } else {
      setEditingAchievement(null);
      form.setFieldsValue({
        nam: new Date().getFullYear().toString(),
        loai: '',
        mo_ta: '',
        status: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAchievement(null);
    form.resetFields();
  };

  const onSubmit = async (values: any) => {
    try {
      setSubmitting(true);

      const payload = {
        nam: parseInt(values.nam),
        loai: values.loai,
        mo_ta: values.mo_ta,
        status: values.status || null,
      };

      const res = editingAchievement
        ? await apiClient.updateScientificAchievement(editingAchievement.id, payload)
        : await apiClient.createScientificAchievement(personnelId, payload);

      if (res.success) {
        message.success(
          editingAchievement ? 'Cập nhật thành tích thành công' : 'Thêm thành tích thành công'
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

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await apiClient.deleteScientificAchievement(deleteId);

      if (res.success) {
        message.success('Xóa thành tích thành công');
        setDeleteModalOpen(false);
        setDeleteId(null);
        loadData();
      } else {
        message.error(res.message || 'Có lỗi xảy ra khi xóa');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const columns: ColumnsType<ScientificAchievement> = [
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 100,
      align: 'center',
    },
    {
      title: 'Loại',
      dataIndex: 'loai',
      key: 'loai',
      width: 150,
      align: 'center',
      render: (text: string) => {
        const map: Record<string, string> = {
          NCKH: 'Đề tài khoa học',
          SKKH: 'Sáng kiến khoa học',
        };
        return map[text] || text || '-';
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'mo_ta',
      key: 'mo_ta',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string) => {
        if (!status) return '-';
        const color = status === 'APPROVED' ? 'green' : 'orange';
        const text = status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt';
        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: 'Số quyết định',
      dataIndex: 'so_quyet_dinh',
      key: 'so_quyet_dinh',
      width: 200,
      align: 'center',
      render: (text: string, record: ScientificAchievement) => {
        if (!text) return '-';

        // Nếu có file PDF, hiển thị link để xem
        if (record.file_quyet_dinh) {
          const pdfUrl = `${
            process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
          }/api/scientific-achievements/decision-files/${record.file_quyet_dinh}`;
          return (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              <FilePdfOutlined className="mr-1" />
              {text}
            </a>
          );
        }

        return text;
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
          <Breadcrumb.Item>Thành tích khoa học</Breadcrumb.Item>
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
              Thành tích khoa học
            </Title>
            {personnel && (
              <Paragraph style={{ fontSize: 14, color: '#666', marginBottom: 0 }}>
                Quân nhân: {personnel.ho_ten}
              </Paragraph>
            )}
          </div>
          <Link href={`/manager/proposals/create`}>
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm thành tích
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
              dataSource={achievements}
              rowKey="id"
              pagination={false}
              locale={{
                emptyText: 'Chưa có dữ liệu thành tích khoa học',
              }}
            />
          </Card>
        )}

        {/* Form Modal */}
        <Modal
          title={editingAchievement ? 'Sửa thành tích' : 'Thêm thành tích mới'}
          open={dialogOpen}
          onCancel={handleCloseDialog}
          footer={null}
          width={600}
        >
          <Form form={form} onFinish={onSubmit} layout="vertical" style={{ marginTop: 24 }}>
            <Form.Item
              name="nam"
              label="Năm"
              rules={[{ required: true, message: 'Năm không hợp lệ' }]}
            >
              <Input placeholder="Nhập năm (YYYY)" maxLength={4} size="large" />
            </Form.Item>

            <Form.Item
              name="loai"
              label="Loại"
              rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
            >
              <Select placeholder="Chọn loại" size="large">
                <Select.Option value="NCKH">Đề tài khoa học (NCKH)</Select.Option>
                <Select.Option value="SKKH">Sáng kiến khoa học (SKKH)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="mo_ta"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
              <Input.TextArea placeholder="Mô tả chi tiết về thành tích" rows={4} size="large" />
            </Form.Item>

            <Form.Item name="status" label="Trạng thái">
              <Select placeholder="Chọn trạng thái" size="large" allowClear>
                <Select.Option value="PENDING">Chờ duyệt</Select.Option>
                <Select.Option value="APPROVED">Đã duyệt</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleCloseDialog} disabled={submitting}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {editingAchievement ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
