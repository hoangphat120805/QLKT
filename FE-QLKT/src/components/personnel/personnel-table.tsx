// @ts-nocheck
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

interface PersonnelTableProps {
  personnel: any[];
  onEdit?: (p: any) => void;
  onRefresh?: () => void;
  readOnly?: boolean;
}

export function PersonnelTable({
  personnel,
  onEdit,
  onRefresh,
  readOnly = false,
}: PersonnelTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      await apiClient.deletePersonnel(deleteId);
      toast({
        title: 'Thành công',
        description: 'Xóa quân nhân thành công',
      });
      onRefresh?.();
      setDeleteId(null);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi xóa',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] text-center">CCCD</TableHead>
              <TableHead className="w-[140px] text-center">Họ tên</TableHead>
              <TableHead className="w-[180px] text-center">Đơn vị</TableHead>
              <TableHead className="w-[160px] text-center">Chức vụ</TableHead>
              <TableHead className="w-[150px] text-center">Ngày nhập ngũ</TableHead>
              <TableHead className="w-[180px] text-center">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personnel.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              personnel.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-center">{p.cccd}</TableCell>
                  <TableCell className="text-center">{p.ho_ten}</TableCell>
                  <TableCell className="text-center">
                    {p.DonVi?.ten_don_vi || p.ten_don_vi || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {p.ChucVu?.ten_chuc_vu || p.ten_chuc_vu || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(p.ngay_nhap_ngu).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {readOnly ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit?.(p)}
                          className="hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 dark:hover:bg-blue-900/20"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      ) : (
                        <>
                          <Link href={`/admin/personnel/${p.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 dark:hover:bg-blue-900/20"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Xem
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(p.id)}
                            className="hover:bg-red-50 hover:border-red-500 hover:text-red-600 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Xóa
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa quân nhân này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
