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
import type { ColumnsType } from 'antd';
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
}

export default function AnnualRewardsPage() {
  const params = useParams();
  const personnelId = params?.id as string;
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
        cap_bac: reward.cap_bac || undefined,
        chuc_vu: reward.chuc_vu || '',
        ghi_chu: reward.ghi_chu || '',
      });
    } else {
      setEditingReward(null);
      form.setFieldsValue({
        nam: new Date().getFullYear().toString(),
        danh_hieu: '',
        cap_bac: undefined,
        chuc_vu: '',
        ghi_chu: '',
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

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await apiClient.deleteAnnualReward(deleteId);

      if (res.success) {
        message.success('Xóa khen thưởng thành công');
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
    },
    {
      title: 'Danh hiệu',
      dataIndex: 'danh_hieu',
      key: 'danh_hieu',
      width: 200,
      render: (text: string) => text || '-',
    },
    {
      title: 'Cấp bậc',
      dataIndex: 'cap_bac',
      key: 'cap_bac',
      width: 120,
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
      title: 'Số quyết định',
      dataIndex: 'so_quyet_dinh',
      key: 'so_quyet_dinh',
      width: 200,
      render: (text: string, record: RewardRecord) => {
        if (!text) return '-';

        if (record.file_quyet_dinh) {
          return (
            <a
              onClick={() => handleOpenDecisionFile(text, record.file_quyet_dinh)}
              style={{ color: '#52c41a', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {text}
            </a>
          );
        }

        return <span style={{ color: '#999' }}>{text}</span>;
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
            <Link href={`/admin/personnel/${personnelId}`}>
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
            dataSource={rewards}
            rowKey="id"
            pagination={false}
            locale={{
              emptyText: 'Chưa có dữ liệu khen thưởng',
            }}
          />
        </Card>
      )}

      {/* Form Modal */}
      <Modal
        title={editingReward ? 'Sửa khen thưởng' : 'Thêm khen thưởng mới'}
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
            name="danh_hieu"
            label="Danh hiệu"
            rules={[{ required: true, message: 'Vui lòng chọn danh hiệu' }]}
          >
            <Select placeholder="Chọn danh hiệu" size="large">
              <Select.Option value="CSTDCS">Chiến sĩ thi đua cơ sở (CSTDCS)</Select.Option>
              <Select.Option value="CSTT">Chiến sĩ tốt (CSTT)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="cap_bac" label="Cấp bậc (tại thời điểm đề nghị)">
            <Select placeholder="Chọn cấp bậc" size="large" allowClear>
              <Select.Option value="Thượng tá">Thượng tá</Select.Option>
              <Select.Option value="Trung tá">Trung tá</Select.Option>
              <Select.Option value="Thiếu tá">Thiếu tá</Select.Option>
              <Select.Option value="Đại úy">Đại úy</Select.Option>
              <Select.Option value="Thượng úy">Thượng úy</Select.Option>
              <Select.Option value="Trung úy">Trung úy</Select.Option>
              <Select.Option value="Thiếu úy">Thiếu úy</Select.Option>
              <Select.Option value="Thượng sĩ">Thượng sĩ</Select.Option>
              <Select.Option value="Trung sĩ">Trung sĩ</Select.Option>
              <Select.Option value="Hạ sĩ">Hạ sĩ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="chuc_vu" label="Chức vụ (tại thời điểm đề nghị)">
            <Input placeholder="Nhập chức vụ" size="large" />
          </Form.Item>

          <Form.Item name="ghi_chu" label="Ghi chú">
            <Input.TextArea
              placeholder="Ghi chú (ví dụ: chuyển từ đơn vị khác)"
              rows={3}
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseDialog} disabled={submitting}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingReward ? 'Cập nhật' : 'Tạo mới'}
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
          Bạn có chắc chắn muốn xóa khen thưởng này? Hành động này không thể hoàn tác.
        </Paragraph>
      </Modal>
    </div>
  );
}
