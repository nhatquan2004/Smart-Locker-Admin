import type {
  TActivityItem,
  TActivityPage,
  TActivityQuery,
  TActivityStats,
} from '../types/activity.type'
import { apiClient } from './api.client'
import { getBuildingNames } from './buildingNames'

// Dữ liệu từ GET /activity-logs. Nhật ký do server tự ghi, admin chỉ đọc.
type TApiActivity = {
  _id: string
  actor: { userId?: string; name: string; phone?: string; role: TActivityItem['actorRole'] }
  buildingId?: string
  category: TActivityItem['category']
  status: TActivityItem['status']
  title: string
  description?: string
  target?: { type?: TActivityItem['targetType']; id?: string; label?: string }
  createdAt: string
}

type TApiPage = { data: TApiActivity[]; total: number; page: number; limit: number }

function mapActivity(a: TApiActivity, names: Map<string, string>): TActivityItem {
  return {
    id: a._id,
    actorId: a.actor?.userId,
    actorName: a.actor?.name ?? '—',
    actorRole: a.actor?.role ?? 'SYSTEM',
    actorPhone: a.actor?.phone,
    buildingId: a.buildingId,
    orgName: a.buildingId ? names.get(a.buildingId) : undefined,
    category: a.category,
    status: a.status,
    title: a.title,
    description: a.description,
    targetType: a.target?.type,
    targetId: a.target?.id,
    targetLabel: a.target?.label,
    createdAt: a.createdAt,
  }
}

function toQueryString(query: object): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export async function getActivities(query: TActivityQuery = {}): Promise<TActivityPage> {
  const [res, names] = await Promise.all([
    apiClient.get<TApiPage>(`/activity-logs${toQueryString(query)}`),
    getBuildingNames(),
  ])
  return {
    items: (res.data.data ?? []).map((a) => mapActivity(a, names)),
    total: res.data.total ?? 0,
    page: res.data.page ?? 1,
    limit: res.data.limit ?? query.limit ?? 20,
  }
}

// Thống kê dùng cùng bộ lọc nhưng không phân trang
export async function getActivityStats(
  query: Omit<TActivityQuery, 'page' | 'limit'> = {},
): Promise<TActivityStats> {
  const res = await apiClient.get<TActivityStats>(`/activity-logs/stats${toQueryString(query)}`)
  return {
    from: res.data.from,
    to: res.data.to,
    total: res.data.total ?? 0,
    byStatus: res.data.byStatus ?? {},
    byCategory: res.data.byCategory ?? {},
    byDay: res.data.byDay ?? [],
  }
}
