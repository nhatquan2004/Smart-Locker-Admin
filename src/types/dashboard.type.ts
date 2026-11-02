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
    // Trang xử lý tương ứng khi bấm vào dòng này
    to?: string
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

// Một ngăn tủ trong sơ đồ của trạm
export type TDashboardCell = {
    code: string
    size: 'small' | 'medium' | 'large'
    status: 'available' | 'occupied' | 'maintenance' | 'fault'
}

// Trạm tủ rút gọn hiển thị ở mục trạng thái các cụm tủ
export type TDashboardStation = {
    id: string
    code: string
    name: string
    location: string
    total: number
    avail: number
    status: 'online' | 'warning' | 'offline'
    org: string
    cells: TDashboardCell[]
    // Thời điểm nhận tín hiệu gần nhất, đã định dạng theo ngôn ngữ
    lastSignal: string
}

export type TDashboardOverview = {
    stats: TDashboardStat[]
    statuses: TSystemStatus[]
    activities: TActivityItem[]
    quickActions: TDashboardQuickAction[]
    stations: TDashboardStation[]
    // Số trạm đang trực tuyến trên tổng số trạm
    health: { online: number; total: number }
}
