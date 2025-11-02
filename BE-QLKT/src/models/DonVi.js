const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const DonVi = sequelize.define('DonVi', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ma_don_vi: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  ten_don_vi: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  so_luong: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'don_vi',
  timestamps: true
});

module.exports = DonVi;
