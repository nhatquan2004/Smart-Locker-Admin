import {
  AlertTriangle,
  MapPinOff,
  PanelLeftClose,
  Pencil,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import type { TIssueItem } from '../../types/issue.type'
import { useTranslation } from '../../context/LanguageContext'
import { FILTER_OPTIONS, STATUS_META } from './constants'
import type { LockerFilter, LockerMapItem } from './types'
import { statusMeta } from './utils'

type Props = {
  title: string
  subtitle: string
  search: string
  onSearch: (value: string) => void
  filter: LockerFilter
  onFilter: (value: LockerFilter) => void
  counts: Record<LockerFilter, number>
  lockers: LockerMapItem[]
  noCoords: LockerMapItem[]
  loading: boolean
  error: string | null
  onRetry: () => void
  selectedId: string | null
  issuesByCode: Map<string, TIssueItem[]>
  onSelect: (locker: LockerMapItem) => void
  onEdit: (locker: LockerMapItem) => void
  onClose: () => void
}

function StatusPill({ status }: { status: LockerMapItem['status'] }) {
  const { t } = useTranslation()
  const meta = statusMeta(status)
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.soft} ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {t(meta.labelKey)}
    </span>
  )
}

function LockerCard({
  locker,
  active,
  issueCount,
  onSelect,
  onEdit,
}: {
  locker: LockerMapItem
  active: boolean
  issueCount: number
  onSelect: () => void
  onEdit: () => void
}) {
  const { t } = useTranslation()
  const capacity =
    locker.availableBoxes !== undefined
      ? t('map.capacity', { avail: locker.availableBoxes, total: locker.totalBoxes })
      : t('map.boxes', { count: locker.totalBoxes })

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={`group cursor-pointer rounded-xl px-3 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 ${
        active
          ? 'bg-sky-50 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:ring-sky-500/30'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">
            {locker.name}
          </p>
          <p className="mt-0.5 truncate text-[11.5px] text-slate-500 dark:text-slate-400">
            <span className="font-mono">{locker.code}</span>
            {locker.buildingId?.name && ` · ${locker.buildingId.name}`}
          </p>
        </div>
        <StatusPill status={locker.status} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11.5px]">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span>{capacity}</span>
          {issueCount > 0 && (
            <span className="inline-flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-3 w-3" />
              {t('map.issueCount', { count: issueCount })}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          title={t('map.editLocation')}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-100"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function LockerPanel(props: Props) {
  const { t } = useTranslation()
  const {
    title,
    subtitle,
    search,
    onSearch,
    filter,
    onFilter,
    counts,
    lockers,
    noCoords,
    loading,
    error,
    onRetry,
    selectedId,
    issuesByCode,
    onSelect,
    onEdit,
    onClose,
  } = props

  const isEmpty = lockers.length === 0 && noCoords.length === 0

  return (
    <aside className="absolute left-3 top-3 bottom-3 z-10 flex w-[min(344px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_10px_40px_rgba(15,23,42,0.14)] backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/95">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <h1 className="text-[16px] font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-0.5 truncate text-[12px] text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          title={t('map.collapse')}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-2.5 px-4 pb-3 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('map.searchPh')}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-[12.5px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-sky-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onFilter(opt.id)}
                className={`h-7 rounded-full px-2.5 text-[11.5px] font-medium transition-colors ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {t(opt.labelKey)}
                <span className={`ml-1 ${active ? 'opacity-70' : 'text-slate-400'}`}>
                  {counts[opt.id]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto border-t border-slate-100 px-2 py-2 dark:border-slate-800">
        {error && (
          <div className="mx-1 mb-2 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-[12px] text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="break-words">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-1 font-medium underline underline-offset-2"
              >
                {t('map.retry')}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-[12.5px] text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {t('map.loadingList')}
          </div>
        ) : isEmpty && !error ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 px-6 text-center text-[12.5px] text-slate-400">
            <MapPinOff className="h-6 w-6 opacity-60" />
            {t('map.noMatch')}
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-0.5">
              {lockers.map((l) => (
                <li key={l._id}>
                  <LockerCard
                    locker={l}
                    active={selectedId === l._id}
                    issueCount={issuesByCode.get(l.code)?.length ?? 0}
                    onSelect={() => onSelect(l)}
                    onEdit={() => onEdit(l)}
                  />
                </li>
              ))}
            </ul>

            {noCoords.length > 0 && (
              <section className="mt-3 border-t border-dashed border-slate-200 px-1 pt-3 dark:border-slate-700">
                <h2 className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t('map.noLocation', { count: noCoords.length })}
                </h2>
                <ul className="flex flex-col gap-0.5">
                  {noCoords.map((l) => (
                    <li
                      key={l._id}
                      className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-slate-800 dark:text-slate-100">
                          {l.name}
                        </p>
                        <p className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {l.code}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onEdit(l)}
                        className="h-7 shrink-0 rounded-lg bg-sky-600 px-2.5 text-[11.5px] font-medium text-white transition-colors hover:bg-sky-700"
                      >
                        {t('map.setLocation')}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {Object.entries(STATUS_META).map(([id, m]) => (
          <span key={id} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${m.dot}`} />
            {t(m.labelKey)}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-600 ring-2 ring-rose-200 dark:ring-rose-900" />
          {t('map.legendIssues')}
        </span>
      </div>
    </aside>
  )
}
