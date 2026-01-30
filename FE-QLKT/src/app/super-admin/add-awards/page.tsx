'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  Button,
  Form,
  Select,
  InputNumber,
  Input,
  Typography,
  Breadcrumb,
  message,
  Space,
  Divider,
  AutoComplete,
  Spin,
} from 'antd';
import {
  HomeOutlined,
  TrophyOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api-client';

const { Title, Text } = Typography;

interface Personnel {
  id: string;
  cccd: string;
  ho_ten: string;
  cap_bac?: string;
  chuc_vu?: string;
  CoQuanDonVi?: { ten_don_vi: string };
  DonViTrucThuoc?: { ten_don_vi: string };
  ChucVu?: { ten_chuc_vu: string };
}

const AWARD_TYPES = [
  { value: 'HCCSVV', label: 'Huy chương Chiến sĩ Vẻ vang (HCCSVV)' },
];

const HCCSVV_RANKS = [
  { value: 'HCCSVV_HANG_BA', label: 'Huy chương Chiến sĩ Vẻ vang Hạng Ba' },
  { value: 'HCCSVV_HANG_NHI', label: 'Huy chương Chiến sĩ Vẻ vang Hạng Nhì' },
  { value: 'HCCSVV_HANG_NHAT', label: 'Huy chương Chiến sĩ Vẻ vang Hạng Nhất' },
];

export default function SuperAdminAddAwardsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [awardType, setAwardType] = useState<string>('HCCSVV');
  const [personnelOptions, setPersonnelOptions] = useState<{ value: string; label: string; personnel: Personnel }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);

  const handleSearch = async (value: string) => {
    if (!value || value.length < 2) {
      setPersonnelOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await apiClient.getPersonnel({ search: value, limit: 20 });
      if (res.success && res.data?.data) {
        const options = res.data.data.map((p: Personnel) => ({
          value: p.id,
          label: `${p.ho_ten} - ${p.cccd || 'N/A'} - ${p.CoQuanDonVi?.ten_don_vi || p.DonViTrucThuoc?.ten_don_vi || ''}`,
          personnel: p,
        }));
        setPersonnelOptions(options);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPersonnel = (value: string, option: any) => {
    const personnel = option.personnel;
    setSelectedPersonnel(personnel);
    form.setFieldsValue({
      cap_bac: personnel.cap_bac,
      chuc_vu: personnel.ChucVu?.ten_chuc_vu || '',
    });
  };

  const handleSubmit = async (values: any) => {
    if (!selectedPersonnel) {
      message.error('Vui lòng chọn quân nhân');
      return;
    }

    setLoading(true);
    try {
      let res;

      if (awardType === 'HCCSVV') {
        res = await apiClient.createHCCSVVDirect({
          quan_nhan_id: selectedPersonnel.id,
          danh_hieu: values.danh_hieu,
          nam: values.nam,
          cap_bac: values.cap_bac,
          chuc_vu: values.chuc_vu,
          so_quyet_dinh: values.so_quyet_dinh,
          ghi_chu: values.ghi_chu,
        });
      }

      if (res?.success) {
        message.success('Thêm khen thưởng thành công');
        form.resetFields();
        setSelectedPersonnel(null);
        setPersonnelOptions([]);
      } else {
        message.error(res?.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <Link href="/super-admin/dashboard">
            <HomeOutlined />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Thêm khen thưởng</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          Thêm khen thưởng quá khứ
        </Title>
        <Text type="secondary">
          Thêm khen thưởng cho quân nhân mà không cần kiểm tra điều kiện thời gian phục vụ.
          Chức năng này dùng để bổ sung dữ liệu khen thưởng đã nhận trong quá khứ.
        </Text>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            nam: new Date().getFullYear(),
          }}
        >
          {/* Loại khen thưởng */}
          <Form.Item
            label="Loại khen thưởng"
            name="award_type"
            initialValue="HCCSVV"
          >
            <Select
              options={AWARD_TYPES}
              onChange={(value) => setAwardType(value)}
              style={{ maxWidth: 400 }}
            />
          </Form.Item>

          <Divider />

          {/* Tìm kiếm quân nhân */}
          <Form.Item
            label="Quân nhân"
            name="personnel_search"
            rules={[{ required: true, message: 'Vui lòng chọn quân nhân' }]}
          >
            <AutoComplete
              options={personnelOptions}
              onSearch={handleSearch}
              onSelect={handleSelectPersonnel}
              placeholder="Nhập tên hoặc CCCD để tìm kiếm..."
              style={{ width: '100%', maxWidth: 600 }}
              notFoundContent={searchLoading ? <Spin size="small" /> : 'Không tìm thấy'}
            />
          </Form.Item>

          {selectedPersonnel && (
            <Card size="small" style={{ marginBottom: 24, maxWidth: 600, background: '#f5f5f5' }}>
              <Space direction="vertical" size={4}>
                <Text strong>{selectedPersonnel.ho_ten}</Text>
                <Text type="secondary">CCCD: {selectedPersonnel.cccd}</Text>
                <Text type="secondary">
                  Đơn vị: {selectedPersonnel.CoQuanDonVi?.ten_don_vi || selectedPersonnel.DonViTrucThuoc?.ten_don_vi || 'N/A'}
                </Text>
              </Space>
            </Card>
          )}

          <Divider />

          {/* HCCSVV Form */}
          {awardType === 'HCCSVV' && (
            <>
              <Form.Item
                label="Danh hiệu"
                name="danh_hieu"
                rules={[{ required: true, message: 'Vui lòng chọn danh hiệu' }]}
              >
                <Select
                  options={HCCSVV_RANKS}
                  placeholder="Chọn danh hiệu"
                  style={{ maxWidth: 400 }}
                />
              </Form.Item>

              <Form.Item
                label="Năm nhận"
                name="nam"
                rules={[{ required: true, message: 'Vui lòng nhập năm' }]}
              >
                <InputNumber
                  min={1950}
                  max={new Date().getFullYear()}
                  style={{ width: 150 }}
                />
              </Form.Item>

              <Form.Item
                label="Cấp bậc (tại thời điểm nhận)"
                name="cap_bac"
              >
                <Input placeholder="Ví dụ: Đại úy" style={{ maxWidth: 300 }} />
              </Form.Item>

              <Form.Item
                label="Chức vụ (tại thời điểm nhận)"
                name="chuc_vu"
              >
                <Input placeholder="Ví dụ: Trưởng phòng" style={{ maxWidth: 400 }} />
              </Form.Item>

              <Form.Item
                label="Số quyết định"
                name="so_quyet_dinh"
              >
                <Input placeholder="Ví dụ: 123/QĐ-BQP" style={{ maxWidth: 300 }} />
              </Form.Item>

              <Form.Item
                label="Ghi chú"
                name="ghi_chu"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Ghi chú thêm (nếu có)"
                  style={{ maxWidth: 600 }}
                />
              </Form.Item>
            </>
          )}

          <Divider />

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
            >
              Thêm khen thưởng
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
