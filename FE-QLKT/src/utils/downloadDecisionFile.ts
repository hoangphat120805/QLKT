import { message } from 'antd';
import { apiClient } from '@/lib/api-client';

/**
 * Helper function để xem trước file quyết định từ số quyết định
 * Mở tab mới với PDF viewer có tên file đúng và nút tải về
 * @param soQuyetDinh - Số quyết định
 */
export async function downloadDecisionFile(soQuyetDinh: string): Promise<void> {
  try {
    message.loading({ content: 'Đang tải file...', key: 'preview' });

    // Gọi API download - backend tự động query DB để lấy file path
    const blob = await apiClient.downloadDecisionFile(soQuyetDinh);
    const filename = `${soQuyetDinh}.pdf`;

    // Tạo blob URL
    const blobUrl = window.URL.createObjectURL(blob);

    message.destroy('preview');

    // Tạo cửa sổ mới với viewer HTML
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #1a1a2e;
            }
            .toolbar {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 50px;
              background: #16213e;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 20px;
              z-index: 1000;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .filename {
              color: #fff;
              font-size: 14px;
              font-weight: 500;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: 60%;
            }
            .btn-group {
              display: flex;
              gap: 8px;
            }
            .btn {
              color: #fff;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 6px;
              transition: background 0.2s;
            }
            .download-btn {
              background: #1890ff;
            }
            .download-btn:hover { background: #40a9ff; }
            .print-btn {
              background: #52c41a;
            }
            .print-btn:hover { background: #73d13d; }
            .pdf-container {
              position: fixed;
              top: 50px;
              left: 0;
              right: 0;
              bottom: 0;
            }
            embed, iframe {
              width: 100%;
              height: 100%;
              border: none;
            }
          </style>
        </head>
        <body>
          <div class="toolbar">
            <span class="filename">📄 ${filename}</span>
            <div class="btn-group">
              <button class="btn print-btn" onclick="window.print()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                In
              </button>
              <button class="btn download-btn" onclick="downloadFile()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Tải về
              </button>
            </div>
          </div>
          <div class="pdf-container">
            <embed src="${blobUrl}" type="application/pdf" />
          </div>
          <script>
            function downloadFile() {
              const link = document.createElement('a');
              link.href = '${blobUrl}';
              link.download = '${filename}';
              link.click();
            }
          </script>
        </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      message.error('Không thể mở cửa sổ mới. Vui lòng cho phép popup.');
    }
  } catch (error: any) {
    console.error('Error previewing decision file:', error);

    // Xử lý lỗi từ blob response (nếu backend trả về JSON error trong blob)
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
