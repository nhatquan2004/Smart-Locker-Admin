export type TDashboardStat = {
    id: string
    label: string
    value: string
    change: string
    trend: 'up' | 'down' | 'neutral'
    description: string
    accent: 'blue' | 'green' | 'orange' | 'purple'
}

export type TSystemStatus = {
    id: string
    label: string
    value: string
    detail: string
    tone: 'healthy' | 'warning' | 'critical' | 'info'
}

export type TActivityItem = {
    id: string
    title: string
    description: string
    time: string
    actor: string
    tone: 'blue' | 'green' | 'orange' | 'purple'
}

export type TDashboardQuickAction = {
    id: string
    label: string
    helper: string
}

export type TDashboardOverview = {
    stats: TDashboardStat[]
    statuses: TSystemStatus[]
    activities: TActivityItem[]
    quickActions: TDashboardQuickAction[]
}
