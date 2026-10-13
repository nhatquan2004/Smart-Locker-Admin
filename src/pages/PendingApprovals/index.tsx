import { useEffect, useMemo, useState } from 'react'
import { Check, XCircle, Clock, User, Building2, Search, RefreshCw, Loader2, AlertTriangle, X } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import { formatDate, formatDateTime, formatRelativeTime } from '../../i18n/format'
import { tNow } from '../../i18n/translate'
import {
  getPendingResidents,
  approveResident,
  rejectResident,
  type TPendingResident,
} from '../../service/approval.service'
import { logActivity } from '../../service/activity.service'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'

import {
  getNotificationSocket,
  joinBuildingRoom,
  leaveBuildingRoom,
} from '../../service/socket.service'

export function PendingApprovalsPage() {
  const toast = useToast()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const [pendingList, setPendingList] = useState<TPendingResident[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal State
  const [selectedResident, setSelectedResident] = useState<TPendingResident | null>(null)
  const [modalMode, setModalMode] = useState<'detail' | 'reject'>('detail')
  const [rejectReason, setRejectReason] = useState('')
  const [isActioning, setIsActioning] = useState<'approve' | 'reject' | null>(null)

  const fetchPending = async () => {
    setLoading(true)
    try {
      const data = await getPendingResidents()
      setPendingList(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : tNow('pend.loadFailed')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()

    const socket = getNotificationSocket()
    const targetBuildingId = user?.buildingId || (user?.orgId !== 'all' ? user?.orgId : undefined)

    if (targetBuildingId) {
      joinBuildingRoom(targetBuildingId)
    }

    const handleUpdate = () => {
      fetchPending()
    }

    socket.on('NEW_PENDING_RESIDENT', handleUpdate)
    socket.on('RESIDENT_APPROVAL_RESULT', handleUpdate)

    return () => {
      socket.off('NEW_PENDING_RESIDENT', handleUpdate)
      socket.off('RESIDENT_APPROVAL_RESULT', handleUpdate)
      if (targetBuildingId) {
        leaveBuildingRoom(targetBuildingId)
      }
    }
  }, [user?.buildingId, user?.orgId])

  const filteredList = useMemo(() => {
    return pendingList.filter((r) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.apartment && r.apartment.toLowerCase().includes(q))
      )
    })
  }, [pendingList, search])

  // Approve action
  async function handleApprove(resident: TPendingResident) {
    if (isActioning) return
    setIsActioning('approve')
    try {
      await approveResident(resident._id)
      setPendingList((prev) => prev.filter((r) => r._id !== resident._id))
      logActivity({
        actorName: user?.fullName || 'Admin',
        actorRole: 'admin',
        title: tNow('approval.logApproveTitle'),
        description: tNow('approval.logApproveDesc', { name: resident.name, phone: resident.phone, apartment: resident.apartment }),
        targetId: resident._id,
        targetType: 'user',
        targetLabel: resident.name,
        category: 'user',
        status: 'success',
      })
      toast.success(tNow('approval.approvedToast'))
      setSelectedResident(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : tNow('pend.approveFailed')
      toast.error(msg)
    } finally {
      setIsActioning(null)
    }
  }

  // Reject action
  async function handleReject() {
    if (!selectedResident || isActioning) return
    if (!rejectReason.trim()) {
      toast.error(tNow('approval.reasonRequired'))
      return
    }
    setIsActioning('reject')
    try {
      await rejectResident(selectedResident._id, rejectReason.trim())
      setPendingList((prev) => prev.filter((r) => r._id !== selectedResident._id))
      logActivity({
        actorName: user?.fullName || 'Admin',
        actorRole: 'admin',
        title: tNow('approval.logRejectTitle'),
        description: tNow('approval.logRejectDesc', { name: selectedResident.name, phone: selectedResident.phone, reason: rejectReason.trim() }),
        targetId: selectedResident._id,
        targetType: 'user',
        targetLabel: selectedResident.name,
        category: 'user',
        status: 'warning',
      })
      toast.success(tNow('approval.rejectedToast', { name: selectedResident.name }))
      setSelectedResident(null)
      setRejectReason('')
      setModalMode('detail')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : tNow('pend.rejectFailed')
      toast.error(msg)
    } finally {
      setIsActioning(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">
      {/* Header Banner */}
      <section data-reveal className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[19px] font-bold text-slate-900 dark:text-white leading-tight">
                {t('pend.title')}
              </h1>
              <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 font-mono">
                {t('pend.count', { count: pendingList.length })}
              </span>
            </div>
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t('pend.desc')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchPending}
          disabled={loading}
          className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[12.5px] font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('common.refresh')}</span>
        </button>
      </section>

      {/* Search Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('pend.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 rounded-xl text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 shadow-2xs"
          />
        </div>
      </div>

      {/* List / Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        {loading && pendingList.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-[13px]">{t('pend.loading')}</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title={t('pend.emptyTitle')}
              description={search ? t('pend.emptyDescSearch') : t('pend.emptyDescDone')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 text-[11.5px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">{t('pend.colResident')}</th>
                  <th className="py-3.5 px-4">{t('pend.colContact')}</th>
                  <th className="py-3.5 px-4">{t('pend.colApartment')}</th>
                  <th className="py-3.5 px-4">{t('pend.colSubmitted')}</th>
                  <th className="py-3.5 px-4 text-center">{t('pend.colStatus')}</th>
                  <th className="py-3.5 px-4 text-right">{t('pend.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
                {filteredList.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 font-bold text-amber-700 dark:text-amber-400 text-[12px]">
                          {r.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{r.name}</div>
                          <div className="text-[11.5px] text-slate-500 font-mono">ID: {r._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-medium text-slate-900 dark:text-slate-200">{r.phone}</div>
                      <div className="text-[11.5px] text-slate-500">{r.email || '—'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        {t('pend.apartmentValue', { apartment: r.apartment })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatRelativeTime(r.createdAt)}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(r.createdAt)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono">
                        {t('bell.pendingBadge')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedResident(r)
                            setModalMode('detail')
                          }}
                          className="h-8 px-3 rounded-lg text-[12px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {t('common.details')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedResident(r)
                            setModalMode('reject')
                          }}
                          className="h-8 px-3 rounded-lg text-[12px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 hover:bg-red-600 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {t('pend.rejectShort')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(r)}
                          disabled={isActioning === 'approve'}
                          className="h-8 px-3.5 rounded-lg text-[12px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs flex items-center gap-1 active:scale-95 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {t('approval.approve')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DETAIL / ACTION MODAL ── */}
      {selectedResident && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                {modalMode === 'reject' ? t('pend.modalRejectTitle') : t('approval.detailTitle')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedResident(null)
                  setModalMode('detail')
                  setRejectReason('')
                }}
                disabled={!!isActioning}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {modalMode === 'detail' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: t('approval.fieldName'), value: selectedResident.name, icon: <User className="w-3.5 h-3.5" /> },
                      { label: t('approval.fieldPhone'), value: selectedResident.phone, mono: true },
                      { label: 'Email', value: selectedResident.email, mono: true },
                      { label: t('approval.fieldApartment'), value: selectedResident.apartment, icon: <Building2 className="w-3.5 h-3.5" /> },
                    ].map((f) => (
                      <div key={f.label} className="flex flex-col gap-0.5">
                        <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{f.label}</span>
                        <span className={`text-[13px] font-semibold text-slate-900 dark:text-white ${f.mono ? 'font-mono' : ''}`}>{f.value || '—'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('approval.submittedAt')}</span>
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-white">
                      {formatDateTime(selectedResident.createdAt)} ({formatRelativeTime(selectedResident.createdAt)})
                    </span>
                  </div>

                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t('pend.afterApproval')}
                  </p>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[12.5px] font-semibold text-red-800 dark:text-red-300">{t('approval.rejectBannerTitle', { name: selectedResident.name })}</p>
                      <p className="text-[11.5px] text-red-600 dark:text-red-400 mt-0.5">{t('approval.irreversible')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                      {t('approval.reasonLabel')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder={t('approval.reasonPlaceholder')}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-400 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              {modalMode === 'detail' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setModalMode('reject')}
                    disabled={!!isActioning}
                    className="h-9 px-4 rounded-xl text-[12.5px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 hover:bg-red-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {t('approval.reject')}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedResident(null)}
                      disabled={!!isActioning}
                      className="h-9 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {t('common.close')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedResident)}
                      disabled={!!isActioning}
                      className="h-9 px-4 rounded-xl text-[12.5px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      {isActioning === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      {isActioning === 'approve' ? t('approval.approving') : t('approval.approve')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setModalMode('detail')}
                    disabled={!!isActioning}
                    className="h-9 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    ← {t('common.back')}
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={!!isActioning || !rejectReason.trim()}
                    className="h-9 px-4 rounded-xl text-[12.5px] font-bold bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isActioning === 'reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isActioning === 'reject' ? t('approval.rejecting') : t('approval.confirmReject')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
