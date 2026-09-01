import type { TCreateUserPayload, TUser, TUserStatItem } from '../types/user.type'
import { useUserStore } from '../store/useUserStore'

/**
 * USER SERVICE
 * -------------------------------------------------------------------------
 * ARCHITECTURE NOTE:
 * Sử dụng Zustand Store (`useUserStore`) làm Single Source of Truth.
 * Khi kết nối REST API Backend thật, các hàm này có thể gọi trực tiếp API HTTP
 * hoặc cập nhật qua `useUserStore`.
 * -------------------------------------------------------------------------
 */

export async function getUsers(companyId?: string): Promise<TUser[]> {
  return useUserStore.getState().fetchUsers(companyId)
}

export async function getUserById(id: string): Promise<TUser | undefined> {
  return useUserStore.getState().getUserById(id)
}

export async function createUser(payload: TCreateUserPayload): Promise<TUser> {
  return useUserStore.getState().createUser(payload)
}

export async function updateUser(id: string, updates: Partial<TUser>): Promise<boolean> {
  return useUserStore.getState().updateUser(id, updates)
}

export async function deleteUser(id: string): Promise<boolean> {
  return useUserStore.getState().deleteUser(id)
}

export async function getUserStats(): Promise<TUserStatItem[]> {
  return useUserStore.getState().getUserStats()
}
