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

// Helper: Render quyết định (có thể click để tải file)
export const renderDecision = (
  soQuyetDinh: string | null | undefined,
  onDownload?: (soQuyetDinh: string, filePath?: string | null) => void,
  filePath?: string | null
) =>
  soQuyetDinh ? (
    onDownload ? (
      <a
        onClick={e => {
          e.stopPropagation();
          onDownload(soQuyetDinh, filePath);
        }}
        style={{ ...COLUMN_STYLES.decisionText, cursor: 'pointer', color: '#1890ff' }}
      >
        Số QĐ: {soQuyetDinh}
      </a>
    ) : (
      <Text type="secondary" style={COLUMN_STYLES.decisionText}>
        Số QĐ: {soQuyetDinh}
      </Text>
    )
  ) : null;

// Helper: Render danh hiệu item
export const renderAwardItem = (
  key: string,
  title: string,
  soQuyetDinh: string | null | undefined,
  isStrong = false,
  onDownload?: (soQuyetDinh: string, filePath?: string | null) => void,
  filePath?: string | null
) => (
  <div key={key} style={COLUMN_STYLES.item}>
    {isStrong ? <Text strong>{title}</Text> : <Text>{title}</Text>}
    {renderDecision(soQuyetDinh, onDownload, filePath)}
  </div>
);

export interface RenderAnnualAwardsOptions {
  onDownload?: (soQuyetDinh: string, filePath?: string | null) => void;
}

// Helper: Render danh hiệu hằng năm và các bằng khen
export const renderAnnualAwards = (
  text: string | null,
  record: any,
  options?: RenderAnnualAwardsOptions
) => {
  const items = [];
  const onDownload = options?.onDownload;

  // Danh hiệu hằng năm
  if (text) {
    const fullName = DANH_HIEU_MAP[text] || text;
    items.push(
      renderAwardItem(
        'danh_hieu',
        fullName,
        record.so_quyet_dinh,
        true,
        onDownload,
        record.file_quyet_dinh
      )
    );
  }

  // Các bằng khen bổ sung
  const additionalAwards = [
    {
      key: 'bkbqp',
      flag: record.nhan_bkbqp,
      decision: record.so_quyet_dinh_bkbqp,
      code: 'BKBQP',
      filePath: record.file_quyet_dinh_bkbqp,
    },
    {
      key: 'cstdtq',
      flag: record.nhan_cstdtq,
      decision: record.so_quyet_dinh_cstdtq,
      code: 'CSTDTQ',
      filePath: record.file_quyet_dinh_cstdtq,
    },
    {
      key: 'bkttcp',
      flag: record.nhan_bkttcp,
      decision: record.so_quyet_dinh_bkttcp,
      code: 'BKTTCP',
      filePath: record.file_quyet_dinh_bkttcp,
    },
  ];

  additionalAwards.forEach(({ key, flag, decision, code, filePath }) => {
    if (flag && decision) {
      items.push(
        renderAwardItem(key, DANH_HIEU_MAP[code] || code, decision, false, onDownload, filePath)
      );
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

