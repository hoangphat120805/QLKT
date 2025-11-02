'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, DatePicker, Button, Spin, Alert, message } from 'antd';
import { UserOutlined, IdcardOutlined, CalendarOutlined, SaveOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { apiClient } from '@/lib/api-client';
import axiosInstance from '@/utils/axiosInstance';

export default function ProfileEditForm() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [personnelData, setPersonnelData] = useState<any>(null);
  const [showTempCCCDWarning, setShowTempCCCDWarning] = useState(false);

  useEffect(() => {
    loadPersonnelData();
  }, []);

  const loadPersonnelData = async () => {
    try {
      setLoading(true);

      // Lấy thông tin user từ token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        message.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }

      // Decode JWT để lấy quan_nhan_id
      const payload = JSON.parse(atob(token.split('.')[1]));
      const { quan_nhan_id } = payload;

      if (!quan_nhan_id) {
        message.error('Không tìm thấy thông tin quân nhân');
        return;
      }

      // Lấy thông tin personnel
      const response = await apiClient.getPersonnelById(String(quan_nhan_id));

      if (response.success && response.data) {
        setPersonnelData(response.data);

        // Kiểm tra CCCD tạm thời
        if (response.data.cccd?.startsWith('TEMP-')) {
          setShowTempCCCDWarning(true);
        }

        // Set form values (hỗ trợ cả 2 format: don_vi/DonVi và chuc_vu/ChucVu)
        form.setFieldsValue({
          ho_ten: response.data.ho_ten,
          cccd: response.data.cccd,
          ngay_sinh: response.data.ngay_sinh ? dayjs(response.data.ngay_sinh) : null,
          ngay_nhap_ngu: response.data.ngay_nhap_ngu ? dayjs(response.data.ngay_nhap_ngu) : null,
          don_vi: response.data.DonVi?.ten_don_vi || response.data.don_vi?.ten_don_vi || 'Chưa có thông tin',
          chuc_vu: response.data.ChucVu?.ten_chuc_vu || response.data.chuc_vu?.ten_chuc_vu || 'Chưa có thông tin',
        });
      }
    } catch (error: any) {
      console.error('Load personnel error:', error);
      const errorMessage = error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || 'Không thể tải thông tin cá nhân';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);

      if (!personnelData?.id) {
        message.error('Không tìm thấy ID quân nhân');
        return;
      }

      // Chuẩn bị dữ liệu (hỗ trợ cả 2 format: don_vi/DonVi và chuc_vu/ChucVu)
      const payload = {
        ho_ten: values.ho_ten,
        cccd: values.cccd,
        ngay_sinh: values.ngay_sinh ? dayjs(values.ngay_sinh).format('YYYY-MM-DD') : null,
        ngay_nhap_ngu: values.ngay_nhap_ngu
          ? dayjs(values.ngay_nhap_ngu).format('YYYY-MM-DD')
          : null,
        don_vi_id: personnelData.DonVi?.id || personnelData.don_vi?.id || personnelData.don_vi_id,
        chuc_vu_id: personnelData.ChucVu?.id || personnelData.chuc_vu?.id || personnelData.chuc_vu_id,
      };

      // Gọi API update
      const response = await apiClient.updatePersonnel(String(personnelData.id), payload);

      if (response.success) {
        message.success('Cập nhật thông tin thành công!');

        // Ẩn cảnh báo CCCD tạm nếu đã cập nhật
        if (!values.cccd?.startsWith('TEMP-')) {
          setShowTempCCCDWarning(false);
        }

        // Reload data
        await loadPersonnelData();
      } else {
        message.error(response.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      const errorMessage = error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || 'Đã xảy ra lỗi khi cập nhật';
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-2xl" />
            <span className="text-2xl font-bold">Thông tin cá nhân</span>
          </div>
        }
        className="shadow-lg"
      >
        <p className="text-gray-600 mb-6">
          Vui lòng cập nhật đầy đủ thông tin cá nhân, đặc biệt là <strong>CCCD</strong> và{' '}
          <strong>Ngày nhập ngũ</strong> để hệ thống tính toán khen thưởng chính xác.
        </p>

        {showTempCCCDWarning && (
          <Alert
            message="Cảnh báo: CCCD chưa được cập nhật"
            description="Bạn đang sử dụng CCCD tạm thời. Vui lòng cập nhật CCCD chính thức của bạn ngay."
            type="warning"
            showIcon
            closable
            className="mb-6"
            onClose={() => setShowTempCCCDWarning(false)}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Họ tên */}
            <Form.Item
              label="Họ và tên"
              name="ho_ten"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập họ và tên"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            {/* CCCD */}
            <Form.Item
              label="Số CCCD/CMND"
              name="cccd"
              rules={[
                { required: true, message: 'Vui lòng nhập CCCD!' },
                {
                  pattern: /^[0-9]{9,12}$/,
                  message: 'CCCD phải là số từ 9-12 chữ số!',
                },
              ]}
            >
              <Input
                prefix={<IdcardOutlined />}
                placeholder="Nhập số CCCD/CMND"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            {/* Ngày sinh */}
            <Form.Item label="Ngày sinh" name="ngay_sinh">
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                size="large"
                className="w-full rounded-lg"
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>

            {/* Ngày nhập ngũ */}
            <Form.Item
              label="Ngày nhập ngũ"
              name="ngay_nhap_ngu"
              rules={[{ required: true, message: 'Vui lòng chọn ngày nhập ngũ!' }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày nhập ngũ"
                size="large"
                className="w-full rounded-lg"
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>

            {/* Đơn vị (disabled - không cho user tự sửa) */}
            <Form.Item
              label="Đơn vị"
              name="don_vi"
              extra={
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <InfoCircleOutlined className="text-amber-500" />
                  Chỉ quản trị viên mới có thể thay đổi đơn vị
                </span>
              }
            >
              <Input
                disabled
                size="large"
                className="rounded-lg bg-gray-50"
              />
            </Form.Item>

            {/* Chức vụ (disabled - không cho user tự sửa) */}
            <Form.Item
              label="Chức vụ"
              name="chuc_vu"
              extra={
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <InfoCircleOutlined className="text-amber-500" />
                  Chỉ quản trị viên mới có thể thay đổi chức vụ
                </span>
              }
            >
              <Input
                disabled
                size="large"
                className="rounded-lg bg-gray-50"
              />
            </Form.Item>
          </div>

          {/* Submit Button */}
          <Form.Item className="mb-0 mt-6">
            <div className="flex justify-end">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SaveOutlined />}
                loading={saving}
                className="w-full md:w-auto min-w-[200px] rounded-lg h-12 text-lg font-semibold"
              >
                Cập nhật thông tin
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
