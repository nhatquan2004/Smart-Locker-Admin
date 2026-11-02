import { apiClient } from './api.client'

// Tên tòa nhà của Ban quản lý đang đăng nhập (GET /buildings/my-building, chỉ BUILDING_ADMIN gọi được)
export async function getMyBuildingName(): Promise<string> {
  const res = await apiClient.get<{ name: string }>('/buildings/my-building')
  return res.data.name
}

// Server chỉ trả mã tòa nhà trong phiếu sự cố và nhật ký, nên lấy tên từ danh sách tòa nhà.
// Lưu tạm để không gọi lại mỗi lần; nếu gọi lỗi thì lần sau thử lại.
let cache: Map<string, string> | null = null

export async function getBuildingNames(): Promise<Map<string, string>> {
  if (cache) return cache
  const map = new Map<string, string>()
  try {
    const res = await apiClient.get<{ _id: string; name: string }[]>('/buildings')
    for (const b of res.data ?? []) map.set(b._id, b.name)
    cache = map
  } catch {
    // Không lấy được thì hiện dấu gạch
  }
  return map
}
