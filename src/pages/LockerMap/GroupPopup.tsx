import { MapPin, Pencil } from 'lucide-react'
import { useTranslation } from '../../context/LanguageContext'
import type { TIssueItem } from '../../types/issue.type'
import type { LockerGroup } from './types'
import { statusMeta } from './utils'

type Props = {
  group: LockerGroup
  issuesByCode: Map<string, TIssueItem[]>
  onEdit: (lockerId: string) => void
  onOpenDetail: (code: string) => void
  onOpenIssues: () => void
}

// Popup của một ghim: thông tin doanh nghiệp và danh sách các tủ thuộc doanh nghiệp đó
export function GroupPopup({ group, issuesByCode, onEdit, onOpenDetail, onOpenIssues }: Props) {
  const { t } = useTranslation()
  const building = group.lockers[0].buildingId
  const onlineCount = group.lockers.filter((l) => l.status === 'ONLINE').length

  return (
    <div className="w-[272px] p-4 text-slate-800 dark:text-slate-100">
      <div className="pr-6">
        <h3 className="text-[15px] font-semibold leading-snug text-slate-900 dark:text-white">
          {building?.name ?? group.lockers[0].name}
        </h3>
        {building?.address && (
          <p className="mt-1 flex gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{building.address}</span>
          </p>
        )}
        <p className="mt-2 text-[12px] font-medium text-slate-600 dark:text-slate-300">
          {t('map.groupSummary', { count: group.lockers.length, online: onlineCount })}
        </p>
      </div>

      <ul className="custom-scrollbar mt-3 flex max-h-[220px] flex-col gap-1.5 overflow-y-auto">
        {group.lockers.map((l) => {
          const meta = statusMeta(l.status)
          const issueCount = issuesByCode.get(l.code)?.length ?? 0
          return (
            <li
              key={l._id}
              className="rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">{l.name}</p>
                  <p className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">{l.code}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.soft} ${meta.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {t(meta.labelKey)}
                </span>
              </div>

              {l.locationDescription && (
                <p className="mt-1 truncate text-[11.5px] text-slate-500 dark:text-slate-400">{l.locationDescription}</p>
              )}

              <div className="mt-1.5 flex items-center justify-between gap-2 text-[11.5px] text-slate-500 dark:text-slate-400">
                <span>
                  {l.availableBoxes !== undefined
                    ? t('map.capacity', { avail: l.availableBoxes, total: l.totalBoxes })
                    : t('map.boxes', { count: l.totalBoxes })}
                  {issueCount > 0 && (
                    <button
                      type="button"
                      onClick={onOpenIssues}
                      className="ml-2 font-medium text-rose-600 hover:underline dark:text-rose-400"
                    >
                      {t('map.issueCount', { count: issueCount })}
                    </button>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onOpenDetail(l.code)}
                  className="h-6 rounded-md px-2 text-[11.5px] font-medium text-sky-600 transition-colors hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-500/10"
                >
                  {t('common.details')}
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(l._id)}
                  title={t('map.editLocation')}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
