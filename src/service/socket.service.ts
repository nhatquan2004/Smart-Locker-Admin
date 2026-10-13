import { io, Socket } from 'socket.io-client'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export type TNewPendingResidentEvent = {
  type: 'NEW_PENDING_RESIDENT'
  title: string
  message: string
  resident: {
    id: string
    name: string
    phone: string
    email?: string
    apartment?: string
    buildingId: string
    createdAt: string
  }
  timestamp: string
}

export type TResidentApprovalResultEvent = {
  type: 'RESIDENT_APPROVAL_RESULT'
  residentId: string
  status: 'ACTIVE' | 'REJECTED'
  apartment?: string
  reason?: string
  timestamp: string
}

export type TPackageNewEvent = {
  type: 'PACKAGE_NEW'
  title: string
  message: string
  package: {
    id: string
    trackingNumber: string
    boxNumber: number
    lockerName: string
    lockerCode: string
    pinCode: string
    carrierName: string
    droppedOffAt: string
  }
  timestamp: string
}

let socket: Socket | null = null

/**
 * Khởi tạo hoặc lấy kết nối socket hiện có đến namespace /notifications
 */
export function getNotificationSocket(): Socket {
  if (!socket) {
    socket = io(`${BASE_URL}/notifications`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => {
      console.log('⚡ [Socket] Đã kết nối tới WebSocket Notifications Gateway:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('⚡ [Socket] Mất kết nối Socket:', reason)
    })

    socket.on('connect_error', (error) => {
      console.warn('⚡ [Socket] Lỗi kết nối Socket:', error.message)
    })
  }

  return socket
}

/**
 * Yêu cầu tham gia phòng thông báo của một Tòa Nhà
 */
export function joinBuildingRoom(buildingId: string) {
  const s = getNotificationSocket()
  if (s.connected) {
    s.emit('join_building', { buildingId })
  } else {
    s.once('connect', () => {
      s.emit('join_building', { buildingId })
    })
  }
}

/**
 * Rời khỏi phòng thông báo của Tòa Nhà
 */
export function leaveBuildingRoom(buildingId: string) {
  if (socket && socket.connected) {
    socket.emit('leave_building', { buildingId })
  }
}

/**
 * Đóng kết nối socket hoàn toàn (khi logout)
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
