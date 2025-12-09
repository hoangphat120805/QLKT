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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  LeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api-client';
import { downloadDecisionFile } from '@/utils/downloadDecisionFile';

const { Title, Paragraph } = Typography;

interface AchievementRecord {
  id: string;
  nam: number;
  loai: string;
  mo_ta: string;
  so_quyet_dinh?: string;
  file_quyet_dinh?: string;
}

export default function ScientificAchievementsPage() {
  const params = useParams();
  const personnelId = params?.id as string;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<any>(null);
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
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
        ghi_chu: achievement.ghi_chu || '',
      });
    } else {
      setEditingAchievement(null);
      form.setFieldsValue({
        nam: new Date().getFullYear().toString(),
        loai: '',
        mo_ta: '',
        ghi_chu: '',
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

      // Lấy chức vụ và cấp bậc từ thông tin quân nhân
      const chucVu = personnel?.ChucVu?.ten_chuc_vu || null;
      const capBac = personnel?.cap_bac || null;

      console.log('Personnel data:', personnel);
      console.log('Cap bac:', capBac);
      console.log('Chuc vu:', chucVu);

      const payload = {
        nam: parseInt(values.nam),
        loai: values.loai,
        mo_ta: values.mo_ta,
        cap_bac: capBac,
        chuc_vu: chucVu,
        ghi_chu: values.ghi_chu || null,
        status: 'PENDING',
      };

      console.log('Payload:', payload);

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

  const handleOpenDecisionFile = async (soQuyetDinh: string) => {
    await downloadDecisionFile(soQuyetDinh);
  };

  const columns: ColumnsType<AchievementRecord> = [
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 80,
    },
    {
      title: 'Loại',
      dataIndex: 'loai',
      key: 'loai',
      width: 150,
      render: (text: string) => {
        const map: Record<string, string> = {
          DTKH: 'ĐTKH',
          SKKH: 'SKKH',
        };
        return map[text] || text || '-';
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'mo_ta',
      key: 'mo_ta',
      width: 400,
      render: (text: string) => text || '-',
      ellipsis: true,
    },
    {
      title: 'Số quyết định',
      dataIndex: 'so_quyet_dinh',
      key: 'so_quyet_dinh',
      width: 150,
      align: 'center',
      render: (so_quyet_dinh: string, record: AchievementRecord) => {
        return (
          <a
            onClick={() => handleOpenDecisionFile(so_quyet_dinh!)}
            style={{ color: '#52c41a', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {so_quyet_dinh || 'N/A'}
          </a>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <Link href="/admin/dashboard">
            <HomeOutlined />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href="/admin/personnel">Quân nhân</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href={`/admin/personnel/${personnelId}`}>{personnel?.ho_ten}</Link>
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
            <Link href={`/admin/personnel/${personnelId}`}>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenDialog()}>
          Thêm thành tích
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
        title={editingAchievement ? 'Sửa thành tích khoa học' : 'Thêm thành tích khoa học mới'}
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
            label="Loại thành tích"
            rules={[{ required: true, message: 'Vui lòng chọn loại thành tích' }]}
          >
            <Select
              placeholder="Chọn loại thành tích"
              size="large"
              popupMatchSelectWidth={false}
              styles={{ popup: { root: { minWidth: 'max-content' } } }}
            >
              <Select.Option value="DTKH">Đề tài khoa học (ĐTKH)</Select.Option>
              <Select.Option value="SKKH">Sáng kiến khoa học (SKKH)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="mo_ta"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea placeholder="Nhập mô tả chi tiết (nếu có)" rows={4} size="large" />
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

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalOpen}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteId(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Paragraph>
          Bạn có chắc chắn muốn xóa thành tích khoa học này? Hành động này không thể hoàn tác.
        </Paragraph>
      </Modal>
    </div>
  );
}
