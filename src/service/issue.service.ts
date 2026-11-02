import type {
  TIssueCategory,
  TIssueItem,
  TIssuePriority,
  TIssueStatus,
} from '../types/issue.type'
import { apiClient } from './api.client'
import { getBuildingNames } from './buildingNames'
import { formatDateTime } from '../i18n/format'

// Dữ liệu từ GET /issues (Issue schema của server, giá trị enum viết hoa)
type TApiIssue = {
  _id: string
  ticketCode: string
  title: string
  description: string
  attachments?: { url: string; publicId: string }[]
  category: string
  priority: string
  status: string
  reporter?: { userId?: string; role?: string; name?: string; phone?: string; email?: string }
  buildingId: string | { _id: string; name?: string }
  lockerId?: string | { _id: string; code: string; name?: string }
  assignee?: { userId?: string; name?: string }
  escalatedToSuperAdmin?: boolean
  resolutionNote?: string
  timeline?: { at: string; actorName?: string; note?: string; toStatus?: string }[]
  createdAt: string
  updatedAt: string
}

type TApiPage = { data: TApiIssue[]; total: number; page: number; limit: number }

export type TIssueQuery = {
  status?: TIssueStatus
  priority?: TIssuePriority
  category?: TIssueCategory
  buildingId?: string
  lockerId?: string
  search?: string
  page?: number
  limit?: number
}

export type TIssuePage = { items: TIssueItem[]; total: number; page: number; limit: number }

const reporterRoleMap: Record<string, TIssueItem['reporterRole']> = {
  RESIDENT: 'customer',
  SHIPPER: 'shipper',
  BUILDING_ADMIN: 'org_admin',
}

function mapIssue(i: TApiIssue, names: Map<string, string>): TIssueItem {
  const buildingId = typeof i.buildingId === 'string' ? i.buildingId : i.buildingId?._id
  const locker = typeof i.lockerId === 'object' ? i.lockerId : undefined

  return {
    id: i._id,
    ticketCode: i.ticketCode,
    reporterName: i.reporter?.name ?? '—',
    reporterRole: reporterRoleMap[i.reporter?.role ?? ''] ?? 'customer',
    reporterPhone: i.reporter?.phone ?? '—',
    reporterEmail: i.reporter?.email,
    orgId: buildingId ?? '',
    orgName: (buildingId && names.get(buildingId)) || '—',
    lockerCode: locker?.code,
    category: i.category.toLowerCase() as TIssueCategory,
    priority: i.priority.toLowerCase() as TIssuePriority,
    status: i.status.toLowerCase() as TIssueStatus,
    escalatedToSuperAdmin: i.escalatedToSuperAdmin,
    title: i.title,
    description: i.description,
    attachments: (i.attachments ?? []).map((a) => a.url),
    assignee: i.assignee?.name,
    createdAt: formatDateTime(i.createdAt),
    updatedAt: formatDateTime(i.updatedAt),
    resolutionNote: i.resolutionNote,
    // Server ghi theo thứ tự thời gian, hiển thị mới nhất lên đầu
    timeline: [...(i.timeline ?? [])]
      .reverse()
      .map((tl, idx) => ({
        id: `${tl.at}-${idx}`,
        time: formatDateTime(tl.at),
        actor: tl.actorName ?? '—',
        note: tl.note ?? '',
        status: tl.toStatus ? (tl.toStatus.toLowerCase() as TIssueStatus) : undefined,
      })),
  }
}

function toQueryString(query: TIssueQuery): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue
    // Server dùng enum viết hoa cho trạng thái, mức ưu tiên và nhóm
    const upper = key === 'status' || key === 'priority' || key === 'category'
    params.set(key, upper ? String(value).toUpperCase() : String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export async function getIssues(query: TIssueQuery = {}): Promise<TIssuePage> {
  const [res, names] = await Promise.all([
    apiClient.get<TApiPage>(`/issues${toQueryString(query)}`),
    getBuildingNames(),
  ])
  return {
    items: (res.data.data ?? []).map((i) => mapIssue(i, names)),
    total: res.data.total ?? 0,
    page: res.data.page ?? 1,
    limit: res.data.limit ?? query.limit ?? 20,
  }
}

export async function getIssueById(id: string): Promise<TIssueItem> {
  const [res, names] = await Promise.all([
    apiClient.get<TApiIssue>(`/issues/${encodeURIComponent(id)}`),
    getBuildingNames(),
  ])
  return mapIssue(res.data, names)
}

// Các phiếu còn mở (chưa xử lý, đang xử lý, đã chuyển lên Super Admin), dùng để đánh dấu tủ có sự cố trên bản đồ.
// Lỗi (ví dụ không đủ quyền) không được làm hỏng trang gọi nên trả về danh sách rỗng.
export async function getOpenIssues(): Promise<TIssueItem[]> {
  try {
    const open: TIssueStatus[] = ['pending', 'in_progress', 'escalated']
    const pages = await Promise.all(open.map((status) => getIssues({ status, limit: 100 })))
    return pages.flatMap((p) => p.items)
  } catch {
    return []
  }
}

// Đếm theo bộ lọc bằng cách xin 1 bản ghi và đọc total
async function countIssues(query: TIssueQuery): Promise<number> {
  const res = await apiClient.get<TApiPage>(`/issues${toQueryString({ ...query, limit: 1 })}`)
  return res.data.total ?? 0
}

export type TIssueCounts = { pending: number; inProgress: number; escalated: number; urgentOpen: number }

export async function getIssueCounts(scope: Pick<TIssueQuery, 'buildingId'> = {}): Promise<TIssueCounts> {
  const [pending, inProgress, escalated, urgentPending, urgentProgress, urgentEscalated] = await Promise.all([
    countIssues({ ...scope, status: 'pending' }),
    countIssues({ ...scope, status: 'in_progress' }),
    countIssues({ ...scope, status: 'escalated' }),
    countIssues({ ...scope, status: 'pending', priority: 'urgent' }),
    countIssues({ ...scope, status: 'in_progress', priority: 'urgent' }),
    countIssues({ ...scope, status: 'escalated', priority: 'urgent' }),
  ])
  return { pending, inProgress, escalated, urgentOpen: urgentPending + urgentProgress + urgentEscalated }
}

// Các chuyển trạng thái server cho phép qua PATCH /issues/:id/status (ESCALATED đi qua API leo thang riêng)
const TRANSITIONS: Record<TIssueStatus, TIssueStatus[]> = {
  pending: ['in_progress', 'resolved'],
  in_progress: ['resolved'],
  escalated: ['in_progress', 'resolved'],
  resolved: ['closed', 'in_progress'],
  closed: [],
}

export function canTransition(from: TIssueStatus, to: TIssueStatus, isSuperAdmin: boolean): boolean {
  // Phiếu đã chuyển lên Super Admin thì Ban quản lý không được tự xử lý
  if (from === 'escalated' && !isSuperAdmin) return false
  return TRANSITIONS[from].includes(to)
}

// Trạng thái RESOLVED bắt buộc có ghi chú xử lý
export async function updateIssueStatus(
  id: string,
  status: TIssueStatus,
  note?: string,
): Promise<TIssueItem> {
  await apiClient.patch(`/issues/${encodeURIComponent(id)}/status`, {
    status: status.toUpperCase(),
    ...(note?.trim() ? { note: note.trim() } : {}),
  })
  return getIssueById(id)
}

// Chỉ Ban quản lý được chuyển phiếu lên Super Admin, và chỉ khi phiếu đang chờ hoặc đang xử lý
export async function escalateIssue(id: string, note?: string): Promise<TIssueItem> {
  await apiClient.post(`/issues/${encodeURIComponent(id)}/escalate`, note?.trim() ? { note: note.trim() } : {})
  return getIssueById(id)
}
