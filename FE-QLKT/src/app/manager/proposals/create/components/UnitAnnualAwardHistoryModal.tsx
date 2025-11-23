'use client';

import { Modal, Table, Tag, Typography, Spin, Descriptions } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

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
        const decisions = [record.so_quyet_dinh];
        if (record.so_quyet_dinh_bkbqp) {
          decisions.push(`BKBQP: ${record.so_quyet_dinh_bkbqp}`);
        }
        if (record.so_quyet_dinh_bkttcp) {
          decisions.push(`BKTTCP: ${record.so_quyet_dinh_bkttcp}`);
        }
        return decisions.length > 0 ? (
          <div style={{ textAlign: 'left' }}>
            {decisions.map((d, i) => (
              <div key={i}>{d}</div>
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
