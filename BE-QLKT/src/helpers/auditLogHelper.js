/**
 * Helper functions để tạo mô tả log cho các resource khác nhau
 * Logic này được tách ra khỏi router để dễ maintain và test
 */

const createLogDescription = {
  /**
   * Tạo mô tả cho proposal actions
   */
  proposal: {
    CREATE: (req, res, responseData) => {
      const proposalType = req.body?.loai_de_xuat || req.body?.type || 'N/A';
      const typeNames = {
        CA_NHAN_HANG_NAM: 'Cá nhân Hằng năm',
        DON_VI_HANG_NAM: 'Đơn vị Hằng năm',
        NIEN_HAN: 'Niên hạn',
        CONG_HIEN: 'Cống hiến',
        DOT_XUAT: 'Đột xuất',
        NCKH: 'ĐTKH/SKKH',
      };
      const typeName = typeNames[proposalType] || proposalType;
      return `Tạo đề xuất khen thưởng: ${typeName}`;
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
    CREATE: (req, res, responseData) => {
      const chucVuId = req.body?.chuc_vu_id || 'N/A';
      try {
        const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        const history = data?.data || data;
        if (history?.ChucVu?.ten_chuc_vu) {
          return `Tạo lịch sử chức vụ: ${history.ChucVu.ten_chuc_vu}`;
        }
      } catch (e) {
        // Ignore parse error
      }
      return `Tạo lịch sử chức vụ: ${chucVuId}`;
    },
    UPDATE: (req, res, responseData) => {
      const historyId = req.params?.id || 'N/A';
      return `Cập nhật lịch sử chức vụ: ${historyId}`;
    },
    DELETE: (req, res, responseData) => {
      const historyId = req.params?.id || 'N/A';
      return `Xóa lịch sử chức vụ: ${historyId}`;
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
