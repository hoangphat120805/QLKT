const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const ThanhTichKhoaHoc = sequelize.define('ThanhTichKhoaHoc', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quan_nhan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quan_nhan',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  nam: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  loai: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'NCKH, SKKH'
  },
  mo_ta: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'PENDING',
    comment: 'APPROVED, PENDING'
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
  tableName: 'thanh_tich_khoa_hoc',
  timestamps: true
});

module.exports = ThanhTichKhoaHoc;
