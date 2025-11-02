const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

class SystemLogsController {
  /**
   * GET /api/system-logs
   * Lấy danh sách nhật ký hệ thống với phân quyền
   */
  async getLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        action,
        resource,
        startDate,
        endDate,
        actorRole,
      } = req.query;
      const currentUser = req.user;

      // Phân quyền xem log theo cấp bậc
      const roleHierarchy = {
        USER: 1,
        MANAGER: 2,
        ADMIN: 3,
        SUPER_ADMIN: 4,
      };

      const currentUserLevel = roleHierarchy[currentUser.role] || 0;
      const allowedRoles = Object.keys(roleHierarchy).filter(
        role => roleHierarchy[role] <= currentUserLevel
      );

      const skip = (page - 1) * limit;
      const where = {};
      // Lọc theo vai trò tác nhân (theo cấp bậc), MANAGER chỉ xem được USER
      if (currentUser.role === 'MANAGER') {
        where.actor_role = 'USER';
      } else if (actorRole && allowedRoles.includes(actorRole)) {
        where.actor_role = actorRole;
      } else {
        where.actor_role = { in: allowedRoles };
      }

      // Tìm kiếm theo mô tả
      if (search) {
        where.description = {
          contains: search,
          mode: 'insensitive',
        };
      }

      // Lọc theo hành động
      if (action) {
        where.action = action;
      }

      // Lọc theo tài nguyên
      if (resource) {
        where.resource = resource;
      }

      // Lọc theo thời gian
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) {
          where.created_at.gte = new Date(startDate);
        }
        if (endDate) {
          where.created_at.lte = new Date(endDate);
        }
      }

      const [logs, total] = await Promise.all([
        prisma.systemLog.findMany({
          skip: parseInt(skip),
          take: parseInt(limit),
          where,
          include: {
            Actor: {
              select: {
                id: true,
                username: true,
                role: true,
                QuanNhan: {
                  select: {
                    ho_ten: true,
                  },
                },
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        }),
        prisma.systemLog.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        message: 'Lấy nhật ký hệ thống thành công',
        data: {
          logs,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get system logs error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy nhật ký hệ thống',
      });
    }
  }

  /**
   * GET /api/system-logs/actions
   * Lấy danh sách các hành động có thể lọc
   */
  async getActions(req, res) {
    try {
      const actions = await prisma.systemLog.findMany({
        select: { action: true },
        distinct: ['action'],
        orderBy: { action: 'asc' },
      });

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách hành động thành công',
        data: actions.map(item => item.action),
      });
    } catch (error) {
      console.error('Get actions error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách hành động',
      });
    }
  }

  /**
   * GET /api/system-logs/resources
   * Lấy danh sách các tài nguyên có thể lọc
   */
  async getResources(req, res) {
    try {
      const resources = await prisma.systemLog.findMany({
        select: { resource: true },
        distinct: ['resource'],
        orderBy: { resource: 'asc' },
      });

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách tài nguyên thành công',
        data: resources.map(item => item.resource),
      });
    } catch (error) {
      console.error('Get resources error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách tài nguyên',
      });
    }
  }
}

module.exports = new SystemLogsController();
