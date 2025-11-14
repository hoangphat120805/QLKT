'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Table,
  Tabs,
  Alert,
  Typography,
  Breadcrumb,
  Space,
  Spin,
  Empty,
  Modal,
  Input,
  Tag,
  message,
} from 'antd';
import {
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  BookOutlined,
  LoadingOutlined,
  ArrowLeftOutlined,
  WarningOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { EditableCell } from '@/components/EditableCell';
import DecisionModal from '@/components/DecisionModal';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api-client';

const { Title, Paragraph, Text } = Typography;

interface DanhHieuItem {
  cccd: string;
  ho_ten: string;
  nam: number;
  danh_hieu: string | null;
  nhan_bkbqp: boolean;
  so_quyet_dinh_bkbqp: string | null;
  nhan_cstdtq: boolean;
  so_quyet_dinh_cstdtq: string | null;
}

interface ThanhTichItem {
  cccd: string;
  ho_ten: string;
  nam: number;
  loai: string;
  mo_ta: string;
  status: string;
  so_quyet_dinh?: string;
}

interface ProposalDetail {
  id: number;
  don_vi: {
    id: number;
    ma_don_vi: string;
    ten_don_vi: string;
  };
  nguoi_de_xuat: {
    id: number;
    username: string;
    ho_ten: string;
  };
  status: string;
  data_danh_hieu: DanhHieuItem[];
  data_thanh_tich: ThanhTichItem[];
  ghi_chu: string | null;
  nguoi_duyet: any;
  ngay_duyet: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [editedDanhHieu, setEditedDanhHieu] = useState<DanhHieuItem[]>([]);
  const [editedThanhTich, setEditedThanhTich] = useState<ThanhTichItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [messageAlert, setMessageAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Selection states for Danh Hieu
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Selection states for Thanh Tich
  const [selectedThanhTichKeys, setSelectedThanhTichKeys] = useState<React.Key[]>([]);

  const [decisionModalVisible, setDecisionModalVisible] = useState(false);
  const [decisionModalType, setDecisionModalType] = useState<'danh_hieu' | 'thanh_tich'>('danh_hieu');

  // Reject modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [ghiChu, setGhiChu] = useState('');

  useEffect(() => {
    if (id) {
      fetchProposalDetail();
    }
  }, [id]);

  const fetchProposalDetail = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getProposalById(String(id));

      if (res.success && res.data) {
        setProposal(res.data);
        const danhHieuData = res.data.data_danh_hieu;
        const thanhTichData = res.data.data_thanh_tich;

        const parsedDanhHieu = Array.isArray(danhHieuData)
          ? danhHieuData
          : danhHieuData && typeof danhHieuData === 'string'
            ? JSON.parse(danhHieuData)
            : [];

        const parsedThanhTich = Array.isArray(thanhTichData)
          ? thanhTichData
          : thanhTichData && typeof thanhTichData === 'string'
            ? JSON.parse(thanhTichData)
            : [];

        setEditedDanhHieu(parsedDanhHieu);
        setEditedThanhTich(parsedThanhTich);
      } else {
        setMessageAlert({ type: 'error', text: res.message || 'Không tải được đề xuất' });
      }
    } catch (error: any) {
      setMessageAlert({ type: 'error', text: error.message || 'Lỗi khi tải đề xuất' });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!ghiChu.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setRejecting(true);
      setMessageAlert(null);

      const response = await apiClient.rejectProposal(String(id), ghiChu);

      if (response.success) {
        message.success('Đã từ chối đề xuất thành công');
        setRejectModalVisible(false);
        await fetchProposalDetail();

        setTimeout(() => {
          router.push('/admin/proposals/review');
        }, 2000);
      } else {
        setMessageAlert({ type: 'error', text: response.message || 'Lỗi khi từ chối đề xuất' });
      }
    } catch (error: any) {
      setMessageAlert({ type: 'error', text: error.message || 'Lỗi khi từ chối đề xuất' });
    } finally {
      setRejecting(false);
    }
  };

  const handleApprove = async () => {
    Modal.confirm({
      title: 'Xác nhận phê duyệt',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn phê duyệt đề xuất này? Dữ liệu sẽ được import vào hệ thống.</p>
          <p style={{ marginTop: 12, color: '#666' }}>
            Sau khi phê duyệt, bạn có thể chọn cán bộ và thêm số quyết định khen thưởng.
          </p>
        </div>
      ),
      okText: 'Phê duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setApproving(true);
          setMessageAlert(null);

          const formData = new FormData();
          formData.append('data_danh_hieu', JSON.stringify(editedDanhHieu));
          formData.append('data_thanh_tich', JSON.stringify(editedThanhTich));

          const response = await apiClient.approveProposal(String(id), formData);

          if (response.success) {
            const importedData = response.data || {};
            message.success(
              `Đã phê duyệt đề xuất. Import ${importedData.imported_danh_hieu || 0}/${
                importedData.total_danh_hieu || 0
              } danh hiệu và ${importedData.imported_thanh_tich || 0}/${
                importedData.total_thanh_tich || 0
              } thành tích.`
            );

            // Refresh data
            await fetchProposalDetail();
          } else {
            setMessageAlert({ type: 'error', text: response.message || 'Lỗi khi phê duyệt đề xuất' });
          }
        } catch (error: any) {
          setMessageAlert({ type: 'error', text: error.message || 'Lỗi khi phê duyệt đề xuất' });
        } finally {
          setApproving(false);
        }
      },
    });
  };

  const handleDecisionSuccess = (decision: any) => {
    if (decisionModalType === 'danh_hieu') {
      // Apply decision to selected danh hieu
      const updatedDanhHieu = editedDanhHieu.map((item, index) => {
        if (selectedRowKeys.includes(index)) {
          return {
            ...item,
            so_quyet_dinh_bkbqp: decision.so_quyet_dinh,
          };
        }
        return item;
      });

      setEditedDanhHieu(updatedDanhHieu);
      setSelectedRowKeys([]);
      message.success(`Đã áp dụng số quyết định cho ${selectedRowKeys.length} cán bộ`);
    } else {
      // Apply decision to selected thanh tich
      const updatedThanhTich = editedThanhTich.map((item, index) => {
        if (selectedThanhTichKeys.includes(index)) {
          return {
            ...item,
            so_quyet_dinh: decision.so_quyet_dinh,
          };
        }
        return item;
      });

      setEditedThanhTich(updatedThanhTich);
      setSelectedThanhTichKeys([]);
      message.success(`Đã áp dụng số quyết định cho ${selectedThanhTichKeys.length} thành tích`);
    }
  };

  const updateDanhHieu = (index: number, field: keyof DanhHieuItem, value: any) => {
    const newData = [...editedDanhHieu];
    newData[index] = { ...newData[index], [field]: value };
    setEditedDanhHieu(newData);
  };

  const updateThanhTich = (index: number, field: keyof ThanhTichItem, value: any) => {
    const newData = [...editedThanhTich];
    newData[index] = { ...newData[index], [field]: value };
    setEditedThanhTich(newData);
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Space>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
          <span style={{ color: '#666' }}>Đang tải...</span>
        </Space>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Không tìm thấy đề xuất"
          type="error"
          showIcon
          icon={<CloseCircleOutlined />}
        />
      </div>
    );
  }

  const danhHieuColumns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'CCCD',
      dataIndex: 'cccd',
      key: 'cccd',
      width: 120,
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{text}</span>
      ),
    },
    {
      title: 'Họ tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
    },
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 80,
      render: (_: any, record: DanhHieuItem, index: number) => (
        <EditableCell
          value={record.nam}
          type="number"
          onSave={val => updateDanhHieu(index, 'nam', parseInt(val))}
          editable={proposal.status === 'PENDING'}
        />
      ),
    },
    {
      title: 'Danh hiệu',
      dataIndex: 'danh_hieu',
      key: 'danh_hieu',
      width: 120,
      render: (_: any, record: DanhHieuItem, index: number) => (
        <EditableCell
          value={record.danh_hieu || ''}
          type="select"
          options={[
            { label: 'CSTDCS', value: 'CSTDCS' },
            { label: 'CSTT', value: 'CSTT' },
            { label: 'Không đạt', value: '' },
          ]}
          onSave={val => updateDanhHieu(index, 'danh_hieu', val || null)}
          editable={proposal.status === 'PENDING'}
        />
      ),
    },
    {
      title: 'Số quyết định',
      dataIndex: 'so_quyet_dinh_bkbqp',
      key: 'so_quyet_dinh',
      width: 150,
      render: (text: string) => (
        <span style={{ color: text ? '#52c41a' : '#999', fontWeight: text ? 500 : 400 }}>
          {text || 'Chưa có'}
        </span>
      ),
    },
  ];

  const thanhTichColumns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'CCCD',
      dataIndex: 'cccd',
      key: 'cccd',
      width: 120,
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{text}</span>
      ),
    },
    {
      title: 'Họ tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
    },
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 80,
      render: (_: any, record: ThanhTichItem, index: number) => (
        <EditableCell
          value={record.nam}
          type="number"
          onSave={val => updateThanhTich(index, 'nam', parseInt(val))}
          editable={proposal.status === 'PENDING'}
        />
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'loai',
      key: 'loai',
      width: 100,
      render: (_: any, record: ThanhTichItem, index: number) => (
        <EditableCell
          value={record.loai}
          type="select"
          options={[
            { label: 'NCKH', value: 'NCKH' },
            { label: 'SKKH', value: 'SKKH' },
          ]}
          onSave={val => updateThanhTich(index, 'loai', val)}
          editable={proposal.status === 'PENDING'}
        />
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'mo_ta',
      key: 'mo_ta',
      render: (_: any, record: ThanhTichItem, index: number) => (
        <EditableCell
          value={record.mo_ta}
          type="text"
          onSave={val => updateThanhTich(index, 'mo_ta', val)}
          editable={proposal.status === 'PENDING'}
        />
      ),
    },
    {
      title: 'Số quyết định',
      dataIndex: 'so_quyet_dinh',
      key: 'so_quyet_dinh',
      width: 150,
      render: (text: string) => (
        <span style={{ color: text ? '#52c41a' : '#999', fontWeight: text ? 500 : 400 }}>
          {text || 'Chưa có'}
        </span>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const thanhTichRowSelection = {
    selectedRowKeys: selectedThanhTichKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedThanhTichKeys(selectedKeys);
    },
  };

  const tabItems = [
    {
      key: 'danh_hieu',
      label: (
        <span>
          <TrophyOutlined style={{ marginRight: 8 }} />
          Danh Hiệu ({editedDanhHieu.length})
        </span>
      ),
      children: (
        <Card
          title="Danh Hiệu Hằng Năm"
          extra={
            proposal.status === 'PENDING' &&
            selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => {
                  setDecisionModalType('danh_hieu');
                  setDecisionModalVisible(true);
                }}
              >
                Thêm số quyết định ({selectedRowKeys.length} người)
              </Button>
            )
          }
        >
          {editedDanhHieu.length === 0 ? (
            <Empty
              image={<WarningOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
              description="Không có dữ liệu danh hiệu"
            />
          ) : (
            <Table
              rowSelection={proposal.status === 'PENDING' ? rowSelection : undefined}
              columns={danhHieuColumns}
              dataSource={editedDanhHieu}
              rowKey={(_, index) => index}
              pagination={false}
              scroll={{ x: true }}
            />
          )}
        </Card>
      ),
    },
    {
      key: 'thanh_tich',
      label: (
        <span>
          <BookOutlined style={{ marginRight: 8 }} />
          Thành Tích ({editedThanhTich.length})
        </span>
      ),
      children: (
        <Card
          title="Thành Tích Khoa Học"
          extra={
            proposal.status === 'PENDING' &&
            selectedThanhTichKeys.length > 0 && (
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => {
                  setDecisionModalType('thanh_tich');
                  setDecisionModalVisible(true);
                }}
              >
                Thêm số quyết định ({selectedThanhTichKeys.length} thành tích)
              </Button>
            )
          }
        >
          {editedThanhTich.length === 0 ? (
            <Empty
              image={<WarningOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
              description="Không có dữ liệu thành tích"
            />
          ) : (
            <Table
              rowSelection={proposal.status === 'PENDING' ? thanhTichRowSelection : undefined}
              columns={thanhTichColumns}
              dataSource={editedThanhTich}
              rowKey={(_, index) => index}
              pagination={false}
              scroll={{ x: true }}
            />
          )}
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/admin/proposals/review">Duyệt Đề Xuất</Breadcrumb.Item>
        <Breadcrumb.Item>Chi Tiết</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: '24px' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/admin/proposals/review')}
          style={{ marginBottom: '16px' }}
        >
          Quay lại
        </Button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <Title level={2}>Chi Tiết Đề Xuất</Title>
            <Paragraph>Xem và chỉnh sửa trước khi phê duyệt</Paragraph>
          </div>
          {proposal.status === 'APPROVED' ? (
            <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>
              Đã phê duyệt
            </Tag>
          ) : (
            <Tag color="warning" style={{ fontSize: 14, padding: '4px 12px' }}>
              Đang chờ duyệt
            </Tag>
          )}
        </div>
      </div>

      {messageAlert && (
        <Alert
          message={messageAlert.text}
          type={messageAlert.type}
          showIcon
          closable
          onClose={() => setMessageAlert(null)}
          style={{ marginBottom: '24px' }}
        />
      )}

      <Card title="Thông tin chung" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Đơn vị
            </Text>
            <div style={{ fontWeight: 500 }}>
              {proposal.don_vi.ten_don_vi} ({proposal.don_vi.ma_don_vi})
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Trạng thái
            </Text>
            <div style={{ fontWeight: 500 }}>
              {proposal.status === 'PENDING' ? (
                <Tag color="warning">Đang chờ duyệt</Tag>
              ) : proposal.status === 'APPROVED' ? (
                <Tag color="success">Đã phê duyệt</Tag>
              ) : (
                <Tag color="error">Từ chối</Tag>
              )}
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Người đề xuất
            </Text>
            <div style={{ fontWeight: 500 }}>{proposal.nguoi_de_xuat.ho_ten}</div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Ngày gửi
            </Text>
            <div style={{ fontWeight: 500 }}>
              {format(new Date(proposal.createdAt), 'dd/MM/yyyy HH:mm')}
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultActiveKey="danh_hieu" items={tabItems} />

      {proposal.status === 'PENDING' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 24 }}>
          <Button onClick={() => router.push('/admin/proposals/review')}>Hủy</Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => setRejectModalVisible(true)}
            size="large"
          >
            Từ chối
          </Button>
          <Button
            type="primary"
            icon={approving ? <LoadingOutlined /> : <CheckCircleOutlined />}
            onClick={handleApprove}
            loading={approving}
            size="large"
          >
            {approving ? 'Đang phê duyệt...' : 'Phê Duyệt'}
          </Button>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        title="Từ chối đề xuất"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setGhiChu('');
        }}
        onOk={handleReject}
        confirmLoading={rejecting}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        width={600}
      >
        <Alert
          message="Lưu ý"
          description="Vui lòng nhập lý do từ chối để Manager biết và chỉnh sửa lại đề xuất."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Input.TextArea
          placeholder="Nhập lý do từ chối (bắt buộc)"
          rows={5}
          value={ghiChu}
          onChange={e => setGhiChu(e.target.value)}
          showCount
          maxLength={500}
        />
      </Modal>

      {/* Decision Modal */}
      <DecisionModal
        visible={decisionModalVisible}
        onClose={() => setDecisionModalVisible(false)}
        onSuccess={handleDecisionSuccess}
        loaiKhenThuong="CA_NHAN_HANG_NAM"
      />
    </div>
  );
}
