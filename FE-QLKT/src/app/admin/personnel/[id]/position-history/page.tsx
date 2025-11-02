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
} from '@ant-design/icons';
import { apiClient } from '@/lib/api-client';
import { calculateDuration } from '@/lib/utils';

const { Title, Paragraph } = Typography;

interface HistoryRecord {
  id: string;
  chuc_vu_id: number;
  chuc_vu_name: string;
  ngay_bat_dau: string;
  ngay_ket_thuc?: string;
}

export default function PositionHistoryPage() {
  const params = useParams();
  const personnelId = params?.id as string;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<any>(null);
  const [histories, setHistories] = useState<HistoryRecord[]>([]);
  const [positions, setPositions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [personnelId]);

  async function loadData() {
    try {
      setLoading(true);
      const [personnelRes, historiesRes, positionsRes] = await Promise.all([
        apiClient.getPersonnelById(personnelId),
        apiClient.getPositionHistory(personnelId),
        apiClient.getPositions(),
      ]);

      if (personnelRes.success) {
        setPersonnel(personnelRes.data);
      }
      if (historiesRes.success) {
        // Map data để có chuc_vu_name từ ChucVu relation
        const mappedHistories = (historiesRes.data || []).map((h: any) => ({
          ...h,
          chuc_vu_name: h.ChucVu?.ten_chuc_vu || '-',
        }));
        setHistories(mappedHistories);
      }
      if (positionsRes.success) {
        setPositions(positionsRes.data || []);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (history?: any) => {
    if (history) {
      setEditingHistory(history);
      // Format dates to YYYY-MM-DD for input type="date"
      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      form.setFieldsValue({
        chuc_vu_id: history.chuc_vu_id?.toString(),
        ngay_bat_dau: formatDate(history.ngay_bat_dau),
        ngay_ket_thuc: history.ngay_ket_thuc ? formatDate(history.ngay_ket_thuc) : '',
      });
    } else {
      setEditingHistory(null);
      form.resetFields();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingHistory(null);
    form.resetFields();
  };

  const onSubmit = async (values: any) => {
    try {
      setSubmitting(true);

      const payload = {
        chuc_vu_id: parseInt(values.chuc_vu_id),
        ngay_bat_dau: values.ngay_bat_dau,
        ngay_ket_thuc: values.ngay_ket_thuc || undefined,
      };

      const res = editingHistory
        ? await apiClient.updatePositionHistory(editingHistory.id, payload)
        : await apiClient.createPositionHistory(personnelId, payload);

      if (res.success) {
        message.success(editingHistory ? 'Cập nhật lịch sử thành công' : 'Thêm lịch sử thành công');
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
      const res = await apiClient.deletePositionHistory(deleteId);

      if (res.success) {
        message.success('Xóa lịch sử thành công');
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

  const columns: ColumnsType<HistoryRecord> = [
    {
      title: 'Chức vụ',
      dataIndex: 'chuc_vu_name',
      key: 'chuc_vu_name',
      width: 250,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'ngay_bat_dau',
      key: 'ngay_bat_dau',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'ngay_ket_thuc',
      key: 'ngay_ket_thuc',
      width: 150,
      render: (date: string) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'Hiện tại'),
    },
    {
      title: 'Thời gian',
      key: 'duration',
      width: 200,
      render: (_, record) => calculateDuration(record.ngay_bat_dau, record.ngay_ket_thuc),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small" className="action-buttons">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenDialog(record)}
            className="action-btn"
            title="Sửa"
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa lịch sử này?"
            onConfirm={() => {
              setDeleteId(record.id);
              setDeleteModalOpen(true);
            }}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="action-btn"
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
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
          <Link href={`/admin/personnel/${personnelId}`}>#{personnelId}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Lịch sử chức vụ</Breadcrumb.Item>
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
            Lịch sử chức vụ
          </Title>
          {personnel && (
            <Paragraph style={{ fontSize: 14, color: '#666', marginBottom: 0 }}>
              Quân nhân: {personnel.ho_ten}
            </Paragraph>
          )}
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenDialog()}>
          Thêm lịch sử
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
            dataSource={histories}
            rowKey="id"
            pagination={false}
            locale={{
              emptyText: 'Chưa có dữ liệu lịch sử chức vụ',
            }}
          />
        </Card>
      )}

      {/* Form Modal */}
      <Modal
        title={editingHistory ? 'Sửa lịch sử chức vụ' : 'Thêm lịch sử chức vụ mới'}
        open={dialogOpen}
        onCancel={handleCloseDialog}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={onSubmit} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="chuc_vu_id"
            label="Chức vụ"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ' }]}
          >
            <Select placeholder="Chọn chức vụ" size="large">
              {positions.map((pos: any) => (
                <Select.Option key={pos.id} value={pos.id.toString()}>
                  {pos.ten_chuc_vu}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="ngay_bat_dau"
            label="Ngày bắt đầu"
            dependencies={['ngay_ket_thuc']}
            rules={[
              { required: true, message: 'Vui lòng chọn ngày bắt đầu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  const ngayKetThuc = getFieldValue('ngay_ket_thuc');
                  if (ngayKetThuc && new Date(value) > new Date(ngayKetThuc)) {
                    return Promise.reject(
                      new Error('Ngày bắt đầu phải trước ngày kết thúc')
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input type="date" size="large" />
          </Form.Item>

          <Form.Item
            name="ngay_ket_thuc"
            label="Ngày kết thúc (không bắt buộc)"
            dependencies={['ngay_bat_dau']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  const ngayBatDau = getFieldValue('ngay_bat_dau');
                  if (ngayBatDau && new Date(value) < new Date(ngayBatDau)) {
                    return Promise.reject(
                      new Error('Ngày kết thúc phải sau ngày bắt đầu')
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input type="date" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseDialog} disabled={submitting}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingHistory ? 'Cập nhật' : 'Tạo mới'}
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
          Bạn có chắc chắn muốn xóa lịch sử chức vụ này? Hành động này không thể hoàn tác.
        </Paragraph>
      </Modal>
    </div>
  );
}
