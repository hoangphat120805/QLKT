const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const DanhHieuHangNam = sequelize.define(
  'DanhHieuHangNam',
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
    nam: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    danh_hieu: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'CSTDCS, CSTT (null = không đạt)',
    },
    nhan_bkbqp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    so_quyet_dinh_bkbqp: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nhan_cstdtq: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    so_quyet_dinh_cstdtq: {
      type: DataTypes.STRING(100),
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
    tableName: 'danh_hieu_hang_nam',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['quan_nhan_id', 'nam'],
      },
    ],
  }
);

module.exports = DanhHieuHangNam;
