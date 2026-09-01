import { useEffect, useMemo, useState } from 'react'
import { getShipments } from '../../service/shipment.service'
import type { TShipment, TShipmentFilter, TShipmentStatus } from '../../types/shipment.type'
import { EmptyState } from '../../components/shared/EmptyState/EmptyState'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../context/LanguageContext'
import { Search } from 'lucide-react'

const statusBadges: Record<TShipmentStatus, { label: string; style: string }> = {
  pending:        { label: 'Chờ gửi tủ', style: 'bg-slate-100 text-slate-700 border-slate-300' },
  waiting_pickup: { label: 'Chờ nhận hàng', style: 'bg-amber-100 text-amber-800 border-amber-300' },
  stored:         { label: 'Đã gửi vào tủ', style: 'bg-sky-100 text-sky-800 border-sky-300' },
  picked_up:      { label: 'Đã hoàn tất',  style: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  expired:        { label: 'Quá hạn',       style: 'bg-red-100 text-red-800 border-red-300' },
  failed:         { label: 'Lỗi thiết bị', style: 'bg-rose-100 text-rose-800 border-rose-300' },
}

export function ShipmentsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [shipments, setShipments] = useState<TShipment[]>([])
  const [filter, setFilter] = useState<TShipmentFilter>({
    search: '',
    shipmentStatus: 'all',
    otpStatus: 'all',
    cluster: 'all',
  })

  useEffect(() => {
    getShipments().then(setShipments)
  }, [])

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const keyword = filter.search.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        `${s.shipmentCode} ${s.recipientName} ${s.recipientPhone} ${s.lockerCode} ${s.cluster}`
          .toLowerCase()
          .includes(keyword)
      const matchShipmentStatus =
        filter.shipmentStatus === 'all' || s.shipmentStatus === filter.shipmentStatus
      const matchOtpStatus = filter.otpStatus === 'all' || s.otpStatus === filter.otpStatus
      const matchCluster = filter.cluster === 'all' || s.cluster === filter.cluster

      return matchSearch && matchShipmentStatus && matchOtpStatus && matchCluster
    })
  }, [shipments, filter])

  // Count metrics for quick filter badges
  const waitingPickupCount = useMemo(() => shipments.filter((s) => s.shipmentStatus === 'waiting_pickup').length, [shipments])
  const completedCount = useMemo(() => shipments.filter((s) => s.shipmentStatus === 'picked_up').length, [shipments])

  return (
    <div className="flex flex-col gap-5 max-w-[1250px]">

      {/* Compact Top Bar - Streamlined Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-700">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-slate-900 leading-tight">{t('shipments.title')}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                {filteredShipments.length} {t('shipments.orders')}
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">{t('shipments.desc')}</p>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter((p) => ({ ...p, shipmentStatus: 'all' }))}
            className={[
              "px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer border",
              filter.shipmentStatus === 'all'
                ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200",
            ].join(" ")}
          >
            Tất cả ({shipments.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter((p) => ({ ...p, shipmentStatus: 'waiting_pickup' }))}
            className={[
              "px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer border",
              filter.shipmentStatus === 'waiting_pickup'
                ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
            ].join(" ")}
          >
            Chờ nhận ({waitingPickupCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter((p) => ({ ...p, shipmentStatus: 'picked_up' }))}
            className={[
              "px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer border",
              filter.shipmentStatus === 'picked_up'
                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
            ].join(" ")}
          >
            Đã hoàn tất ({completedCount})
          </button>
        </div>
      </section>

      {/* Filter Bar */}
      <div data-reveal className="setting-card-custom p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-2xs border">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Tên người nhận, SĐT, Mã tủ..."
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="setting-input-custom w-full h-10 pl-9 pr-3.5 rounded-xl text-[13px] border focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <select
            value={filter.cluster}
            onChange={(e) => setFilter((prev) => ({ ...prev, cluster: e.target.value as any }))}
            className="h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 text-slate-900 border border-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer w-full md:w-48"
          >
            <option value="all">Tất cả cụm tủ</option>
            <option value="A">Cụm A - Khu Văn Phòng</option>
            <option value="B">Cụm B - Trọ Hoàng Nam</option>
            <option value="C">Cụm C - KTX Bách Khoa</option>
          </select>
        </div>
      </div>

      {/* Main Logistics Parcel Board Table */}
      <div data-reveal className="rounded-2xl glass-card overflow-hidden shadow-xs border border-slate-200">
        {filteredShipments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-mono text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã Đơn & Locker</th>
                  <th className="py-3.5 px-5">Shipper & Người Nhận</th>
                  <th className="py-3.5 px-5">Tiến Trình (Parcel Stepper)</th>
                  <th className="py-3.5 px-5">Trạng Thái OTP</th>
                  <th className="py-3.5 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] bg-white">
                {filteredShipments.map((s) => {
                  const badge = statusBadges[s.shipmentStatus] ?? statusBadges.waiting_pickup

                  return (
                    <tr key={s.id} className="hover:bg-sky-50/40 transition-colors">
                      {/* Code & Locker */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-bold text-sky-700 text-[13px]">{s.shipmentCode}</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-max">
                            Tủ {s.lockerCode} ({s.cluster})
                          </span>
                        </div>
                      </td>

                      {/* Shipper & Recipient */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col text-[12px]">
                          <span className="font-bold text-slate-900">{s.recipientName}</span>
                          <span className="font-mono text-slate-500">{s.recipientPhone}</span>
                          <span className="text-[11px] text-slate-400 mt-0.5">Bởi: {s.shipperName}</span>
                        </div>
                      </td>

                      {/* Stepper Progress */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 text-[11.5px] font-mono whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${s.shipmentStatus !== 'pending' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700' : 'text-slate-400'}`}>
                            1. Đã gửi
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">→</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] ${s.otpStatus === 'active' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700' : 'text-slate-400'}`}>
                            2. OTP Active
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">→</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] ${s.shipmentStatus === 'picked_up' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold' : 'text-slate-400'}`}>
                            3. Đã nhận
                          </span>
                        </div>
                      </td>

                      {/* OTP Status */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[12px] font-semibold">
                            <span className={`w-2 h-2 rounded-full ${
                              s.shipmentStatus === 'picked_up' ? 'bg-emerald-500' : s.shipmentStatus === 'waiting_pickup' ? 'bg-sky-500 animate-pulse' : s.shipmentStatus === 'expired' ? 'bg-red-500' : 'bg-slate-400'
                            }`} />
                            <span className={s.shipmentStatus === 'picked_up' ? 'text-emerald-600 dark:text-emerald-400' : s.shipmentStatus === 'waiting_pickup' ? 'text-sky-600 dark:text-sky-400' : s.shipmentStatus === 'expired' ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'}>
                              {badge.label}
                            </span>
                          </div>
                          {s.otpCode && (
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              Mã OTP: <strong className="text-slate-900 dark:text-white font-bold">{s.otpCode}</strong>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/shipments/${s.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white transition-all text-[11px] font-semibold font-mono cursor-pointer shadow-2xs"
                        >
                          👁️ Chi tiết đơn
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
            title="Không tìm thấy bưu kiện phù hợp"
            description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái."
          />
        )}
      </div>

    </div>
  )
}
