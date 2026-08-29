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

export function OrganizationsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [organizations, setOrganizations] = useState<TOrganization[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const typeBadges: Record<TOrgType, { label: string; style: string }> = {
    enterprise: { label: t('org.typeOffice'), style: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    apartment: { label: t('org.typeHostel'), style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    dormitory: { label: t('org.typeUniversity'), style: 'bg-sky-100 text-sky-800 border-sky-200' },
    commercial: { label: t('org.typeApartment'), style: 'bg-amber-100 text-amber-800 border-amber-200' },
  }

  // Form states for creating new org with S/M/L compartment layout breakdown
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
      address: formAddress || 'Địa chỉ đơn vị',
      totalLockers: totalBoxes,
      adminName: adminName,
      adminEmail: adminEmail,
    }

    createOrganization(payload).then((newOrg) => {
      setOrganizations((prev) => [newOrg, ...prev])

      // Auto-create hardware Locker Station with exact S/M/L compartments!
      createLockerStation({
        name: `Trạm Tủ - ${newOrg.name}`,
        code: `ST-${newOrg.code}`,
        orgId: newOrg.id,
        orgName: newOrg.name,
        location: formAddress || 'Sảnh Lễ Tân Chính',
        sizeS: formSizeS,
        sizeM: formSizeM,
        sizeL: formSizeL,
      })

      // Auto-create Org Admin user account for this new organization!
      createUser({
        fullName: adminName,
        phone: '090' + Math.floor(1000000 + Math.random() * 9000000),
        email: adminEmail,
        role: 'org_admin',
        orgId: newOrg.id,
        companyName: newOrg.name,
        unitNumber: 'Quản Lý Đơn Vị',
      })

      setIsSubmitting(false)
      setIsCreateModalOpen(false)
      // Reset form
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

  function handleDelete(id: string) {
    if (!confirm(t('common.confirm') + '?')) return
    deleteOrganization(id).then(() => {
      setOrganizations((prev) => prev.filter((o) => o.id !== id))
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Hero */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="relative z-10 flex-1 min-w-0">
          <p className="eyebrow mb-1">Multi-Tenant Management Architecture</p>
          <h1 className="text-[22px] font-bold text-slate-900 leading-tight">
            {t('org.title')}
          </h1>
          <p className="mt-1 text-[13px] text-slate-600 leading-relaxed max-w-lg">
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
      <div data-reveal className="p-5 rounded-2xl glass-card flex flex-col gap-4 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Search */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">{t('common.search')}</label>
            <input
              type="text"
              placeholder={t('org.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">{t('org.colType')}</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
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

      {/* Grid */}
      {filteredOrgs.length > 0 ? (
        <section data-stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrgs.map((org) => {
            const badge = typeBadges[org.type] ?? typeBadges.enterprise
            return (
              <article
                key={org.id}
                className="flex flex-col gap-4 p-6 rounded-2xl glass-card border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative"
              >
                {/* Top header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-sky-800 font-bold bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
                      {org.code}
                    </span>
                    <h3 className="text-[17px] font-bold text-slate-900 mt-1 truncate">{org.name}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border shrink-0 ${badge.style}`}>
                    {badge.label}
                  </span>
                </div>

                <p className="text-[12px] text-slate-600 line-clamp-2 leading-relaxed font-medium">📍 {org.address}</p>

                {/* Metrics Box (High contrast Light Mode design) */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[12px]">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Số lượng tủ gán</span>
                    <p className="text-[16px] font-bold text-sky-700 font-mono mt-0.5">{org.totalLockers} tủ</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Thành viên / Cư dân</span>
                    <p className="text-[16px] font-bold text-emerald-700 font-mono mt-0.5">{org.totalMembers} người</p>
                  </div>
                </div>

                {/* Admin Info */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[12px]">
                  <div className="min-w-0">
                    <span className="text-slate-500 text-[11px] font-medium">Admin đại diện:</span>
                    <p className="font-bold text-slate-900 truncate">{org.adminName}</p>
                    <p className="text-[11px] font-mono text-slate-600 truncate">{org.adminEmail}</p>
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
                      Cấu Hình & Chỉnh Sửa
                    </button>
                    {user?.role === 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(org.id)}
                        className="h-9 px-3 rounded-xl text-[12px] font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        Xóa
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
          title="Không tìm thấy đơn vị quản lý phù hợp"
          description="Thử thay đổi bộ lọc hoặc tạo mới đơn vị quản lý doanh nghiệp / nhà trọ."
        />
      )}

      {/* Modal: Create Organization */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="modal-card-custom w-full max-w-lg p-6 rounded-3xl shadow-2xl border flex flex-col gap-5 my-8 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                  SUPER ADMIN ACTION
                </span>
                <h3 className="modal-title-custom text-[17px] font-bold mt-1.5">Thêm Đơn Vị Quản Lý Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center modal-subtitle-custom hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Tên Đơn vị / Doanh nghiệp / Khu trọ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="VD: Doanh nghiệp TechCorp, Khu Nhà Trọ Hoàng Nam..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Mã Đơn vị (Code) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="VD: TECHCORP"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Loại hình quy mô</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as TOrgType)}
                    className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="enterprise" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Doanh nghiệp văn phòng</option>
                    <option value="apartment" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Khu nhà trọ / Chung cư</option>
                    <option value="dormitory" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ký túc xá trường học</option>
                    <option value="commercial" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Trung tâm thương mại</option>
                  </select>
                </div>
              </div>

              {/* Compartment Size Breakdown Configuration Card */}
              <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/80 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[14px]">📦</span>
                    <span className="text-[12px] font-bold text-sky-900 dark:text-sky-200 truncate">
                      Cấu Hình Ngăn Tủ Smart Locker
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-600 text-white shadow-2xs shrink-0">
                    Tổng: {formSizeS + formSizeM + formSizeL} Ngăn Tủ
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="modal-label-custom text-[11px] font-mono font-semibold">
                      Size S (Nhỏ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formSizeS}
                      onChange={(e) => setFormSizeS(Math.max(0, Number(e.target.value)))}
                      className="modal-input-custom h-9 px-3 rounded-xl text-[12px] font-mono font-bold text-center border focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="modal-label-custom text-[11px] font-mono font-semibold">
                      Size M (Vừa)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formSizeM}
                      onChange={(e) => setFormSizeM(Math.max(0, Number(e.target.value)))}
                      className="modal-input-custom h-9 px-3 rounded-xl text-[12px] font-mono font-bold text-center border focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="modal-label-custom text-[11px] font-mono font-semibold">
                      Size L (Lớn)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formSizeL}
                      onChange={(e) => setFormSizeL(Math.max(0, Number(e.target.value)))}
                      className="modal-input-custom h-9 px-3 rounded-xl text-[12px] font-mono font-bold text-center border focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-start">
                <div className="flex flex-col gap-1.5">
                  <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold truncate">
                    Họ tên Admin đại diện
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn Minh"
                    value={formAdminName}
                    onChange={(e) => setFormAdminName(e.target.value)}
                    className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold truncate">
                    Email Admin đăng nhập
                  </label>
                  <input
                    type="email"
                    placeholder="admin@doanhnghiep.com"
                    value={formAdminEmail}
                    onChange={(e) => setFormAdminEmail(e.target.value)}
                    className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="modal-cancel-custom h-9 px-4 rounded-xl text-[12px] font-medium transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <AppButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Đơn Vị & Cấp Tài Khoản'}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
