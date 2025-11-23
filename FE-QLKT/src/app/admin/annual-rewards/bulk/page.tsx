'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Form,
  Select,
  InputNumber,
  Table,
  Input,
  message,
  Space,
  Typography,
  Breadcrumb,
  Tag,
  Statistic,
  Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

const { Title, Text } = Typography;
const { Search } = Input;

interface Personnel {
  id: number;
  ho_ten: string;
  cccd: string;
  don_vi_id?: number;
  chuc_vu_id?: number;
  DonVi?: { id: number; ten_don_vi: string };
  ChucVu?: { id: number; ten_chuc_vu: string };
}

export default function BulkAddAnnualRewardsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState<Personnel[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterUnitId, setFilterUnitId] = useState<number | undefined>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter personnel based on search and unit
    let filtered = [...personnelList];

    if (searchText) {
      filtered = filtered.filter(
        p =>
          p.ho_ten?.toLowerCase().includes(searchText.toLowerCase()) || p.cccd?.includes(searchText)
      );
    }

    if (filterUnitId) {
      filtered = filtered.filter(p => p.DonVi?.id === filterUnitId);
    }

    setFilteredPersonnel(filtered);
  }, [searchText, filterUnitId, personnelList, units]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [personnelRes, unitsRes] = await Promise.all([
        apiClient.getPersonnel({ limit: 1000 }),
        apiClient.getUnits(),
      ]);

      if (personnelRes.success) {
        // Handle different response formats
        let data = [];
        if (Array.isArray(personnelRes.data)) {
          data = personnelRes.data;
        } else if (personnelRes.data?.personnel && Array.isArray(personnelRes.data.personnel)) {
          data = personnelRes.data.personnel;
        } else if (personnelRes.data?.data && Array.isArray(personnelRes.data.data)) {
          data = personnelRes.data.data;
        }

        setPersonnelList(data);
        setFilteredPersonnel(data);
      }

      if (unitsRes.success) {
        setUnits(unitsRes.data || []);
      }
    } catch (error: any) {
      message.error('Không thể tải dữ liệu');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một quân nhân');
      return;
    }

    try {
      setLoading(true);

      // Lấy file từ fileList nếu có
      const file = fileList.length > 0 ? (fileList[0].originFileObj as File) : undefined;

      const result = await apiClient.bulkCreateAnnualRewards({
        personnel_ids: selectedRowKeys.map(k => Number(k)),
        nam: values.nam,
        danh_hieu: values.danh_hieu,
        cap_bac: values.cap_bac,
        chuc_vu: values.chuc_vu,
        ghi_chu: values.ghi_chu,
        so_quyet_dinh: values.so_quyet_dinh,
        file_quyet_dinh: file,
      });

      if (result.success) {
        message.success(result.message || 'Thêm danh hiệu thành công');
        setSelectedRowKeys([]);
        setFileList([]);
        form.resetFields();

        // Show details
        if (result.data?.details) {
          const { success, skipped, errors } = result.data;
          message.info(`Kết quả: Thành công ${success}, Bỏ qua ${skipped}, Lỗi ${errors}`, 5);
        }
      } else {
        message.error(result.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      message.error('Có lỗi xảy ra khi thêm danh hiệu');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Personnel> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Họ tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
      width: 200,
    },
    {
      title: 'CCCD',
      dataIndex: 'cccd',
      key: 'cccd',
      width: 150,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'DonVi',
      key: 'don_vi',
      width: 150,
      render: donVi => donVi?.ten_don_vi || '-',
    },
    {
      title: 'Cấp bậc / Chức vụ',
      key: 'cap_bac_chuc_vu',
      width: 180,
      align: 'center',
      render: (_: any, record: any) => {
        const capBac = record.cap_bac;
        const chucVu = record.ChucVu?.ten_chuc_vu;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text strong style={{ marginBottom: '4px' }}>
              {capBac || '-'}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {chucVu || '-'}
            </Text>
          </div>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
  };

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link href="/admin/dashboard">
            <HomeOutlined />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href="/admin/personnel">Quân nhân</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Thêm danh hiệu đồng loạt</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/personnel">
            <Button icon={<ArrowLeftOutlined />}>Quay lại</Button>
          </Link>
          <Title level={2} className="!mb-0">
            Thêm danh hiệu hằng năm đồng loạt
          </Title>
        </div>
      </div>

      {/* Form */}
      <Card title="Thông tin danh hiệu" className="shadow-sm">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="nam"
              label="Năm"
              rules={[{ required: true, message: 'Vui lòng chọn năm' }]}
            >
              <InputNumber
                placeholder="VD: 2024"
                min={2000}
                max={2100}
                style={{ width: '100%' }}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="danh_hieu"
              label="Danh hiệu"
              rules={[{ required: true, message: 'Vui lòng chọn danh hiệu' }]}
            >
              <Select placeholder="Chọn danh hiệu" size="large">
                <Select.Option value="CSTDCS">
                  <Tag color="blue">CSTDCS</Tag> Chiến sĩ thi đua cơ sở
                </Select.Option>
                <Select.Option value="CSTT">
                  <Tag color="green">CSTT</Tag> Chiến sĩ tiên tiến
                </Select.Option>
                <Select.Option value="KHONG_DAT">
                  <Tag color="red">KHONG_DAT</Tag> Không đạt
                </Select.Option>
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

            <Form.Item name="so_quyet_dinh" label="Số quyết định" rules={[{ required: false }]}>
              <Input placeholder="VD: 123/QĐ-HVKHQS" size="large" prefix={<FilePdfOutlined />} />
            </Form.Item>

            <Form.Item
              name="file_quyet_dinh"
              label="File quyết định (PDF)"
              rules={[{ required: false }]}
            >
              <Upload
                fileList={fileList}
                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                beforeUpload={() => false}
                accept=".pdf"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />} size="large">
                  Chọn file PDF
                </Button>
              </Upload>
            </Form.Item>
          </div>

          <Form.Item name="ghi_chu" label="Ghi chú">
            <Input.TextArea
              placeholder="Ghi chú chung cho tất cả quân nhân (ví dụ: chuyển từ đơn vị khác)"
              rows={3}
              size="large"
            />
          </Form.Item>

          <div className="text-gray-500 text-sm mt-2">
            <FilePdfOutlined className="mr-2" />
            Số quyết định và file PDF sẽ được lưu chung cho tất cả quân nhân được chọn
          </div>
        </Form>
      </Card>

      {/* Statistics */}
      <Card className="shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Statistic
            title="Tổng số quân nhân"
            value={filteredPersonnel.length}
            prefix={<span className="text-blue-500">👥</span>}
          />
          <Statistic
            title="Đã chọn"
            value={selectedRowKeys.length}
            prefix={<span className="text-green-500">✓</span>}
          />
          <Statistic
            title="Chưa chọn"
            value={filteredPersonnel.length - selectedRowKeys.length}
            prefix={<span className="text-gray-400">○</span>}
          />
        </div>
      </Card>

      {/* Personnel Selection */}
      <Card className="shadow-sm">
        <div style={{ marginBottom: '16px' }}>
          <Title level={4} style={{ marginBottom: '16px', marginTop: 0 }}>
            Chọn quân nhân
          </Title>
          <Space wrap style={{ width: '100%' }} size="middle">
            <div style={{ flex: 1, minWidth: 250 }}>
              <Input
                placeholder="Tìm theo tên"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onPressEnter={() => {}}
                size="large"
                allowClear
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ minWidth: 200 }}>
              <Select
                placeholder="Chọn đơn vị"
                style={{ width: '100%' }}
                size="large"
                allowClear
                value={filterUnitId || undefined}
                onChange={value => setFilterUnitId(value || undefined)}
              >
                {units.map(unit => (
                  <Select.Option key={unit.id} value={unit.id}>
                    {unit.ten_don_vi}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Space>
        </div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredPersonnel}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: total => `Tổng ${total} quân nhân`,
            showSizeChanger: true,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Submit Button */}
      <Card className="shadow-sm">
        <div className="flex justify-end gap-4">
          <Button size="large" onClick={() => form.resetFields()}>
            Đặt lại
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => form.submit()}
            loading={loading}
            disabled={selectedRowKeys.length === 0}
          >
            Thêm danh hiệu cho {selectedRowKeys.length} quân nhân
          </Button>
        </div>
      </Card>
    </div>
  );
}
