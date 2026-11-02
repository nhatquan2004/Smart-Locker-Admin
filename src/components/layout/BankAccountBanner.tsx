import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useTranslation } from '../../context/LanguageContext'
import { BANK_ACCOUNT_UPDATED_EVENT, getMyBuildingPayment } from '../../service/payment.service'

// Cảnh báo Ban quản lý khi tòa nhà chưa có tài khoản nhận tiền.
// Thiếu tài khoản thì server không tạo được mã QR, cư dân có phí sẽ không lấy được hàng.
export function BankAccountBanner() {
  const { t } = useTranslation()
  const location = useLocation()
  const isBuildingAdmin = useAuthStore((s) => s.user?.role === 'org_admin')
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!isBuildingAdmin) return
    let active = true
    const check = () => {
      getMyBuildingPayment()
        .then((res) => {
          if (active) setMissing(!res.hasBankAccount)
        })
        .catch(() => {
          // Không đọc được thì không cảnh báo, tránh báo sai
          if (active) setMissing(false)
        })
    }
    check()
    window.addEventListener(BANK_ACCOUNT_UPDATED_EVENT, check)
    return () => {
      active = false
      window.removeEventListener(BANK_ACCOUNT_UPDATED_EVENT, check)
    }
  }, [isBuildingAdmin])

  if (!isBuildingAdmin || !missing || location.pathname === '/payment-settings') return null

  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
      <span className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        {t('pay.bannerMissing')}
      </span>
      <Link
        to="/payment-settings"
        className="shrink-0 rounded-xl bg-amber-600 px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-amber-700 text-center"
      >
        {t('pay.bannerAction')}
      </Link>
    </div>
  )
}
