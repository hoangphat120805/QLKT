'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Upload,
  Steps,
  Space,
  Breadcrumb,
  Radio,
  Alert,
  message as antMessage,
  Divider,
  Descriptions,
  Tag,
  Table,
} from 'antd';
import {
  UploadOutlined,
  HomeOutlined,
  TrophyOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { UploadFile } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '@/lib/api-client';
import axiosInstance from '@/utils/axiosInstance';
import Step2SelectPersonnel from './components/Step2SelectPersonnel';
import Step3SetTitles from './components/Step3SetTitles';

const { Title, Paragraph, Text } = Typography;

type ProposalType =
  | 'CA_NHAN_HANG_NAM'
  | 'DON_VI_HANG_NAM'
  | 'NIEN_HAN'
  | 'CONG_HIEN'
  | 'DOT_XUAT'
  | 'NCKH';

interface Personnel {
  id: string;
  ho_ten: string;
  cccd: string;
  CoQuanDonVi?: {
    ten_don_vi: string;
  };
  DonViTrucThuoc?: {
    ten_don_vi: string;
  };
}

export default function CreateProposalPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Proposal Type
  const [proposalType, setProposalType] = useState<ProposalType>('CA_NHAN_HANG_NAM');

  // Step 2: Select Personnel
  const [nam, setNam] = useState(new Date().getFullYear());
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>([]);

  // Step 3: Set Titles
  const [titleData, setTitleData] = useState<any[]>([]);

  // Step 4: Upload Files
  const [attachedFiles, setAttachedFiles] = useState<UploadFile[]>([]); // File đính kèm (optional)

  // Step 5: Personnel details for review
  const [personnelDetails, setPersonnelDetails] = useState<Personnel[]>([]);

  // Proposal type config
  const proposalTypeConfig: Record<
    ProposalType,
    { icon: React.ReactNode; label: string; description: string }
  > = {
    CA_NHAN_HANG_NAM: {
      icon: <TrophyOutlined />,
      label: 'Cá nhân Hằng năm',
      description: 'Danh hiệu CSTT-CS, CSTĐ-CS, BK-BQP, CSTĐ-TQ',
    },
    DON_VI_HANG_NAM: {
      icon: <TeamOutlined />,
      label: 'Đơn vị Hằng năm',
      description: 'ĐVTT, ĐVQT, BK-BQP, BK-TTCP',
    },
    NIEN_HAN: {
      icon: <ClockCircleOutlined />,
      label: 'Niên hạn',
      description: 'HCCSVV các hạng, HC Quân kỳ, Kỷ niệm chương',
    },
    CONG_HIEN: {
      icon: <HeartOutlined />,
      label: 'Cống hiến',
      description: 'HC BVTQ 3 hạng',
    },
    DOT_XUAT: {
      icon: <TrophyOutlined />,
      label: 'Đột xuất',
      description: 'Khen thưởng đột xuất đặc biệt',
    },
    NCKH: {
      icon: <ExperimentOutlined />,
      label: 'ĐTKH/SKKH',
      description: 'Nghiên cứu khoa học / Sáng kiến khoa học',
    },
  };

  // Steps config
  const steps = [
    { title: 'Chọn loại', icon: <TrophyOutlined /> },
    { title: 'Chọn quân nhân', icon: <TeamOutlined /> },
    { title: 'Set danh hiệu', icon: <CheckCircleOutlined /> },
    { title: 'Upload file', icon: <UploadOutlined /> },
    { title: 'Xem lại & Gửi', icon: <CheckCircleOutlined /> },
  ];

  // Fetch personnel details when reaching Step 5 (Review)
  useEffect(() => {
    if (currentStep === 4 && selectedPersonnelIds.length > 0) {
      fetchPersonnelDetails();
    }
  }, [currentStep]);

  const fetchPersonnelDetails = async () => {
    try {
      const promises = selectedPersonnelIds.map(id => axiosInstance.get(`/api/personnel/${id}`));
      const responses = await Promise.all(promises);
      const personnelData = responses.filter(r => r.data.success).map(r => r.data.data);
      setPersonnelDetails(personnelData);
    } catch (error) {
      console.error('Error fetching personnel details:', error);
    }
  };

  // Validate current step
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: // Step 1: Type selected (always true)
        return true;
      case 1: // Step 2: Must select at least 1 personnel
        return selectedPersonnelIds.length > 0;
      case 2: // Step 3: All personnel must have titles set
        return (
          titleData.length === selectedPersonnelIds.length &&
          titleData.every(d => {
            if (proposalType === 'NCKH') {
              return d.loai && d.mo_ta;
            } else {
              return d.danh_hieu;
            }
          })
        );
      case 3: // Step 4: Always allow to continue (attachedFiles is optional)
        return true;
      default:
        return false;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (canProceedToNextStep()) {
      setCurrentStep(currentStep + 1);
    } else {
      switch (currentStep) {
        case 1:
          antMessage.warning('Vui lòng chọn ít nhất một quân nhân!');
          break;
        case 2:
          antMessage.warning('Vui lòng chọn danh hiệu cho tất cả quân nhân!');
          break;
        case 3:
          antMessage.warning('Vui lòng upload file đính kèm!');
          break;
      }
    }
  };

  // Handle previous step
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Tạo FormData
      const formData = new FormData();
      formData.append('type', proposalType);
      formData.append('nam', String(nam));
      formData.append('selected_personnel', JSON.stringify(selectedPersonnelIds));
      formData.append('title_data', JSON.stringify(titleData));

      // Upload các file đính kèm (optional, multiple)
      if (attachedFiles.length > 0) {
        attachedFiles.forEach(file => {
          if (file.originFileObj) {
            formData.append('attached_files', file.originFileObj as File);
          }
        });
      }

      const result = await apiClient.submitProposal(formData);

      if (!result.success) {
        throw new Error(result.message || 'Gửi đề xuất thất bại');
      }

      antMessage.success('Gửi đề xuất thành công! Chờ Admin phê duyệt.');

      // Reset form
      setCurrentStep(0);
      setProposalType('CA_NHAN_HANG_NAM');
      setSelectedPersonnelIds([]);
      setTitleData([]);
      setAttachedFiles([]);
    } catch (error: any) {
      antMessage.error(error.message || 'Lỗi khi gửi đề xuất');
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Step 1: Choose Type
        return (
          <div>
            <Alert
              message="Bước 1: Chọn loại khen thưởng"
              description="Vui lòng chọn loại khen thưởng bạn muốn đề xuất"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Radio.Group
              value={proposalType}
              onChange={e => setProposalType(e.target.value)}
              size="large"
              style={{ width: '100%' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {Object.entries(proposalTypeConfig).map(([key, config]) => (
                  <Radio.Button
                    key={key}
                    value={key}
                    style={{ width: '100%', height: 'auto', padding: '16px' }}
                  >
                    <Space direction="vertical" size="small">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {React.cloneElement(config.icon as React.ReactElement, {
                          style: {
                            fontSize: 20,
                            color: proposalType === key ? '#1890ff' : '#8c8c8c',
                          },
                        })}
                        <Text strong style={{ fontSize: 16 }}>
                          {config.label}
                        </Text>
                      </div>
                      <Text
                        type="secondary"
                        style={{ fontSize: 13, display: 'block', marginLeft: 28 }}
                      >
                        {config.description}
                      </Text>
                    </Space>
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>
          </div>
        );

      case 1: // Step 2: Select Personnel
        return (
          <Step2SelectPersonnel
            selectedPersonnelIds={selectedPersonnelIds}
            onPersonnelChange={setSelectedPersonnelIds}
            nam={nam}
            onNamChange={setNam}
          />
        );

      case 2: // Step 3: Set Titles
        return (
          <Step3SetTitles
            selectedPersonnelIds={selectedPersonnelIds}
            proposalType={proposalType}
            titleData={titleData}
            onTitleDataChange={setTitleData}
          />
        );

      case 3: // Step 4: Upload Files
        return (
          <div>
            <Alert
              message="Bước 4: Upload file đính kèm"
              description="Upload các file đính kèm liên quan (tùy chọn, không giới hạn số lượng)"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            {/* Upload file đính kèm */}
            <Upload.Dragger
              fileList={attachedFiles}
              onChange={({ fileList }) => setAttachedFiles(fileList)}
              beforeUpload={() => false}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">Click hoặc kéo file vào đây để upload</p>
              <p className="ant-upload-hint">
                Hỗ trợ: PDF, Word (.doc, .docx), Excel (.xls, .xlsx). Có thể chọn nhiều file cùng
                lúc, không giới hạn số lượng.
              </p>
            </Upload.Dragger>
          </div>
        );

      case 4: // Step 5: Review & Submit
        // Merge personnel details with title data
        const reviewTableData = personnelDetails.map(p => {
          const titleInfo = titleData.find(t => t.personnel_id === p.id);
          return {
            ...p,
            ...titleInfo,
          };
        });

        // Build table columns based on proposal type
        const reviewColumns: ColumnsType<any> = [
          {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1,
          },
          {
            title: 'Họ và tên',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
            width: 180,
            render: (text: string) => <Text strong>{text}</Text>,
          },
          {
            title: 'CCCD',
            dataIndex: 'cccd',
            key: 'cccd',
            width: 140,
            render: (text: string) => <Text code>{text}</Text>,
          },
          {
            title: 'Cơ quan đơn vị',
            key: 'co_quan_don_vi',
            width: 150,
            render: (_, record) => record.CoQuanDonVi?.ten_don_vi || '-',
          },
          {
            title: 'Đơn vị trực thuộc',
            key: 'don_vi_truc_thuoc',
            width: 150,
            render: (_, record) => record.DonViTrucThuoc?.ten_don_vi || '-',
          },
        ];

        // Add title/achievement columns based on type
        if (proposalType === 'NCKH') {
          reviewColumns.push(
            {
              title: 'Loại',
              dataIndex: 'loai',
              key: 'loai',
              width: 160,
              render: (loai: string) => (
                <Tag color={loai === 'NCKH' ? 'blue' : 'green'}>
                  {loai === 'NCKH' ? 'Đề tài khoa học' : 'Sáng kiến khoa học'}
                </Tag>
              ),
            },
            {
              title: 'Mô tả',
              dataIndex: 'mo_ta',
              key: 'mo_ta',
              ellipsis: true,
            }
          );
        } else {
          reviewColumns.push({
            title: 'Danh hiệu đề xuất',
            dataIndex: 'danh_hieu',
            key: 'danh_hieu',
            width: 200,
            render: (danh_hieu: string) => <Tag color="green">{danh_hieu}</Tag>,
          });
        }

        return (
          <div>
            <Alert
              message="Bước 5: Xem lại thông tin và gửi đề xuất"
              description="Kiểm tra kỹ thông tin trước khi gửi"
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card title="Tóm tắt đề xuất" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Loại khen thưởng" span={2}>
                  <Tag color="blue" icon={proposalTypeConfig[proposalType].icon}>
                    {proposalTypeConfig[proposalType].label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Năm đề xuất">
                  <Text strong>{nam}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số quân nhân">
                  <Text strong style={{ color: '#1890ff' }}>
                    {selectedPersonnelIds.length}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="File đính kèm" span={2}>
                  {attachedFiles.length > 0 ? (
                    <Text strong style={{ color: '#52c41a' }}>
                      {attachedFiles.length} file
                    </Text>
                  ) : (
                    <Text type="secondary">Không có file</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Danh sách cán bộ và danh hiệu">
              <Table
                columns={reviewColumns}
                dataSource={reviewTableData}
                rowKey="id"
                pagination={false}
                size="small"
                bordered
                scroll={{ x: proposalType === 'NCKH' ? 1100 : 1000 }}
                locale={{
                  emptyText: 'Không có dữ liệu',
                }}
              />
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: (
              <Link href="/manager/dashboard">
                <HomeOutlined />
              </Link>
            ),
          },
          {
            title: 'Tạo Danh Sách Đề Xuất Khen Thưởng',
          },
        ]}
      />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Tạo Danh Sách Đề Xuất Khen Thưởng</Title>
        <Paragraph type="secondary">
          Theo dõi các bước bên dưới để hoàn thành đề xuất khen thưởng
        </Paragraph>
      </div>

      {/* Steps Progress */}
      <Card style={{ marginBottom: 24 }}>
        <Steps current={currentStep} items={steps} />
      </Card>

      {/* Step Content */}
      <Card style={{ marginBottom: 24, minHeight: 400 }}>{renderStepContent()}</Card>

      {/* Navigation */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button size="large" onClick={handlePrev} disabled={currentStep === 0}>
            Quay lại
          </Button>
          <div>
            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                disabled={!canProceedToNextStep()}
              >
                Tiếp tục
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                loading={loading}
                icon={<CheckCircleOutlined />}
              >
                Gửi đề xuất
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
