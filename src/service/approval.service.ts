/**
 * APPROVAL SERVICE
 * -------------------------------------------------------------------------
 * Gọi API để lấy danh sách hồ sơ cư dân chờ duyệt và thực hiện duyệt/từ chối.
 * Chỉ dành cho BUILDING_ADMIN (org_admin).
 * Pattern: dùng apiClient đã có sẵn, tự động gắn Bearer token.
 * -------------------------------------------------------------------------
 */

import { apiClient } from './api.client'

export type TPendingResident = {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  buildingId: string
  apartment: string
  approvalStatus: 'PENDING' | 'ACTIVE' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

/**
 * Lấy danh sách cư dân đang chờ duyệt của tòa nhà admin đang quản lý.
 * Backend tự lấy buildingId từ JWT token → không cần truyền tham số.
 */
export async function getPendingResidents(): Promise<TPendingResident[]> {
  const res = await apiClient.get<TPendingResident[]>('/users/pending-residents')
  return res.data
}

/**
 * Duyệt hồ sơ cư dân.
 * PATCH /users/:id/approve
 */
export async function approveResident(userId: string): Promise<TPendingResident> {
  const res = await apiClient.patch<TPendingResident>(`/users/${userId}/approve`, {})
  return res.data
}

/**
 * Từ chối hồ sơ cư dân kèm lý do.
 * PATCH /users/:id/reject
 */
export async function rejectResident(userId: string, reason: string): Promise<TPendingResident> {
  const res = await apiClient.patch<TPendingResident>(`/users/${userId}/reject`, { reason })
  return res.data
}
