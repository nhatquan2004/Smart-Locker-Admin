import type {
    TActivityItem,
    TDashboardOverview,
    TDashboardStat,
    TDashboardStation,
    TSystemStatus,
} from "../types/dashboard.type.ts";
import type { TActivityItem as TApiActivityItem } from "../types/activity.type";
import type { TLockerStation } from "../types/lockerStation.type";
import { tNow } from "../i18n/translate";
import { formatRelativeTime } from "../i18n/format";
import { getActivities } from "./activity.service";
import { getLockerStations } from "./lockerStation.service";
import { getShipmentCounts } from "./shipment.service";
import { getIssueCounts, getIssues } from "./issue.service";

// Không lấy được dữ liệu (ví dụ server chưa có API) thì hiện dấu gạch thay vì số 0 sai
const UNKNOWN = '—'

// Màu chấm theo mức độ và nhóm sự kiện của nhật ký
function toneOf(item: TApiActivityItem): TActivityItem['tone'] {
    if (item.status === 'ERROR' || item.status === 'WARNING') return 'orange'
    if (item.category === 'PACKAGE' || item.category === 'PICKUP') return 'green'
    if (item.category === 'USER' || item.category === 'SETTINGS') return 'purple'
    return 'blue'
}

// Nhật ký gần đây từ GET /activity-logs. Lỗi thì để trống, không làm hỏng cả trang Tổng quan.
async function loadRecentActivities(): Promise<TActivityItem[]> {
    try {
        const page = await getActivities({ limit: 8 })
        return page.items.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description ?? '',
            time: formatRelativeTime(item.createdAt),
            actor: item.actorName,
            tone: toneOf(item),
        }))
    } catch {
        return []
    }
}

type TShipmentCounts = Awaited<ReturnType<typeof getShipmentCounts>>
type TIssueData = { open: number; urgent: number }

// Số sự cố đang mở = chờ xử lý + đang xử lý + đã chuyển lên Super Admin
async function loadIssueData(): Promise<TIssueData> {
    const [counts, inProgress] = await Promise.all([
        getIssueCounts(),
        getIssues({ status: 'in_progress', limit: 1 }),
    ])
    return { open: counts.pending + counts.escalated + inProgress.total, urgent: counts.urgentOpen }
}

function toStation(s: TLockerStation): TDashboardStation {
    return {
        id: s.id,
        code: s.code,
        name: s.name,
        location: s.location,
        total: s.compartments.length,
        avail: s.compartments.filter((c) => c.status === 'available').length,
        status: s.status,
        org: s.orgName,
        cells: s.compartments.map((c) => ({ code: c.code, size: c.size, status: c.status })),
        lastSignal: s.lastHeartbeat,
    }
}

function buildStats(stations: TLockerStation[], shipments: TShipmentCounts | null): TDashboardStat[] {
    const compartments = stations.flatMap((s) => s.compartments)
    const total = compartments.length
    const avail = compartments.filter((c) => c.status === 'available').length
    const sizeCount = (size: 'small' | 'medium' | 'large') => compartments.filter((c) => c.size === size).length
    const availPercent = total > 0 ? ((avail / total) * 100).toFixed(1) : '0'

    const stats: TDashboardStat[] = [
        {
            id: 'total-lockers',
            label: tNow('dash.stat.totalLockers'),
            value: String(total),
            change: tNow('dash.stat.totalLockersChange', { count: stations.length }),
            trend: 'up',
            description: tNow('dash.stat.totalLockersDesc', { s: sizeCount('small'), m: sizeCount('medium'), l: sizeCount('large') }),
            accent: 'blue',
        },
        {
            id: 'available-lockers',
            label: tNow('dash.stat.available'),
            value: String(avail),
            change: tNow('dash.stat.availableChange', { percent: availPercent }),
            trend: 'up',
            description: tNow('dash.stat.availableDesc'),
            accent: 'green',
        },
    ]

    if (shipments) {
        const waiting = shipments.WAITING_FOR_PICKUP
        const overdue = shipments.OVERDUE
        const inLockers = waiting + overdue
        stats.push(
            {
                id: 'active-shipments',
                label: tNow('dash.stat.activeParcels'),
                value: String(inLockers),
                change: tNow('dash.stat.activeParcelsChange', { count: waiting }),
                trend: 'neutral',
                description: tNow('dash.stat.activeParcelsDesc'),
                accent: 'orange',
            },
            {
                id: 'overdue-shipments',
                label: tNow('dash.stat.overdue'),
                value: String(overdue),
                change: tNow('dash.stat.overdueChange', { percent: inLockers > 0 ? Math.round((overdue / inLockers) * 100) : 0 }),
                trend: overdue > 0 ? 'down' : 'neutral',
                description: tNow('dash.stat.overdueDesc'),
                accent: 'purple',
            },
        )
    } else {
        stats.push(
            { id: 'active-shipments', label: tNow('dash.stat.activeParcels'), value: UNKNOWN, change: UNKNOWN, trend: 'neutral', description: '', accent: 'orange' },
            { id: 'overdue-shipments', label: tNow('dash.stat.overdue'), value: UNKNOWN, change: UNKNOWN, trend: 'neutral', description: '', accent: 'purple' },
        )
    }
    return stats
}

function buildStatuses(stations: TLockerStation[], issues: TIssueData | null): TSystemStatus[] {
    const online = stations.filter((s) => s.status === 'online').length
    const notOnline = stations.filter((s) => s.status !== 'online')
    const maintenanceByStation = stations
        .map((s) => ({ code: s.code, count: s.compartments.filter((c) => c.status === 'maintenance').length }))
        .filter((s) => s.count > 0)
    const maintenanceTotal = maintenanceByStation.reduce((sum, s) => sum + s.count, 0)

    const stationTone: TSystemStatus['tone'] =
        stations.length === 0 ? 'info' : notOnline.length === 0 ? 'healthy' : online === 0 ? 'critical' : 'warning'

    const statuses: TSystemStatus[] = [
        {
            id: 'stations-online',
            label: tNow('dash.status.stations'),
            value: tNow('dash.status.stationsValue', { online, total: stations.length }),
            detail:
                stations.length === 0
                    ? tNow('dash.status.stationsNone')
                    : notOnline.length === 0
                        ? tNow('dash.status.stationsOk')
                        : tNow('dash.status.stationsDown', {
                            count: notOnline.length,
                            codes: notOnline.slice(0, 3).map((s) => s.code).join(', '),
                        }),
            tone: stationTone,
            to: '/lockers',
        },
        {
            id: 'boxes-maintenance',
            label: tNow('dash.status.maintenance'),
            value: tNow('dash.status.maintenanceValue', { count: maintenanceTotal }),
            detail:
                maintenanceTotal === 0
                    ? tNow('dash.status.maintenanceNone')
                    : tNow('dash.status.maintenanceDetail', { codes: maintenanceByStation.slice(0, 3).map((s) => s.code).join(', ') }),
            tone: maintenanceTotal === 0 ? 'healthy' : 'warning',
            to: '/lockers',
        },
    ]

    if (issues) {
        statuses.push({
            id: 'issues-open',
            label: tNow('dash.status.issues'),
            value: tNow('dash.status.issuesValue', { count: issues.open }),
            detail:
                issues.urgent > 0
                    ? tNow('dash.status.issuesUrgent', { count: issues.urgent })
                    : issues.open === 0
                        ? tNow('dash.status.issuesNone')
                        : tNow('dash.status.issuesProgress'),
            tone: issues.urgent > 0 ? 'critical' : issues.open > 0 ? 'warning' : 'healthy',
            to: '/issues',
        })
    } else {
        statuses.push({ id: 'issues-open', label: tNow('dash.status.issues'), value: UNKNOWN, detail: '', tone: 'info', to: '/issues' })
    }
    return statuses
}

// Thẻ thống kê, tình trạng vận hành và danh sách trạm tính từ trạm tủ, bưu kiện, sự cố và nhật ký thật.
// Server tự giới hạn theo quyền: Super Admin thấy toàn hệ thống, Ban quản lý chỉ thấy tòa của mình.
export async function getDashboardOverview(): Promise<TDashboardOverview> {
    const [stationsResult, shipmentsResult, issuesResult, activities] = await Promise.allSettled([
        getLockerStations(),
        getShipmentCounts(),
        loadIssueData(),
        loadRecentActivities(),
    ]).then((results) => [results[0], results[1], results[2], results[3].status === 'fulfilled' ? results[3].value : []] as const)

    // Không có danh sách trạm tủ thì không dựng được gì có ý nghĩa nên báo lỗi cho trang
    if (stationsResult.status === 'rejected') throw stationsResult.reason

    const stations = stationsResult.value
    const shipments = shipmentsResult.status === 'fulfilled' ? shipmentsResult.value : null
    const issues = issuesResult.status === 'fulfilled' ? issuesResult.value : null

    return {
        stats: buildStats(stations, shipments),
        statuses: buildStatuses(stations, issues),
        activities,
        quickActions: [
            {
                id: 'quick-lockers',
                label: tNow('dash.quick.map'),
                helper: tNow('dash.quick.mapHelper'),
            },
            {
                id: 'quick-shipments',
                label: tNow('dash.quick.parcels'),
                helper: tNow('dash.quick.parcelsHelper'),
            },
            {
                id: 'quick-users',
                label: tNow('dash.quick.users'),
                helper: tNow('dash.quick.usersHelper'),
            },
        ],
        stations: stations.map(toStation),
        health: { online: stations.filter((s) => s.status === 'online').length, total: stations.length },
    }
}
