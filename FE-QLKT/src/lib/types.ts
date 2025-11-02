// Types for QLKT API
export interface Account {
  id: string
  username: string
  personnel_id: string
  personnel_name: string
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER"
  created_at: string
}

export interface Personnel {
  id: string
  cccd: string
  ho_ten: string
  don_vi_id: string
  don_vi_name: string
  chuc_vu_id: string
  chuc_vu_name: string
  ngay_nhap_ngu: string
}

export interface Unit {
  id: string
  ma_don_vi: string
  ten_don_vi: string
  quan_so: number
}

export interface Position {
  id: string
  ten_chuc_vu: string
  is_manager: boolean
  nhom_cong_hien_id: string
  nhom_cong_hien_name: string
}

export interface ContributionGroup {
  id: string
  ten_nhom: string
  mo_ta: string
}
