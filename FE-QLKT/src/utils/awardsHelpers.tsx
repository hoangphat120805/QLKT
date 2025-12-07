import { Typography } from 'antd';
import type { CSSProperties } from 'react';

const { Text } = Typography;

// Constants
export const DANH_HIEU_MAP: Record<string, string> = {
  CSTDCS: 'Chiến sĩ thi đua cơ sở',
  CSTT: 'Chiến sĩ tiên tiến',
  BKBQP: 'Bằng khen của Bộ trưởng BQP',
  CSTDTQ: 'Chiến sĩ thi đua toàn quân',
  ĐVQT: 'Đơn vị Quyết thắng',
  ĐVTT: 'Đơn vị Tiên tiến',
  BKTTCP: 'Bằng khen Thủ tướng Chính phủ',
  HCCSVV_HANG_BA: 'Huân chương Chiến sỹ Vẻ vang Hạng Ba',
  HCCSVV_HANG_NHI: 'Huân chương Chiến sỹ Vẻ vang Hạng Nhì',
  HCCSVV_HANG_NHAT: 'Huân chương Chiến sỹ Vẻ vang Hạng Nhất',
  HCBVTQ_HANG_BA: 'Huân chương Bảo vệ Tổ quốc Hạng Ba',
  HCBVTQ_HANG_NHI: 'Huân chương Bảo vệ Tổ quốc Hạng Nhì',
  HCBVTQ_HANG_NHAT: 'Huân chương Bảo vệ Tổ quốc Hạng Nhất',
};

export const COLUMN_STYLES: {
  container: CSSProperties;
  item: CSSProperties;
  decisionText: CSSProperties;
  noteText: CSSProperties;
} = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  item: { marginBottom: '4px' },
  decisionText: { fontSize: '12px', display: 'block', marginTop: '2px' },
  noteText: { fontSize: '11px', fontStyle: 'italic' },
};

// Helper: Render quyết định
export const renderDecision = (soQuyetDinh: string | null | undefined) =>
  soQuyetDinh ? (
    <Text type="secondary" style={COLUMN_STYLES.decisionText}>
      Số QĐ: {soQuyetDinh}
    </Text>
  ) : null;

// Helper: Render danh hiệu item
export const renderAwardItem = (
  key: string,
  title: string,
  soQuyetDinh: string | null | undefined,
  isStrong = false
) => (
  <div key={key} style={COLUMN_STYLES.item}>
    {isStrong ? <Text strong>{title}</Text> : <Text>{title}</Text>}
    {renderDecision(soQuyetDinh)}
  </div>
);

// Helper: Render danh hiệu hằng năm và các bằng khen
export const renderAnnualAwards = (text: string | null, record: any) => {
  const items = [];

  // Danh hiệu hằng năm
  if (text) {
    const fullName = DANH_HIEU_MAP[text] || text;
    items.push(renderAwardItem('danh_hieu', fullName, record.so_quyet_dinh, true));
  }

  // Các bằng khen bổ sung
  const additionalAwards = [
    { key: 'bkbqp', flag: record.nhan_bkbqp, decision: record.so_quyet_dinh_bkbqp, code: 'BKBQP' },
    { key: 'cstdtq', flag: record.nhan_cstdtq, decision: record.so_quyet_dinh_cstdtq, code: 'CSTDTQ' },
    { key: 'bkttcp', flag: record.nhan_bkttcp, decision: record.so_quyet_dinh_bkttcp, code: 'BKTTCP' },
  ];

  additionalAwards.forEach(({ key, flag, decision, code }) => {
    if (flag && decision) {
      items.push(renderAwardItem(key, DANH_HIEU_MAP[code] || code, decision));
    }
  });

  if (items.length === 0) return <Text type="secondary">-</Text>;

  return <div style={COLUMN_STYLES.container}>{items}</div>;
};

// Determine loại khen thưởng based on danh_hieu
export const getLoaiKhenThuong = (danhHieu: string | null): string => {
  if (!danhHieu) return '-';
  if (danhHieu.startsWith('HCBVTQ')) return 'Cống hiến';
  if (danhHieu.startsWith('HCCSVV')) return 'Niên hạn';
  if (['CSTDCS', 'CSTT', 'BKBQP', 'CSTDTQ'].includes(danhHieu)) return 'Cá nhân Hằng năm';
  if (['ĐVQT', 'ĐVTT', 'BKTTCP'].includes(danhHieu)) return 'Đơn vị Hằng năm';
  return '-';
};

