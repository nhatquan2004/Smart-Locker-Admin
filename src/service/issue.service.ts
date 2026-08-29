import type { TIssueItem } from '../types/issue.type'

const mockIssues: TIssueItem[] = [
  {
    id: 'iss-001',
    ticketCode: 'ERR-2026-001',
    reporterName: 'Nguyễn Văn An',
    reporterRole: 'customer',
    reporterPhone: '0901234567',
    reporterEmail: 'an.nguyen@techcorp.com',
    orgId: 'org-001',
    orgName: 'TechCorp Office Building',
    lockerCode: 'A02',
    category: 'locker',
    priority: 'urgent',
    status: 'escalated',
    escalatedToSuperAdmin: true,
    title: 'Không mở được cửa locker A02 sau khi nhập đúng OTP',
    description: 'Tôi đã nhập đúng mã OTP 482913 nhận được qua SMS nhưng rơ-le khóa không nhả. Cửa tủ vẫn báo khóa.',
    attachments: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&auto=format&fit=crop&q=80'
    ],
    assignee: 'Kỹ thuật viên Kế Nam (Super Admin Direct)',
    createdAt: '2026-04-29 15:20',
    updatedAt: '2026-04-29 15:35',
    resolutionNote: 'Admin Khu Trọ không xử lý được sự cố cơ khí rơ-le, đã Leo thang (Escalate) chuyển Super Admin hỗ trợ phần cứng.',
    timeline: [
      { id: 'tl-1', time: '15:20', actor: 'Nguyễn Văn An', note: 'Gửi báo lỗi từ app cư dân kèm 2 ảnh bằng chứng hiện trường' },
      { id: 'tl-2', time: '15:28', actor: 'Admin TechCorp', note: 'Tiếp nhận sự cố tại khu trọ, thử phát lệnh mở từ xa nhưng rơ-le kẹt cơ' },
      { id: 'tl-3', time: '15:35', actor: 'Admin TechCorp', note: '🚀 Đã LEO THANG (Escalate) sự cố lên Platform Super Admin xử lý' },
    ],
  },
  {
    id: 'iss-002',
    ticketCode: 'ERR-2026-002',
    reporterName: 'Shipper Nguyễn Văn Minh',
    reporterRole: 'shipper',
    reporterPhone: '0909998877',
    reporterEmail: 'minh.shipper@ghn.vn',
    orgId: 'org-001',
    orgName: 'TechCorp Office Building',
    lockerCode: 'C02',
    category: 'parcel',
    priority: 'high',
    status: 'in_progress',
    escalatedToSuperAdmin: false,
    title: 'Mã vận đơn SHP-2026-011 bị kẹt trạng thái lưu tủ',
    description: 'Tôi đã cất hàng vào tủ C02 thành công nhưng hệ thống báo lỗi không sinh được mã OTP gửi cho người nhận.',
    attachments: [
      'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=600&auto=format&fit=crop&q=80'
    ],
    assignee: 'Trần Văn Minh (Admin TechCorp)',
    createdAt: '2026-04-29 14:45',
    updatedAt: '2026-04-29 15:00',
    resolutionNote: 'Đã kiểm tra kết nối SMS Gateway tại khu trọ, đang phát mã OTP bổ sung.',
    timeline: [
      { id: 'tl-1', time: '14:45', actor: 'Shipper Minh', note: 'Báo lỗi từ ứng dụng Shipper kèm ảnh vận đơn' },
      { id: 'tl-2', time: '15:00', actor: 'Admin TechCorp', note: 'Đã tiếp nhận và gán người xử lý nội bộ tòa nhà' },
    ],
  },
  {
    id: 'iss-003',
    ticketCode: 'ERR-2026-003',
    reporterName: 'Trần Thị B',
    reporterRole: 'customer',
    reporterPhone: '0912345678',
    reporterEmail: 'b.tran@gmail.com',
    orgId: 'org-002',
    orgName: 'Khu Nhà Trọ Hoàng Nam',
    lockerCode: 'B01',
    category: 'otp',
    priority: 'medium',
    status: 'resolved',
    escalatedToSuperAdmin: false,
    title: 'Mã OTP hết hạn trước thời hạn quy định',
    description: 'Hệ thống báo OTP hết hạn chỉ sau 1 phút tạo đơn thay vì 180 giây như cấu hình.',
    attachments: [
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80'
    ],
    assignee: 'Nguyễn Hoàng Nam (Chủ Khu Trọ)',
    createdAt: '2026-04-29 11:30',
    updatedAt: '2026-04-29 12:15',
    resolutionNote: 'Chủ khu trọ đã cập nhật lại thời gian hiệu lực OTP lên 180 giây trên server.',
    timeline: [
      { id: 'tl-1', time: '11:30', actor: 'Trần Thị B', note: 'Gửi khiếu nại OTP kèm chụp màn hình hết hạn' },
      { id: 'tl-2', time: '12:00', actor: 'Chủ Khu Trọ Hoàng Nam', note: 'Điều chỉnh cài đặt OTP Expiry' },
      { id: 'tl-3', time: '12:15', actor: 'Chủ Khu Trọ Hoàng Nam', note: 'Xác nhận giải quyết thành công cho cư dân' },
    ],
  },
  {
    id: 'iss-004',
    ticketCode: 'ERR-2026-004',
    reporterName: 'Shipper Trần Quốc Long',
    reporterRole: 'shipper',
    reporterPhone: '0911223344',
    reporterEmail: 'long.shipper@ghtk.vn',
    orgId: 'org-003',
    orgName: 'Ký Túc Xá Đại Học Bách Khoa',
    lockerCode: 'D02',
    category: 'locker',
    priority: 'low',
    status: 'closed',
    escalatedToSuperAdmin: true,
    title: 'Cảm biến hồng ngoại nhận diện vật thể bị chập chập',
    description: 'Cảm biến hồng ngoại trong ngăn D02 báo EMPTY mặc dù kiện hàng đã nằm trong tủ.',
    attachments: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
    ],
    assignee: 'Kỹ thuật viên Kế Nam (Super Admin Team)',
    createdAt: '2026-04-28 16:10',
    updatedAt: '2026-04-28 17:30',
    resolutionNote: 'Super Admin đã cử kỹ thuật viên lau ống kính cảm biến IR tại trạm KTX Bách Khoa.',
    timeline: [
      { id: 'tl-1', time: '16:10', actor: 'Shipper Long', note: 'Báo lỗi phần cứng cảm biến' },
      { id: 'tl-2', time: '16:40', actor: 'Admin KTX Bách Khoa', note: 'Leo thang sự cố lên Super Admin vì lỗi cảm biến bo mạch' },
      { id: 'tl-3', time: '17:30', actor: 'Kỹ thuật viên Super Admin', note: 'Bảo trì thay thế linh kiện thành công' },
    ],
  },
]

export async function getIssues(): Promise<TIssueItem[]> {
  return Promise.resolve(mockIssues)
}

export async function updateIssueStatus(
  issueId: string,
  newStatus: TIssueItem['status'],
  note?: string
): Promise<TIssueItem> {
  const item = mockIssues.find((i) => i.id === issueId)
  if (item) {
    item.status = newStatus
    item.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16)
    if (note) {
      item.resolutionNote = note
    }
    item.timeline.unshift({
      id: `tl-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'Admin',
      note: `Đã cập nhật trạng thái sang ${newStatus.toUpperCase()}${note ? `: ${note}` : ''}`,
    })
    return item
  }
  return Promise.reject('Issue not found')
}

export async function escalateIssueToSuperAdmin(
  issueId: string,
  reason: string
): Promise<TIssueItem> {
  const item = mockIssues.find((i) => i.id === issueId)
  if (item) {
    item.status = 'escalated'
    item.escalatedToSuperAdmin = true
    item.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16)
    item.timeline.unshift({
      id: `tl-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'Admin Khu Trọ',
      note: `🚀 LEO THANG (Escalate) sự cố lên Super Admin: ${reason || 'Vượt quá khả năng xử lý tại cơ sở'}`,
    })
    return item
  }
  return Promise.reject('Issue not found')
}
