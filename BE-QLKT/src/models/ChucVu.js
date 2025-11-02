const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const ChucVu = sequelize.define('ChucVu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  ten_chuc_vu: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_manager: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  nhom_cong_hien_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'nhom_cong_hien',
      key: 'id'
    },
    onDelete: 'SET NULL'
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
  tableName: 'chuc_vu',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['don_vi_id', 'ten_chuc_vu']
    }
  ]
});

module.exports = ChucVu;
