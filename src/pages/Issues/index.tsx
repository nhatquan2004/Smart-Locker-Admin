import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  canTransition,
  escalateIssue,
  getEscalatedIssues,
  getIssueById,
  getIssueCounts,
  getIssues,
  isLockedForBuilding,
  updateIssueStatus,
  type TIssueCounts,
} from '../../service/issue.service'
import { getOrganizations } from '../../service/organization.service'
import { useAuthStore } from '../../store/useAuthStore'
import type { TIssueFilter, TIssueItem, TIssuePriority, TIssueStatus } from '../../types/issue.type'
import type { TOrganization } from '../../types/organization.type'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { AppTable } from '../../components/common/AppTable'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'
import { Search, ChevronLeft, ChevronRight, Check, Image as ImageIcon, Phone, X, ArrowUpRight, Building2, ShieldAlert } from 'lucide-react'

const priorityStyle: Record<TIssuePriority, { labelKey: TranslationKey; dot: string; text: string }> = {
  urgent: { labelKey: 'is.prio.urgent', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400 font-semibold' },
  high: { labelKey: 'is.prio.high', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400 font-medium' },
  medium: { labelKey: 'is.prio.medium', dot: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-300' },
  low: { labelKey: 'is.prio.low', dot: 'bg-slate-300 dark:bg-slate-600', text: 'text-slate-500 dark:text-slate-400' },
}

const statusStyle: Record<TIssueStatus, { labelKey: TranslationKey; chip: string }> = {
  pending: { labelKey: 'is.st.pending', chip: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  in_progress: { labelKey: 'is.st.in_progress', chip: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
  escalated: { labelKey: 'is.st.escalated', chip: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300' },
  resolved: { labelKey: 'is.st.resolved', chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  closed: { labelKey: 'is.st.closed', chip: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300' },
}

const categoryKeys = {
  locker: 'is.cat.locker',
  otp: 'is.cat.otp',
  parcel: 'is.cat.parcel',
  app: 'is.cat.app',
} as const satisfies Record<TIssueItem['category'], TranslationKey>

const reporterRoleKeys: Record<TIssueItem['reporterRole'], TranslationKey> = {
  customer: 'is.role.customer',
  shipper: 'is.role.shipper',
  org_admin: 'is.role.org_admin',
}

// 4 bước của vòng đời phiếu. Phiếu đã chuyển Super Admin vẫn đứng ở bước 1.
const FLOW: TIssueStatus[] = ['pending', 'in_progress', 'resolved', 'closed']

const PAGE_SIZE = 20

// Ai đang chịu trách nhiệm phiếu: dòng này nằm đầu ngăn kéo để không ai phải đoán
function ownerBanner(i: TIssueItem, isSuperAdmin: boolean): { key: TranslationKey; tone: 'sky' | 'purple' | 'emerald' } {
  const done = i.status === 'resolved' || i.status === 'closed'
  if (!i.escalatedToSuperAdmin) return done ? { key: 'is.own.buildingDone', tone: 'emerald' } : { key: 'is.own.building', tone: 'sky' }
  if (done) return { key: 'is.own.sysDone', tone: 'emerald' }
  if (i.status === 'escalated') return { key: isSuperAdmin ? 'is.own.sysWaitMine' : 'is.own.sysWait', tone: 'purple' }
  return { key: 'is.own.sysWorking', tone: 'purple' }
}

const bannerTone = {
  sky: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
  purple: 'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-200',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
} as const

const kpiTone = {
  amber: 'text-amber-600 dark:text-amber-400',
  sky: 'text-sky-600 dark:text-sky-400',
  purple: 'text-purple-600 dark:text-purple-400',
  red: 'text-red-600 dark:text-red-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
} as const

const filterSelectCls =
  'setting-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500 cursor-pointer'

function PriorityMark({ priority }: { priority: TIssuePriority }) {
  const { t } = useTranslation()
  const s = priorityStyle[priority] ?? priorityStyle.medium
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] whitespace-nowrap ${s.text}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {t(s.labelKey)}
    </span>
  )
}

function StatusChip({ status }: { status: TIssueStatus }) {
  const { t } = useTranslation()
  const s = statusStyle[status] ?? statusStyle.pending
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-semibold whitespace-nowrap ${s.chip}`}>
      {t(s.labelKey)}
    </span>
  )
}

// Thanh 4 bước thể hiện phiếu đang ở đâu trong vòng đời
function Stepper({ status }: { status: TIssueStatus }) {
  const { t } = useTranslation()
  const current = status === 'escalated' ? 0 : FLOW.indexOf(status)
  return (
    <ol className="grid grid-cols-4 gap-2">
      {FLOW.map((step, i) => {
        const done = i < current || status === 'closed'
        const active = i === current && status !== 'closed'
        const tone = done
          ? 'bg-emerald-500 border-emerald-500 text-white'
          : active
            ? status === 'escalated'
              ? 'bg-purple-500 border-purple-500 text-white ring-4 ring-purple-500/15'
              : 'bg-sky-500 border-sky-500 text-white ring-4 ring-sky-500/15'
            : 'bg-white border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-500'
        return (
          <li key={step} className="relative flex flex-col items-center gap-1.5 text-center">
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-[13px] h-0.5 w-full ${i <= current || status === 'closed' ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`}
                aria-hidden="true"
              />
            )}
            <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[12px] font-bold ${tone}`}>
              {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </span>
            <span className={`text-[11.5px] leading-tight ${active ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400'}`}>
              {t(statusStyle[step].labelKey)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function IssuesPage() {
  const toast = useToast()
  const { t } = useTranslation()
  const { user: loggedUser } = useAuthStore()
  const [issues, setIssues] = useState<TIssueItem[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState<TIssueCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [orgsList, setOrgsList] = useState<TOrganization[]>([])
  const [selectedTicket, setSelectedTicket] = useState<TIssueItem | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [escalateReasonInput, setEscalateReasonInput] = useState('')
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  // Super Admin: toàn bộ phiếu đã được Ban quản lý chuyển lên (lọc theo tab ở phía client)
  const [saAll, setSaAll] = useState<TIssueItem[]>([])

  const [filter, setFilter] = useState<TIssueFilter>({
    search: '',
    companyId: 'all',
    category: 'all',
    priority: 'all',
    // Super Admin vào là thấy ngay các phiếu đang chờ mình tiếp nhận
    status: loggedUser?.role === 'super_admin' ? 'escalated' : 'all',
  })
  // Từ khóa đã dừng gõ, chỉ lúc này mới gửi lên server
  const [search, setSearch] = useState('')

  const isSuperAdmin = loggedUser?.role === 'super_admin'

  // Thông báo ở chuông chuyển tới đây kèm ?open=<mã phiếu>: mở sẵn phiếu đó
  const [searchParams, setSearchParams] = useSearchParams()
  const openIssueId = searchParams.get('open')
  useEffect(() => {
    if (!openIssueId) return
    let active = true
    getIssueById(openIssueId)
      .then((issue) => {
        if (!active) return
        setSelectedTicket(issue)
        setNoteInput('')
      })
      .catch((err: unknown) => {
        if (active) toast.error(t('is.actionFailed', { message: err instanceof Error ? err.message : '' }))
      })
      .finally(() => {
        if (active) setSearchParams({}, { replace: true })
      })
    return () => {
      active = false
    }
    // Chỉ chạy khi có mã phiếu mới cần mở
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIssueId])

  // Đổi bất kỳ bộ lọc nào thì quay về trang 1
  const filterKey = [filter.status, filter.priority, filter.category, filter.companyId, search].join('|')
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 })
  const page = pageState.key === filterKey ? pageState.page : 1
  const setPage = (next: number) => setPageState({ key: filterKey, page: next })

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(filter.search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [filter.search])

  useEffect(() => {
    if (!isSuperAdmin) return
    getOrganizations().then(setOrgsList).catch(() => setOrgsList([]))
  }, [isSuperAdmin])

  const buildingId = filter.companyId === 'all' ? undefined : filter.companyId

  useEffect(() => {
    if (isSuperAdmin) return
    let active = true
    getIssues({
      status: filter.status === 'all' ? undefined : filter.status,
      priority: filter.priority === 'all' ? undefined : filter.priority,
      category: filter.category === 'all' ? undefined : filter.category,
      buildingId,
      search,
      page,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (!active) return
        setIssues(res.items)
        setTotal(res.total)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : '')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, page, reloadKey])

  // Super Admin chỉ thấy phiếu đã được Ban quản lý chuyển lên
  useEffect(() => {
    if (!isSuperAdmin) return
    let active = true
    getEscalatedIssues({
      priority: filter.priority === 'all' ? undefined : filter.priority,
      category: filter.category === 'all' ? undefined : filter.category,
      buildingId,
      search,
    })
      .then((items) => {
        if (!active) return
        setSaAll(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : '')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [isSuperAdmin, filter.priority, filter.category, buildingId, search, reloadKey])

  useEffect(() => {
    if (isSuperAdmin) return
    let active = true
    getIssueCounts({ buildingId })
      .then((c) => {
        if (active) setCounts(c)
      })
      .catch(() => {
        if (active) setCounts(null)
      })
    return () => {
      active = false
    }
  }, [isSuperAdmin, buildingId, reloadKey])

  // Esc đóng hộp thoại đang mở trên cùng
  useEffect(() => {
    if (!selectedTicket) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (previewImage) setPreviewImage(null)
      else if (showEscalateModal) setShowEscalateModal(false)
      else setSelectedTicket(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedTicket, previewImage, showEscalateModal])

  // Super Admin lọc theo tab và chia trang ở phía client, Ban quản lý do server lọc và chia trang
  const saView = useMemo(() => saAll.filter((i) => filter.status === 'all' || i.status === filter.status), [saAll, filter.status])
  const shownIssues = isSuperAdmin ? saView.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : issues
  const shownTotal = isSuperAdmin ? saView.length : total
  const totalPages = Math.max(1, Math.ceil(shownTotal / PAGE_SIZE))

  function openTicket(iss: TIssueItem) {
    setSelectedTicket(iss)
    setNoteInput('')
  }

  // Cập nhật phiếu vừa xử lý trong danh sách và tải lại số đếm
  function applyUpdated(updated: TIssueItem) {
    setIssues((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    setSaAll((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    setSelectedTicket(updated)
    setReloadKey((n) => n + 1)
  }

  async function handleStatusChange(issueId: string, newStatus: TIssueStatus) {
    if (busy) return
    setBusy(true)
    try {
      const updated = await updateIssueStatus(issueId, newStatus, noteInput)
      applyUpdated(updated)
      setNoteInput('')
      const statusLabel = t(statusStyle[newStatus].labelKey)
      if (newStatus === 'resolved') toast.success(t('is.resolvedToast', { code: updated.ticketCode }))
      else if (newStatus === 'closed') toast.success(t('is.closedToast', { code: updated.ticketCode }))
      else if (newStatus === 'in_progress') toast.info(t('is.inProgressToast', { code: updated.ticketCode }))
      else toast.info(t('is.statusToast', { code: updated.ticketCode, status: statusLabel }))
    } catch (err) {
      toast.error(t('is.actionFailed', { message: err instanceof Error ? err.message : '' }))
    } finally {
      setBusy(false)
    }
  }

  async function handleEscalate(issueId: string) {
    if (busy) return
    setBusy(true)
    try {
      const updated = await escalateIssue(issueId, escalateReasonInput)
      applyUpdated(updated)
      setShowEscalateModal(false)
      setEscalateReasonInput('')
      toast.success(t('is.escalatedToast', { code: updated.ticketCode }))
    } catch (err) {
      toast.error(t('is.actionFailed', { message: err instanceof Error ? err.message : '' }))
    } finally {
      setBusy(false)
    }
  }

  const tabs: { id: TIssueFilter['status']; labelKey: TranslationKey }[] = isSuperAdmin
    ? [
        { id: 'escalated', labelKey: 'is.tab.saEscalated' },
        { id: 'in_progress', labelKey: 'is.st.in_progress' },
        { id: 'resolved', labelKey: 'is.st.resolved' },
        { id: 'closed', labelKey: 'is.st.closed' },
        { id: 'all', labelKey: 'is.tab.all' },
      ]
    : [
        { id: 'all', labelKey: 'is.tab.all' },
        { id: 'pending', labelKey: 'is.st.pending' },
        { id: 'in_progress', labelKey: 'is.st.in_progress' },
        { id: 'escalated', labelKey: 'is.st.escalated' },
        { id: 'resolved', labelKey: 'is.st.resolved' },
        { id: 'closed', labelKey: 'is.st.closed' },
      ]

  // Thẻ tóm tắt đầu trang, bấm vào để lọc nhanh
  type TKpi = { id: string; label: TranslationKey; hint: TranslationKey; value: number | undefined; tone: keyof typeof kpiTone; status?: TIssueStatus; urgent?: boolean }
  const saCount = (s: TIssueStatus) => saAll.filter((i) => i.status === s).length
  const saUrgent = saAll.filter((i) => i.priority === 'urgent' && i.status !== 'resolved' && i.status !== 'closed').length
  const kpis: TKpi[] = isSuperAdmin
    ? [
        { id: 'escalated', label: 'is.kpi.sa.escalated', hint: 'is.kpi.sa.escalatedHint', value: saCount('escalated'), tone: 'purple', status: 'escalated' },
        { id: 'in_progress', label: 'is.kpi.sa.in_progress', hint: 'is.kpi.sa.in_progressHint', value: saCount('in_progress'), tone: 'sky', status: 'in_progress' },
        { id: 'resolved', label: 'is.kpi.sa.resolved', hint: 'is.kpi.sa.resolvedHint', value: saCount('resolved'), tone: 'emerald', status: 'resolved' },
        { id: 'urgent', label: 'is.kpi.urgent', hint: 'is.kpi.urgentHint', value: saUrgent, tone: 'red', urgent: true },
      ]
    : [
        { id: 'pending', label: 'is.kpi.pending', hint: 'is.kpi.pendingHint', value: counts?.pending, tone: 'amber', status: 'pending' },
        { id: 'in_progress', label: 'is.kpi.in_progress', hint: 'is.kpi.in_progressHint', value: counts?.inProgress, tone: 'sky', status: 'in_progress' },
        { id: 'escalated', label: 'is.kpi.escalated', hint: 'is.kpi.escalatedHint', value: counts?.escalated, tone: 'purple', status: 'escalated' },
        { id: 'urgent', label: 'is.kpi.urgent', hint: 'is.kpi.urgentHint', value: counts?.urgentOpen, tone: 'red', urgent: true },
      ]

  // Các nút chuyển trạng thái của phiếu đang mở, theo đúng bảng chuyển hợp lệ của server
  const ticket = selectedTicket
  const stepTargets: TIssueStatus[] = ticket ? (['in_progress', 'resolved', 'closed'] as TIssueStatus[]).filter((to) => canTransition(ticket, to, isSuperAdmin)) : []
  const canResolve = stepTargets.includes('resolved')
  const lockedForAdmin = !!ticket && !isSuperAdmin && isLockedForBuilding(ticket)

  function actionButton(to: TIssueStatus) {
    if (!ticket) return null
    const label: TranslationKey =
      to === 'in_progress' ? (ticket.status === 'resolved' ? 'is.act.reopen' : 'is.act.start') : to === 'resolved' ? 'is.act.resolve' : 'is.act.close'
    const primary =
      (to === 'in_progress' && ticket.status !== 'resolved') || (to === 'resolved' && ticket.status === 'in_progress') || to === 'closed'
    const primaryCls =
      to === 'resolved'
        ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600'
        : to === 'closed'
          ? 'bg-slate-800 text-white hover:bg-slate-900 border-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200 dark:hover:bg-white'
          : 'bg-sky-600 text-white hover:bg-sky-700 border-sky-600'
    const disabled = busy || (to === 'resolved' && !noteInput.trim())
    return (
      <button
        key={to}
        type="button"
        disabled={disabled}
        onClick={() => handleStatusChange(ticket.id, to)}
        className={`h-10 px-4 rounded-xl border text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          primary ? primaryCls : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700'
        }`}
      >
        {t(label)}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header data-reveal className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">{t('is.title')}</h1>
          <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400 max-w-2xl">{isSuperAdmin ? t('is.descSuper') : t('is.descAdmin')}</p>
        </div>
      </header>

      <section data-reveal className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => {
          const active = k.urgent ? filter.priority === 'urgent' : filter.status === k.status && filter.priority === 'all'
          return (
            <button
              key={k.id}
              type="button"
              onClick={() =>
                setFilter((p) =>
                  k.urgent ? { ...p, priority: 'urgent', status: 'all' } : { ...p, priority: 'all', status: k.status ?? 'all' },
                )
              }
              className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                active
                  ? 'border-sky-500 bg-sky-50/60 shadow-sm ring-1 ring-sky-500/30 dark:border-sky-400 dark:bg-sky-500/10'
                  : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{t(k.label)}</span>
              <span className={`font-mono text-[28px] font-bold leading-none ${kpiTone[k.tone]}`}>{k.value ?? '—'}</span>
              <span className="text-[11.5px] text-slate-500 dark:text-slate-400">{t(k.hint)}</span>
            </button>
          )
        })}
      </section>

      <div data-reveal className="flex flex-col gap-4">
        {/* Tab trạng thái */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => {
            const active = filter.status === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter((p) => ({ ...p, status: tab.id }))}
                className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors ${
                  active
                    ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-300'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {t(tab.labelKey)}
              </button>
            )
          })}
        </div>

        {/* Tìm kiếm và bộ lọc */}
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('is.searchPh')}
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
              className="setting-input-custom w-full h-10 pl-9 pr-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
            />
          </div>

          {isSuperAdmin && (
            <select value={filter.companyId} onChange={(e) => setFilter((prev) => ({ ...prev, companyId: e.target.value }))} className={filterSelectCls}>
              <option value="all">{t('is.allOrgs')}</option>
              {orgsList.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
          )}

          <select value={filter.priority} onChange={(e) => setFilter((prev) => ({ ...prev, priority: e.target.value as TIssueFilter['priority'] }))} className={filterSelectCls}>
            <option value="all">{t('is.allPrio')}</option>
            {(Object.keys(priorityStyle) as TIssuePriority[]).map((p) => (
              <option key={p} value={p}>
                {t(priorityStyle[p].labelKey)}
              </option>
            ))}
          </select>

          <select value={filter.category} onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value as TIssueFilter['category'] }))} className={filterSelectCls}>
            <option value="all">{t('is.allCats')}</option>
            {(Object.keys(categoryKeys) as TIssueItem['category'][]).map((c) => (
              <option key={c} value={c}>
                {t(categoryKeys[c])}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div data-reveal>
        {loading ? (
          <div className="p-10 text-center text-[13px] text-slate-500 dark:text-slate-400">{t('common.loading')}</div>
        ) : error !== null ? (
          <EmptyState title={t('common.noData')} description={t('is.loadFailed', { message: error })} />
        ) : (
          <>
            <AppTable
              columns={[
                {
                  key: 'ticketCode',
                  title: t('is.colTicket'),
                  render: (iss) => (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-[13px]">{iss.ticketCode}</span>
                      <span className="text-[11.5px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{iss.createdAt}</span>
                    </div>
                  ),
                },
                {
                  key: 'title',
                  title: t('is.colContent'),
                  className: 'min-w-[260px] max-w-[360px]',
                  render: (iss) => (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">{iss.title}</span>
                      <span className="flex flex-wrap items-center gap-x-2 text-[11.5px] text-slate-500 dark:text-slate-400">
                        <span>{t(categoryKeys[iss.category] ?? categoryKeys.locker)}</span>
                        {iss.lockerCode && <span>· {t('is.lockerLine', { code: iss.lockerCode })}</span>}
                        {(iss.attachments?.length ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1">
                            · <ImageIcon className="w-3 h-3" /> {t('is.photos', { count: iss.attachments?.length ?? 0 })}
                          </span>
                        )}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'reporterName',
                  title: t('is.colReporter'),
                  render: (iss) => (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">{iss.reporterName}</span>
                      <span className="text-[11.5px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {t(reporterRoleKeys[iss.reporterRole])} · {iss.reporterPhone}
                      </span>
                    </div>
                  ),
                },
                ...(isSuperAdmin
                  ? [
                      {
                        key: 'orgName',
                        title: t('is.colOrg'),
                        render: (iss: TIssueItem) => <span className="text-[13px] text-slate-700 dark:text-slate-200">{iss.orgName}</span>,
                      },
                    ]
                  : []),
                {
                  key: 'priority',
                  title: t('is.colPriority'),
                  render: (iss) => <PriorityMark priority={iss.priority} />,
                },
                {
                  key: 'status',
                  title: t('is.colStatus'),
                  render: (iss) => (
                    <div className="flex flex-col items-start gap-1">
                      <StatusChip status={iss.status} />
                      {iss.escalatedToSuperAdmin && iss.status !== 'escalated' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-300">
                          <ShieldAlert className="w-3 h-3" />
                          {t('is.tagSystem')}
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'actions',
                  title: '',
                  align: 'right',
                  render: (iss) => {
                    const open = iss.status !== 'closed' && (isSuperAdmin || !isLockedForBuilding(iss))
                    return (
                      <button
                        type="button"
                        onClick={() => openTicket(iss)}
                        className={`h-8 px-3.5 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap ml-auto ${
                          open
                            ? 'bg-sky-600 text-white hover:bg-sky-700'
                            : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        {open ? t('is.handle') : t('is.view')}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )
                  },
                },
              ]}
              data={shownIssues}
              keyExtractor={(iss) => iss.id}
              pageSize={PAGE_SIZE}
              minWidth="980px"
              emptyState={<EmptyState title={t('is.emptyTitle')} description={t('is.emptyDesc')} />}
            />
            {shownTotal > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 mt-3 text-[12px] text-slate-600 dark:text-slate-400">
                <span>{t('is.pageInfo', { page, pages: totalPages, total: shownTotal })}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className="page-btn-custom h-9 px-3 rounded-xl border flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> {t('is.prev')}
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    className="page-btn-custom h-9 px-3 rounded-xl border flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {t('is.next')} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Chi tiết phiếu: ngăn kéo bên phải */}
      {ticket &&
        createPortal(
          <div className="fixed inset-0 z-[1100] flex bg-slate-900/50 backdrop-blur-[2px]" onClick={() => setSelectedTicket(null)}>
            <aside
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex h-full w-full max-w-[560px] flex-col bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-[13px] text-sky-600 dark:text-sky-400">{ticket.ticketCode}</span>
                    <StatusChip status={ticket.status} />
                    <PriorityMark priority={ticket.priority} />
                  </div>
                  <h3 className="mt-2 text-[18px] font-bold leading-snug text-slate-900 dark:text-white">{ticket.title}</h3>
                  <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                    {t(categoryKeys[ticket.category] ?? categoryKeys.locker)} · {ticket.createdAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  aria-label={t('common.close')}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
                {(() => {
                  const owner = ownerBanner(ticket, isSuperAdmin)
                  return (
                    <div className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] font-semibold ${bannerTone[owner.tone]}`}>
                      {ticket.escalatedToSuperAdmin ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <Building2 className="w-4 h-4 shrink-0" />}
                      <span>{t(owner.key, { org: ticket.orgName })}</span>
                    </div>
                  )
                })()}

                <Stepper status={ticket.status} />

                {ticket.escalation && (
                  <section className="flex flex-col gap-1.5 rounded-2xl border border-purple-200 bg-purple-50/60 p-4 dark:border-purple-500/30 dark:bg-purple-500/10">
                    <h4 className="text-[12px] font-bold text-purple-800 dark:text-purple-300">{t('is.escInfoTitle')}</h4>
                    <p className="text-[13px] text-slate-800 dark:text-slate-100">{t('is.escInfoBy', { name: ticket.escalation.by, time: ticket.escalation.at })}</p>
                    {ticket.escalation.note && (
                      <p className="whitespace-pre-line rounded-lg bg-white/70 p-2.5 text-[12.5px] leading-relaxed text-slate-700 dark:bg-slate-900/50 dark:text-slate-200">{ticket.escalation.note}</p>
                    )}
                  </section>
                )}

                {/* Việc cần làm tiếp */}
                <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">{t('is.nextTitle')}</h4>
                  {lockedForAdmin ? (
                    <p className="text-[12.5px] leading-relaxed text-purple-700 dark:text-purple-300">{t(ticket.status === 'escalated' ? 'is.escalatedLocked' : 'is.saWorking')}</p>
                  ) : (
                    <p className="text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300">{t(`is.hint.${ticket.status}` as TranslationKey)}</p>
                  )}

                  {stepTargets.length > 0 && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                          {t('is.noteLabel')}
                          <span className="ml-1.5 font-normal text-slate-500 dark:text-slate-400">{canResolve ? t('is.noteRequired') : t('is.noteOptional')}</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder={t('is.notePh')}
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          className="setting-input-custom p-3 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">{stepTargets.map((to) => actionButton(to))}</div>
                    </>
                  )}

                  {!isSuperAdmin && !ticket.escalatedToSuperAdmin && (ticket.status === 'pending' || ticket.status === 'in_progress') && (
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                      <div>
                        <p className="text-[12.5px] font-semibold text-slate-800 dark:text-slate-100">{t('is.cantFix')}</p>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400">{t('is.escalateHint')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEscalateModal(true)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-purple-300 px-3.5 text-[12.5px] font-semibold text-purple-700 hover:bg-purple-50 dark:border-purple-500/50 dark:text-purple-300 dark:hover:bg-purple-500/10 cursor-pointer"
                      >
                        {t('is.escalateBtn')}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </section>

                {/* Thông tin chung */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[13px]">
                  <div>
                    <dt className="text-[11.5px] text-slate-500 dark:text-slate-400">{t('is.reporterLabel')}</dt>
                    <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                      {ticket.reporterName} <span className="font-normal text-slate-500 dark:text-slate-400">· {t(reporterRoleKeys[ticket.reporterRole])}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11.5px] text-slate-500 dark:text-slate-400">{t('is.phoneLabel')}</dt>
                    <dd className="mt-0.5">
                      {ticket.reporterPhone !== '—' ? (
                        <a href={`tel:${ticket.reporterPhone}`} className="inline-flex items-center gap-1.5 font-mono font-semibold text-sky-600 hover:underline dark:text-sky-400">
                          <Phone className="w-3.5 h-3.5" />
                          {ticket.reporterPhone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11.5px] text-slate-500 dark:text-slate-400">{t('is.orgLabel')}</dt>
                    <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">{ticket.orgName}</dd>
                  </div>
                  <div>
                    <dt className="text-[11.5px] text-slate-500 dark:text-slate-400">{t('is.lockerLabel')}</dt>
                    <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">{ticket.lockerCode ?? '—'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[11.5px] text-slate-500 dark:text-slate-400">{t('is.assigneeLabel')}</dt>
                    <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">{ticket.assignee ?? t('is.unassigned')}</dd>
                  </div>
                </dl>

                <section className="flex flex-col gap-1.5">
                  <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400">{t('is.descLabel')}</h4>
                  <p className="whitespace-pre-line rounded-xl bg-slate-50 p-3.5 text-[13px] leading-relaxed text-slate-800 dark:bg-slate-800/60 dark:text-slate-100">{ticket.description}</p>
                </section>

                {ticket.attachments && ticket.attachments.length > 0 && (
                  <section className="flex flex-col gap-2">
                    <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400">{t('is.evidenceLabel', { count: ticket.attachments.length })}</h4>
                    <div className="grid grid-cols-3 gap-2.5">
                      {ticket.attachments.map((imgUrl, idx) => (
                        <button
                          key={imgUrl}
                          type="button"
                          onClick={() => setPreviewImage(imgUrl)}
                          aria-label={t('is.zoom')}
                          className="group relative h-24 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <img src={imgUrl} alt={t('is.evidenceAlt', { index: idx + 1 })} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {ticket.resolutionNote && (
                  <section className="flex flex-col gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                    <h4 className="text-[12px] font-bold text-emerald-800 dark:text-emerald-300">{t('is.resolutionResult')}</h4>
                    <p className="whitespace-pre-line text-[13px] leading-relaxed text-emerald-900 dark:text-emerald-100">{ticket.resolutionNote}</p>
                  </section>
                )}

                {/* Lịch sử xử lý, mới nhất ở trên */}
                <section className="flex flex-col gap-3">
                  <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400">{t('is.timelineLabel')}</h4>
                  <ol className="flex flex-col">
                    {ticket.timeline.map((tl, i) => (
                      <li key={tl.id} className="relative flex gap-3 pb-4 last:pb-0">
                        {i < ticket.timeline.length - 1 && <span className="absolute left-[4.5px] top-3.5 bottom-0 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />}
                        <span className={`relative mt-1.5 h-[10px] w-[10px] shrink-0 rounded-full ${i === 0 ? 'bg-sky-500 ring-4 ring-sky-500/15' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
                            {tl.note || (tl.status ? t('is.tlMoved', { status: t(statusStyle[tl.status].labelKey) }) : '—')}
                          </p>
                          <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                            {tl.time} · {t('is.by', { name: tl.actor })}
                            {tl.note && tl.status && ` · ${t(statusStyle[tl.status].labelKey)}`}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            </aside>
          </div>,
          document.body,
        )}

      {/* Xem ảnh phóng to */}
      {previewImage &&
        createPortal(
          <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" onClick={() => setPreviewImage(null)}>
            <div className="relative max-h-[85vh] max-w-3xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
              <img src={previewImage} alt={t('is.previewAlt')} className="max-h-[78vh] max-w-full rounded-xl object-contain" />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                aria-label={t('common.close')}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* Xác nhận chuyển lên Super Admin */}
      {showEscalateModal &&
        ticket &&
        createPortal(
          <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowEscalateModal(false)}>
            <div onClick={(e) => e.stopPropagation()} className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">{t('is.escTitle')}</h3>
              <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{t('is.escBody', { code: ticket.ticketCode })}</p>
              <ul className="flex flex-col gap-1.5 rounded-xl bg-slate-50 p-3.5 text-[12.5px] leading-relaxed text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                {(['is.escP1', 'is.escP2', 'is.escP3'] as const).map((k) => (
                  <li key={k} className="flex gap-2">
                    <Check className="mt-0.5 w-3.5 h-3.5 shrink-0 text-purple-500" />
                    <span>{t(k)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('is.escReasonLabel')}</label>
                <textarea
                  rows={3}
                  placeholder={t('is.escReasonPh')}
                  value={escalateReasonInput}
                  onChange={(e) => setEscalateReasonInput(e.target.value)}
                  className="setting-input-custom p-3 rounded-xl text-[13px] border focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="h-10 rounded-xl px-4 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t('is.dismiss')}
                </button>
                <button
                  type="button"
                  onClick={() => handleEscalate(ticket.id)}
                  disabled={busy}
                  className="h-10 rounded-xl bg-purple-600 px-4 text-[13px] font-semibold text-white hover:bg-purple-700 disabled:opacity-60 cursor-pointer"
                >
                  {t('is.confirmEsc')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
