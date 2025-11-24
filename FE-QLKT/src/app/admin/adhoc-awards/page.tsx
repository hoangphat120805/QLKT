'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Breadcrumb,
  Spin,
  message,
  Modal,
  Select,
  InputNumber,
  Input,
  Upload,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileOutlined,
  DownloadOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { TableColumnsType, UploadFile } from 'antd';
import { apiClient } from '@/lib/api-client';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface AdhocAward {
  id: string;
  loai: 'CA_NHAN' | 'TAP_THE';
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
    ho_ten: string;
    cccd?: string;
    CoQuanDonVi?: { ten_don_vi: string };
    DonViTrucThuoc?: { ten_don_vi: string };
  };
  CoQuanDonVi?: { ten_don_vi: string };
  DonViTrucThuoc?: { ten_don_vi: string; CoQuanDonVi?: { ten_don_vi: string } };
}

interface FileInfo {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface Personnel {
  id: string;
  ho_ten: string;
  cccd?: string;
}

interface Unit {
  id: string;
  ten_don_vi: string;
  ma_don_vi: string;
}

export default function AdhocAwardsPage() {
  const [awards, setAwards] = useState<AdhocAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAward, setEditingAward] = useState<AdhocAward | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [subUnits, setSubUnits] = useState<Unit[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    type: 'CA_NHAN' as 'CA_NHAN' | 'TAP_THE',
    year: new Date().getFullYear(),
    awardForm: '',
    personnelId: '',
    unitId: '',
    unitType: 'CO_QUAN_DON_VI' as 'CO_QUAN_DON_VI' | 'DON_VI_TRUC_THUOC',
    rank: '',
    position: '',
    note: '',
    decisionNumber: '',
  });
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    fetchAwards();
    fetchPersonnel();
    fetchUnits();
  }, []);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/adhoc-awards', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setAwards(result.data);
      }
    } catch (error) {
      console.error('Error fetching ad-hoc awards:', error);
      message.error('Không thể tải danh sách khen thưởng đột xuất');
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonnel = async () => {
    try {
      const response = await fetch('/api/personnel?limit=10000', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setPersonnel(result.data.personnel || []);
      }
    } catch (error) {
      console.error('Error fetching personnel:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const [unitsRes, subUnitsRes] = await Promise.all([
        fetch('/api/units', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/sub-units', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      const unitsResult = await unitsRes.json();
      const subUnitsResult = await subUnitsRes.json();

      if (unitsResult.success) {
        setUnits(unitsResult.data || []);
      }
      if (subUnitsResult.success) {
        setSubUnits(subUnitsResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleCreate = () => {
    setEditingAward(null);
    setFormData({
      type: 'CA_NHAN',
      year: new Date().getFullYear(),
      awardForm: '',
      personnelId: '',
      unitId: '',
      unitType: 'CO_QUAN_DON_VI',
      rank: '',
      position: '',
      note: '',
      decisionNumber: '',
    });
    setFileList([]);
    setModalVisible(true);
  };

  const handleEdit = (award: AdhocAward) => {
    setEditingAward(award);
    setFormData({
      type: award.loai,
      year: award.nam,
      awardForm: award.hinh_thuc_khen_thuong,
      personnelId: award.quan_nhan_id || '',
      unitId: award.co_quan_don_vi_id || award.don_vi_truc_thuoc_id || '',
      unitType: award.co_quan_don_vi_id ? 'CO_QUAN_DON_VI' : 'DON_VI_TRUC_THUOC',
      rank: award.cap_bac || '',
      position: award.chuc_vu || '',
      note: award.ghi_chu || '',
      decisionNumber: award.so_quyet_dinh || '',
    });

    // Convert existing files to UploadFile format
    const existingFiles: UploadFile[] =
      award.files_quyet_dinh?.map((file, index) => ({
        uid: `existing-${index}`,
        name: file.originalName,
        status: 'done',
        url: `/${file.path}`,
      })) || [];
    setFileList(existingFiles);

    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/adhoc-awards/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        message.success('Xóa khen thưởng đột xuất thành công');
        fetchAwards();
      } else {
        message.error(result.message || 'Xóa khen thưởng đột xuất thất bại');
      }
    } catch (error) {
      console.error('Error deleting ad-hoc award:', error);
      message.error('Xóa khen thưởng đột xuất thất bại');
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.awardForm || !formData.year) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.type === 'CA_NHAN' && !formData.personnelId) {
      message.error('Vui lòng chọn quân nhân');
      return;
    }

    if (formData.type === 'TAP_THE' && !formData.unitId) {
      message.error('Vui lòng chọn đơn vị');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('year', formData.year.toString());
      formDataToSend.append('awardForm', formData.awardForm);

      if (formData.type === 'CA_NHAN') {
        formDataToSend.append('personnelId', formData.personnelId);
        if (formData.rank) formDataToSend.append('rank', formData.rank);
        if (formData.position) formDataToSend.append('position', formData.position);
      } else {
        formDataToSend.append('unitId', formData.unitId);
        formDataToSend.append('unitType', formData.unitType);
      }

      if (formData.note) formDataToSend.append('note', formData.note);
      if (formData.decisionNumber) formDataToSend.append('decisionNumber', formData.decisionNumber);

      // Add files
      fileList.forEach(file => {
        if (file.originFileObj) {
          formDataToSend.append('files', file.originFileObj);
        }
      });

      // If editing, include files to remove
      if (editingAward) {
        const existingFileCount = editingAward.files_quyet_dinh?.length || 0;
        const currentExistingFiles = fileList.filter(f => f.uid.startsWith('existing-'));
        const removedIndexes: number[] = [];

        for (let i = 0; i < existingFileCount; i++) {
          const existingFile = currentExistingFiles.find(f => f.uid === `existing-${i}`);
          if (!existingFile) {
            removedIndexes.push(i);
          }
        }

        if (removedIndexes.length > 0) {
          formDataToSend.append('removeFileIndexes', JSON.stringify(removedIndexes));
        }
      }

      const url = editingAward ? `/api/adhoc-awards/${editingAward.id}` : '/api/adhoc-awards';
      const method = editingAward ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();
      if (result.success) {
        message.success(
          editingAward
            ? 'Cập nhật khen thưởng đột xuất thành công'
            : 'Tạo khen thưởng đột xuất thành công'
        );
        setModalVisible(false);
        fetchAwards();
      } else {
        message.error(result.message || 'Thao tác thất bại');
      }
    } catch (error) {
      console.error('Error submitting ad-hoc award:', error);
      message.error('Thao tác thất bại');
    }
  };

  const columns: TableColumnsType<AdhocAward> = [
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 80,
      sorter: (a, b) => a.nam - b.nam,
    },
    {
      title: 'Loại',
      dataIndex: 'loai',
      key: 'loai',
      width: 100,
      render: (loai: string) => (
        <Tag color={loai === 'CA_NHAN' ? 'blue' : 'green'}>
          {loai === 'CA_NHAN' ? (
            <>
              <UserOutlined /> Cá nhân
            </>
          ) : (
            <>
              <TeamOutlined /> Tập thể
            </>
          )}
        </Tag>
      ),
    },
    {
      title: 'Đối tượng',
      key: 'target',
      width: 200,
      render: (_, record) => {
        if (record.loai === 'CA_NHAN' && record.QuanNhan) {
          return (
            <div>
              <div>
                <strong>{record.QuanNhan.ho_ten}</strong>
              </div>
              {record.QuanNhan.cccd && <Text type="secondary">CCCD: {record.QuanNhan.cccd}</Text>}
            </div>
          );
        } else if (record.loai === 'TAP_THE') {
          if (record.CoQuanDonVi) {
            return <Text>{record.CoQuanDonVi.ten_don_vi}</Text>;
          } else if (record.DonViTrucThuoc) {
            return (
              <div>
                <div>{record.DonViTrucThuoc.ten_don_vi}</div>
                {record.DonViTrucThuoc.CoQuanDonVi && (
                  <Text type="secondary">({record.DonViTrucThuoc.CoQuanDonVi.ten_don_vi})</Text>
                )}
              </div>
            );
          }
        }
        return '-';
      },
    },
    {
      title: 'Hình thức khen thưởng',
      dataIndex: 'hinh_thuc_khen_thuong',
      key: 'hinh_thuc_khen_thuong',
      width: 200,
    },
    {
      title: 'Số quyết định',
      dataIndex: 'so_quyet_dinh',
      key: 'so_quyet_dinh',
      width: 150,
      render: text => text || '-',
    },
    {
      title: 'File đính kèm',
      key: 'files',
      width: 120,
      render: (_, record) => {
        const fileCount = record.files_quyet_dinh?.length || 0;
        return fileCount > 0 ? (
          <Tag color="blue">
            <FileOutlined /> {fileCount} file
          </Tag>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa khen thưởng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button type="link" danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { href: '/admin/dashboard', title: <HomeOutlined /> },
          { title: 'Khen thưởng đột xuất' },
        ]}
      />

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Khen thưởng Đột xuất
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm khen thưởng
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={awards}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showTotal: total => `Tổng ${total} bản ghi`,
          }}
        />
      </Card>

      <Modal
        title={editingAward ? 'Chỉnh sửa khen thưởng đột xuất' : 'Thêm khen thưởng đột xuất'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
        okText={editingAward ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <label>
              Loại <span style={{ color: 'red' }}>*</span>
            </label>
            <Select
              style={{ width: '100%' }}
              value={formData.type}
              onChange={value => setFormData({ ...formData, type: value })}
              disabled={!!editingAward}
            >
              <Select.Option value="CA_NHAN">Cá nhân</Select.Option>
              <Select.Option value="TAP_THE">Tập thể</Select.Option>
            </Select>
          </div>

          <div>
            <label>
              Năm <span style={{ color: 'red' }}>*</span>
            </label>
            <InputNumber
              style={{ width: '100%' }}
              value={formData.year}
              onChange={value =>
                setFormData({ ...formData, year: value || new Date().getFullYear() })
              }
              min={2000}
              max={2100}
            />
          </div>

          {formData.type === 'CA_NHAN' ? (
            <div>
              <label>
                Quân nhân <span style={{ color: 'red' }}>*</span>
              </label>
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="Chọn quân nhân"
                value={formData.personnelId || undefined}
                onChange={value => setFormData({ ...formData, personnelId: value })}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={personnel.map(p => ({
                  label: `${p.ho_ten}${p.cccd ? ` - ${p.cccd}` : ''}`,
                  value: p.id,
                }))}
                disabled={!!editingAward}
              />
            </div>
          ) : (
            <>
              <div>
                <label>
                  Loại đơn vị <span style={{ color: 'red' }}>*</span>
                </label>
                <Select
                  style={{ width: '100%' }}
                  value={formData.unitType}
                  onChange={value => setFormData({ ...formData, unitType: value, unitId: '' })}
                  disabled={!!editingAward}
                >
                  <Select.Option value="CO_QUAN_DON_VI">Cơ quan đơn vị</Select.Option>
                  <Select.Option value="DON_VI_TRUC_THUOC">Đơn vị trực thuộc</Select.Option>
                </Select>
              </div>

              <div>
                <label>
                  Đơn vị <span style={{ color: 'red' }}>*</span>
                </label>
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn đơn vị"
                  value={formData.unitId || undefined}
                  onChange={value => setFormData({ ...formData, unitId: value })}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={(formData.unitType === 'CO_QUAN_DON_VI' ? units : subUnits).map(u => ({
                    label: u.ten_don_vi,
                    value: u.id,
                  }))}
                  disabled={!!editingAward}
                />
              </div>
            </>
          )}

          <div>
            <label>
              Hình thức khen thưởng <span style={{ color: 'red' }}>*</span>
            </label>
            <Input
              value={formData.awardForm}
              onChange={e => setFormData({ ...formData, awardForm: e.target.value })}
              placeholder='Ví dụ: "Giấy khen của abc", "Bằng khen của def"'
            />
          </div>

          {formData.type === 'CA_NHAN' && (
            <>
              <div>
                <label>Cấp bậc</label>
                <Input
                  value={formData.rank}
                  onChange={e => setFormData({ ...formData, rank: e.target.value })}
                  placeholder="Cấp bậc tại thời điểm được khen thưởng"
                />
              </div>

              <div>
                <label>Chức vụ</label>
                <Input
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Chức vụ tại thời điểm được khen thưởng"
                />
              </div>
            </>
          )}

          <div>
            <label>Số quyết định</label>
            <Input
              value={formData.decisionNumber}
              onChange={e => setFormData({ ...formData, decisionNumber: e.target.value })}
              placeholder="Số quyết định khen thưởng"
            />
          </div>

          <div>
            <label>Ghi chú</label>
            <TextArea
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              placeholder="Ghi chú bổ sung"
              rows={3}
            />
          </div>

          <div>
            <label>File đính kèm</label>
            <Upload
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            >
              <Button icon={<DownloadOutlined />}>Chọn file</Button>
            </Upload>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Hỗ trợ: PDF, Word, Excel, hình ảnh. Tối đa 10 file.
            </Text>
          </div>
        </Space>
      </Modal>
    </div>
  );
}
