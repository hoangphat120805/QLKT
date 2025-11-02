"use client"

import { useState } from "react"
import { Table, Button, Space, Popconfirm, message } from "antd"
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { apiClient } from "@/lib/api-client"

interface UnitsTableProps {
  units: any[]
  onEdit?: (unit: any) => void
  onRefresh?: () => void
}

export function UnitsTable({ units, onEdit, onRefresh }: UnitsTableProps) {
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setLoading(true)
      setDeletingId(id)
      await apiClient.deleteUnit(id)
      message.success("Xóa đơn vị thành công")
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
      title: 'Mã Đơn vị',
      dataIndex: 'ma_don_vi',
      key: 'ma_don_vi',
      width: 150,
      align: 'center',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Tên Đơn vị',
      dataIndex: 'ten_don_vi',
      key: 'ten_don_vi',
      width: 300,
      align: 'left',
    },
    {
      title: 'Quân số',
      dataIndex: 'so_luong',
      key: 'so_luong',
      width: 120,
      align: 'center',
      render: (val) => val ?? 0,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      align: 'center',
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
            description="Bạn có chắc chắn muốn xóa đơn vị này? Hành động này không thể hoàn tác."
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
      dataSource={units}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Tổng số ${total} đơn vị`,
      }}
      locale={{
        emptyText: 'Không có dữ liệu',
      }}
    />
  )
}
