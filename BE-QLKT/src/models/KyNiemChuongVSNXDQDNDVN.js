const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const KyNiemChuongVSNXDQDNDVN = sequelize.define(
  'KyNiemChuongVSNXDQDNDVN',
  {
    id: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    quan_nhan_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      references: {
        model: 'quan_nhan',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    nam: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Năm được trao',
    },
    cap_bac: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Cấp bậc tại thời điểm được đề xuất',
    },
    chuc_vu: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Chức vụ tại thời điểm được đề xuất (text tự do)',
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Ghi chú bổ sung',
    },
    so_quyet_dinh: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    file_quyet_dinh: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    thoi_gian: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '{ total_months, years, months, display }',
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
    tableName: 'ky_niem_chuong_vsnxd_qdndvn',
    timestamps: true,
  }
);

module.exports = KyNiemChuongVSNXDQDNDVN;
