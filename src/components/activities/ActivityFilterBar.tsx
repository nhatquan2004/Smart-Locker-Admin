import type { TActivityCategory, TActivityFilter, TActivityRole, TActivityStatus } from '../../types/activity.type'

type TProps = {
  filter: TActivityFilter
  onChange: (nextFilter: TActivityFilter) => void
}

const roleOptions: Array<'all' | TActivityRole> = ['all', 'customer', 'shipper', 'admin', 'system']
const categoryOptions: Array<'all' | TActivityCategory> = ['all', 'shipment', 'otp', 'locker', 'hardware', 'settings', 'user']
const statusOptions: Array<'all' | TActivityStatus> = ['all', 'success', 'info', 'warning', 'error']

const roleLabels: Record<string, string> = {
  all: 'Tất cả vai trò', customer: 'Customer', shipper: 'Shipper', admin: 'Admin', system: 'System',
}
const categoryLabels: Record<string, string> = {
  all: 'Tất cả loại', shipment: 'Shipment', otp: 'OTP', locker: 'Locker', hardware: 'Hardware', settings: 'Settings', user: 'User',
}
const statusLabels: Record<string, string> = {
  all: 'Tất cả trạng thái', success: 'Success', info: 'Info', warning: 'Warning', error: 'Error',
}

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const selectClass = "h-9 w-full pl-3 pr-8 rounded-lg text-[13px] font-medium appearance-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 transition-all duration-150 cursor-pointer focus:outline-none focus:border-sky-500"
const labelClass = "text-[11px] font-medium text-[--color-muted]"

export function ActivityFilterBar({ filter, onChange }: TProps) {
  return (
    <section className="flex flex-wrap gap-3 p-5 rounded-2xl border border-[--color-border] bg-[--color-surface]">
      {/* Search */}
      <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
        <label htmlFor="activity-search" className={labelClass}>Tìm hoạt động</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-muted] pointer-events-none"><SearchIcon /></span>
          <input
            id="activity-search"
            type="text"
            className="h-9 w-full pl-9 pr-3 rounded-lg text-[13px] bg-[--color-surface-2] text-[--color-text] border border-[--color-border] placeholder:text-[--color-muted] transition-all duration-150 focus:outline-none focus:border-[--color-accent] focus:bg-[--color-surface-3]"
            placeholder="Tên actor, locker, shipment, OTP..."
            value={filter.search}
            onChange={(e) => onChange({ ...filter, search: e.target.value })}
          />
        </div>
      </div>

      {/* Role */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="activity-role" className={labelClass}>Vai trò</label>
        <div className="relative">
          <select id="activity-role" className={selectClass} value={filter.role} onChange={(e) => onChange({ ...filter, role: e.target.value as TActivityFilter['role'] })}>
            {roleOptions.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[--color-muted] pointer-events-none"><ChevronIcon /></span>
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="activity-category" className={labelClass}>Danh mục</label>
        <div className="relative">
          <select id="activity-category" className={selectClass} value={filter.category} onChange={(e) => onChange({ ...filter, category: e.target.value as TActivityFilter['category'] })}>
            {categoryOptions.map((cat) => <option key={cat} value={cat}>{categoryLabels[cat]}</option>)}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[--color-muted] pointer-events-none"><ChevronIcon /></span>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="activity-status" className={labelClass}>Trạng thái</label>
        <div className="relative">
          <select id="activity-status" className={selectClass} value={filter.status} onChange={(e) => onChange({ ...filter, status: e.target.value as TActivityFilter['status'] })}>
            {statusOptions.map((st) => <option key={st} value={st}>{statusLabels[st]}</option>)}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[--color-muted] pointer-events-none"><ChevronIcon /></span>
        </div>
      </div>
    </section>
  )
}
