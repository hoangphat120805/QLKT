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
  Steps,
  Alert,
  AutoComplete,
  DatePicker,
} from 'antd';
import dayjs from 'dayjs';
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
import axiosInstance from '@/utils/axiosInstance';

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
  files_quyet_dinh?: any[];
  createdAt: string;
  QuanNhan?: {
    ho_ten: string;
    cccd?: string;
    CoQuanDonVi?: { ten_don_vi: string };
  };
  CoQuanDonVi?: { ten_don_vi: string };
  DonViTrucThuoc?: { ten_don_vi: string; CoQuanDonVi?: { ten_don_vi: string } };
}
export default function Page() {
  const [awards, setAwards] = useState<AdhocAward[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAward, setEditingAward] = useState<AdhocAward | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [decisionFileList, setDecisionFileList] = useState<UploadFile[]>([]);
  const [formData, setFormData] = useState<any>({
    type: 'CA_NHAN',
    year: new Date().getFullYear(),
    awardForm: '',
    personnelIds: [] as string[], // Changed to array for multiple selection
    unitIds: [] as string[], // Changed to array for multiple selection
    unitType: 'CO_QUAN_DON_VI',
    note: '',
    decisionNumber: '',
    decisionYear: new Date().getFullYear(),
    signer: '',
    signDate: '',
    currentStep: 0,
  });
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [subUnits, setSubUnits] = useState<any[]>([]);
  const [decisionOptions, setDecisionOptions] = useState<any[]>([]);
  const [searchingDecision, setSearchingDecision] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<any>(null);
  const [personnelFilters, setPersonnelFilters] = useState({
    coQuanId: '',
    donViId: '',
    searchName: '',
  });
  const [unitFilters, setUnitFilters] = useState({
    type: 'ALL',
  });

  const handleSearchDecision = async (value: string) => {
    if (!value || value.trim().length === 0) {
      setDecisionOptions([]);
      return;
    }

    try {
      setSearchingDecision(true);
      const response = await apiClient.autocompleteDecisions(value.trim(), 10);
      if (response.success && response.data) {
        setDecisionOptions(
          response.data.map((item: any) => ({
            value: item.so_quyet_dinh,
            label: `${item.so_quyet_dinh} - ${item.nguoi_ky} (${dayjs(item.ngay_ky).format(
              'DD/MM/YYYY'
            )})`,
          }))
        );
      } else {
        setDecisionOptions([]);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      setDecisionOptions([]);
    } finally {
      setSearchingDecision(false);
    }
  };

  const handleDecisionSelect = async (value: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getDecisionBySoQuyetDinh(value);
      if (response.success && response.data) {
        const decision = response.data;
        setSelectedDecision(decision);

        // Auto-fill form
        setFormData({
          ...formData,
          decisionNumber: decision.so_quyet_dinh,
          decisionYear: decision.nam,
          signDate: dayjs(decision.ngay_ky).format('YYYY-MM-DD'),
          signer: decision.nguoi_ky,
          note: decision.ghi_chu || formData.note,
        });

        message.info('Đã tải thông tin quyết định từ hệ thống. Bạn có thể chỉnh sửa nếu cần.');
      }
    } catch (error: any) {
      message.error('Lỗi khi tải thông tin quyết định');
    } finally {
      setLoading(false);
    }
  };

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAdhocAwards();
      // Handle various response structures
      const awardsData = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || res?.data?.items || [];
      setAwards(awardsData);
    } catch (err) {
      console.error('fetchAwards error', err);
      message.error('Không tải được khen thưởng đột xuất');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
    fetchPersonnelAndUnits();
  }, []);

  const fetchPersonnelAndUnits = async () => {
    try {
      const [personnelRes, allUnitsRes] = await Promise.all([
        apiClient.getPersonnel({ limit: 9999 }),
        apiClient.getUnits(), // API này trả về tất cả units
      ]);

      console.log('Personnel response:', personnelRes);
      console.log('All units response:', allUnitsRes);

      // Handle paginated response or direct array
      const personnelData = Array.isArray(personnelRes?.data)
        ? personnelRes.data
        : personnelRes?.data?.items ||
          personnelRes?.data?.personnel ||
          personnelRes?.data?.data ||
          [];

      const allUnitsData = Array.isArray(allUnitsRes?.data)
        ? allUnitsRes.data
        : allUnitsRes?.data?.items || allUnitsRes?.data?.data || [];

      console.log('Extracted personnel:', personnelData);
      console.log('All units data:', allUnitsData);

      // Phân loại dựa trên co_quan_don_vi_id:
      // - Cơ quan đơn vị: KHÔNG có co_quan_don_vi_id
      // - Đơn vị trực thuộc: CÓ co_quan_don_vi_id
      const coQuanDonVi = allUnitsData.filter((u: any) => !u.co_quan_don_vi_id);
      const donViTrucThuoc = allUnitsData.filter((u: any) => u.co_quan_don_vi_id);

      console.log('Filtered cơ quan đơn vị (no co_quan_don_vi_id):', coQuanDonVi);
      console.log('Filtered đơn vị trực thuộc (has co_quan_don_vi_id):', donViTrucThuoc);

      setPersonnel(personnelData);
      setUnits(coQuanDonVi);
      setSubUnits(donViTrucThuoc);
    } catch (err) {
      console.error('fetchPersonnelAndUnits error', err);
      message.error('Không tải được dữ liệu đối tượng');
    }
  };

  const handleCreate = () => {
    setEditingAward(null as any);
    setFormData({
      type: 'CA_NHAN',
      year: new Date().getFullYear(),
      awardForm: '',
      personnelIds: [],
      unitIds: [],
      unitType: 'CO_QUAN_DON_VI',
      note: '',
      decisionNumber: '',
      decisionYear: new Date().getFullYear(),
      signer: '',
      signDate: '',
      currentStep: 0,
    });
    setPersonnelFilters({ coQuanId: '', donViId: '', searchName: '' });
    setUnitFilters({ type: 'ALL' });
    setFileList([]);
    setDecisionFileList([]);
    setSelectedDecision(null);
    setDecisionOptions([]);
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
      const result = await apiClient.deleteAdhocAward(id);
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

  const handleOpenDecisionFile = async (soQuyetDinh: string, filePath?: string | null) => {
    try {
      let filename: string | null = null;

      // Nếu đã có file_path trong record, dùng luôn
      if (filePath) {
        filename = filePath.split('/').pop() || null;
      } else {
        // Nếu chưa có file_path, tìm từ DB dựa trên số quyết định
        const response = await apiClient.getDecisionBySoQuyetDinh(soQuyetDinh);
        if (response.success && response.data?.file_path) {
          filename = response.data.file_path.split('/').pop() || null;
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

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.awardForm || !formData.year) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.type === 'CA_NHAN' && formData.personnelIds.length === 0) {
      message.error('Vui lòng chọn ít nhất một quân nhân');
      return;
    }

    if (formData.type === 'TAP_THE' && formData.unitIds.length === 0) {
      message.error('Vui lòng chọn ít nhất một đơn vị');
      return;
    }

    try {
      // Create one award per selected target
      const targetIds = formData.type === 'CA_NHAN' ? formData.personnelIds : formData.unitIds;

      for (const targetId of targetIds) {
        const formDataToSend = new FormData();
        formDataToSend.append('type', formData.type);
        formDataToSend.append('year', formData.year.toString());
        formDataToSend.append('awardForm', formData.awardForm);

        if (formData.type === 'CA_NHAN') {
          formDataToSend.append('personnelId', targetId);
          if (formData.rank) formDataToSend.append('rank', formData.rank);
          if (formData.position) formDataToSend.append('position', formData.position);
        } else {
          // Tìm đơn vị thực tế để lấy type đúng
          const unit = units.find(u => u.id === targetId) || subUnits.find(s => s.id === targetId);
          const actualUnitType = units.find(u => u.id === targetId)
            ? 'CO_QUAN_DON_VI'
            : 'DON_VI_TRUC_THUOC';

          formDataToSend.append('unitId', targetId);
          formDataToSend.append('unitType', actualUnitType);
          if (actualUnitType === 'CO_QUAN_DON_VI') {
            formDataToSend.append('co_quan_don_vi_id', targetId);
          } else {
            formDataToSend.append('don_vi_truc_thuoc_id', targetId);
          }
        }

        if (formData.note) formDataToSend.append('note', formData.note);
        if (formData.decisionNumber)
          formDataToSend.append('decisionNumber', formData.decisionNumber);

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

        const result = editingAward
          ? await apiClient.updateAdhocAward(editingAward.id, formDataToSend)
          : await apiClient.createAdhocAward(formDataToSend);

        if (!result.success) {
          message.error(result.message || 'Thao tác thất bại');
          return;
        }
      }

      message.success(
        editingAward
          ? 'Cập nhật khen thưởng đột xuất thành công'
          : `Tạo thành công ${targetIds.length} khen thưởng đột xuất`
      );
      setModalVisible(false);
      fetchAwards();
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
      render: (text: string, record: AdhocAward) => {
        if (!text) return '-';

        return (
          <a
            onClick={() => handleOpenDecisionFile(text)}
            style={{ color: '#52c41a', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {text}
          </a>
        );
      },
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

  const filteredPersonnel = personnel.filter(p => {
    if (personnelFilters.coQuanId && p.co_quan_don_vi_id !== personnelFilters.coQuanId)
      return false;
    if (personnelFilters.donViId && p.don_vi_truc_thuoc_id !== personnelFilters.donViId)
      return false;
    if (
      personnelFilters.searchName &&
      !p.ho_ten.toLowerCase().includes(personnelFilters.searchName.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredUnits = [...units, ...subUnits].filter(u => {
    if (unitFilters.type === 'CO_QUAN' && subUnits.some(s => s.id === u.id)) return false;
    if (unitFilters.type === 'DON_VI' && units.some(s => s.id === u.id)) return false;
    return true;
  });

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
        onCancel={() => {
          setModalVisible(false);
          setFormData({ ...formData, currentStep: 0 });
        }}
        width={1080}
        footer={null}
      >
        <Steps current={formData.currentStep || 0} size="small" style={{ marginBottom: 16 }}>
          <Steps.Step title="Thông tin cơ bản" />
          <Steps.Step title="Đối tượng" />
          <Steps.Step title="Tải tệp lên" />
          <Steps.Step title="Thêm quyết định" />
          <Steps.Step title="Xem lại" />
        </Steps>

        <div style={{ minHeight: 200 }}>
          {/* Step 0: Basic Info */}
          {(formData.currentStep || 0) === 0 && (
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
            </Space>
          )}

          {/* Step 1: Target */}
          {(formData.currentStep || 0) === 1 && (
            <div>
              {formData.type === 'CA_NHAN' ? (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary">
                      Đã chọn:{' '}
                      <strong style={{ color: '#1890ff' }}>{formData.personnelIds.length}</strong>{' '}
                      quân nhân
                    </Text>
                  </div>
                  <Space direction="vertical" size="small" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label>Cơ quan đơn vị</label>
                        <Select
                          style={{ width: '100%' }}
                          value={personnelFilters.coQuanId}
                          onChange={value => {
                            setPersonnelFilters({
                              ...personnelFilters,
                              coQuanId: value,
                              donViId: '',
                            });
                          }}
                          allowClear
                          placeholder="Chọn cơ quan đơn vị"
                        >
                          {units.map(unit => (
                            <Select.Option key={unit.id} value={unit.id}>
                              {unit.ten_don_vi}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label>Đơn vị trực thuộc</label>
                        <Select
                          style={{ width: '100%' }}
                          value={personnelFilters.donViId}
                          onChange={value =>
                            setPersonnelFilters({ ...personnelFilters, donViId: value })
                          }
                          disabled={!personnelFilters.coQuanId}
                          allowClear
                          placeholder="Chọn đơn vị trực thuộc"
                        >
                          {subUnits
                            .filter(s => s.co_quan_don_vi_id === personnelFilters.coQuanId)
                            .map(sub => (
                              <Select.Option key={sub.id} value={sub.id}>
                                {sub.ten_don_vi}
                              </Select.Option>
                            ))}
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label>Tìm kiếm theo tên</label>
                      <Input
                        value={personnelFilters.searchName}
                        onChange={e =>
                          setPersonnelFilters({ ...personnelFilters, searchName: e.target.value })
                        }
                        placeholder="Nhập tên quân nhân"
                      />
                    </div>
                  </Space>
                  <Table
                    rowSelection={{
                      selectedRowKeys: formData.personnelIds,
                      onChange: (selectedRowKeys: React.Key[]) => {
                        setFormData({ ...formData, personnelIds: selectedRowKeys as string[] });
                      },
                    }}
                    columns={[
                      {
                        title: 'Họ tên',
                        dataIndex: 'ho_ten',
                        key: 'ho_ten',
                        width: 180,
                        render: (text: string, record: any) => (
                          <div>
                            <div>
                              <strong>{text}</strong>
                            </div>
                            {record.cccd && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                CCCD: {record.cccd}
                              </Text>
                            )}
                          </div>
                        ),
                      },
                      {
                        title: 'Ngày sinh',
                        dataIndex: 'ngay_sinh',
                        key: 'ngay_sinh',
                        width: 110,
                        render: (date: string) => {
                          if (!date) return '-';
                          try {
                            return new Date(date).toLocaleDateString('vi-VN');
                          } catch {
                            return '-';
                          }
                        },
                      },
                      {
                        title: 'Giới tính',
                        dataIndex: 'gioi_tinh',
                        key: 'gioi_tinh',
                        width: 90,
                        render: (gender: string) => {
                          if (gender === 'NAM') return 'Nam';
                          if (gender === 'NU') return 'Nữ';
                          return '-';
                        },
                      },
                      {
                        title: 'Cấp bậc',
                        dataIndex: 'cap_bac',
                        key: 'cap_bac',
                        width: 120,
                        render: (text: string) => text || '-',
                      },
                      {
                        title: 'Chức vụ',
                        key: 'chuc_vu',
                        width: 150,
                        render: (_: any, record: any) => record.ChucVu?.ten_chuc_vu || '-',
                      },
                    ]}
                    dataSource={filteredPersonnel}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    scroll={{ y: 300, x: 800 }}
                    size="small"
                  />
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary">
                      Đã chọn:{' '}
                      <strong style={{ color: '#1890ff' }}>{formData.unitIds.length}</strong> đơn vị
                    </Text>
                  </div>
                  <Space direction="vertical" size="small" style={{ marginBottom: 16 }}>
                    <div>
                      <label>Loại đơn vị</label>
                      <Select
                        style={{ width: '100%' }}
                        value={unitFilters.type}
                        onChange={value => setUnitFilters({ ...unitFilters, type: value })}
                      >
                        <Select.Option value="ALL">Tất cả</Select.Option>
                        <Select.Option value="CO_QUAN">Cơ quan đơn vị</Select.Option>
                        <Select.Option value="DON_VI">Đơn vị trực thuộc</Select.Option>
                      </Select>
                    </div>
                  </Space>
                  <Table
                    rowSelection={{
                      selectedRowKeys: formData.unitIds,
                      onChange: (selectedRowKeys: React.Key[]) => {
                        setFormData({ ...formData, unitIds: selectedRowKeys as string[] });
                      },
                    }}
                    columns={[
                      {
                        title: 'Tên đơn vị',
                        dataIndex: 'ten_don_vi',
                        key: 'ten_don_vi',
                        width: 300,
                      },
                      {
                        title: 'Loại',
                        key: 'loai',
                        width: 150,
                        render: (_: any, record: any) => {
                          const isCoQuan = units.find(u => u.id === record.id);
                          return (
                            <Tag color={isCoQuan ? 'blue' : 'green'}>
                              {isCoQuan ? 'Cơ quan đơn vị' : 'Đơn vị trực thuộc'}
                            </Tag>
                          );
                        },
                      },
                    ]}
                    dataSource={filteredUnits}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    scroll={{ y: 300, x: 500 }}
                    size="small"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Upload Files */}
          {(formData.currentStep || 0) === 2 && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600 }}>Tải tệp lên</label>
                <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                  Tải lên các tệp đính kèm (nếu có)
                </Text>
              </div>
              <Upload
                fileList={fileList}
                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                beforeUpload={() => false}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              >
                <Button icon={<DownloadOutlined />} size="large" style={{ width: '100%' }}>
                  Chọn file
                </Button>
              </Upload>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                Hỗ trợ: PDF, Word, Excel, hình ảnh. Tối đa 10 file.
              </Text>
            </div>
          )}

          {/* Step 3: Add Decision */}
          {(formData.currentStep || 0) === 3 && (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {selectedDecision && (
                <Alert
                  message="Đã tải quyết định từ hệ thống"
                  description={`Quyết định "${selectedDecision.so_quyet_dinh}" đã tồn tại. Thông tin đã được tự động điền.`}
                  type="success"
                  showIcon
                  closable
                  onClose={() => setSelectedDecision(null)}
                  style={{ marginBottom: 8 }}
                />
              )}

              <div>
                <label>
                  Số quyết định <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>
                  Nhập để tìm kiếm quyết định đã có hoặc tạo mới
                </div>
                <AutoComplete
                  options={decisionOptions}
                  onSearch={handleSearchDecision}
                  onSelect={handleDecisionSelect}
                  placeholder="Nhập số quyết định (VD: 123/QĐ-BQP)"
                  notFoundContent={searchingDecision ? <Spin size="small" /> : null}
                  style={{ width: '100%' }}
                >
                  <Input
                    size="large"
                    value={formData.decisionNumber}
                    onChange={e => setFormData({ ...formData, decisionNumber: e.target.value })}
                    style={{ fontSize: '14px', height: '40px' }}
                  />
                </AutoComplete>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label>
                    Năm <span style={{ color: 'red' }}>*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.decisionYear}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        decisionYear: parseInt(e.target.value) || new Date().getFullYear(),
                      })
                    }
                    placeholder="2024"
                    size="large"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label>
                    Ngày ký quyết định <span style={{ color: 'red' }}>*</span>
                  </label>
                  <DatePicker
                    value={formData.signDate ? dayjs(formData.signDate) : null}
                    onChange={date =>
                      setFormData({
                        ...formData,
                        signDate: date ? dayjs(date).format('YYYY-MM-DD') : '',
                      })
                    }
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày ký"
                    size="large"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label>
                  Người ký quyết định <span style={{ color: 'red' }}>*</span>
                </label>
                <Input
                  value={formData.signer}
                  onChange={e => setFormData({ ...formData, signer: e.target.value })}
                  placeholder="VD: Trung tướng Nguyễn Văn A - Chính ủy"
                  size="large"
                />
              </div>

              <div>
                <label>Ghi chú</label>
                <TextArea
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ghi chú bổ sung (không bắt buộc)"
                  rows={2}
                />
              </div>

              <div>
                <label>File quyết định</label>
                <Upload.Dragger
                  fileList={decisionFileList}
                  onChange={({ fileList }) => setDecisionFileList(fileList)}
                  beforeUpload={() => false}
                  accept=".pdf"
                  maxCount={1}
                  style={{ width: '100%' }}
                >
                  <p className="ant-upload-drag-icon">
                    <DownloadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  </p>
                  <p className="ant-upload-text">
                    {selectedDecision?.file_path
                      ? 'Kéo thả file để thay đổi hoặc click để chọn file'
                      : 'Kéo thả file vào đây hoặc click để chọn file'}
                  </p>
                  <p className="ant-upload-hint">Chỉ chấp nhận file PDF</p>
                </Upload.Dragger>
                {selectedDecision?.file_path && !decisionFileList.length && (
                  <div style={{ marginTop: 8, color: '#52c41a', textAlign: 'center' }}>
                    ✓ Đã có file: {selectedDecision.file_path.split('/').pop()}
                  </div>
                )}
              </div>
            </Space>
          )}

          {/* Step 4: Review */}
          {(formData.currentStep || 0) === 4 && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Thông tin quyết định */}
              <Card size="small" title="Thông tin quyết định">
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}
                >
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Số quyết định
                    </Text>
                    <div style={{ fontWeight: 500, marginTop: 4 }}>
                      {formData.decisionNumber || '-'}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Năm
                    </Text>
                    <div style={{ fontWeight: 500, marginTop: 4 }}>
                      {formData.decisionYear || formData.year}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Người ký
                    </Text>
                    <div style={{ fontWeight: 500, marginTop: 4 }}>{formData.signer || '-'}</div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Ngày ký
                    </Text>
                    <div style={{ fontWeight: 500, marginTop: 4 }}>
                      {formData.signDate ? dayjs(formData.signDate).format('DD/MM/YYYY') : '-'}
                    </div>
                  </div>
                  {formData.note && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        Ghi chú
                      </Text>
                      <div style={{ fontWeight: 400, marginTop: 4 }}>{formData.note}</div>
                    </div>
                  )}
                </div>
              </Card>

              {/* File đính kèm */}
              {(fileList.length > 0 || decisionFileList.length > 0) && (
                <Card
                  size="small"
                  title={`File đính kèm (${fileList.length + decisionFileList.length} file)`}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    {decisionFileList.map((file, index) => (
                      <div
                        key={`decision-${index}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          borderRadius: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                          <Text style={{ fontSize: '14px' }}>{file.name}</Text>
                          <Tag color="green">Quyết định</Tag>
                        </div>
                      </div>
                    ))}
                    {fileList.map((file, index) => (
                      <div
                        key={`other-${index}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          borderRadius: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                          <Text style={{ fontSize: '14px' }}>{file.name}</Text>
                        </div>
                      </div>
                    ))}
                  </Space>
                </Card>
              )}

              {/* Danh sách đối tượng */}
              <Card
                size="small"
                title={
                  formData.type === 'CA_NHAN'
                    ? `Danh sách cá nhân (${formData.personnelIds.length} người)`
                    : `Danh sách đơn vị (${formData.unitIds.length} đơn vị)`
                }
              >
                {formData.type === 'CA_NHAN' ? (
                  <Table
                    columns={[
                      {
                        title: 'STT',
                        key: 'stt',
                        width: 60,
                        align: 'center',
                        render: (_: any, __: any, index: number) => index + 1,
                      },
                      {
                        title: 'Họ tên',
                        dataIndex: 'ho_ten',
                        key: 'ho_ten',
                        width: 200,
                      },
                      {
                        title: 'Cấp bậc',
                        dataIndex: 'cap_bac',
                        key: 'cap_bac',
                        width: 150,
                      },
                      {
                        title: 'Chức vụ',
                        dataIndex: 'chuc_vu',
                        key: 'chuc_vu',
                        width: 200,
                      },
                      {
                        title: 'Năm',
                        key: 'nam',
                        width: 80,
                        render: () => formData.year,
                      },
                      {
                        title: 'Hình thức khen thưởng',
                        key: 'hinh_thuc',
                        render: () => formData.awardForm || '-',
                      },
                      {
                        title: 'Số quyết định',
                        key: 'so_quyet_dinh',
                        width: 180,
                        render: () => (
                          <Text style={{ color: '#52c41a', fontWeight: 500 }}>
                            {formData.decisionNumber || '-'}
                          </Text>
                        ),
                      },
                    ]}
                    dataSource={formData.personnelIds
                      .map((id: string) => personnel.find(p => p.id === id))
                      .filter(Boolean)}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: true }}
                    size="small"
                  />
                ) : (
                  <Table
                    columns={[
                      {
                        title: 'STT',
                        key: 'stt',
                        width: 60,
                        align: 'center',
                        render: (_: any, __: any, index: number) => index + 1,
                      },
                      {
                        title: 'Tên đơn vị',
                        dataIndex: 'ten_don_vi',
                        key: 'ten_don_vi',
                        width: 300,
                      },
                      {
                        title: 'Mã đơn vị',
                        dataIndex: 'ma_don_vi',
                        key: 'ma_don_vi',
                        width: 150,
                      },
                      {
                        title: 'Năm',
                        key: 'nam',
                        width: 80,
                        render: () => formData.year,
                      },
                      {
                        title: 'Danh hiệu',
                        key: 'danh_hieu',
                        render: () => formData.awardForm || '-',
                      },
                      {
                        title: 'Số quyết định',
                        key: 'so_quyet_dinh',
                        width: 180,
                        render: () => (
                          <Text style={{ color: '#52c41a', fontWeight: 500 }}>
                            {formData.decisionNumber || '-'}
                          </Text>
                        ),
                      },
                    ]}
                    dataSource={formData.unitIds
                      .map(
                        (id: string) =>
                          units.find(u => u.id === id) || subUnits.find(s => s.id === id)
                      )
                      .filter(Boolean)}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: true }}
                    size="small"
                  />
                )}
              </Card>
            </Space>
          )}
        </div>

        {/* Footer navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Button
            onClick={() => {
              const currentStep = formData.currentStep || 0;
              setFormData({ ...formData, currentStep: Math.max(currentStep - 1, 0) });
            }}
            disabled={(formData.currentStep || 0) === 0}
          >
            Quay lại
          </Button>
          <div>
            {(formData.currentStep || 0) < 4 ? (
              <Button
                type="primary"
                onClick={() => {
                  const step = formData.currentStep || 0;
                  let valid = true;
                  if (step === 0) {
                    if (!formData.awardForm || !formData.year) valid = false;
                  }
                  if (step === 1) {
                    if (formData.type === 'CA_NHAN' && formData.personnelIds.length === 0)
                      valid = false;
                    if (formData.type === 'TAP_THE' && formData.unitIds.length === 0) valid = false;
                  }
                  if (step === 3) {
                    if (
                      !formData.decisionNumber ||
                      !formData.decisionYear ||
                      !formData.signer ||
                      !formData.signDate
                    ) {
                      message.error(
                        'Vui lòng điền đầy đủ thông tin quyết định (số, năm, người ký, ngày ký)'
                      );
                      valid = false;
                    }
                  }
                  if (!valid && step !== 3) {
                    message.error('Vui lòng điền đầy đủ thông tin bắt buộc ở bước này');
                    return;
                  }
                  setFormData({ ...formData, currentStep: step + 1 });
                }}
              >
                Tiếp theo
              </Button>
            ) : (
              <Button type="primary" onClick={handleSubmit}>
                {editingAward ? 'Cập nhật' : 'Tạo'}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
