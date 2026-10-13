const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

// Nominatim chỉ cho phép tối đa 1 request mỗi giây
const REQUEST_GAP_MS = 1100

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Sinh các biến thể địa chỉ từ chi tiết đến tổng quát để tăng khả năng tìm thấy
function buildQueries(raw: string): string[] {
  // Bỏ các thành phần địa chỉ làm nhiễu kết quả (Khu phố, Tổ, Ấp...)
  const cleaned = raw
    .replace(/Khu\s*phố\s*\d+/gi, '')
    .replace(/KP\.?\s*\d+/gi, '')
    .replace(/Tổ\s*\d+/gi, '')
    .replace(/Ấp\s*\d+/gi, '')
    .replace(/,\s*,/g, ',')
    .trim()

  const segments = cleaned
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const candidates = [
    raw,
    cleaned,
    segments.length > 2 ? segments.slice(-3).join(', ') : cleaned,
    segments.slice(-2).join(', '),
  ]

  return candidates.filter((q, i, arr) => q.length > 2 && arr.indexOf(q) === i).slice(0, 3)
}

export class GeocodeRateLimitError extends Error {}

// Đổi địa chỉ tiếng Việt thành tọa độ bằng OpenStreetMap Nominatim
export async function geocodeAddress(
  rawAddress: string,
): Promise<{ lat: number; lng: number } | null> {
  const queries = buildQueries(rawAddress.trim())
  let networkError: unknown = null
  let gotResponse = false

  for (let i = 0; i < queries.length; i++) {
    if (i > 0) await sleep(REQUEST_GAP_MS)

    try {
      const url =
        `${NOMINATIM_URL}?format=json&limit=1&countrycodes=vn&accept-language=vi` +
        `&q=${encodeURIComponent(queries[i])}`
      const res = await fetch(url)
      gotResponse = true

      if (res.status === 429) throw new GeocodeRateLimitError()
      if (!res.ok) continue

      const data: { lat: string; lon: string }[] = await res.json()
      const lat = parseFloat(data[0]?.lat)
      const lng = parseFloat(data[0]?.lon)
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
    } catch (err) {
      if (err instanceof GeocodeRateLimitError) throw err
      networkError = err
    }
  }

  if (!gotResponse && networkError) throw networkError
  return null
}
