import { StatusBadge } from '../shared/StatusBadge/StatusBadge'
import type { TUserRole } from '../../types/user.type'
import { useTranslation } from '../../context/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'

type TProps = {
  role: TUserRole
}

const roleKeyMap: Record<TUserRole, { key: TranslationKey; tone: 'green' | 'blue' | 'red'; pulse?: boolean }> = {
  user: { key: 'role.user', tone: 'blue', pulse: false },
  shipper: { key: 'role.shipper', tone: 'green', pulse: false },
  org_admin: { key: 'role.org_admin', tone: 'red', pulse: false },
  super_admin: { key: 'role.super_admin', tone: 'red', pulse: true },
}

export function UserRoleBadge({ role }: TProps) {
  const { t } = useTranslation()
  const config = roleKeyMap[role] || roleKeyMap.user
  return <StatusBadge label={t(config.key).toUpperCase()} tone={config.tone} pulse={config.pulse} />
}
