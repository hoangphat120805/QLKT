'use client';

import { useState, useEffect } from 'react';
import { Table, Select, Input, Alert, Typography, Space, Tag, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axiosInstance from '@/utils/axiosInstance';
import { apiClient } from '@/lib/api-client';

const { Text } = Typography;
const { TextArea } = Input;

interface Personnel {
  id: string;
  ho_ten: string;
  cccd: string;
  ngay_nhap_ngu?: string | Date | null;
  ngay_xuat_ngu?: string | Date | null;
  ChucVu?: {
    id: string;
    ten_chuc_vu: string;
  };
  CoQuanDonVi?: {
    ten_don_vi: string;
  };
  DonViTrucThuoc?: {
    ten_don_vi: string;
    CoQuanDonVi?: {
      ten_don_vi: string;
    };
  };
}

interface Unit {
  id: string;
  ten_don_vi: string;
  ma_don_vi: string;
  co_quan_don_vi_id?: string;
  CoQuanDonVi?: {
    id: string;
    ten_don_vi: string;
    ma_don_vi: string;
  };
}

interface TitleData {
  personnel_id?: string;
  don_vi_id?: string;
  don_vi_type?: 'CO_QUAN_DON_VI' | 'DON_VI_TRUC_THUOC';
  danh_hieu?: string;
  loai?: 'NCKH' | 'SKKH';
  mo_ta?: string;
}

interface Step3SetTitlesProps {
  selectedPersonnelIds: string[];
  selectedUnitIds?: string[];
  proposalType: string;
  titleData: TitleData[];
  onTitleDataChange: (data: TitleData[]) => void;
}

export default function Step3SetTitles({
  selectedPersonnelIds,
  selectedUnitIds = [],
  proposalType,
  titleData,
  onTitleDataChange,
}: Step3SetTitlesProps) {
  const [loading, setLoading] = useState(false);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [positionHistoriesMap, setPositionHistoriesMap] = useState<Record<string, any[]>>({});

  // Fetch personnel/unit details
  useEffect(() => {
    if (proposalType === 'DON_VI_HANG_NAM') {
      if (selectedUnitIds.length > 0) {
        fetchUnitDetails();
      } else {
        // Reset units nếu không có đơn vị nào được chọn
        setUnits([]);
        onTitleDataChange([]);
      }
    } else {
      if (selectedPersonnelIds.length > 0) {
        fetchPersonnelDetails();
      } else {
        // Reset personnel nếu không có quân nhân nào được chọn
        setPersonnel([]);
        onTitleDataChange([]);
      }
    }
  }, [selectedPersonnelIds, selectedUnitIds, proposalType]);

  const fetchPersonnelDetails = async () => {
    try {
      setLoading(true);
      const promises = selectedPersonnelIds.map(id => axiosInstance.get(`/api/personnel/${id}`));
      const responses = await Promise.all(promises);
      const personnelData = responses.filter(r => r.data.success).map(r => r.data.data);
      setPersonnel(personnelData);

      // Nếu là đề xuất cống hiến, fetch lịch sử chức vụ
      if (proposalType === 'CONG_HIEN' && personnelData.length > 0) {
        await fetchPositionHistories(personnelData);
      }

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

  const fetchPositionHistories = async (personnelList: Personnel[]) => {
    try {
      const historiesMap: Record<string, any[]> = {};

      // Fetch lịch sử chức vụ cho mỗi quân nhân
      await Promise.all(
        personnelList.map(async p => {
          if (p.id) {
            try {
              const res = await apiClient.getPositionHistory(p.id);
              if (res.success && res.data) {
                historiesMap[p.id] = res.data;
              }
            } catch (error) {
              // Ignore errors for individual personnel
              historiesMap[p.id] = [];
            }
          }
        })
      );

      setPositionHistoriesMap(historiesMap);
    } catch (error) {
      console.error('Error fetching position histories:', error);
    }
  };

  // Tính tổng thời gian đảm nhiệm chức vụ theo nhóm hệ số cho một quân nhân
  const calculateTotalTimeByGroup = (personnelId: string, group: '0.7' | '0.8' | '0.9-1.0') => {
    const histories = positionHistoriesMap[personnelId] || [];
    let totalMonths = 0;

    histories.forEach((history: any) => {
      const heSo = Number(history.he_so_chuc_vu) || 0;
      let belongsToGroup = false;

      if (group === '0.7') {
        belongsToGroup = heSo >= 0.7 && heSo < 0.8;
      } else if (group === '0.8') {
        belongsToGroup = heSo >= 0.8 && heSo < 0.9;
      } else if (group === '0.9-1.0') {
        belongsToGroup = heSo >= 0.9 && heSo <= 1.0;
      }

      if (belongsToGroup && history.so_thang !== null && history.so_thang !== undefined) {
        totalMonths += history.so_thang;
      }
    });

    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    if (totalMonths === 0) return '-';
    if (years > 0 && remainingMonths > 0) {
      return `${years} năm ${remainingMonths} tháng`;
    } else if (years > 0) {
      return `${years} năm`;
    } else {
      return `${remainingMonths} tháng`;
    }
  };

  // Tính tổng thời gian (theo tháng) cho một nhóm hệ số
  const getTotalMonthsByGroup = (personnelId: string, group: '0.7' | '0.8' | '0.9-1.0'): number => {
    const histories = positionHistoriesMap[personnelId] || [];
    let totalMonths = 0;

    histories.forEach((history: any) => {
      const heSo = Number(history.he_so_chuc_vu) || 0;
      let belongsToGroup = false;

      if (group === '0.7') {
        belongsToGroup = heSo >= 0.7 && heSo < 0.8;
      } else if (group === '0.8') {
        belongsToGroup = heSo >= 0.8 && heSo < 0.9;
      } else if (group === '0.9-1.0') {
        belongsToGroup = heSo >= 0.9 && heSo <= 1.0;
      }

      if (belongsToGroup && history.so_thang !== null && history.so_thang !== undefined) {
        totalMonths += history.so_thang;
      }
    });

    return totalMonths;
  };

  // Kiểm tra quân nhân có đủ điều kiện cho hạng cống hiến không
  // Hạng cao có thể cộng thêm vào hạng thấp hơn
  const checkEligibleForRank = (
    personnelId: string,
    rank: 'HANG_NHAT' | 'HANG_NHI' | 'HANG_BA'
  ): boolean => {
    const months0_9_1_0 = getTotalMonthsByGroup(personnelId, '0.9-1.0');
    const months0_8 = getTotalMonthsByGroup(personnelId, '0.8');
    const months0_7 = getTotalMonthsByGroup(personnelId, '0.7');

    const requiredMonths = 10 * 12; // 10 năm = 120 tháng

    if (rank === 'HANG_NHAT') {
      // Hạng nhất: cần >= 10 năm từ nhóm 0.9-1.0
      return months0_9_1_0 >= requiredMonths;
    } else if (rank === 'HANG_NHI') {
      // Hạng nhì: cần >= 10 năm từ nhóm 0.8 + 0.9-1.0 (hạng cao cộng vào)
      return months0_8 + months0_9_1_0 >= requiredMonths;
    } else if (rank === 'HANG_BA') {
      // Hạng ba: cần >= 10 năm từ nhóm 0.7 + 0.8 + 0.9-1.0 (tất cả hạng cao cộng vào)
      return months0_7 + months0_8 + months0_9_1_0 >= requiredMonths;
    }

    return false;
  };

  const fetchUnitDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching unit details for selectedUnitIds:', selectedUnitIds);

      // Gọi API để lấy đơn vị của Manager
      const unitsRes = await apiClient.getMyUnits();
      console.log('Units API response:', unitsRes);

      if (unitsRes.success) {
        const unitsData = unitsRes.data || [];
        console.log('All manager units:', unitsData);

        // Lọc các đơn vị đã chọn
        const selectedUnits = unitsData.filter((unit: any) => selectedUnitIds.includes(unit.id));
        console.log('Selected units:', selectedUnits);

        const formattedUnits: Unit[] = selectedUnits.map((unit: any) => ({
          id: unit.id,
          ten_don_vi: unit.ten_don_vi,
          ma_don_vi: unit.ma_don_vi,
          co_quan_don_vi_id: unit.co_quan_don_vi_id,
          CoQuanDonVi: unit.CoQuanDonVi || null,
        }));

        console.log('Formatted units:', formattedUnits);
        setUnits(formattedUnits);

        // Initialize title data if empty
        if (titleData.length === 0 && formattedUnits.length > 0) {
          const initialData: TitleData[] = formattedUnits.map((unit: Unit) => ({
            don_vi_id: unit.id,
            don_vi_type: (unit.co_quan_don_vi_id ? 'DON_VI_TRUC_THUOC' : 'CO_QUAN_DON_VI') as
              | 'CO_QUAN_DON_VI'
              | 'DON_VI_TRUC_THUOC',
          }));
          console.log('Initial title data:', initialData);
          onTitleDataChange(initialData);
        }
      } else {
        console.error('Failed to fetch units:', unitsRes.message);
      }
    } catch (error) {
      console.error('Error fetching unit details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get danh hiệu options based on proposal type
  // Xác định loại danh hiệu đã được chọn trong đề xuất
  const getSelectedDanhHieuType = () => {
    if (proposalType !== 'CA_NHAN_HANG_NAM') return null;

    const selectedDanhHieus = titleData.map(item => item.danh_hieu).filter(Boolean);

    if (selectedDanhHieus.length === 0) return null;

    // Kiểm tra xem có CSTDCS/CSTT không
    const hasChinh = selectedDanhHieus.some(dh => dh === 'CSTDCS' || dh === 'CSTT');
    const hasBKBQP = selectedDanhHieus.some(dh => dh === 'BKBQP');
    const hasCSTDTQ = selectedDanhHieus.some(dh => dh === 'CSTDTQ');

    if (hasChinh) {
      return 'chinh'; // CSTDCS/CSTT
    } else if (hasBKBQP || hasCSTDTQ) {
      return 'bkbqp_cstdtq'; // BKBQP và CSTDTQ có thể cùng nhau
    }
    return null;
  };

  const getSelectedNienHanType = () => {
    if (proposalType !== 'NIEN_HAN') return null;

    const selectedDanhHieus = titleData.map(item => item.danh_hieu).filter(Boolean);

    if (selectedDanhHieus.length === 0) return null;

    // Kiểm tra xem có các hạng HCCSVV không
    const hasHCCSVV = selectedDanhHieus.some(
      dh => dh === 'HCCSVV_HANG_BA' || dh === 'HCCSVV_HANG_NHI' || dh === 'HCCSVV_HANG_NHAT'
    );

    // Kiểm tra xem có HC_QKQT không
    const hasHC_QKQT = selectedDanhHieus.some(dh => dh === 'HC_QKQT');

    // Kiểm tra xem có KNC_VSNXD_QDNDVN không
    const hasKNC = selectedDanhHieus.some(dh => dh === 'KNC_VSNXD_QDNDVN');

    if (hasHCCSVV) {
      return 'hcsvv'; // Các hạng HCCSVV đi với nhau
    } else if (hasHC_QKQT) {
      return 'hc_qkqt'; // HC_QKQT riêng
    } else if (hasKNC) {
      return 'knc'; // KNC_VSNXD_QDNDVN riêng
    }
    return null;
  };

  const getDanhHieuOptions = () => {
    switch (proposalType) {
      case 'CA_NHAN_HANG_NAM':
        const selectedType = getSelectedDanhHieuType();
        const allOptions = [
          { label: 'Chiến sĩ thi đua cơ sở (CSTDCS)', value: 'CSTDCS' },
          { label: 'Chiến sĩ tiên tiến (CSTT)', value: 'CSTT' },
          { label: 'Bằng khen của Bộ trưởng Bộ Quốc phòng (BKBQP)', value: 'BKBQP' },
          { label: 'Chiến sĩ thi đua toàn quân (CSTDTQ)', value: 'CSTDTQ' },
        ];

        // Nếu đã chọn CSTDCS/CSTT, chỉ hiển thị CSTDCS/CSTT
        // Nếu đã chọn BKBQP/CSTDTQ, có thể chọn cả BKBQP và CSTDTQ
        if (selectedType === 'chinh') {
          return allOptions.filter(opt => opt.value === 'CSTDCS' || opt.value === 'CSTT');
        } else if (selectedType === 'bkbqp_cstdtq') {
          return allOptions.filter(opt => opt.value === 'BKBQP' || opt.value === 'CSTDTQ');
        }

        return allOptions;
      case 'DON_VI_HANG_NAM':
        return [
          { label: 'Đơn vị Quyết thắng (ĐVQT)', value: 'ĐVQT' },
          { label: 'Đơn vị Tiên tiến (ĐVTT)', value: 'ĐVTT' },
          { label: 'Bằng khen của Bộ trưởng Bộ Quốc phòng (BKBQP)', value: 'BKBQP' },
          { label: 'Bằng khen Thủ tướng Chính phủ (BKTTCP)', value: 'BKTTCP' },
        ];
      case 'NIEN_HAN':
        const nienHanSelectedType = getSelectedNienHanType();
        const nienHanAllOptions = [
          { label: 'Huân chương Chiến sỹ Vẻ vang Hạng Ba', value: 'HCCSVV_HANG_BA' },
          { label: 'Huân chương Chiến sỹ Vẻ vang Hạng Nhì', value: 'HCCSVV_HANG_NHI' },
          { label: 'Huân chương Chiến sỹ Vẻ vang Hạng Nhất', value: 'HCCSVV_HANG_NHAT' },
          { label: 'Huy chương Quân kỳ quyết thắng', value: 'HC_QKQT' },
          { label: 'Kỷ niệm chương vì sự nghiệp xây dựng QĐNDVN', value: 'KNC_VSNXD_QDNDVN' },
        ];

        // Nếu đã chọn các hạng HCCSVV, chỉ hiển thị các hạng HCCSVV
        // Nếu đã chọn HC_QKQT, chỉ hiển thị HC_QKQT
        // Nếu đã chọn KNC_VSNXD_QDNDVN, chỉ hiển thị KNC_VSNXD_QDNDVN
        if (nienHanSelectedType === 'hcsvv') {
          return nienHanAllOptions.filter(
            opt =>
              opt.value === 'HCCSVV_HANG_BA' ||
              opt.value === 'HCCSVV_HANG_NHI' ||
              opt.value === 'HCCSVV_HANG_NHAT'
          );
        } else if (nienHanSelectedType === 'hc_qkqt') {
          return nienHanAllOptions.filter(opt => opt.value === 'HC_QKQT');
        } else if (nienHanSelectedType === 'knc') {
          return nienHanAllOptions.filter(opt => opt.value === 'KNC_VSNXD_QDNDVN');
        }

        return nienHanAllOptions;
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

  // Update title for a personnel/unit
  const updateTitle = (id: string, field: string, value: any) => {
    // Validation cho CONG_HIEN: Kiểm tra điều kiện thời gian khi chọn danh hiệu
    if (field === 'danh_hieu' && proposalType === 'CONG_HIEN' && value) {
      const personnelRecord = personnel.find(p => p.id === id);
      if (personnelRecord) {
        let rankName = '';
        let eligible = false;

        if (value === 'HCBVTQ_HANG_NHAT') {
          eligible = checkEligibleForRank(id, 'HANG_NHAT');
          rankName = 'Hạng Nhất';
        } else if (value === 'HCBVTQ_HANG_NHI') {
          eligible = checkEligibleForRank(id, 'HANG_NHI');
          rankName = 'Hạng Nhì';
        } else if (value === 'HCBVTQ_HANG_BA') {
          eligible = checkEligibleForRank(id, 'HANG_BA');
          rankName = 'Hạng Ba';
        }

        if (!eligible && rankName) {
          const months0_9_1_0 = getTotalMonthsByGroup(id, '0.9-1.0');
          const months0_8 = getTotalMonthsByGroup(id, '0.8');
          const months0_7 = getTotalMonthsByGroup(id, '0.7');

          let totalMonths = 0;
          if (value === 'HCBVTQ_HANG_NHAT') {
            totalMonths = months0_9_1_0;
          } else if (value === 'HCBVTQ_HANG_NHI') {
            totalMonths = months0_8 + months0_9_1_0;
          } else if (value === 'HCBVTQ_HANG_BA') {
            totalMonths = months0_7 + months0_8 + months0_9_1_0;
          }

          const totalYears = Math.floor(totalMonths / 12);
          const remainingMonths = totalMonths % 12;
          const totalYearsText =
            totalYears > 0 && remainingMonths > 0
              ? `${totalYears} năm ${remainingMonths} tháng`
              : totalYears > 0
              ? `${totalYears} năm`
              : `${remainingMonths} tháng`;

          message.error(
            `Quân nhân "${personnelRecord.ho_ten}" không đủ điều kiện đề xuất Huân chương Bảo vệ Tổ quốc ${rankName}. ` +
              `Yêu cầu: ít nhất 10 năm. Hiện tại: ${totalYearsText}. ` +
              `Vui lòng kiểm tra lại lịch sử chức vụ của quân nhân này.`
          );
          return; // Không cập nhật nếu không đủ điều kiện
        }
      }
    }

    // Validation: Kiểm tra nếu đang chọn danh hiệu và đã có danh hiệu khác loại
    if (field === 'danh_hieu' && proposalType === 'CA_NHAN_HANG_NAM' && value) {
      const selectedType = getSelectedDanhHieuType();
      const isChinh = value === 'CSTDCS' || value === 'CSTT';
      const isBKBQP_CSTDTQ = value === 'BKBQP' || value === 'CSTDTQ';

      // Kiểm tra xem có mix CSTDCS/CSTT với BKBQP/CSTDTQ không
      if (selectedType === 'chinh' && isBKBQP_CSTDTQ) {
        // Đã có CSTDCS/CSTT, không cho phép thêm BKBQP/CSTDTQ
        const currentData = titleData.find(d => d.personnel_id === id);
        if (!currentData || !currentData.danh_hieu) {
          message.warning(
            'Không thể đề xuất CSTDCS/CSTT cùng với BKBQP/CSTDTQ trong một đề xuất. ' +
              'Vui lòng tạo đề xuất riêng cho loại danh hiệu này.'
          );
          return;
        }
      } else if (selectedType === 'bkbqp_cstdtq' && isChinh) {
        // Đã có BKBQP/CSTDTQ, không cho phép thêm CSTDCS/CSTT
        const currentData = titleData.find(d => d.personnel_id === id);
        if (!currentData || !currentData.danh_hieu) {
          message.warning(
            'Không thể đề xuất CSTDCS/CSTT cùng với BKBQP/CSTDTQ trong một đề xuất. ' +
              'Vui lòng tạo đề xuất riêng cho loại danh hiệu này.'
          );
          return;
        }
      }
    }

    // Validation cho NIEN_HAN: Kiểm tra nếu đang chọn danh hiệu và đã có danh hiệu khác nhóm
    if (field === 'danh_hieu' && proposalType === 'NIEN_HAN' && value) {
      const selectedType = getSelectedNienHanType();
      const isHCCSVV =
        value === 'HCCSVV_HANG_BA' || value === 'HCCSVV_HANG_NHI' || value === 'HCCSVV_HANG_NHAT';
      const isHC_QKQT = value === 'HC_QKQT';
      const isKNC = value === 'KNC_VSNXD_QDNDVN';

      // Kiểm tra xem có mix các nhóm không
      if (selectedType === 'hcsvv' && (isHC_QKQT || isKNC)) {
        // Đã có các hạng HCCSVV, không cho phép thêm HC_QKQT hoặc KNC_VSNXD_QDNDVN
        const currentData = titleData.find(d => d.personnel_id === id);
        if (!currentData || !currentData.danh_hieu) {
          message.warning(
            'Không thể đề xuất các hạng HCCSVV cùng với các loại khác trong một đề xuất. ' +
              'Vui lòng tạo đề xuất riêng cho loại danh hiệu này.'
          );
          return;
        }
      } else if (selectedType === 'hc_qkqt' && (isHCCSVV || isKNC)) {
        // Đã có HC_QKQT, không cho phép thêm các hạng HCCSVV hoặc KNC_VSNXD_QDNDVN
        const currentData = titleData.find(d => d.personnel_id === id);
        if (!currentData || !currentData.danh_hieu) {
          message.warning(
            'Không thể đề xuất HC_QKQT cùng với các loại khác trong một đề xuất. ' +
              'Vui lòng tạo đề xuất riêng cho loại danh hiệu này.'
          );
          return;
        }
      } else if (selectedType === 'knc' && (isHCCSVV || isHC_QKQT)) {
        // Đã có KNC_VSNXD_QDNDVN, không cho phép thêm các hạng HCCSVV hoặc HC_QKQT
        const currentData = titleData.find(d => d.personnel_id === id);
        if (!currentData || !currentData.danh_hieu) {
          message.warning(
            'Không thể đề xuất KNC_VSNXD_QDNDVN cùng với các loại khác trong một đề xuất. ' +
              'Vui lòng tạo đề xuất riêng cho loại danh hiệu này.'
          );
          return;
        }
      }
    }

    const newData = [...titleData];
    let index: number;

    if (proposalType === 'DON_VI_HANG_NAM') {
      index = newData.findIndex(d => d.don_vi_id === id);
      if (index >= 0) {
        newData[index] = { ...newData[index], [field]: value };
      } else {
        const unit = units.find(u => u.id === id);
        newData.push({
          don_vi_id: id,
          don_vi_type: unit?.co_quan_don_vi_id ? 'DON_VI_TRUC_THUOC' : 'CO_QUAN_DON_VI',
          [field]: value,
        });
      }
    } else {
      index = newData.findIndex(d => d.personnel_id === id);
      if (index >= 0) {
        newData[index] = { ...newData[index], [field]: value };
      } else {
        newData.push({ personnel_id: id, [field]: value });
      }
    }

    onTitleDataChange(newData);
  };

  // Get title data for a personnel/unit
  const getTitleData = (id: string) => {
    if (proposalType === 'DON_VI_HANG_NAM') {
      return titleData.find(d => d.don_vi_id === id) || { don_vi_id: id };
    }
    return titleData.find(d => d.personnel_id === id) || { personnel_id: id };
  };

  // Check if all personnel/units have titles set
  const allTitlesSet =
    proposalType === 'DON_VI_HANG_NAM'
      ? units.every(u => {
          const data = getTitleData(u.id);
          return data.danh_hieu;
        })
      : personnel.every(p => {
          const data = getTitleData(p.id);
          if (proposalType === 'NCKH') {
            return data.loai && data.mo_ta;
          } else {
            return data.danh_hieu;
          }
        });

  // Columns for DON_VI_HANG_NAM
  const unitColumns: ColumnsType<Unit> = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Loại đơn vị',
      key: 'type',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const type = record.co_quan_don_vi_id ? 'DON_VI_TRUC_THUOC' : 'CO_QUAN_DON_VI';
        return (
          <Tag color={type === 'CO_QUAN_DON_VI' ? 'blue' : 'green'}>
            {type === 'CO_QUAN_DON_VI' ? 'Cơ quan đơn vị' : 'Đơn vị trực thuộc'}
          </Tag>
        );
      },
    },
    {
      title: 'Mã đơn vị',
      dataIndex: 'ma_don_vi',
      key: 'ma_don_vi',
      width: 140,
      align: 'center',
      render: text => <Text code>{text}</Text>,
    },
    {
      title: 'Tên đơn vị',
      dataIndex: 'ten_don_vi',
      key: 'ten_don_vi',
      width: 200,
      align: 'center',
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: (
        <span>
          Danh hiệu <Text type="danger">*</Text>
        </span>
      ),
      key: 'danh_hieu',
      width: 250,
      align: 'center',
      render: (_, record) => {
        const data = getTitleData(record.id);

        // Lọc danh hiệu dựa trên điều kiện thời gian cho CONG_HIEN
        let availableOptions = getDanhHieuOptions();
        if (proposalType === 'CONG_HIEN') {
          availableOptions = availableOptions.filter(option => {
            if (option.value === 'HCBVTQ_HANG_NHAT') {
              return checkEligibleForRank(record.id, 'HANG_NHAT');
            } else if (option.value === 'HCBVTQ_HANG_NHI') {
              return checkEligibleForRank(record.id, 'HANG_NHI');
            } else if (option.value === 'HCBVTQ_HANG_BA') {
              return checkEligibleForRank(record.id, 'HANG_BA');
            }
            return true;
          });
        }

        return (
          <Select
            value={data.danh_hieu}
            onChange={value => updateTitle(record.id, 'danh_hieu', value)}
            placeholder="Chọn danh hiệu"
            style={{ width: '100%' }}
            size="middle"
            allowClear
            popupMatchSelectWidth={false}
            styles={{ popup: { root: { minWidth: 'max-content' } } }}
            options={availableOptions}
            disabled={proposalType === 'CONG_HIEN' && availableOptions.length === 0}
          />
        );
      },
    },
  ];

  // Hàm tính tổng số tháng từ ngày nhập ngũ đến hiện tại (hoặc ngày xuất ngũ)
  const calculateTotalMonths = (
    ngayNhapNgu: string | Date | null | undefined,
    ngayXuatNgu: string | Date | null | undefined
  ) => {
    if (!ngayNhapNgu) return null;

    try {
      const startDate = typeof ngayNhapNgu === 'string' ? new Date(ngayNhapNgu) : ngayNhapNgu;
      const endDate = ngayXuatNgu
        ? typeof ngayXuatNgu === 'string'
          ? new Date(ngayXuatNgu)
          : ngayXuatNgu
        : new Date(); // Nếu chưa xuất ngũ thì tính đến hiện tại

      // Đảm bảo startDate và endDate hợp lệ
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return null;
      }

      // Tính số năm và tháng chính xác
      let years = endDate.getFullYear() - startDate.getFullYear();
      let months = endDate.getMonth() - startDate.getMonth();
      let days = endDate.getDate() - startDate.getDate();

      // Điều chỉnh nếu ngày cuối nhỏ hơn ngày đầu
      if (days < 0) {
        months -= 1;
        // Lấy số ngày của tháng trước đó
        const lastDayOfPrevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
        days += lastDayOfPrevMonth;
      }

      // Điều chỉnh nếu tháng cuối nhỏ hơn tháng đầu
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      // Tính tổng số tháng (làm tròn xuống)
      const totalMonths = years * 12 + months;

      // Tính số năm và tháng còn lại để hiển thị
      const totalYears = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;

      // Trả về object với years và months riêng biệt
      return {
        years: totalYears,
        months: remainingMonths,
        totalMonths: totalMonths,
      };
    } catch {
      return null;
    }
  };

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
      width: 250,
      align: 'center',
      render: (text, record) => {
        const donViTrucThuoc = record.DonViTrucThuoc?.ten_don_vi;
        const coQuanDonVi =
          record.CoQuanDonVi?.ten_don_vi || record.DonViTrucThuoc?.CoQuanDonVi?.ten_don_vi;
        const parts = [];
        if (donViTrucThuoc) parts.push(donViTrucThuoc);
        if (coQuanDonVi) parts.push(coQuanDonVi);
        const unitInfo = parts.length > 0 ? parts.join(', ') : null;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text strong>{text}</Text>
            {unitInfo && (
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                {unitInfo}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'Chức vụ hiện tại',
      key: 'chuc_vu',
      width: 200,
      align: 'center',
      render: (_, record) => {
        const chucVu = record.ChucVu?.ten_chuc_vu;
        return <Text>{chucVu || '-'}</Text>;
      },
    },
    // Thêm cột Tổng tháng cho đề xuất Niên hạn
    ...(proposalType === 'NIEN_HAN'
      ? [
          {
            title: 'Tổng tháng',
            key: 'tong_thang',
            width: 150,
            align: 'center' as const,
            render: (_: any, record: Personnel) => {
              const result = calculateTotalMonths(record.ngay_nhap_ngu, record.ngay_xuat_ngu);
              if (!result) return <Text type="secondary">-</Text>;

              // Hiển thị năm ở trên, tháng nhỏ bên dưới
              if (result.years > 0 && result.months > 0) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Text strong>{result.years} năm</Text>
                    <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.2' }}>
                      {result.months} tháng
                    </Text>
                  </div>
                );
              } else if (result.years > 0) {
                return <Text strong>{result.years} năm</Text>;
              } else if (result.totalMonths > 0) {
                return <Text strong>{result.totalMonths} tháng</Text>;
              } else {
                return <Text type="secondary">0 tháng</Text>;
              }
            },
          },
        ]
      : []),
    {
      title: (
        <span>
          Danh hiệu <Text type="danger">*</Text>
        </span>
      ),
      key: 'danh_hieu',
      width: 200,
      align: 'center',
      render: (_, record) => {
        const data = getTitleData(record.id);

        // Lọc danh hiệu dựa trên điều kiện thời gian cho CONG_HIEN
        let availableOptions = getDanhHieuOptions();
        if (proposalType === 'CONG_HIEN') {
          availableOptions = availableOptions.filter(option => {
            if (option.value === 'HCBVTQ_HANG_NHAT') {
              return checkEligibleForRank(record.id, 'HANG_NHAT');
            } else if (option.value === 'HCBVTQ_HANG_NHI') {
              return checkEligibleForRank(record.id, 'HANG_NHI');
            } else if (option.value === 'HCBVTQ_HANG_BA') {
              return checkEligibleForRank(record.id, 'HANG_BA');
            }
            return true;
          });
        }

        return (
          <Select
            value={data.danh_hieu}
            onChange={value => updateTitle(record.id, 'danh_hieu', value)}
            placeholder="Chọn danh hiệu"
            style={{ width: '100%' }}
            size="middle"
            allowClear
            popupMatchSelectWidth={false}
            styles={{ popup: { root: { minWidth: 'max-content' } } }}
            options={availableOptions}
            disabled={proposalType === 'CONG_HIEN' && availableOptions.length === 0}
          />
        );
      },
    },
    ...(proposalType === 'CONG_HIEN'
      ? [
          {
            title: 'Tổng thời gian (0.7)',
            key: 'total_time_0_7',
            width: 150,
            align: 'center' as const,
            render: (_: any, record: Personnel) => calculateTotalTimeByGroup(record.id, '0.7'),
          },
          {
            title: 'Tổng thời gian (0.8)',
            key: 'total_time_0_8',
            width: 150,
            align: 'center' as const,
            render: (_: any, record: Personnel) => calculateTotalTimeByGroup(record.id, '0.8'),
          },
          {
            title: 'Tổng thời gian (0.9-1.0)',
            key: 'total_time_0_9_1_0',
            width: 150,
            align: 'center' as const,
            render: (_: any, record: Personnel) => calculateTotalTimeByGroup(record.id, '0.9-1.0'),
          },
        ]
      : []),
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
      width: 250,
      align: 'center',
      render: (text, record) => {
        const donViTrucThuoc = record.DonViTrucThuoc?.ten_don_vi;
        const coQuanDonVi =
          record.CoQuanDonVi?.ten_don_vi || record.DonViTrucThuoc?.CoQuanDonVi?.ten_don_vi;
        const parts = [];
        if (donViTrucThuoc) parts.push(donViTrucThuoc);
        if (coQuanDonVi) parts.push(coQuanDonVi);
        const unitInfo = parts.length > 0 ? parts.join(', ') : null;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text strong>{text}</Text>
            {unitInfo && (
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                {unitInfo}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: (
        <span>
          Loại <Text type="danger">*</Text>
        </span>
      ),
      key: 'loai',
      width: 160,
      align: 'center',
      render: (_, record) => {
        const data = getTitleData(record.id);
        return (
          <Select
            value={data.loai}
            onChange={value => updateTitle(record.id, 'loai', value)}
            placeholder="Chọn loại"
            style={{ width: '100%', fontSize: '14px' }}
            size="middle"
            popupMatchSelectWidth={false}
            styles={{ popup: { root: { minWidth: 'max-content' } } }}
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
      width: 400,
      align: 'center',
      render: (_, record) => {
        const data = getTitleData(record.id);
        return (
          <TextArea
            value={data.mo_ta}
            onChange={e => updateTitle(record.id, 'mo_ta', e.target.value)}
            placeholder="Nhập mô tả chi tiết về đề tài hoặc thành tích..."
            rows={1}
            maxLength={500}
            showCount
            style={{ fontSize: '14px' }}
          />
        );
      },
    },
  ];

  const columns =
    proposalType === 'NCKH'
      ? nckhColumns
      : proposalType === 'DON_VI_HANG_NAM'
      ? unitColumns
      : standardColumns;

  return (
    <div>
      <Alert
        message="Hướng dẫn"
        description={
          <div>
            <p>
              1. Chọn danh hiệu khen thưởng cho{' '}
              {proposalType === 'DON_VI_HANG_NAM' ? (
                <>
                  từng đơn vị đã chọn (<strong>{units.length}</strong> đơn vị)
                </>
              ) : (
                <>
                  từng quân nhân đã chọn (<strong>{personnel.length}</strong> quân nhân)
                </>
              )}
            </p>
            <p>
              2. Đảm bảo tất cả {proposalType === 'DON_VI_HANG_NAM' ? 'đơn vị' : 'quân nhân'} đều đã
              được chọn danh hiệu
            </p>
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
          Tổng số {proposalType === 'DON_VI_HANG_NAM' ? 'đơn vị' : 'quân nhân'}:{' '}
          <strong>{proposalType === 'DON_VI_HANG_NAM' ? units.length : personnel.length}</strong>
        </Text>
        <Text type={allTitlesSet ? 'success' : 'warning'}>
          Đã set danh hiệu:{' '}
          <strong>
            {
              titleData.filter(d => {
                if (proposalType === 'NCKH') {
                  return d.loai && d.mo_ta;
                }
                return d.danh_hieu;
              }).length
            }
            /{proposalType === 'DON_VI_HANG_NAM' ? units.length : personnel.length}
          </strong>
          {allTitlesSet && ' ✓'}
        </Text>
      </Space>

      {/* Table */}
      {proposalType === 'DON_VI_HANG_NAM' ? (
        <Table<Unit>
          columns={unitColumns}
          dataSource={units}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          bordered
          locale={{
            emptyText: 'Không có dữ liệu',
          }}
        />
      ) : (
        <Table<Personnel>
          columns={proposalType === 'NCKH' ? nckhColumns : standardColumns}
          dataSource={personnel}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          bordered
          locale={{
            emptyText: 'Không có dữ liệu',
          }}
        />
      )}
    </div>
  );
}
