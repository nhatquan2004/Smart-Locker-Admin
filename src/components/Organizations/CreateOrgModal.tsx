import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Building2, Check, Landmark, MapPin, UserCog, X } from 'lucide-react'
import { AppButton } from '../common'
import { useTranslation } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import type { TranslationKey } from '../../i18n/translations'
import { createOrganization } from '../../service/organization.service'
import { COMMON_BANKS } from '../../service/payment.service'
import { createUser } from '../../service/user.service'
import type { TOrganization } from '../../types/organization.type'
import { geocodeAddress } from '../../utils/geocode'
import { LocationPicker, type TPin } from './LocationPicker'

type TProps = {
  onClose: () => void
  // Doanh nghiệp đã tạo xong trên server
  onCreated: (org: TOrganization) => void
}

const inputCls =
  'h-10 w-full px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500'
const labelCls = 'text-[12px] font-semibold text-slate-700 dark:text-slate-300'
const hintCls = 'text-[11px] text-slate-500 dark:text-slate-400'

const STEPS: { icon: React.ReactNode; title: TranslationKey; desc: TranslationKey }[] = [
  { icon: <Building2 className="w-4 h-4" />, title: 'org.w.step1', desc: 'org.w.s1Desc' },
  { icon: <Landmark className="w-4 h-4" />, title: 'org.w.step2', desc: 'org.w.s2Desc' },
  { icon: <UserCog className="w-4 h-4" />, title: 'org.w.step3', desc: 'org.w.s3Desc' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Tạo tòa nhà mới theo 3 bước: thông tin và vị trí, tài khoản nhận tiền, tài khoản Ban quản lý
export function CreateOrgModal({ onClose, onCreated }: TProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [address, setAddress] = useState('')
  const [floors, setFloors] = useState('')
  const [apartments, setApartments] = useState('')
  const [hotline, setHotline] = useState('')
  // Ghim vị trí: lấy từ địa chỉ, GPS, tọa độ dán vào hoặc kéo trên bản đồ. Phải được xác nhận mới đi tiếp.
  const [pin, setPin] = useState<TPin | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [addressPoint, setAddressPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [finding, setFinding] = useState(false)
  const [findFailed, setFindFailed] = useState(false)

  const [bankBin, setBankBin] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')

  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  const addressTrim = address.trim()
  function changePin(next: TPin) {
    setPin(next)
    setConfirmed(false)
  }

  // Tìm tọa độ theo địa chỉ để đặt ghim ban đầu. Kết quả chỉ là gợi ý gần đúng, người dùng phải kiểm tra và xác nhận.
  async function findByAddress() {
    if (!addressTrim) return
    setFinding(true)
    setFindFailed(false)
    const coords = await geocodeAddress(addressTrim).catch(() => null)
    setFinding(false)
    if (!coords) {
      setFindFailed(true)
      return
    }
    setAddressPoint(coords)
    changePin({ ...coords, source: 'address' })
  }

  const floorsNum = Number(floors)
  const apartmentsNum = Number(apartments)
  const stepValid = [
    Boolean(name.trim() && code.trim() && addressTrim && Number.isInteger(floorsNum) && floorsNum >= 1 && Number.isInteger(apartmentsNum) && apartmentsNum >= 1 && pin && confirmed),
    Boolean(bankBin.trim() && accountNumber.trim() && accountName.trim()),
    Boolean(adminName.trim() && EMAIL_RE.test(adminEmail.trim()) && adminPhone.trim() && adminPassword.length >= 8),
  ]

  function handleNext() {
    if (!stepValid[step] || busy) return
    setStep((s) => s + 1)
  }

  async function handleCreate() {
    if (!stepValid[2] || busy) return
    setBusy(true)
    let org: TOrganization
    try {
      org = await createOrganization({
        name: name.trim(),
        code: code.trim(),
        type: 'enterprise',
        address: addressTrim,
        latitude: pin?.lat,
        longitude: pin?.lng,
        totalFloors: floorsNum,
        totalApartments: apartmentsNum,
        hotline: hotline.trim() || undefined,
        bankAccount: { bankBin, bankName, accountNumber, accountName },
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
      })
    } catch (err) {
      toast.error(t('org.createFailed', { message: err instanceof Error ? err.message : '' }))
      setBusy(false)
      return
    }

    try {
      await createUser({
        fullName: adminName.trim(),
        phone: adminPhone.trim(),
        email: adminEmail.trim(),
        password: adminPassword,
        role: 'org_admin',
        orgId: org.id,
        companyName: org.name,
        unitNumber: t('org.adminUnitNumber'),
      })
    } catch (err) {
      toast.error(t('org.adminCreateFailed', { message: err instanceof Error ? err.message : '' }))
    }

    toast.success(t('org.createdToast', { name: org.name }))
    setBusy(false)
    onCreated(org)
  }

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="my-8 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div>
            <h3 className="text-[18px] font-bold text-slate-900 dark:text-white">{t('org.createTitle')}</h3>
            <p className="mt-0.5 text-[12.5px] text-slate-500 dark:text-slate-400">{t('org.createDesc')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={t('common.close')}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh các bước */}
        <ol className="grid grid-cols-3 gap-2 px-6 pt-5">
          {STEPS.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <li key={s.title} className="relative flex flex-col items-center gap-1.5 text-center">
                {i > 0 && <span className={`absolute right-1/2 top-[15px] h-0.5 w-full ${i <= step ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} aria-hidden="true" />}
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : active
                        ? 'border-sky-500 bg-sky-500 text-white ring-4 ring-sky-500/15'
                        : 'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800'
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : s.icon}
                </span>
                <span className={`text-[12px] leading-tight ${active ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400'}`}>{t(s.title)}</span>
              </li>
            )
          })}
        </ol>

        <div className="flex flex-col gap-4 px-6 py-5">
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400">{t(STEPS[step].desc)}</p>

          {step === 0 && (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('org.fieldName')} <span className="text-red-500">*</span></label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('org.namePlaceholder')} className={`${inputCls} font-semibold`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('org.fieldCode')} <span className="text-red-500">*</span></label>
                  <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={t('org.codePlaceholder')} className={`${inputCls} font-mono font-bold`} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>{t('org.fieldAddress')} <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void findByAddress()
                      }
                    }}
                    placeholder={t('org.addressPlaceholder')}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={findByAddress}
                    disabled={!addressTrim || finding}
                    className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    {finding ? t('org.w.locFinding') : t('org.w.locFind')}
                  </button>
                </div>
                {findFailed && <p className="text-[11.5px] text-amber-600 dark:text-amber-400">{t('org.w.locNone')}</p>}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('org.w.floors')} <span className="text-red-500">*</span></label>
                  <input type="number" min={1} value={floors} onChange={(e) => setFloors(e.target.value)} className={`${inputCls} font-mono`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('org.w.apartments')} <span className="text-red-500">*</span></label>
                  <input type="number" min={1} value={apartments} onChange={(e) => setApartments(e.target.value)} className={`${inputCls} font-mono`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('org.w.hotline')}</label>
                  <input type="tel" value={hotline} onChange={(e) => setHotline(e.target.value)} className={`${inputCls} font-mono`} />
                </div>
              </div>

              <LocationPicker pin={pin} onPin={changePin} confirmed={confirmed} onConfirm={setConfirmed} addressPoint={addressPoint} />
              {!(pin && confirmed) && <p className="text-[11.5px] text-amber-600 dark:text-amber-400">{t('org.w.needConfirm')}</p>}
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>{t('pay.bankPick')}</label>
                <select
                  value={COMMON_BANKS.find((b) => b.bin === bankBin)?.bin ?? ''}
                  onChange={(e) => {
                    const picked = COMMON_BANKS.find((b) => b.bin === e.target.value)
                    if (picked) {
                      setBankBin(picked.bin)
                      setBankName(picked.name)
                    }
                  }}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="">{t('pay.bankPickPh')}</option>
                  {COMMON_BANKS.map((b) => (
                    <option key={b.bin} value={b.bin}>{b.name} ({b.bin})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('pay.bankBin')} <span className="text-red-500">*</span></label>
                  <input value={bankBin} inputMode="numeric" onChange={(e) => setBankBin(e.target.value)} className={`${inputCls} font-mono`} />
                  <span className={hintCls}>{t('pay.bankBinHint')}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('pay.bankName')}</label>
                  <input value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('pay.accountNumber')} <span className="text-red-500">*</span></label>
                  <input value={accountNumber} inputMode="numeric" onChange={(e) => setAccountNumber(e.target.value)} className={`${inputCls} font-mono`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('pay.accountName')} <span className="text-red-500">*</span></label>
                  <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className={`${inputCls} uppercase`} />
                  <span className={hintCls}>{t('pay.accountNameHint')}</span>
                </div>
              </div>
              <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">{t('org.w.bankNote')}</p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('org.w.adminName')} <span className="text-red-500">*</span></label>
                  <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('org.w.adminPhone')} <span className="text-red-500">*</span></label>
                  <input type="tel" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} className={`${inputCls} font-mono`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('org.w.adminEmail')} <span className="text-red-500">*</span></label>
                  <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className={`${inputCls} font-mono`} />
                  {adminEmail.trim() !== '' && !EMAIL_RE.test(adminEmail.trim()) && <span className="text-[11px] text-red-600 dark:text-red-400">{t('org.w.errEmail')}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>{t('org.w.adminPassword')} <span className="text-red-500">*</span></label>
                  <input type="password" autoComplete="new-password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className={inputCls} />
                  {adminPassword !== '' && adminPassword.length < 8 && <span className="text-[11px] text-red-600 dark:text-red-400">{t('org.w.errPassword')}</span>}
                </div>
              </div>
              <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">{t('org.w.adminNote')}</p>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
            disabled={busy}
            className="h-10 rounded-xl border border-slate-200 px-4 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
          >
            {step === 0 ? t('common.cancel') : t('org.w.back')}
          </button>
          {step < STEPS.length - 1 ? (
            <AppButton onClick={handleNext} disabled={!stepValid[step] || busy}>
              {busy ? t('org.locating') : t('org.w.next')}
            </AppButton>
          ) : (
            <AppButton onClick={handleCreate} disabled={!stepValid[2] || busy}>
              {busy ? t('common.saving') : t('org.createBtn')}
            </AppButton>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
