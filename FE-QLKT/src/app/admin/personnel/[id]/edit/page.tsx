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
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { apiClient } from '@/lib/api-client';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function PersonnelEditPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const personnelId = params?.id as string;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [units, setUnits] = useState([]);
  const [positions, setPositions] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUnitName, setCurrentUnitName] = useState<string>('');

  useEffect(() => {
    // Lấy role của user hiện tại
    const role = localStorage.getItem('role');
    setCurrentUserRole(role || '');

    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [personnelRes, unitsRes, positionsRes] = await Promise.all([
          apiClient.getPersonnelById(personnelId),
          apiClient.getUnits(),
          apiClient.getPositions(),
        ]);

        if (personnelRes.success) {
          const personnel = personnelRes.data;

          // Lưu tên đơn vị để hiển thị
          setCurrentUnitName(personnel.DonVi?.ten_don_vi || '');

          form.setFieldsValue({
            ho_ten: personnel.ho_ten,
            cccd: personnel.cccd,
            ngay_sinh: personnel.ngay_sinh ? dayjs(personnel.ngay_sinh) : undefined,
            ngay_nhap_ngu: personnel.ngay_nhap_ngu ? dayjs(personnel.ngay_nhap_ngu) : undefined,
            don_vi_id: personnel.don_vi_id || personnel.DonVi?.id,
            chuc_vu_id: personnel.chuc_vu_id || personnel.ChucVu?.id,
          });
        } else {
          message.error(personnelRes.message || 'Không thể lấy thông tin quân nhân');
        }

        setUnits(unitsRes?.data || []);
        setPositions(positionsRes?.data || []);
      } catch (error: any) {
        message.error(error?.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoadingData(false);
      }
    };

    if (personnelId) {
      fetchData();
    }
  }, [personnelId, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const formattedValues: any = {
        ho_ten: values.ho_ten,
        cccd: values.cccd,
        ngay_sinh: values.ngay_sinh ? values.ngay_sinh.format('YYYY-MM-DD') : null,
        ngay_nhap_ngu: values.ngay_nhap_ngu ? values.ngay_nhap_ngu.format('YYYY-MM-DD') : null,
        chuc_vu_id: values.chuc_vu_id,
      };

      if (currentUserRole !== 'MANAGER') {
        formattedValues.don_vi_id = values.don_vi_id;
      }

      const response = await apiClient.updatePersonnel(personnelId, formattedValues);

      if (response.success) {
        message.success('Cập nhật quân nhân thành công');
        router.push(`/admin/personnel/${personnelId}`);
      } else {
        message.error(response.message || 'Lỗi khi cập nhật quân nhân');
      }
    } catch (error: any) {
      message.error(error?.message || 'Lỗi khi cập nhật quân nhân');
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
            { title: <Link href={`/admin/personnel/${personnelId}`}>#{personnelId}</Link> },
            { title: 'Chỉnh sửa' },
          ]}
        />

        {loadingData ? (
          <Loading message="Đang tải thông tin quân nhân..." size="large" />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href={`/admin/personnel/${personnelId}`}>
                <Button icon={<ArrowLeftOutlined />}>Quay lại</Button>
              </Link>
              <Title level={2} className="!mb-0">
                Chỉnh sửa Quân nhân
              </Title>
            </div>

            {/* Form */}
            <Card className="shadow-sm">
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

                  {currentUserRole === 'MANAGER' ? (
                    <Form.Item label="Đơn vị" tooltip="Chỉ Admin mới có thể thay đổi đơn vị">
                      <Input value={currentUnitName} disabled placeholder="Đơn vị" />
                    </Form.Item>
                  ) : (
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
                  )}

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
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                  <Link href={`/admin/personnel/${personnelId}`}>
                    <Button disabled={loading}>Hủy</Button>
                  </Link>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </Form>
            </Card>
          </>
        )}
      </div>
    </ConfigProvider>
  );
}
