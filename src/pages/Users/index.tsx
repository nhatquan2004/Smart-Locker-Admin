import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { AppButton } from '../../components/common'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { createUser, getUsers, getUserStats } from '../../service/user.service'
import { getOrganizations } from '../../service/organization.service'
import type { TCreateUserPayload, TUser, TUserFilter, TUserRole, TUserStatItem } from '../../types/user.type'
import type { TOrganization } from '../../types/organization.type'
import { useTranslation } from '../../context/LanguageContext'

const roleBadges: Record<TUserRole, { labelKey: string; style: string }> = {
  super_admin: { labelKey: 'role.super_admin', style: 'bg-purple-100 text-purple-800 border-purple-200 font-bold' },
  org_admin: { labelKey: 'role.org_admin', style: 'bg-amber-100 text-amber-800 border-amber-200 font-bold' },
  user: { labelKey: 'role.user', style: 'bg-sky-100 text-sky-800 border-sky-200 font-bold' },
  shipper: { labelKey: 'role.shipper', style: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold' },
}

const statusBadges = {
  active: { labelKey: 'users.active', style: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  inactive: { labelKey: 'users.inactive', style: 'bg-slate-100 text-slate-600 border-slate-300' },
  blocked: { labelKey: 'users.blocked', style: 'bg-red-100 text-red-700 border-red-300' },
}

export function UsersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user: loggedUser } = useAuthStore()
  const [users, setUsers] = useState<TUser[]>([])
  const [stats, setStats] = useState<TUserStatItem[]>([])
  const [orgsList, setOrgsList] = useState<TOrganization[]>([])
  const [filter, setFilter] = useState<TUserFilter>({
    search: '',
    companyId: 'all',
    role: 'all',
    status: 'all',
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formUnit, setFormUnit] = useState('')
  const [formOrgId, setFormOrgId] = useState<string>('org-001')
  const [formRole, setFormRole] = useState<TUserRole>('user')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSuperAdmin = loggedUser?.role === 'super_admin'
  const userOrgId = loggedUser?.orgId

  const pageTitle = isSuperAdmin ? t('users.title') : t('users.titleOrg')

  useEffect(() => {
    getUsers().then((allUsers) => {
      if (!isSuperAdmin && userOrgId && userOrgId !== 'all') {
        setUsers(allUsers.filter((u) => u.orgId === userOrgId))
      } else {
        setUsers(allUsers)
      }
    })
    getUserStats().then(setStats)
    getOrganizations().then((orgs) => {
      setOrgsList(orgs)
      if (orgs.length > 0) {
        setFormOrgId(orgs[0].id)
      }
    })
  }, [loggedUser, isSuperAdmin, userOrgId])

  const handleOpenCreateModal = () => {
    if (isSuperAdmin) {
      setFormRole('org_admin')
    } else {
      setFormRole('user')
    }
    setIsCreateModalOpen(true)
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const keyword = filter.search.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        `${u.userCode} ${u.fullName} ${u.phone} ${u.email} ${u.companyName} ${u.unitNumber} ${u.note}`
          .toLowerCase()
          .includes(keyword)

      const matchCompany = filter.companyId === 'all' || u.orgId === filter.companyId
      const matchRole = filter.role === 'all' || u.role === filter.role
      const matchStatus = filter.status === 'all' || u.status === filter.status

      return matchSearch && matchCompany && matchRole && matchStatus
    })
  }, [users, filter])

  useEffect(() => {
    setCurrentPage(1)
  }, [filter, pageSize])

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!formName || !formPhone) return

    setIsSubmitting(true)
    const selectedOrg = orgsList.find((o) => o.id === formOrgId)
    const targetOrgId = isSuperAdmin ? formOrgId : (userOrgId || 'org-001')
    const targetOrgName = isSuperAdmin 
      ? (selectedOrg?.name || 'TechCorp Office Building')
      : (loggedUser?.orgName || 'TechCorp Office Building')

    const payload: TCreateUserPayload = {
      fullName: formName,
      phone: formPhone,
      email: formEmail || `${formPhone}@smartlocker.vn`,
      role: formRole,
      orgId: targetOrgId,
      companyName: targetOrgName,
      unitNumber: formUnit || (formRole === 'org_admin' ? 'Quản lý tòa nhà' : 'Phòng 101'),
    }

    createUser(payload).then((newUser) => {
      setUsers((prev) => [newUser, ...prev])
      setIsSubmitting(false)
      setIsCreateModalOpen(false)
      setFormName('')
      setFormPhone('')
      setFormEmail('')
      setFormUnit('')
    })
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1250px]">
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-700">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-slate-900 leading-tight">{pageTitle}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                {filteredUsers.length} {t('users.totalAccounts')}
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">{t('users.desc')}</p>
          </div>
        </div>

        <div className="shrink-0">
          <AppButton onClick={handleOpenCreateModal}>
            {isSuperAdmin ? '+ Thêm Tài Khoản Quản Lý' : t('users.addUser')}
          </AppButton>
        </div>
      </section>

      <div data-reveal className="setting-card-custom p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs border">
        <div className="flex items-center gap-3 flex-1 w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t('users.searchPlaceholder')}
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
              className="setting-input-custom w-full h-10 px-3.5 pl-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Organization / Hostel Filter Dropdown for Super Admin */}
          {isSuperAdmin && (
            <select
              value={filter.companyId}
              onChange={(e) => setFilter((prev) => ({ ...prev, companyId: e.target.value }))}
              className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer w-56 shrink-0"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tất cả Doanh Nghiệp / Khu Trọ</option>
              {orgsList.map((org) => (
                <option key={org.id} value={org.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
          )}

          <select
            value={filter.role}
            onChange={(e) => setFilter((prev) => ({ ...prev, role: e.target.value as any }))}
            className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer w-44 shrink-0"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.all')}</option>
            <option value="user" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.user')}</option>
            <option value="org_admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.org_admin')}</option>
            <option value="super_admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.super_admin')}</option>
            <option value="shipper" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.shipper')}</option>
          </select>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto shrink-0">
          {stats.map((s) => (
            <span key={s.id} className="stat-pill px-3 py-1.5 rounded-xl border text-[11px] font-mono whitespace-nowrap">
              {s.label}: <strong className="font-bold">{s.value}</strong>
            </span>
          ))}
        </div>
      </div>

      <div data-reveal className="rounded-2xl glass-card overflow-hidden shadow-xs border border-slate-200">
        {paginatedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                  <th className="py-3.5 px-5">{t('users.colName')}</th>
                  <th className="py-3.5 px-5">{t('users.colContact')}</th>
                  <th className="py-3.5 px-5">{t('users.colRole')}</th>
                  <th className="py-3.5 px-5">{t('users.colStatus')}</th>
                  <th className="py-3.5 px-5">{t('users.colOrg')}</th>
                  <th className="py-3.5 px-5">{t('users.colUnit')}</th>
                  <th className="py-3.5 px-5 text-right">{t('users.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] bg-white whitespace-nowrap">
                {paginatedUsers.map((u) => {
                  const roleBadge = roleBadges[u.role] ?? roleBadges.user
                  const statusBadge = statusBadges[u.status] ?? statusBadges.active
                  return (
                    <tr key={u.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 text-sky-800 font-bold font-mono text-[12px] flex items-center justify-center shrink-0">
                            {getInitials(u.fullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{u.fullName}</p>
                            <span className="text-[11px] font-mono text-slate-500">{u.userCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col text-[12px]">
                          <span className="font-mono text-slate-800 font-medium">{u.phone}</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[180px]">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap ${roleBadge.style}`}>
                          {t(roleBadge.labelKey as any)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap ${statusBadge.style}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {t(statusBadge.labelKey as any)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-800 text-[12px] truncate block max-w-[200px]">
                          {u.companyName || 'Global'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-[12px] text-slate-600 font-medium truncate block max-w-[200px]">
                          {u.unitNumber || '---'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/users/${u.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white transition-all text-[11px] font-semibold cursor-pointer shadow-2xs active:scale-95"
                        >
                          {t('users.btnDetail')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={t('common.noData')}
            description="Thử thay đổi bộ lọc từ khóa hoặc vai trò người dùng."
          />
        )}

        {filteredUsers.length > 0 && (
          <div className="table-footer-custom px-6 py-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
            <div>
              <strong className="opacity-90">{(currentPage - 1) * pageSize + 1}</strong> – <strong className="opacity-90">{Math.min(currentPage * pageSize, filteredUsers.length)}</strong> / <strong className="opacity-90">{filteredUsers.length}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="page-btn-custom px-3 py-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold transition-colors cursor-pointer"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={[
                    "w-8 h-8 rounded-lg text-[12px] font-mono font-bold transition-all cursor-pointer border",
                    currentPage === page
                      ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                      : "page-btn-custom",
                  ].join(" ")}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="page-btn-custom px-3 py-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="modal-card-custom w-full max-w-md p-6 rounded-3xl shadow-2xl border flex flex-col gap-5 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                  {isSuperAdmin ? 'SUPER ADMIN WORKFLOW' : 'ORG ADMIN WORKFLOW'}
                </span>
                <h3 className="modal-title-custom text-[17px] font-bold mt-1.5">
                  {isSuperAdmin ? 'Cấp Tài Khoản Quản Lý / Admin' : 'Thêm Thành Viên / Cư Dân Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center modal-subtitle-custom hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">
                  {isSuperAdmin ? 'Họ và tên Người Quản Lý' : 'Họ và tên Thành Viên / Cư Dân'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={isSuperAdmin ? "VD: Trần Văn Minh (Admin TechCorp)" : "VD: Nguyễn Văn An (Phòng 402)"}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">
                  {isSuperAdmin ? 'Số điện thoại liên hệ' : 'SĐT Nhận OTP Gửi / Nhận Hàng'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="VD: 0901234567"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">
                  {isSuperAdmin ? 'Phân quyền tài khoản' : 'Vai trò trong khu'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as TUserRole)}
                  className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {isSuperAdmin ? (
                    <>
                      <option value="org_admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Admin Quản Trị Tòa Nhà / Khu Trọ (Org Admin)</option>
                      <option value="super_admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Super Admin (Quản Trị Toàn Hệ Thống)</option>
                      <option value="shipper" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Shipper Giao Hàng Toàn Hệ Thống</option>
                      <option value="user" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Người Dùng Cư Dân Thường</option>
                    </>
                  ) : (
                    <>
                      <option value="user" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cư Dân / Nhân Viên Tòa Nhà</option>
                      <option value="shipper" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Shipper Đối Tác Thường Xuyên</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">
                  Email {isSuperAdmin ? '(Để gửi thông tin đăng nhập)' : '(Không bắt buộc)'}
                </label>
                <input
                  type="email"
                  placeholder={isSuperAdmin ? "VD: admin.techcorp@smartlocker.vn" : "VD: cu.dan@gmail.com"}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              {isSuperAdmin && (
                <div className="flex flex-col gap-1.5">
                  <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">
                    Gán vào Tòa nhà / Khu trọ / Đơn vị <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formOrgId}
                    onChange={(e) => setFormOrgId(e.target.value)}
                    className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {orgsList.map((org) => (
                      <option key={org.id} value={org.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {org.name} ({org.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">
                  {isSuperAdmin ? 'Chức danh / Vị trí quản lý' : 'Số phòng / Tầng / Mã NV'}
                </label>
                <input
                  type="text"
                  placeholder={isSuperAdmin ? "VD: Quản Lý Tòa Nhà TechCorp, Chủ Khu Trọ..." : "VD: Phòng 402 - Tầng 4, Dept Marketing..."}
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="modal-cancel-custom h-9 px-4 rounded-xl text-[12px] font-medium transition-colors cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <AppButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('common.saving') : (isSuperAdmin ? 'Cấp Tài Khoản' : 'Thêm Thành Viên')}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
