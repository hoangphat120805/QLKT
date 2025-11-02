const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const TaiKhoan = sequelize.define('TaiKhoan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quan_nhan_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
    references: {
      model: 'quan_nhan',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'SUPER_ADMIN, ADMIN, MANAGER, USER'
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'refreshtoken'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'createdat'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updatedat'
  }
}, {
  tableName: 'tai_khoan',
  timestamps: true
});

module.exports = TaiKhoan;
