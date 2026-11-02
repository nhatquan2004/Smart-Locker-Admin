import { StatusBadge } from '../shared/StatusBadge/StatusBadge'
import type { TShipmentStatus } from '../../types/shipment.type'
import { useTranslation } from '../../context/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'

const statusMap: Record<
  TShipmentStatus,
  { labelKey: TranslationKey; tone: 'green' | 'orange' | 'red' | 'purple'; pulse?: boolean }
> = {
  WAITING_FOR_PICKUP: { labelKey: 'pkg.st.WAITING_FOR_PICKUP', tone: 'orange', pulse: true },
  PICKED_UP: { labelKey: 'pkg.st.PICKED_UP', tone: 'green' },
  OVERDUE: { labelKey: 'pkg.st.OVERDUE', tone: 'red', pulse: true },
  RETURNED: { labelKey: 'pkg.st.RETURNED', tone: 'purple' },
}

export function ShipmentStatusBadge({ status }: { status: TShipmentStatus }) {
  const { t } = useTranslation()
  const config = statusMap[status] ?? statusMap.WAITING_FOR_PICKUP
  return <StatusBadge label={t(config.labelKey)} tone={config.tone} pulse={config.pulse} />
}
