const { prisma } = require('../models');

class ProfileService {
  /**
   * Lấy hồ sơ gợi ý hằng năm
   */
  async getAnnualProfile(personnelId) {
    try {
      const personnel = await prisma.quanNhan.findUnique({
        where: { id: personnelId },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      let profile = await prisma.hoSoHangNam.findUnique({
        where: { quan_nhan_id: personnelId },
        include: {
          QuanNhan: {
            include: {
              DonVi: true,
              ChucVu: true,
            },
          },
        },
      });

      // Nếu chưa có hồ sơ, tạo mới với giá trị mặc định
      if (!profile) {
        profile = await prisma.hoSoHangNam.create({
          data: {
            quan_nhan_id: personnelId,
            tong_cstdcs: 0,
            tong_nckh: 0,
            cstdcs_lien_tuc: 0,
            du_dieu_kien_bkbqp: false,
            du_dieu_kien_cstdtq: false,
            goi_y: 'Chưa có dữ liệu để tính toán. Vui lòng nhập danh hiệu và thành tích.',
          },
          include: {
            QuanNhan: {
              include: {
                DonVi: true,
                ChucVu: true,
              },
            },
          },
        });
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy hồ sơ gợi ý niên hạn
   */
  async getServiceProfile(personnelId) {
    try {
      const personnel = await prisma.quanNhan.findUnique({
        where: { id: personnelId },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      let profile = await prisma.hoSoNienHan.findUnique({
        where: { quan_nhan_id: personnelId },
        include: {
          QuanNhan: {
            include: {
              DonVi: true,
              ChucVu: true,
            },
          },
        },
      });

      // Nếu chưa có hồ sơ, tạo mới với giá trị mặc định
      if (!profile) {
        profile = await prisma.hoSoNienHan.create({
          data: {
            quan_nhan_id: personnelId,
            hccsvv_hang_ba_status: 'CHUA_DU',
            hccsvv_hang_nhi_status: 'CHUA_DU',
            hccsvv_hang_nhat_status: 'CHUA_DU',
            hcbvtq_total_months: 0,
            hcbvtq_hang_ba_status: 'CHUA_DU',
            hcbvtq_hang_nhi_status: 'CHUA_DU',
            hcbvtq_hang_nhat_status: 'CHUA_DU',
            goi_y: 'Chưa có dữ liệu để tính toán. Vui lòng nhập lịch sử chức vụ.',
          },
          include: {
            QuanNhan: {
              include: {
                DonVi: true,
                ChucVu: true,
              },
            },
          },
        });
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ==============================================
   * HELPER FUNCTIONS - KHEN THƯỞNG HẰNG NĂM
   * ==============================================
   */

  /**
   * Tính số năm CSTĐCS liên tục từ năm gần nhất
   * @param {Array} danhHieuList - Danh sách danh hiệu đã sắp xếp theo năm giảm dần
   * @returns {number} Số năm liên tục
   */
  calculateContinuousCSTDCS(danhHieuList) {
    let count = 0;
    const sortedRewards = [...danhHieuList].sort((a, b) => b.nam - a.nam);

    for (const reward of sortedRewards) {
      // Kiểm tra đã nhận CSTĐTQ → reset chuỗi
      if (reward.nhan_cstdtq === true) {
        // Nếu gặp năm đã nhận CSTĐTQ, reset về 0 (bắt đầu chuỗi mới)
        count = 0;
        continue;
      }

      // Đếm CSTDCS
      if (reward.danh_hieu === 'CSTDCS') {
        count++;
      } else {
        // Gặp năm không phải CSTDCS (CSTT, KHONG_DAT, null) → dừng đếm
        break;
      }
    }

    return count;
  }

  /**
   * Kiểm tra NCKH trong khoảng năm
   * @param {Array} nckhList - Danh sách NCKH đã approved
   * @param {Array} years - Mảng các năm cần kiểm tra [2023, 2024, 2025]
   * @returns {Object} { hasNCKH: boolean, years: [2023, 2025] }
   */
  checkNCKHInYears(nckhList, years) {
    const nckhYears = nckhList.map(n => n.nam);
    const foundYears = years.filter(year => nckhYears.includes(year));
    return {
      hasNCKH: foundYears.length > 0,
      years: foundYears,
    };
  }

  /**
   * Tính toán gợi ý BKBQP (5 năm CSTĐCS liên tục)
   * @param {number} cstdcsLienTuc - Số năm CSTĐCS liên tục
   * @param {Array} danhHieuList - Danh sách danh hiệu
   * @param {Array} nckhList - Danh sách NCKH đã approved
   * @returns {Object} { duDieuKien: boolean, goiY: string }
   */
  calculateBKBQP(cstdcsLienTuc, danhHieuList, nckhList) {
    // Chưa đủ 5 năm CSTĐCS liên tục
    if (cstdcsLienTuc < 5) {
      return {
        duDieuKien: false,
        goiY: `Hiện có ${cstdcsLienTuc} năm CSTĐCS liên tục. Cần ${
          5 - cstdcsLienTuc
        } năm CSTĐCS nữa để xét BKBQP.`,
      };
    }

    // Đã có đủ 5 năm CSTĐCS liên tục
    if (cstdcsLienTuc >= 5) {
      return {
        duDieuKien: true,
        goiY: 'Đã đủ điều kiện đề nghị xét Bằng khen Bộ Quốc phòng.',
      };
    }

    // Trường hợp mặc định: chưa đủ
    return {
      duDieuKien: false,
      goiY: `Hiện có ${cstdcsLienTuc} năm CSTĐCS liên tục. Cần ${
        5 - cstdcsLienTuc
      } năm CSTĐCS nữa để xét BKBQP.`,
    };
  }

  /**
   * Tính toán gợi ý CSTĐTQ (10 năm CSTĐCS liên tục + 1 ĐTKH/SKKH)
   * @param {number} cstdcsLienTuc - Số năm CSTĐCS liên tục
   * @param {Object} bkbqpResult - Kết quả tính toán BKBQP
   * @param {Array} danhHieuList - Danh sách danh hiệu
   * @param {Array} nckhList - Danh sách NCKH đã approved
   * @returns {Object} { duDieuKien: boolean, goiY: string }
   */
  calculateCSTDTQ(cstdcsLienTuc, bkbqpResult, danhHieuList, nckhList) {
    // CSTDTQ chỉ xét nếu đã đủ điều kiện BKBQP (5 năm)
    if (!bkbqpResult.duDieuKien) {
      return {
        duDieuKien: false,
        goiY: '',
      };
    }

    // Chưa đủ 10 năm CSTĐCS liên tục
    if (cstdcsLienTuc < 10) {
      return {
        duDieuKien: false,
        goiY: `Đã đủ điều kiện BKBQP. Hiện có ${cstdcsLienTuc} năm CSTĐCS liên tục. Cần ${
          10 - cstdcsLienTuc
        } năm CSTĐCS nữa để xét CSTĐTQ.`,
      };
    }

    // Đã có đủ 10 năm CSTĐCS liên tục
    if (cstdcsLienTuc >= 10) {
      // Kiểm tra có ít nhất 1 ĐTKH/SKKH
      if (nckhList.length > 0) {
        return {
          duDieuKien: true,
          goiY: 'Đã đủ điều kiện đề nghị xét Chiến sĩ thi đua Toàn quân.',
        };
      } else {
        return {
          duDieuKien: false,
          goiY: `Đã có ${cstdcsLienTuc} năm CSTĐCS liên tục. Cần thêm ít nhất 1 ĐTKH/SKKH để đủ điều kiện xét CSTĐTQ.`,
        };
      }
    }

    // Trường hợp mặc định
    return {
      duDieuKien: false,
      goiY: '',
    };
  }

  /**
   * Xử lý trường hợp đặc biệt (Reset, đã nhận)
   * @param {Array} danhHieuList - Danh sách danh hiệu
   * @returns {Object} { isSpecialCase: boolean, goiY: string, resetChain: boolean }
   */
  handleSpecialCases(danhHieuList) {
    const sortedRewards = [...danhHieuList].sort((a, b) => b.nam - a.nam);
    const latestReward = sortedRewards[0];

    if (!latestReward) {
      return { isSpecialCase: false, goiY: '', resetChain: false };
    }

    // Trường hợp 8: Admin đã cập nhật nhận CSTĐTQ
    if (latestReward.nhan_cstdtq === true) {
      return {
        isSpecialCase: true,
        goiY: `Đã nhận Chiến sĩ thi đua Toàn quân (Năm ${latestReward.nam}). Bắt đầu chuỗi thành tích mới.`,
        resetChain: true,
      };
    }

    // Trường hợp 9: Admin đã cập nhật nhận BKBQP (nhưng chưa đủ CSTĐTQ)
    if (latestReward.nhan_bkbqp === true && !latestReward.nhan_cstdtq) {
      return {
        isSpecialCase: true,
        goiY: `Đã nhận Bằng khen Bộ Quốc phòng (Năm ${latestReward.nam}).`,
        resetChain: false,
      };
    }

    // Trường hợp 10: Năm nay không đạt CSTĐCS
    if (latestReward.danh_hieu !== 'CSTDCS' && latestReward.danh_hieu !== null) {
      return {
        isSpecialCase: true,
        goiY: 'Chuỗi thành tích đã bị ngắt. Bắt đầu chuỗi mới.',
        resetChain: true,
      };
    }

    return { isSpecialCase: false, goiY: '', resetChain: false };
  }

  /**
   * ==============================================
   * HELPER FUNCTIONS - KHEN THƯỞNG NIÊN HẠN
   * ==============================================
   */

  /**
   * Tính ngày đủ điều kiện xét HCCSVV
   * @param {Date} ngayNhapNgu - Ngày nhập ngũ
   * @param {number} soNam - Số năm yêu cầu (10, 15, 20)
   * @returns {Date} Ngày đủ điều kiện
   */
  calculateEligibilityDate(ngayNhapNgu, soNam) {
    if (!ngayNhapNgu) return null;
    const eligibilityDate = new Date(ngayNhapNgu);
    eligibilityDate.setFullYear(eligibilityDate.getFullYear() + soNam);
    return eligibilityDate;
  }

  /**
   * Tính toán gợi ý HCCSVV cho một hạng
   * @param {Date} ngayNhapNgu - Ngày nhập ngũ
   * @param {number} soNam - Số năm yêu cầu (10, 15, 20)
   * @param {string} currentStatus - Trạng thái hiện tại
   * @param {string} hangName - Tên hạng (Ba, Nhì, Nhất)
   * @returns {Object} { status: string, ngay: Date, goiY: string }
   */
  calculateHCCSVV(ngayNhapNgu, soNam, currentStatus, hangName) {
    if (!ngayNhapNgu) {
      return {
        status: 'CHUA_DU',
        ngay: null,
        goiY: `Chưa có ngày nhập ngũ. Không thể tính toán HCCSVV Hạng ${hangName}.`,
      };
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const eligibilityDate = this.calculateEligibilityDate(ngayNhapNgu, soNam);
    const eligibilityYear = eligibilityDate.getFullYear();

    // Trường hợp 13: Admin đã cập nhật DA_NHAN
    if (currentStatus === 'DA_NHAN') {
      return {
        status: 'DA_NHAN',
        ngay: eligibilityDate,
        goiY: `Đã nhận HCCSVV Hạng ${hangName}.`,
      };
    }

    // Trường hợp 11: Năm hiện tại BẰNG năm đủ điều kiện
    if (currentYear === eligibilityYear) {
      return {
        status: 'DU_DIEU_KIEN',
        ngay: eligibilityDate,
        goiY: `Đủ điều kiện (${soNam} năm) xét HCCSVV Hạng ${hangName} trong năm nay. Ngày xét duyệt dự kiến: ${eligibilityDate.toLocaleDateString(
          'vi-VN'
        )}.`,
      };
    }

    // Trường hợp 12: Năm hiện tại LỚN HƠN năm đủ điều kiện (đã quá hạn)
    if (currentYear > eligibilityYear) {
      return {
        status: 'DU_DIEU_KIEN',
        ngay: eligibilityDate,
        goiY: `Đã quá hạn xét HCCSVV Hạng ${hangName}. Ngày đủ điều kiện: ${eligibilityDate.toLocaleDateString(
          'vi-VN'
        )}. Chờ Admin cập nhật.`,
      };
    }

    // Trường hợp 14: Năm hiện tại NHỎ HƠN năm đủ điều kiện (chưa đến hạn)
    if (currentYear < eligibilityYear) {
      const yearsLeft = eligibilityYear - currentYear;
      return {
        status: 'CHUA_DU',
        ngay: null,
        goiY: `Chưa đủ điều kiện (${soNam} năm) xét HCCSVV Hạng ${hangName}. Dự kiến: ${eligibilityDate.toLocaleDateString(
          'vi-VN'
        )} (còn ${yearsLeft} năm).`,
      };
    }

    // Fallback
    return {
      status: 'CHUA_DU',
      ngay: null,
      goiY: `Đang tính toán HCCSVV Hạng ${hangName}...`,
    };
  }

  /**
   * ==============================================
   * HELPER FUNCTIONS - KHEN THƯỞNG CỐNG HIẾN
   * ==============================================
   */

  /**
   * Tính tổng tháng cống hiến từ lịch sử chức vụ
   * @param {Array} lichSuChucVu - Danh sách lịch sử chức vụ
   * @returns {number} Tổng tháng cống hiến (đã nhân hệ số)
   */
  calculateContributionMonths(lichSuChucVu) {
    let totalMonths = 0;
    const today = new Date();

    // Mapping nhóm cống hiến sang hệ số
    const hesoMap = {
      'Nhóm 5': 1.0,
      'Nhóm 6': 1.2,
      'Nhóm 7': 1.5,
      // Thêm các nhóm khác nếu có
    };

    for (const ls of lichSuChucVu) {
      if (ls.ChucVu?.NhomCongHien) {
        const ngayBatDau = new Date(ls.ngay_bat_dau);
        const ngayKetThuc = ls.ngay_ket_thuc ? new Date(ls.ngay_ket_thuc) : today;

        // Tính số tháng thực tế theo lịch (chính xác)
        let months = (ngayKetThuc.getFullYear() - ngayBatDau.getFullYear()) * 12;
        months += ngayKetThuc.getMonth() - ngayBatDau.getMonth();

        // Nếu ngày kết thúc < ngày bắt đầu trong tháng thì trừ 1 tháng
        if (ngayKetThuc.getDate() < ngayBatDau.getDate()) {
          months--;
        }

        const monthsWorked = Math.max(0, months); // Đảm bảo không âm

        // Lấy hệ số từ tên nhóm cống hiến
        const tenNhom = ls.ChucVu.NhomCongHien.ten_nhom;
        const heso = hesoMap[tenNhom] || 1.0;

        // Tính tháng cống hiến = tháng làm việc * hệ số
        totalMonths += Math.floor(monthsWorked * heso);
      }
    }

    return totalMonths;
  }

  /**
   * Tính toán gợi ý HCBVTQ cho một hạng
   * @param {number} totalMonths - Tổng tháng cống hiến
   * @param {number} requiredMonths - Số tháng yêu cầu (180, 240, 300)
   * @param {string} currentStatus - Trạng thái hiện tại
   * @param {string} hangName - Tên hạng (Ba, Nhì, Nhất)
   * @returns {Object} { status: string, goiY: string }
   */
  calculateHCBVTQ(totalMonths, requiredMonths, currentStatus, hangName) {
    // Trường hợp 17: Admin đã cập nhật DA_NHAN
    if (currentStatus === 'DA_NHAN') {
      return {
        status: 'DA_NHAN',
        goiY: `Đã nhận HCBVTQ Hạng ${hangName}.`,
      };
    }

    // Trường hợp 16: Đã đủ điều kiện
    if (totalMonths >= requiredMonths) {
      return {
        status: 'DU_DIEU_KIEN',
        goiY: `Đã đủ điều kiện (${requiredMonths} tháng) xét HCBVTQ Hạng ${hangName}. Tổng tháng cống hiến: ${totalMonths}. Chờ Admin cập nhật trạng thái.`,
      };
    }

    // Trường hợp 15: Chưa đủ điều kiện
    const monthsLeft = requiredMonths - totalMonths;
    return {
      status: 'CHUA_DU',
      goiY: `Cần thêm ${monthsLeft} tháng cống hiến để đủ điều kiện xét HCBVTQ Hạng ${hangName}. Hiện có: ${totalMonths}/${requiredMonths} tháng.`,
    };
  }

  /**
   * ==============================================
   * HÀM TÍNH TOÁN CHÍNH
   * ==============================================
   */

  /**
   * ==============================================
   * TÍNH TOÁN HỒ SƠ HẰNG NĂM - LOGIC MỚI
   * ==============================================
   */

  /**
   * Tính toán lại hồ sơ hằng năm cho 1 quân nhân
   * Logic: BKBQP (2 năm) và CSTDTQ (3 năm)
   * @param {number} personnelId - ID quân nhân
   * @returns {Promise<Object>} Kết quả tính toán
   */
  async recalculateAnnualProfile(personnelId) {
    try {
      // ==============================================
      // BƯỚC 1: Thu thập Toàn bộ Dữ liệu Lịch sử (Input)
      // ==============================================
      const personnel = await prisma.quanNhan.findUnique({
        where: { id: personnelId },
        include: {
          DanhHieuHangNam: {
            orderBy: { nam: 'asc' }, // Sắp xếp theo năm tăng dần
          },
          ThanhTichKhoaHoc: {
            where: { status: 'APPROVED' }, // Chỉ lấy ĐTKH/SKKH đã duyệt
          },
        },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      const danhHieuList = personnel.DanhHieuHangNam || [];
      const thanhTichList = personnel.ThanhTichKhoaHoc || [];

      // ==============================================
      // BƯỚC 2: Định nghĩa Biến Tính toán
      // ==============================================
      let du_dieu_kien_bkbqp = false;
      let du_dieu_kien_cstdtq = false;
      let tong_cstdcs = 0;
      let tong_nckh = thanhTichList.length; // Tổng số ĐTKH/SKKH đã APPROVED
      let cstdcs_lien_tuc = 0;
      let nam_cstdcs_lien_tuc = []; // Mảng lưu các năm CSTDCS liên tục

      // ==============================================
      // BƯỚC 3: Logic "Bộ não" (Lặp và Kiểm tra)
      // ==============================================

      for (const danhHieu of danhHieuList) {
        // A. Logic đếm chuỗi liên tục
        if (danhHieu.danh_hieu === 'CSTDCS') {
          tong_cstdcs++; // Đếm tổng số CSTDCS
          cstdcs_lien_tuc++; // Tăng chuỗi liên tục
          nam_cstdcs_lien_tuc.push(danhHieu.nam); // Thêm năm vào mảng
        } else {
          // Reset chuỗi nếu không phải CSTDCS
          cstdcs_lien_tuc = 0;
          nam_cstdcs_lien_tuc = [];
        }

        // B. Logic kiểm tra điều kiện BKBQP (2 năm)
        // Điều kiện: 2 năm CSTDCS liên tục + 1 ĐTKH/SKKH trong 2 năm đó
        if (cstdcs_lien_tuc >= 2) {
          // Lấy 2 năm cuối cùng từ mảng
          const nam_1 = nam_cstdcs_lien_tuc[nam_cstdcs_lien_tuc.length - 2];
          const nam_2 = nam_cstdcs_lien_tuc[nam_cstdcs_lien_tuc.length - 1];

          // Kiểm tra có ĐTKH/SKKH trong 2 năm đó không
          const hasNCKH = thanhTichList.some(tt => tt.nam === nam_1 || tt.nam === nam_2);

          if (hasNCKH) {
            du_dieu_kien_bkbqp = true;
          }
        }

        // C. Logic kiểm tra điều kiện CSTDTQ (3 năm)
        // Điều kiện: 3 năm CSTDCS liên tục + 1 ĐTKH/SKKH ở năm thứ 3 + 1 ĐTKH/SKKH ở năm 1 hoặc 2
        if (cstdcs_lien_tuc >= 3) {
          // Lấy 3 năm cuối cùng từ mảng
          const nam_1 = nam_cstdcs_lien_tuc[nam_cstdcs_lien_tuc.length - 3];
          const nam_2 = nam_cstdcs_lien_tuc[nam_cstdcs_lien_tuc.length - 2];
          const nam_3 = nam_cstdcs_lien_tuc[nam_cstdcs_lien_tuc.length - 1]; // Năm cuối

          // Kiểm tra 1: Có ĐTKH/SKKH tại năm thứ 3 không?
          const hasNCKH_Nam3 = thanhTichList.some(tt => tt.nam === nam_3);

          // Kiểm tra 2: Có ĐTKH/SKKH tại năm 1 HOẶC năm 2 không?
          const hasNCKH_Nam1_or_Nam2 = thanhTichList.some(
            tt => tt.nam === nam_1 || tt.nam === nam_2
          );

          // Cả hai điều kiện đều đúng
          if (hasNCKH_Nam3 && hasNCKH_Nam1_or_Nam2) {
            du_dieu_kien_cstdtq = true;
          }
        }
      }

      // ==============================================
      // BƯỚC 4: Logic Tạo Gợi ý (Suggestion)
      // ==============================================
      let goi_y = '';

      if (du_dieu_kien_cstdtq === true) {
        goi_y = 'Đã đủ điều kiện đề nghị xét Chiến sĩ thi đua Toàn quân.';
      } else if (cstdcs_lien_tuc === 3) {
        // Đã có 3 năm CSTDCS nhưng chưa đủ điều kiện CSTDTQ
        const nam_1 = nam_cstdcs_lien_tuc[nam_cstdcs_lien_tuc.length - 3];
        const nam_2 = nam_cstdcs_lien_tuc[nam_cstdcs_lien_tuc.length - 2];
        const nam_3 = nam_cstdcs_lien_tuc[nam_cstdcs_lien_tuc.length - 1];

        const hasNCKH_Nam3 = thanhTichList.some(tt => tt.nam === nam_3);
        const hasNCKH_Nam1_or_Nam2 = thanhTichList.some(tt => tt.nam === nam_1 || tt.nam === nam_2);

        if (!hasNCKH_Nam3 && !hasNCKH_Nam1_or_Nam2) {
          goi_y = `Đã có 3 năm CSTDCS liên tục (${nam_1}, ${nam_2}, ${nam_3}). Cần 1 ĐTKH/SKKH tại năm ${nam_3} và 1 ĐTKH/SKKH tại năm ${nam_1} hoặc ${nam_2} để đủ điều kiện CSTDTQ.`;
        } else if (!hasNCKH_Nam3) {
          goi_y = `Đã có 3 năm CSTDCS liên tục (${nam_1}, ${nam_2}, ${nam_3}). Cần 1 ĐTKH/SKKH tại năm ${nam_3} để đủ điều kiện CSTDTQ.`;
        } else if (!hasNCKH_Nam1_or_Nam2) {
          goi_y = `Đã có 3 năm CSTDCS liên tục (${nam_1}, ${nam_2}, ${nam_3}). Cần 1 ĐTKH/SKKH tại năm ${nam_1} hoặc ${nam_2} để đủ điều kiện CSTDTQ.`;
        }
      } else if (du_dieu_kien_bkbqp === true) {
        goi_y =
          'Đã đủ điều kiện BKBQP. Cần thêm 1 năm CSTDCS liên tục và các ĐTKH/SKKH để xét CSTDTQ.';
      } else if (cstdcs_lien_tuc === 2) {
        // Đã có 2 năm CSTDCS
        const nam_1 = nam_cstdcs_lien_tuc[nam_cstdcs_lien_tuc.length - 2];
        const nam_2 = nam_cstdcs_lien_tuc[nam_cstdcs_lien_tuc.length - 1];
        const hasNCKH = thanhTichList.some(tt => tt.nam === nam_1 || tt.nam === nam_2);

        if (!hasNCKH) {
          goi_y = `Đã có 2 năm CSTDCS liên tục (${nam_1}, ${nam_2}). Cần thêm 1 ĐTKH/SKKH trong năm ${nam_1} hoặc ${nam_2} để đủ điều kiện BKBQP.`;
        } else {
          goi_y = `Đã đủ điều kiện BKBQP. Cần thêm 1 năm CSTDCS liên tục để xét CSTDTQ.`;
        }
      } else if (cstdcs_lien_tuc === 1) {
        const nam_hien_tai = nam_cstdcs_lien_tuc[nam_cstdcs_lien_tuc.length - 1];
        goi_y = `Đã có 1 năm CSTDCS (${nam_hien_tai}). Cần thêm ít nhất 1 năm CSTDCS liên tục để xét BKBQP.`;
      } else if (cstdcs_lien_tuc === 0) {
        goi_y = 'Chuỗi thành tích đã bị ngắt. Cần bắt đầu chuỗi CSTDCS mới.';
      } else {
        goi_y = 'Chưa có dữ liệu để tính toán. Vui lòng nhập danh hiệu và thành tích.';
      }

      // ==============================================
      // BƯỚC 5: Cập nhật Kết quả (Output)
      // ==============================================
      const hoSoHangNam = await prisma.hoSoHangNam.upsert({
        where: { quan_nhan_id: personnelId },
        update: {
          tong_cstdcs: tong_cstdcs,
          tong_nckh: tong_nckh,
          cstdcs_lien_tuc: cstdcs_lien_tuc,
          du_dieu_kien_bkbqp: du_dieu_kien_bkbqp,
          du_dieu_kien_cstdtq: du_dieu_kien_cstdtq,
          goi_y: goi_y,
        },
        create: {
          quan_nhan_id: personnelId,
          tong_cstdcs: tong_cstdcs,
          tong_nckh: tong_nckh,
          cstdcs_lien_tuc: cstdcs_lien_tuc,
          du_dieu_kien_bkbqp: du_dieu_kien_bkbqp,
          du_dieu_kien_cstdtq: du_dieu_kien_cstdtq,
          goi_y: goi_y,
        },
      });

      return {
        success: true,
        message: 'Tính toán hồ sơ hằng năm thành công',
        data: hoSoHangNam,
      };
    } catch (error) {
      console.error('Lỗi khi tính toán hồ sơ hằng năm:', error);
      throw error;
    }
  }

  /**
   * Tính toán lại hồ sơ cho 1 quân nhân (CẢ NIÊN HẠN VÀ HẰNG NĂM)
   */
  async recalculateProfile(personnelId) {
    try {
      // Load tất cả dữ liệu cần thiết
      const personnel = await prisma.quanNhan.findUnique({
        where: { id: personnelId },
        include: {
          DanhHieuHangNam: {
            orderBy: { nam: 'desc' },
          },
          ThanhTichKhoaHoc: {
            where: { status: 'APPROVED' },
          },
          LichSuChucVu: {
            include: {
              ChucVu: {
                include: {
                  NhomCongHien: true,
                },
              },
            },
          },
        },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      // Lấy hồ sơ hiện tại (nếu có) để giữ status đã được Admin cập nhật
      const existingAnnualProfile = await prisma.hoSoHangNam.findUnique({
        where: { quan_nhan_id: personnelId },
      });

      const existingServiceProfile = await prisma.hoSoNienHan.findUnique({
        where: { quan_nhan_id: personnelId },
      });

      // ==============================================
      // TÍNH TOÁN HỒ SƠ HẰNG NĂM
      // ==============================================

      const cstdcsCount = personnel.DanhHieuHangNam.filter(dh => dh.danh_hieu === 'CSTDCS').length;
      const nckhCount = personnel.ThanhTichKhoaHoc.filter(tt =>
        ['NCKH', 'SKKH'].includes(tt.loai)
      ).length;

      // Xử lý trường hợp đặc biệt (Reset, đã nhận)
      const specialCase = this.handleSpecialCases(personnel.DanhHieuHangNam);

      // Tính số năm CSTĐCS liên tục
      const cstdcsLienTuc = this.calculateContinuousCSTDCS(personnel.DanhHieuHangNam);

      // Tính toán BKBQP
      const bkbqpResult = this.calculateBKBQP(
        cstdcsLienTuc,
        personnel.DanhHieuHangNam,
        personnel.ThanhTichKhoaHoc
      );

      // Tính toán CSTĐTQ
      const cstdtqResult = this.calculateCSTDTQ(
        cstdcsLienTuc,
        bkbqpResult,
        personnel.DanhHieuHangNam,
        personnel.ThanhTichKhoaHoc
      );

      // Tổng hợp gợi ý
      let finalGoiYHangNam = '';
      if (specialCase.isSpecialCase) {
        finalGoiYHangNam = specialCase.goiY;
      } else if (cstdtqResult.duDieuKien) {
        finalGoiYHangNam = cstdtqResult.goiY;
      } else if (bkbqpResult.duDieuKien) {
        finalGoiYHangNam = bkbqpResult.goiY + ' ' + cstdtqResult.goiY;
      } else {
        finalGoiYHangNam = bkbqpResult.goiY;
      }

      // Cập nhật hoặc tạo mới hồ sơ hằng năm
      await prisma.hoSoHangNam.upsert({
        where: { quan_nhan_id: personnelId },
        update: {
          tong_cstdcs: cstdcsCount,
          tong_nckh: nckhCount,
          cstdcs_lien_tuc: cstdcsLienTuc,
          du_dieu_kien_bkbqp: bkbqpResult.duDieuKien,
          du_dieu_kien_cstdtq: cstdtqResult.duDieuKien,
          goi_y: finalGoiYHangNam,
        },
        create: {
          quan_nhan_id: personnelId,
          tong_cstdcs: cstdcsCount,
          tong_nckh: nckhCount,
          cstdcs_lien_tuc: cstdcsLienTuc,
          du_dieu_kien_bkbqp: bkbqpResult.duDieuKien,
          du_dieu_kien_cstdtq: cstdtqResult.duDieuKien,
          goi_y: finalGoiYHangNam,
        },
      });

      // ==============================================
      // TÍNH TOÁN HỒ SƠ NIÊN HẠN
      // ==============================================

      // Tính HCCSVV (Huân chương Chiến sỹ Vẻ vang)
      // Logic thứ bậc: Phải đạt hạng thấp trước mới xét hạng cao
      const hccsvvBa = this.calculateHCCSVV(
        personnel.ngay_nhap_ngu,
        10,
        existingServiceProfile?.hccsvv_hang_ba_status || 'CHUA_DU',
        'Ba'
      );

      // Chỉ xét Hạng Nhì nếu đã đủ điều kiện hoặc đã nhận Hạng Ba
      let hccsvvNhi;
      if (hccsvvBa.status === 'DU_DIEU_KIEN' || hccsvvBa.status === 'DA_NHAN') {
        hccsvvNhi = this.calculateHCCSVV(
          personnel.ngay_nhap_ngu,
          15,
          existingServiceProfile?.hccsvv_hang_nhi_status || 'CHUA_DU',
          'Nhì'
        );
      } else {
        hccsvvNhi = {
          status: 'CHUA_DU',
          ngay: null,
          goiY: '',
        };
      }

      // Chỉ xét Hạng Nhất nếu đã đủ điều kiện hoặc đã nhận Hạng Nhì
      let hccsvvNhat;
      if (hccsvvNhi.status === 'DU_DIEU_KIEN' || hccsvvNhi.status === 'DA_NHAN') {
        hccsvvNhat = this.calculateHCCSVV(
          personnel.ngay_nhap_ngu,
          20,
          existingServiceProfile?.hccsvv_hang_nhat_status || 'CHUA_DU',
          'Nhất'
        );
      } else {
        hccsvvNhat = {
          status: 'CHUA_DU',
          ngay: null,
          goiY: '',
        };
      }

      // Tính HCBVTQ (Huân chương Bảo vệ Tổ quốc - Cống hiến)
      // Logic thứ bậc: Phải đạt hạng thấp trước mới xét hạng cao
      const totalMonths = this.calculateContributionMonths(personnel.LichSuChucVu);

      const hcbvtqBa = this.calculateHCBVTQ(
        totalMonths,
        180,
        existingServiceProfile?.hcbvtq_hang_ba_status || 'CHUA_DU',
        'Ba'
      );

      // Chỉ xét Hạng Nhì nếu đã đủ điều kiện hoặc đã nhận Hạng Ba
      let hcbvtqNhi;
      if (hcbvtqBa.status === 'DU_DIEU_KIEN' || hcbvtqBa.status === 'DA_NHAN') {
        hcbvtqNhi = this.calculateHCBVTQ(
          totalMonths,
          240,
          existingServiceProfile?.hcbvtq_hang_nhi_status || 'CHUA_DU',
          'Nhì'
        );
      } else {
        hcbvtqNhi = {
          status: 'CHUA_DU',
          goiY: '',
        };
      }

      // Chỉ xét Hạng Nhất nếu đã đủ điều kiện hoặc đã nhận Hạng Nhì
      let hcbvtqNhat;
      if (hcbvtqNhi.status === 'DU_DIEU_KIEN' || hcbvtqNhi.status === 'DA_NHAN') {
        hcbvtqNhat = this.calculateHCBVTQ(
          totalMonths,
          300,
          existingServiceProfile?.hcbvtq_hang_nhat_status || 'CHUA_DU',
          'Nhất'
        );
      } else {
        hcbvtqNhat = {
          status: 'CHUA_DU',
          goiY: '',
        };
      }

      // Tổng hợp gợi ý niên hạn
      const goiYList = [];
      if (hccsvvBa.goiY) goiYList.push(hccsvvBa.goiY);
      if (hccsvvNhi.goiY) goiYList.push(hccsvvNhi.goiY);
      if (hccsvvNhat.goiY) goiYList.push(hccsvvNhat.goiY);
      if (hcbvtqBa.goiY) goiYList.push(hcbvtqBa.goiY);
      if (hcbvtqNhi.goiY) goiYList.push(hcbvtqNhi.goiY);
      if (hcbvtqNhat.goiY) goiYList.push(hcbvtqNhat.goiY);

      const finalGoiYNienHan =
        goiYList.length > 0
          ? goiYList.join('\n')
          : `Tổng tháng cống hiến: ${totalMonths}. Chưa đủ điều kiện xét huân chương.`;

      // Cập nhật hoặc tạo mới hồ sơ niên hạn
      await prisma.hoSoNienHan.upsert({
        where: { quan_nhan_id: personnelId },
        update: {
          hccsvv_hang_ba_status: hccsvvBa.status,
          hccsvv_hang_ba_ngay: hccsvvBa.ngay,
          hccsvv_hang_nhi_status: hccsvvNhi.status,
          hccsvv_hang_nhi_ngay: hccsvvNhi.ngay,
          hccsvv_hang_nhat_status: hccsvvNhat.status,
          hccsvv_hang_nhat_ngay: hccsvvNhat.ngay,
          hcbvtq_total_months: totalMonths,
          hcbvtq_hang_ba_status: hcbvtqBa.status,
          hcbvtq_hang_nhi_status: hcbvtqNhi.status,
          hcbvtq_hang_nhat_status: hcbvtqNhat.status,
          goi_y: finalGoiYNienHan,
        },
        create: {
          quan_nhan_id: personnelId,
          hccsvv_hang_ba_status: hccsvvBa.status,
          hccsvv_hang_ba_ngay: hccsvvBa.ngay,
          hccsvv_hang_nhi_status: hccsvvNhi.status,
          hccsvv_hang_nhi_ngay: hccsvvNhi.ngay,
          hccsvv_hang_nhat_status: hccsvvNhat.status,
          hccsvv_hang_nhat_ngay: hccsvvNhat.ngay,
          hcbvtq_total_months: totalMonths,
          hcbvtq_hang_ba_status: hcbvtqBa.status,
          hcbvtq_hang_nhi_status: hcbvtqNhi.status,
          hcbvtq_hang_nhat_status: hcbvtqNhat.status,
          goi_y: finalGoiYNienHan,
        },
      });

      return { message: 'Tính toán lại hồ sơ thành công' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tính toán lại cho toàn bộ quân nhân
   */
  async recalculateAll() {
    try {
      const allPersonnel = await prisma.quanNhan.findMany({
        select: { id: true },
      });

      let successCount = 0;
      let errorCount = 0;

      for (const personnel of allPersonnel) {
        try {
          await this.recalculateProfile(personnel.id);
          successCount++;
        } catch (error) {
          console.error(`Lỗi khi tính toán cho quân nhân ID ${personnel.id}:`, error.message);
          errorCount++;
        }
      }

      return {
        message: `Tính toán hoàn tất. Thành công: ${successCount}, Lỗi: ${errorCount}`,
        success: successCount,
        errors: errorCount,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả hồ sơ niên hạn (cho admin)
   */
  async getAllServiceProfiles() {
    try {
      const profiles = await prisma.hoSoNienHan.findMany({
        include: {
          QuanNhan: {
            include: {
              DonVi: true,
              ChucVu: true,
            },
          },
        },
        orderBy: {
          quan_nhan_id: 'asc',
        },
      });

      return profiles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái hồ sơ niên hạn (ADMIN duyệt huân chương)
   */
  async updateServiceProfile(personnelId, updates) {
    try {
      const profile = await prisma.hoSoNienHan.findUnique({
        where: { quan_nhan_id: personnelId },
      });

      if (!profile) {
        throw new Error('Hồ sơ niên hạn không tồn tại');
      }

      // Validate và cập nhật
      const validStatuses = ['CHUA_DU', 'DU_DIEU_KIEN', 'DA_NHAN'];
      const updateData = {};

      // HCCSVV updates
      if (updates.hccsvv_hang_ba_status && validStatuses.includes(updates.hccsvv_hang_ba_status)) {
        updateData.hccsvv_hang_ba_status = updates.hccsvv_hang_ba_status;
      }
      if (
        updates.hccsvv_hang_nhi_status &&
        validStatuses.includes(updates.hccsvv_hang_nhi_status)
      ) {
        updateData.hccsvv_hang_nhi_status = updates.hccsvv_hang_nhi_status;
      }
      if (
        updates.hccsvv_hang_nhat_status &&
        validStatuses.includes(updates.hccsvv_hang_nhat_status)
      ) {
        updateData.hccsvv_hang_nhat_status = updates.hccsvv_hang_nhat_status;
      }

      // HCBVTQ updates
      if (updates.hcbvtq_hang_ba_status && validStatuses.includes(updates.hcbvtq_hang_ba_status)) {
        updateData.hcbvtq_hang_ba_status = updates.hcbvtq_hang_ba_status;
      }
      if (
        updates.hcbvtq_hang_nhi_status &&
        validStatuses.includes(updates.hcbvtq_hang_nhi_status)
      ) {
        updateData.hcbvtq_hang_nhi_status = updates.hcbvtq_hang_nhi_status;
      }
      if (
        updates.hcbvtq_hang_nhat_status &&
        validStatuses.includes(updates.hcbvtq_hang_nhat_status)
      ) {
        updateData.hcbvtq_hang_nhat_status = updates.hcbvtq_hang_nhat_status;
      }

      const updatedProfile = await prisma.hoSoNienHan.update({
        where: { quan_nhan_id: personnelId },
        data: updateData,
      });

      return updatedProfile;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProfileService();
