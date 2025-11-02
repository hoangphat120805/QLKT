"use client"

import { useState, useEffect } from "react"
import { Form, Input, Button, Space, Select, Checkbox, message } from "antd"
import { apiClient } from "@/lib/api-client"

interface PositionFormProps {
  position?: any
  contributionGroups?: any[]
  units?: any[]
  onSuccess?: () => void
  onClose?: () => void
}

export function PositionForm({ position, contributionGroups = [], units = [], onSuccess, onClose }: PositionFormProps) {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (position) {
      form.setFieldsValue({
        don_vi_id: position.don_vi_id?.toString() || undefined,
        ten_chuc_vu: position.ten_chuc_vu || "",
        is_manager: position.is_manager || false,
        nhom_cong_hien_id: position.nhom_cong_hien_id?.toString() || undefined,
      })
    }
  }, [position, form])

  async function onSubmit(values: any) {
    try {
      setLoading(true)

      // Validate don_vi_id when creating new position
      if (!position?.id && !values.don_vi_id) {
        message.error("Vui lòng chọn đơn vị")
        return
      }

      // Prepare payload
      const payload: any = {
        ten_chuc_vu: values.ten_chuc_vu,
        is_manager: values.is_manager || false,
      }

      // Add optional fields
      if (values.nhom_cong_hien_id) {
        payload.nhom_cong_hien_id = parseInt(values.nhom_cong_hien_id)
      }

      // Add unit_id only when creating
      if (!position?.id && values.don_vi_id) {
        payload.unit_id = parseInt(values.don_vi_id)
      }

      let res
      if (position?.id) {
        res = await apiClient.updatePosition(position.id.toString(), payload)
      } else {
        res = await apiClient.createPosition(payload)
      }

      if (res.success) {
        message.success(position?.id ? "Cập nhật chức vụ thành công" : "Tạo chức vụ thành công")
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
        label="Tên Chức vụ"
        name="ten_chuc_vu"
        rules={[{ required: true, message: 'Vui lòng nhập tên chức vụ' }]}
      >
        <Input placeholder="Nhập tên chức vụ" />
      </Form.Item>

      {!position?.id && (
        <Form.Item
          label={
            <span>
              Đơn vị <span style={{ color: 'red' }}>*</span>
            </span>
          }
          name="don_vi_id"
          rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
        >
          <Select placeholder="Chọn đơn vị">
            {units.map((unit) => (
              <Select.Option key={unit.id} value={unit.id.toString()}>
                {unit.ten_don_vi}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}

      <Form.Item
        label="Nhóm Cống hiến"
        name="nhom_cong_hien_id"
      >
        <Select placeholder="Chọn nhóm cống hiến" allowClear>
          {contributionGroups.map((group) => (
            <Select.Option key={group.id} value={group.id.toString()}>
              {group.ten_nhom}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="is_manager"
        valuePropName="checked"
      >
        <Checkbox>Là Chỉ huy?</Checkbox>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {position ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
