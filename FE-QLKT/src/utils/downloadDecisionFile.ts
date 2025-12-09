import { message } from 'antd';
import { apiClient } from '@/lib/api-client';

/**
 * Helper function để tải file quyết định từ số quyết định
 * Backend tự động query DB để lấy file path và trả về file để download
 * @param soQuyetDinh - Số quyết định
 */
export async function downloadDecisionFile(soQuyetDinh: string): Promise<void> {
  try {
    message.loading({ content: 'Đang tải file...', key: 'download' });

    // Gọi API download - backend tự động query DB để lấy file path
    const blob = await apiClient.downloadDecisionFile(soQuyetDinh);

    // Lấy filename từ Content-Disposition header hoặc dùng số quyết định
    const filename = `${soQuyetDinh}.pdf`;

    // Tạo link download và trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    message.success({ content: 'Tải file thành công', key: 'download' });
  } catch (error: any) {
    console.error('Error downloading decision file:', error);
    
    // Xử lý lỗi từ blob response (nếu backend trả về JSON error trong blob)
    if (error?.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        message.error({ content: errorData.message || 'Lỗi khi tải file quyết định', key: 'download' });
      } catch {
        message.error({ content: 'Lỗi khi tải file quyết định', key: 'download' });
      }
    } else {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Lỗi khi tải file quyết định';
      message.error({ content: errorMessage, key: 'download' });
    }
  }
}

