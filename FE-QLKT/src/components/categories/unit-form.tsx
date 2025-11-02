"use client"

import { useState, useEffect } from "react"
import { Form, Input, Button, Space, message } from "antd"
import { apiClient } from "@/lib/api-client"

interface UnitFormProps {
  unit?: any
  onSuccess?: () => void
  onClose?: () => void
}

export function UnitForm({ unit, onSuccess, onClose }: UnitFormProps) {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (unit) {
      form.setFieldsValue({
        ma_don_vi: unit.ma_don_vi || "",
        ten_don_vi: unit.ten_don_vi || "",
      })
    }
  }, [unit, form])

  async function onSubmit(values: any) {
    try {
      setLoading(true)
      let res
      if (unit?.id) {
        res = await apiClient.updateUnit(unit.id.toString(), values)
      } else {
        res = await apiClient.createUnit(values)
      }

      if (res.success) {
        message.success(unit?.id ? "Cập nhật đơn vị thành công" : "Tạo đơn vị thành công")
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
        label="Mã Đơn vị"
        name="ma_don_vi"
        rules={[{ required: true, message: 'Vui lòng nhập mã đơn vị' }]}
      >
        <Input placeholder="Nhập mã đơn vị" />
      </Form.Item>

      <Form.Item
        label="Tên Đơn vị"
        name="ten_don_vi"
        rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị' }]}
      >
        <Input placeholder="Nhập tên đơn vị" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {unit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
