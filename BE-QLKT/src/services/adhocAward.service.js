const { prisma } = require('../models');
const path = require('path');
const fs = require('fs').promises;

class AdhocAwardService {
  /**
   * Create ad-hoc award
   */
  async createAdhocAward({
    adminId,
    type,
    year,
    awardForm,
    personnelId,
    unitId,
    unitType,
    rank,
    position,
    note,
    decisionNumber,
    files,
  }) {
    try {
      // Verify admin exists
      const admin = await prisma.taiKhoan.findUnique({
        where: { id: adminId },
      });

      if (!admin || admin.role !== 'ADMIN') {
        throw new Error('Chỉ Admin mới có quyền tạo khen thưởng đột xuất');
      }

      // Verify personnel exists if type is CA_NHAN
      if (type === 'CA_NHAN') {
        const personnel = await prisma.quanNhan.findUnique({
          where: { id: personnelId },
        });

        if (!personnel) {
          throw new Error('Quân nhân không tồn tại');
        }
      }

      // Verify unit exists if type is TAP_THE
      if (type === 'TAP_THE') {
        if (unitType === 'CO_QUAN_DON_VI') {
          const unit = await prisma.coQuanDonVi.findUnique({
            where: { id: unitId },
          });

          if (!unit) {
            throw new Error('Cơ quan đơn vị không tồn tại');
          }
        } else if (unitType === 'DON_VI_TRUC_THUOC') {
          const unit = await prisma.donViTrucThuoc.findUnique({
            where: { id: unitId },
          });

          if (!unit) {
            throw new Error('Đơn vị trực thuộc không tồn tại');
          }
        }
      }

      // Handle file uploads
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'adhoc-awards');
      await fs.mkdir(uploadsDir, { recursive: true });

      const uploadedFiles = [];

      for (const file of files) {
        const timestamp = Date.now();
        const uniqueName = `${timestamp}_${file.originalname}`;
        const filePath = path.join(uploadsDir, uniqueName);

        await fs.writeFile(filePath, file.buffer);

        uploadedFiles.push({
          filename: uniqueName,
          originalName: file.originalname,
          path: `uploads/adhoc-awards/${uniqueName}`,
          size: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date().toISOString(),
        });
      }

      // Create ad-hoc award
      const adhocAward = await prisma.khenThuongDotXuat.create({
        data: {
          loai: type,
          ...(type === 'CA_NHAN' && personnelId && { quan_nhan_id: personnelId }),
          ...(type === 'TAP_THE' && unitType === 'CO_QUAN_DON_VI' && { co_quan_don_vi_id: unitId }),
          ...(type === 'TAP_THE' &&
            unitType === 'DON_VI_TRUC_THUOC' && { don_vi_truc_thuoc_id: unitId }),
          hinh_thuc_khen_thuong: awardForm,
          nam: year,
          cap_bac: rank || null,
          chuc_vu: position || null,
          ghi_chu: note || null,
          so_quyet_dinh: decisionNumber || null,
          files_quyet_dinh: uploadedFiles.length > 0 ? uploadedFiles : null,
        },
        include: {
          QuanNhan: {
            include: {
              CoQuanDonVi: true,
              DonViTrucThuoc: true,
              ChucVu: true,
            },
          },
          CoQuanDonVi: true,
          DonViTrucThuoc: {
            include: {
              CoQuanDonVi: true,
            },
          },
        },
      });

      return adhocAward;
    } catch (error) {
      console.error('Create ad-hoc award error:', error);
      throw error;
    }
  }

  /**
   * Get all ad-hoc awards with filters and pagination
   */
  async getAdhocAwards({ type, year, personnelId, unitId, page = 1, limit = 20 }) {
    try {
      const skip = (page - 1) * limit;

      const where = {};

      if (type) {
        where.loai = type;
      }

      if (year) {
        where.nam = year;
      }

      if (personnelId) {
        where.quan_nhan_id = personnelId;
      }

      if (unitId) {
        where.OR = [{ co_quan_don_vi_id: unitId }, { don_vi_truc_thuoc_id: unitId }];
      }

      const [total, data] = await Promise.all([
        prisma.khenThuongDotXuat.count({ where }),
        prisma.khenThuongDotXuat.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            QuanNhan: {
              include: {
                CoQuanDonVi: true,
                DonViTrucThuoc: true,
                ChucVu: true,
              },
            },
            CoQuanDonVi: true,
            DonViTrucThuoc: {
              include: {
                CoQuanDonVi: true,
              },
            },
          },
        }),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Get ad-hoc awards error:', error);
      throw error;
    }
  }

  /**
   * Get single ad-hoc award by ID
   */
  async getAdhocAwardById(id) {
    try {
      const adhocAward = await prisma.khenThuongDotXuat.findUnique({
        where: { id },
        include: {
          QuanNhan: {
            include: {
              CoQuanDonVi: true,
              DonViTrucThuoc: true,
              ChucVu: true,
            },
          },
          CoQuanDonVi: true,
          DonViTrucThuoc: {
            include: {
              CoQuanDonVi: true,
            },
          },
        },
      });

      if (!adhocAward) {
        throw new Error('Khen thưởng đột xuất không tồn tại');
      }

      return adhocAward;
    } catch (error) {
      console.error('Get ad-hoc award by ID error:', error);
      throw error;
    }
  }

  /**
   * Update ad-hoc award
   */
  async updateAdhocAward({
    id,
    adminId,
    awardForm,
    year,
    rank,
    position,
    note,
    decisionNumber,
    files,
    removeFileIndexes,
  }) {
    try {
      // Verify admin exists
      const admin = await prisma.taiKhoan.findUnique({
        where: { id: adminId },
      });

      if (!admin || admin.role !== 'ADMIN') {
        throw new Error('Chỉ Admin mới có quyền cập nhật khen thưởng đột xuất');
      }

      // Get existing record
      const existing = await prisma.khenThuongDotXuat.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Khen thưởng đột xuất không tồn tại');
      }

      // Handle existing files
      let existingFiles = existing.files_quyet_dinh || [];

      // Remove files at specified indexes
      if (removeFileIndexes && removeFileIndexes.length > 0) {
        const filesToRemove = removeFileIndexes
          .sort((a, b) => b - a)
          .filter(index => index >= 0 && index < existingFiles.length);

        for (const index of filesToRemove) {
          const fileToRemove = existingFiles[index];
          try {
            const fullPath = path.join(__dirname, '..', '..', fileToRemove.path);
            await fs.unlink(fullPath);
          } catch (err) {
            console.error(`Failed to delete file: ${fileToRemove.path}`, err);
          }
          existingFiles.splice(index, 1);
        }
      }

      // Handle new file uploads
      if (files && files.length > 0) {
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'adhoc-awards');
        await fs.mkdir(uploadsDir, { recursive: true });

        for (const file of files) {
          const timestamp = Date.now();
          const uniqueName = `${timestamp}_${file.originalname}`;
          const filePath = path.join(uploadsDir, uniqueName);

          await fs.writeFile(filePath, file.buffer);

          existingFiles.push({
            filename: uniqueName,
            originalName: file.originalname,
            path: `uploads/adhoc-awards/${uniqueName}`,
            size: file.size,
            mimeType: file.mimetype,
            uploadedAt: new Date().toISOString(),
          });
        }
      }

      // Update record
      const updateData = {};

      if (awardForm !== undefined) updateData.hinh_thuc_khen_thuong = awardForm;
      if (year !== undefined) updateData.nam = year;
      if (rank !== undefined) updateData.cap_bac = rank;
      if (position !== undefined) updateData.chuc_vu = position;
      if (note !== undefined) updateData.ghi_chu = note;
      if (decisionNumber !== undefined) updateData.so_quyet_dinh = decisionNumber;

      updateData.files_quyet_dinh = existingFiles.length > 0 ? existingFiles : null;

      const updated = await prisma.khenThuongDotXuat.update({
        where: { id },
        data: updateData,
        include: {
          QuanNhan: {
            include: {
              CoQuanDonVi: true,
              DonViTrucThuoc: true,
              ChucVu: true,
            },
          },
          CoQuanDonVi: true,
          DonViTrucThuoc: {
            include: {
              CoQuanDonVi: true,
            },
          },
        },
      });

      return updated;
    } catch (error) {
      console.error('Update ad-hoc award error:', error);
      throw error;
    }
  }

  /**
   * Delete ad-hoc award
   */
  async deleteAdhocAward(id) {
    try {
      const adhocAward = await prisma.khenThuongDotXuat.findUnique({
        where: { id },
      });

      if (!adhocAward) {
        throw new Error('Khen thưởng đột xuất không tồn tại');
      }

      // Delete associated files
      const files = adhocAward.files_quyet_dinh || [];
      for (const file of files) {
        try {
          const fullPath = path.join(__dirname, '..', '..', file.path);
          await fs.unlink(fullPath);
        } catch (err) {
          console.error(`Failed to delete file: ${file.path}`, err);
        }
      }

      // Delete record
      await prisma.khenThuongDotXuat.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      console.error('Delete ad-hoc award error:', error);
      throw error;
    }
  }

  /**
   * Get all ad-hoc awards for a specific personnel
   */
  async getAdhocAwardsByPersonnel(personnelId) {
    try {
      const personnel = await prisma.quanNhan.findUnique({
        where: { id: personnelId },
      });

      if (!personnel) {
        throw new Error('Quân nhân không tồn tại');
      }

      const adhocAwards = await prisma.khenThuongDotXuat.findMany({
        where: {
          loai: 'CA_NHAN',
          quan_nhan_id: personnelId,
        },
        orderBy: {
          nam: 'desc',
        },
        include: {
          QuanNhan: {
            include: {
              CoQuanDonVi: true,
              DonViTrucThuoc: true,
              ChucVu: true,
            },
          },
        },
      });

      return adhocAwards;
    } catch (error) {
      console.error('Get ad-hoc awards by personnel error:', error);
      throw error;
    }
  }

  /**
   * Get all ad-hoc awards for a specific unit
   */
  async getAdhocAwardsByUnit(unitId, unitType) {
    try {
      const where = {
        loai: 'TAP_THE',
      };

      if (unitType === 'CO_QUAN_DON_VI') {
        where.co_quan_don_vi_id = unitId;

        const unit = await prisma.coQuanDonVi.findUnique({
          where: { id: unitId },
        });

        if (!unit) {
          throw new Error('Cơ quan đơn vị không tồn tại');
        }
      } else if (unitType === 'DON_VI_TRUC_THUOC') {
        where.don_vi_truc_thuoc_id = unitId;

        const unit = await prisma.donViTrucThuoc.findUnique({
          where: { id: unitId },
        });

        if (!unit) {
          throw new Error('Đơn vị trực thuộc không tồn tại');
        }
      }

      const adhocAwards = await prisma.khenThuongDotXuat.findMany({
        where,
        orderBy: {
          nam: 'desc',
        },
        include: {
          CoQuanDonVi: true,
          DonViTrucThuoc: {
            include: {
              CoQuanDonVi: true,
            },
          },
        },
      });

      return adhocAwards;
    } catch (error) {
      console.error('Get ad-hoc awards by unit error:', error);
      throw error;
    }
  }
}

module.exports = new AdhocAwardService();
