import type { TDashboardOverview } from "../types/dashboard.type.ts";

const dashboardMock: TDashboardOverview = {
    stats: [
        {
            id: 'total-lockers',
            label: 'Tổng số ngăn tủ',
            value: '48',
            change: '4 Cụm tủ',
            trend: 'up',
            description: '24 Ngăn S • 16 Ngăn M • 8 Ngăn L',
            accent: 'blue',
        },
        {
            id: 'available-lockers',
            label: 'Ngăn tủ đang trống',
            value: '19',
            change: '39.5% Dung lượng',
            trend: 'up',
            description: 'Sẵn sàng tiếp nhận bưu kiện mới',
            accent: 'green',
        },
        {
            id: 'active-shipments',
            label: 'Bưu kiện đang lưu tủ',
            value: '27',
            change: '22 Chờ nhận',
            trend: 'neutral',
            description: '5 Đơn quá hạn 24h cần nhắc OTP',
            accent: 'orange',
        },
        {
            id: 'success-rate',
            label: 'Tỷ lệ giao nhận thành công',
            value: '98.4%',
            change: '7 Ngày qua',
            trend: 'up',
            description: '1,240 Lượt mở tủ thành công',
            accent: 'purple',
        },
    ],
    statuses: [
        {
            id: 'iot-gateway',
            label: 'Bo mạch điều khiển MCU & Gateway',
            value: 'Hoạt động tốt',
            detail: 'ESP32-S3 và mạch rơ-le RS485 đồng bộ tín hiệu 100%.',
            tone: 'healthy',
        },
        {
            id: 'sensor-sync',
            label: 'Mảng cảm biến IR & Công tắc cửa',
            value: '46/48 Cảm biến OK',
            detail: '2 ngăn (A02, C01) phát hiện công tắc cửa khép chưa kín.',
            tone: 'warning',
        },
        {
            id: 'otp-service',
            label: 'Dịch vụ OTP & Realtime Engine',
            value: 'Realtime WebSocket',
            detail: 'Tốc độ phát sinh mã OTP < 120ms, 0 lỗi giao tiếp.',
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
            label: 'Sơ đồ cụm tủ',
            helper: 'Xem vị trí & điều khiển từ xa',
        },
        {
            id: 'quick-shipments',
            label: 'Tra cứu bưu kiện',
            helper: 'Cấp lại OTP & kiểm tra lịch sử',
        },
        {
            id: 'quick-users',
            label: 'Quản lý người dùng',
            helper: 'Phân quyền Admin & Cư dân',
        },
    ],
};

export async function getDashboardOverview(): Promise<TDashboardOverview> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(dashboardMock), 150);
    });
}
