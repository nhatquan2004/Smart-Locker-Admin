import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/common'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { createOrganization, deleteOrganization, getOrganizations } from '../../service/organization.service'
import { createUser } from '../../service/user.service'
import { createLockerStation } from '../../service/lockerStation.service'
import type { TCreateOrgPayload, TOrganization, TOrgType } from '../../types/organization.type'
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

  // Form states for creating new org
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formType, setFormType] = useState<TOrgType>('enterprise')
  const [formAddress, setFormAddress] = useState('')
  const [formSizeS, setFormSizeS] = useState(4)
  const [formSizeM, setFormSizeM] = useState(4)
  const [formSizeL, setFormSizeL] = useState(2)
  const [formAdminName, setFormAdminName] = useState('')
  const [formAdminEmail, setFormAdminEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!formName || !formCode) return

    setIsSubmitting(true)
    const adminEmail = formAdminEmail || `admin.${formCode.toLowerCase()}@smartlocker.vn`
    const adminName = formAdminName || `Admin ${formName}`
    const totalBoxes = formSizeS + formSizeM + formSizeL

    const payload: TCreateOrgPayload = {
      name: formName,
      code: formCode,
      type: formType,
      address: formAddress || t('org.defaultAddress'),
      totalLockers: totalBoxes,
      adminName: adminName,
      adminEmail: adminEmail,
    }

    createOrganization(payload).then((newOrg) => {
      setOrganizations((prev) => [newOrg, ...prev])

      createLockerStation({
        name: t('org.stationName', { name: newOrg.name }),
        code: `ST-${newOrg.code}`,
        orgId: newOrg.id,
        orgName: newOrg.name,
        location: formAddress || t('org.defaultStationLocation'),
        sizeS: formSizeS,
        sizeM: formSizeM,
        sizeL: formSizeL,
      })

      createUser({
        fullName: adminName,
        phone: '090' + Math.floor(1000000 + Math.random() * 9000000),
        email: adminEmail,
        role: 'org_admin',
        orgId: newOrg.id,
        companyName: newOrg.name,
        unitNumber: t('org.adminUnitNumber'),
      })

      setIsSubmitting(false)
      setIsCreateModalOpen(false)
      toast.success(t('org.createdToast', { name: newOrg.name }))

      setFormName('')
      setFormCode('')
      setFormAddress('')
      setFormAdminName('')
      setFormAdminEmail('')
      setFormSizeS(4)
      setFormSizeM(4)
      setFormSizeL(2)
    })
  }

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

      {/* Create Org Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">{t('org.createTitle')}</h3>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{t('org.createDesc')}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('org.fieldName')} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder={t('org.namePlaceholder')}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('org.fieldCode')} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder={t('org.codePlaceholder')}
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-mono font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('org.fieldType')}</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as TOrgType)}
                    className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="enterprise">{t('org.optEnterprise')}</option>
                    <option value="apartment">{t('org.optApartment')}</option>
                    <option value="dormitory">{t('org.optDormitory')}</option>
                    <option value="commercial">{t('org.optCommercial')}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('org.fieldAddress')}</label>
                  <input
                    type="text"
                    placeholder={t('org.addressPlaceholder')}
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Admin info */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-3">
                <h4 className="text-[12px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">{t('org.adminSection')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={t('org.adminNamePh')}
                    value={formAdminName}
                    onChange={(e) => setFormAdminName(e.target.value)}
                    className="h-9.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="email"
                    placeholder={t('org.adminEmailPh')}
                    value={formAdminEmail}
                    onChange={(e) => setFormAdminEmail(e.target.value)}
                    className="h-9.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Compartments sizing breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-3">
                <h4 className="text-[12px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center justify-between">
                  <span>{t('org.sizesTitle')}</span>
                  <span className="text-sky-600 dark:text-sky-400 font-extrabold">{t('org.sizesTotal', { count: formSizeS + formSizeM + formSizeL })}</span>
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">{t('org.sizeS')}</span>
                    <input
                      type="number"
                      min={0}
                      value={formSizeS}
                      onChange={(e) => setFormSizeS(Math.max(0, Number(e.target.value)))}
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-mono font-bold text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">{t('org.sizeM')}</span>
                    <input
                      type="number"
                      min={0}
                      value={formSizeM}
                      onChange={(e) => setFormSizeM(Math.max(0, Number(e.target.value)))}
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-mono font-bold text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">{t('org.sizeL')}</span>
                    <input
                      type="number"
                      min={0}
                      value={formSizeL}
                      onChange={(e) => setFormSizeL(Math.max(0, Number(e.target.value)))}
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-mono font-bold text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-10 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <AppButton type="submit" disabled={isSubmitting || !formName || !formCode}>
                  {isSubmitting ? t('common.saving') : t('org.createBtn')}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
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
