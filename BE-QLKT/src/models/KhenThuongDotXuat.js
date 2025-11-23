const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const KhenThuongDotXuat = sequelize.define(
  'KhenThuongDotXuat',
  {
    id: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    loai: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'CA_NHAN, TAP_THE',
    },
    quan_nhan_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
      references: {
        model: 'quan_nhan',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'ID quân nhân (khi loai = CA_NHAN)',
    },
    co_quan_don_vi_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
      references: {
        model: 'co_quan_don_vi',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'ID cơ quan đơn vị (khi loai = TAP_THE)',
    },
    don_vi_truc_thuoc_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
      references: {
        model: 'don_vi_truc_thuoc',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'ID đơn vị trực thuộc (khi loai = TAP_THE)',
    },
    hinh_thuc_khen_thuong: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Ví dụ: "Giấy khen của abc", "Bằng khen của def"',
    },
    nam: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Năm nhận khen thưởng',
    },
    cap_bac: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Cấp bậc tại thời điểm được đề xuất (cho CA_NHAN)',
    },
    chuc_vu: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Chức vụ tại thời điểm được đề xuất (cho CA_NHAN, text tự do)',
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Ghi chú bổ sung (cho cả CA_NHAN và TAP_THE)',
    },
    so_quyet_dinh: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    file_quyet_dinh: {
      type: DataTypes.STRING(500),
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
    tableName: 'khen_thuong_dot_xuat',
    timestamps: true,
    indexes: [
      {
        fields: ['quan_nhan_id', 'nam'],
      },
      {
        fields: ['co_quan_don_vi_id', 'nam'],
      },
      {
        fields: ['don_vi_truc_thuoc_id', 'nam'],
      },
    ],
  }
);

module.exports = KhenThuongDotXuat;
