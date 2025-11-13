const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const HoSoHangNam = sequelize.define(
  'HoSoHangNam',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quan_nhan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'quan_nhan',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    tong_cstdcs: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tong_nckh: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    cstdcs_lien_tuc: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    du_dieu_kien_bkbqp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    du_dieu_kien_cstdtq: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    goi_y: {
      type: DataTypes.TEXT,
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
    tableName: 'ho_so_hang_nam',
    timestamps: true,
  }
);

module.exports = HoSoHangNam;
