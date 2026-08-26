import {FilterSelect} from '../shared/FilterSelect/FilterSelect'
import {SearchField} from '../shared/SearchField/SearchField'
import type {TUserFilter, TUserRole, TUserStatus} from '../../types/user.type'
import { useTranslation } from '../../context/LanguageContext'

type TProps = {
    filter: TUserFilter
    onChange: (nextFilter: TUserFilter) => void
}

export function UserFilterBar({filter, onChange}: TProps) {
    const { t } = useTranslation()

    const roleOptions: Array<{ label: string; value: 'all' | TUserRole }> = [
        {label: t('role.all'), value: 'all'},
        {label: t('role.user'), value: 'user'},
        {label: t('role.org_admin'), value: 'org_admin'},
        {label: t('role.super_admin'), value: 'super_admin'},
        {label: t('role.shipper'), value: 'shipper'},
    ]

    const statusOptions: Array<{ label: string; value: 'all' | TUserStatus }> = [
        {label: t('role.all'), value: 'all'},
        {label: t('users.active'), value: 'active'},
        {label: t('users.inactive'), value: 'inactive'},
        {label: t('users.blocked'), value: 'blocked'},
    ]

    return (
        <section className="flex flex-wrap gap-3 p-5 rounded-2xl border border-[--color-border] bg-[--color-surface]">
            <div className="flex-1 min-w-[200px]">
                <SearchField
                    id="user-search"
                    label={t('common.search')}
                    value={filter.search}
                    placeholder={t('users.searchPlaceholder')}
                    onChange={(value) =>
                        onChange({
                            ...filter,
                            search: value,
                        })
                    }
                />
            </div>

            <FilterSelect
                id="user-role"
                label={t('users.colRole')}
                value={filter.role}
                options={roleOptions}
                onChange={(value) =>
                    onChange({
                        ...filter,
                        role: value as TUserFilter['role'],
                    })
                }
            />

            <FilterSelect
                id="user-status"
                label={t('users.colStatus')}
                value={filter.status}
                options={statusOptions}
                onChange={(value) =>
                    onChange({
                        ...filter,
                        status: value as TUserFilter['status'],
                    })
                }
            />
        </section>
    )
}
