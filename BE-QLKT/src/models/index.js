// ============================================
// PRISMA CLIENT
// ============================================
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// ============================================
// SEQUELIZE MODELS
// ============================================
const sequelize = require('./database');

// Import models
const CoQuanDonVi = require('./CoQuanDonVi');
const DonViTrucThuoc = require('./DonViTrucThuoc');
const ChucVu = require('./ChucVu');
const QuanNhan = require('./QuanNhan');
const TaiKhoan = require('./TaiKhoan');
const LichSuChucVu = require('./LichSuChucVu');
const ThanhTichKhoaHoc = require('./ThanhTichKhoaHoc');
const DanhHieuHangNam = require('./DanhHieuHangNam');
const HoSoNienHan = require('./HoSoNienHan');
const HoSoCongHien = require('./HoSoCongHien');
const HoSoHangNam = require('./HoSoHangNam');
const ThongBao = require('./ThongBao');
const HoSoDonViHangNam = require('./HoSoDonViHangNam');
const DanhHieuDonViHangNam = require('./DanhHieuDonViHangNam');
const KhenThuongCongHien = require('./KhenThuongCongHien');
const HuanChuongQuanKyQuyetThang = require('./HuanChuongQuanKyQuyetThang');
const KyNiemChuongVSNXDQDNDVN = require('./KyNiemChuongVSNXDQDNDVN');
const KhenThuongHCCSVV = require('./KhenThuongHCCSVV');
const KhenThuongDotXuat = require('./KhenThuongDotXuat');

// ============================================
// SEQUELIZE RELATIONSHIPS
// ============================================

// CoQuanDonVi relationships
CoQuanDonVi.hasMany(DonViTrucThuoc, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'donViTrucThuoc',
});
CoQuanDonVi.hasMany(ChucVu, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'chucVu',
});
CoQuanDonVi.hasMany(QuanNhan, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'quanNhan',
});
CoQuanDonVi.hasMany(HoSoDonViHangNam, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'hoSoDonViHangNam',
});
CoQuanDonVi.hasMany(DanhHieuDonViHangNam, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'danhHieuDonViHangNam',
});
CoQuanDonVi.hasMany(KhenThuongDotXuat, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'khenThuongDotXuat',
});

// DonViTrucThuoc relationships
DonViTrucThuoc.belongsTo(CoQuanDonVi, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'coQuanDonVi',
});
DonViTrucThuoc.hasMany(ChucVu, {
  foreignKey: 'don_vi_truc_thuoc_id',
  as: 'chucVu',
});
DonViTrucThuoc.hasMany(QuanNhan, {
  foreignKey: 'don_vi_truc_thuoc_id',
  as: 'quanNhan',
});
DonViTrucThuoc.hasMany(HoSoDonViHangNam, {
  foreignKey: 'don_vi_truc_thuoc_id',
  as: 'hoSoDonViHangNam',
});
DonViTrucThuoc.hasMany(DanhHieuDonViHangNam, {
  foreignKey: 'don_vi_truc_thuoc_id',
  as: 'danhHieuDonViHangNam',
});
DonViTrucThuoc.hasMany(KhenThuongDotXuat, {
  foreignKey: 'don_vi_truc_thuoc_id',
  as: 'khenThuongDotXuat',
});

// ChucVu relationships
ChucVu.belongsTo(CoQuanDonVi, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'coQuanDonVi',
});
ChucVu.belongsTo(DonViTrucThuoc, {
  foreignKey: 'don_vi_truc_thuoc_id',
  as: 'donViTrucThuoc',
});
ChucVu.hasMany(QuanNhan, { foreignKey: 'chuc_vu_id', as: 'quanNhan' });
ChucVu.hasMany(LichSuChucVu, { foreignKey: 'chuc_vu_id', as: 'lichSuChucVu' });

// QuanNhan relationships
QuanNhan.belongsTo(CoQuanDonVi, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'coQuanDonVi',
});
QuanNhan.belongsTo(DonViTrucThuoc, {
  foreignKey: 'don_vi_truc_thuoc_id',
  as: 'donViTrucThuoc',
});
QuanNhan.belongsTo(ChucVu, { foreignKey: 'chuc_vu_id', as: 'chucVu' });
QuanNhan.hasOne(TaiKhoan, { foreignKey: 'quan_nhan_id', as: 'taiKhoan' });
QuanNhan.hasMany(LichSuChucVu, {
  foreignKey: 'quan_nhan_id',
  as: 'lichSuChucVu',
});
QuanNhan.hasMany(ThanhTichKhoaHoc, {
  foreignKey: 'quan_nhan_id',
  as: 'thanhTichKhoaHoc',
});
QuanNhan.hasMany(DanhHieuHangNam, {
  foreignKey: 'quan_nhan_id',
  as: 'danhHieuHangNam',
});
QuanNhan.hasOne(HoSoNienHan, { foreignKey: 'quan_nhan_id', as: 'hoSoNienHan' });
QuanNhan.hasOne(HoSoCongHien, { foreignKey: 'quan_nhan_id', as: 'hoSoCongHien' });
QuanNhan.hasOne(HoSoHangNam, { foreignKey: 'quan_nhan_id', as: 'hoSoHangNam' });
QuanNhan.hasOne(KhenThuongCongHien, {
  foreignKey: 'quan_nhan_id',
  as: 'khenThuongCongHien',
});
QuanNhan.hasOne(HuanChuongQuanKyQuyetThang, {
  foreignKey: 'quan_nhan_id',
  as: 'huanChuongQuanKyQuyetThang',
});
QuanNhan.hasOne(KyNiemChuongVSNXDQDNDVN, {
  foreignKey: 'quan_nhan_id',
  as: 'kyNiemChuongVSNXDQDNDVN',
});
QuanNhan.hasMany(KhenThuongHCCSVV, {
  foreignKey: 'quan_nhan_id',
  as: 'khenThuongHCCSVV',
});
QuanNhan.hasMany(KhenThuongDotXuat, {
  foreignKey: 'quan_nhan_id',
  as: 'khenThuongDotXuat',
});

// TaiKhoan relationships
TaiKhoan.belongsTo(QuanNhan, { foreignKey: 'quan_nhan_id', as: 'quanNhan' });
TaiKhoan.hasMany(ThongBao, { foreignKey: 'nguoi_nhan_id', as: 'thongBao' });

// LichSuChucVu relationships
LichSuChucVu.belongsTo(QuanNhan, {
  foreignKey: 'quan_nhan_id',
  as: 'quanNhan',
});
LichSuChucVu.belongsTo(ChucVu, { foreignKey: 'chuc_vu_id', as: 'chucVu' });

// ThanhTichKhoaHoc relationships
ThanhTichKhoaHoc.belongsTo(QuanNhan, {
  foreignKey: 'quan_nhan_id',
  as: 'quanNhan',
});

// DanhHieuHangNam relationships
DanhHieuHangNam.belongsTo(QuanNhan, {
  foreignKey: 'quan_nhan_id',
  as: 'quanNhan',
});

// HoSoNienHan relationships
HoSoNienHan.belongsTo(QuanNhan, { foreignKey: 'quan_nhan_id', as: 'quanNhan' });

// HoSoCongHien relationships
HoSoCongHien.belongsTo(QuanNhan, { foreignKey: 'quan_nhan_id', as: 'quanNhan' });

// HoSoHangNam relationships
HoSoHangNam.belongsTo(QuanNhan, { foreignKey: 'quan_nhan_id', as: 'quanNhan' });

// KhenThuongCongHien relationships
KhenThuongCongHien.belongsTo(QuanNhan, {
  foreignKey: 'quan_nhan_id',
  as: 'quanNhan',
});

// HuanChuongQuanKyQuyetThang relationships
HuanChuongQuanKyQuyetThang.belongsTo(QuanNhan, {
  foreignKey: 'quan_nhan_id',
  as: 'quanNhan',
});

// KyNiemChuongVSNXDQDNDVN relationships
KyNiemChuongVSNXDQDNDVN.belongsTo(QuanNhan, {
  foreignKey: 'quan_nhan_id',
  as: 'quanNhan',
});

// KhenThuongHCCSVV relationships
KhenThuongHCCSVV.belongsTo(QuanNhan, {
  foreignKey: 'quan_nhan_id',
  as: 'quanNhan',
});

// KhenThuongDotXuat relationships
KhenThuongDotXuat.belongsTo(QuanNhan, {
  foreignKey: 'quan_nhan_id',
  as: 'quanNhan',
});
KhenThuongDotXuat.belongsTo(CoQuanDonVi, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'coQuanDonVi',
});
KhenThuongDotXuat.belongsTo(DonViTrucThuoc, {
  foreignKey: 'don_vi_truc_thuoc_id',
  as: 'donViTrucThuoc',
});

// ThongBao relationships
ThongBao.belongsTo(TaiKhoan, { foreignKey: 'nguoi_nhan_id', as: 'nguoiNhan' });

// HoSoDonViHangNam relationships (chỉ có quan hệ với đơn vị, không có workflow)
HoSoDonViHangNam.belongsTo(CoQuanDonVi, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'coQuanDonVi',
});
HoSoDonViHangNam.belongsTo(DonViTrucThuoc, {
  foreignKey: 'don_vi_truc_thuoc_id',
  as: 'donViTrucThuoc',
});

// DanhHieuDonViHangNam relationships (có workflow: người tạo, người duyệt)
DanhHieuDonViHangNam.belongsTo(CoQuanDonVi, {
  foreignKey: 'co_quan_don_vi_id',
  as: 'coQuanDonVi',
});
DanhHieuDonViHangNam.belongsTo(DonViTrucThuoc, {
  foreignKey: 'don_vi_truc_thuoc_id',
  as: 'donViTrucThuoc',
});
DanhHieuDonViHangNam.belongsTo(TaiKhoan, {
  foreignKey: 'nguoi_tao_id',
  as: 'nguoiTao',
});
DanhHieuDonViHangNam.belongsTo(TaiKhoan, {
  foreignKey: 'nguoi_duyet_id',
  as: 'nguoiDuyet',
});
TaiKhoan.hasMany(DanhHieuDonViHangNam, {
  foreignKey: 'nguoi_tao_id',
  as: 'danhHieuDonViHangNamTao',
});
TaiKhoan.hasMany(DanhHieuDonViHangNam, {
  foreignKey: 'nguoi_duyet_id',
  as: 'danhHieuDonViHangNamDuyet',
});

// ============================================
// EXPORTS
// ============================================

// Export Prisma
module.exports.prisma = prisma;

// Export Sequelize instance
module.exports.sequelize = sequelize;

// Export Sequelize models
module.exports.CoQuanDonVi = CoQuanDonVi;
module.exports.DonViTrucThuoc = DonViTrucThuoc;
module.exports.ChucVu = ChucVu;
module.exports.QuanNhan = QuanNhan;
module.exports.TaiKhoan = TaiKhoan;
module.exports.LichSuChucVu = LichSuChucVu;
module.exports.ThanhTichKhoaHoc = ThanhTichKhoaHoc;
module.exports.DanhHieuHangNam = DanhHieuHangNam;
module.exports.HoSoNienHan = HoSoNienHan;
module.exports.HoSoCongHien = HoSoCongHien;
module.exports.HoSoHangNam = HoSoHangNam;
module.exports.ThongBao = ThongBao;
module.exports.HoSoDonViHangNam = HoSoDonViHangNam;
module.exports.DanhHieuDonViHangNam = DanhHieuDonViHangNam;
module.exports.KhenThuongCongHien = KhenThuongCongHien;
module.exports.HuanChuongQuanKyQuyetThang = HuanChuongQuanKyQuyetThang;
module.exports.KyNiemChuongVSNXDQDNDVN = KyNiemChuongVSNXDQDNDVN;
module.exports.KhenThuongHCCSVV = KhenThuongHCCSVV;
module.exports.KhenThuongDotXuat = KhenThuongDotXuat;
