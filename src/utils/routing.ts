import { tNow } from '../i18n/translate'

export type LatLng = { lat: number; lng: number }

export type RouteResult = {
  // Các điểm của tuyến đường theo [vĩ độ, kinh độ]
  coords: [number, number][]
  distanceM: number
  durationS: number
  // osrm: đường đi thật theo đường bộ; straight: chỉ là đường chim bay khi không gọi được dịch vụ chỉ đường
  source: 'osrm' | 'straight'
}

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving'

// Khoảng cách đường chim bay (mét)
export function haversineM(a: LatLng, b: LatLng): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Tuyến đường bộ từ A tới B bằng OSRM (máy chủ demo công khai, đủ dùng cho nhu cầu quản trị).
// Gọi lỗi thì trả về đường thẳng để vẫn thấy được hướng và khoảng cách.
export async function getRoute(from: LatLng, to: LatLng): Promise<RouteResult> {
  try {
    const url = `${OSRM_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) throw new Error(String(res.status))
    const data = (await res.json()) as {
      code: string
      routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[]
    }
    const route = data.routes?.[0]
    if (data.code !== 'Ok' || !route) throw new Error(data.code)
    return {
      coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
      distanceM: route.distance,
      durationS: route.duration,
      source: 'osrm',
    }
  } catch {
    const distanceM = haversineM(from, to)
    return {
      coords: [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
      distanceM,
      // Ước tính thô theo tốc độ 25 km/h để vẫn có con số tham khảo
      durationS: (distanceM / 1000 / 25) * 3600,
      source: 'straight',
    }
  }
}

// Mở ứng dụng bản đồ của Google để dẫn đường thật. Không có điểm xuất phát thì Google tự lấy vị trí hiện tại.
export function googleDirectionsUrl(to: LatLng, from?: LatLng): string {
  const params = new URLSearchParams({ api: '1', destination: `${to.lat},${to.lng}`, travelmode: 'driving' })
  if (from) params.set('origin', `${from.lat},${from.lng}`)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

// Lấy vị trí hiện tại của người đang dùng trình duyệt (cần HTTPS hoặc localhost và được người dùng cho phép)
export function getCurrentPosition(): Promise<LatLng & { accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('unsupported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => reject(new Error(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable')),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    )
  })
}

export function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`
}

export function formatDuration(s: number): string {
  const min = Math.max(1, Math.round(s / 60))
  if (min < 60) return tNow('map2.durMin', { count: min })
  const h = Math.floor(min / 60)
  const rest = min % 60
  return rest ? tNow('map2.durHourMin', { h, m: rest }) : tNow('map2.durHour', { h })
}
