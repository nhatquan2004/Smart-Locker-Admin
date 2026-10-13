import { defineLocale } from '../defineLocale'

// Mô tả từng nhóm cấu hình (nhãn từng dòng nằm trong từ điển nền)
export default defineLocale(
  {
    'settings.sectionBadge': 'CẤU HÌNH HỆ THỐNG',
    'settings.secDesc.otp': 'Cấu hình thời gian hiệu lực, retry và quy tắc cấp lại OTP.',
    'settings.secDesc.locker': 'Thiết lập hành vi mở khóa, cluster và timeout mặc định.',
    'settings.secDesc.hardware': 'Điều chỉnh heartbeat, timeout và auto refresh phần cứng.',
    'settings.secDesc.notification': 'Thiết lập cảnh báo lỗi, shipment bất thường và log quản trị.',
    'settings.secDesc.preferences': 'Tùy chọn hiển thị, ngôn ngữ và timezone cho admin panel.',

    // Bảng dùng chung (phân trang)
    'table.showing': 'Hiển thị',
    'table.of': 'trong tổng số',
    'table.results': 'kết quả',
    'table.first': 'Trang đầu',
    'table.prev': 'Trang trước',
    'table.next': 'Trang sau',
    'table.last': 'Trang cuối',
    'table.pageOf': 'Trang {page} / {total}',
  },
  {
    'settings.sectionBadge': 'SYSTEM CONFIG',
    'settings.secDesc.otp': 'Configure OTP validity time, retries and re-issue rules.',
    'settings.secDesc.locker': 'Configure unlock behavior, clusters and default timeouts.',
    'settings.secDesc.hardware': 'Adjust heartbeat, timeout and hardware auto-refresh.',
    'settings.secDesc.notification': 'Configure error alerts, abnormal shipment alerts and admin logs.',
    'settings.secDesc.preferences': 'Display, language and timezone preferences for the admin panel.',

    'table.showing': 'Showing',
    'table.of': 'of',
    'table.results': 'results',
    'table.first': 'First page',
    'table.prev': 'Previous page',
    'table.next': 'Next page',
    'table.last': 'Last page',
    'table.pageOf': 'Page {page} / {total}',
  },
)
