import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserRoleBadge } from "../../../components/Users/UserRoleBadge"
import { UserStatusBadge } from '../../../components/Users/UserStatusBadge'
import type { TUser, TUserRole, TUserStatus } from '../../../types/user.type'
import { deleteUser, getUserById, updateUser } from '../../../service/user.service'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../context/LanguageContext'
import { AlertTriangle, X } from 'lucide-react'

export function UserManagePage() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const toast = useToast()

  const [user, setUser] = useState<TUser | null>(null)
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<TUserRole>('user')
  const [status, setStatus] = useState<TUserStatus>('active')
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    getUserById(userId || 'user-101').then((res) => {
      if (res) {
        setUser(res)
        setRole(res.role)
        setStatus(res.status)
        setNote(res.note || '')
      }
      setLoading(false)
    })
  }, [userId])

  function handleSave() {
    if (!user) return
    setIsSaving(true)
    const prevStatus = user.status
    updateUser(user.id, { role, status, note }).then(() => {
      setIsSaving(false)
      setUser((prev) => (prev ? { ...prev, role, status, note } : null))
      if (status === 'blocked') {
        toast.success(t('um.lockedToast', { name: user.fullName }))
      } else if (status === 'active' && prevStatus === 'blocked') {
        toast.success(t('um.unlockedToast', { name: user.fullName }))
      } else {
        toast.success(t('um.updatedToast', { name: user.fullName }))
      }
    })
  }

  function handleDeleteUser() {
    if (!user) return
    setShowDeleteModal(true)
  }

  function handleConfirmDelete() {
    if (!user) return
    setIsDeleting(true)
    deleteUser(user.id).then(() => {
      setIsDeleting(false)
      setShowDeleteModal(false)
      toast.success(t('um.deletedToast', { name: user.fullName }))
      navigate('/users')
    })
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>{t('um.loading')}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>{t('um.notFound')}</p>
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-[13px] text-slate-800 hover:bg-slate-200"
        >
          ← {t('um.backToUsers')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1000px]">

      {/* Delete Confirmation Modal */}
      {showDeleteModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{t('um.deleteTitle')}</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{t('um.irreversible')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('um.deleteQ')}{' '}
              <strong className="text-slate-900 dark:text-white">{user.fullName}</strong>{' '}
              (<span className="font-mono text-sky-600 dark:text-sky-400">{user.phone}</span>)?{' '}
              {t('um.deleteSync')}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="h-9 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="h-9 px-4 rounded-xl text-[12.5px] font-bold bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                {isDeleting ? t('org.deleting') : t('um.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="relative z-10 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-sky-600 dark:text-sky-400 hover:underline mb-3 transition-colors cursor-pointer"
          >
            ← {t('um.backToUserList')}
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight truncate">
              {t('um.title', { name: user.fullName })}
            </h1>
          </div>
          <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
            {t('um.idLabel')} <strong className="font-mono text-sky-600 dark:text-sky-400">{user.userCode}</strong> · {t('um.phoneLabel')} <strong className="font-mono">{user.phone}</strong>
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
          <UserRoleBadge role={role} />
          <UserStatusBadge status={status} />
        </div>
      </section>

      {/* Main Settings Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-6">
        <div>
          <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">{t('um.configTitle')}</h2>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{t('um.syncNote')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Role selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('um.fieldRole')}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as TUserRole)}
              className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="user">{t('um.optUser')}</option>
              <option value="shipper">{t('um.optShipper')}</option>
              <option value="org_admin">{t('um.optOrgAdmin')}</option>
              <option value="super_admin">{t('um.optSuperAdmin')}</option>
            </select>
          </div>

          {/* Status selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('um.fieldStatus')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TUserStatus)}
              className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="active">{t('um.optActive')}</option>
              <option value="inactive">{t('um.optInactive')}</option>
              <option value="blocked">{t('um.optBlocked')}</option>
            </select>
          </div>
        </div>

        {/* Note textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t('um.fieldNote')}</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('um.notePh')}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleDeleteUser}
            className="h-10 px-4 rounded-xl text-[12.5px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 hover:bg-red-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            {t('um.deleteAccount')}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="h-10 px-4 rounded-xl text-[12.5px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="h-10 px-5 rounded-xl text-[12.5px] font-bold bg-sky-600 hover:bg-sky-700 text-white transition-all cursor-pointer shadow-md shadow-sky-600/20 active:scale-95 flex items-center gap-1.5"
            >
              {isSaving ? t('common.saving') : t('um.saveSync')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
