'use client';

import { useState, useEffect } from 'react';
import { Table, Select, Input, Alert, Typography, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axiosInstance from '@/utils/axiosInstance';

const { Text } = Typography;
const { TextArea } = Input;

interface Personnel {
  id: string;
  ho_ten: string;
  cccd: string;
  CoQuanDonVi?: {
    ten_don_vi: string;
  };
  DonViTrucThuoc?: {
    ten_don_vi: string;
  };
}

interface TitleData {
  personnel_id: string;
  danh_hieu?: string;
  loai?: 'NCKH' | 'SKKH';
  mo_ta?: string;
}

interface Step3SetTitlesProps {
  selectedPersonnelIds: string[];
  proposalType: string;
  titleData: TitleData[];
  onTitleDataChange: (data: TitleData[]) => void;
}

export default function Step3SetTitles({
  selectedPersonnelIds,
  proposalType,
  titleData,
  onTitleDataChange,
}: Step3SetTitlesProps) {
  const [loading, setLoading] = useState(false);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);

  // Fetch personnel details
  useEffect(() => {
    if (selectedPersonnelIds.length > 0) {
      fetchPersonnelDetails();
    }
  }, [selectedPersonnelIds]);

  const fetchPersonnelDetails = async () => {
    try {
      setLoading(true);
      const promises = selectedPersonnelIds.map((id) => axiosInstance.get(`/api/personnel/${id}`));
      const responses = await Promise.all(promises);
      const personnelData = responses
        .filter((r) => r.data.success)
        .map((r) => r.data.data);
      setPersonnel(personnelData);

      // Initialize title data if empty
      if (titleData.length === 0) {
        const initialData = personnelData.map((p: Personnel) => ({
          personnel_id: p.id,
        }));
        onTitleDataChange(initialData);
      }
    } catch (error) {
      console.error('Error fetching personnel details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get danh hiệu options based on proposal type
  const getDanhHieuOptions = () => {
    switch (proposalType) {
      case 'CA_NHAN_HANG_NAM':
        return [
          { label: 'Chiến sĩ thi đua cơ sở (CSTDCS)', value: 'CSTDCS' },
          { label: 'Chiến sĩ tiên tiến (CSTT)', value: 'CSTT' },
          { label: 'Bằng khen BQP (BKBQP)', value: 'BKBQP' },
          { label: 'Chiến sĩ thi đua toàn quân (CSTDTQ)', value: 'CSTDTQ' },
        ];
      case 'NIEN_HAN':
        return [
          { label: 'Huân chương Chiến sỹ Vẻ vang Hạng Ba', value: 'HCCSVV_HANG_BA' },
          { label: 'Huân chương Chiến sỹ Vẻ vang Hạng Nhì', value: 'HCCSVV_HANG_NHI' },
          { label: 'Huân chương Chiến sỹ Vẻ vang Hạng Nhất', value: 'HCCSVV_HANG_NHAT' },
        ];
      case 'CONG_HIEN':
        return [
          { label: 'Huân chương Bảo vệ Tổ quốc Hạng Ba', value: 'HCBVTQ_HANG_BA' },
          { label: 'Huân chương Bảo vệ Tổ quốc Hạng Nhì', value: 'HCBVTQ_HANG_NHI' },
          { label: 'Huân chương Bảo vệ Tổ quốc Hạng Nhất', value: 'HCBVTQ_HANG_NHAT' },
        ];
      default:
        return [];
    }
  };

  // Update title for a personnel
  const updateTitle = (personnelId: string, field: string, value: any) => {
    const newData = [...titleData];
    const index = newData.findIndex((d) => d.personnel_id === personnelId);

    if (index >= 0) {
      newData[index] = { ...newData[index], [field]: value };
    } else {
      newData.push({ personnel_id: personnelId, [field]: value });
    }

    onTitleDataChange(newData);
  };

  // Get title data for a personnel
  const getTitleData = (personnelId: string) => {
    return titleData.find((d) => d.personnel_id === personnelId) || { personnel_id: personnelId };
  };

  // Check if all personnel have titles set
  const allTitlesSet = personnel.every((p) => {
    const data = getTitleData(p.id);
    if (proposalType === 'NCKH') {
      return data.loai && data.mo_ta;
    } else {
      return data.danh_hieu;
    }
  });

  // Columns for CA_NHAN_HANG_NAM, NIEN_HAN, CONG_HIEN
  const standardColumns: ColumnsType<Personnel> = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'CCCD',
      dataIndex: 'cccd',
      key: 'cccd',
      width: 120,
    },
    {
      title: 'Cơ quan đơn vị',
      key: 'co_quan_don_vi',
      width: 140,
      render: (_, record) => record.CoQuanDonVi?.ten_don_vi || '-',
    },
    {
      title: 'Đơn vị trực thuộc',
      key: 'don_vi_truc_thuoc',
      width: 140,
      render: (_, record) => record.DonViTrucThuoc?.ten_don_vi || '-',
    },
    {
      title: (
        <span>
          Danh hiệu <Text type="danger">*</Text>
        </span>
      ),
      key: 'danh_hieu',
      render: (_, record) => {
        const data = getTitleData(record.id);
        return (
          <Select
            value={data.danh_hieu}
            onChange={(value) => updateTitle(record.id, 'danh_hieu', value)}
            placeholder="Chọn danh hiệu"
            style={{ width: '100%' }}
            size="middle"
            options={getDanhHieuOptions()}
          />
        );
      },
    },
  ];

  // Columns for NCKH
  const nckhColumns: ColumnsType<Personnel> = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'CCCD',
      dataIndex: 'cccd',
      key: 'cccd',
      width: 140,
    },
    {
      title: (
        <span>
          Loại <Text type="danger">*</Text>
        </span>
      ),
      key: 'loai',
      width: 160,
      render: (_, record) => {
        const data = getTitleData(record.id);
        return (
          <Select
            value={data.loai}
            onChange={(value) => updateTitle(record.id, 'loai', value)}
            placeholder="Chọn loại"
            style={{ width: '100%' }}
            size="middle"
            options={[
              { label: 'Đề tài khoa học', value: 'NCKH' },
              { label: 'Sáng kiến khoa học', value: 'SKKH' },
            ]}
          />
        );
      },
    },
    {
      title: (
        <span>
          Mô tả <Text type="danger">*</Text>
        </span>
      ),
      key: 'mo_ta',
      render: (_, record) => {
        const data = getTitleData(record.id);
        return (
          <TextArea
            value={data.mo_ta}
            onChange={(e) => updateTitle(record.id, 'mo_ta', e.target.value)}
            placeholder="Nhập mô tả chi tiết về đề tài hoặc thành tích..."
            rows={2}
            maxLength={500}
            showCount
            style={{ fontSize: '13px' }}
          />
        );
      },
    },
  ];

  const columns = proposalType === 'NCKH' ? nckhColumns : standardColumns;

  return (
    <div>
      <Alert
        message="Hướng dẫn"
        description={
          <div>
            <p>
              1. Chọn danh hiệu khen thưởng cho từng quân nhân đã chọn (
              <strong>{personnel.length}</strong> quân nhân)
            </p>
            <p>2. Đảm bảo tất cả quân nhân đều đã được chọn danh hiệu</p>
            <p>3. Sau khi hoàn tất, nhấn &quot;Tiếp tục&quot; để sang bước upload file</p>
          </div>
        }
        type="info"
        showIcon
        icon={<EditOutlined />}
        style={{ marginBottom: 24 }}
      />

      {/* Summary */}
      <Space direction="vertical" style={{ marginBottom: 16, width: '100%' }} size="small">
        <Text type="secondary">
          Tổng số quân nhân: <strong>{personnel.length}</strong>
        </Text>
        <Text type={allTitlesSet ? 'success' : 'warning'}>
          Đã set danh hiệu:{' '}
          <strong>
            {titleData.filter((d) => {
              if (proposalType === 'NCKH') {
                return d.loai && d.mo_ta;
              }
              return d.danh_hieu;
            }).length}
            /{personnel.length}
          </strong>
          {allTitlesSet && ' ✓'}
        </Text>
      </Space>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={personnel}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        bordered
        scroll={{ x: 1000 }}
        locale={{
          emptyText: 'Không có dữ liệu',
        }}
      />
    </div>
  );
}
