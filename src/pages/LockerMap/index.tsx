import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet'
import type L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import { Maximize2, PanelLeftOpen, RefreshCw } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './LockerMap.css'
import { apiClient } from '../../service/api.client'
import { getIssues } from '../../service/issue.service'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import { tNow } from '../../i18n/translate'
import type { TIssueItem } from '../../types/issue.type'
import { DEFAULT_CENTER } from './constants'
import { EditLocationModal } from './EditLocationModal'
import { LockerPanel } from './LockerPanel'
import { LockerPopup } from './LockerPopup'
import { getLockerIcon, PICKER_ICON } from './mapIcons'
import { FitToLockers, FlyToMarker, MapClickPicker } from './MapHelpers'
import { PickingBar } from './PickingBar'
import type { FlyTarget, LockerFilter, LockerMapItem } from './types'
import { hasCoords, normalizeText, parseCoord, statusMeta } from './utils'

const floatingBtn =
  'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/95 text-slate-600 shadow-[0_4px_14px_rgba(15,23,42,0.14)] backdrop-blur transition-colors hover:bg-white hover:text-slate-900 disabled:opacity-60 dark:border-slate-700/70 dark:bg-slate-900/95 dark:text-slate-300 dark:hover:text-white'

export function LockerMapPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = user?.role === 'super_admin'

  const [lockers, setLockers] = useState<LockerMapItem[]>([])
  const [issues, setIssues] = useState<TIssueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null)
  const [fitSignal, setFitSignal] = useState(0)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LockerFilter>('ALL')
  const [panelOpen, setPanelOpen] = useState(true)
  const markerRefs = useRef<Record<string, L.Marker>>({})

  // Chỉnh sửa vị trí
  const [editing, setEditing] = useState<LockerMapItem | null>(null)
  const [draftLat, setDraftLat] = useState('')
  const [draftLng, setDraftLng] = useState('')
  const [isPicking, setIsPicking] = useState(false)
  const pickSnapshot = useRef({ lat: '', lng: '' })

  // Tăng reloadKey để tải lại dữ liệu từ server
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    Promise.all([apiClient.get<LockerMapItem[]>('/lockers'), getIssues()])
      .then(([lockersRes, issuesData]) => {
        if (!active) return
        setLockers(lockersRes.data ?? [])
        setIssues(issuesData ?? [])
        setError(null)
      })
      .catch((e: unknown) => {
        if (!active) return
        setError(e instanceof Error ? e.message : tNow('map.loadFailed'))
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
        setRefreshing(false)
      })

    return () => {
      active = false
    }
  }, [reloadKey])

  const handleRefresh = () => {
    setRefreshing(true)
    setReloadKey((n) => n + 1)
  }

  // Sự cố đang mở theo mã trạm tủ
  const activeIssuesByCode = useMemo(() => {
    const map = new Map<string, TIssueItem[]>()
    for (const iss of issues) {
      if (!iss.lockerCode || iss.status === 'resolved' || iss.status === 'closed') continue
      const list = map.get(iss.lockerCode) ?? []
      list.push(iss)
      map.set(iss.lockerCode, list)
    }
    return map
  }, [issues])

  const counts = useMemo<Record<LockerFilter, number>>(
    () => ({
      ALL: lockers.length,
      ONLINE: lockers.filter((l) => l.status === 'ONLINE').length,
      OFFLINE: lockers.filter((l) => l.status === 'OFFLINE').length,
      MAINTENANCE: lockers.filter((l) => l.status === 'MAINTENANCE').length,
      HAS_ISSUES: lockers.filter((l) => activeIssuesByCode.has(l.code)).length,
    }),
    [lockers, activeIssuesByCode],
  )

  // Bộ lọc trạng thái và tìm kiếm áp dụng cho cả hai danh sách
  const matches = useCallback(
    (l: LockerMapItem) => {
      if (filter === 'HAS_ISSUES' && !activeIssuesByCode.has(l.code)) return false
      if (filter !== 'ALL' && filter !== 'HAS_ISSUES' && l.status !== filter) return false

      const q = normalizeText(search.trim())
      if (!q) return true
      return [l.name, l.code, l.locationDescription, l.buildingId?.name, l.buildingId?.address]
        .filter(Boolean)
        .some((field) => normalizeText(field as string).includes(q))
    },
    [filter, search, activeIssuesByCode],
  )

  const allWithCoords = useMemo(() => lockers.filter(hasCoords), [lockers])
  const visible = useMemo(() => allWithCoords.filter(matches), [allWithCoords, matches])
  const visibleNoCoords = useMemo(
    () => lockers.filter((l) => !hasCoords(l)).filter(matches),
    [lockers, matches],
  )
  const fitPoints = useMemo<[number, number][]>(
    () => allWithCoords.map((l) => [l.coordinates!.latitude, l.coordinates!.longitude]),
    [allWithCoords],
  )

  const handleSelect = (l: LockerMapItem) => {
    setSelectedId(l._id)
    if (hasCoords(l)) {
      setFlyTarget({ lat: l.coordinates!.latitude, lng: l.coordinates!.longitude, id: l._id })
    }
  }

  const handleArrived = useCallback((id: string) => {
    markerRefs.current[id]?.openPopup()
  }, [])

  // ── Chỉnh sửa vị trí ──
  const openEdit = (l: LockerMapItem) => {
    setEditing(l)
    setDraftLat(l.coordinates ? String(l.coordinates.latitude) : '')
    setDraftLng(l.coordinates ? String(l.coordinates.longitude) : '')
    setIsPicking(false)
  }

  const closeEdit = useCallback(() => {
    setEditing(null)
    setIsPicking(false)
  }, [])

  const startPicking = () => {
    pickSnapshot.current = { lat: draftLat, lng: draftLng }
    setIsPicking(true)
  }

  const cancelPicking = useCallback(() => {
    setDraftLat(pickSnapshot.current.lat)
    setDraftLng(pickSnapshot.current.lng)
    setIsPicking(false)
  }, [])

  async function handleSave(payload: { lat: number; lng: number; locationDescription: string }) {
    if (!editing) return
    const coordinates = { latitude: payload.lat, longitude: payload.lng }

    try {
      await apiClient.patch(`/lockers/${editing._id}`, {
        coordinates,
        locationDescription: payload.locationDescription,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('map.saveFailed'))
      return
    }

    setLockers((prev) =>
      prev.map((item) =>
        item._id === editing._id
          ? { ...item, coordinates, locationDescription: payload.locationDescription }
          : item,
      ),
    )
    toast.success(t('map.savedToast', { code: editing.code }))
    setFlyTarget({ lat: payload.lat, lng: payload.lng, id: editing._id })
    setSelectedId(editing._id)
    closeEdit()
  }

  const draftLatNum = parseCoord(draftLat, -90, 90)
  const draftLngNum = parseCoord(draftLng, -180, 180)
  const showDraftPin = editing !== null && draftLatNum !== null && draftLngNum !== null

  const title = isSuperAdmin ? t('map.titleAll') : t('map.titleBuilding')
  const subtitle = loading
    ? t('map.subtitleLoading')
    : t('map.subtitle', { count: lockers.length, online: counts.ONLINE })

  return (
    <div className="relative -m-4 h-[calc(100%+2rem)] overflow-hidden sm:-m-6 sm:h-[calc(100%+3rem)] lg:-m-8 lg:h-[calc(100%+4rem)]">
      <div className={`lm-map absolute inset-0 isolate ${isPicking ? 'is-picking' : ''}`}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={13}
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ZoomControl position="bottomright" />

          <FitToLockers points={fitPoints} signal={fitSignal} />
          <FlyToMarker target={flyTarget} onArrived={handleArrived} />
          <MapClickPicker
            active={isPicking}
            onPick={(lat, lng) => {
              setDraftLat(lat.toFixed(6))
              setDraftLng(lng.toFixed(6))
            }}
          />

          {showDraftPin && (
            <Marker position={[draftLatNum, draftLngNum]} icon={PICKER_ICON} zIndexOffset={1000} />
          )}

          {visible.map((l) => {
            const issueList = activeIssuesByCode.get(l.code) ?? []
            return (
              <Marker
                key={l._id}
                position={[l.coordinates!.latitude, l.coordinates!.longitude]}
                icon={getLockerIcon(statusMeta(l.status).hex, selectedId === l._id, issueList.length > 0)}
                ref={(ref) => {
                  if (ref) markerRefs.current[l._id] = ref
                  else delete markerRefs.current[l._id]
                }}
                eventHandlers={{ click: () => setSelectedId(l._id) }}
              >
                <Popup className="lm-popup" minWidth={272} maxWidth={272} closeButton>
                  <LockerPopup
                    locker={l}
                    issues={issueList}
                    onEdit={() => openEdit(l)}
                    onOpenDetail={() => navigate(`/lockers/${l.code}`)}
                    onOpenIssues={() => navigate('/issues')}
                  />
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {panelOpen && (
        <LockerPanel
          title={title}
          subtitle={subtitle}
          search={search}
          onSearch={setSearch}
          filter={filter}
          onFilter={setFilter}
          counts={counts}
          lockers={visible}
          noCoords={visibleNoCoords}
          loading={loading}
          error={error}
          onRetry={handleRefresh}
          selectedId={selectedId}
          issuesByCode={activeIssuesByCode}
          onSelect={handleSelect}
          onEdit={openEdit}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {/* Nút điều khiển nổi góc trên bên phải */}
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        {!panelOpen && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            title={t('map.openPanel')}
            className={floatingBtn}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setFitSignal((n) => n + 1)}
          title={t('map.fitAll')}
          disabled={fitPoints.length === 0}
          className={floatingBtn}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          title={t('map.refresh')}
          disabled={refreshing || loading}
          className={floatingBtn}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {editing && isPicking && (
        <PickingBar
          lockerCode={editing.code}
          lat={draftLat}
          lng={draftLng}
          onConfirm={() => setIsPicking(false)}
          onCancel={cancelPicking}
        />
      )}

      {editing && (
        <EditLocationModal
          key={editing._id}
          locker={editing}
          lat={draftLat}
          lng={draftLng}
          hidden={isPicking}
          onCoordsChange={(lat, lng) => {
            setDraftLat(lat)
            setDraftLng(lng)
          }}
          onPickOnMap={startPicking}
          onGeocoded={(lat, lng) =>
            setFlyTarget({ lat, lng, id: '__draft__' })
          }
          onSave={handleSave}
          onClose={closeEdit}
        />
      )}
    </div>
  )
}
