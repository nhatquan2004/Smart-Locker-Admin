import type { TCreateResidentPayload, TResident } from '../types/resident.type'
import { useUserStore } from '../store/useUserStore'

/**
 * RESIDENT SERVICE
 * -------------------------------------------------------------------------
 * ARCHITECTURE NOTE:
 * Sử dụng Zustand Store (`useUserStore`) làm Single Source of Truth.
 * Khi kết nối REST API Backend thật, các hàm này có thể gọi trực tiếp API HTTP.
 * -------------------------------------------------------------------------
 */

export async function getResidents(orgId?: string): Promise<TResident[]> {
  return useUserStore.getState().fetchResidents(orgId)
}

export async function getResidentById(id: string): Promise<TResident | undefined> {
  const residents = await useUserStore.getState().fetchResidents()
  return residents.find((r) => r.id === id || r.phone === id)
}

export async function createResident(payload: TCreateResidentPayload): Promise<TResident> {
  return useUserStore.getState().createResident(payload)
}

export async function updateResident(id: string, updates: Partial<TResident>): Promise<boolean> {
  return useUserStore.getState().updateUser(id, updates as any)
}

export async function deleteResident(id: string): Promise<boolean> {
  return useUserStore.getState().deleteUser(id)
}
