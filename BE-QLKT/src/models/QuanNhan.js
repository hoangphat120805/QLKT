const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const QuanNhan = sequelize.define('QuanNhan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cccd: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  ho_ten: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ngay_sinh: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  ngay_nhap_ngu: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  don_vi_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'don_vi',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  chuc_vu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'chuc_vu',
      key: 'id'
    },
    onDelete: 'RESTRICT'
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
  tableName: 'quan_nhan',
  timestamps: true
});

module.exports = QuanNhan;
