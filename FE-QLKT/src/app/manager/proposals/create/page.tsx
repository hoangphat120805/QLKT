"use client";

import { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Upload,
  Form,
  Space,
  Breadcrumb,
  Radio,
  Alert,
  message as antMessage,
} from "antd";
import {
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  HomeOutlined,
  ClearOutlined,
  TrophyOutlined,
  StarOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import type { UploadFile } from "antd/es/upload/interface";
import { apiClient } from "@/lib/api-client";

const { Title, Paragraph, Text } = Typography;

type ProposalType = 'HANG_NAM' | 'NIEN_HAN';

export default function CreateProposalPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [fileExcel, setFileExcel] = useState<UploadFile[]>([]);
  const [proposalType, setProposalType] = useState<ProposalType>('HANG_NAM');

  // Tải file mẫu Excel
  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      const blob = await apiClient.getProposalTemplate(proposalType);

      // Download file
      const typeName = proposalType === 'HANG_NAM' ? 'hang_nam' : 'nien_han';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mau_de_xuat_${typeName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      antMessage.success("Tải file mẫu thành công!");
    } catch (error: any) {
      antMessage.error(error.message || "Lỗi khi tải file mẫu");
    } finally {
      setDownloading(false);
    }
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    // Validation
    if (!fileExcel.length) {
      antMessage.error("Vui lòng chọn file Excel đề xuất");
      return;
    }

    try {
      setLoading(true);

      // Tạo FormData
      const formData = new FormData();
      formData.append("file_excel", fileExcel[0].originFileObj as File);
      formData.append("type", proposalType);

      const result = await apiClient.submitProposal(formData);

      if (!result.success) {
        throw new Error(result.message || "Gửi đề xuất thất bại");
      }

      antMessage.success("Gửi đề xuất thành công! Chờ Admin phê duyệt.");

      // Reset form
      form.resetFields();
      setFileExcel([]);
    } catch (error: any) {
      antMessage.error(error.message || "Lỗi khi gửi đề xuất");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setFileExcel([]);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: <Link href="/manager/dashboard"><HomeOutlined /></Link>,
          },
          {
            title: 'Tạo Phiếu Đề Xuất Khen Thưởng',
          },
        ]}
      />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Tạo Phiếu Đề Xuất Khen Thưởng</Title>
        <Paragraph type="secondary">
          Tải file mẫu, điền đề xuất và nộp lên hệ thống để chờ phê duyệt
        </Paragraph>
      </div>

      {/* Bước 0: Chọn loại đề xuất */}
      <Card
        style={{ marginBottom: 24 }}
        title={
          <Space>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#f0f5ff',
              color: '#1890ff',
              fontWeight: 'bold',
              fontSize: 14,
            }}>
              0
            </div>
            <span>Chọn loại đề xuất khen thưởng</span>
          </Space>
        }
      >
        <Radio.Group
          value={proposalType}
          onChange={(e) => {
            setProposalType(e.target.value);
            // Reset file khi đổi loại đề xuất
            setFileExcel([]);
          }}
          size="large"
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Radio.Button value="HANG_NAM" style={{ width: '100%', height: 'auto', padding: '16px' }}>
              <Space direction="vertical" size="small">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrophyOutlined style={{ fontSize: 20, color: proposalType === 'HANG_NAM' ? '#1890ff' : '#8c8c8c' }} />
                  <Text strong style={{ fontSize: 16 }}>Đề xuất Khen thưởng Hằng năm</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginLeft: 28 }}>
                  Đề xuất danh hiệu CSTDCS, CSTT, BKBQP, CSTDTQ và thành tích khoa học (NCKH, SKKH)
                </Text>
              </Space>
            </Radio.Button>

            <Radio.Button value="NIEN_HAN" style={{ width: '100%', height: 'auto', padding: '16px' }}>
              <Space direction="vertical" size="small">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarOutlined style={{ fontSize: 20, color: proposalType === 'NIEN_HAN' ? '#1890ff' : '#8c8c8c' }} />
                  <Text strong style={{ fontSize: 16 }}>Đề xuất Khen thưởng Niên hạn</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginLeft: 28 }}>
                  Đề xuất Huân chương Chiến sĩ vẻ vang (HCCSVV) và Huân chương Bảo vệ Tổ quốc (HCBVTQ) các hạng
                </Text>
              </Space>
            </Radio.Button>
          </Space>
        </Radio.Group>

        {proposalType === 'HANG_NAM' && (
          <Alert
            style={{ marginTop: 16 }}
            message="Đề xuất hằng năm"
            description="Áp dụng cho khen thưởng theo năm: danh hiệu thi đua, bằng khen, chiến sĩ thi đua toàn quân và thành tích khoa học."
            type="info"
            showIcon
          />
        )}

        {proposalType === 'NIEN_HAN' && (
          <Alert
            style={{ marginTop: 16 }}
            message="Đề xuất niên hạn"
            description="Áp dụng cho khen thưởng theo thâm niên phục vụ: Huân chương Chiến sĩ vẻ vang và Huân chương Bảo vệ Tổ quốc."
            type="info"
            showIcon
          />
        )}
      </Card>

      {/* Bước 1: Tải file mẫu */}
      <Card
        style={{ marginBottom: 24 }}
        title={
          <Space>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#e6f7ff',
              color: '#1890ff',
              fontWeight: 'bold',
              fontSize: 14,
            }}>
              1
            </div>
            <span>Tải file Excel mẫu</span>
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Text type="secondary">
            Tải về file mẫu có sẵn danh sách quân nhân thuộc đơn vị của bạn
          </Text>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            loading={downloading}
            type="default"
          >
            {downloading ? "Đang tải..." : "Tải file Excel mẫu"}
          </Button>
          {proposalType === 'HANG_NAM' ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              File mẫu bao gồm 3 tab: <strong>QuanNhan</strong> (danh sách), <strong>DanhHieuHangNam</strong>, <strong>ThanhTichKhoaHoc</strong>
            </Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              File mẫu bao gồm 2 tab: <strong>QuanNhan</strong> (danh sách + ngày nhập ngũ), <strong>NienHan</strong> (HCCSVV, HCBVTQ)
            </Text>
          )}
        </Space>
      </Card>

      {/* Bước 2: Nộp đề xuất */}
      <Card
        title={
          <Space>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#e6f7ff',
              color: '#1890ff',
              fontWeight: 'bold',
              fontSize: 14,
            }}>
              2
            </div>
            <span>Nộp đề xuất khen thưởng</span>
          </Space>
        }
      >
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Upload file Excel đã điền đề xuất khen thưởng cho các quân nhân trong đơn vị
        </Paragraph>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* File Excel */}
          <Form.Item
            label="File Excel Đề xuất (.xlsx)"
            required
          >
            <Upload
              accept=".xlsx,.xls"
              maxCount={1}
              fileList={fileExcel}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileExcel(fileList)}
              disabled={loading}
            >
              <Button icon={<FileExcelOutlined />} disabled={loading} size="large">
                Chọn file Excel
              </Button>
            </Upload>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              Tải lên file Excel đã điền đề xuất (đánh dấu "X" trong các cột tương ứng)
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
              <strong>Lưu ý:</strong> Số quyết định và file PDF sẽ được Admin bổ sung sau khi phê duyệt
            </Text>
          </Form.Item>

          {/* Submit Buttons */}
          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<UploadOutlined />}
                size="large"
              >
                {loading ? "Đang gửi..." : "Gửi Đề xuất"}
              </Button>
              <Button
                type="default"
                onClick={handleReset}
                disabled={loading}
                icon={<ClearOutlined />}
                size="large"
              >
                Xóa Form
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
