import L from 'leaflet'

// Biểu tượng tủ locker: thân tủ chia 4 ngăn
const LOCKER_SVG = `
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M4 12h16"/>
  </svg>`

const TARGET_SVG = `
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
  </svg>`

function buildPin(color: string, svg: string, selected: boolean, hasIssue: boolean) {
  return L.divIcon({
    className: '',
    html: `
      <div class="lm-pin${selected ? ' is-selected' : ''}" style="--pin:${color}">
        <span class="lm-pin__tail"></span>
        <span class="lm-pin__body">${svg}</span>
        ${hasIssue ? '<i class="lm-pin__alert"></i>' : ''}
      </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -42],
  })
}

// Cache icon để Leaflet không phải vẽ lại marker ở mỗi lần render
const iconCache = new Map<string, L.DivIcon>()

export function getLockerIcon(color: string, selected: boolean, hasIssue: boolean) {
  const key = `${color}|${selected}|${hasIssue}`
  let icon = iconCache.get(key)
  if (!icon) {
    icon = buildPin(color, LOCKER_SVG, selected, hasIssue)
    iconCache.set(key, icon)
  }
  return icon
}

// Ghim tạm thời khi người dùng đang chọn vị trí trên bản đồ
export const PICKER_ICON = buildPin('#0369a1', TARGET_SVG, true, false)
