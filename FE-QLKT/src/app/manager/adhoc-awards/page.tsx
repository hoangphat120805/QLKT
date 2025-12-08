'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Breadcrumb,
  Spin,
  message,
  Modal,
  Select,
  Input,
  Tooltip,
  Descriptions,
  Row,
  Col,
  List,
  Button,
} from 'antd';
import dayjs from 'dayjs';
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  FileOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { apiClient } from '@/lib/api-client';
import axiosInstance from '@/utils/axiosInstance';

const { Title, Text } = Typography;

// =============================================================================
// TYPES
// =============================================================================
interface AdhocAward {
  id: string;
  loai: string;
  doi_tuong: 'CA_NHAN' | 'TAP_THE';
  quan_nhan_id?: string;
  co_quan_don_vi_id?: string;
  don_vi_truc_thuoc_id?: string;
  hinh_thuc_khen_thuong: string;
  nam: number;
  cap_bac?: string;
  chuc_vu?: string;
  ghi_chu?: string;
  so_quyet_dinh?: string;
  files_quyet_dinh?: FileInfo[];
  createdAt: string;
  QuanNhan?: {
    id: string;
    ho_ten: string;
    cccd?: string;
    cap_bac?: string;
    CoQuanDonVi?: { ten_don_vi: string };
    DonViTrucThuoc?: { ten_don_vi: string };
    ChucVu?: { ten_chuc_vu: string };
  };
  CoQuanDonVi?: { id: string; ten_don_vi: string };
  DonViTrucThuoc?: { id: string; ten_don_vi: string; CoQuanDonVi?: { ten_don_vi: string } };
}

interface FileInfo {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface TableFilters {
  year: number | null;
  searchText: string;
  type: 'ALL' | 'CA_NHAN' | 'TAP_THE';
}

const INITIAL_TABLE_FILTERS: TableFilters = {
  year: null,
  searchText: '',
  type: 'ALL',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function ManagerAdhocAwardsPage() {
  // Data states
  const [awards, setAwards] = useState<AdhocAward[]>([]);
  const [loading, setLoading] = useState(false);

  // Detail modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailAward, setDetailAward] = useState<AdhocAward | null>(null);

  // Table filter states
  const [tableFilters, setTableFilters] = useState<TableFilters>(INITIAL_TABLE_FILTERS);
  const [searchDraft, setSearchDraft] = useState(INITIAL_TABLE_FILTERS.searchText);

  // =============================================================================
  // DATA FETCHING
  // =============================================================================
  const fetchAwards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAdhocAwards();
      const awardsData = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || res?.data?.items || [];
      setAwards(awardsData);
    } catch (err) {
      console.error('fetchAwards error', err);
      message.error('Không tải được danh sách khen thưởng đột xuất');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAwards();
  }, [fetchAwards]);

  // =============================================================================
  // FILE HANDLING
  // =============================================================================
  const handleOpenDecisionFile = async (soQuyetDinh: string, filePath?: string | null) => {
    try {
      let filename: string | null = null;

      if (filePath) {
        filename = filePath.split('/').pop() || null;
      } else {
        const response = await apiClient.getDecisionBySoQuyetDinh(soQuyetDinh);
        if (response.success && response.data?.file_path) {
          filename = response.data.file_path.split('/').pop() || null;
        }
      }

      if (filename) {
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
    } catch {
      message.error('Lỗi khi tải file quyết định');
    }
  };

  const handleDownloadFile = async (file: FileInfo) => {
    try {
      const response = await axiosInstance.get(`/api/adhoc-awards/uploads/${file.filename}`, {
        responseType: 'blob',
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Tải file thành công');
    } catch {
      message.error('Lỗi khi tải file');
    }
  };

  // =============================================================================
  // DETAIL MODAL HANDLERS
  // =============================================================================
  const handleOpenDetailModal = (award: AdhocAward) => {
    setDetailAward(award);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setDetailAward(null);
  };

  // =============================================================================
  // TABLE FILTER HANDLERS
  // =============================================================================
  const handleResetFilters = () => {
    setTableFilters(INITIAL_TABLE_FILTERS);
    setSearchDraft(INITIAL_TABLE_FILTERS.searchText);
  };

  // Get unique years from awards for filter dropdown
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(awards.map(a => a.nam))).sort((a, b) => b - a);
    return years;
  }, [awards]);

  // Debounce tìm kiếm 1s
  useEffect(() => {
    const handler = setTimeout(() => {
      setTableFilters(prev => ({ ...prev, searchText: searchDraft }));
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchDraft]);

  // =============================================================================
  // FILTERED TABLE DATA
  // =============================================================================
  const filteredAwards = useMemo(() => {
    return awards.filter(award => {
      // Filter by year
      if (tableFilters.year && award.nam !== tableFilters.year) {
        return false;
      }

      // Filter by type
      if (tableFilters.type !== 'ALL' && award.doi_tuong !== tableFilters.type) {
        return false;
      }

      // Filter by search text (name, decision number, note, award form)
      if (tableFilters.searchText) {
        const searchLower = tableFilters.searchText.toLowerCase();
        const name =
          award.doi_tuong === 'CA_NHAN'
            ? award.QuanNhan?.ho_ten || ''
            : award.CoQuanDonVi?.ten_don_vi || award.DonViTrucThuoc?.ten_don_vi || '';
        const decisionNumber = award.so_quyet_dinh || '';
        const note = award.ghi_chu || '';
        const awardForm = award.hinh_thuc_khen_thuong || '';

        if (
          !name.toLowerCase().includes(searchLower) &&
          !decisionNumber.toLowerCase().includes(searchLower) &&
          !note.toLowerCase().includes(searchLower) &&
          !awardForm.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [awards, tableFilters]);

  // =============================================================================
  // TABLE COLUMNS
  // =============================================================================
  const columns: TableColumnsType<AdhocAward> = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, index) => <div style={{ textAlign: 'center' }}>{index + 1}</div>,
    },
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 70,
      align: 'center',
      sorter: (a, b) => a.nam - b.nam,
      render: (text: number) => <div style={{ textAlign: 'center' }}>{text}</div>,
    },
    {
      title: 'Đối tượng',
      dataIndex: 'doi_tuong',
      key: 'doi_tuong',
      width: 100,
      align: 'center',
      render: (doiTuong: string) => (
        <div style={{ textAlign: 'center' }}>
          <Tag color={doiTuong === 'CA_NHAN' ? 'blue' : 'green'}>
            {doiTuong === 'CA_NHAN' ? (
              <>
                <UserOutlined /> Cá nhân
              </>
            ) : (
              <>
                <TeamOutlined /> Tập thể
              </>
            )}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Chi tiết đối tượng',
      key: 'target',
      ellipsis: true,
      render: (_, record) => {
        if (record.doi_tuong === 'CA_NHAN' && record.QuanNhan) {
          // Hiển thị cấp bậc/chức vụ từ DB (record.cap_bac, record.chuc_vu) nếu có
          const capBac = record.cap_bac || record.QuanNhan.cap_bac;
          const chucVu = record.chuc_vu || record.QuanNhan.ChucVu?.ten_chuc_vu;
          const subInfo = [capBac, chucVu].filter(Boolean).join(' - ');
          return (
            <div>
              <strong>{record.QuanNhan.ho_ten}</strong>
              {subInfo && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {subInfo}
                  </Text>
                </div>
              )}
            </div>
          );
        } else if (record.doi_tuong === 'TAP_THE') {
          const unitName = record.CoQuanDonVi?.ten_don_vi || record.DonViTrucThuoc?.ten_don_vi;
          return (
            <div>
              <strong>{unitName || '-'}</strong>
              {record.DonViTrucThuoc?.CoQuanDonVi && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {record.DonViTrucThuoc.CoQuanDonVi.ten_don_vi}
                  </Text>
                </div>
              )}
            </div>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: 'Hình thức khen thưởng',
      dataIndex: 'hinh_thuc_khen_thuong',
      key: 'hinh_thuc_khen_thuong',
      ellipsis: true,
      render: (text: string, record: AdhocAward) => (
        <div>
          <span>{text}</span>
          {record.so_quyet_dinh && (
            <div>
              <a
                onClick={e => {
                  e.stopPropagation();
                  handleOpenDecisionFile(record.so_quyet_dinh!);
                }}
                style={{ color: '#52c41a', cursor: 'pointer', fontSize: 12 }}
              >
                QĐ: {record.so_quyet_dinh}
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghi_chu',
      key: 'ghi_chu',
      width: 150,
      ellipsis: true,
      render: (text: string) =>
        text ? (
          <Tooltip title={text}>
            <Text style={{ fontSize: '13px' }}>{text}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={e => {
                e.stopPropagation();
                handleOpenDetailModal(record);
              }}
              size="small"
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // =============================================================================
  // RENDER
  // =============================================================================
  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { href: '/manager/dashboard', title: <HomeOutlined /> },
          { title: 'Khen thưởng đột xuất' },
        ]}
      />

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            Khen thưởng Đột xuất
          </Title>
          <Text type="secondary">Danh sách khen thưởng đột xuất trong đơn vị của bạn</Text>
        </div>

        {/* Filters */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#666' }}>
                <FilterOutlined /> Năm
              </label>
              <Select
                style={{ width: '100%' }}
                placeholder="Tất cả năm"
                value={tableFilters.year}
                onChange={value => setTableFilters(prev => ({ ...prev, year: value }))}
                allowClear
              >
                {availableYears.map(year => (
                  <Select.Option key={year} value={year}>
                    {year}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#666' }}>
                <FilterOutlined /> Loại
              </label>
              <Select
                style={{ width: '100%' }}
                placeholder="Tất cả loại"
                value={tableFilters.type}
                onChange={value => setTableFilters(prev => ({ ...prev, type: value }))}
              >
                <Select.Option value="ALL">Tất cả</Select.Option>
                <Select.Option value="CA_NHAN">Cá nhân</Select.Option>
                <Select.Option value="TAP_THE">Tập thể</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={16} md={8}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#666' }}>
                <SearchOutlined /> Tìm kiếm
              </label>
              <Input
                placeholder="Tên, số quyết định, hình thức, ghi chú..."
                value={searchDraft}
                onChange={e => setSearchDraft(e.target.value)}
                allowClear
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'transparent' }}>
                .
              </label>
              <Button icon={<ClearOutlined />} onClick={handleResetFilters} style={{ width: '100%' }}>
                Xóa lọc
              </Button>
            </Col>
          </Row>
          {(tableFilters.year || tableFilters.type !== 'ALL' || tableFilters.searchText) && (
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">
                Đang hiển thị <strong>{filteredAwards.length}</strong> / {awards.length} bản ghi
              </Text>
            </div>
          )}
        </Card>

        <Table
          columns={columns}
          dataSource={filteredAwards}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            showSizeChanger: true,
            showTotal: total => `Tổng ${total} bản ghi`,
          }}
          onRow={record => ({
            onClick: () => handleOpenDetailModal(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết khen thưởng đột xuất"
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        width={720}
        footer={
          <Button onClick={handleCloseDetailModal}>Đóng</Button>
        }
        centered
        maskClosable={false}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
            paddingRight: 8,
          },
        }}
      >
        {detailAward && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small" title="Thông tin đối tượng">
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Đối tượng">
                  <Tag color={detailAward.doi_tuong === 'CA_NHAN' ? 'blue' : 'green'}>
                    {detailAward.doi_tuong === 'CA_NHAN' ? (
                      <>
                        <UserOutlined /> Cá nhân
                      </>
                    ) : (
                      <>
                        <TeamOutlined /> Tập thể
                      </>
                    )}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Năm">
                  <strong>{detailAward.nam}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Chi tiết" span={2}>
                  {detailAward.doi_tuong === 'CA_NHAN' && detailAward.QuanNhan ? (
                    <div>
                      <strong>{detailAward.QuanNhan.ho_ten}</strong>
                      {/* Chỉ hiển thị cấp bậc/chức vụ từ DB đã lưu */}
                      {detailAward.cap_bac && (
                        <div>
                          <Text type="secondary">Cấp bậc: {detailAward.cap_bac}</Text>
                        </div>
                      )}
                      {detailAward.chuc_vu && (
                        <div>
                          <Text type="secondary">Chức vụ: {detailAward.chuc_vu}</Text>
                        </div>
                      )}
                    </div>
                  ) : detailAward.CoQuanDonVi ? (
                    <strong>{detailAward.CoQuanDonVi.ten_don_vi}</strong>
                  ) : detailAward.DonViTrucThuoc ? (
                    <div>
                      <strong>{detailAward.DonViTrucThuoc.ten_don_vi}</strong>
                      {detailAward.DonViTrucThuoc.CoQuanDonVi && (
                        <div>
                          <Text type="secondary">
                            thuộc {detailAward.DonViTrucThuoc.CoQuanDonVi.ten_don_vi}
                          </Text>
                        </div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card size="small" title="Thông tin khen thưởng">
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Hình thức khen thưởng">
                  <strong>{detailAward.hinh_thuc_khen_thuong}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Số quyết định">
                  {detailAward.so_quyet_dinh ? (
                    <a
                      onClick={() => handleOpenDecisionFile(detailAward.so_quyet_dinh!)}
                      style={{ color: '#52c41a', cursor: 'pointer' }}
                    >
                      {detailAward.so_quyet_dinh}
                    </a>
                  ) : (
                    <Text type="secondary">-</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú">
                  {detailAward.ghi_chu || <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {dayjs(detailAward.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {detailAward.files_quyet_dinh && detailAward.files_quyet_dinh.length > 0 && (
              <Card size="small" title={`File đính kèm (${detailAward.files_quyet_dinh.length} file)`}>
                <List
                  size="small"
                  dataSource={detailAward.files_quyet_dinh}
                  renderItem={file => (
                    <List.Item
                      actions={[
                        <Button
                          key="download"
                          type="link"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownloadFile(file)}
                        >
                          Tải xuống
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<FileOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                        title={file.originalName}
                        description={`${(file.size / 1024).toFixed(1)} KB - ${dayjs(file.uploadedAt).format('DD/MM/YYYY')}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
}
