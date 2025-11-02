"use client"

import { useState } from "react"
import { Table, Button, Space, Popconfirm, message } from "antd"
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { apiClient } from "@/lib/api-client"

interface ContributionGroupsTableProps {
  groups: any[]
  onEdit?: (group: any) => void
  onRefresh?: () => void
}

export function ContributionGroupsTable({ groups, onEdit, onRefresh }: ContributionGroupsTableProps) {
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setLoading(true)
      setDeletingId(id)
      await apiClient.deleteContributionGroup(id)
      message.success("Xóa nhóm thành công")
      onRefresh?.()
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa")
    } finally {
      setLoading(false)
      setDeletingId(null)
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: 'Tên Nhóm',
      dataIndex: 'ten_nhom',
      key: 'ten_nhom',
      width: 250,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'mo_ta',
      key: 'mo_ta',
      render: (text) => text || '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: deletingId === record.id }}
          >
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              loading={deletingId === record.id}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={groups}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Tổng số ${total} nhóm`,
      }}
      locale={{
        emptyText: 'Không có dữ liệu',
      }}
    />
  )
}
