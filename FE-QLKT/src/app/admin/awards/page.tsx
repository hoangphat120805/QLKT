'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  Tag,
  Alert,
  Space,
  Typography,
  Breadcrumb,
  Spin,
  message,
  Tabs,
} from 'antd';
import type { TabsProps, TableColumnsType } from 'antd';
import {
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  UploadOutlined,
  FileExcelOutlined,
  HomeOutlined,
  CheckOutlined,
  TrophyOutlined,
  StarOutlined,
  SafetyCertificateOutlined,
  FlagOutlined,
  ExperimentOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api-client';

const { Title, Paragraph, Text } = Typography;

interface Award {
  id: number;
  cccd: string;
  ho_ten: string;
  ngay_sinh?: string;
  don_vi: string;
  co_quan_don_vi?: string;
  don_vi_truc_thuoc?: string;
  cap_bac?: string;
  chuc_vu: string;
  nam: number;
  danh_hieu: string | null;
  so_quyet_dinh?: string | null;
  ghi_chu?: string | null;
  nhan_bkbqp?: boolean;
  so_quyet_dinh_bkbqp?: string | null;
  nhan_cstdtq?: boolean;
  so_quyet_dinh_cstdtq?: string | null;
}

export default function AdminAwardsPage() {
  const [activeTab, setActiveTab] = useState('annual');
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importResult, setImportResult] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: { imported: number; total: number; errors?: string[] };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState({
    nam: '',
    ho_ten: '',
    danh_hieu: '',
  });

  useEffect(() => {
    fetchAwards();
  }, [activeTab]);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 1000 };
      if (filters.nam) params.nam = parseInt(filters.nam);
      if (filters.ho_ten) params.ho_ten = filters.ho_ten;
      if (filters.danh_hieu) params.danh_hieu = filters.danh_hieu;

      let result;
      switch (activeTab) {
        case 'annual':
          result = await apiClient.getAnnualRewards(params);
          break;
        case 'unit':
          result = await apiClient.getUnitAnnualAwards(params);
          break;
        case 'hccsvv':
          result = await apiClient.getHCCSVV(params);
          break;
        case 'contribution':
          result = await apiClient.getContributionAwards(params);
          break;
        case 'commemoration':
          result = await apiClient.getCommemorationMedals(params);
          break;
        case 'militaryFlag':
          result = await apiClient.getMilitaryFlag(params);
          break;
        case 'scientific':
          result = await apiClient.getScientificAchievements(params);
          break;
        default:
          result = await apiClient.getAnnualRewards(params);
      }

      if (result.success) {
        const responseData = result.data;
        // Handle different response structures
        if (Array.isArray(responseData)) {
          setAwards(responseData);
        } else if (responseData?.awards && Array.isArray(responseData.awards)) {
          setAwards(responseData.awards);
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          setAwards(responseData.data);
        } else if (responseData?.items && Array.isArray(responseData.items)) {
          setAwards(responseData.items);
        } else {
          setAwards([]);
        }
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
      message.error('Không thể tải danh sách khen thưởng');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params: any = {};
      if (filters.nam) params.nam = parseInt(filters.nam);
      if (filters.ho_ten) params.ho_ten = filters.ho_ten;
      if (filters.danh_hieu) params.danh_hieu = filters.danh_hieu;

      let blob;
      let filename = `danh_sach_khen_thuong`;

      switch (activeTab) {
        case 'annual':
          blob = await apiClient.exportAnnualRewards(params);
          filename = `ca_nhan_hang_nam`;
          break;
        case 'unit':
          blob = await apiClient.exportUnitAnnualAwards(params);
          filename = `don_vi_hang_nam`;
          break;
        case 'hccsvv':
          blob = await apiClient.exportHCCSVV(params);
          filename = `hccsvv`;
          break;
        case 'contribution':
          blob = await apiClient.exportContributionAwards(params);
          filename = `hcbvtq_cong_hien`;
          break;
        case 'commemoration':
          blob = await apiClient.exportCommemorationMedals(params);
          filename = `knc_vsnxd`;
          break;
        case 'militaryFlag':
          blob = await apiClient.exportMilitaryFlag(params);
          filename = `hc_quan_ky_quyet_thang`;
          break;
        case 'scientific':
          blob = await apiClient.exportScientificAchievements(params);
          filename = `thanh_tich_khoa_hoc`;
          break;
        default:
          blob = await apiClient.exportAwards(params);
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('Xuất file thành công');
    } catch (error) {
      console.error('Error exporting awards:', error);
      message.error('Xuất file thất bại');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchAwards();
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      let blob;
      let filename = `mau_import_khen_thuong`;

      switch (activeTab) {
        case 'annual':
          blob = await apiClient.getAnnualRewardsTemplate();
          filename = `mau_import_ca_nhan_hang_nam`;
          break;
        case 'unit':
          blob = await apiClient.getUnitAnnualAwardsTemplate();
          filename = `mau_import_don_vi_hang_nam`;
          break;
        case 'scientific':
          blob = await apiClient.getScientificAchievementsTemplate();
          filename = `mau_import_thanh_tich_khoa_hoc`;
          break;
        case 'hccsvv':
          blob = await apiClient.getHCCSVVTemplate();
          filename = `mau_import_hccsvv`;
          break;
        case 'contribution':
          blob = await apiClient.getContributionAwardsTemplate();
          filename = `mau_import_hcbvtq_cong_hien`;
          break;
        case 'commemoration':
          blob = await apiClient.getCommemorationMedalsTemplate();
          filename = `mau_import_knc_vsnxd`;
          break;
        case 'militaryFlag':
          blob = await apiClient.getMilitaryFlagTemplate();
          filename = `mau_import_hc_quan_ky_quyet_thang`;
          break;
        default:
          blob = await apiClient.getAwardsTemplate();
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('Tải file mẫu thành công');
    } catch (error) {
      console.error('Error downloading template:', error);
      message.error('Tải file mẫu thất bại');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setImportResult(null);

      let result;
      switch (activeTab) {
        case 'annual':
          result = await apiClient.importAnnualRewards(file);
          break;
        case 'unit':
          result = await apiClient.importUnitAnnualAwards(file);
          break;
        case 'scientific':
          result = await apiClient.importScientificAchievements(file);
          break;
        case 'hccsvv':
          result = await apiClient.importHCCSVV(file);
          break;
        case 'contribution':
          result = await apiClient.importContributionAwards(file);
          break;
        case 'commemoration':
          result = await apiClient.importCommemorationMedals(file);
          break;
        case 'militaryFlag':
          result = await apiClient.importMilitaryFlag(file);
          break;
        default:
          message.error('Chức năng import chưa được hỗ trợ cho loại khen thưởng này');
          return;
      }

      if (result.success) {
        const { imported, total, errors } = result.data;
        setImportResult({
          type: 'success',
          message: `Đã thêm thành công ${imported}/${total} bản ghi khen thưởng`,
          details: { imported, total, errors },
        });
        message.success(`Đã thêm thành công ${imported}/${total} bản ghi`);
        // Refresh awards list
        await fetchAwards();
      } else {
        setImportResult({
          type: 'error',
          message: result.message || 'Import thất bại',
        });
        message.error(result.message || 'Import thất bại');
      }
    } catch (error: any) {
      console.error('Error importing awards:', error);
      setImportResult({
        type: 'error',
        message: error.message || 'Có lỗi xảy ra khi import file',
      });
      message.error(error.message || 'Có lỗi xảy ra khi import file');
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Map danh hiệu codes to full names
  const danhHieuMap: Record<string, string> = {
    CSTDCS: 'Chiến sĩ thi đua cơ sở (CSTDCS)',
    CSTT: 'Chiến sĩ tiên tiến (CSTT)',
    BKBQP: 'Bằng khen của Bộ trưởng Bộ Quốc phòng (BKBQP)',
    CSTDTQ: 'Chiến sĩ thi đua toàn quân (CSTDTQ)',
    ĐVQT: 'Đơn vị Quyết thắng (ĐVQT)',
    ĐVTT: 'Đơn vị Tiên tiến (ĐVTT)',
    BKTTCP: 'Bằng khen Thủ tướng Chính phủ (BKTTCP)',
    HCCSVV_HANG_BA: 'Huân chương Chiến sỹ Vẻ vang Hạng Ba',
    HCCSVV_HANG_NHI: 'Huân chương Chiến sỹ Vẻ vang Hạng Nhì',
    HCCSVV_HANG_NHAT: 'Huân chương Chiến sỹ Vẻ vang Hạng Nhất',
    HCBVTQ_HANG_BA: 'Huân chương Bảo vệ Tổ quốc Hạng Ba',
    HCBVTQ_HANG_NHI: 'Huân chương Bảo vệ Tổ quốc Hạng Nhì',
    HCBVTQ_HANG_NHAT: 'Huân chương Bảo vệ Tổ quốc Hạng Nhất',
  };

  // Determine loại khen thưởng based on danh_hieu
  const getLoaiKhenThuong = (danhHieu: string | null): string => {
    if (!danhHieu) return '-';
    if (danhHieu.startsWith('HCBVTQ')) return 'Cống hiến';
    if (danhHieu.startsWith('HCCSVV')) return 'Niên hạn';
    if (
      danhHieu === 'CSTDCS' ||
      danhHieu === 'CSTT' ||
      danhHieu === 'BKBQP' ||
      danhHieu === 'CSTDTQ'
    ) {
      return 'Cá nhân Hằng năm';
    }
    if (danhHieu === 'ĐVQT' || danhHieu === 'ĐVTT' || danhHieu === 'BKTTCP') {
      return 'Đơn vị Hằng năm';
    }
    return '-';
  };

  const columns: TableColumnsType<Award> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: activeTab === 'unit' ? 'Tên đơn vị' : 'Họ tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
      width: 200,
      align: 'center',
      render: (text: string, record: any) => {
        // Handle nested QuanNhan structure for scientific, military flag, contribution, annual, hccsvv, and commemoration awards
        const hasNestedQuanNhan =
          activeTab === 'scientific' ||
          activeTab === 'militaryFlag' ||
          activeTab === 'contribution' ||
          activeTab === 'annual' ||
          activeTab === 'hccsvv' ||
          activeTab === 'commemoration';
        const hoTen = hasNestedQuanNhan ? record.QuanNhan?.ho_ten : text;
        const unitInfo = [];

        if (hasNestedQuanNhan) {
          if (record.QuanNhan?.DonViTrucThuoc?.ten_don_vi) {
            unitInfo.push(record.QuanNhan.DonViTrucThuoc.ten_don_vi);
          }
          if (record.QuanNhan?.CoQuanDonVi?.ten_don_vi) {
            unitInfo.push(record.QuanNhan.CoQuanDonVi.ten_don_vi);
          }
        } else {
          // For unit awards, use direct CoQuanDonVi and DonViTrucThuoc
          if (record.DonViTrucThuoc?.ten_don_vi) {
            unitInfo.push(record.DonViTrucThuoc.ten_don_vi);
          }
          if (record.CoQuanDonVi?.ten_don_vi) {
            unitInfo.push(record.CoQuanDonVi.ten_don_vi);
          }
          // Fallback to string fields
          if (unitInfo.length === 0) {
            if (record.don_vi_truc_thuoc) unitInfo.push(record.don_vi_truc_thuoc);
            if (record.co_quan_don_vi) unitInfo.push(record.co_quan_don_vi);
          }
        }

        const unitInfoText = unitInfo.length > 0 ? unitInfo.join(', ') : record.don_vi || '';
        const displayName = activeTab === 'unit' ? unitInfoText : hoTen || '-';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text strong>{displayName}</Text>
            {activeTab !== 'unit' && unitInfoText && (
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                {unitInfoText}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'Ngày sinh',
      key: 'ngay_sinh',
      width: 120,
      align: 'center',
      render: (_: any, record: any) => {
        // Get date from nested QuanNhan or direct field
        const hasNestedQuanNhan =
          activeTab === 'scientific' ||
          activeTab === 'militaryFlag' ||
          activeTab === 'contribution' ||
          activeTab === 'annual' ||
          activeTab === 'hccsvv' ||
          activeTab === 'commemoration';

        const ngaySinh = hasNestedQuanNhan ? record.QuanNhan?.ngay_sinh : record.ngay_sinh;

        if (!ngaySinh) return <Text type="secondary">-</Text>;

        try {
          const date = new Date(ngaySinh);
          return <Text>{date.toLocaleDateString('vi-VN')}</Text>;
        } catch {
          return <Text type="secondary">-</Text>;
        }
      },
    },
    {
      title: 'Cấp bậc / Chức vụ',
      key: 'cap_bac_chuc_vu',
      width: 150,
      align: 'center',
      render: (_: any, record: any) => {
        // Lấy trực tiếp từ record (dữ liệu đã lưu trong bảng)
        const capBac = record.cap_bac;
        const chucVu = record.chuc_vu;

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
    {
      title: 'Năm',
      dataIndex: 'nam',
      key: 'nam',
      width: 70,
      align: 'center',
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Loại khen thưởng',
      key: 'loai_khen_thuong',
      width: 140,
      align: 'center',
      render: (_: any, record: any) => {
        if (activeTab === 'scientific') {
          const loaiMap: Record<string, string> = {
            NCKH: 'Nghiên cứu khoa học',
            SKKH: 'Sáng kiến khoa học',
            GIAI_PHAP_KY_THUAT: 'Giải pháp kỹ thuật',
          };
          return <Text>{loaiMap[record.loai] || record.loai || '-'}</Text>;
        }
        if (
          activeTab === 'militaryFlag' ||
          activeTab === 'hccsvv' ||
          activeTab === 'commemoration'
        ) {
          const thanhTich = record.thoi_gian?.display || '-';
          return <Text>{thanhTich}</Text>;
        }
        if (activeTab === 'contribution') {
          const thoiGian =
            [
              record.thoi_gian_nhom_0_7?.display,
              record.thoi_gian_nhom_0_8?.display,
              record.thoi_gian_nhom_0_9_1_0?.display,
            ]
              .filter(t => t && t !== '-')
              .join(' + ') || '-';
          return <Text>{thoiGian}</Text>;
        }
        return <Text>{getLoaiKhenThuong(record.danh_hieu)}</Text>;
      },
    },
    {
      title:
        activeTab === 'scientific'
          ? 'Mô tả'
          : activeTab === 'militaryFlag' || activeTab === 'contribution'
          ? 'Danh hiệu / Ghi chú'
          : activeTab === 'commemoration'
          ? 'Số quyết định / Ghi chú'
          : 'Danh hiệu',
      dataIndex: activeTab === 'scientific' ? 'mo_ta' : 'danh_hieu',
      key: activeTab === 'scientific' ? 'mo_ta' : 'danh_hieu',
      width: 220,
      align: 'center',
      render: (text: string | null, record: any) => {
        if (activeTab === 'scientific') {
          return (
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <Text>{text || '-'}</Text>
              {record.so_quyet_dinh && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Số QĐ: {record.so_quyet_dinh}
                </Text>
              )}
            </div>
          );
        }

        if (activeTab === 'commemoration') {
          return (
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              {record.so_quyet_dinh && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Số QĐ: {record.so_quyet_dinh}
                </Text>
              )}
              {record.ghi_chu && (
                <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                  {record.ghi_chu}
                </Text>
              )}
              {!record.so_quyet_dinh && !record.ghi_chu && <Text>-</Text>}
            </div>
          );
        }

        if (activeTab === 'militaryFlag') {
          return (
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <Text>{record.ghi_chu || '-'}</Text>
              {record.so_quyet_dinh && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Số QĐ: {record.so_quyet_dinh}
                </Text>
              )}
            </div>
          );
        }

        if (activeTab === 'contribution') {
          const fullName = text ? danhHieuMap[text] || text : '-';
          return (
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <Text>{fullName}</Text>
              {record.ghi_chu && (
                <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                  {record.ghi_chu}
                </Text>
              )}
              {record.so_quyet_dinh && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Số QĐ: {record.so_quyet_dinh}
                </Text>
              )}
            </div>
          );
        }

        if (!text) return <Text type="secondary">-</Text>;
        const fullName = danhHieuMap[text] || text;
        const soQuyetDinh =
          record.so_quyet_dinh || record.so_quyet_dinh_bkbqp || record.so_quyet_dinh_cstdtq;

        return (
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
          >
            <Text>{fullName}</Text>
            {soQuyetDinh && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Số QĐ: {soQuyetDinh}
              </Text>
            )}
            {record.nhan_bkbqp && <Text>{danhHieuMap['BKBQP']}</Text>}
            {record.so_quyet_dinh_bkbqp && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Số QĐ BKBQP: {record.so_quyet_dinh_bkbqp}
              </Text>
            )}
            {record.nhan_cstdtq && <Text>{danhHieuMap['CSTDTQ']}</Text>}
            {record.so_quyet_dinh_cstdtq && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Số QĐ CSTDTQ: {record.so_quyet_dinh_cstdtq}
              </Text>
            )}
            {record.nhan_bkttcp && <Text>{danhHieuMap['BKTTCP']}</Text>}
            {record.so_quyet_dinh_bkttcp && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Số QĐ BKTTCP: {record.so_quyet_dinh_bkttcp}
              </Text>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>Quản Lý Khen Thưởng</Breadcrumb.Item>
      </Breadcrumb>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Quản Lý Khen Thưởng
          </Title>
          <Paragraph type="secondary" style={{ marginTop: '4px', marginBottom: 0 }}>
            Danh sách khen thưởng tất cả các đơn vị
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
          loading={exporting}
          size="large"
        >
          {exporting ? 'Đang xuất...' : 'Xuất Excel'}
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          {
            key: 'annual',
            label: (
              <span>
                <UserOutlined />
                Cá nhân hằng năm
              </span>
            ),
            children: renderAwardContent(),
          },
          {
            key: 'unit',
            label: (
              <span>
                <TeamOutlined />
                Đơn vị hằng năm
              </span>
            ),
            children: renderAwardContent(),
          },
          {
            key: 'hccsvv',
            label: (
              <span>
                <StarOutlined />
                Huân chương Chiến sĩ Vẻ vang
              </span>
            ),
            children: renderAwardContent(),
          },
          {
            key: 'contribution',
            label: (
              <span>
                <SafetyCertificateOutlined />
                Huân chương Bảo vệ Tổ quốc (Cống hiến)
              </span>
            ),
            children: renderAwardContent(),
          },
          {
            key: 'commemoration',
            label: (
              <span>
                <SafetyCertificateOutlined />
                Kỷ niệm chương VSNXD QĐNDVN
              </span>
            ),
            children: renderAwardContent(),
          },
          {
            key: 'militaryFlag',
            label: (
              <span>
                <FlagOutlined />
                Huân chương Quân kỳ Quyết thắng
              </span>
            ),
            children: renderAwardContent(),
          },
          {
            key: 'scientific',
            label: (
              <span>
                <ExperimentOutlined />
                Thành tích khoa học
              </span>
            ),
            children: renderAwardContent(),
          },
        ]}
      />
    </div>
  );

  function renderAwardContent() {
    return (
      <>
        {/* Import Section */}
        {/* {(activeTab === 'annual' ||
          activeTab === 'unit' ||
          activeTab === 'scientific' ||
          activeTab === 'hccsvv' ||
          activeTab === 'contribution' ||
          activeTab === 'commemoration' ||
          activeTab === 'militaryFlag') && (
          <Card
            title={
              <Space>
                <UploadOutlined />
                Import Khen Thưởng
              </Space>
            }
            style={{ marginBottom: '24px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Space wrap>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={handleDownloadTemplate}
                  loading={downloadingTemplate}
                >
                  {downloadingTemplate ? 'Đang tải...' : 'Tải File Mẫu Excel'}
                </Button>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={handleUploadClick}
                  loading={importing}
                >
                  {importing ? 'Đang import...' : 'Upload File Excel'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </Space>

              {importResult && (
                <Alert
                  type={importResult.type === 'success' ? 'success' : 'error'}
                  message={<Text strong>{importResult.message}</Text>}
                  description={
                    importResult.details?.errors && importResult.details.errors.length > 0 ? (
                      <div style={{ marginTop: '8px' }}>
                        <Text strong>Lỗi chi tiết:</Text>
                        <ul style={{ marginTop: '4px', marginBottom: 0 }}>
                          {importResult.details.errors.slice(0, 5).map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                          {importResult.details.errors.length > 5 && (
                            <li style={{ color: '#8c8c8c' }}>
                              ... và {importResult.details.errors.length - 5} lỗi khác
                            </li>
                          )}
                        </ul>
                      </div>
                    ) : null
                  }
                  closable
                  onClose={() => setImportResult(null)}
                />
              )}
            </Space>
          </Card>
        )} */}

        {/* Filters */}
        <Card
          title={
            <Space>
              <FilterOutlined />
              Bộ lọc
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Năm
              </Text>
              <Input
                type="number"
                placeholder="Ví dụ: 2024"
                value={filters.nam}
                onChange={e => handleFilterChange('nam', e.target.value)}
                size="large"
              />
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Tìm kiếm theo họ tên
              </Text>
              <Input
                placeholder="Nhập tên để tìm kiếm"
                value={filters.ho_ten}
                onChange={e => handleFilterChange('ho_ten', e.target.value)}
                size="large"
              />
            </div>
            {(activeTab === 'hccsvv' || activeTab === 'contribution') && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  Danh hiệu
                </Text>
                <Input
                  placeholder="Ví dụ: HCCSVV_HANG_BA"
                  value={filters.danh_hieu}
                  onChange={e => handleFilterChange('danh_hieu', e.target.value)}
                  size="large"
                />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
                style={{ width: '100%' }}
                size="large"
              >
                Tìm kiếm
              </Button>
            </div>
          </div>
        </Card>

        {/* Awards Table */}
        <Card title={`Danh sách khen thưởng (${awards.length})`}>
          <Spin spinning={loading} tip="Đang tải...">
            {!loading && awards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#8c8c8c' }}>
                <p>Chưa có dữ liệu khen thưởng</p>
              </div>
            ) : (
              <Table
                columns={columns.filter(col => {
                  // Filter out 'ngay_sinh' and 'cap_bac_chuc_vu' columns for unit tab
                  if (
                    activeTab === 'unit' &&
                    (col.key === 'ngay_sinh' || col.key === 'cap_bac_chuc_vu')
                  ) {
                    return false;
                  }
                  // Keep 'loai_khen_thuong' only for scientific tab
                  if (col.key === 'loai_khen_thuong' && activeTab !== 'scientific') {
                    return false;
                  }
                  return true;
                })}
                dataSource={awards}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showTotal: total => `Tổng ${total} bản ghi`,
                }}
                bordered
              />
            )}
          </Spin>
        </Card>
      </>
    );
  }
}
