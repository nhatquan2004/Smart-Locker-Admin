export type TIssuePriority = 'urgent' | 'high' | 'medium' | 'low'

export type TIssueStatus = 'pending' | 'in_progress' | 'escalated' | 'resolved' | 'closed'

export type TIssueCategory = 'locker' | 'otp' | 'parcel' | 'app'

export type TIssueTimeline = {
  id: string
  time: string
  actor: string
  note: string
  // Trạng thái phiếu được chuyển tới ở mốc này (mốc "Tạo phiếu" là pending)
  status?: TIssueStatus
}

export type TIssueItem = {
  id: string
  ticketCode: string
  reporterName: string
  reporterRole: 'customer' | 'shipper' | 'org_admin'
  reporterPhone: string
  reporterEmail?: string
  orgId: string
  orgName: string
  lockerCode?: string
  category: TIssueCategory
  priority: TIssuePriority
  status: TIssueStatus
  escalatedToSuperAdmin?: boolean
  // Lần Ban quản lý chuyển phiếu lên Super Admin: ai chuyển, lúc nào, kèm ghi chú gì
  escalation?: { by: string; at: string; note?: string }
  title: string
  description: string
  attachments?: string[]
  assignee?: string
  createdAt: string
  // Dạng ISO để sắp xếp, createdAt là chuỗi đã định dạng để hiển thị
  createdAtIso: string
  updatedAt: string
  resolutionNote?: string
  timeline: TIssueTimeline[]
}

export type TIssueFilter = {
  search: string
  companyId: string
  category: 'all' | TIssueCategory
  priority: 'all' | TIssuePriority
  status: 'all' | TIssueStatus | 'escalated'
}
