const { prisma } = require('../models');

class UnitAnnualAwardService {
  /**
   * Tính số năm liên tục được danh hiệu DVQT (Đơn vị Quyết thắng)
   * Quy ước: có bản ghi DanhHieuDonViHangNam năm X với danh_hieu = "ĐVQT" thì được tính là đạt danh hiệu năm đó
   */
  async calculateContinuousYears(donViId, year) {
    // Check awarded records (danh hieu) in DanhHieuDonViHangNam table
    const records = await prisma.danhHieuDonViHangNam.findMany({
      where: {
        OR: [{ co_quan_don_vi_id: donViId }, { don_vi_truc_thuoc_id: donViId }],
        nam: { lte: year },
        danh_hieu: 'ĐVQT',
      },
      orderBy: { nam: 'desc' },
      select: { nam: true, danh_hieu: true },
    });

    let continuous = 0;
    let current = year;
    for (const r of records) {
      if (r.nam !== current) continue; // chỉ xét chuỗi liên tiếp từ năm hiện tại trở lùi
      // Có danh hiệu nếu có danh_hieu không null và không rỗng
      if (r.danh_hieu && r.danh_hieu.trim() !== '') {
        continuous += 1;
        current -= 1;
      } else {
        break;
      }
    }
    return continuous;
  }

  /**
   * Tính tổng số lần đơn vị đạt danh hiệu DVQT
   */
  async calculateTotalDVQT(donViId, year) {
    const records = await prisma.danhHieuDonViHangNam.findMany({
      where: {
        OR: [{ co_quan_don_vi_id: donViId }, { don_vi_truc_thuoc_id: donViId }],
        nam: { lte: year },
        status: 'APPROVED',
        danh_hieu: { not: null },
      },
      select: {
        nam: true,
        danh_hieu: true,
        so_quyet_dinh: true,
        file_quyet_dinh: true,
        nhan_bkbqp: true,
        nhan_bkttcp: true,
        so_quyet_dinh_bkbqp: true,
        file_quyet_dinh_bkbqp: true,
        so_quyet_dinh_bkttcp: true,
        file_quyet_dinh_bkttcp: true,
      },
    });

    // Chỉ lưu ĐVQT và ĐVTT trong JSON, BKBQP và BKTTCP là trường đánh dấu boolean
    // Tương tự như cá nhân: chỉ lưu CSTDCS và CSTT, BKBQP và CSTDTQ là boolean
    const validRecords = records.filter(
      r => r.danh_hieu && (r.danh_hieu === 'ĐVQT' || r.danh_hieu === 'ĐVTT')
    );
    return {
      total: validRecords.length,
      details: validRecords.map(r => ({
        nam: r.nam,
        danh_hieu: r.danh_hieu,
        so_quyet_dinh: r.so_quyet_dinh || null,
        file_quyet_dinh: r.file_quyet_dinh || null,
        nhan_bkbqp: r.nhan_bkbqp || false,
        nhan_bkttcp: r.nhan_bkttcp || false,
        so_quyet_dinh_bkbqp: r.so_quyet_dinh_bkbqp || null,
        file_quyet_dinh_bkbqp: r.file_quyet_dinh_bkbqp || null,
        so_quyet_dinh_bkttcp: r.so_quyet_dinh_bkttcp || null,
        file_quyet_dinh_bkttcp: r.file_quyet_dinh_bkttcp || null,
      })),
    };
  }

  buildSuggestion(dvqtLienTuc, hasDecision) {
    if (hasDecision) return null;
    if (dvqtLienTuc >= 5) {
      return 'Đủ điều kiện đề xuất Bằng khen Thủ tướng Chính phủ (5 năm liên tục DVQT).';
    }
    if (dvqtLienTuc >= 3) {
      return 'Đủ điều kiện đề xuất Bằng khen Tổng cục (3 năm liên tục DVQT).';
    }
    return null;
  }

  /** Manager đề xuất (status=PENDING) - Tạo bản ghi DanhHieuDonViHangNam */
  async propose({ don_vi_id, nam, danh_hieu, ghi_chu, nguoi_tao_id }) {
    const year = Number(nam);
    const unitId = don_vi_id;

    // Xác định xem đơn vị là CoQuanDonVi hay DonViTrucThuoc
    const coQuanDonVi = await prisma.coQuanDonVi.findUnique({ where: { id: unitId } });
    const donViTrucThuoc = await prisma.donViTrucThuoc.findUnique({ where: { id: unitId } });

    if (!coQuanDonVi && !donViTrucThuoc) {
      throw new Error('Không tìm thấy đơn vị');
    }

    const isCoQuanDonVi = !!coQuanDonVi;

    // Tạo bản ghi DanhHieuDonViHangNam với status PENDING
    const whereCondition = isCoQuanDonVi
      ? { co_quan_don_vi_id: unitId, nam: year }
      : { don_vi_truc_thuoc_id: unitId, nam: year };

    const record = await prisma.danhHieuDonViHangNam.upsert({
      where: isCoQuanDonVi
        ? { unique_co_quan_don_vi_nam_dh: { co_quan_don_vi_id: unitId, nam: year } }
        : { unique_don_vi_truc_thuoc_nam_dh: { don_vi_truc_thuoc_id: unitId, nam: year } },
      update: {
        danh_hieu: danh_hieu || null,
        ghi_chu: ghi_chu || null,
        status: 'PENDING',
      },
      create: {
        co_quan_don_vi_id: isCoQuanDonVi ? unitId : null,
        don_vi_truc_thuoc_id: isCoQuanDonVi ? null : unitId,
        nam: year,
        danh_hieu: danh_hieu || null,
        ghi_chu: ghi_chu || null,
        nguoi_tao_id: nguoi_tao_id,
        status: 'PENDING',
      },
      include: { CoQuanDonVi: true, DonViTrucThuoc: true },
    });

    // Cập nhật hoặc tạo HoSoDonViHangNam để theo dõi thống kê
    await this.updateHoSoDonVi(unitId, year, isCoQuanDonVi);

    return record;
  }

  /** Admin duyệt danh hiệu */
  async approve(
    id,
    {
      so_quyet_dinh,
      file_quyet_dinh,
      nhan_bkbqp,
      so_quyet_dinh_bkbqp,
      file_quyet_dinh_bkbqp,
      nhan_bkttcp,
      so_quyet_dinh_bkttcp,
      file_quyet_dinh_bkttcp,
      nguoi_duyet_id,
    }
  ) {
    // Chuẩn bị dữ liệu update
    const updateData = {
      status: 'APPROVED',
      nguoi_duyet_id: nguoi_duyet_id,
      ngay_duyet: new Date(),
      so_quyet_dinh: so_quyet_dinh || null,
      file_quyet_dinh: file_quyet_dinh || null,
    };

    // Xử lý BKBQP nếu có
    if (nhan_bkbqp !== undefined) {
      updateData.nhan_bkbqp = nhan_bkbqp;
    }
    if (so_quyet_dinh_bkbqp !== undefined) {
      updateData.so_quyet_dinh_bkbqp = so_quyet_dinh_bkbqp || null;
    }
    if (file_quyet_dinh_bkbqp !== undefined) {
      updateData.file_quyet_dinh_bkbqp = file_quyet_dinh_bkbqp || null;
    }

    // Xử lý BKTTCP nếu có
    if (nhan_bkttcp !== undefined) {
      updateData.nhan_bkttcp = nhan_bkttcp;
    }
    if (so_quyet_dinh_bkttcp !== undefined) {
      updateData.so_quyet_dinh_bkttcp = so_quyet_dinh_bkttcp || null;
    }
    if (file_quyet_dinh_bkttcp !== undefined) {
      updateData.file_quyet_dinh_bkttcp = file_quyet_dinh_bkttcp || null;
    }

    // Update DanhHieuDonViHangNam status to APPROVED
    const updatedDanhHieu = await prisma.danhHieuDonViHangNam.update({
      where: { id: String(id) },
      data: updateData,
      include: { CoQuanDonVi: true, DonViTrucThuoc: true },
    });

    // Tự động recalculate toàn bộ hồ sơ hằng năm của đơn vị (giống profileService)
    const donViId = updatedDanhHieu.co_quan_don_vi_id || updatedDanhHieu.don_vi_truc_thuoc_id;
    await this.recalculateAnnualUnit(donViId, updatedDanhHieu.nam);

    return updatedDanhHieu;
  }

  /** Admin từ chối danh hiệu */
  async reject(id, { ghi_chu, nguoi_duyet_id }) {
    const rejectedDanhHieu = await prisma.danhHieuDonViHangNam.update({
      where: { id: String(id) },
      data: {
        status: 'REJECTED',
        ghi_chu: ghi_chu ?? null,
        nguoi_duyet_id: nguoi_duyet_id,
        ngay_duyet: new Date(),
      },
      include: { CoQuanDonVi: true, DonViTrucThuoc: true },
    });

    // Tự động recalculate sau khi từ chối
    const donViId = rejectedDanhHieu.co_quan_don_vi_id || rejectedDanhHieu.don_vi_truc_thuoc_id;
    await this.recalculateAnnualUnit(donViId, rejectedDanhHieu.nam);

    return rejectedDanhHieu;
  }

  /** Cập nhật hoặc tạo HoSoDonViHangNam để theo dõi thống kê */
  async updateHoSoDonVi(donViId, year, isCoQuanDonVi) {
    const dvqtResult = await this.calculateTotalDVQT(donViId, year);
    const dvqtLienTuc = await this.calculateContinuousYears(donViId, year);
    const du3 = dvqtLienTuc >= 3;
    const du5 = dvqtLienTuc >= 5;

    // Kiểm tra xem có bằng khen chưa (dựa vào DanhHieuDonViHangNam năm hiện tại)
    const currentYearAward = await prisma.danhHieuDonViHangNam.findFirst({
      where: {
        OR: [{ co_quan_don_vi_id: donViId }, { don_vi_truc_thuoc_id: donViId }],
        nam: year,
        status: 'APPROVED',
      },
    });

    const goi_y = this.buildSuggestion(dvqtLienTuc, !!currentYearAward?.so_quyet_dinh);

    const whereCondition = isCoQuanDonVi
      ? { unique_co_quan_don_vi_nam: { co_quan_don_vi_id: donViId, nam: year } }
      : { unique_don_vi_truc_thuoc_nam: { don_vi_truc_thuoc_id: donViId, nam: year } };

    const data = {
      tong_dvqt: dvqtResult.total,
      tong_dvqt_json: dvqtResult.details,
      dvqt_lien_tuc: dvqtLienTuc,
      du_dieu_kien_bk_tong_cuc: du3,
      du_dieu_kien_bk_thu_tuong: du5,
      goi_y,
    };

    return prisma.hoSoDonViHangNam.upsert({
      where: whereCondition,
      update: data,
      create: {
        ...data,
        co_quan_don_vi_id: isCoQuanDonVi ? donViId : null,
        don_vi_truc_thuoc_id: isCoQuanDonVi ? null : donViId,
        nam: year,
      },
    });
  }

  async list({ page = 1, limit = 10, year, donViId, status, userRole, userQuanNhanId }) {
    const where = {};
    if (year) where.nam = Number(year);
    if (status) where.status = status;

    // Phân quyền: USER và MANAGER chỉ xem được đơn vị của mình
    if ((userRole === 'USER' || userRole === 'MANAGER') && userQuanNhanId) {
      const user = await prisma.quanNhan.findUnique({
        where: { id: userQuanNhanId },
        select: { co_quan_don_vi_id: true, don_vi_truc_thuoc_id: true },
      });

      if (user) {
        if (userRole === 'MANAGER' && user.co_quan_don_vi_id) {
          // Manager xem tất cả đơn vị thuộc cơ quan đơn vị
          where.OR = [
            { co_quan_don_vi_id: user.co_quan_don_vi_id },
            { don_vi_truc_thuoc_id: { in: await this.getSubUnits(user.co_quan_don_vi_id) } },
          ];
        } else if (userRole === 'USER' && user.don_vi_truc_thuoc_id) {
          // User chỉ xem đơn vị trực thuộc của mình
          where.don_vi_truc_thuoc_id = user.don_vi_truc_thuoc_id;
        }
      } else {
        return {
          items: [],
          pagination: { total: 0, page: Number(page), limit: Number(limit), totalPages: 0 },
        };
      }
    }

    if (donViId) {
      where.OR = [{ co_quan_don_vi_id: donViId }, { don_vi_truc_thuoc_id: donViId }];
    }

    const [total, items] = await Promise.all([
      prisma.danhHieuDonViHangNam.count({ where }),
      prisma.danhHieuDonViHangNam.findMany({
        where,
        orderBy: [{ nam: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { CoQuanDonVi: true, DonViTrucThuoc: true },
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSubUnits(coQuanDonViId) {
    const subUnits = await prisma.donViTrucThuoc.findMany({
      where: { co_quan_don_vi_id: coQuanDonViId },
      select: { id: true },
    });
    return subUnits.map(u => u.id);
  }

  async getById(id, userRole, userQuanNhanId) {
    const record = await prisma.danhHieuDonViHangNam.findUnique({
      where: { id: String(id) },
      include: { CoQuanDonVi: true, DonViTrucThuoc: true },
    });

    if (!record) return null;

    // Phân quyền: USER và MANAGER chỉ xem được đơn vị của mình
    if ((userRole === 'USER' || userRole === 'MANAGER') && userQuanNhanId) {
      const user = await prisma.quanNhan.findUnique({
        where: { id: userQuanNhanId },
        select: { co_quan_don_vi_id: true, don_vi_truc_thuoc_id: true },
      });

      if (!user) return null;

      const recordDonViId = record.co_quan_don_vi_id || record.don_vi_truc_thuoc_id;

      if (userRole === 'MANAGER') {
        // Manager kiểm tra xem đơn vị có thuộc cơ quan đơn vị của mình không
        if (
          user.co_quan_don_vi_id !== record.co_quan_don_vi_id &&
          user.co_quan_don_vi_id !== recordDonViId
        ) {
          return null;
        }
      } else if (userRole === 'USER') {
        // User chỉ xem được đơn vị trực thuộc của mình
        if (user.don_vi_truc_thuoc_id !== recordDonViId) {
          return null;
        }
      }
    }

    return record;
  }

  /**
   * Upsert bản ghi DanhHieuDonViHangNam và tự động cập nhật HoSoDonViHangNam
   */
  async upsert({
    don_vi_id,
    nam,
    danh_hieu,
    so_quyet_dinh,
    file_quyet_dinh,
    ghi_chu,
    nguoi_tao_id,
  }) {
    const year = Number(nam);
    const unitId = don_vi_id;

    // Xác định loại đơn vị
    const coQuanDonVi = await prisma.coQuanDonVi.findUnique({ where: { id: unitId } });
    const donViTrucThuoc = await prisma.donViTrucThuoc.findUnique({ where: { id: unitId } });

    if (!coQuanDonVi && !donViTrucThuoc) {
      throw new Error('Không tìm thấy đơn vị');
    }

    const isCoQuanDonVi = !!coQuanDonVi;

    const whereCondition = isCoQuanDonVi
      ? { unique_co_quan_don_vi_nam_dh: { co_quan_don_vi_id: unitId, nam: year } }
      : { unique_don_vi_truc_thuoc_nam_dh: { don_vi_truc_thuoc_id: unitId, nam: year } };

    const record = await prisma.danhHieuDonViHangNam.upsert({
      where: whereCondition,
      update: {
        danh_hieu: danh_hieu || null,
        so_quyet_dinh: so_quyet_dinh || null,
        file_quyet_dinh: file_quyet_dinh || null,
        ghi_chu: ghi_chu || null,
      },
      create: {
        co_quan_don_vi_id: isCoQuanDonVi ? unitId : null,
        don_vi_truc_thuoc_id: isCoQuanDonVi ? null : unitId,
        nam: year,
        danh_hieu: danh_hieu || null,
        so_quyet_dinh: so_quyet_dinh || null,
        file_quyet_dinh: file_quyet_dinh || null,
        ghi_chu: ghi_chu || null,
        nguoi_tao_id: nguoi_tao_id,
        status: 'APPROVED', // Mặc định là APPROVED cho upsert trực tiếp
      },
      include: { CoQuanDonVi: true, DonViTrucThuoc: true },
    });

    // Tự động recalculate toàn bộ hồ sơ (giống profileService)
    await this.recalculateAnnualUnit(unitId, year);

    return record;
  }

  /**
   * Recalculate theo đơn vị và năm (hoặc toàn bộ)
   */
  async recalculate({ don_vi_id, nam }) {
    if (don_vi_id && nam) {
      // Recalculate cho một đơn vị và một năm cụ thể
      await this.recalculateAnnualUnit(don_vi_id, Number(nam));
      return 1;
    } else if (don_vi_id) {
      // Recalculate tất cả các năm của một đơn vị
      const records = await prisma.hoSoDonViHangNam.findMany({
        where: {
          OR: [{ co_quan_don_vi_id: don_vi_id }, { don_vi_truc_thuoc_id: don_vi_id }],
        },
        select: { nam: true },
        distinct: ['nam'],
      });

      for (const r of records) {
        await this.recalculateAnnualUnit(don_vi_id, r.nam);
      }

      return records.length;
    } else {
      // Recalculate tất cả đơn vị và tất cả năm
      const records = await prisma.hoSoDonViHangNam.findMany({
        select: { co_quan_don_vi_id: true, don_vi_truc_thuoc_id: true, nam: true },
      });

      const uniqueUnits = new Map();
      for (const r of records) {
        const unitId = r.co_quan_don_vi_id || r.don_vi_truc_thuoc_id;
        if (!uniqueUnits.has(unitId)) {
          uniqueUnits.set(unitId, new Set());
        }
        uniqueUnits.get(unitId).add(r.nam);
      }

      let count = 0;
      for (const [unitId, years] of uniqueUnits) {
        for (const year of years) {
          await this.recalculateAnnualUnit(unitId, year);
          count++;
        }
      }

      return count;
    }
  }

  async remove(id) {
    // Xóa DanhHieuDonViHangNam
    const danhHieu = await prisma.danhHieuDonViHangNam.findUnique({
      where: { id: String(id) },
    });

    if (!danhHieu) {
      throw new Error('Không tìm thấy bản ghi');
    }

    await prisma.danhHieuDonViHangNam.delete({ where: { id: String(id) } });

    // Tự động recalculate sau khi xóa (giống profileService)
    const donViId = danhHieu.co_quan_don_vi_id || danhHieu.don_vi_truc_thuoc_id;
    await this.recalculateAnnualUnit(donViId, danhHieu.nam);

    return true;
  }

  /**
   * Lấy hồ sơ gợi ý hằng năm của đơn vị (tương tự getAnnualProfile)
   */
  async getAnnualUnit(donViId) {
    try {
      // Kiểm tra đơn vị tồn tại
      const donVi =
        (await prisma.coQuanDonVi.findUnique({ where: { id: donViId } })) ||
        (await prisma.donViTrucThuoc.findUnique({ where: { id: donViId } }));

      if (!donVi) {
        throw new Error('Đơn vị không tồn tại');
      }

      const isCoQuanDonVi = !!donVi.ma_don_vi && !donVi.co_quan_don_vi_id;

      // Lấy hồ sơ năm gần nhất
      let profile = await prisma.hoSoDonViHangNam.findFirst({
        where: {
          OR: [{ co_quan_don_vi_id: donViId }, { don_vi_truc_thuoc_id: donViId }],
        },
        orderBy: { nam: 'desc' },
        include: {
          CoQuanDonVi: true,
          DonViTrucThuoc: true,
        },
      });

      // Nếu chưa có hồ sơ, tạo mới với giá trị mặc định
      if (!profile) {
        const currentYear = new Date().getFullYear();
        profile = await prisma.hoSoDonViHangNam.create({
          data: {
            co_quan_don_vi_id: isCoQuanDonVi ? donViId : null,
            don_vi_truc_thuoc_id: isCoQuanDonVi ? null : donViId,
            nam: currentYear,
            tong_dvqt: 0,
            tong_dvqt_json: [],
            dvqt_lien_tuc: 0,
            du_dieu_kien_bk_tong_cuc: false,
            du_dieu_kien_bk_thu_tuong: false,
            goi_y: 'Chưa có dữ liệu để tính toán. Vui lòng nhập danh hiệu đơn vị.',
          },
          include: {
            CoQuanDonVi: true,
            DonViTrucThuoc: true,
          },
        });
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tính toán lại hồ sơ hằng năm của đơn vị (tương tự recalculateAnnualProfile)
   */
  async recalculateAnnualUnit(donViId, year = null) {
    try {
      // Kiểm tra đơn vị tồn tại
      const donVi =
        (await prisma.coQuanDonVi.findUnique({ where: { id: donViId } })) ||
        (await prisma.donViTrucThuoc.findUnique({ where: { id: donViId } }));

      if (!donVi) {
        throw new Error('Đơn vị không tồn tại');
      }

      const isCoQuanDonVi = !!donVi.ma_don_vi && !donVi.co_quan_don_vi_id;
      const targetYear = year || new Date().getFullYear();

      console.log(
        `📋 [recalculateAnnualUnit] Đơn vị ID: ${donViId}, Năm: ${targetYear}, IsCoQuanDonVi: ${isCoQuanDonVi}`
      );

      // Lấy tất cả danh hiệu của đơn vị đến năm hiện tại
      const danhHieuList = await prisma.danhHieuDonViHangNam.findMany({
        where: {
          OR: [{ co_quan_don_vi_id: donViId }, { don_vi_truc_thuoc_id: donViId }],
          nam: { lte: targetYear },
          status: 'APPROVED',
        },
        orderBy: { nam: 'asc' },
      });

      console.log(
        `📋 [recalculateAnnualUnit] Số danh hiệu: ${danhHieuList.length}`,
        danhHieuList.map(dh => `${dh.nam}: ${dh.danh_hieu}`).join(', ')
      );

      // Tính toán các chỉ số
      const dvqtResult = await this.calculateTotalDVQT(donViId, targetYear);
      const dvqtLienTuc = await this.calculateContinuousYears(donViId, targetYear);

      const du_dieu_kien_bk_tong_cuc = dvqtLienTuc >= 3;
      const du_dieu_kien_bk_thu_tuong = dvqtLienTuc >= 5;

      // Kiểm tra xem có bằng khen chưa
      const currentYearAward = danhHieuList.find(dh => dh.nam === targetYear);
      const hasDecision = !!currentYearAward?.so_quyet_dinh;

      const goi_y = this.buildSuggestion(dvqtLienTuc, hasDecision);

      console.log(
        `📋 [recalculateAnnualUnit] Kết quả tính toán:`,
        JSON.stringify(
          {
            tong_dvqt: dvqtResult.total,
            dvqt_lien_tuc: dvqtLienTuc,
            du_dieu_kien_bk_tong_cuc,
            du_dieu_kien_bk_thu_tuong,
            goi_y,
          },
          null,
          2
        )
      );

      // Upsert HoSoDonViHangNam
      const whereCondition = isCoQuanDonVi
        ? { unique_co_quan_don_vi_nam: { co_quan_don_vi_id: donViId, nam: targetYear } }
        : { unique_don_vi_truc_thuoc_nam: { don_vi_truc_thuoc_id: donViId, nam: targetYear } };

      const hoSoData = {
        tong_dvqt: dvqtResult.total,
        tong_dvqt_json: dvqtResult.details,
        dvqt_lien_tuc: dvqtLienTuc,
        du_dieu_kien_bk_tong_cuc,
        du_dieu_kien_bk_thu_tuong,
        goi_y,
      };

      const hoSo = await prisma.hoSoDonViHangNam.upsert({
        where: whereCondition,
        update: hoSoData,
        create: {
          ...hoSoData,
          co_quan_don_vi_id: isCoQuanDonVi ? donViId : null,
          don_vi_truc_thuoc_id: isCoQuanDonVi ? null : donViId,
          nam: targetYear,
        },
        include: {
          CoQuanDonVi: true,
          DonViTrucThuoc: true,
        },
      });

      console.log(`✅ [recalculateAnnualUnit] Đã lưu hoSoDonViHangNam thành công. ID: ${hoSo.id}`);

      return hoSo;
    } catch (error) {
      console.error(`❌ [recalculateAnnualUnit] Lỗi:`, error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử khen thưởng hằng năm cho 1 đơn vị (danh sách DanhHieuDonViHangNam)
   */
  async getUnitAnnualAwards(donViId, userRole = 'ADMIN', userQuanNhanId = null) {
    if (!donViId) throw new Error('don_vi_id là bắt buộc');

    // Kiểm tra đơn vị tồn tại
    const donVi =
      (await prisma.coQuanDonVi.findUnique({ where: { id: donViId } })) ||
      (await prisma.donViTrucThuoc.findUnique({ where: { id: donViId } }));

    if (!donVi) throw new Error('Đơn vị không tồn tại');

    // Phân quyền
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // admin xem được tất cả
    } else if ((userRole === 'MANAGER' || userRole === 'USER') && userQuanNhanId) {
      const user = await prisma.quanNhan.findUnique({
        where: { id: userQuanNhanId },
        select: { co_quan_don_vi_id: true, don_vi_truc_thuoc_id: true },
      });

      if (!user) throw new Error('Không tìm thấy thông tin người dùng');

      if (userRole === 'MANAGER') {
        // Manager được xem tất cả đơn vị thuộc cùng co_quan_don_vi_id
        let targetCoQuanId = donVi.co_quan_don_vi_id || donVi.id;
        if (!user.co_quan_don_vi_id || user.co_quan_don_vi_id !== targetCoQuanId) {
          throw new Error('Không có quyền xem lịch sử khen thưởng của đơn vị này');
        }
      } else if (userRole === 'USER') {
        // User chỉ được xem đơn vị trực thuộc của chính họ
        if (!user.don_vi_truc_thuoc_id || user.don_vi_truc_thuoc_id !== donViId) {
          throw new Error('Không có quyền xem lịch sử khen thưởng của đơn vị này');
        }
      }
    } else {
      throw new Error('Không có quyền truy cập');
    }

    // Trả về danh sách danh hiệu và thống kê
    const danhHieuRecords = await prisma.danhHieuDonViHangNam.findMany({
      where: {
        OR: [{ co_quan_don_vi_id: donViId }, { don_vi_truc_thuoc_id: donViId }],
        status: 'APPROVED',
      },
      orderBy: { nam: 'desc' },
    });

    return danhHieuRecords;
  }
}

module.exports = new UnitAnnualAwardService();
