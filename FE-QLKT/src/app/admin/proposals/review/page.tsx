"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Tabs, Table, Button, Badge, Typography, Breadcrumb, Space, Spin, Empty } from "antd";
import { HomeOutlined, EyeOutlined, ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, LoadingOutlined } from "@ant-design/icons";
import { format } from "date-fns";

const { Title, Paragraph } = Typography;

interface Proposal {
  id: number;
  don_vi: string;
  nguoi_de_xuat: string;
  status: string;
  so_danh_hieu: number;
  so_thanh_tich: number;
  nguoi_duyet: string | null;
  ngay_duyet: string | null;
  ghi_chu: string | null;
  createdAt: string;
}

export default function ProposalReviewPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch("http://localhost:4000/api/proposals?page=1&limit=100", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProposals(data.data.proposals || []);
      } else {
        console.error("Fetch proposals error:", data.message);
      }
    } catch (error) {
      console.error("Fetch proposals error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === "pending") return p.status === "PENDING";
    if (activeTab === "approved") return p.status === "APPROVED";
    return true;
  });

  const getStatusBadge = (status: string) => {
    if (status === "PENDING") {
      return (
        <Badge color="gold" count={<ClockCircleOutlined style={{ color: "#faad14" }} />}>
          <span>Đang chờ</span>
        </Badge>
      );
    }
    if (status === "APPROVED") {
      return (
        <Badge color="green" count={<CheckCircleOutlined style={{ color: "#52c41a" }} />}>
          <span>Đã duyệt</span>
        </Badge>
      );
    }
    return (
      <Badge color="red" count={<WarningOutlined style={{ color: "#ff4d4f" }} />}>
        <span>Từ chối</span>
      </Badge>
    );
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id: number) => `#${id}`,
    },
    {
      title: "Đơn vị",
      dataIndex: "don_vi",
      key: "don_vi",
    },
    {
      title: "Người đề xuất",
      dataIndex: "nguoi_de_xuat",
      key: "nguoi_de_xuat",
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => format(new Date(date), "dd/MM/yyyy HH:mm"),
    },
    {
      title: "Danh hiệu",
      dataIndex: "so_danh_hieu",
      key: "so_danh_hieu",
      align: "center" as const,
      render: (count: number) => <Badge count={count} showZero color="blue" />,
    },
    {
      title: "Thành tích",
      dataIndex: "so_thanh_tich",
      key: "so_thanh_tich",
      align: "center" as const,
      render: (count: number) => <Badge count={count} showZero color="blue" />,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: "Hành động",
      key: "action",
      align: "right" as const,
      render: (_: any, record: Proposal) => (
        <Button
          type="default"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/admin/proposals/review/${record.id}`)}
        >
          {record.status === "PENDING" ? "Xem và Duyệt" : "Xem Chi Tiết"}
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: "pending",
      label: (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          Đang chờ ({proposals.filter((p) => p.status === "PENDING").length})
        </span>
      ),
    },
    {
      key: "approved",
      label: (
        <span>
          <CheckCircleOutlined style={{ marginRight: 8 }} />
          Đã duyệt ({proposals.filter((p) => p.status === "APPROVED").length})
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Breadcrumb style={{ marginBottom: "16px" }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>Admin</Breadcrumb.Item>
        <Breadcrumb.Item>Duyệt Đề Xuất</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Duyệt Đề Xuất Khen Thưởng</Title>
        <Paragraph>
          Xem và phê duyệt các đề xuất khen thưởng từ các đơn vị
        </Paragraph>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems.map((item) => ({
          ...item,
          children: (
            <Card
              title={activeTab === "pending" ? "Đề xuất đang chờ phê duyệt" : "Đề xuất đã được phê duyệt"}
              extra={
                <Paragraph style={{ margin: 0, color: "#666" }}>
                  {activeTab === "pending"
                    ? "Nhấn 'Xem và Duyệt' để kiểm tra và phê duyệt đề xuất"
                    : "Danh sách các đề xuất đã được phê duyệt và import vào hệ thống"}
                </Paragraph>
              }
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                  <div style={{ marginTop: "12px", color: "#666" }}>Đang tải...</div>
                </div>
              ) : filteredProposals.length === 0 ? (
                <Empty
                  image={<WarningOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />}
                  description={
                    <div>
                      <div style={{ fontWeight: 500 }}>Không có đề xuất nào</div>
                      <div style={{ fontSize: "14px", marginTop: "4px" }}>
                        {activeTab === "pending" ? "Chưa có đề xuất chờ phê duyệt" : "Chưa có đề xuất nào được phê duyệt"}
                      </div>
                    </div>
                  }
                />
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredProposals}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              )}
            </Card>
          ),
        }))}
      />
    </div>
  );
}
