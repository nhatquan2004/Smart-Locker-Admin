import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { getShipmentCounts, getShipments } from '../../service/shipment.service'
import { getOrganizations } from '../../service/organization.service'
import type { TShipment, TShipmentStatus } from '../../types/shipment.type'
import type { TOrganization } from '../../types/organization.type'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { AppTable, type TColumn } from '../../components/common/AppTable'
import { ShipmentStatusBadge } from '../../components/Shipments/ShipmentStatusBadge'
import { ShipmentActions } from '../../components/Shipments/ShipmentActions'
import { useAuthStore } from '../../store/useAuthStore'
import { useTranslation } from '../../context/LanguageContext'
import { formatDateTime } from '../../i18n/format'
import type { TranslationKey } from '../../i18n/translations'

const PAGE_SIZE = 20

type TStatusFilter = 'all' | TShipmentStatus

const pills: { id: TStatusFilter; labelKey: TranslationKey; active: string; idle: string }[] = [
  { id: 'all', labelKey: 'shipments.allFilter', active: 'bg-sky-600 text-white border-sky-600', idle: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' },
  { id: 'WAITING_FOR_PICKUP', labelKey: 'shipments.waitingFilter', active: 'bg-amber-500 text-white border-amber-500', idle: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' },
  { id: 'OVERDUE', labelKey: 'pkg.overdueFilter', active: 'bg-red-600 text-white border-red-600', idle: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  { id: 'PICKED_UP', labelKey: 'shipments.completedFilter', active: 'bg-emerald-600 text-white border-emerald-600', idle: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' },
  { id: 'RETURNED', labelKey: 'pkg.returnedFilter', active: 'bg-purple-600 text-white border-purple-600', idle: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100' },
]

export function ShipmentsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isSuperAdmin = useAuthStore((s) => s.user?.role === 'super_admin')

  const [items, setItems] = useState<TShipment[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState<Record<TStatusFilter, number> | null>(null)
  const [orgs, setOrgs] = useState<TOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState<TStatusFilter>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [buildingId, setBuildingId] = useState('')
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((n) => n + 1), [])

  // Chỉ gửi truy vấn tìm kiếm sau khi người dùng ngừng gõ
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!isSuperAdmin) return
    getOrganizations().then(setOrgs).catch(() => setOrgs([]))
  }, [isSuperAdmin])

  useEffect(() => {
    let active = true
    getShipments({
      status: status === 'all' ? undefined : status,
      search,
      buildingId: buildingId || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (!active) return
        setItems(res.items)
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
  }, [status, search, buildingId, page, reloadKey])

  // Số lượng theo trạng thái cho các nút lọc nhanh
  useEffect(() => {
    let active = true
    getShipmentCounts({ buildingId: buildingId || undefined })
      .then((c) => {
        if (active) setCounts(c)
      })
      .catch(() => {
        if (active) setCounts(null)
      })
    return () => {
      active = false
    }
  }, [buildingId, reloadKey])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function changeStatus(next: TStatusFilter) {
    setStatus(next)
    setPage(1)
  }

  const columns: TColumn<TShipment>[] = [
    {
      key: 'trackingNumber',
      title: t('pkg.colTracking'),
      render: (s) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono font-bold text-sky-700 dark:text-sky-400 text-[13px]">{s.trackingNumber}</span>
          <span className="inline-flex items-center text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 w-max">
            {s.lockerCode ? t('pkg.lockerBox', { code: s.lockerCode, box: s.boxNumber }) : t('pkg.boxOnly', { box: s.boxNumber })}
          </span>
          {s.buildingName && <span className="text-[11px] text-slate-400">{s.buildingName}</span>}
        </div>
      ),
    },
    {
      key: 'receiver',
      title: t('pkg.colReceiver'),
      render: (s) => (
        <div className="flex flex-col text-[12px]">
          <span className="font-bold text-slate-900 dark:text-white">{s.receiverName}</span>
          <span className="font-mono text-slate-500 dark:text-slate-400">{s.receiverPhone}</span>
          <span className="text-[11px] text-slate-400 mt-0.5">{t('pkg.apartment', { apartment: s.apartment })}</span>
        </div>
      ),
    },
    {
      key: 'shipper',
      title: t('pkg.colShipper'),
      render: (s) => (
        <div className="flex flex-col text-[12px]">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{s.shipperName || s.carrierName}</span>
          <span className="font-mono text-slate-500 dark:text-slate-400">{s.shipperPhone}</span>
          <span className="text-[11px] text-slate-400 mt-0.5">{s.carrierName}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: t('pkg.colStatus'),
      render: (s) => (
        <div className="flex flex-col gap-1.5">
          <ShipmentStatusBadge status={s.status} />
          <div className="flex flex-col text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>{t('pkg.droppedAt', { time: formatDateTime(s.droppedOffAt) })}</span>
            {s.status === 'PICKED_UP' && s.pickedUpAt ? (
              <span>{t('pkg.pickedAt', { time: formatDateTime(s.pickedUpAt) })}</span>
            ) : (
              <span>{t('pkg.expiredAt', { time: formatDateTime(s.expiredAt) })}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: t('shipments.colActions'),
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <ShipmentActions shipment={s} onChanged={reload} />
          <button
            type="button"
            onClick={() => navigate(`/shipments/${s.id}`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-800 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 transition-all text-[11px] font-semibold cursor-pointer active:scale-95"
          >
            {t('common.details')}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-[1250px] relative">

      <section data-reveal className="rounded-2xl glass-card hero-gradient p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-bold text-slate-900 dark:text-white leading-tight">{t('shipments.title')}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
              {total} {t('shipments.orders')}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{t('shipments.desc')}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {pills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => changeStatus(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer border ${
                status === pill.id ? pill.active : pill.idle
              }`}
            >
              {t(pill.labelKey)}
              {counts && ` (${counts[pill.id]})`}
            </button>
          ))}
        </div>
      </section>

      <div data-reveal className="setting-card-custom p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-2xs border">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={t('pkg.searchPh')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="setting-input-custom w-full h-10 pl-9 pr-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
          />
        </div>

        {isSuperAdmin && (
          <select
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value)
              setPage(1)
            }}
            aria-label={t('pkg.allOrgs')}
            className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer w-full md:w-60"
          >
            <option value="">{t('pkg.allOrgs')}</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        )}
      </div>

      <div data-reveal>
        {loading ? (
          <div className="p-10 text-center text-[13px] text-slate-500 dark:text-slate-400">{t('common.loading')}</div>
        ) : error !== null ? (
          <EmptyState title={t('common.noData')} description={t('pkg.loadFailed', { message: error })} />
        ) : (
          <>
            <AppTable
              columns={columns}
              data={items}
              keyExtractor={(s) => s.id}
              pageSize={PAGE_SIZE}
              minWidth="1000px"
              emptyState={<EmptyState title={t('pkg.emptyTitle')} description={t('pkg.emptyDesc')} />}
            />
            {total > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 mt-3 text-[12px] text-slate-600 dark:text-slate-400">
                <span>{t('pkg.pageInfo', { page, pages: totalPages, total })}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="page-btn-custom h-9 px-3 rounded-xl border flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> {t('pkg.prev')}
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="page-btn-custom h-9 px-3 rounded-xl border flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {t('pkg.next')} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
