import type { useTranslation } from '../../context/LanguageContext'

type TTranslate = ReturnType<typeof useTranslation>['t']

// Diễn đạt khoảng thời gian dễ đọc: "45 ngày 9 giờ", "5 giờ", "20 phút"
export function describeDuration(ms: number, t: TTranslate): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) {
    return hours > 0
      ? `${t('pkg.d.durDays', { count: days })} ${t('pkg.d.durHours', { count: hours })}`
      : t('pkg.d.durDays', { count: days })
  }
  if (hours > 0) return t('pkg.d.durHours', { count: hours })
  return t('pkg.d.durMinutes', { count: minutes })
}
