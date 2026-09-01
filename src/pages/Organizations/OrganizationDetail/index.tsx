import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOrganizations } from '../../../service/organization.service'
import { getLockerStations } from '../../../service/lockerStation.service'
import type { TOrganization, TOrgType } from '../../../types/organization.type'
import type { TLockerStation } from '../../../types/lockerStation.type'
import { AppButton } from '../../../components/common'

export function OrganizationDetailPage() {
  const navigate = useNavigate()
  const { orgId } = useParams()

  const [org, setOrg] = useState<TOrganization | null>(null)
  const [stations, setStations] = useState<TLockerStation[]>([])

  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<TOrgType>('enterprise')
  const [formAddress, setFormAddress] = useState('')
  
  // Compartment Size Breakdown State
  const [formSizeS, setFormSizeS] = useState(4)
  const [formSizeM, setFormSizeM] = useState(4)
  const [formSizeL, setFormSizeL] = useState(2)

  const [formAdminName, setFormAdminName] = useState('')
  const [formAdminEmail, setFormAdminEmail] = useState('')
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getOrganizations().then((list) => {
      const found = list.find((o) => o.id === orgId) ?? list[0]
      if (found) {
        setOrg(found)
        setFormName(found.name)
        setFormType(found.type)
        setFormAddress(found.address)
        setFormAdminName(found.adminName)
        setFormAdminEmail(found.adminEmail)
      }
    })

    getLockerStations().then((list) => {
      const matched = list.filter((s) => s.orgId === orgId)
      setStations(matched)
      if (matched.length > 0) {
        const sCount = matched[0].compartments.filter((c) => c.size === 'small').length
        const mCount = matched[0].compartments.filter((c) => c.size === 'medium').length
        const lCount = matched[0].compartments.filter((c) => c.size === 'large').length
        setFormSizeS(sCount || 4)
        setFormSizeM(mCount || 4)
        setFormSizeL(lCount || 2)
      }
    })
  }, [orgId])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return

    setIsSubmitting(true)
    const totalBoxes = formSizeS + formSizeM + formSizeL

    setTimeout(() => {
      setOrg((prev) =>
        prev
          ? {
              ...prev,
              name: formName,
              type: formType,
              address: formAddress,
              totalLockers: totalBoxes,
              adminName: formAdminName,
              adminEmail: formAdminEmail,
            }
          : null
      )
      setIsSubmitting(false)
      setSaveSuccessMsg(`✓ Đã cập nhật thông tin và cấu hình ${totalBoxes} ngăn tủ cho đơn vị "${formName}" thành công!`)
      setTimeout(() => setSaveSuccessMsg(''), 4000)
    }, 400)
  }

  if (!org) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        <p>Đang tải thông tin đơn vị...</p>
      </div>
    )
  }

  const memberButtonText =
    org.type === 'enterprise'
      ? 'Xem Danh Sách Nhân Viên Công Ty'
      : org.type === 'apartment'
      ? 'Xem Danh Sách Người Thuê Trọ'
      : org.type === 'dormitory'
      ? 'Xem Danh Sách Sinh Viên KTX'
      : 'Xem Danh Sách Thành Viên'

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Hero Banner */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="relative z-10 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/organizations')}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-sky-600 dark:text-sky-400 hover:underline mb-3 transition-colors cursor-pointer"
          >
            ← Quay lại danh sách Doanh Nghiệp / Khu Trọ
          </button>

          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-mono text-sky-800 dark:text-sky-300 font-bold bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
              {org.code}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">{org.type}</span>
          </div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight truncate">{org.name}</h1>
          <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg truncate">📍 {org.address}</p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="h-10 px-4 rounded-xl text-[13px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-600 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            {memberButtonText}
          </button>
        </div>
      </section>

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[13px] font-bold leading-relaxed shadow-2xs animate-fade-in">
          {saveSuccessMsg}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} data-reveal className="flex flex-col gap-6">
        
        {/* Section 1: Basic Information */}
        <article className="setting-card-custom p-6 rounded-2xl border shadow-xs flex flex-col gap-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="setting-title-custom text-[16px] font-bold">1. Thông tin cơ bản & Địa chỉ</h2>
            <p className="setting-desc-custom text-[12px] mt-0.5">Chỉnh sửa tên doanh nghiệp/khu trọ, mã định danh và địa chỉ sở hữu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Tên Doanh Nghiệp / Khu Trọ</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Mã Đơn Vị (Code)</label>
                <input
                  type="text"
                  disabled
                  value={org.code}
                  className="setting-input-custom opacity-75 h-10 px-3.5 rounded-xl text-[13px] border font-mono font-bold cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Loại Hình Quy Mô</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as TOrgType)}
                  className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-medium border focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="enterprise" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Doanh nghiệp văn phòng</option>
                  <option value="apartment" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Khu nhà trọ / Chung cư</option>
                  <option value="dormitory" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ký túc xá trường học</option>
                  <option value="commercial" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Trung tâm thương mại</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold">Địa Chỉ Chi Tiết</label>
              <input
                type="text"
                required
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </article>

        {/* Section 2: Admin Representative & Compartment Size Breakdown */}
        <article className="setting-card-custom p-6 rounded-2xl border shadow-xs flex flex-col gap-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="setting-title-custom text-[16px] font-bold">2. Admin Đại Diện & Cấu Hình Ngăn Tủ Smart Locker</h2>
            <p className="setting-desc-custom text-[12px] mt-0.5">Cấu hình tài khoản đăng nhập của Admin quản lý và phân bổ kích thước ngăn tủ S, M, L.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="flex flex-col gap-1.5">
              <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold truncate">Họ Tên Admin Đại Diện</label>
              <input
                type="text"
                required
                value={formAdminName}
                onChange={(e) => setFormAdminName(e.target.value)}
                className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="modal-label-custom text-[11px] font-mono uppercase font-semibold truncate">Email Admin Đăng Nhập</label>
              <input
                type="email"
                required
                value={formAdminEmail}
                onChange={(e) => setFormAdminEmail(e.target.value)}
                className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Compartment Size Breakdown Card */}
          <div className="hardware-card-custom p-4 rounded-2xl border flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[14px]">📦</span>
                <span className="hardware-title-custom text-[13px] font-bold truncate">
                  Phân Bổ Kích Thước Ngăn Tủ Smart Locker (S, M, L Layout)
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-[12px] font-mono font-bold bg-sky-600 text-white shadow-2xs shrink-0">
                Tổng Cộng: {formSizeS + formSizeM + formSizeL} Ngăn Tủ
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-1">
              <div className="flex flex-col gap-1">
                <label className="modal-label-custom text-[11px] font-mono font-semibold">
                  Size S (Ngăn Nhỏ)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formSizeS}
                  onChange={(e) => setFormSizeS(Math.max(0, Number(e.target.value)))}
                  className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-mono font-bold text-center border focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="modal-label-custom text-[11px] font-mono font-semibold">
                  Size M (Ngăn Vừa)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formSizeM}
                  onChange={(e) => setFormSizeM(Math.max(0, Number(e.target.value)))}
                  className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-mono font-bold text-center border focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="modal-label-custom text-[11px] font-mono font-semibold">
                  Size L (Ngăn Lớn)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formSizeL}
                  onChange={(e) => setFormSizeL(Math.max(0, Number(e.target.value)))}
                  className="setting-input-custom h-10 px-3.5 rounded-xl text-[13px] font-mono font-bold text-center border focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </article>

        {/* Section 3: Linked Hardware Locker Stations */}
        <article className="setting-card-custom p-6 rounded-2xl border shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="setting-title-custom text-[16px] font-bold">3. Trạm Tủ Phần Cứng (`Locker Stations`) Thuộc Đơn Vị</h2>
              <p className="setting-desc-custom text-[12px] mt-0.5">Danh sách trạm tủ IoT và các ngăn tủ phần cứng đang hoạt động.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/lockers')}
              className="h-9 px-3.5 rounded-xl text-[12px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-600 hover:text-white transition-all cursor-pointer"
            >
              + Quản Lý Cụm Tủ
            </button>
          </div>

          {stations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stations.map((st) => (
                <div key={st.id} className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 inline-block">
                        {st.code}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-[14px] mt-1">{st.name}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px] font-medium">
                    <div className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 font-semibold">
                      S: {st.compartments.filter(c => c.size === 'small').length}
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 font-semibold">
                      M: {st.compartments.filter(c => c.size === 'medium').length}
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 font-semibold">
                      L: {st.compartments.filter(c => c.size === 'large').length}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => navigate(`/lockers/${st.id}`)}
                      className="text-[12px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      Xem chi tiết sơ đồ tủ →
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/lockers/${st.id}/hardware`)}
                      className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      🔧 Hardware Specs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-slate-500 dark:text-slate-400 text-[12px]">
              Chưa gán trạm tủ phần cứng riêng. Hệ thống tự động phân bổ trạm tủ khi khởi tạo.
            </div>
          )}
        </article>

        {/* Form Actions Footer */}
        <div className="setting-card-custom p-6 rounded-2xl border shadow-xs flex items-center justify-between">
          <p className="setting-desc-custom text-[13px] font-medium">
            Mọi thay đổi sẽ có hiệu lực ngay lập tức trên toàn hệ thống quản lý.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/organizations')}
              className="modal-cancel-custom h-10 px-4 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <AppButton type="submit" disabled={isSubmitting} className="flex items-center gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {isSubmitting ? 'Đang lưu...' : 'Lưu Tất Cả Thay Đổi'}
            </AppButton>
          </div>
        </div>

      </form>

    </div>
  )
}
