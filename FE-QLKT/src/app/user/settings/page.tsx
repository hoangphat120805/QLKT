'use client';

import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Breadcrumb,
  message,
  Space,
  Alert,
  ConfigProvider,
  theme as antdTheme,
} from 'antd';
import { HomeOutlined, LockOutlined, SafetyOutlined, DashboardOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useTheme } from '@/components/theme-provider';

const { Title, Text } = Typography;

export default function UserSettingsPage() {
  const { theme } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (values: any) => {
    try {
      setLoading(true);

      // Kiểm tra mật khẩu mới và xác nhận
      if (values.new_password !== values.confirm_password) {
        message.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
        return;
      }

      // Gọi API đổi mật khẩu
      const result = await apiClient.changePassword(values.old_password, values.new_password);

      if (result.success) {
        message.success(result.message || 'Đổi mật khẩu thành công');
        form.resetFields();
      } else {
        message.error(result.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      message.error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <div className="space-y-6 p-6">
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: '24px' }}>
          <Breadcrumb.Item>
            <Link href="/user/dashboard">
              <DashboardOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Cài đặt</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Title
            level={2}
            style={{
              margin: 0,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SafetyOutlined style={{ fontSize: '28px', color: '#fff' }} />
            </div>
            Đổi mật khẩu
          </Title>
          <Text type="secondary" style={{ fontSize: '15px', display: 'block', marginTop: '8px' }}>
            Cập nhật mật khẩu để bảo vệ tài khoản của bạn
          </Text>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '700px' }}>
            {/* Change Password Card */}
            <Card className="shadow-lg" style={{ marginBottom: '24px' }}>
              <Alert
                message="Lưu ý bảo mật"
                description="Mật khẩu mới phải có ít nhất 6 ký tự. Không chia sẻ mật khẩu với người khác."
                type="info"
                showIcon
                style={{ marginBottom: '24px' }}
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleChangePassword}
                autoComplete="off"
              >
                <Form.Item
                  name="old_password"
                  label="Mật khẩu hiện tại"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu hiện tại"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item
                  name="new_password"
                  label="Mật khẩu mới"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu mới"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item
                  name="confirm_password"
                  label="Xác nhận mật khẩu mới"
                  dependencies={['new_password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('new_password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập lại mật khẩu mới"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button onClick={() => form.resetFields()} disabled={loading} size="large">
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      icon={<LockOutlined />}
                    >
                      {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </Card>

            {/* Security Tips Card */}
            <Card
              title={
                <Space>
                  <SafetyOutlined />
                  <span>Bảo mật tài khoản</span>
                </Space>
              }
              className="shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-green-600 mt-1">✓</div>
                  <div>
                    <Text strong>Sử dụng mật khẩu mạnh</Text>
                    <p className="text-gray-600 text-sm">
                      Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-600 mt-1">✓</div>
                  <div>
                    <Text strong>Đổi mật khẩu định kỳ</Text>
                    <p className="text-gray-600 text-sm">
                      Thay đổi mật khẩu thường xuyên để tăng cường bảo mật
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-600 mt-1">✓</div>
                  <div>
                    <Text strong>Không chia sẻ mật khẩu</Text>
                    <p className="text-gray-600 text-sm">
                      Giữ bí mật mật khẩu và không chia sẻ cho bất kỳ ai
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-600 mt-1">✓</div>
                  <div>
                    <Text strong>Đăng xuất sau khi sử dụng</Text>
                    <p className="text-gray-600 text-sm">
                      Luôn đăng xuất khỏi hệ thống khi sử dụng xong
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
