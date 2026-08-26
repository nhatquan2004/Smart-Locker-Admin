import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOrganizations } from '../../../service/organization.service'
import type { TOrganization, TOrgType } from '../../../types/organization.type'
import { AppButton } from '../../../components/common'

export function OrganizationDetailPage() {
  const navigate = useNavigate()
  const { orgId } = useParams()

  const [org, setOrg] = useState<TOrganization | null>(null)
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<TOrgType>('enterprise')
  const [formAddress, setFormAddress] = useState('')
  const [formLockers, setFormLockers] = useState(12)
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
        setFormLockers(found.totalLockers)
        setFormAdminName(found.adminName)
        setFormAdminEmail(found.adminEmail)
      }
    })
  }, [orgId])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return

    setIsSubmitting(true)
    setTimeout(() => {
      setOrg((prev) =>
        prev
          ? {
              ...prev,
              name: formName,
              type: formType,
              address: formAddress,
              totalLockers: formLockers,
              adminName: formAdminName,
              adminEmail: formAdminEmail,
            }
          : null
      )
      setIsSubmitting(false)
      setSaveSuccessMsg(`✓ Đã cập nhật cấu hình đơn vị "${formName}" thành công!`)
      setTimeout(() => setSaveSuccessMsg(''), 4000)
    }, 400)
  }

  if (!org) {
    return (
      <div className="p-8 text-center text-slate-500">
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
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="relative z-10 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/organizations')}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-sky-600 hover:text-sky-700 mb-3 transition-colors cursor-pointer"
          >
            ← Quay lại danh sách Doanh Nghiệp / Khu Trọ
          </button>

          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-mono text-sky-800 font-bold bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
              {org.code}
            </span>
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">{org.type}</span>
          </div>
          <h1 className="text-[22px] font-bold text-slate-900 leading-tight truncate">{org.name}</h1>
          <p className="mt-1 text-[13px] text-slate-600 leading-relaxed max-w-lg truncate">📍 {org.address}</p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="h-10 px-4 rounded-xl text-[13px] font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2"
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
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[13px] font-bold leading-relaxed shadow-2xs animate-fade-in">
          {saveSuccessMsg}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} data-reveal className="flex flex-col gap-6">
        
        {/* Section 1: Basic Information */}
        <article className="p-6 rounded-2xl glass-card border border-slate-200 shadow-xs flex flex-col gap-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-[16px] font-bold text-slate-900">1. Thông tin cơ bản & Địa chỉ</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Chỉnh sửa tên doanh nghiệp/khu trọ, mã định danh và địa chỉ sở hữu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Tên Doanh Nghiệp / Khu Trọ</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Mã Đơn Vị (Code)</label>
                <input
                  type="text"
                  disabled
                  value={org.code}
                  className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-100 text-slate-500 border border-slate-300 font-mono font-bold cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Loại Hình</label>
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

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Địa Chỉ Chi Tiết</label>
              <input
                type="text"
                required
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </article>

        {/* Section 2: Admin Representative & Capacity */}
        <article className="p-6 rounded-2xl glass-card border border-slate-200 shadow-xs flex flex-col gap-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-[16px] font-bold text-slate-900">2. Admin Đại Diện & Quy Mô Tủ</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Cấu hình thông tin đăng nhập của Admin quản lý và giới hạn số tủ gán.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Họ Tên Admin Đại Diện</label>
              <input
                type="text"
                required
                value={formAdminName}
                onChange={(e) => setFormAdminName(e.target.value)}
                className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Email Admin Đăng Nhập</label>
              <input
                type="email"
                required
                value={formAdminEmail}
                onChange={(e) => setFormAdminEmail(e.target.value)}
                className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-600 uppercase font-semibold">Số Lượng Tủ Quy Định</label>
              <input
                type="number"
                required
                min={1}
                value={formLockers}
                onChange={(e) => setFormLockers(Number(e.target.value))}
                className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 font-mono font-bold"
              />
            </div>
          </div>
        </article>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-between p-6 rounded-2xl glass-card border border-slate-200 shadow-xs">
          <p className="text-[13px] text-slate-600 font-medium">
            Mọi thay đổi sẽ có hiệu lực ngay lập tức trên toàn hệ thống quản lý.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/organizations')}
              className="h-10 px-4 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
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
