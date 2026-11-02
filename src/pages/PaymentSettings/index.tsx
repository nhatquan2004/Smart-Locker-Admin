import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, Landmark, Receipt, RotateCcw } from 'lucide-react'
import { AppButton } from '../../components/common'
import { useTranslation } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrencyVnd } from '../../i18n/format'
import type { TranslationKey } from '../../i18n/translations'
import {
  DEFAULT_PRICING_POLICY,
  buildPricingTiers,
  getMyBuildingPayment,
  isBankAccountComplete,
  updateMyBuildingPayment,
  type TBankAccount,
  type TPricingPolicy,
} from '../../service/payment.service'

// Một số ngân hàng phổ biến để Ban quản lý chọn nhanh mã BIN theo chuẩn NAPAS
const COMMON_BANKS: { bin: string; name: string }[] = [
  { bin: '970422', name: 'MB Bank' },
  { bin: '970436', name: 'Vietcombank' },
  { bin: '970407', name: 'Techcombank' },
  { bin: '970415', name: 'VietinBank' },
  { bin: '970418', name: 'BIDV' },
  { bin: '970405', name: 'Agribank' },
  { bin: '970416', name: 'ACB' },
  { bin: '970432', name: 'VPBank' },
  { bin: '970423', name: 'TPBank' },
  { bin: '970403', name: 'Sacombank' },
]

const inputCls =
  'h-10 w-full px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500'
const labelCls = 'text-[12px] font-semibold text-slate-700 dark:text-slate-300'
const hintCls = 'text-[11px] text-slate-500 dark:text-slate-400'
const cardCls = 'setting-card-custom rounded-2xl border shadow-xs p-6 flex flex-col gap-5'

// Màu từng chặng phí: càng để lâu càng nóng (cùng bảng màu với thẻ phí ở chi tiết bưu kiện)
const TIER_DOT: Record<string, string> = {
  FREE: 'bg-emerald-500',
  TIER_1: 'bg-amber-400',
  TIER_2: 'bg-orange-500',
  RETRIEVAL: 'bg-red-500',
}

// Nhóm số tài khoản theo cụm 4 chữ số cho dễ đọc
function groupAccountNumber(raw: string): string {
  return raw.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
}

function SectionHead({ icon, title, desc, aside }: { icon: ReactNode; title: string; desc: string; aside?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">{icon}</span>
        <div className="min-w-0">
          <h2 className="setting-title-custom text-[16px] font-bold">{title}</h2>
          <p className="setting-desc-custom text-[12.5px] mt-0.5">{desc}</p>
        </div>
      </div>
      {aside}
    </div>
  )
}

const POLICY_FIELDS: { group: TranslationKey; fields: { key: keyof TPricingPolicy; label: TranslationKey; unit: 'vnd' | 'hours'; hint?: TranslationKey }[] }[] = [
  {
    group: 'pay.groupBase',
    fields: [
      { key: 'perUseFee', label: 'pay.perUseFee', unit: 'vnd' },
      { key: 'monthlySubscriptionFee', label: 'pay.monthlyFee', unit: 'vnd' },
    ],
  },
  {
    group: 'pay.groupHours',
    fields: [
      { key: 't1Hours', label: 'pay.t1', unit: 'hours' },
      { key: 't2Hours', label: 'pay.t2', unit: 'hours' },
      { key: 't3Hours', label: 'pay.t3', unit: 'hours' },
    ],
  },
  {
    group: 'pay.groupOverdue',
    fields: [
      { key: 'feeX1', label: 'pay.feeX1', unit: 'vnd' },
      { key: 'feeX2', label: 'pay.feeX2', unit: 'vnd' },
      { key: 'maxOverdueFeeCap', label: 'pay.cap', unit: 'vnd', hint: 'pay.capHint' },
    ],
  },
]

// Kiểm tra giống server để báo lỗi ngay trên form trước khi gửi
function validatePolicy(p: TPricingPolicy): TranslationKey | null {
  const hours = [p.t1Hours, p.t2Hours, p.t3Hours]
  if (hours.some((h) => !Number.isInteger(h) || h < 1)) return 'pay.errHoursInt'
  if (!(p.t1Hours < p.t2Hours && p.t2Hours < p.t3Hours)) return 'pay.errHoursOrder'
  const fees = [p.perUseFee, p.monthlySubscriptionFee, p.feeX1, p.feeX2, p.maxOverdueFeeCap]
  if (fees.some((f) => !Number.isFinite(f) || f < 0)) return 'pay.errFees'
  return null
}

export function PaymentSettingsPage() {
  const { t } = useTranslation()
  const toast = useToast()

  const [buildingName, setBuildingName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [bank, setBank] = useState<TBankAccount>({ bankBin: '', bankName: '', accountNumber: '', accountName: '' })
  const [savedBankOk, setSavedBankOk] = useState(false)
  const [savingBank, setSavingBank] = useState(false)

  const [policy, setPolicy] = useState<TPricingPolicy>(DEFAULT_PRICING_POLICY)
  const [savingPolicy, setSavingPolicy] = useState(false)

  useEffect(() => {
    let active = true
    getMyBuildingPayment()
      .then((res) => {
        if (!active) return
        setBuildingName(res.buildingName)
        setBank(res.bankAccount)
        setSavedBankOk(res.hasBankAccount)
        setPolicy(res.pricingPolicy)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : '')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const policyError = validatePolicy(policy)
  const tiers = useMemo(() => (policyError ? [] : buildPricingTiers(policy)), [policy, policyError])

  async function handleSaveBank() {
    if (!isBankAccountComplete(bank)) {
      toast.error(t('pay.bankIncomplete'))
      return
    }
    setSavingBank(true)
    try {
      const saved = await updateMyBuildingPayment({ bankAccount: bank })
      setBank(saved.bankAccount)
      setSavedBankOk(saved.hasBankAccount)
      toast.success(t('pay.bankSaved'))
    } catch (err) {
      toast.error(t('pay.saveFailed', { message: err instanceof Error ? err.message : '' }))
    } finally {
      setSavingBank(false)
    }
  }

  async function handleSavePolicy() {
    if (policyError) {
      toast.error(t(policyError))
      return
    }
    setSavingPolicy(true)
    try {
      const saved = await updateMyBuildingPayment({ pricingPolicy: policy })
      setPolicy(saved.pricingPolicy)
      toast.success(t('pay.policySaved'))
    } catch (err) {
      toast.error(t('pay.saveFailed', { message: err instanceof Error ? err.message : '' }))
    } finally {
      setSavingPolicy(false)
    }
  }

  function setPolicyField(key: keyof TPricingPolicy, raw: string) {
    setPolicy((prev) => ({ ...prev, [key]: raw === '' ? Number.NaN : Number(raw) }))
  }

  if (loading) {
    return <div className="p-8 text-center text-[13px] text-slate-500">{t('common.loading')}</div>
  }

  if (error !== null) {
    return <div className="p-8 text-center text-[13px] text-red-600 dark:text-red-400">{t('pay.loadFailed', { message: error })}</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <header data-reveal>
        <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">{t('pay.title')}</h1>
        <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400 max-w-2xl">{t('pay.desc', { name: buildingName })}</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          {/* Tài khoản nhận tiền */}
          <section data-reveal className={cardCls}>
            <SectionHead
              icon={<Landmark className="w-[18px] h-[18px]" />}
              title={t('pay.bankTitle')}
              desc={t('pay.bankDesc')}
              aside={
                <span
                  className={`inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    savedBankOk
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {savedBankOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {savedBankOk ? t('pay.bankStatusOk') : t('pay.bankStatusMissing')}
                </span>
              }
            />

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('pay.bankPick')}</label>
              <select
                value={COMMON_BANKS.find((b) => b.bin === bank.bankBin)?.bin ?? ''}
                onChange={(e) => {
                  const picked = COMMON_BANKS.find((b) => b.bin === e.target.value)
                  if (picked) setBank((prev) => ({ ...prev, bankBin: picked.bin, bankName: picked.name }))
                }}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="">{t('pay.bankPickPh')}</option>
                {COMMON_BANKS.map((b) => (
                  <option key={b.bin} value={b.bin}>{b.name} ({b.bin})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>{t('pay.bankBin')} <span className="text-red-500">*</span></label>
                <input
                  value={bank.bankBin}
                  inputMode="numeric"
                  onChange={(e) => setBank((prev) => ({ ...prev, bankBin: e.target.value }))}
                  className={`${inputCls} font-mono`}
                />
                <span className={hintCls}>{t('pay.bankBinHint')}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>{t('pay.bankName')}</label>
                <input
                  value={bank.bankName}
                  onChange={(e) => setBank((prev) => ({ ...prev, bankName: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>{t('pay.accountNumber')} <span className="text-red-500">*</span></label>
                <input
                  value={bank.accountNumber}
                  inputMode="numeric"
                  onChange={(e) => setBank((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>{t('pay.accountName')} <span className="text-red-500">*</span></label>
                <input
                  value={bank.accountName}
                  onChange={(e) => setBank((prev) => ({ ...prev, accountName: e.target.value }))}
                  className={`${inputCls} uppercase`}
                />
                <span className={hintCls}>{t('pay.accountNameHint')}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <AppButton onClick={handleSaveBank} disabled={savingBank || !isBankAccountComplete(bank)}>
                {savingBank ? t('common.saving') : t('pay.save')}
              </AppButton>
            </div>
          </section>

          {/* Biểu phí */}
          <section data-reveal className={cardCls}>
            <SectionHead icon={<Receipt className="w-[18px] h-[18px]" />} title={t('pay.policyTitle')} desc={t('pay.policyDesc')} />

            {POLICY_FIELDS.map((group) => (
              <div key={group.group} className="flex flex-col gap-3 rounded-xl border border-slate-200/70 dark:border-slate-700/60 p-4">
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{t(group.group)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {group.fields.map((f) => (
                    <div key={f.key} className="flex flex-col gap-1.5">
                      <label className={labelCls}>{t(f.label)}</label>
                      <div className="relative">
                        <input
                          type="number"
                          min={f.unit === 'hours' ? 1 : 0}
                          step={f.unit === 'hours' ? 1 : 1000}
                          value={Number.isNaN(policy[f.key]) ? '' : policy[f.key]}
                          onChange={(e) => setPolicyField(f.key, e.target.value)}
                          className={`${inputCls} font-mono pr-12`}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                          {f.unit === 'hours' ? 'h' : 'đ'}
                        </span>
                      </div>
                      {f.hint && <span className={hintCls}>{t(f.hint)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {policyError && (
              <p className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-[12px] text-red-700 dark:text-red-300">
                {t(policyError)}
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPolicy(DEFAULT_PRICING_POLICY)}
                className="h-10 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                {t('pay.reset')}
              </button>
              <AppButton onClick={handleSavePolicy} disabled={savingPolicy || policyError !== null}>
                {savingPolicy ? t('common.saving') : t('pay.save')}
              </AppButton>
            </div>
          </section>
        </div>

        {/* Cột phải: xem trước thẻ nhận tiền và biểu phí, cuộn theo trang */}
        <aside className="flex flex-col gap-6 xl:sticky xl:top-24 min-w-0">
          <div data-reveal className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-5 text-white shadow-md">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-400/15" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[13px] font-semibold">
                <Landmark className="w-4 h-4 text-sky-300" />
                {bank.bankName || '—'}
              </span>
              <span className="font-mono text-[11px] text-slate-400">{bank.bankBin ? `BIN ${bank.bankBin}` : ''}</span>
            </div>
            <p className="relative mt-6 font-mono text-[20px] tracking-wider break-all">{groupAccountNumber(bank.accountNumber) || '—'}</p>
            <p className="relative mt-4 text-[12.5px] font-semibold uppercase tracking-wide text-slate-300 break-words">{bank.accountName || '—'}</p>
          </div>

          {tiers.length > 0 && (
            <div data-reveal className={`${cardCls} !gap-4`}>
              <h3 className="setting-title-custom text-[14px] font-bold">{t('pay.previewTitle')}</h3>
              <ol className="flex flex-col">
                {tiers.map((tier, i) => (
                  <li key={tier.tier} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < tiers.length - 1 && <span className="absolute left-[5px] top-4 bottom-0 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />}
                    <span className={`relative mt-1 h-[11px] w-[11px] shrink-0 rounded-full ${TIER_DOT[tier.tier] ?? 'bg-slate-400'}`} />
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white">{t(`pay.tier.${tier.tier}` as TranslationKey)}</p>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                          {tier.toHours === null
                            ? t('pay.rangeAfter', { from: tier.fromHours })
                            : t('pay.rangeFromTo', { from: tier.fromHours, to: tier.toHours })}
                        </p>
                        {tier.tier === 'RETRIEVAL' && <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-300">{t('pay.retrievalNote')}</p>}
                      </div>
                      {tier.tier !== 'RETRIEVAL' && (
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-[13px] font-semibold text-slate-900 dark:text-white">{formatCurrencyVnd(tier.retailFee)}</p>
                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400">{t('pay.colSubscriber')}: {formatCurrencyVnd(tier.subscriberFee)}</p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <p className={hintCls}>{t('pay.previewNote')}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
