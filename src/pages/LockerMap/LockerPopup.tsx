import { MapPin } from 'lucide-react'
import { useTranslation } from '../../context/LanguageContext'
import type { TIssueItem } from '../../types/issue.type'
import { SHOW_DETAIL_LINK } from './constants'
import type { LockerMapItem } from './types'
import { formatRelativeTime, statusMeta } from './utils'

type Props = {
  locker: LockerMapItem
  issues: TIssueItem[]
  onEdit: () => void
  onOpenDetail: () => void
  onOpenIssues: () => void
}

const secondaryBtn =
  'h-8 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'

export function LockerPopup({ locker, issues, onEdit, onOpenDetail, onOpenIssues }: Props) {
  const { t } = useTranslation()
  const meta = statusMeta(locker.status)
  const hasCapacity = locker.availableBoxes !== undefined && locker.totalBoxes > 0
  const usedPercent = hasCapacity
    ? Math.round(((locker.totalBoxes - (locker.availableBoxes ?? 0)) / locker.totalBoxes) * 100)
    : 0

  return (
    <div className="w-[272px] p-4 text-slate-800 dark:text-slate-100">
      <div className="pr-6">
        <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{locker.code}</p>
        <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-slate-900 dark:text-white">
          {locker.name}
        </h3>
        <span
          className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.soft} ${meta.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {t(meta.labelKey)}
        </span>
      </div>

      {(locker.buildingId?.name || locker.locationDescription) && (
        <div className="mt-3 flex gap-2 text-[12px]">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            {locker.buildingId?.name && (
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {locker.buildingId.name}
              </p>
            )}
            {locker.locationDescription && (
              <p className="text-slate-500 dark:text-slate-400">{locker.locationDescription}</p>
            )}
          </div>
        </div>
      )}

      {hasCapacity && (
        <div className="mt-3">
          <div className="mb-1 flex items-baseline justify-between text-[12px]">
            <span className="text-slate-500 dark:text-slate-400">{t('map.freeBoxes')}</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {locker.availableBoxes}
              <span className="font-normal text-slate-400"> / {locker.totalBoxes}</span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-sky-500"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </div>
      )}

      {issues.length > 0 && (
        <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[12px] dark:bg-rose-500/10">
          <p className="font-medium text-rose-700 dark:text-rose-300">
            {t('map.openIssues', { count: issues.length })}
          </p>
          <ul className="mt-1 max-h-[64px] space-y-0.5 overflow-y-auto text-[11.5px] text-rose-700/80 dark:text-rose-300/80">
            {issues.map((iss) => (
              <li key={iss.id} className="truncate">
                <span className="font-mono">{iss.ticketCode}</span> · {iss.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-[11px] text-slate-400">
        {t('map.lastSignal', { time: formatRelativeTime(locker.lastHeartbeatAt) })}
      </p>

      <div className="mt-3 flex gap-2">
        {SHOW_DETAIL_LINK && (
          <button
            type="button"
            onClick={onOpenDetail}
            className="h-8 flex-1 rounded-lg bg-sky-600 px-3 text-[12px] font-medium text-white transition-colors hover:bg-sky-700"
          >
            {t('common.details')}
          </button>
        )}
        <button type="button" onClick={onEdit} className={secondaryBtn}>
          {t('map.btnEdit')}
        </button>
        {issues.length > 0 && (
          <button type="button" onClick={onOpenIssues} className={secondaryBtn}>
            {t('map.btnIssues')}
          </button>
        )}
      </div>
    </div>
  )
}
