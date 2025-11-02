const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const ThongBao = sequelize.define('ThongBao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tai_khoan',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID người nhận thông báo'
  },
  recipient_role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'SUPER_ADMIN, ADMIN, MANAGER, USER'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'NEW_PERSONNEL, APPROVAL_PENDING, ACHIEVEMENT_SUBMITTED, etc.'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Tiêu đề thông báo'
  },
  message: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Nội dung thông báo'
  },
  resource: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'personnel, achievements, proposals, etc.'
  },
  resource_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID của tài nguyên liên quan'
  },
  link: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL để navigate đến'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Đã đọc chưa'
  },
  system_log_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'system_logs',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'ID của system log liên quan (nếu có)'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at',
    comment: 'Thời gian đọc'
  }
}, {
  tableName: 'notifications',
  timestamps: false,
  indexes: [
    {
      fields: ['recipient_id', 'is_read', 'created_at']
    },
    {
      fields: ['recipient_role', 'is_read', 'created_at']
    },
    {
      fields: ['type', 'created_at']
    }
  ]
});

module.exports = ThongBao;
