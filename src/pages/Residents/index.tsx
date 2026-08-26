import { useEffect, useMemo, useState } from 'react'
import { AppButton, AppInput } from '../../components/common'
import { FilterSelect } from '../../components/shared/FilterSelect/FilterSelect'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { createResident, getResidents } from '../../service/resident.service'
import type { TCreateResidentPayload, TResident, TResidentRole } from '../../types/resident.type'
import { useAuthStore } from '../../store/useAuthStore'

const roleBadges: Record<TResidentRole, { label: string; style: string }> = {
  resident: { label: 'Cư dân trọ', style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  employee: { label: 'Nhân viên công ty', style: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  student: { label: 'Sinh viên KTX', style: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  shipper: { label: 'Shipper giao hàng', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
}

export function ResidentsPage() {
  const { user, selectedOrgId } = useAuthStore()
  const [residents, setResidents] = useState<TResident[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Form states for creating resident/employee
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formOrgName, setFormOrgName] = useState('Khu Nhà Trọ Hoàng Nam')
  const [formOrgId, setFormOrgId] = useState('org-002')
  const [formUnit, setFormUnit] = useState('')
  const [formRole, setFormRole] = useState<TResidentRole>('resident')
  const [formNote, setFormNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSuperAdmin = user?.role === 'super_admin'

  useEffect(() => {
    // If Org Admin, scoped to their orgId. If Super Admin, scoped to selectedOrgId.
    const activeOrg = isSuperAdmin ? selectedOrgId : user?.orgId
    getResidents(activeOrg).then(setResidents)
  }, [isSuperAdmin, selectedOrgId, user?.orgId])

  const filteredResidents = useMemo(() => {
    return residents.filter((r) => {
      const keyword = search.trim().toLowerCase()
      const matchSearch = !keyword || `${r.code} ${r.fullName} ${r.phone} ${r.email} ${r.unitNumber} ${r.orgName}`.toLowerCase().includes(keyword)
      const matchRole = roleFilter === 'all' || r.role === roleFilter
      return matchSearch && matchRole
    })
  }, [residents, search, roleFilter])

  function handleCreateResident(e: React.FormEvent) {
    e.preventDefault()
    if (!formName || !formPhone) return

    setIsSubmitting(true)
    const payload: TCreateResidentPayload = {
      fullName: formName,
      phone: formPhone,
      email: formEmail,
      orgId: isSuperAdmin ? formOrgId : (user?.orgId || 'org-002'),
      orgName: isSuperAdmin ? formOrgName : (user?.orgName || 'Khu Nhà Trọ Hoàng Nam'),
      unitNumber: formUnit || 'Phòng Trọ / Văn Phòng',
      role: formRole,
      note: formNote,
    }

    createResident(payload).then((newRes) => {
      setResidents((prev) => [newRes, ...prev])
      setIsSubmitting(false)
      setIsCreateModalOpen(false)
      setFormName('')
      setFormPhone('')
      setFormEmail('')
      setFormUnit('')
      setFormNote('')
    })
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1200px]">

      {/* Hero */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative z-10 flex-1 min-w-0">
          <p className="eyebrow mb-2">Member & Resident Directory</p>
          <h1 className="text-[22px] font-bold text-white leading-tight">
            Quản lý Cư Dân, Sinh Viên & Nhân Viên
          </h1>
          <p className="mt-2 text-[13px] text-slate-300 leading-relaxed max-w-lg">
            Danh sách người dùng nhận hàng tại các Khu trọ, Ký túc xá và Tòa nhà doanh nghiệp.
          </p>
        </div>

        <AppButton onClick={() => setIsCreateModalOpen(true)} className="shrink-0">
          + Thêm Cư Dân / Nhân Viên
        </AppButton>
      </section>

      {/* Filter bar */}
      <div data-reveal className="flex flex-wrap gap-4 p-5 rounded-2xl glass-card items-center">
        <div className="flex-1 min-w-[240px]">
          <AppInput
            id="resident-search"
            label="Tìm kiếm người dùng"
            placeholder="Tên cư dân, số điện thoại, số phòng trọ, mã NV, tên đơn vị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <FilterSelect
          id="resident-role-filter"
          label="Vai trò"
          value={roleFilter}
          options={[
            { label: 'Tất cả vai trò', value: 'all' },
            { label: 'Cư dân trọ', value: 'resident' },
            { label: 'Nhân viên công ty', value: 'employee' },
            { label: 'Sinh viên KTX', value: 'student' },
            { label: 'Shipper giao hàng', value: 'shipper' },
          ]}
          onChange={setRoleFilter}
        />
      </div>

      {/* Header */}
      <div data-reveal className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-[14px]">
            👥
          </div>
          <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">Danh sách Thành viên sử dụng tủ</h2>
        </div>
        <span className="stat-pill px-3 py-1 rounded-full text-[12px] font-mono border">
          {filteredResidents.length} thành viên
        </span>
      </div>

      {/* Grid */}
      {filteredResidents.length > 0 ? (
        <section data-stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResidents.map((res) => {
            const badge = roleBadges[res.role] ?? roleBadges.resident
            const initials = res.fullName.trim().split(' ').slice(-2).map((n) => n[0]).join('').toUpperCase()

            return (
              <article
                key={res.id}
                className="flex flex-col gap-4 p-5 rounded-2xl glass-card glass-card-hover relative"
              >
                {/* Top info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-300 flex items-center justify-center text-[12px] font-bold font-mono shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">{res.code}</p>
                      <h3 className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{res.fullName}</h3>
                      <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300">{res.phone}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${badge.style}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Organization & Unit info */}
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Đơn vị:</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[170px]">{res.orgName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Số phòng / Vị trí:</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold">{res.unitNumber}</span>
                  </div>
                  {res.assignedLockerCode && (
                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      <span className="text-slate-400 text-[11px]">Gán tủ:</span>
                      <span className="font-mono text-emerald-400 font-bold">Locker {res.assignedLockerCode}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Hoạt động: <strong className="text-slate-200">{res.lastActive}</strong></span>
                  <span>{res.createdAt.split(' ')[0]}</span>
                </div>
              </article>
            )
          })}
        </section>
      ) : (
        <EmptyState
          title="Không tìm thấy thành viên / cư dân nào"
          description="Thử tìm kiếm theo tên, số điện thoại hoặc số phòng trọ."
        />
      )}

      {/* Modal: Create Resident / Employee */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-lg p-6 rounded-3xl glass-card shadow-2xl border border-white/15 flex flex-col gap-5 my-8 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow mb-1">Directory Addition</p>
                <h3 className="text-[17px] font-bold text-white">Thêm Cư Dân / Nhân Viên Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResident} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase">Họ và tên thành viên</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn An"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0901234567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase">Vai trò thành viên</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as TResidentRole)}
                    className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500"
                  >
                    <option value="resident" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cư dân nhà trọ / Chung cư</option>
                    <option value="employee" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Nhân viên công ty</option>
                    <option value="student" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Sinh viên KTX</option>
                    <option value="shipper" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Shipper giao hàng</option>
                  </select>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase">Gán cho Đơn vị / Doanh nghiệp</label>
                  <select
                    value={formOrgId}
                    onChange={(e) => {
                      setFormOrgId(e.target.value)
                      const orgMap: Record<string, string> = {
                        'org-001': 'TechCorp Office Building',
                        'org-002': 'Khu Nhà Trọ Hoàng Nam',
                        'org-003': 'Ký Túc Xá Đại Học Bách Khoa',
                        'org-004': 'Trung Tâm Thương Mại Aeon',
                      }
                      setFormOrgName(orgMap[e.target.value] || 'Đơn vị quản lý')
                    }}
                    className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500"
                  >
                    <option value="org-002" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Khu Nhà Trọ Hoàng Nam</option>
                    <option value="org-001" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">TechCorp Office Building</option>
                    <option value="org-003" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ký Túc Xá Đại Học Bách Khoa</option>
                    <option value="org-004" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">TTTM Aeon Mall</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase">Số phòng / Vị trí / Mã NV</label>
                <input
                  type="text"
                  placeholder="VD: Phòng 101 - Tầng 1, Tầng 4 - Dept Marketing..."
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 uppercase">Ghi chú bổ sung</label>
                <input
                  type="text"
                  placeholder="Ghi chú về nhận hàng, thói quen gửi..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-800 text-white border border-white/15 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-9 px-4 rounded-xl text-[12px] font-medium text-slate-300 hover:bg-slate-800"
                >
                  Hủy
                </button>
                <AppButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Thành Viên'}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
