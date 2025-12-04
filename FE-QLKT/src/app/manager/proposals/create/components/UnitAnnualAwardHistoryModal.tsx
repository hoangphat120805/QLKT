'use client';

import { Modal, Table, Tag, Typography, Spin, Descriptions } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import axiosInstance from '@/utils/axiosInstance';
import { message } from 'antd';

const { Text } = Typography;

interface Unit {
  id: string;
  ten_don_vi: string;
  ma_don_vi?: string;
}

interface UnitAnnualAward {
  nam: number;
  danh_hieu: string;
  so_quyet_dinh?: string | null;
  file_quyet_dinh?: string | null;
  nhan_bkbqp?: boolean;
  nhan_bkttcp?: boolean;
  so_quyet_dinh_bkbqp?: string | null;
  file_quyet_dinh_bkbqp?: string | null;
  so_quyet_dinh_bkttcp?: string | null;
  file_quyet_dinh_bkttcp?: string | null;
}

interface UnitAnnualAwardHistoryModalProps {
  visible: boolean;
  unit: Unit | null;
  annualAwards: any;
  loading: boolean;
  onClose: () => void;
}

export default function UnitAnnualAwardHistoryModal({
  visible,
  unit,
  annualAwards,
  loading,
  onClose,
}: UnitAnnualAwardHistoryModalProps) {
  const handleOpenDecisionFile = async (soQuyetDinh: string, filePath?: string | null) => {
    try {
      let filename: string | null = null;

      // Nếu đã có file_path trong record, dùng luôn
      if (filePath) {
        filename = filePath.split('/').pop() || null;
      } else {
        // Nếu chưa có file_path, tìm từ DB dựa trên số quyết định
        const response = await axiosInstance.get(`/api/decisions?so_quyet_dinh=${soQuyetDinh}`);
        if (response.data?.success && response.data?.data?.length > 0) {
          const decision = response.data.data[0];
          if (decision.file_path) {
            filename = decision.file_path.split('/').pop() || null;
          }
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

  const columns: ColumnsType<UnitAnnualAward> = [
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 100,
      align: 'center',
      sorter: (a, b) => b.nam - a.nam,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Danh hiệu',
      dataIndex: 'danh_hieu',
      key: 'danh_hieu',
      width: 150,
      align: 'center',
      render: (text: string) => {
        const map: Record<string, string> = {
          ĐVQT: 'Đơn vị quyết thắng',
          ĐVTT: 'Đơn vị tiên tiến',
        };
        return map[text] || text;
      },
    },
    {
      title: 'Nhận BKBQP',
      dataIndex: 'nhan_bkbqp',
      key: 'nhan_bkbqp',
      width: 120,
      align: 'center',
      render: value => (value ? <Tag color="green">Có</Tag> : <Tag>Không</Tag>),
    },
    {
      title: 'Nhận BKTTCP',
      dataIndex: 'nhan_bkttcp',
      key: 'nhan_bkttcp',
      width: 120,
      align: 'center',
      render: value => (value ? <Tag color="green">Có</Tag> : <Tag>Không</Tag>),
    },
    {
      title: 'Số quyết định',
      key: 'so_quyet_dinh',
      width: 200,
      align: 'center',
      render: (_, record) => {
        const decisions = [];

        if (record.so_quyet_dinh) {
          decisions.push({
            label: record.so_quyet_dinh,
            soQuyetDinh: record.so_quyet_dinh,
            filePath: record.file_quyet_dinh,
          });
        }

        if (record.so_quyet_dinh_bkbqp) {
          decisions.push({
            label: `BKBQP: ${record.so_quyet_dinh_bkbqp}`,
            soQuyetDinh: record.so_quyet_dinh_bkbqp,
            filePath: record.file_quyet_dinh_bkbqp,
          });
        }

        if (record.so_quyet_dinh_bkttcp) {
          decisions.push({
            label: `BKTTCP: ${record.so_quyet_dinh_bkttcp}`,
            soQuyetDinh: record.so_quyet_dinh_bkttcp,
            filePath: record.file_quyet_dinh_bkttcp,
          });
        }

        return decisions.length > 0 ? (
          <div style={{ textAlign: 'left' }}>
            {decisions.map((d, i) => (
              <div key={i}>
                {d.filePath ? (
                  <a
                    onClick={() => handleOpenDecisionFile(d.soQuyetDinh, d.filePath)}
                    style={{ color: '#52c41a', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {d.label}
                  </a>
                ) : (
                  <span style={{ color: '#999' }}>{d.label}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          '-'
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <span>
          <HistoryOutlined style={{ marginRight: 8 }} />
          Lịch sử khen thưởng đơn vị hằng năm - {unit?.ten_don_vi}
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
    >
      <Spin spinning={loading}>
        {annualAwards && annualAwards.tong_dvqt_json && annualAwards.tong_dvqt_json.length > 0 ? (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tổng số danh hiệu ĐVQT">
                <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {annualAwards?.tong_dvqt || 0} năm
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số năm liên tục ĐVQT">
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {annualAwards?.dvqt_lien_tuc || 0} năm
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đủ điều kiện BKBQP">
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {(annualAwards?.du_dieu_kien_bk_tong_cuc) ? 'Có' : 'Không'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đủ điều kiện BKTTCP">
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {(annualAwards?.du_dieu_kien_bk_thu_tuong) ? 'Có' : 'Không'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <Table
              columns={columns}
              dataSource={annualAwards?.tong_dvqt_json}
              rowKey={(record, index) => `${record.nam}-${index}`}
              pagination={false}
              size="small"
              scroll={{ x: 900 }}
            />
          </div>
        ) : (
          <Text type="secondary">Chưa có dữ liệu lịch sử khen thưởng đơn vị</Text>
        )}
      </Spin>
    </Modal>
  );
}
