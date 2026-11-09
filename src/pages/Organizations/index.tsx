import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/common'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { deleteOrganization, getOrganizations } from '../../service/organization.service'
import { CreateOrgModal } from '../../components/Organizations/CreateOrgModal'
import { AddLockerModal } from '../../components/Lockers/AddLockerModal'
import type { TOrganization, TOrgType } from '../../types/organization.type'
import { useAuthStore } from '../../store/useAuthStore'
import { useTranslation } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { AlertTriangle, Trash2, X } from 'lucide-react'

export function OrganizationsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const toast = useToast()

  const [organizations, setOrganizations] = useState<TOrganization[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // 2-Step Delete Modal State
  const [deleteTargetOrg, setDeleteTargetOrg] = useState<TOrganization | null>(null)
  const [confirmOrgName, setConfirmOrgName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const typeBadges: Record<TOrgType, { label: string; style: string }> = {
    enterprise: { label: t('org.typeOffice'), style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    apartment: { label: t('org.typeHostel'), style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    dormitory: { label: t('org.typeUniversity'), style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    commercial: { label: t('org.typeCommercial'), style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  }

  // Doanh nghiệp vừa tạo xong, mở luôn hộp thoại thêm trạm tủ đầu tiên
  const [stationOrg, setStationOrg] = useState<TOrganization | null>(null)

  useEffect(() => {
    getOrganizations().then(setOrganizations)
  }, [])

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      const keyword = search.trim().toLowerCase()
      const matchSearch = !keyword || `${org.name} ${org.code} ${org.adminName} ${org.address}`.toLowerCase().includes(keyword)
      const matchType = typeFilter === 'all' || org.type === typeFilter
      return matchSearch && matchType
    })
  }, [organizations, search, typeFilter])

  function handleOpenDeleteModal(org: TOrganization) {
    setDeleteTargetOrg(org)
    setConfirmOrgName('')
  }

  function handleConfirmDelete() {
    if (!deleteTargetOrg || confirmOrgName !== deleteTargetOrg.name) return
    const targetName = deleteTargetOrg.name
    setIsDeleting(true)

    deleteOrganization(deleteTargetOrg.id).then(() => {
      setOrganizations((prev) => prev.filter((o) => o.id !== deleteTargetOrg.id))
      toast.success(t('org.deletedToast', { name: targetName }))
      setIsDeleting(false)
      setDeleteTargetOrg(null)
      setConfirmOrgName('')
    }).catch(() => {
      toast.error(t('org.deleteFailed', { name: targetName }))
      setIsDeleting(false)
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1250px] relative">

      {/* Hero */}
      <section data-reveal className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xs">
        <div className="relative z-10 flex-1 min-w-0">
          <h1 className="text-[20px] sm:text-[22px] font-bold text-slate-900 dark:text-white leading-tight">
            {t('org.title')}
          </h1>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
            {t('org.desc')}
          </p>
        </div>

        {user?.role === 'super_admin' && (
          <AppButton
            onClick={() => setIsCreateModalOpen(true)}
            className="shrink-0"
          >
            {t('org.addOrg')}
          </AppButton>
        )}
      </section>

      {/* Filter Toolbar */}
      <div data-reveal className="p-4 rounded-2xl bg-white dark:bg-slate-900 flex flex-col gap-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* Search */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-[12px] font-medium text-slate-700 dark:text-slate-300">{t('common.search')}</label>
            <input
              type="text"
              placeholder={t('org.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9.5 px-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-slate-700 dark:text-slate-300">{t('org.colType')}</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9.5 px-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="all">{t('role.all')}</option>
              <option value="enterprise">{t('org.typeOffice')}</option>
              <option value="apartment">{t('org.typeHostel')}</option>
              <option value="dormitory">{t('org.typeUniversity')}</option>
              <option value="commercial">{t('org.typeApartment')}</option>
            </select>
          </div>

        </div>
      </div>

      {/* Card Grid Layout */}
      {filteredOrgs.length > 0 ? (
        <section data-stagger className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOrgs.map((org) => {
            const badge = typeBadges[org.type] ?? typeBadges.enterprise
            return (
              <article
                key={org.id}
                className="flex flex-col gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:shadow-md transition-all duration-150 relative"
              >
                {/* Top header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="min-w-0">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-block">
                      {org.code}
                    </span>
                    <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mt-1.5 truncate">{org.name}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium border shrink-0 ${badge.style}`}>
                    {badge.label}
                  </span>
                </div>

                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">📍 {org.address}</p>

                {/* Metrics Box */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-[12px]">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('org.lockerCountLabel')}</span>
                    <p className="text-[15px] font-bold text-slate-900 dark:text-white font-mono mt-0.5">{t('org.lockerCountValue', { count: org.totalLockers })}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('org.memberLabel')}</span>
                    <p className="text-[15px] font-bold text-slate-900 dark:text-white font-mono mt-0.5">{t('org.memberCountValue', { count: org.totalMembers })}</p>
                  </div>
                </div>

                {/* Admin Info */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[12px]">
                  <div className="min-w-0">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">{t('org.repAdmin')}</span>
                    <p className="font-bold text-slate-900 dark:text-white truncate">{org.adminName}</p>
                    <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">{org.adminEmail}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/organizations/${org.id}`)}
                      className="h-9 px-3.5 rounded-xl text-[12px] font-bold bg-sky-600 text-white hover:bg-sky-700 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
                      </svg>
                      {t('org.configure')}
                    </button>
                    {user?.role === 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(org)}
                        className="h-9 px-3 rounded-xl text-[12px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-600 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('common.delete')}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      ) : (
        <EmptyState
          title={t('org.emptyTitle')}
          description={t('org.emptyDesc')}
          action={
            user?.role === 'super_admin' ? (
              <AppButton onClick={() => setIsCreateModalOpen(true)}>
                {t('org.addOrg')}
              </AppButton>
            ) : undefined
          }
        />
      )}

      {isCreateModalOpen && (
        <CreateOrgModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={(org) => {
            setOrganizations((prev) => [org, ...prev])
            setIsCreateModalOpen(false)
            setStationOrg(org)
          }}
        />
      )}

      {/* Thêm trạm tủ đầu tiên ngay sau khi tạo doanh nghiệp */}
      {stationOrg && (
        <AddLockerModal
          org={stationOrg}
          onClose={() => setStationOrg(null)}
          onCreated={() => getOrganizations().then(setOrganizations)}
        />
      )}

      {/* 2-Step Confirmation Delete Modal */}
      {deleteTargetOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col p-6 gap-4">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-snug">
                    {t('org.deleteTitle')}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('org.orgCode')} <strong className="text-slate-800 dark:text-slate-200 font-bold">{deleteTargetOrg.code}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTargetOrg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Callout */}
            <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-[12.5px] text-red-800 dark:text-red-300 leading-relaxed">
              🚨 <strong>{t('org.dangerLabel')}</strong> {t('org.dangerPre')} <strong>"{deleteTargetOrg.name}"</strong> {t('org.dangerMid')} <strong>{t('org.dangerIrreversible')}</strong>!
            </div>

            {/* 2-Step Exact Match Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                {t('org.confirmType')}
              </label>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-[12px] select-all border border-slate-200 dark:border-slate-700">
                {deleteTargetOrg.name}
              </div>
              <input
                type="text"
                value={confirmOrgName}
                onChange={(e) => setConfirmOrgName(e.target.value)}
                placeholder={t('org.confirmPlaceholder', { name: deleteTargetOrg.name })}
                className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors mt-1"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTargetOrg(null)}
                className="h-10 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={confirmOrgName !== deleteTargetOrg.name || isDeleting}
                onClick={handleConfirmDelete}
                className={`h-10 px-4 rounded-xl text-[12.5px] font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  confirmOrgName !== deleteTargetOrg.name || isDeleting
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-75'
                    : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-95'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? t('org.deleting') : t('org.deleteForever')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
