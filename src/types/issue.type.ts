export type TIssuePriority = 'urgent' | 'high' | 'medium' | 'low'

export type TIssueStatus = 'pending' | 'in_progress' | 'escalated' | 'resolved' | 'closed'

export type TIssueCategory = 'locker' | 'otp' | 'parcel' | 'app'

export type TIssueTimeline = {
  id: string
  time: string
  actor: string
  note: string
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
  title: string
  description: string
  attachments?: string[]
  assignee?: string
  createdAt: string
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
