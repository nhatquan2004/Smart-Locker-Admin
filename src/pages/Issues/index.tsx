import { useEffect, useMemo, useState } from 'react'
import { escalateIssueToSuperAdmin, getIssues, updateIssueStatus } from '../../service/issue.service'
import { getOrganizations } from '../../service/organization.service'
import { useAuthStore } from '../../store/useAuthStore'
import type { TIssueCategory, TIssueFilter, TIssueItem, TIssuePriority, TIssueStatus } from '../../types/issue.type'
import type { TOrganization } from '../../types/organization.type'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { AppTable } from '../../components/common/AppTable'
import { useToast } from '../../context/ToastContext'
import {
  Search,
  Building2,
  PackageCheck,
  Zap,
  Lock,
  Key,
  ChevronRight,
  ShieldAlert,
  Clock,
  Wrench,
  CheckCircle2,
  X,
  User,
  Truck,
  Phone,
  Rocket,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react'

const categoryBadges: Record<TIssueCategory, { label: string; icon: React.ReactNode; style: string }> = {
  locker:  { label: 'Lỗi Locker & Khóa', icon: <Lock className="w-3.5 h-3.5" />, style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-medium' },
  otp:     { label: 'Lỗi Mã OTP', icon: <Key className="w-3.5 h-3.5" />, style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-medium' },
  parcel:  { label: 'Lỗi Đơn Hàng', icon: <PackageCheck className="w-3.5 h-3.5" />, style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-medium' },
  app:     { label: 'Lỗi Ứng Dụng', icon: <Zap className="w-3.5 h-3.5" />, style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-medium' },
}

const priorityBadges: Record<TIssuePriority, { label: string; style: string; dot?: boolean }> = {
  urgent: { label: 'KHẨN CẤP', style: 'bg-slate-100 text-red-600 border-slate-200 dark:bg-slate-800 dark:text-red-400 dark:border-slate-700 font-mono font-bold', dot: true },
  high:   { label: 'MỨC ĐỘ CAO', style: 'bg-slate-100 text-amber-600 border-slate-200 dark:bg-slate-800 dark:text-amber-400 dark:border-slate-700 font-mono font-semibold' },
  medium: { label: 'TRUNG BÌNH', style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-mono font-semibold' },
  low:    { label: 'THẤP', style: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 font-mono font-semibold' },
}

const statusBadges: Record<TIssueStatus, { label: string; dotColor: string; textColor: string }> = {
  pending:     { label: 'Mới tiếp nhận', dotColor: 'bg-amber-500 animate-pulse', textColor: 'text-amber-600 dark:text-amber-400' },
  in_progress: { label: 'Đang xử lý', dotColor: 'bg-sky-500 animate-pulse', textColor: 'text-sky-600 dark:text-sky-400' },
  escalated:   { label: 'Leo thang Super Admin', dotColor: 'bg-purple-500 animate-pulse', textColor: 'text-purple-600 dark:text-purple-400' },
  resolved:    { label: 'Đã giải quyết', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
  closed:      { label: 'Đã đóng ticket', dotColor: 'bg-slate-400', textColor: 'text-slate-500' },
}

export function IssuesPage() {
  const toast = useToast()
  const { user: loggedUser } = useAuthStore()
  const [issues, setIssues] = useState<TIssueItem[]>([])
  const [orgsList, setOrgsList] = useState<TOrganization[]>([])
  const [selectedTicket, setSelectedTicket] = useState<TIssueItem | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [resolutionInput, setResolutionInput] = useState('')
  const [escalateReasonInput, setEscalateReasonInput] = useState('')
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [actionSuccessMsg, setActionSuccessMsg] = useState('')

  const [filter, setFilter] = useState<TIssueFilter>({
    search: '',
    companyId: 'all',
    category: 'all',
    priority: 'all',
    status: 'all',
  })

  const isSuperAdmin = loggedUser?.role === 'super_admin'
  const userOrgId = loggedUser?.orgId

  useEffect(() => {
    getIssues().then(setIssues)
    getOrganizations().then(setOrgsList)
  }, [])

  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      // Non super-admin only sees local issues for their org unless escalated
      if (!isSuperAdmin && userOrgId && userOrgId !== 'all') {
        if (iss.orgId && iss.orgId !== userOrgId) return false
      }

      const keyword = filter.search.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        `${iss.ticketCode} ${iss.reporterName} ${iss.reporterPhone} ${iss.title} ${iss.description} ${iss.lockerCode ?? ''}`
          .toLowerCase()
          .includes(keyword)

      const matchOrg = filter.companyId === 'all' || iss.orgId === filter.companyId
      const matchCategory = filter.category === 'all' || iss.category === filter.category
      const matchPriority = filter.priority === 'all' || iss.priority === filter.priority
      const matchStatus = filter.status === 'all' || iss.status === filter.status

      return matchSearch && matchOrg && matchCategory && matchPriority && matchStatus
    })
  }, [issues, filter, isSuperAdmin, userOrgId])

  const pendingCount = useMemo(() => issues.filter((i) => i.status === 'pending').length, [issues])
  const escalatedCount = useMemo(() => issues.filter((i) => i.status === 'escalated').length, [issues])
  const urgentCount = useMemo(() => issues.filter((i) => i.priority === 'urgent' && i.status !== 'closed').length, [issues])

  function handleStatusChange(issueId: string, newStatus: TIssueStatus) {
    updateIssueStatus(issueId, newStatus, resolutionInput).then((updated) => {
      setIssues((prev) => prev.map((item) => (item.id === issueId ? { ...updated } : item)))
      setSelectedTicket({ ...updated })
      const statusLabel = statusBadges[newStatus]?.label || newStatus
      setActionSuccessMsg(`✓ Đã cập nhật trạng thái ticket ${updated.ticketCode} sang ${statusLabel}`)
      setResolutionInput('')
      setTimeout(() => setActionSuccessMsg(''), 3000)

      if (newStatus === 'resolved') {
        toast.success(`Đã giải quyết sự cố ${updated.ticketCode} thành công!`)
      } else if (newStatus === 'closed') {
        toast.success(`Đã đóng ticket sự cố ${updated.ticketCode}!`)
      } else if (newStatus === 'in_progress') {
        toast.info(`Sự cố ${updated.ticketCode} đã chuyển sang trạng thái đang xử lý.`)
      } else {
        toast.info(`Đã cập nhật trạng thái sự cố ${updated.ticketCode} thành "${statusLabel}".`)
      }
    })
  }

  function handleEscalate(issueId: string) {
    escalateIssueToSuperAdmin(issueId, escalateReasonInput).then((updated) => {
      setIssues((prev) => prev.map((item) => (item.id === issueId ? { ...updated } : item)))
      setSelectedTicket({ ...updated })
      setShowEscalateModal(false)
      setEscalateReasonInput('')
      setActionSuccessMsg(`🚀 Đã LEO THANG sự cố ${updated.ticketCode} lên Super Admin thành công!`)
      setTimeout(() => setActionSuccessMsg(''), 3000)
      toast.success(`Đã leo thang sự cố ${updated.ticketCode} lên Super Admin thành công!`)
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Executive Hero Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 dark:bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">Quản Lý Báo Lỗi & Sự Cố System</h1>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                {pendingCount} Mới tiếp nhận
              </span>
            </div>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {isSuperAdmin
                ? 'Quyền hạn Super Admin: Quản lý toàn bộ sự cố, tiếp nhận các ticket Leo Thang từ Admin Khu Trọ.'
                : 'Quyền hạn Admin Khu Trọ: Xử lý sự cố tại cơ sở. Nếu vượt khả năng, bấm "Leo thang lên Super Admin".'}
            </p>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          {escalatedCount > 0 && (
            <div className="stat-pill flex items-center gap-2 px-3.5 py-2 rounded-xl border border-purple-300 bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 text-[11px] font-mono font-bold">
              <Rocket className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>{escalatedCount} Leo Thang lên Super Admin</span>
            </div>
          )}
          {urgentCount > 0 && (
            <div className="stat-pill flex items-center gap-2 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 dark:border-red-800 text-[11px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>{urgentCount} Khẩn cấp</span>
            </div>
          )}
        </div>
      </section>

      {/* Filter Toolbar */}
      <div data-reveal className="setting-card-custom p-4 rounded-2xl flex flex-col gap-4 shadow-2xs border">
        
        {/* Status Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 dark:border-slate-800 pb-3">
          {[
            { id: 'all', label: 'Tất cả trạng thái' },
            { id: 'pending', label: 'Mới tiếp nhận' },
            { id: 'in_progress', label: 'Đang xử lý' },
            { id: 'escalated', label: '🚀 Leo thang Super Admin' },
            { id: 'resolved', label: 'Đã giải quyết' },
            { id: 'closed', label: 'Đã đóng ticket' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter((p) => ({ ...p, status: tab.id as any }))}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                filter.status === tab.id
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs dark:bg-sky-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo Mã Ticket, Tên, SĐT, Locker..."
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
              className="setting-input-custom w-full h-10 pl-9 pr-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Org Filter (Super Admin) */}
          {isSuperAdmin && (
            <select
              value={filter.companyId}
              onChange={(e) => setFilter((prev) => ({ ...prev, companyId: e.target.value }))}
              className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tất cả Khu Trọ / Doanh Nghiệp</option>
              {orgsList.map((org) => (
                <option key={org.id} value={org.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
          )}

          {/* Priority Filter */}
          <select
            value={filter.priority}
            onChange={(e) => setFilter((prev) => ({ ...prev, priority: e.target.value as any }))}
            className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tất cả mức độ ưu tiên</option>
            <option value="urgent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Khẩn cấp (Urgent)</option>
            <option value="high" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mức độ Cao</option>
            <option value="medium" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Trung bình</option>
            <option value="low" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Thấp</option>
          </select>

          {/* Category Filter */}
          <select
            value={filter.category}
            onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value as any }))}
            className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tất cả loại sự cố</option>
            <option value="locker" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lỗi Locker & Rơ-le</option>
            <option value="otp" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lỗi Sai/Hết hạn OTP</option>
            <option value="parcel" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lỗi Kiện Hàng & Shipment</option>
            <option value="app" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lỗi Ứng Dụng</option>
          </select>

        </div>
      </div>

      {/* Main Tickets Table using AppTable */}
      <div data-reveal>
        <AppTable
          columns={[
            {
              key: 'ticketCode',
              title: 'Mã Ticket & Thời Gian',
              render: (iss) => (
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-[13px]">
                    {iss.ticketCode}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {iss.createdAt}
                  </span>
                  {iss.escalatedToSuperAdmin && (
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 w-max mt-0.5 whitespace-nowrap">
                      <Rocket className="w-2.5 h-2.5" /> ESCALATED SUPER ADMIN
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: 'reporterName',
              title: 'Người Báo Lỗi',
              render: (iss) => (
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{iss.reporterName}</span>
                  <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                    {iss.reporterRole === 'shipper' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 whitespace-nowrap">
                        <Truck className="w-3 h-3" /> Shipper
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800 whitespace-nowrap">
                        <User className="w-3 h-3" /> Cư Dân / User
                      </span>
                    )}
                    <span className="font-mono text-slate-500 text-[11px] whitespace-nowrap">{iss.reporterPhone}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'orgName',
              title: 'Khu Trọ & Locker',
              render: (iss) => (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[12px] font-mono font-bold text-slate-800 dark:text-slate-200">
                    <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span className="truncate max-w-[170px]">{iss.orgName}</span>
                  </div>
                  {iss.lockerCode && (
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 w-max whitespace-nowrap">
                      Ngăn Tủ {iss.lockerCode}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: 'title',
              title: 'Nội Dung & Bằng Chứng',
              className: 'min-w-[260px] max-w-[340px]',
              render: (iss) => {
                const catBadge = categoryBadges[iss.category] || categoryBadges.locker
                const hasPhoto = iss.attachments && iss.attachments.length > 0
                return (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border whitespace-nowrap shrink-0 ${catBadge.style}`}>
                        {catBadge.icon}
                        {catBadge.label}
                      </span>
                      {hasPhoto && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 whitespace-nowrap shrink-0">
                          <ImageIcon className="w-3 h-3" /> {iss.attachments?.length} Ảnh đính kèm
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{iss.title}</span>
                  </div>
                )
              },
            },
            {
              key: 'priority',
              title: 'Mức Độ',
              render: (iss) => {
                const prioBadge = priorityBadges[iss.priority] || priorityBadges.medium
                return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border whitespace-nowrap ${prioBadge.style}`}>
                    {prioBadge.dot && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />}
                    {prioBadge.label}
                  </span>
                )
              },
            },
            {
              key: 'status',
              title: 'Trạng Thái Xử Lý',
              render: (iss) => {
                const stBadge = statusBadges[iss.status] || statusBadges.pending
                return (
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold whitespace-nowrap">
                    <span className={`w-2 h-2 rounded-full ${stBadge.dotColor}`} />
                    <span className={stBadge.textColor}>{stBadge.label}</span>
                  </div>
                )
              },
            },
            {
              key: 'actions',
              title: 'Thao Tác',
              align: 'right',
              render: (iss) => (
                <button
                  type="button"
                  onClick={() => setSelectedTicket(iss)}
                  className="h-8 px-3.5 rounded-xl text-[12px] font-bold bg-sky-600 text-white hover:bg-sky-700 transition-all cursor-pointer shadow-2xs active:scale-95 inline-flex items-center justify-center gap-1 shrink-0 whitespace-nowrap ml-auto"
                >
                  <span>Xử lý</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ),
            },
          ]}
          data={filteredIssues}
          pageSize={6}
          minWidth="1100px"
          emptyState={
            <EmptyState
              title="Không có sự cố nào"
              description="Không tìm thấy ticket báo lỗi phù hợp với bộ lọc hiện tại."
            />
          }
        />
      </div>

      {/* Ticket Details Inspector Modal (Fixed Header & Clean Scroll Body) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div data-reveal className="setting-card-custom w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
            
            {/* Modal Header (Fixed Pin Top) */}
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-start justify-between gap-4 bg-white dark:bg-slate-900">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-[14px] text-sky-600 dark:text-sky-400">{selectedTicket.ticketCode}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${priorityBadges[selectedTicket.priority].style}`}>
                    {priorityBadges[selectedTicket.priority].label}
                  </span>
                  {selectedTicket.escalatedToSuperAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                      <Rocket className="w-3 h-3 text-purple-600" /> ESCALATED TO SUPER ADMIN
                    </span>
                  )}
                </div>
                <h3 className="setting-title-custom text-[18px] font-bold mt-1.5 leading-tight">{selectedTicket.title}</h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Clean Inner Scrollbar with Padding) */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5 flex-1 pr-4">
              
              {actionSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[12px] font-bold border border-emerald-300">
                  {actionSuccessMsg}
                </div>
              )}

              {/* Reporter Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl setting-input-custom border text-[12.5px]">
                <div className="flex flex-col gap-1">
                  <span className="setting-desc-custom font-medium">Người báo lỗi:</span>
                  <span className="font-bold setting-title-custom flex items-center gap-1.5">
                    {selectedTicket.reporterRole === 'shipper' ? <Truck className="w-3.5 h-3.5 text-amber-600" /> : <User className="w-3.5 h-3.5 text-sky-600" />}
                    {selectedTicket.reporterName} ({selectedTicket.reporterRole})
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="setting-desc-custom font-medium">SĐT liên hệ:</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedTicket.reporterPhone}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <span className="setting-desc-custom font-medium">Khu trọ / Doanh nghiệp:</span>
                  <span className="font-semibold setting-title-custom flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {selectedTicket.orgName} {selectedTicket.lockerCode ? `— (Ngăn Tủ ${selectedTicket.lockerCode})` : ''}
                  </span>
                </div>
              </div>

              {/* Error Description Detail */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono setting-desc-custom uppercase font-semibold">MÔ TẢ CHI TIẾT SỰ CỐ</label>
                <div className="p-3.5 rounded-xl setting-input-custom border text-[13px] leading-relaxed font-medium">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Attached Photo Evidence Gallery (Bằng Chứng Ảnh Hiện Trường) */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> 📸 ẢNH BẰNG CHỨNG HỌ CHỤP HIỆN TRƯỜNG ({selectedTicket.attachments.length} Ảnh)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Bấm vào ảnh để xem phóng to</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
                    {selectedTicket.attachments.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(imgUrl)}
                        className="group relative h-28 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer shadow-xs"
                      >
                        <img src={imgUrl} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-mono font-bold text-[11px] gap-1">
                          <ExternalLink className="w-4 h-4" /> Phóng to
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Escalation Action Button for Local Admin */}
              {!isSuperAdmin && !selectedTicket.escalatedToSuperAdmin && (
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-[13px] font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                      <Rocket className="w-4 h-4 text-purple-600" /> Không sửa được sự cố này tại cơ sở?
                    </h4>
                    <p className="text-[11.5px] text-purple-700 dark:text-purple-300 mt-0.5">
                      Chuyển (Escalate) ticket này lên Platform Super Admin & Kỹ thuật viên phần cứng cấp cao.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEscalateModal(true)}
                    className="px-3.5 py-2 rounded-xl text-[12px] font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    🚀 Leo thang lên Super Admin
                  </button>
                </div>
              )}

              {/* Resolution Note Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono setting-desc-custom uppercase font-semibold">GHI CHÚ KHẮC PHỤC / PHẢN HỒI NGUYÊN NHÂN</label>
                <textarea
                  rows={2}
                  placeholder="Nhập ghi chú phản hồi cho cư dân/shipper hoặc ghi chú kỹ thuật..."
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  className="setting-input-custom p-3 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Change Status Action Buttons Flow */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-mono setting-desc-custom uppercase font-semibold">CẬP NHẬT TRẠNG THÁI XỬ LÝ (PIPELINE FLOW)</label>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedTicket.id, 'pending')}
                    className={`py-2.5 px-3 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedTicket.status === 'pending'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> 1. Tiếp nhận
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedTicket.id, 'in_progress')}
                    className={`py-2.5 px-3 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedTicket.status === 'in_progress'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" /> 2. Đang xử lý
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedTicket.id, 'resolved')}
                    className={`py-2.5 px-3 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> 3. Đã giải quyết
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedTicket.id, 'closed')}
                    className={`py-2.5 px-3 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedTicket.status === 'closed'
                        ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" /> 4. Đóng Ticket
                  </button>
                </div>
              </div>

              {/* History Timeline of Ticket */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-mono setting-desc-custom uppercase font-semibold">DÒNG THỜI GIAN XỬ LÝ (TIMELINE LOGS)</label>
                <div className="flex flex-col gap-2">
                  {selectedTicket.timeline.map((tl) => (
                    <div key={tl.id} className="flex items-center justify-between text-[12px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-l-4 border-l-sky-500">
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400">[{tl.time}]</span>
                      <span className="font-semibold text-slate-900 dark:text-white flex-1 mx-3">{tl.note}</span>
                      <span className="text-[11px] font-mono text-slate-500">Bởi: {tl.actor}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl max-h-[85vh] p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Full evidence preview" className="max-w-full max-h-[78vh] object-contain rounded-xl" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center cursor-pointer hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Escalate Confirmation Modal */}
      {showEscalateModal && selectedTicket && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div data-reveal className="setting-card-custom w-full max-w-md rounded-3xl p-6 border shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
              <Rocket className="w-6 h-6 shrink-0" />
              <h3 className="text-[17px] font-bold setting-title-custom">Leo Thang Sự Cố Up Super Admin</h3>
            </div>
            
            <p className="text-[12.5px] setting-desc-custom leading-relaxed">
              Ticket <strong className="font-mono text-sky-600 dark:text-sky-400">{selectedTicket.ticketCode}</strong> sẽ được chuyển trực tiếp lên bảng ưu tiên của Platform Super Admin và Đội Kỹ Thuật Phần Cứng.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono setting-desc-custom uppercase font-semibold">LÝ DO LEO THANG (NẾU CÓ)</label>
              <textarea
                rows={2}
                placeholder="VD: Hư chốt rơ-le khóa cơ khí, cần kỹ thuật viên qua thay bo MCU..."
                value={escalateReasonInput}
                onChange={(e) => setEscalateReasonInput(e.target.value)}
                className="setting-input-custom p-3 rounded-xl text-[13px] border focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleEscalate(selectedTicket.id)}
                className="px-4 py-2 rounded-xl text-[12px] font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all cursor-pointer shadow-xs"
              >
                Xác nhận Leo Thang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
