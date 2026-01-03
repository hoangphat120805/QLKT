/**
 * Helper functions để tạo mô tả log cho các resource khác nhau
 * Logic này được tách ra khỏi router để dễ maintain và test
 */

const { formatDate } = require('./datetimeHelper');

// ==================== Helper Functions ====================

/**
 * Parse responseData (có thể là string JSON hoặc object)
 */
const parseResponseData = responseData => {
  try {
    return typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
  } catch {
    return null;
  }
};

/**
 * Lấy tên đơn vị từ ChucVu object
 */
const getUnitNameFromChucVu = chucVu => {
  if (!chucVu) return '';
  if (chucVu.CoQuanDonVi?.ten_don_vi) {
    return chucVu.CoQuanDonVi.ten_don_vi;
  }
  if (chucVu.DonViTrucThuoc?.ten_don_vi) {
    const tenDonVi = chucVu.DonViTrucThuoc.ten_don_vi;
    if (chucVu.DonViTrucThuoc.CoQuanDonVi?.ten_don_vi) {
      return `${tenDonVi} (${chucVu.DonViTrucThuoc.CoQuanDonVi.ten_don_vi})`;
    }
    return tenDonVi;
  }
  return '';
};

/**
 * Query và lấy tên đơn vị từ unitId
 */
const getUnitNameFromUnitId = async (unitId, prisma) => {
  if (!unitId) return '';
  try {
    const [coQuanDonVi, donViTrucThuoc] = await Promise.all([
      prisma.coQuanDonVi.findUnique({
        where: { id: unitId },
        select: { ten_don_vi: true },
      }),
      prisma.donViTrucThuoc.findUnique({
        where: { id: unitId },
        include: {
          CoQuanDonVi: { select: { ten_don_vi: true } },
        },
      }),
    ]);

    if (coQuanDonVi?.ten_don_vi) {
      return coQuanDonVi.ten_don_vi;
    }
    if (donViTrucThuoc?.ten_don_vi) {
      const tenDonVi = donViTrucThuoc.ten_don_vi;
      if (donViTrucThuoc.CoQuanDonVi?.ten_don_vi) {
        return `${tenDonVi} (${donViTrucThuoc.CoQuanDonVi.ten_don_vi})`;
      }
      return tenDonVi;
    }
    return '';
  } catch {
    return '';
  }
};

/**
 * Query tên quân nhân từ personnelId
 */
const queryPersonnelName = async (personnelId, prisma) => {
  if (!personnelId || personnelId === 'N/A') return '';
  try {
    const personnel = await prisma.quanNhan.findUnique({
      where: { id: personnelId },
      select: { ho_ten: true },
    });
    return personnel?.ho_ten || '';
  } catch {
    return '';
  }
};

/**
 * Query thông tin chức vụ (tên và đơn vị) từ chucVuId
 */
const queryPositionInfo = async (chucVuId, prisma) => {
  if (!chucVuId || chucVuId === 'N/A') return { tenChucVu: '', tenDonVi: '' };
  try {
    const chucVu = await prisma.chucVu.findUnique({
      where: { id: chucVuId },
      include: {
        CoQuanDonVi: { select: { ten_don_vi: true } },
        DonViTrucThuoc: {
          include: {
            CoQuanDonVi: { select: { ten_don_vi: true } },
          },
        },
      },
    });
    if (!chucVu) return { tenChucVu: '', tenDonVi: '' };
    return {
      tenChucVu: chucVu.ten_chuc_vu || '',
      tenDonVi: getUnitNameFromChucVu(chucVu),
    };
  } catch {
    return { tenChucVu: '', tenDonVi: '' };
  }
};

/**
 * Tạo PrismaClient instance và đảm bảo disconnect sau khi dùng
 */
const withPrisma = async callback => {
  const { PrismaClient } = require('../generated/prisma');
  const prisma = new PrismaClient();
  try {
    return await callback(prisma);
  } catch (error) {
    console.error('Error querying database for log description:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Format date range cho log description
 */
const formatDateRange = (ngayBatDau, ngayKetThuc) => {
  if (!ngayBatDau && ngayKetThuc === undefined) return '';
  if (ngayBatDau) {
    const formattedStart = formatDate(ngayBatDau);
    if (ngayKetThuc !== undefined) {
      if (ngayKetThuc) {
        const formattedEnd = formatDate(ngayKetThuc);
        return ` (Từ: ${formattedStart} đến: ${formattedEnd})`;
      }
      return ` (Từ: ${formattedStart} - Chưa kết thúc)`;
    }
    return ` (Từ: ${formattedStart})`;
  }
  if (ngayKetThuc !== undefined) {
    if (ngayKetThuc) {
      const formattedEnd = formatDate(ngayKetThuc);
      return ` (Đến: ${formattedEnd})`;
    }
    return ' (Chưa kết thúc)';
  }
  return '';
};

const createLogDescription = {
  /**
   * Tạo mô tả cho proposals actions
   */
  proposals: {
    CREATE: (req, res, responseData) => {
      const proposalType = req.body?.loai_de_xuat || req.body?.type || 'N/A';
      const typeNames = {
        CA_NHAN_HANG_NAM: 'Cá nhân Hằng năm',
        DON_VI_HANG_NAM: 'Đơn vị Hằng năm',
        NIEN_HAN: 'Niên hạn',
        CONG_HIEN: 'Cống hiến',
        DOT_XUAT: 'Đột xuất',
        NCKH: 'ĐTKH/SKKH',
        HC_QKQT: 'Huy chương Quân kỳ Quyết thắng',
        KNC_VSNXD_QDNDVN: 'Kỷ niệm chương Vì sự nghiệp xây dựng QĐNDVN',
      };
      const typeName = typeNames[proposalType] || proposalType;

      // Lấy thông tin từ response nếu có
      let soLuong = 0;
      let nam = '';
      let donVi = '';

      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const proposal = data?.data?.proposal || data?.proposal || data?.data || data;

        if (proposal) {
          soLuong =
            proposal.so_personnel ||
            (Array.isArray(proposal.data_danh_hieu) ? proposal.data_danh_hieu.length : 0) ||
            (Array.isArray(proposal.data_nien_han) ? proposal.data_nien_han.length : 0) ||
            (Array.isArray(proposal.data_cong_hien) ? proposal.data_cong_hien.length : 0) ||
            (Array.isArray(proposal.data_thanh_tich) ? proposal.data_thanh_tich.length : 0) ||
            0;
          nam = proposal.nam || req.body?.nam || '';
          donVi = proposal.don_vi || '';
        }
      } catch (e) {
        // Ignore parse error
      }

      // Nếu không có từ response, thử lấy từ request body
      if (soLuong === 0) {
        const titleData = req.body?.title_data;
        if (titleData) {
          try {
            const parsed = typeof titleData === 'string' ? JSON.parse(titleData) : titleData;
            soLuong = Array.isArray(parsed) ? parsed.length : 0;
          } catch (e) {
            // Ignore parse error
          }
        }
        nam = req.body?.nam || '';
      }

      // Tạo mô tả chi tiết
      let description = `Tạo đề xuất khen thưởng: ${typeName}`;

      if (soLuong > 0) {
        const unitText = proposalType === 'DON_VI_HANG_NAM' ? 'đơn vị' : 'quân nhân';
        description += ` (${soLuong} ${unitText}`;
        if (nam) {
          description += `, năm ${nam}`;
        }
        description += ')';
      } else if (nam) {
        description += ` (năm ${nam})`;
      }

      if (donVi) {
        description += ` - ${donVi}`;
      }

      return description;
    },
    APPROVE: (req, res, responseData) => {
      const proposalId = req.params?.id || 'N/A';
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const proposal = data?.data || data;
        if (proposal?.loai_de_xuat) {
          const typeNames = {
            CA_NHAN_HANG_NAM: 'Cá nhân Hằng năm',
            DON_VI_HANG_NAM: 'Đơn vị Hằng năm',
            NIEN_HAN: 'Niên hạn',
            CONG_HIEN: 'Cống hiến',
            DOT_XUAT: 'Đột xuất',
            NCKH: 'ĐTKH/SKKH',
          };
          const typeName = typeNames[proposal.loai_de_xuat] || proposal.loai_de_xuat;
          return `Phê duyệt đề xuất ${typeName}: ${proposalId}`;
        }
      } catch (e) {
        // Ignore parse error
      }
      return `Phê duyệt đề xuất: ${proposalId}`;
    },
    REJECT: (req, res, responseData) => {
      const proposalId = req.params?.id || 'N/A';
      const reason = req.body?.ly_do_tu_choi || '';
      return `Từ chối đề xuất: ${proposalId}${reason ? ` - Lý do: ${reason}` : ''}`;
    },
    DELETE: (req, res, responseData) => {
      const proposalId = req.params?.id || 'N/A';
      return `Xóa đề xuất: ${proposalId}`;
    },
  },

  /**
   * Tạo mô tả cho annual-reward actions
   */
  'annual-rewards': {
    CREATE: (req, res, responseData) => {
      const danhHieu = req.body?.danh_hieu || 'N/A';
      const nam = req.body?.nam || 'N/A';
      return `Tạo danh hiệu hằng năm: ${danhHieu} - Năm ${nam}`;
    },
    UPDATE: (req, res, responseData) => {
      const danhHieu = req.body?.danh_hieu || 'N/A';
      const nam = req.body?.nam || 'N/A';
      return `Cập nhật danh hiệu hằng năm: ${danhHieu} - Năm ${nam}`;
    },
    DELETE: (req, res, responseData) => {
      const rewardId = req.params?.id || 'N/A';
      return `Xóa danh hiệu hằng năm: ${rewardId}`;
    },
    BULK: (req, res, responseData) => {
      const danhHieu = req.body?.danh_hieu || 'N/A';
      const nam = req.body?.nam || 'N/A';
      let personnelCount = 0;
      let successCount = 0;

      // Lấy số lượng từ request body
      try {
        const personnelIds =
          typeof req.body?.personnel_ids === 'string'
            ? JSON.parse(req.body.personnel_ids)
            : req.body?.personnel_ids;
        personnelCount = Array.isArray(personnelIds) ? personnelIds.length : 0;
      } catch (e) {
        // Ignore parse error
      }

      // Lấy số lượng thành công từ response
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const result = data?.data || data;
        successCount = result?.success || result?.successCount || personnelCount;
      } catch (e) {
        // Ignore parse error
        successCount = personnelCount;
      }

      return `Thêm đồng loạt danh hiệu hằng năm: ${danhHieu} - Năm ${nam}${
        successCount > 0
          ? ` (${successCount}/${personnelCount} quân nhân thành công)`
          : personnelCount > 0
          ? ` (${personnelCount} quân nhân)`
          : ''
      }`;
    },
    IMPORT: (req, res, responseData) => {
      const fileName = req.file?.originalname || 'N/A';
      let successCount = 0;
      let failCount = 0;

      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const result = data?.data || data;
        successCount = result?.success || result?.successCount || result?.total || 0;
        failCount = result?.failed || result?.failCount || 0;

        if (successCount > 0 || failCount > 0) {
          return `Import danh hiệu hằng năm từ file: ${fileName} (${successCount} thành công${
            failCount > 0 ? `, ${failCount} thất bại` : ''
          })`;
        }
      } catch (e) {
        // Ignore parse error
      }

      return `Import danh hiệu hằng năm từ file: ${fileName}`;
    },
  },

  /**
   * Tạo mô tả cho position-history actions
   */
  'position-history': {
    CREATE: async (req, res, responseData) => {
      const personnelId = req.params?.personnelId || req.body?.personnel_id || 'N/A';
      const chucVuId = req.body?.chuc_vu_id || 'N/A';

      // Parse response data
      const parsedData = parseResponseData(responseData);
      const history = parsedData?.data || parsedData;

      // Lấy thông tin từ response
      let hoTen = history?.QuanNhan?.ho_ten || '';
      let tenChucVu = history?.ChucVu?.ten_chuc_vu || '';
      let tenDonVi = getUnitNameFromChucVu(history?.ChucVu);
      let ngayBatDau = history?.ngay_bat_dau || req.body?.ngay_bat_dau || '';
      let ngayKetThuc = history?.ngay_ket_thuc || req.body?.ngay_ket_thuc || '';

      // Query database nếu thiếu thông tin
      if ((!hoTen && personnelId !== 'N/A') || (!tenChucVu && chucVuId !== 'N/A')) {
        await withPrisma(async prisma => {
          if (!hoTen && personnelId !== 'N/A') {
            hoTen = await queryPersonnelName(personnelId, prisma);
          }
          if (!tenChucVu && chucVuId !== 'N/A') {
            const positionInfo = await queryPositionInfo(chucVuId, prisma);
            tenChucVu = positionInfo.tenChucVu;
            if (!tenDonVi) {
              tenDonVi = positionInfo.tenDonVi;
            }
          }
        });
      }

      // Tạo mô tả
      let description = 'Tạo lịch sử chức vụ';
      if (hoTen) {
        description += ` cho quân nhân: ${hoTen}`;
      } else if (personnelId !== 'N/A') {
        description += ` cho quân nhân ID: ${personnelId}`;
      }

      if (tenChucVu) {
        description += ` - Chức vụ: ${tenChucVu}`;
        if (tenDonVi) {
          description += ` (${tenDonVi})`;
        }
      } else if (chucVuId !== 'N/A') {
        description += ` - Chức vụ ID: ${chucVuId}`;
      }

      description += formatDateRange(ngayBatDau, ngayKetThuc);

      return description;
    },
    UPDATE: async (req, res, responseData) => {
      const historyId = req.params?.id || 'N/A';
      const chucVuId = req.body?.chuc_vu_id || null;

      // Parse response data
      const parsedData = parseResponseData(responseData);
      const history = parsedData?.data || parsedData;

      // Lấy thông tin từ response
      let hoTen = history?.QuanNhan?.ho_ten || '';
      let personnelId = history?.quan_nhan_id || null;
      let tenChucVu = history?.ChucVu?.ten_chuc_vu || '';
      let tenDonVi = getUnitNameFromChucVu(history?.ChucVu);
      let ngayBatDau = history?.ngay_bat_dau || req.body?.ngay_bat_dau || '';
      let ngayKetThuc =
        history?.ngay_ket_thuc !== undefined
          ? history.ngay_ket_thuc
          : req.body?.ngay_ket_thuc !== undefined
          ? req.body.ngay_ket_thuc
          : undefined;

      // Query database nếu thiếu thông tin
      if ((!hoTen || !tenChucVu) && historyId !== 'N/A') {
        await withPrisma(async prisma => {
          // Query lịch sử chức vụ để lấy personnelId và chucVuId
          const historyRecord = await prisma.lichSuChucVu.findUnique({
            where: { id: historyId },
            select: {
              quan_nhan_id: true,
              chuc_vu_id: true,
            },
          });

          if (historyRecord) {
            if (!personnelId) {
              personnelId = historyRecord.quan_nhan_id;
            }
            const finalChucVuId = chucVuId || historyRecord.chuc_vu_id;

            if (!hoTen && personnelId) {
              hoTen = await queryPersonnelName(personnelId, prisma);
            }

            if (!tenChucVu && finalChucVuId) {
              const positionInfo = await queryPositionInfo(finalChucVuId, prisma);
              tenChucVu = positionInfo.tenChucVu;
              if (!tenDonVi) {
                tenDonVi = positionInfo.tenDonVi;
              }
            }
          }
        });
      }

      // Tạo mô tả
      let description = 'Cập nhật lịch sử chức vụ';
      if (hoTen) {
        description += ` cho quân nhân: ${hoTen}`;
      } else {
        description += ` ID: ${historyId}`;
      }

      if (tenChucVu) {
        description += ` - Chức vụ: ${tenChucVu}`;
        if (tenDonVi) {
          description += ` (${tenDonVi})`;
        }
      }

      description += formatDateRange(ngayBatDau, ngayKetThuc);

      return description;
    },
    DELETE: async (req, res, responseData) => {
      const historyId = req.params?.id || 'N/A';

      // Parse response data (service trả về thông tin trước khi xóa)
      const parsedData = parseResponseData(responseData);
      const result = parsedData?.data || parsedData;

      // Lấy thông tin từ response
      let hoTen = result?.QuanNhan?.ho_ten || '';
      let tenChucVu = result?.ChucVu?.ten_chuc_vu || '';
      let tenDonVi = getUnitNameFromChucVu(result?.ChucVu);

      // Query database nếu thiếu thông tin
      if ((!hoTen || !tenChucVu) && historyId !== 'N/A') {
        await withPrisma(async prisma => {
          const history = await prisma.lichSuChucVu.findUnique({
            where: { id: historyId },
            include: {
              QuanNhan: { select: { ho_ten: true } },
              ChucVu: {
                include: {
                  CoQuanDonVi: { select: { ten_don_vi: true } },
                  DonViTrucThuoc: {
                    include: {
                      CoQuanDonVi: { select: { ten_don_vi: true } },
                    },
                  },
                },
              },
            },
          });

          if (history) {
            if (!hoTen && history.QuanNhan?.ho_ten) {
              hoTen = history.QuanNhan.ho_ten;
            }
            if (!tenChucVu && history.ChucVu?.ten_chuc_vu) {
              tenChucVu = history.ChucVu.ten_chuc_vu;
            }
            if (!tenDonVi) {
              tenDonVi = getUnitNameFromChucVu(history.ChucVu);
            }
          }
        });
      }

      // Tạo mô tả
      let description = 'Xóa lịch sử chức vụ';
      if (hoTen) {
        description += ` của quân nhân: ${hoTen}`;
      } else {
        description += ` ID: ${historyId}`;
      }

      if (tenChucVu) {
        description += ` - Chức vụ: ${tenChucVu}`;
        if (tenDonVi) {
          description += ` (${tenDonVi})`;
        }
      }

      return description;
    },
  },

  /**
   * Tạo mô tả cho accounts actions
   */
  accounts: {
    CREATE: (req, res, responseData) => {
      const username = req.body?.username || 'N/A';
      const role = req.body?.role || '';
      const roleNames = {
        USER: 'Người dùng',
        MANAGER: 'Quản lý',
        ADMIN: 'Quản trị viên',
        SUPER_ADMIN: 'Quản trị viên cấp cao',
      };
      const roleName = roleNames[role] || role;
      return `Tạo tài khoản: ${username}${role ? ` (${roleName})` : ''}`;
    },
    UPDATE: (req, res, responseData) => {
      const username = req.body?.username || 'N/A';
      const role = req.body?.role || '';
      const roleNames = {
        USER: 'Người dùng',
        MANAGER: 'Quản lý',
        ADMIN: 'Quản trị viên',
        SUPER_ADMIN: 'Quản trị viên cấp cao',
      };
      const roleName = roleNames[role] || role;
      return `Cập nhật tài khoản: ${username}${role ? ` (${roleName})` : ''}`;
    },
    DELETE: (req, res, responseData) => {
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const username = data?.data?.username || `ID ${req.params?.id || 'N/A'}`;
        return `Xóa tài khoản: ${username}`;
      } catch (e) {
        return `Xóa tài khoản: ID ${req.params?.id || 'N/A'}`;
      }
    },
    RESET_PASSWORD: (req, res, responseData) => {
      const username = req.body?.username || req.body?.account_id || 'N/A';
      return `Đặt lại mật khẩu cho tài khoản: ${username}`;
    },
  },

  /**
   * Tạo mô tả cho personnel actions
   */
  personnel: {
    CREATE: (req, res, responseData) => {
      const hoTen = req.body?.ho_ten || 'N/A';
      const cccd = req.body?.cccd || '';
      return `Tạo quân nhân: ${hoTen}${cccd ? ` (CCCD: ${cccd})` : ''}`;
    },
    UPDATE: (req, res, responseData) => {
      const hoTen = req.body?.ho_ten || 'N/A';
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const personnel = data?.data || data;
        if (personnel?.ho_ten) {
          return `Cập nhật quân nhân: ${personnel.ho_ten}`;
        }
      } catch (e) {
        // Ignore parse error
      }
      return `Cập nhật quân nhân: ${hoTen}`;
    },
    DELETE: (req, res, responseData) => {
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const hoTen = data?.data?.ho_ten || `ID ${req.params?.id || 'N/A'}`;
        return `Xóa quân nhân: ${hoTen}`;
      } catch (e) {
        return `Xóa quân nhân: ID ${req.params?.id || 'N/A'}`;
      }
    },
    IMPORT: (req, res, responseData) => {
      const fileName = req.file?.originalname || 'N/A';
      let successCount = 0;
      let failCount = 0;

      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const result = data?.data || data;
        successCount = result?.success || result?.successCount || result?.total || 0;
        failCount = result?.failed || result?.failCount || 0;

        if (successCount > 0 || failCount > 0) {
          return `Import quân nhân từ file: ${fileName} (${successCount} thành công${
            failCount > 0 ? `, ${failCount} thất bại` : ''
          })`;
        }
      } catch (e) {
        // Ignore parse error
      }

      return `Import quân nhân từ file: ${fileName}`;
    },
    EXPORT: (req, res, responseData) => {
      return `Xuất dữ liệu quân nhân ra Excel`;
    },
  },

  /**
   * Tạo mô tả cho units actions
   */
  units: {
    CREATE: (req, res, responseData) => {
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const unit = data?.data || data;
        if (unit?.ten_don_vi) {
          return `Tạo đơn vị trực thuộc: ${unit.ten_don_vi}`;
        }
        if (unit?.ten_co_quan_don_vi) {
          return `Tạo cơ quan đơn vị: ${unit.ten_co_quan_don_vi}`;
        }
      } catch (e) {
        // Ignore parse error
      }
      // Kiểm tra từ request body để phân biệt
      if (req.body?.ten_don_vi) {
        return `Tạo đơn vị trực thuộc: ${req.body.ten_don_vi}`;
      }
      if (req.body?.ten_co_quan_don_vi) {
        return `Tạo cơ quan đơn vị: ${req.body.ten_co_quan_don_vi}`;
      }
      return `Tạo đơn vị: ${req.body?.ten_don_vi || req.body?.ten_co_quan_don_vi || 'N/A'}`;
    },
    UPDATE: (req, res, responseData) => {
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const unit = data?.data || data;
        if (unit?.ten_don_vi) {
          return `Cập nhật đơn vị trực thuộc: ${unit.ten_don_vi}`;
        }
        if (unit?.ten_co_quan_don_vi) {
          return `Cập nhật cơ quan đơn vị: ${unit.ten_co_quan_don_vi}`;
        }
      } catch (e) {
        // Ignore parse error
      }
      // Kiểm tra từ request body để phân biệt
      if (req.body?.ten_don_vi) {
        return `Cập nhật đơn vị trực thuộc: ${req.body.ten_don_vi}`;
      }
      if (req.body?.ten_co_quan_don_vi) {
        return `Cập nhật cơ quan đơn vị: ${req.body.ten_co_quan_don_vi}`;
      }
      return `Cập nhật đơn vị: ${req.body?.ten_don_vi || req.body?.ten_co_quan_don_vi || 'N/A'}`;
    },
    DELETE: (req, res, responseData) => {
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const unit = data?.data || data;
        if (unit?.ten_don_vi) {
          return `Xóa đơn vị trực thuộc: ${unit.ten_don_vi}`;
        }
        if (unit?.ten_co_quan_don_vi) {
          return `Xóa cơ quan đơn vị: ${unit.ten_co_quan_don_vi}`;
        }
      } catch (e) {
        // Ignore parse error
      }
      return `Xóa đơn vị: ID ${req.params?.id || 'N/A'}`;
    },
  },

  /**
   * Tạo mô tả cho positions actions
   */
  positions: {
    CREATE: async (req, res, responseData) => {
      const tenChucVu = req.body?.ten_chuc_vu || 'N/A';
      const unitId = req.body?.unit_id || null;
      const ngayHienTai = formatDate(new Date());

      // Parse response data
      const parsedData = parseResponseData(responseData);
      const position = parsedData?.data || parsedData;

      // Lấy thông tin từ response
      let finalTenChucVu = position?.ten_chuc_vu || tenChucVu;
      let tenDonVi = getUnitNameFromChucVu(position);

      // Query database nếu thiếu thông tin đơn vị
      if (!tenDonVi && unitId) {
        await withPrisma(async prisma => {
          tenDonVi = await getUnitNameFromUnitId(unitId, prisma);
        });
      }

      let description = `Tạo chức vụ: ${finalTenChucVu}`;
      if (tenDonVi) {
        description += ` (${tenDonVi})`;
      }
      if (ngayHienTai) {
        description += ` - Ngày: ${ngayHienTai}`;
      }
      return description;
    },
    UPDATE: async (req, res, responseData) => {
      const positionId = req.params?.id || 'N/A';
      const tenChucVu = req.body?.ten_chuc_vu || null;
      const ngayHienTai = formatDate(new Date());

      // Parse response data
      const parsedData = parseResponseData(responseData);
      const position = parsedData?.data || parsedData;

      // Lấy thông tin từ response
      let finalTenChucVu = position?.ten_chuc_vu || tenChucVu;
      let tenDonVi = getUnitNameFromChucVu(position);

      // Query database nếu thiếu thông tin
      if ((!finalTenChucVu || !tenDonVi) && positionId !== 'N/A') {
        await withPrisma(async prisma => {
          const positionInfo = await queryPositionInfo(positionId, prisma);
          if (!finalTenChucVu) {
            finalTenChucVu = positionInfo.tenChucVu || positionId;
          }
          if (!tenDonVi) {
            tenDonVi = positionInfo.tenDonVi;
          }
        });
      }

      let description = `Cập nhật chức vụ: ${finalTenChucVu || positionId}`;
      if (tenDonVi) {
        description += ` (${tenDonVi})`;
      }
      if (ngayHienTai) {
        description += ` - Ngày: ${ngayHienTai}`;
      }
      return description;
    },
    DELETE: async (req, res, responseData) => {
      const positionId = req.params?.id || 'N/A';
      const ngayHienTai = formatDate(new Date());

      // Parse response data (service trả về thông tin trước khi xóa)
      const parsedData = parseResponseData(responseData);
      const position = parsedData?.data || parsedData;

      // Lấy thông tin từ response
      let tenChucVu = position?.ten_chuc_vu || '';
      let tenDonVi = getUnitNameFromChucVu(position);

      // Query database nếu thiếu thông tin
      if ((!tenChucVu || !tenDonVi) && positionId !== 'N/A') {
        await withPrisma(async prisma => {
          const positionInfo = await queryPositionInfo(positionId, prisma);
          if (!tenChucVu) {
            tenChucVu = positionInfo.tenChucVu;
          }
          if (!tenDonVi) {
            tenDonVi = positionInfo.tenDonVi;
          }
        });
      }

      let description = 'Xóa chức vụ';
      if (tenChucVu) {
        description += `: ${tenChucVu}`;
        if (tenDonVi) {
          description += ` (${tenDonVi})`;
        }
      } else {
        description += ` ID: ${positionId}`;
      }
      if (ngayHienTai) {
        description += ` - Ngày: ${ngayHienTai}`;
      }

      return description;
    },
  },

  /**
   * Tạo mô tả cho decisions actions
   */
  decisions: {
    CREATE: (req, res, responseData) => {
      const soQuyetDinh = req.body?.so_quyet_dinh || 'N/A';
      const loaiQuyetDinh = req.body?.loai_quyet_dinh || '';
      const loaiNames = {
        DANH_HIEU_HANG_NAM: 'Danh hiệu hằng năm',
        DANH_HIEU_NIEN_HAN: 'Danh hiệu niên hạn',
        CONG_HIEN: 'Khen thưởng cống hiến',
        BKBQP: 'Bằng khen Bộ Quốc phòng',
        CSTDTQ: 'Chiến sĩ thi đua toàn quốc',
      };
      const loaiName = loaiNames[loaiQuyetDinh] || loaiQuyetDinh || '';
      return `Tạo quyết định: ${soQuyetDinh}${loaiName ? ` (${loaiName})` : ''}`;
    },
    UPDATE: (req, res, responseData) => {
      const soQuyetDinh = req.body?.so_quyet_dinh || 'N/A';
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const decision = data?.data || data;
        if (decision?.so_quyet_dinh) {
          return `Cập nhật quyết định: ${decision.so_quyet_dinh}`;
        }
      } catch (e) {
        // Ignore parse error
      }
      return `Cập nhật quyết định: ${soQuyetDinh}`;
    },
    DELETE: (req, res, responseData) => {
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const decision = data?.data || data;
        if (decision?.so_quyet_dinh) {
          return `Xóa quyết định: ${decision.so_quyet_dinh}`;
        }
      } catch (e) {
        // Ignore parse error
      }
      return `Xóa quyết định: ID ${req.params?.id || 'N/A'}`;
    },
  },

  /**
   * Tạo mô tả cho scientific-achievements actions
   */
  'scientific-achievements': {
    CREATE: (req, res, responseData) => {
      const loai = req.body?.loai || 'N/A';
      const moTa = req.body?.mo_ta || '';
      const nam = req.body?.nam || '';
      const loaiNames = {
        NCKH: 'Nghiên cứu khoa học',
        SKKH: 'Sáng kiến kinh nghiệm',
      };
      const loaiName = loaiNames[loai] || loai;
      return `Tạo thành tích khoa học: ${loaiName}${moTa ? ` - ${moTa}` : ''}${
        nam ? ` (Năm ${nam})` : ''
      }`;
    },
    UPDATE: (req, res, responseData) => {
      const loai = req.body?.loai || 'N/A';
      const moTa = req.body?.mo_ta || '';
      const nam = req.body?.nam || '';
      const loaiNames = {
        NCKH: 'Nghiên cứu khoa học',
        SKKH: 'Sáng kiến kinh nghiệm',
      };
      const loaiName = loaiNames[loai] || loai;
      return `Cập nhật thành tích khoa học: ${loaiName}${moTa ? ` - ${moTa}` : ''}${
        nam ? ` (Năm ${nam})` : ''
      }`;
    },
    DELETE: (req, res, responseData) => {
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const achievement = data?.data || data;
        if (achievement?.loai && achievement?.mo_ta) {
          const loaiNames = {
            NCKH: 'Nghiên cứu khoa học',
            SKKH: 'Sáng kiến kinh nghiệm',
          };
          const loaiName = loaiNames[achievement.loai] || achievement.loai;
          return `Xóa thành tích khoa học: ${loaiName} - ${achievement.mo_ta}`;
        }
      } catch (e) {
        // Ignore parse error
      }
      return `Xóa thành tích khoa học: ID ${req.params?.id || 'N/A'}`;
    },
  },

  /**
   * Tạo mô tả cho auth actions
   */
  auth: {
    LOGIN: (req, res, responseData) => {
      const username = req.body?.username || 'N/A';
      return `Đăng nhập hệ thống: ${username}`;
    },
    LOGOUT: (req, res, responseData) => {
      return `Đăng xuất khỏi hệ thống`;
    },
    CHANGE_PASSWORD: (req, res, responseData) => {
      return `Đổi mật khẩu tài khoản`;
    },
  },
};

/**
 * Get log description helper
 * @param {string} resource - Resource name (proposals, annual-rewards, etc.)
 * @param {string} action - Action name (CREATE, UPDATE, DELETE, etc.)
 * @returns {Function} Function to create description
 */
const getLogDescription = (resource, action) => {
  const resourceHelper = createLogDescription[resource];
  if (!resourceHelper) {
    return (req, res, responseData) => `${action} ${resource}`;
  }

  const actionHelper = resourceHelper[action];
  if (!actionHelper) {
    return (req, res, responseData) => `${action} ${resource}`;
  }

  return actionHelper;
};

/**
 * Get resource ID from request
 */
const getResourceId = {
  fromParams:
    (paramName = 'id') =>
    req => {
      return req.params?.[paramName] || null;
    },
  fromResponse: () => (req, res, responseData) => {
    try {
      const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
      return data?.data?.id || data?.id || null;
    } catch {
      return null;
    }
  },
  fromBody:
    (fieldName = 'id') =>
    req => {
      return req.body?.[fieldName] || null;
    },
};

module.exports = {
  getLogDescription,
  getResourceId,
  createLogDescription,
};
