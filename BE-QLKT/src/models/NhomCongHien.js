const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const NhomCongHien = sequelize.define('NhomCongHien', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ten_nhom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  mo_ta: {
    type: DataTypes.STRING(500),
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
  tableName: 'nhom_cong_hien',
  timestamps: true
});

module.exports = NhomCongHien;
