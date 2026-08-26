import { useNavigate } from 'react-router-dom'
import { LockerStatusBadge } from './LockerStatusBadge'
import type { TLocker } from '../../types/locker.type'
import { useTranslation } from '../../context/LanguageContext'

type TProps = {
  locker: TLocker
}

const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const SizeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/>
    <rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
)

const sizePillStyle: Record<string, string> = {
  small: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  medium: 'bg-sky-50 text-sky-700 border-sky-200',
  large: 'bg-purple-50 text-purple-700 border-purple-200',
}

export function LockerGridCard({ locker }: TProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <article className="group flex flex-col gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">{locker.code}</p>
          <h3 className="mt-0.5 text-[15px] font-bold text-slate-900 truncate">{locker.name}</h3>
        </div>
        <LockerStatusBadge status={locker.status} />
      </div>

      {/* Info tags */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
          <LocationIcon />{locker.location}
        </span>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold border px-2.5 py-1 rounded-lg capitalize ${sizePillStyle[locker.size] || sizePillStyle.medium}`}>
          <SizeIcon />{locker.size}
        </span>
        <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
          Cluster {locker.cluster}
        </span>
      </div>

      {/* User & package status */}
      <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[12px]">
        <div className="flex items-center justify-between text-slate-600">
          <span className="text-slate-500 font-medium">{t('role.user')}:</span>
          <span className="font-bold text-slate-900 truncate">{locker.currentUser || '—'}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span className="text-slate-500 font-medium">Parcel/Package:</span>
          <span className="font-mono font-bold text-sky-700 truncate">{locker.currentPackage || '—'}</span>
        </div>
      </div>

      {locker.note && (
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl leading-relaxed font-medium">
          💡 {locker.note}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 mt-auto">
        <button
          type="button"
          onClick={() => navigate(`/lockers/${locker.id}`)}
          className="flex-1 h-9 rounded-xl text-[12px] font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white transition-all duration-150 cursor-pointer shadow-2xs active:scale-95"
        >
          👁️ {t('users.btnDetail')}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/lockers/${locker.id}/hardware`)}
          className="flex-1 h-9 rounded-xl text-[12px] font-bold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-150 cursor-pointer shadow-2xs active:scale-95"
        >
          🔧 Hardware
        </button>
      </div>
    </article>
  )
}
