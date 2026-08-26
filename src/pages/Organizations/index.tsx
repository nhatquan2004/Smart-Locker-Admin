import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/common'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { createOrganization, deleteOrganization, getOrganizations } from '../../service/organization.service'
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

  // Form states for creating new org
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formType, setFormType] = useState<TOrgType>('enterprise')
  const [formAddress, setFormAddress] = useState('')
  const [formLockers, setFormLockers] = useState(12)
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
    if (!formName || !formCode || !formAdminEmail) return

    setIsSubmitting(true)
    const payload: TCreateOrgPayload = {
      name: formName,
      code: formCode,
      type: formType,
      address: formAddress,
      totalLockers: formLockers,
      adminName: formAdminName || 'Admin Đại Diện',
      adminEmail: formAdminEmail,
    }

    createOrganization(payload).then((newOrg) => {
      setOrganizations((prev) => [newOrg, ...prev])
      setIsSubmitting(false)
      setIsCreateModalOpen(false)
      // Reset form
      setFormName('')
      setFormCode('')
      setFormAddress('')
      setFormAdminName('')
      setFormAdminEmail('')
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
            className="w-full max-w-lg p-6 rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col gap-5 my-8 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="eyebrow mb-1">Super Admin Action</p>
                <h3 className="text-[17px] font-bold text-slate-900">Thêm Đơn Vị Quản Lý Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Tên Đơn vị / Doanh nghiệp / Khu trọ</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Doanh nghiệp TechCorp, Khu Nhà Trọ Hoàng Nam..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Mã Đơn vị (Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: TECHCORP"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Số tủ quy định</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formLockers}
                    onChange={(e) => setFormLockers(Number(e.target.value))}
                    className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Loại hình</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as TOrgType)}
                    className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="enterprise">Doanh nghiệp văn phòng</option>
                    <option value="apartment">Khu nhà trọ / Chung cư</option>
                    <option value="dormitory">Ký túc xá trường học</option>
                    <option value="commercial">Trung tâm thương mại</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Họ tên Admin đại diện</label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn Minh"
                    value={formAdminName}
                    onChange={(e) => setFormAdminName(e.target.value)}
                    className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Email Admin đăng nhập</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@doanhnghiep.com"
                    value={formAdminEmail}
                    onChange={(e) => setFormAdminEmail(e.target.value)}
                    className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-9 px-4 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-100"
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
