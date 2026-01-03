'use client';

import { useState, useEffect } from 'react';
import { Card, Input, DatePicker, Select, Button, Typography, Spin } from 'antd';
import { SearchOutlined, ClearOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import type { SelectProps } from 'antd';
import { apiClient } from '@/lib/api-client';

dayjs.locale('vi');

const { Text } = Typography;

interface LogsFilterProps {
  onFilterChange: (filters: any) => void;
}

// Mapping cho vai trò tiếng Việt
const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Quản trị viên cấp cao',
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  USER: 'Người dùng',
};

// Mapping cho actions tiếng Việt
const actionLabels: Record<string, string> = {
  CREATE: 'Tạo',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  APPROVE: 'Phê duyệt',
  REJECT: 'Từ chối',
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  RESET_PASSWORD: 'Đặt lại mật khẩu',
  CHANGE_PASSWORD: 'Đổi mật khẩu',
  IMPORT: 'Import',
  EXPORT: 'Xuất dữ liệu',
  BULK: 'Thêm đồng loạt',
  VIEW: 'Xem',
  SEARCH: 'Tìm kiếm',
  DOWNLOAD: 'Tải xuống',
  UPLOAD: 'Tải lên',
};

// Helper function để map action với format khác nhau
const getActionLabel = (action: string): string => {
  if (!action) return action;
  
  // Nếu action có format như "CREATE_PERSONNEL", chỉ lấy phần đầu
  const baseAction = action.split('_')[0];
  
  // Thử tìm label cho base action
  if (actionLabels[baseAction]) {
    return actionLabels[baseAction];
  }
  
  // Nếu không tìm thấy, thử tìm cho toàn bộ action
  if (actionLabels[action]) {
    return actionLabels[action];
  }
  
  // Nếu vẫn không có, format lại action
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Mapping cho resources tiếng Việt
const resourceLabels: Record<string, string> = {
  accounts: 'Tài khoản',
  personnel: 'Quân nhân',
  units: 'Đơn vị',
  positions: 'Chức vụ',
  proposals: 'Đề xuất',
  'annual-rewards': 'Danh hiệu hằng năm',
  'annual_rewards': 'Danh hiệu hằng năm',
  'position-history': 'Lịch sử chức vụ',
  'position_history': 'Lịch sử chức vụ',
  'scientific-achievements': 'Thành tích khoa học',
  'scientific_achievements': 'Thành tích khoa học',
  decisions: 'Quyết định',
  auth: 'Xác thực',
  'adhoc-awards': 'Khen thưởng đột xuất',
  'adhoc_awards': 'Khen thưởng đột xuất',
  'commemorative-medals': 'Kỷ niệm chương',
  'commemorative_medals': 'Kỷ niệm chương',
  'contribution-awards': 'Khen thưởng cống hiến',
  'contribution_awards': 'Khen thưởng cống hiến',
  'military-flag': 'Cờ thi đua',
  'military_flag': 'Cờ thi đua',
  'service-rewards': 'Khen thưởng niên hạn',
  'service_rewards': 'Khen thưởng niên hạn',
  'unit-annual-awards': 'Khen thưởng đơn vị hằng năm',
  'unit_annual_awards': 'Khen thưởng đơn vị hằng năm',
  'hccsvv': 'Huy chương Chiến sĩ Vẻ vang',
  categories: 'Danh mục',
  dashboard: 'Bảng điều khiển',
  'system-logs': 'Nhật ký hệ thống',
  'system_logs': 'Nhật ký hệ thống',
};

// Helper function để map resource với format khác nhau
const getResourceLabel = (resource: string): string => {
  if (!resource) return resource;
  
  // Thử tìm label trực tiếp
  if (resourceLabels[resource]) {
    return resourceLabels[resource];
  }
  
  // Thử với format khác (dash vs underscore)
  const normalized = resource.replace(/_/g, '-');
  if (resourceLabels[normalized]) {
    return resourceLabels[normalized];
  }
  
  const normalized2 = resource.replace(/-/g, '_');
  if (resourceLabels[normalized2]) {
    return resourceLabels[normalized2];
  }
  
  // Nếu không tìm thấy, format lại resource
  return resource
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export function LogsFilter({ onFilterChange }: LogsFilterProps) {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [actorRole, setActorRole] = useState<string | undefined>();
  const [actions, setActions] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const [action, setAction] = useState<string | undefined>();
  const [resource, setResource] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  // Fetch actions and resources from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        const [actionsRes, resourcesRes] = await Promise.all([
          apiClient.getSystemLogActions(),
          apiClient.getSystemLogResources(),
        ]);

        if (actionsRes.success && Array.isArray(actionsRes.data)) {
          // Loại bỏ null/undefined và trùng lặp, sắp xếp
          const uniqueActions = Array.from(
            new Set(actionsRes.data.filter((a): a is string => Boolean(a)))
          ).sort();
          setActions(uniqueActions);
        } else {
          console.warn('Invalid actions response:', actionsRes);
          // Fallback to default values
          setActions(['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT']);
        }

        if (resourcesRes.success && Array.isArray(resourcesRes.data)) {
          // Loại bỏ null/undefined và trùng lặp, sắp xếp
          const uniqueResources = Array.from(
            new Set(resourcesRes.data.filter((r): r is string => Boolean(r)))
          ).sort();
          setResources(uniqueResources);
        } else {
          console.warn('Invalid resources response:', resourcesRes);
          // Fallback to default values
          setResources(['accounts', 'personnel', 'units', 'positions', 'proposals', 'annual-rewards']);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
        // Fallback to default values
        setActions(['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT']);
        setResources(['accounts', 'personnel', 'units', 'positions', 'proposals', 'annual-rewards']);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Sync filter changes to parent component
  useEffect(() => {
    // Debounce search - only delay if there's search text
    const timeout = setTimeout(() => {
      onFilterChange({
        search: search.trim() || undefined,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        actorRole,
        action,
        resource,
      });
    }, search ? 300 : 0); // No delay if clearing search

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, startDate, endDate, actorRole, action, resource]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleStartDateChange = (date: Dayjs | null) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    setEndDate(date);
  };

  const handleRoleChange = (value: string) => {
    const role = value === 'ALL' ? undefined : value;
    setActorRole(role);
  };

  const handleActionChange = (value: string) => {
    const a = value === 'ALL' ? undefined : value;
    setAction(a);
  };

  const handleResourceChange = (value: string) => {
    const r = value === 'ALL' ? undefined : value;
    setResource(r);
  };

  const handleReset = () => {
    setSearch('');
    setStartDate(null);
    setEndDate(null);
    setActorRole(undefined);
    setAction(undefined);
    setResource(undefined);
    // useEffect will handle the filter change automatically
  };

  const hasActiveFilters = search || startDate || endDate || actorRole || action || resource;

  const disabledStartDate = (current: Dayjs) => {
    if (!endDate) return false;
    return current && current > endDate;
  };

  const disabledEndDate = (current: Dayjs) => {
    if (!startDate) return false;
    return current && current < startDate;
  };

  const roleOptions: SelectProps['options'] = [
    { label: 'Tất cả', value: 'ALL' },
    { label: roleLabels.SUPER_ADMIN || 'SUPER_ADMIN', value: 'SUPER_ADMIN' },
    { label: roleLabels.ADMIN || 'ADMIN', value: 'ADMIN' },
    { label: roleLabels.MANAGER || 'MANAGER', value: 'MANAGER' },
    { label: roleLabels.USER || 'USER', value: 'USER' },
  ];

  const actionOptions: SelectProps['options'] = [
    { label: 'Tất cả', value: 'ALL' },
    ...actions.map(a => ({
      label: getActionLabel(a),
      value: a,
    })),
  ];

  const resourceOptions: SelectProps['options'] = [
    { label: 'Tất cả', value: 'ALL' },
    ...resources.map(r => ({
      label: getResourceLabel(r),
      value: r,
    })),
  ];

  return (
    <Card className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Hàng 1: Tìm kiếm và Bộ lọc ngày */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Search Input */}
            <div className="md:col-span-2 lg:col-span-1">
              <Text className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                Tìm kiếm
              </Text>
              <Input
                placeholder="Tìm kiếm theo hành động hoặc người dùng..."
                prefix={<SearchOutlined className="text-gray-400 dark:text-gray-500" />}
                value={search}
                onChange={e => handleSearch(e.target.value)}
                size="large"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Start Date */}
            <div>
              <Text className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                Từ ngày
              </Text>
              <DatePicker
                placeholder="Chọn ngày"
                format="DD/MM/YYYY"
                value={startDate}
                onChange={handleStartDateChange}
                disabledDate={disabledStartDate}
                suffixIcon={<CalendarOutlined />}
                size="large"
                style={{ width: '100%' }}
                className="bg-white dark:bg-gray-700"
              />
            </div>

            {/* End Date */}
            <div>
              <Text className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                Đến ngày
              </Text>
              <DatePicker
                placeholder="Chọn ngày"
                format="DD/MM/YYYY"
                value={endDate}
                onChange={handleEndDateChange}
                disabledDate={disabledEndDate}
                suffixIcon={<CalendarOutlined />}
                size="large"
                style={{ width: '100%' }}
                className="bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Hàng 2: Các bộ lọc Select */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Actor Role */}
            <div>
              <Text className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                Vai trò
              </Text>
              <Select
                placeholder="Chọn vai trò"
                value={actorRole || 'ALL'}
                onChange={handleRoleChange}
                options={roleOptions}
                size="large"
                style={{ width: '100%' }}
                className="bg-white dark:bg-gray-700"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>

            {/* Action */}
            <div>
              <Text className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                Hành động
              </Text>
              <Select
                placeholder="Tất cả"
                value={action || 'ALL'}
                onChange={handleActionChange}
                options={actionOptions}
                size="large"
                style={{ width: '100%' }}
                className="bg-white dark:bg-gray-700"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>

            {/* Resource */}
            <div>
              <Text className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                Tài nguyên
              </Text>
              <Select
                placeholder="Tất cả"
                value={resource || 'ALL'}
                onChange={handleResourceChange}
                options={resourceOptions}
                size="large"
                style={{ width: '100%' }}
                className="bg-white dark:bg-gray-700"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>
          </div>
        </>
      )}

      {/* Reset Button */}
      {!loading && hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            type="text"
            icon={<ClearOutlined />}
            onClick={handleReset}
            className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </Card>
  );
}
