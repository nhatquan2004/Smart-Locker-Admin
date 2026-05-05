import type { TDashboardOverview} from "../types/dashboard.type.ts";

const dashboardMock: TDashboardOverview = {
    stats: [
        {
            id: 'total-lockers',
            label: 'Tổng số tủ',
            value: '48',
            change: '+12%',
            trend: 'up',
            description: '4 cụm tủ đang được quản lý tập trung.',
            accent: 'blue',
        },
        {
            id: 'available-lockers',
            label: 'Tủ đang trống',
            value: '19',
            change: '+5%',
            trend: 'up',
            description: 'Sẵn sàng nhận đơn mới ngay lúc này.',
            accent: 'green',
        },
        {
            id: 'active-shipments',
            label: 'Đơn đang xử lý',
            value: '27',
            change: '+8 đơn',
            trend: 'neutral',
            description: 'Bao gồm gửi hàng, chờ OTP và chờ nhận.',
            accent: 'orange',
        },
        {
            id: 'success-rate',
            label: 'Tỷ lệ giao thành công',
            value: '98.4%',
            change: '+1.6%',
            trend: 'up',
            description: 'Ổn định trong 7 ngày gần nhất.',
            accent: 'purple',
        },
    ],
    statuses: [
        {
            id: 'iot-gateway',
            label: 'IoT Gateway',
            value: 'Ổn định',
            detail: 'ESP32 và relay đang đồng bộ bình thường.',
            tone: 'healthy',
        },
        {
            id: 'sensor-sync',
            label: 'Đồng bộ cảm biến',
            value: '46/48 online',
            detail: '2 ngăn đang cần kiểm tra reed switch.',
            tone: 'warning',
        },
        {
            id: 'otp-service',
            label: 'OTP & xác thực',
            value: 'Realtime',
            detail: 'Không có request thất bại trong 24h qua.',
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
            description: 'Hệ thống đã gán ngăn tủ medium và lưu ảnh kiện hàng.',
            time: '8 phút trước',
            actor: 'Shipper • Cụm B',
            tone: 'blue',
        },
        {
            id: 'ac-03',
            title: 'Cảnh báo cảm biến cửa ngăn C03',
            description: 'Tủ đóng chưa kín, cần kiểm tra lại phần cứng hoặc relay.',
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
            id: 'qa-01',
            label: 'Kiểm tra trạng thái locker',
            helper: 'Xem nhanh cụm tủ nào đang offline hoặc đầy.',
        },
        {
            id: 'qa-02',
            label: 'Theo dõi đơn giao hôm nay',
            helper: 'Tập trung các đơn đang pending hoặc lỗi OTP.',
        },
        {
            id: 'qa-03',
            label: 'Quản lý người dùng',
            helper: 'Tìm nhanh shipper, customer hoặc admin account.',
        },
    ],
}
export async function getDashboardOverview(): Promise<TDashboardOverview> {
    return Promise.resolve(dashboardMock)
}
