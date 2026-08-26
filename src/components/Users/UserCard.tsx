import { useNavigate } from 'react-router-dom'
import { UserRoleBadge } from './UserRoleBadge'
import { UserStatusBadge } from './UserStatusBadge'
import type { TUser } from '../../types/user.type'

type TProps = {
  user: TUser
}

function getInitials(name: string) {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.trim().charAt(0).toUpperCase()
}

const avatarColors: Record<string, string> = {
  customer: "bg-[--color-success-bg] text-[--color-success] border-[--color-success]/25",
  shipper:  "bg-[--color-accent-bg]   text-[--color-accent]   border-[--color-accent-border]",
  admin:    "bg-[--color-danger-bg]   text-[--color-danger]   border-[--color-danger]/25",
}

export function UserCard({ user }: TProps) {
  const navigate = useNavigate()

  return (
    <article className="group flex flex-col gap-4 p-5 rounded-2xl border border-[--color-border] bg-[--color-surface] hover:border-[--color-border-2] hover:bg-[--color-surface-2] hover:-translate-y-0.5 transition-all duration-200">
      {/* Header: code + badges */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-mono text-[--color-muted] uppercase tracking-wider">{user.userCode}</p>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <UserRoleBadge role={user.role} />
          <UserStatusBadge status={user.status} />
        </div>
      </div>

      {/* Profile row */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold border shrink-0 ${avatarColors[user.role] ?? avatarColors.customer}`}>
          {getInitials(user.fullName)}
        </div>
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-[--color-heading] truncate">{user.fullName}</h3>
          <p className="text-[12px] text-[--color-muted] truncate">{user.phone}</p>
          <p className="text-[11px] text-[--color-muted] truncate">{user.email}</p>
        </div>
      </div>

      {/* Info tags */}
      <div className="flex flex-wrap gap-2 text-[11px] text-[--color-secondary]">
        <span className="bg-[--color-surface-2] border border-[--color-border] px-2 py-0.5 rounded-md">
          {user.createdAt.split(' ')[0].split('-').reverse().join('/')}
        </span>
        <span className="bg-[--color-surface-2] border border-[--color-border] px-2 py-0.5 rounded-md">
          {user.totalShipments} đơn
        </span>
        <span className="bg-[--color-surface-2] border border-[--color-border] px-2 py-0.5 rounded-md capitalize">
          {user.role}
        </span>
      </div>

      {user.note && (
        <p className="text-[11px] text-[--color-warning] bg-[--color-warning-bg] border border-[--color-warning]/20 px-3 py-2 rounded-lg leading-relaxed">
          {user.note}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => navigate(`/users/${user.id}`)}
          className="flex-1 h-8 rounded-lg text-[12px] font-medium bg-[--color-accent-bg] text-[--color-accent] border border-[--color-accent-border] hover:bg-[--color-accent] hover:text-[--color-bg] transition-all duration-150"
        >
          Xem chi tiết
        </button>
        <button
          type="button"
          onClick={() => navigate(`/users/${user.id}/manage`)}
          className="flex-1 h-8 rounded-lg text-[12px] font-medium bg-[--color-surface-2] text-[--color-secondary] border border-[--color-border] hover:border-[--color-border-2] hover:text-[--color-text] transition-all duration-150"
        >
          Quản lý
        </button>
      </div>
    </article>
  )
}
