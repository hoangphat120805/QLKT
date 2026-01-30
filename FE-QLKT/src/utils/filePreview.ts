import { message } from 'antd';
import axiosInstance from './axiosInstance';

// Các extension có thể xem trước trong trình duyệt
const PREVIEWABLE_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

/**
 * Kiểm tra file có thể xem trước được không
 */
function isPreviewable(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return PREVIEWABLE_EXTENSIONS.includes(ext);
}

/**
 * Lấy MIME type từ extension
 */
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Tải file về với tên đúng
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Mở file trong tab mới hoặc tải về tùy loại file
 * - PDF/Image: Mở xem trước trong tab mới
 * - DOC/DOCX/khác: Tải về với tên file đúng
 * @param filePath - Đường dẫn file (có thể là full path hoặc chỉ filename)
 * @param customFilename - Tên file tùy chỉnh
 */
export async function previewFile(filePath: string, customFilename?: string): Promise<void> {
  try {
    const filename = customFilename || filePath.split('/').pop() || 'document';

    // Xử lý đường dẫn API
    let apiPath = filePath;
    if (!filePath.startsWith('/api/')) {
      const fileOnly = filePath.split('/').pop();
      apiPath = `/api/proposals/uploads/${fileOnly}`;
    }

    const response = await axiosInstance.get(apiPath, {
      responseType: 'blob',
    });

    const mimeType = getMimeType(filename);
    const blob = new Blob([response.data], { type: mimeType });

    if (isPreviewable(filename)) {
      // File có thể xem trước -> mở trong tab mới
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } else {
      // File không thể xem trước -> tải về
      downloadBlob(blob, filename);
      message.success('Đã tải file');
    }
  } catch (error) {
    message.error('Lỗi khi mở file');
    console.error('Preview error:', error);
  }
}

/**
 * Mở xem trước file quyết định từ số quyết định
 * @param soQuyetDinh - Số quyết định
 */
export async function previewDecisionFile(soQuyetDinh: string): Promise<void> {
  try {
    message.loading({ content: 'Đang tải file...', key: 'preview' });

    const response = await axiosInstance.get(`/api/decisions/download/${encodeURIComponent(soQuyetDinh)}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);

    message.destroy('preview');

    // Mở blob URL trực tiếp
    window.open(blobUrl, '_blank');
  } catch (error: any) {
    console.error('Error previewing decision file:', error);

    if (error?.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        message.error({ content: errorData.message || 'Lỗi khi mở file quyết định', key: 'preview' });
      } catch {
        message.error({ content: 'Lỗi khi mở file quyết định', key: 'preview' });
      }
    } else {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Lỗi khi mở file quyết định';
      message.error({ content: errorMessage, key: 'preview' });
    }
  }
}

/**
 * Mở xem trước hoặc tải file đính kèm với API path tùy chỉnh
 * @param apiPath - Đường dẫn API để lấy file
 * @param filename - Tên file hiển thị
 */
export async function previewFileWithApi(apiPath: string, filename: string): Promise<void> {
  try {
    const response = await axiosInstance.get(apiPath, {
      responseType: 'blob',
    });

    const mimeType = getMimeType(filename);
    const blob = new Blob([response.data], { type: mimeType });

    if (isPreviewable(filename)) {
      // File có thể xem trước -> mở trong tab mới
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } else {
      // File không thể xem trước -> tải về
      downloadBlob(blob, filename);
      message.success('Đã tải file');
    }
  } catch (error) {
    message.error('Lỗi khi mở file');
    console.error('Preview error:', error);
  }
}
