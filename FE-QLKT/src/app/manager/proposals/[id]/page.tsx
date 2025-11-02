'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Descriptions,
  Button,
  Typography,
  Breadcrumb,
  Tag,
  Alert,
  Space,
  message,
  Divider,
  Table,
  Tabs,
} from 'antd';
import {
  HomeOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  TrophyOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { format } from 'date-fns';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

const { Title, Text } = Typography;

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  data_danh_hieu: DanhHieuItem[];
  data_thanh_tich: ThanhTichItem[];
  nguoi_duyet: any;
  ngay_duyet: string | null;
  ghi_chu: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ManagerProposalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params?.id as string;
  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (proposalId) {
      fetchProposalDetail();
    }
  }, [proposalId]);

  const fetchProposalDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProposalById(proposalId);

      if (response.success) {
        setProposal(response.data);
      } else {
        message.error(response.message || 'Không thể tải chi tiết đề xuất');
      }
    } catch (error: any) {
      message.error('Lỗi khi tải chi tiết đề xuất');
      console.error('Fetch proposal detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      const blob = await apiClient.downloadProposalExcel(proposalId.toString());

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `de-xuat-${proposalId}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('Tải file thành công');
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải file');
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: 'gold',
        icon: <ClockCircleOutlined />,
        text: 'Chờ duyệt',
      },
      APPROVED: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        text: 'Đã duyệt',
      },
      REJECTED: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        text: 'Từ chối',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Tag color={config.color} icon={config.icon} style={{ fontSize: 14, padding: '4px 12px' }}>
        {config.text}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Card loading={true} />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="space-y-6 p-6">
        <Alert message="Không tìm thấy đề xuất" type="error" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link href="/manager/dashboard">
            <HomeOutlined />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href="/manager/proposals">Đề xuất khen thưởng</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Chi tiết #{proposal.id}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/manager/proposals">
            <Button icon={<ArrowLeftOutlined />}>Quay lại</Button>
          </Link>
          <Title level={2} className="!mb-0">
            Chi tiết Đề xuất #{proposal.id}
          </Title>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadExcel}
          loading={downloading}
          size="large"
        >
          Tải file Excel
        </Button>
      </div>

      {/* Status Alert */}
      {proposal.status === 'REJECTED' && proposal.ghi_chu && (
        <Alert
          message="Đề xuất bị từ chối"
          description={
            <div>
              <Text strong>Lý do từ chối: </Text>
              <Text>{proposal.ghi_chu}</Text>
              <br />
              <br />
              <Text type="secondary">
                💡 Bạn có thể tải file Excel về, chỉnh sửa theo lý do từ chối, sau đó tạo đề xuất
                mới.
              </Text>
            </div>
          }
          type="error"
          showIcon
          icon={<CloseCircleOutlined />}
        />
      )}

      {proposal.status === 'APPROVED' && (
        <Alert
          message="Đề xuất đã được phê duyệt"
          description={
            <div>
              <Text>Dữ liệu đã được nhập vào hệ thống và cập nhật hồ sơ quân nhân.</Text>
              {proposal.ghi_chu && (
                <>
                  <br />
                  <br />
                  <Text strong>Ghi chú từ Admin: </Text>
                  <Text>{proposal.ghi_chu}</Text>
                </>
              )}
            </div>
          }
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      )}

      {proposal.status === 'PENDING' && (
        <Alert
          message="Đề xuất đang chờ duyệt"
          description="Đề xuất của bạn đang chờ Admin xem xét và phê duyệt."
          type="info"
          showIcon
          icon={<ClockCircleOutlined />}
        />
      )}

      {/* Proposal Info */}
      <Card title="Thông tin đề xuất" className="shadow-sm">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">#{proposal.id}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{getStatusTag(proposal.status)}</Descriptions.Item>
          <Descriptions.Item label="Đơn vị">
            {proposal.don_vi.ten_don_vi} ({proposal.don_vi.ma_don_vi})
          </Descriptions.Item>
          <Descriptions.Item label="Người đề xuất">
            {proposal.nguoi_de_xuat.ho_ten || proposal.nguoi_de_xuat.username}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày gửi">
            {format(new Date(proposal.createdAt), 'dd/MM/yyyy HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {format(new Date(proposal.updatedAt), 'dd/MM/yyyy HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Số danh hiệu">
            <Tag color="blue">{proposal.data_danh_hieu?.length || 0}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Số thành tích">
            <Tag color="cyan">{proposal.data_thanh_tich?.length || 0}</Tag>
          </Descriptions.Item>
          {proposal.nguoi_duyet && (
            <Descriptions.Item label="Người duyệt">
              {proposal.nguoi_duyet.ho_ten || proposal.nguoi_duyet.username}
            </Descriptions.Item>
          )}
          {proposal.ngay_duyet && (
            <Descriptions.Item label="Ngày duyệt">
              {format(new Date(proposal.ngay_duyet), 'dd/MM/yyyy HH:mm')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Data Tables */}
      <Card className="shadow-sm">
        <Tabs
          defaultActiveKey="danh_hieu"
          items={[
            {
              key: 'danh_hieu',
              label: (
                <span>
                  <TrophyOutlined style={{ marginRight: 8 }} />
                  Danh Hiệu ({proposal.data_danh_hieu?.length || 0})
                </span>
              ),
              children: (
                <Table
                  dataSource={proposal.data_danh_hieu || []}
                  rowKey={(_, index) => `dh_${index}`}
                  pagination={false}
                  scroll={{ x: 1000 }}
                  columns={[
                    {
                      title: 'STT',
                      key: 'index',
                      width: 60,
                      align: 'center',
                      render: (_, __, index) => index + 1,
                    },
                    {
                      title: 'CCCD',
                      dataIndex: 'cccd',
                      key: 'cccd',
                      width: 150,
                      render: (text) => <Text style={{ fontFamily: 'monospace' }}>{text}</Text>,
                    },
                    {
                      title: 'Họ tên',
                      dataIndex: 'ho_ten',
                      key: 'ho_ten',
                      render: (text) => <Text strong>{text}</Text>,
                    },
                    {
                      title: 'Năm',
                      dataIndex: 'nam',
                      key: 'nam',
                      width: 80,
                      align: 'center',
                    },
                    {
                      title: 'Danh hiệu',
                      dataIndex: 'danh_hieu',
                      key: 'danh_hieu',
                      width: 120,
                      render: (text) =>
                        text ? <Tag color="blue">{text}</Tag> : <Text type="secondary">-</Text>,
                    },
                    {
                      title: 'BKBQP',
                      dataIndex: 'nhan_bkbqp',
                      key: 'nhan_bkbqp',
                      width: 80,
                      align: 'center',
                      render: (value) =>
                        value ? (
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                        ) : (
                          <Text type="secondary">-</Text>
                        ),
                    },
                    {
                      title: 'Số QĐ BKBQP',
                      dataIndex: 'so_quyet_dinh_bkbqp',
                      key: 'so_quyet_dinh_bkbqp',
                      width: 150,
                      render: (text) => <Text type="secondary">{text || '-'}</Text>,
                    },
                    {
                      title: 'CSTĐTQ',
                      dataIndex: 'nhan_cstdtq',
                      key: 'nhan_cstdtq',
                      width: 80,
                      align: 'center',
                      render: (value) =>
                        value ? (
                          <CheckCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                        ) : (
                          <Text type="secondary">-</Text>
                        ),
                    },
                    {
                      title: 'Số QĐ CSTĐTQ',
                      dataIndex: 'so_quyet_dinh_cstdtq',
                      key: 'so_quyet_dinh_cstdtq',
                      width: 150,
                      render: (text) => <Text type="secondary">{text || '-'}</Text>,
                    },
                  ]}
                />
              ),
            },
            {
              key: 'thanh_tich',
              label: (
                <span>
                  <BookOutlined style={{ marginRight: 8 }} />
                  Thành Tích ({proposal.data_thanh_tich?.length || 0})
                </span>
              ),
              children: (
                <Table
                  dataSource={proposal.data_thanh_tich || []}
                  rowKey={(_, index) => `tt_${index}`}
                  pagination={false}
                  scroll={{ x: 800 }}
                  columns={[
                    {
                      title: 'STT',
                      key: 'index',
                      width: 60,
                      align: 'center',
                      render: (_, __, index) => index + 1,
                    },
                    {
                      title: 'CCCD',
                      dataIndex: 'cccd',
                      key: 'cccd',
                      width: 150,
                      render: (text) => <Text style={{ fontFamily: 'monospace' }}>{text}</Text>,
                    },
                    {
                      title: 'Họ tên',
                      dataIndex: 'ho_ten',
                      key: 'ho_ten',
                      render: (text) => <Text strong>{text}</Text>,
                    },
                    {
                      title: 'Năm',
                      dataIndex: 'nam',
                      key: 'nam',
                      width: 80,
                      align: 'center',
                    },
                    {
                      title: 'Loại',
                      dataIndex: 'loai',
                      key: 'loai',
                      width: 100,
                      render: (text) => (
                        <Tag color={text === 'NCKH' ? 'blue' : 'green'}>{text}</Tag>
                      ),
                    },
                    {
                      title: 'Mô tả',
                      dataIndex: 'mo_ta',
                      key: 'mo_ta',
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'status',
                      key: 'status',
                      width: 120,
                      render: (text) =>
                        text === 'APPROVED' ? (
                          <Tag color="success">Đã duyệt</Tag>
                        ) : (
                          <Tag color="warning">Chờ duyệt</Tag>
                        ),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Action Buttons */}
      {proposal.status === 'REJECTED' && (
        <Card className="shadow-sm bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={4} className="!mb-0">
              Hướng dẫn sửa đề xuất
            </Title>
            <Text>
              1. Nhấn nút "Tải file Excel" ở trên để tải file về
              <br />
              2. Mở file và chỉnh sửa theo lý do từ chối
              <br />
              3. Lưu file sau khi đã sửa
              <br />
              4. Tạo đề xuất mới với file đã chỉnh sửa
            </Text>
            <Link href="/manager/proposals/create">
              <Button type="primary" size="large">
                Tạo đề xuất mới
              </Button>
            </Link>
          </Space>
        </Card>
      )}
    </div>
  );
}
