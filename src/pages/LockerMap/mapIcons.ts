import L from 'leaflet'

const TARGET_SVG = `
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
  </svg>`

// Tủ locker dựng đứng nhìn theo góc isometric: mặt trên, mặt trước (có cửa) và mặt hông.
// Ba mặt cùng một màu trạng thái nhưng đậm nhạt khác nhau để tạo cảm giác khối 3D.
const CABINET_SVG = `
  <svg class="lm-cab__svg" width="44" height="58" viewBox="0 0 44 58" aria-hidden="true">
    <ellipse class="lm-cab__shadow" cx="22" cy="51.5" rx="18" ry="5"/>
    <g stroke-linejoin="round">
      <path class="lm-cab__side" d="M22 17 35 10.5 35 43.5 22 50Z"/>
      <path class="lm-cab__front" d="M9 10.5 22 17 22 50 9 43.5Z"/>
      <path class="lm-cab__top" d="M22 4 35 10.5 22 17 9 10.5Z"/>
    </g>
    <g class="lm-cab__doors">
      <path d="M15.5 13.75V46.75M9 21.5 22 28M9 32.5 22 39"/>
    </g>
    <g class="lm-cab__handles">
      <circle cx="13" cy="18" r="1"/><circle cx="19" cy="21" r="1"/>
      <circle cx="13" cy="29" r="1"/><circle cx="19" cy="32" r="1"/>
      <circle cx="13" cy="40" r="1"/><circle cx="19" cy="43" r="1"/>
    </g>
    <g class="lm-cab__vents">
      <path d="M26 24.5 31 22M26 28.5 31 26M26 32.5 31 30"/>
    </g>
  </svg>`

function buildCabinet(color: string, selected: boolean, hasIssue: boolean, count: number) {
  return L.divIcon({
    className: '',
    html: `
      <div class="lm-cab${selected ? ' is-selected' : ''}" style="--pin:${color}">
        <span class="lm-cab__ring"></span>
        ${CABINET_SVG}
        ${hasIssue ? '<i class="lm-cab__alert"></i>' : ''}
        ${count > 1 ? `<b class="lm-cab__count">${count}</b>` : ''}
      </div>`,
    iconSize: [44, 58],
    // Neo tại đáy tủ để tủ "đứng" đúng vị trí trên bản đồ
    iconAnchor: [22, 51],
    popupAnchor: [0, -46],
  })
}

// Cache icon để Leaflet không phải vẽ lại marker ở mỗi lần render
const iconCache = new Map<string, L.DivIcon>()

export function getLockerIcon(color: string, selected: boolean, hasIssue: boolean, count = 1) {
  const key = `${color}|${selected}|${hasIssue}|${count}`
  let icon = iconCache.get(key)
  if (!icon) {
    icon = buildCabinet(color, selected, hasIssue, count)
    iconCache.set(key, icon)
  }
  return icon
}

// Ghim tạm thời khi người dùng đang chọn vị trí trên bản đồ
export const PICKER_ICON = L.divIcon({
  className: '',
  html: `
    <div class="lm-pin is-selected" style="--pin:#0369a1">
      <span class="lm-pin__tail"></span>
      <span class="lm-pin__body">${TARGET_SVG}</span>
    </div>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -42],
})

// Chấm xanh thể hiện vị trí hiện tại của người dùng
export const MY_LOCATION_ICON = L.divIcon({
  className: '',
  html: '<div class="lm-me"><span class="lm-me__pulse"></span><span class="lm-me__dot"></span></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})
