import { useEffect, useMemo, useState } from 'react'
import { getShipments, updateShipmentStatus } from '../../service/shipment.service'
import { freeCompartmentByLockerCode } from '../../service/lockerStation.service'
import { logActivity } from '../../service/activity.service'
import { useAuthStore } from '../../store/useAuthStore'
import type { TShipment, TShipmentFilter, TShipmentStatus } from '../../types/shipment.type'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { AppTable, type TColumn } from '../../components/common/AppTable'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import type { TranslationKey } from '../../i18n/translations'
import { Search, Archive, Package, X } from 'lucide-react'

const statusBadges: Record<TShipmentStatus, { labelKey: TranslationKey; style: string }> = {
  pending:          { labelKey: 'sh.st.pending', style: 'bg-slate-100 text-slate-700 border-slate-300' },
  waiting_pickup:   { labelKey: 'sh.st.waiting_pickup', style: 'bg-amber-100 text-amber-800 border-amber-300' },
  stored:           { labelKey: 'sh.st.stored', style: 'bg-sky-100 text-sky-800 border-sky-300' },
  picked_up:        { labelKey: 'sh.st.picked_up', style: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  expired:          { labelKey: 'sh.st.expired', style: 'bg-red-100 text-red-800 border-red-300' },
  moved_to_storage: { labelKey: 'sh.st.moved_to_storage', style: 'bg-purple-100 text-purple-800 border-purple-300' },
  failed:           { labelKey: 'sh.st.failed', style: 'bg-rose-100 text-rose-800 border-rose-300' },
}

export function ShipmentsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const toast = useToast()
  const { user: loggedUser } = useAuthStore()

  const [shipments, setShipments] = useState<TShipment[]>([])
  const [filter, setFilter] = useState<TShipmentFilter>({
    search: '',
    shipmentStatus: 'all',
    otpStatus: 'all',
    cluster: 'all',
  })

  // Modal State for Move to Secondary Storage
  const [storageModalShipment, setStorageModalShipment] = useState<TShipment | null>(null)
  const [storageLocation, setStorageLocation] = useState('')

  useEffect(() => {
    getShipments().then(setShipments)
  }, [])

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const keyword = filter.search.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        `${s.shipmentCode} ${s.recipientName} ${s.recipientPhone} ${s.lockerCode} ${s.cluster}`
          .toLowerCase()
          .includes(keyword)
      const matchShipmentStatus =
        filter.shipmentStatus === 'all' || s.shipmentStatus === filter.shipmentStatus
      const matchOtpStatus = filter.otpStatus === 'all' || s.otpStatus === filter.otpStatus
      const matchCluster = filter.cluster === 'all' || s.cluster === filter.cluster

      return matchSearch && matchShipmentStatus && matchOtpStatus && matchCluster
    })
  }, [shipments, filter])

  // Count metrics for quick filter badges
  const waitingPickupCount = useMemo(() => shipments.filter((s) => s.shipmentStatus === 'waiting_pickup').length, [shipments])
  const completedCount = useMemo(() => shipments.filter((s) => s.shipmentStatus === 'picked_up').length, [shipments])
  const expiredCount = useMemo(() => shipments.filter((s) => s.shipmentStatus === 'expired').length, [shipments])

  function handleOpenStorageModal(shipment: TShipment) {
    setStorageModalShipment(shipment)
    setStorageLocation(t('sh.defaultLocation'))
  }

  function handleConfirmMoveToStorage() {
    if (!storageModalShipment) return
    const targetCode = storageModalShipment.shipmentCode
    const lockerCode = storageModalShipment.lockerCode
    const locationNote = storageLocation.trim() || t('sh.defaultLocationShort')

    updateShipmentStatus(storageModalShipment.id, 'moved_to_storage', locationNote).then(() => {
      freeCompartmentByLockerCode(lockerCode).then(() => {
        const updated = shipments.map((item) => {
          if (item.id === storageModalShipment.id) {
            return {
              ...item,
              shipmentStatus: 'moved_to_storage' as TShipmentStatus,
              storageLocationNote: locationNote,
            }
          }
          return item
        })
        setShipments(updated)

        logActivity({
          actorName: loggedUser?.fullName || 'Admin',
          actorRole: 'admin',
          category: 'shipment',
          status: 'info',
          title: t('sh.logTitle'),
          description: t('sh.logDesc', { code: targetCode, location: locationNote, locker: lockerCode }),
          targetId: storageModalShipment.id,
          targetType: 'shipment',
          targetLabel: targetCode,
        })

        toast.success(t('sh.movedToast', { code: targetCode, location: locationNote, locker: lockerCode }))
        setStorageModalShipment(null)
        setStorageLocation('')
      })
    })
  }

  const columns: TColumn<TShipment>[] = [
    {
      key: 'shipmentCode',
      title: t('shipments.colCode'),
      render: (s) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono font-bold text-sky-700 dark:text-sky-400 text-[13px]">{s.shipmentCode}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 w-max">
            {t('sh.lockerCluster', { code: s.lockerCode, cluster: s.cluster })}
          </span>
        </div>
      ),
    },
    {
      key: 'recipientName',
      title: t('shipments.colRecipient'),
      render: (s) => (
        <div className="flex flex-col text-[12px]">
          <span className="font-bold text-slate-900 dark:text-white">{s.recipientName}</span>
          <span className="font-mono text-slate-500 dark:text-slate-400">{s.recipientPhone}</span>
          <span className="text-[11px] text-slate-400 mt-0.5">{t('sh.by', { name: s.shipperName })}</span>
        </div>
      ),
    },
    {
      key: 'stepperProgress',
      title: t('shipments.colProgress'),
      render: (s) => (
        <div className="flex items-center gap-1.5 text-[11.5px] font-mono whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-[11px] ${s.shipmentStatus !== 'pending' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700' : 'text-slate-400'}`}>
            {t('shipments.step1')}
          </span>
          <span className="text-slate-300 dark:text-slate-600">→</span>
          <span className={`px-2 py-0.5 rounded text-[11px] ${s.otpStatus === 'active' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700' : 'text-slate-400'}`}>
            {t('shipments.step2')}
          </span>
          <span className="text-slate-300 dark:text-slate-600">→</span>
          <span className={`px-2 py-0.5 rounded text-[11px] ${s.shipmentStatus === 'picked_up' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold' : 'text-slate-400'}`}>
            {t('shipments.step3')}
          </span>
        </div>
      ),
    },
    {
      key: 'otpStatus',
      title: t('shipments.colOtp'),
      render: (s) => {
        const badge = statusBadges[s.shipmentStatus] ?? statusBadges.waiting_pickup
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold">
              <span className={`w-2 h-2 rounded-full ${
                s.shipmentStatus === 'picked_up' ? 'bg-emerald-500' : s.shipmentStatus === 'waiting_pickup' ? 'bg-sky-500 animate-pulse' : s.shipmentStatus === 'expired' ? 'bg-red-500' : s.shipmentStatus === 'moved_to_storage' ? 'bg-purple-500' : 'bg-slate-400'
              }`} />
              <span className={s.shipmentStatus === 'picked_up' ? 'text-emerald-600 dark:text-emerald-400' : s.shipmentStatus === 'waiting_pickup' ? 'text-sky-600 dark:text-sky-400' : s.shipmentStatus === 'expired' ? 'text-red-600' : s.shipmentStatus === 'moved_to_storage' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'}>
                {t(badge.labelKey)}
              </span>
            </div>
            {s.storageLocationNote && (
              <span className="text-[10.5px] font-mono text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 w-max">
                📍 {s.storageLocationNote}
              </span>
            )}
            {s.otpCode && !s.storageLocationNote && (
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {t('sh.otpCode')} <strong className="text-slate-900 dark:text-white font-bold">{s.otpCode}</strong>
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'actions',
      title: t('shipments.colActions'),
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          {s.shipmentStatus === 'expired' && (
            <button
              type="button"
              onClick={() => handleOpenStorageModal(s)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white transition-all text-[11px] font-semibold cursor-pointer shadow-2xs active:scale-95"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{t('sh.moveBtn')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(`/shipments/${s.id}`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white transition-all text-[11px] font-semibold font-mono cursor-pointer shadow-2xs active:scale-95"
          >
            👁️ {t('common.details')}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-[1250px] relative">

      {/* Compact Top Bar - Streamlined Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-700">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-slate-900 leading-tight">{t('shipments.title')}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                {filteredShipments.length} {t('shipments.orders')}
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">{t('shipments.desc')}</p>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter((p) => ({ ...p, shipmentStatus: 'all' }))}
            className={[
              "px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer border",
              filter.shipmentStatus === 'all'
                ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200",
            ].join(" ")}
          >
            {t('shipments.allFilter')} ({shipments.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter((p) => ({ ...p, shipmentStatus: 'waiting_pickup' }))}
            className={[
              "px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer border",
              filter.shipmentStatus === 'waiting_pickup'
                ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
            ].join(" ")}
          >
            {t('shipments.waitingFilter')} ({waitingPickupCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter((p) => ({ ...p, shipmentStatus: 'expired' }))}
            className={[
              "px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer border",
              filter.shipmentStatus === 'expired'
                ? "bg-red-600 text-white border-red-600 shadow-2xs"
                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
            ].join(" ")}
          >
            {t('sh.expiredFilter')} ({expiredCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter((p) => ({ ...p, shipmentStatus: 'picked_up' }))}
            className={[
              "px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer border",
              filter.shipmentStatus === 'picked_up'
                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
            ].join(" ")}
          >
            {t('shipments.completedFilter')} ({completedCount})
          </button>
        </div>
      </section>

      {/* Filter Bar */}
      <div data-reveal className="setting-card-custom p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-2xs border">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={t('sh.searchPh')}
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="setting-input-custom w-full h-10 pl-9 pr-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <select
            value={filter.cluster}
            onChange={(e) => setFilter((prev) => ({ ...prev, cluster: e.target.value as any }))}
            className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer w-full md:w-48"
          >
            <option value="all">{t('sh.allClusters')}</option>
            <option value="A">{t('lockers.clusterA')}</option>
            <option value="B">{t('lockers.clusterB')}</option>
            <option value="C">{t('lockers.clusterC')}</option>
          </select>
        </div>
      </div>

      {/* Main Logistics Parcel Board Table using Reusable AppTable Component */}
      <div data-reveal>
        <AppTable
          columns={columns}
          data={filteredShipments}
          pageSize={6}
          minWidth="1000px"
          emptyState={
            <EmptyState
              title={t('sh.emptyTitle')}
              description={t('sh.emptyDesc')}
            />
          }
        />
      </div>

      {/* Move to Storage Modal */}
      {storageModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col p-6 gap-4">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-snug">
                    {t('sh.modalTitle')}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('sh.orderLabel')} <strong className="text-purple-600 dark:text-purple-400 font-bold">{storageModalShipment.shipmentCode}</strong> {t('sh.lockerShort', { code: storageModalShipment.lockerCode })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStorageModalShipment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info notice */}
            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 text-[12px] text-purple-800 dark:text-purple-300 leading-relaxed">
              📦 {t('sh.noticePre')} <strong>{t('sh.noticeBold')}</strong> {t('sh.noticePost')}
            </div>

            {/* Storage location input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                {t('sh.locationLabel')}
              </label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder={t('sh.locationPh')}
                className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStorageModalShipment(null)}
                className="h-10 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmMoveToStorage}
                className="h-10 px-4 rounded-xl text-[12.5px] font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <Package className="w-4 h-4" />
                <span>{t('sh.confirmMove')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
