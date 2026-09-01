import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { AppButton } from '../../components/common'
import { AppTable } from '../../components/common/AppTable'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { getUserStats } from '../../service/user.service'
import { getOrganizations } from '../../service/organization.service'
import type { TCreateUserPayload, TUserFilter, TUserRole, TUserStatItem } from '../../types/user.type'
import type { TOrganization } from '../../types/organization.type'
import { useTranslation } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { Search } from 'lucide-react'

const roleBadges: Record<TUserRole, { labelKey: string; style: string }> = {
  super_admin: { labelKey: 'role.super_admin', style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  org_admin: { labelKey: 'role.org_admin', style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  user: { labelKey: 'role.user', style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  shipper: { labelKey: 'role.shipper', style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
}

const statusBadges = {
  active: { labelKey: 'users.active', style: 'text-emerald-600 dark:text-emerald-400' },
  inactive: { labelKey: 'users.inactive', style: 'text-slate-500 dark:text-slate-400' },
  blocked: { labelKey: 'users.blocked', style: 'text-red-600 dark:text-red-400' },
}

import { useUserStore } from '../../store/useUserStore'

export function UsersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const toast = useToast()
  const { user: loggedUser } = useAuthStore()

  const masterUsers = useUserStore((state) => state.users)
  const createUserStore = useUserStore((state) => state.createUser)
  const [stats, setStats] = useState<TUserStatItem[]>([])
  const [orgsList, setOrgsList] = useState<TOrganization[]>([])
  const [filter, setFilter] = useState<TUserFilter>({
    search: '',
    companyId: 'all',
    role: 'all',
    status: 'all',
  })

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

  const users = useMemo(() => {
    if (isSuperAdmin) return masterUsers
    if (userOrgId && userOrgId !== 'all') {
      return masterUsers.filter((u) => u.orgId === userOrgId)
    }
    return masterUsers
  }, [masterUsers, isSuperAdmin, userOrgId])

  useEffect(() => {
    getUserStats().then(setStats)
    getOrganizations().then(setOrgsList)
  }, [masterUsers])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const keyword = filter.search.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        `${u.fullName} ${u.phone} ${u.email} ${u.userCode} ${u.unitNumber || ''}`
          .toLowerCase()
          .includes(keyword)

      const matchCompany = filter.companyId === 'all' || u.orgId === filter.companyId
      const matchRole = filter.role === 'all' || u.role === filter.role
      const matchStatus = filter.status === 'all' || u.status === filter.status

      return matchSearch && matchCompany && matchRole && matchStatus
    })
  }, [users, filter])

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim() || !formPhone.trim()) {
      toast.error('Vui lòng nhập đầy đủ Họ tên và Số điện thoại!')
      return
    }

    setIsSubmitting(true)
    const selectedOrg = orgsList.find((o) => o.id === formOrgId)
    const targetOrgId = isSuperAdmin ? formOrgId : (userOrgId || 'org-001')
    const targetOrgName = isSuperAdmin 
      ? (selectedOrg?.name || 'TechCorp Office Building')
      : (loggedUser?.orgName || 'TechCorp Office Building')

    const payload: TCreateUserPayload = {
      fullName: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim() || `${formPhone.trim()}@smartlocker.vn`,
      role: formRole,
      orgId: targetOrgId,
      companyName: targetOrgName,
      unitNumber: formUnit.trim() || (formRole === 'org_admin' ? 'Quản lý tòa nhà' : 'Phòng 101'),
    }

    createUserStore(payload).then((newUser) => {
      setIsSubmitting(false)
      setIsCreateModalOpen(false)
      toast.success(`Đã tạo tài khoản "${newUser.fullName}" (${newUser.phone}) thành công!`)
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
      
      {/* Top Banner Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-700 dark:text-sky-400">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-slate-900 dark:text-white leading-tight">{pageTitle}</h1>
              <span className="text-[12px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 font-mono">
                {filteredUsers.length} {t('users.totalAccounts')}
              </span>
            </div>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{t('users.desc')}</p>
          </div>
        </div>

        <div className="shrink-0">
          <AppButton onClick={() => setIsCreateModalOpen(true)}>
            {isSuperAdmin ? '+ Thêm Tài Khoản Quản Lý' : t('users.addUser')}
          </AppButton>
        </div>
      </section>

      {/* Modern 4-Column Stat Cards Row */}
      <div data-reveal className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => {
          const toneStyles: Record<string, string> = {
            blue: 'bg-sky-50/80 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80',
            green: 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80',
            orange: 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80',
          }
          const style = toneStyles[s.tone || 'blue'] || toneStyles.blue

          return (
            <div
              key={s.id}
              className={`p-3.5 rounded-2xl border ${style} flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all`}
            >
              <span className="text-[10.5px] font-mono font-bold tracking-wider opacity-75 uppercase truncate">{s.label}</span>
              <div className="flex items-baseline justify-between gap-2 mt-1.5">
                <span className="text-[22px] font-bold font-mono leading-none">{s.value}</span>
                <span className="text-[10.5px] font-medium opacity-75 truncate">{s.helper}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Streamlined Filter Bar */}
      <div data-reveal className="setting-card-custom p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs border">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={t('users.searchPlaceholder')}
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="setting-input-custom w-full h-10 pl-9 pr-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          {/* Organization Dropdown for Super Admin */}
          {isSuperAdmin && (
            <select
              value={filter.companyId}
              onChange={(e) => setFilter((prev) => ({ ...prev, companyId: e.target.value }))}
              className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer w-full md:w-56 shrink-0"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tất cả Doanh Nghiệp / Khu Trọ</option>
              {orgsList.map((org) => (
                <option key={org.id} value={org.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
          )}

          {/* Role Filter Dropdown */}
          <select
            value={filter.role}
            onChange={(e) => setFilter((prev) => ({ ...prev, role: e.target.value as any }))}
            className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer w-full md:w-44 shrink-0"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.all')}</option>
            <option value="user" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.user')}</option>
            <option value="org_admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.org_admin')}</option>
            <option value="super_admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.super_admin')}</option>
            <option value="shipper" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('role.shipper')}</option>
          </select>
        </div>
      </div>

      {/* Main Users Table using AppTable */}
      <div data-reveal>
        <AppTable
          columns={[
            {
              key: 'fullName',
              title: t('users.colName'),
              render: (u) => (
                <div className="flex items-center gap-3 min-w-[180px]">
                  <div className="w-8.5 h-8.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold font-mono text-[12px] flex items-center justify-center shrink-0">
                    {getInitials(u.fullName)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate text-[13.5px]">{u.fullName}</p>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-semibold">{u.userCode}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'phone',
              title: t('users.colContact'),
              render: (u) => (
                <div className="flex flex-col text-[12px]">
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{u.phone}</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px]">{u.email}</span>
                </div>
              ),
            },
            {
              key: 'role',
              title: t('users.colRole'),
              render: (u) => {
                const roleBadge = roleBadges[u.role] ?? roleBadges.user
                return (
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-medium border whitespace-nowrap ${roleBadge.style}`}>
                    {t(roleBadge.labelKey as any)}
                  </span>
                )
              },
            },
            {
              key: 'status',
              title: t('users.colStatus'),
              render: (u) => {
                const statusBadge = statusBadges[u.status] ?? statusBadges.active
                return (
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold whitespace-nowrap">
                    <span className={`w-2 h-2 rounded-full ${
                      u.status === 'active' ? 'bg-emerald-500 animate-pulse' : u.status === 'inactive' ? 'bg-slate-400' : 'bg-red-500'
                    }`} />
                    <span className={statusBadge.style}>
                      {t(statusBadge.labelKey as any)}
                    </span>
                  </div>
                )
              },
            },
            {
              key: 'companyName',
              title: t('users.colOrg'),
              render: (u) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-[12.5px] truncate block max-w-[200px]">
                  {u.companyName || 'Global'}
                </span>
              ),
            },
            {
              key: 'unitNumber',
              title: t('users.colUnit'),
              render: (u) => (
                <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium truncate block max-w-[200px]">
                  {u.unitNumber || '---'}
                </span>
              ),
            },
            {
              key: 'actions',
              title: t('users.colActions'),
              align: 'right',
              headerClassName: 'w-[160px]',
              className: 'whitespace-nowrap w-[160px]',
              render: (u) => (
                <div className="flex items-center justify-end gap-1.5 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={() => navigate(`/users/${u.id}`)}
                    className="h-8 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-[11.5px] font-bold cursor-pointer active:scale-95 whitespace-nowrap inline-flex items-center justify-center gap-1"
                  >
                    <span>Chi tiết</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/users/${u.id}/manage`)}
                    className="h-8 px-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-600 hover:text-white transition-all text-[11.5px] font-bold cursor-pointer active:scale-95 whitespace-nowrap inline-flex items-center justify-center gap-1"
                    title="Cấu hình vai trò, khóa & xóa tài khoản"
                  >
                    <span>Quản lý</span>
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredUsers}
          pageSize={6}
          minWidth="1100px"
          emptyState={
            <EmptyState
              title={t('common.noData')}
              description="Thử thay đổi bộ lọc từ khóa hoặc vai trò người dùng."
            />
          }
        />
      </div>

      {/* Modal: Create New User */}
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
                  NEW ACCOUNT CREATION
                </span>
                <h3 className="modal-title-custom text-[17px] font-bold mt-1.5">Tạo Tài Khoản Người Dùng Mới</h3>
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
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn An"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Số điện thoại <span className="text-red-500">*</span></label>
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
                  <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Vai trò hệ thống</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as TUserRole)}
                    className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="user" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">User / Cư dân</option>
                    <option value="shipper" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Shipper giao hàng</option>
                    <option value="org_admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Org Admin (Quản trị đơn vị)</option>
                    {isSuperAdmin && (
                      <option value="super_admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Super Admin (Tối cao)</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Email liên hệ</label>
                <input
                  type="email"
                  placeholder="VD: nguyenvanan@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              {isSuperAdmin && (
                <div className="flex flex-col gap-1.5">
                  <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Thuộc Doanh Nghiệp / Khu Trọ</label>
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
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Phòng ban / Số phòng trọ</label>
                <input
                  type="text"
                  placeholder="VD: Phòng Marketing - Tầng 4, Phòng 101..."
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="modal-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-[12.5px] font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
