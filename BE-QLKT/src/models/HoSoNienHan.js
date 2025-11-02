const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const HoSoNienHan = sequelize.define('HoSoNienHan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quan_nhan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'quan_nhan',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  // Huân chương Chiến sĩ vẻ vang (HCCSVV)
  hccsvv_hang_ba_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'CHUA_DU',
    comment: 'CHUA_DU, DU_DIEU_KIEN, DA_NHAN'
  },
  hccsvv_hang_ba_ngay: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  hccsvv_hang_nhi_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'CHUA_DU'
  },
  hccsvv_hang_nhi_ngay: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  hccsvv_hang_nhat_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'CHUA_DU'
  },
  hccsvv_hang_nhat_ngay: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  // Huân chương Bảo vệ Tổ quốc (HCBVTQ - Cống hiến)
  hcbvtq_total_months: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hcbvtq_hang_ba_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'CHUA_DU'
  },
  hcbvtq_hang_nhi_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'CHUA_DU'
  },
  hcbvtq_hang_nhat_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'CHUA_DU'
  },
  goi_y: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'ho_so_nien_han',
  timestamps: true
});

module.exports = HoSoNienHan;
