/**
 * API CLIENT
 * -------------------------------------------------------------------------
 * Một HTTP client nhẹ dùng fetch, tự động:
 * 1. Gắn header Authorization: Bearer <accessToken> cho mọi request.
 * 2. Khi nhận được 401, tự động gọi POST /auth/refresh-token để cấp lại token,
 *    sau đó retry lại request gốc 1 lần.
 * 3. Nếu refresh thất bại → logout user.
 * -------------------------------------------------------------------------
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Helpers để đọc/ghi tokens từ localStorage (ngoài Zustand để tránh circular import)
function getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
  try {
    const raw = localStorage.getItem('smart-locker-admin-auth')
    if (!raw) return { accessToken: null, refreshToken: null }
    const parsed = JSON.parse(raw)
    return {
      accessToken: parsed?.state?.token ?? null,
      refreshToken: parsed?.state?.refreshToken ?? null,
    }
  } catch {
    return { accessToken: null, refreshToken: null }
  }
}

// Hàm gọi refresh token trực tiếp (không dùng apiClient để tránh loop)
async function callRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// Update tokens vào localStorage store
function updateStoredTokens(accessToken: string, refreshToken: string) {
  try {
    const raw = localStorage.getItem('smart-locker-admin-auth')
    if (!raw) return
    const parsed = JSON.parse(raw)
    parsed.state.token = accessToken
    parsed.state.refreshToken = refreshToken
    localStorage.setItem('smart-locker-admin-auth', JSON.stringify(parsed))
  } catch {
    // ignore
  }
}

// Force logout nếu refresh thất bại
function forceLogout() {
  try {
    const raw = localStorage.getItem('smart-locker-admin-auth')
    if (!raw) return
    const parsed = JSON.parse(raw)
    parsed.state.user = null
    parsed.state.token = null
    parsed.state.refreshToken = null
    parsed.state.isAuthenticated = false
    localStorage.setItem('smart-locker-admin-auth', JSON.stringify(parsed))
    window.location.href = '/login'
  } catch {
    window.location.href = '/login'
  }
}

export type ApiResponse<T> = {
  data: T
  status: number
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const { accessToken } = getStoredTokens()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // Nếu 401 và còn được phép retry → thử refresh token
  if (res.status === 401 && retry) {
    const { refreshToken } = getStoredTokens()
    if (refreshToken) {
      const newTokens = await callRefreshToken(refreshToken)
      if (newTokens) {
        updateStoredTokens(newTokens.accessToken, newTokens.refreshToken)
        // Retry lại request với token mới, retry=false để tránh loop
        return request<T>(path, options, false)
      }
    }
    forceLogout()
    throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.message || `HTTP Error ${res.status}`
    throw new Error(Array.isArray(message) ? message.join(', ') : message)
  }

  return { data: data as T, status: res.status }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
