"use client"

import { useState, useEffect } from "react"
import { Form, Input, Button, Space, message } from "antd"
import { apiClient } from "@/lib/api-client"

const { TextArea } = Input

interface ContributionGroupFormProps {
  group?: any
  onSuccess?: () => void
  onClose?: () => void
}

export function ContributionGroupForm({ group, onSuccess, onClose }: ContributionGroupFormProps) {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (group) {
      form.setFieldsValue({
        ten_nhom: group.ten_nhom || "",
        mo_ta: group.mo_ta || "",
      })
    }
  }, [group, form])

  async function onSubmit(values: any) {
    try {
      setLoading(true)
      let res
      if (group?.id) {
        res = await apiClient.updateContributionGroup(group.id, values)
      } else {
        res = await apiClient.createContributionGroup(values)
      }

      if (res.success) {
        message.success(group?.id ? "Cập nhật nhóm thành công" : "Tạo nhóm thành công")
        onSuccess?.()
        onClose?.()
      } else {
        message.error(res.message || "Có lỗi xảy ra")
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || "Có lỗi xảy ra"
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      autoComplete="off"
    >
      <Form.Item
        label="Tên Nhóm"
        name="ten_nhom"
        rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}
      >
        <Input placeholder="Nhập tên nhóm" />
      </Form.Item>

      <Form.Item
        label="Mô tả"
        name="mo_ta"
      >
        <TextArea
          placeholder="Nhập mô tả"
          rows={4}
          autoSize={{ minRows: 4, maxRows: 8 }}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {group ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
