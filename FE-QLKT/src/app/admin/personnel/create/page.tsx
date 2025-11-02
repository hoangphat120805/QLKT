'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Breadcrumb,
  ConfigProvider,
  theme as antdTheme,
} from 'antd';
import { Loading } from '@/components/ui/loading';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { apiClient } from '@/lib/api-client';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function PersonnelCreatePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    // Lấy role của user hiện tại
    const role = localStorage.getItem('role');
    setCurrentUserRole(role || '');

    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [unitsRes, positionsRes] = await Promise.all([
          apiClient.getUnits(),
          apiClient.getPositions(),
        ]);

        setUnits(unitsRes?.data || []);
        setPositions(positionsRes?.data || []);
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Lấy danh sách role có thể tạo dựa trên role hiện tại
  const getAvailableRoles = () => {
    if (currentUserRole === 'SUPER_ADMIN') {
      return [
        { value: 'SUPER_ADMIN', label: 'Super Admin' },
        { value: 'ADMIN', label: 'Admin' },
        { value: 'MANAGER', label: 'Quản lý' },
        { value: 'USER', label: 'Người dùng' },
      ];
    } else if (currentUserRole === 'ADMIN') {
      return [
        { value: 'MANAGER', label: 'Quản lý' },
        { value: 'USER', label: 'Người dùng' },
      ];
    }
    return [{ value: 'USER', label: 'Người dùng' }];
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // Format dates and transform field names for backend
      const formattedValues = {
        cccd: values.cccd,
        ho_ten: values.ho_ten,
        ngay_sinh: values.ngay_sinh ? values.ngay_sinh.format('YYYY-MM-DD') : undefined,
        ngay_nhap_ngu: values.ngay_nhap_ngu ? values.ngay_nhap_ngu.format('YYYY-MM-DD') : undefined,
        unit_id: values.don_vi_id,
        position_id: values.chuc_vu_id,
        role: values.role || 'USER', // Mặc định USER nếu không chọn
      };

      const response = await apiClient.createPersonnel(formattedValues);

      if (response.success) {
        message.success('Tạo quân nhân thành công');
        router.push('/admin/personnel');
      } else {
        message.error(response.message || 'Lỗi khi tạo quân nhân');
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tạo quân nhân');
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
        <Breadcrumb
          items={[
            { title: <Link href="/admin/dashboard">Dashboard</Link> },
            { title: <Link href="/admin/personnel">Quân nhân</Link> },
            { title: 'Tạo mới' },
          ]}
        />

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/personnel">
            <Button icon={<ArrowLeftOutlined />}>Quay lại</Button>
          </Link>
          <Title level={2} className="!mb-0">
            Tạo Quân nhân mới
          </Title>
        </div>

        {/* Form */}
        <Card className="shadow-sm">
          {loadingData ? (
            <Loading message="Đang tải dữ liệu..." size="large" />
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              requiredMark="optional"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="ho_ten"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input placeholder="Nhập họ và tên" disabled={loading} />
                </Form.Item>

                <Form.Item
                  name="cccd"
                  label="CCCD"
                  rules={[
                    { required: true, message: 'Vui lòng nhập CCCD' },
                    { len: 12, message: 'CCCD phải có 12 số' },
                  ]}
                >
                  <Input placeholder="Nhập số CCCD" disabled={loading} maxLength={12} />
                </Form.Item>

                <Form.Item name="ngay_sinh" label="Ngày sinh">
                  <DatePicker
                    placeholder="Chọn ngày sinh"
                    format="DD/MM/YYYY"
                    disabled={loading}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  name="ngay_nhap_ngu"
                  label="Ngày nhập ngũ"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày nhập ngũ' }]}
                >
                  <DatePicker
                    placeholder="Chọn ngày nhập ngũ"
                    format="DD/MM/YYYY"
                    disabled={loading}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  name="don_vi_id"
                  label="Đơn vị"
                  rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
                >
                  <Select
                    placeholder="Chọn đơn vị"
                    disabled={loading}
                    showSearch
                    optionFilterProp="children"
                  >
                    {units.map((unit: any) => (
                      <Select.Option key={unit.id} value={unit.id}>
                        {unit.ten_don_vi}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="chuc_vu_id"
                  label="Chức vụ"
                  rules={[{ required: true, message: 'Vui lòng chọn chức vụ' }]}
                >
                  <Select
                    placeholder="Chọn chức vụ"
                    disabled={loading}
                    showSearch
                    optionFilterProp="children"
                  >
                    {positions.map((pos: any) => (
                      <Select.Option key={pos.id} value={pos.id}>
                        {pos.ten_chuc_vu}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="role"
                  label="Vai trò tài khoản"
                  initialValue="USER"
                  rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                >
                  <Select placeholder="Chọn vai trò" disabled={loading}>
                    {getAvailableRoles().map((role) => (
                      <Select.Option key={role.value} value={role.value}>
                        {role.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Link href="/admin/personnel">
                  <Button disabled={loading}>Hủy</Button>
                </Link>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Tạo Quân nhân
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </div>
    </ConfigProvider>
  );
}
