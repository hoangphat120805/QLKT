const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const LichSuChucVu = sequelize.define(
  'LichSuChucVu',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quan_nhan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quan_nhan',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    chuc_vu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chuc_vu',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    ngay_bat_dau: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    ngay_ket_thuc: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'createdat',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updatedat',
    },
  },
  {
    tableName: 'lich_su_chuc_vu',
    timestamps: true,
  }
);

module.exports = LichSuChucVu;
