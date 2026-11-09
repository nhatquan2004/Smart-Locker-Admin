import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { UserRoleBadge } from '../../../components/Users/UserRoleBadge'
import type { TUser, TUserRole } from '../../../types/user.type'
import { useAuthStore } from '../../../store/useAuthStore'
import { useUserStore } from '../../../store/useUserStore'
import { deleteUser, getUserById, updateUser } from '../../../service/user.service'
import { getBuildingNames } from '../../../service/buildingNames'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../context/LanguageContext'
import { formatDate } from '../../../i18n/format'
import type { TranslationKey } from '../../../i18n/translations'
import { AlertTriangle, ArrowLeft, Check, ExternalLink, Lock, LockOpen, Trash2, X } from 'lucide-react'

// Giới hạn của server (UpdateUserByAdminDto)
const NAME_MIN = 2
const NAME_MAX = 100
const APARTMENT_MAX = 50
const NOTE_MAX = 500

type TApproval = NonNullable<TUser['approvalStatus']>

const roleKeys: Record<TUserRole, TranslationKey> = {
  user: 'um2.role.user',
  shipper: 'um2.role.shipper',
  org_admin: 'um2.role.org_admin',
  super_admin: 'um2.role.super_admin',
}

const statusStyle: Record<TApproval, { label: TranslationKey; desc: TranslationKey; dot: string; chip: string }> = {
  ACTIVE: {
    label: 'um2.st.ACTIVE',
    desc: 'um2.stDesc.ACTIVE',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  SUSPENDED: {
    label: 'um2.st.SUSPENDED',
    desc: 'um2.stDesc.SUSPENDED',
    dot: 'bg-red-500',
    chip: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  },
  PENDING: {
    label: 'um2.st.PENDING',
    desc: 'um2.stDesc.PENDING',
    dot: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  REJECTED: {
    label: 'um2.st.REJECTED',
    desc: 'um2.stDesc.REJECTED',
    dot: 'bg-slate-400',
    chip: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300',
  },
}

const inputCls =
  'h-10 w-full rounded-xl border px-3.5 text-[13.5px] font-medium bg-slate-50 text-slate-900 border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:focus:bg-slate-900'

type TForm = { fullName: string; apartment: string; note: string }

function toForm(u: TUser): TForm {
  return { fullName: u.fullName, apartment: u.apartment ?? '', note: u.note ?? '' }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts
    .slice(-2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function FixedRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/60">
      <dt className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500 dark:text-slate-400">
        <Lock className="w-3 h-3" />
        {label}
      </dt>
      <dd className={`truncate text-[13px] font-semibold text-slate-900 dark:text-white ${mono ? 'font-mono' : ''}`} title={value}>
        {value}
      </dd>
    </div>
  )
}

export function UserManagePage() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const toast = useToast()
  const { t } = useTranslation()
  const loggedUser = useAuthStore((state) => state.user)

  const [user, setUser] = useState<TUser | null>(null)
  const [form, setForm] = useState<TForm>({ fullName: '', apartment: '', note: '' })
  const [buildingName, setBuildingName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [confirm, setConfirm] = useState<'lock' | 'unlock' | 'delete' | null>(null)
  const [deleteInput, setDeleteInput] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    let active = true
    getUserById(userId ?? '')
      .then((res) => {
        if (!active) return
        if (res) {
          setUser(res)
          setForm(toForm(res))
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [userId])

  const orgId = user?.orgId
  useEffect(() => {
    if (!orgId || orgId === 'all') return
    let active = true
    getBuildingNames().then((names) => {
      if (active) setBuildingName(names.get(orgId) ?? null)
    })
    return () => {
      active = false
    }
  }, [orgId])

  // Esc đóng hộp xác nhận
  useEffect(() => {
    if (!confirm) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) setConfirm(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirm, isBusy])

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>{t('um.loading')}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-300">{t('um.notFound')}</p>
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-bold text-sky-600 hover:underline dark:text-sky-400"
        >
          <ArrowLeft className="w-4 h-4" /> {t('um.backToUsers')}
        </button>
      </div>
    )
  }

  const current: TUser = user
  const isResident = current.role === 'user'
  const isSelf = current.id === loggedUser?.id
  const approval: TApproval = current.approvalStatus ?? 'ACTIVE'
  const st = statusStyle[approval]
  // Server chỉ khóa hoặc mở khóa được tài khoản đã duyệt, và không cho tự khóa chính mình
  const canToggleStatus = !isSelf && (approval === 'ACTIVE' || approval === 'SUSPENDED')
  const isSuspended = approval === 'SUSPENDED'
  // Server cho xóa cả chính mình, nhưng làm vậy sẽ tự đăng xuất khỏi hệ thống nên chặn ở giao diện
  const canDelete = !isSelf && current.role !== 'super_admin'

  const name = form.fullName.trim()
  const nameErr = name.length < NAME_MIN || name.length > NAME_MAX
  const aptErr = form.apartment.trim().length > APARTMENT_MAX
  const dirty =
    name !== current.fullName ||
    (isResident && form.apartment.trim() !== (current.apartment ?? '')) ||
    form.note.trim() !== (current.note ?? '')

  function applySaved() {
    const saved = useUserStore.getState().users.find((u) => u.id === current.id)
    if (saved) {
      setUser(saved)
      setForm(toForm(saved))
    }
    return saved
  }

  async function handleSave() {
    if (!dirty || nameErr || aptErr || isSaving) return
    const updates: Partial<TUser> = {}
    if (name !== current.fullName) updates.fullName = name
    if (isResident && form.apartment.trim() !== (current.apartment ?? '')) updates.apartment = form.apartment.trim()
    if (form.note.trim() !== (current.note ?? '')) updates.note = form.note.trim()

    setIsSaving(true)
    try {
      await updateUser(current.id, updates)
      applySaved()
      toast.success(t('um2.savedToast', { name }))
    } catch (err) {
      toast.error(t('um.saveFailed', { message: err instanceof Error ? err.message : '' }))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleStatus(lock: boolean) {
    setIsBusy(true)
    try {
      await updateUser(current.id, { status: lock ? 'blocked' : 'active' })
      const saved = applySaved()
      // Giữ nguyên phần người dùng đang gõ dở, chỉ cập nhật trạng thái
      if (saved) setForm(form)
      toast.success(t(lock ? 'um2.lockedToast' : 'um2.unlockedToast', { name: current.fullName }))
      setConfirm(null)
    } catch (err) {
      toast.error(t('um.saveFailed', { message: err instanceof Error ? err.message : '' }))
    } finally {
      setIsBusy(false)
    }
  }

  async function handleDelete() {
    setIsBusy(true)
    try {
      await deleteUser(current.id)
      toast.success(t('um.deletedToast', { name: current.fullName }))
      navigate('/users')
    } catch (err) {
      toast.error(t('um.deleteFailed', { message: err instanceof Error ? err.message : '' }))
      setIsBusy(false)
    }
  }

  const buildingLabel =
    current.role === 'super_admin' ? t('um2.wholeSystem') : (buildingName ?? (current.orgId && current.orgId !== 'all' ? '—' : t('um2.wholeSystem')))

  const cardCls = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900'

  return (
    <div className="flex max-w-[1100px] flex-col gap-6 pb-4">
      <button
        type="button"
        onClick={() => navigate('/users')}
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-[12.5px] font-bold text-sky-600 hover:underline dark:text-sky-400"
      >
        <ArrowLeft className="w-4 h-4" /> {t('um.backToUserList')}
      </button>

      {/* Danh tính */}
      <section data-reveal className={`${cardCls} flex flex-wrap items-center justify-between gap-5`}>
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-[22px] font-bold text-white shadow-md shadow-sky-600/20">
            {initials(current.fullName)}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{t('um2.title')}</p>
            <h1 className="truncate text-[22px] font-bold leading-tight text-slate-900 dark:text-white">{current.fullName}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <UserRoleBadge role={current.role} />
              <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-semibold ${st.chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                {t(st.label)}
              </span>
              <span className="font-mono text-[12px] text-slate-500 dark:text-slate-400">{current.userCode}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/users/${current.id}`)}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t('um2.viewProfile')}
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Phần chỉnh sửa được */}
          <section data-reveal className={`${cardCls} flex flex-col gap-5`}>
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">{t('um2.editTitle')}</h2>
              <p className="mt-0.5 text-[12.5px] text-slate-500 dark:text-slate-400">{t('um2.editDesc')}</p>
            </div>

            <div className={`grid grid-cols-1 gap-4 ${isResident ? 'sm:grid-cols-2' : ''}`}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="um-name" className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                  {t('um.fieldName')}
                </label>
                <input
                  id="um-name"
                  value={form.fullName}
                  maxLength={NAME_MAX}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  className={`${inputCls} ${nameErr ? '!border-red-400' : ''}`}
                />
                {nameErr && <span className="text-[11.5px] text-red-600 dark:text-red-400">{t('um2.nameErr')}</span>}
              </div>

              {isResident && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="um-apt" className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                    {t('um.fieldApartment')}
                  </label>
                  <input
                    id="um-apt"
                    value={form.apartment}
                    maxLength={APARTMENT_MAX}
                    onChange={(e) => setForm((p) => ({ ...p, apartment: e.target.value }))}
                    placeholder="A1204"
                    className={`${inputCls} ${aptErr ? '!border-red-400' : ''}`}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="um-note" className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                  {t('um.fieldNote')}
                </label>
                <span className="font-mono text-[11px] text-slate-400">
                  {form.note.length}/{NOTE_MAX}
                </span>
              </div>
              <textarea
                id="um-note"
                rows={4}
                value={form.note}
                maxLength={NOTE_MAX}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                placeholder={t('um.notePh')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-[13.5px] text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
              />
              <span className="text-[11.5px] text-slate-500 dark:text-slate-400">{t('um2.noteHint')}</span>
            </div>
          </section>

          {/* Phần cố định */}
          <section data-reveal className={`${cardCls} flex flex-col gap-4`}>
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">{t('um2.fixedTitle')}</h2>
              <p className="mt-0.5 text-[12.5px] text-slate-500 dark:text-slate-400">{t('um2.fixedDesc')}</p>
            </div>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FixedRow label={t('um2.phone')} value={current.phone} mono />
              <FixedRow label={t('um2.email')} value={current.email} />
              <FixedRow label={t('um2.role')} value={t(roleKeys[current.role])} />
              <FixedRow label={t('um2.building')} value={buildingLabel} />
              <FixedRow label={t('um2.created')} value={formatDate(current.createdAt)} />
              <FixedRow label={t('um2.lastActive')} value={current.lastActive} />
            </dl>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          {/* Trạng thái */}
          <section data-reveal className={`${cardCls} flex flex-col gap-4`}>
            <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">{t('um2.statusTitle')}</h2>
            <div className={`flex items-start gap-3 rounded-xl p-3.5 ${st.chip}`}>
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${st.dot}`} />
              <div>
                <p className="text-[13.5px] font-bold">{t(st.label)}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed opacity-90">{t(st.desc)}</p>
              </div>
            </div>

            {canToggleStatus ? (
              isSuspended ? (
                <button
                  type="button"
                  onClick={() => setConfirm('unlock')}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 text-[13px] font-bold text-white hover:bg-emerald-700"
                >
                  <LockOpen className="w-4 h-4" /> {t('um2.unlock')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirm('lock')}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 text-[13px] font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
                >
                  <Lock className="w-4 h-4" /> {t('um2.lock')}
                </button>
              )
            ) : (
              <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">{isSelf ? t('um.selfLockNotice') : t('um.notApprovedNotice')}</p>
            )}
          </section>

          {/* Xóa tài khoản */}
          <section data-reveal className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50/40 p-6 dark:border-red-500/30 dark:bg-red-500/5">
            <h2 className="text-[15px] font-bold text-red-700 dark:text-red-300">{t('um2.dangerTitle')}</h2>
            <p className="text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300">{t('um2.dangerDesc')}</p>
            {canDelete ? (
              <button
                type="button"
                onClick={() => {
                  setDeleteInput('')
                  setConfirm('delete')
                }}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300 bg-white text-[13px] font-bold text-red-600 hover:bg-red-600 hover:text-white dark:border-red-500/50 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-600 dark:hover:text-white"
              >
                <Trash2 className="w-4 h-4" /> {t('um.deleteAccount')}
              </button>
            ) : (
              <p className="text-[12px] text-slate-500 dark:text-slate-400">{isSelf ? t('um2.deleteSelf') : t('um2.deleteAdmin')}</p>
            )}
          </section>
        </div>
      </div>

      {/* Thanh lưu, chỉ hiện khi có thay đổi */}
      {dirty && (
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-white/95 px-5 py-3 shadow-xl backdrop-blur dark:border-sky-500/30 dark:bg-slate-900/95">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-800 dark:text-slate-100">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {t('um2.dirty')}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setForm(toForm(current))}
              disabled={isSaving}
              className="h-10 cursor-pointer rounded-xl px-4 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t('um2.discard')}
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving || nameErr || aptErr}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-sky-600 px-5 text-[13px] font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSaving ? t('common.saving') : t('um2.save')}
            </button>
          </div>
        </div>
      )}

      {/* Xác nhận khóa, mở khóa và xóa */}
      {confirm &&
        createPortal(
          <div
            className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
            onClick={() => !isBusy && setConfirm(null)}
          >
            <div onClick={(e) => e.stopPropagation()} className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      confirm === 'unlock' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20' : confirm === 'lock' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20' : 'bg-red-100 text-red-600 dark:bg-red-500/20'
                    }`}
                  >
                    {confirm === 'unlock' ? <LockOpen className="w-5 h-5" /> : confirm === 'lock' ? <Lock className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">
                    {confirm === 'lock'
                      ? t('um2.lockTitle', { name: current.fullName })
                      : confirm === 'unlock'
                        ? t('um2.unlockTitle', { name: current.fullName })
                        : t('um2.delTitle')}
                  </h3>
                </div>
                <button type="button" onClick={() => !isBusy && setConfirm(null)} aria-label={t('common.close')} className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {confirm === 'lock' && (
                <ul className="flex flex-col gap-1.5 rounded-xl bg-slate-50 p-3.5 text-[12.5px] leading-relaxed text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                  {(['um2.lockP1', 'um2.lockP2', 'um2.lockP3'] as const).map((k) => (
                    <li key={k} className="flex gap-2">
                      <Check className="mt-0.5 w-3.5 h-3.5 shrink-0 text-amber-500" />
                      <span>{t(k)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {confirm === 'unlock' && <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{t('um2.unlockBody')}</p>}
              {confirm === 'delete' && (
                <>
                  <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {t('um2.delBody', { name: current.fullName, phone: current.phone })}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('um2.delType', { name: current.fullName })}</label>
                    <input value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} className={inputCls} autoFocus />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setConfirm(null)}
                  className="h-10 cursor-pointer rounded-xl px-4 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {t('common.cancel')}
                </button>
                {confirm === 'delete' ? (
                  <button
                    type="button"
                    disabled={isBusy || deleteInput.trim().toLowerCase() !== current.fullName.trim().toLowerCase()}
                    onClick={() => void handleDelete()}
                    className="h-10 cursor-pointer rounded-xl bg-red-600 px-4 text-[13px] font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBusy ? t('org.deleting') : t('um2.confirmDelete')}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleToggleStatus(confirm === 'lock')}
                    className={`h-10 cursor-pointer rounded-xl px-4 text-[13px] font-bold text-white disabled:opacity-60 ${confirm === 'lock' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  >
                    {isBusy ? t('common.saving') : confirm === 'lock' ? t('um2.confirmLock') : t('um2.confirmUnlock')}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
