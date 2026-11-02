import { useTranslation } from '../../context/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'
import type { TShipment } from '../../types/shipment.type'

type TProps = {
  boxNumber: number
  size: TShipment['boxSize']
}

// Chiều cao cánh cửa vẽ theo đúng tỷ lệ kích cỡ ngăn S, M, L
const doorHeight: Record<TShipment['boxSize'], string> = {
  SMALL: 'h-16',
  MEDIUM: 'h-24',
  LARGE: 'h-36',
}

const sizeKey: Record<TShipment['boxSize'], TranslationKey> = {
  SMALL: 'ld.size.small',
  MEDIUM: 'ld.size.medium',
  LARGE: 'ld.size.large',
}

// Hình vẽ cánh cửa ngăn tủ chứa bưu kiện: số ngăn, tay nắm, khe thông gió và đèn báo
export function CompartmentArt({ boxNumber, size }: TProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/60 p-3">
        <div
          className={`relative w-28 ${doorHeight[size]} rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-gradient-to-b from-white to-slate-100 dark:from-slate-700 dark:to-slate-800 shadow-inner flex items-center justify-center`}
        >
          <span className="absolute left-2 top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-sky-600 px-1.5 text-[12px] font-bold text-white">
            {boxNumber}
          </span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
          <div className="absolute left-3 right-3 bottom-3 flex flex-col gap-1" aria-hidden="true">
            <i className="block h-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <i className="block h-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
          <span className="absolute right-1.5 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-full bg-slate-400 dark:bg-slate-500" aria-hidden="true" />
        </div>
      </div>
      <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
        {t(sizeKey[size])}
      </span>
    </div>
  )
}
