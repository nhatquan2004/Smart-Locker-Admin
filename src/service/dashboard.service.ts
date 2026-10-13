import type { TDashboardOverview } from "../types/dashboard.type.ts";
import { tNow } from "../i18n/translate";
import { formatNumber } from "../i18n/format";

// Dữ liệu mẫu được dựng lại mỗi lần gọi để nhãn luôn theo ngôn ngữ đang chọn
const buildDashboardMock = (): TDashboardOverview => ({
    stats: [
        {
            id: 'total-lockers',
            label: tNow('dash.stat.totalLockers'),
            value: '48',
            change: tNow('dash.stat.totalLockersChange', { count: 4 }),
            trend: 'up',
            description: tNow('dash.stat.totalLockersDesc', { s: 24, m: 16, l: 8 }),
            accent: 'blue',
        },
        {
            id: 'available-lockers',
            label: tNow('dash.stat.available'),
            value: '19',
            change: tNow('dash.stat.availableChange', { percent: '39.5' }),
            trend: 'up',
            description: tNow('dash.stat.availableDesc'),
            accent: 'green',
        },
        {
            id: 'active-shipments',
            label: tNow('dash.stat.activeParcels'),
            value: '27',
            change: tNow('dash.stat.activeParcelsChange', { count: 22 }),
            trend: 'neutral',
            description: tNow('dash.stat.activeParcelsDesc', { count: 5 }),
            accent: 'orange',
        },
        {
            id: 'success-rate',
            label: tNow('dash.stat.successRate'),
            value: '98.4%',
            change: tNow('dash.stat.successRateChange'),
            trend: 'up',
            description: tNow('dash.stat.successRateDesc', { count: formatNumber(1240) }),
            accent: 'purple',
        },
    ],
    statuses: [
        {
            id: 'iot-gateway',
            label: tNow('dash.status.gateway'),
            value: tNow('dash.status.gatewayValue'),
            detail: tNow('dash.status.gatewayDetail'),
            tone: 'healthy',
        },
        {
            id: 'sensor-sync',
            label: tNow('dash.status.sensor'),
            value: tNow('dash.status.sensorValue', { ok: 46, total: 48 }),
            detail: tNow('dash.status.sensorDetail', { count: 2, codes: 'A02, C01' }),
            tone: 'warning',
        },
        {
            id: 'otp-service',
            label: tNow('dash.status.otp'),
            value: 'Realtime WebSocket',
            detail: tNow('dash.status.otpDetail'),
            tone: 'info',
        },
    ],
    activities: [
        {
            id: 'ac-01',
            title: 'Locker A01 vừa được mở thành công',
            description: 'Người nhận xác thực OTP hợp lệ và hoàn tất nhận hàng.',
            time: '2 phút trước',
            actor: 'Khách hàng • Tầng 1',
            tone: 'green',
        },
        {
            id: 'ac-02',
            title: 'Shipper tạo đơn gửi mới tại cụm B',
            description: 'Hệ thống đã gán ngăn tủ Medium và lưu ảnh kiện hàng.',
            time: '8 phút trước',
            actor: 'Shipper • Cụm B',
            tone: 'blue',
        },
        {
            id: 'ac-03',
            title: 'Cảnh báo cảm biến cửa ngăn C03',
            description: 'Tủ đóng chưa kín, cần kiểm tra lại công tắc từ Reed Switch.',
            time: '15 phút trước',
            actor: 'Thiết bị • Cụm C',
            tone: 'orange',
        },
        {
            id: 'ac-04',
            title: 'Admin cập nhật cấu hình thời gian giữ OTP',
            description: 'TTL mới là 180 giây áp dụng cho toàn hệ thống.',
            time: '32 phút trước',
            actor: 'Admin hệ thống',
            tone: 'purple',
        },
    ],
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
});

export async function getDashboardOverview(): Promise<TDashboardOverview> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(buildDashboardMock()), 150);
    });
}
