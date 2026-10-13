import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useMap, useMapEvents } from 'react-leaflet'
import type { FlyTarget } from './types'

const FLY_ZOOM = 17

// Bay tới một trạm tủ, mở popup khi đã tới nơi
export function FlyToMarker({
  target,
  onArrived,
}: {
  target: FlyTarget | null
  onArrived: (id: string) => void
}) {
  const map = useMap()

  useEffect(() => {
    if (!target) return
    const dest = L.latLng(target.lat, target.lng)
    const alreadyThere =
      map.getZoom() === FLY_ZOOM && map.getCenter().distanceTo(dest) < 2

    if (alreadyThere) {
      onArrived(target.id)
      return
    }
    map.once('moveend', () => onArrived(target.id))
    map.flyTo(dest, FLY_ZOOM, { duration: 0.8 })
  }, [target, map, onArrived])

  return null
}

// Tự thu phóng để thấy toàn bộ trạm tủ: chạy khi có dữ liệu lần đầu và mỗi khi `signal` đổi
export function FitToLockers({
  points,
  signal,
}: {
  points: [number, number][]
  signal: number
}) {
  const map = useMap()
  const lastSignal = useRef<number | null>(null)

  useEffect(() => {
    if (points.length === 0 || lastSignal.current === signal) return
    lastSignal.current = signal

    if (points.length === 1) {
      map.setView(points[0], 16)
    } else {
      map.fitBounds(points, { padding: [60, 60], maxZoom: 16 })
    }
  }, [points, signal, map])

  return null
}

// Bắt sự kiện click lên bản đồ khi đang ở chế độ ghim vị trí
export function MapClickPicker({
  active,
  onPick,
}: {
  active: boolean
  onPick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      if (active) onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}
