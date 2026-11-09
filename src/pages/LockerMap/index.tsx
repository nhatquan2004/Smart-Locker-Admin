import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, ZoomControl } from 'react-leaflet'
import type L from 'leaflet'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, LocateFixed, Maximize2, PanelLeftOpen, RefreshCw } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './LockerMap.css'
import { apiClient } from '../../service/api.client'
import { getOpenIssues } from '../../service/issue.service'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../context/LanguageContext'
import { tNow } from '../../i18n/translate'
import { getCurrentPosition, getRoute, type LatLng, type RouteResult } from '../../utils/routing'
import type { TIssueItem } from '../../types/issue.type'
import { DEFAULT_CENTER } from './constants'
import { EditLocationModal } from './EditLocationModal'
import { LockerPanel } from './LockerPanel'
import { LockerDetailDrawer } from './LockerDetailDrawer'
import { GroupPopup } from './GroupPopup'
import { getLockerIcon, MY_LOCATION_ICON, PICKER_ICON } from './mapIcons'
import { FitToBounds, FitToLockers, FlyToMarker, MapClickPicker } from './MapHelpers'
import { PickingBar } from './PickingBar'
import type { FlyTarget, LockerFilter, LockerGroup, LockerMapItem } from './types'
import { groupKey, hasCoords, normalizeText, parseCoord, statusMeta, worstStatus } from './utils'

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

  // Ngăn chi tiết của một trạm tủ, vị trí của người dùng và tuyến đường tới trạm
  const [searchParams, setSearchParams] = useSearchParams()
  const [detailId, setDetailId] = useState<string | null>(null)
  const detailRef = useRef<string | null>(null)
  const [myPos, setMyPos] = useState<(LatLng & { accuracy: number }) | null>(null)
  const [route, setRoute] = useState<{ lockerId: string; result: RouteResult } | null>(null)
  const [navBusy, setNavBusy] = useState<'locating' | 'routing' | null>(null)
  const [routeFit, setRouteFit] = useState(0)

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

    Promise.all([apiClient.get<LockerMapItem[]>('/lockers'), getOpenIssues()])
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

  useEffect(() => {
    detailRef.current = detailId
  }, [detailId])

  // Tạo xong trạm tủ thì được đưa tới đây kèm ?focus=<mã tủ>: chọn sẵn tủ đó và mở ngăn chi tiết
  const focusCode = searchParams.get('focus')
  useEffect(() => {
    if (!focusCode || lockers.length === 0) return
    const timer = window.setTimeout(() => {
      const target = lockers.find((l) => l.code === focusCode.toUpperCase())
      if (target) {
        setSelectedId(target._id)
        setDetailId(target._id)
        if (hasCoords(target)) {
          setFlyTarget({ lat: target.coordinates!.latitude, lng: target.coordinates!.longitude, id: groupKey(target) })
        }
      }
      setSearchParams({}, { replace: true })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [focusCode, lockers, setSearchParams])

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

  // Gộp các tủ cùng doanh nghiệp thành một ghim, đặt tại vị trí của tủ đầu tiên
  const groups = useMemo<LockerGroup[]>(() => {
    const byKey = new Map<string, LockerMapItem[]>()
    for (const l of visible) {
      const key = groupKey(l)
      byKey.set(key, [...(byKey.get(key) ?? []), l])
    }
    return [...byKey.entries()].map(([key, list]) => ({
      key,
      lockers: list,
      position: [list[0].coordinates!.latitude, list[0].coordinates!.longitude] as [number, number],
      status: worstStatus(list),
    }))
  }, [visible])

  const handleSelect = (l: LockerMapItem) => {
    setSelectedId(l._id)
    setDetailId(l._id)
    if (hasCoords(l)) {
      setFlyTarget({ lat: l.coordinates!.latitude, lng: l.coordinates!.longitude, id: groupKey(l) })
    }
  }

  // Đã mở ngăn chi tiết thì không bật thêm popup để khỏi chồng chéo
  const handleArrived = useCallback((id: string) => {
    if (detailRef.current) return
    markerRefs.current[id]?.openPopup()
  }, [])

  // ── Vị trí của tôi và chỉ đường ──
  async function locateMe(): Promise<(LatLng & { accuracy: number }) | null> {
    try {
      const pos = await getCurrentPosition()
      setMyPos(pos)
      return pos
    } catch (err) {
      const code = err instanceof Error ? err.message : ''
      toast.error(t(code === 'denied' ? 'map2.locDenied' : code === 'unsupported' ? 'map2.locUnsupported' : 'map2.locUnavailable'))
      return null
    }
  }

  async function handleLocateMe() {
    if (navBusy) return
    setNavBusy('locating')
    const pos = await locateMe()
    setNavBusy(null)
    if (pos) setFlyTarget({ lat: pos.lat, lng: pos.lng, id: '__me__' })
  }

  async function handleDirections(l: LockerMapItem) {
    if (!hasCoords(l) || navBusy) return
    setNavBusy('locating')
    const from = myPos ?? (await locateMe())
    if (!from) {
      setNavBusy(null)
      return
    }
    setNavBusy('routing')
    const result = await getRoute(from, { lat: l.coordinates!.latitude, lng: l.coordinates!.longitude })
    setRoute({ lockerId: l._id, result })
    setRouteFit((n) => n + 1)
    setNavBusy(null)
  }

  const routePoints = useMemo<[number, number][]>(() => route?.result.coords ?? [], [route])

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

  async function handleSave(payload: {
    lat: number
    lng: number
    locationDescription: string
    address: string
  }) {
    if (!editing) return
    const coordinates = { latitude: payload.lat, longitude: payload.lng }

    // Vị trí thuộc về doanh nghiệp: đổi cho mọi tủ cùng doanh nghiệp để ghim không bị tách ra
    const key = groupKey(editing)
    const siblings = lockers.filter((l) => groupKey(l) === key)

    // Địa chỉ và vị trí thuộc về doanh nghiệp nên cũng cập nhật lên doanh nghiệp
    const buildingId = editing.buildingId?._id
    const addressChanged = !!payload.address && payload.address !== editing.buildingId?.address

    try {
      if (buildingId) {
        await apiClient.patch(`/buildings/${buildingId}`, {
          ...(addressChanged ? { address: payload.address } : {}),
          latitude: payload.lat,
          longitude: payload.lng,
        })
      }
      await Promise.all(
        siblings.map((l) =>
          apiClient.patch(
            `/lockers/${l._id}`,
            l._id === editing._id
              ? { coordinates, locationDescription: payload.locationDescription }
              : { coordinates },
          ),
        ),
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('map.saveFailed'))
      // Một số tủ có thể đã lưu thành công, tải lại để hiển thị đúng dữ liệu thật
      setReloadKey((n) => n + 1)
      return
    }

    setLockers((prev) =>
      prev.map((item) => {
        if (groupKey(item) !== key) return item
        const building =
          addressChanged && item.buildingId ? { ...item.buildingId, address: payload.address } : item.buildingId
        return item._id === editing._id
          ? { ...item, buildingId: building, coordinates, locationDescription: payload.locationDescription }
          : { ...item, buildingId: building, coordinates }
      }),
    )
    toast.success(t('map.savedToast', { code: editing.code }))
    setFlyTarget({ lat: payload.lat, lng: payload.lng, id: key })
    setSelectedId(editing._id)
    closeEdit()
  }

  const detail = lockers.find((l) => l._id === detailId) ?? null
  const showDrawer = detail !== null && !isPicking

  const draftLatNum = parseCoord(draftLat, -90, 90)
  const draftLngNum = parseCoord(draftLng, -180, 180)
  const showDraftPin = editing !== null && draftLatNum !== null && draftLngNum !== null

  const title = isSuperAdmin ? t('map.titleAll') : t('map.titleBuilding')
  const subtitle = loading
    ? t('map.subtitleLoading')
    : t('map.subtitle', { count: lockers.length, online: counts.ONLINE })

  return (
    <div className="relative -m-4 h-[calc(100%+2rem)] overflow-hidden sm:-m-6 sm:h-[calc(100%+3rem)] lg:-m-8 lg:h-[calc(100%+4rem)]">
      <div className={`lm-map absolute inset-0 isolate ${isPicking ? 'is-picking' : ''} ${showDrawer ? 'has-drawer' : ''}`}>
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
          <FitToBounds points={routePoints} signal={routeFit} />

          {route && (
            <>
              <Polyline positions={route.result.coords} pathOptions={{ color: '#ffffff', weight: 9, opacity: 0.9 }} />
              <Polyline
                positions={route.result.coords}
                pathOptions={{ color: '#2563eb', weight: 5, dashArray: route.result.source === 'straight' ? '8 8' : undefined }}
              />
            </>
          )}
          {myPos && (
            <>
              <Circle center={[myPos.lat, myPos.lng]} radius={myPos.accuracy} pathOptions={{ color: '#2563eb', weight: 1, fillOpacity: 0.08 }} />
              <Marker position={[myPos.lat, myPos.lng]} icon={MY_LOCATION_ICON} zIndexOffset={900} title={t('map2.youAreHere')} />
            </>
          )}
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

          {groups.map((g) => {
            const hasIssue = g.lockers.some((l) => activeIssuesByCode.has(l.code))
            const selected = g.lockers.some((l) => l._id === selectedId)
            return (
              <Marker
                key={g.key}
                position={g.position}
                icon={getLockerIcon(statusMeta(g.status).hex, selected, hasIssue, g.lockers.length)}
                ref={(ref) => {
                  if (ref) markerRefs.current[g.key] = ref
                  else delete markerRefs.current[g.key]
                }}
                eventHandlers={{ click: () => setSelectedId(g.lockers[0]._id) }}
              >
                <Popup className="lm-popup" minWidth={272} maxWidth={272} closeButton>
                  <GroupPopup
                    group={g}
                    issuesByCode={activeIssuesByCode}
                    onEdit={(id) => {
                      const target = lockers.find((l) => l._id === id)
                      if (target) openEdit(target)
                    }}
                    onOpenDetail={(code) => {
                      const target = lockers.find((l) => l.code === code)
                      if (!target) return
                      setSelectedId(target._id)
                      setDetailId(target._id)
                    }}
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
          onClick={() => void handleLocateMe()}
          title={t('map2.myLocation')}
          disabled={navBusy !== null}
          className={`${floatingBtn} ${myPos ? '!text-blue-600' : ''}`}
        >
          {navBusy === 'locating' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        </button>
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

      {showDrawer && detail && (
        <LockerDetailDrawer
          key={detail._id}
          locker={detail}
          issueCount={activeIssuesByCode.get(detail.code)?.length ?? 0}
          myPos={myPos}
          route={route?.lockerId === detail._id ? route.result : null}
          navBusy={navBusy}
          onClose={() => setDetailId(null)}
          onEdit={() => openEdit(detail)}
          onDirections={() => void handleDirections(detail)}
          onClearRoute={() => setRoute(null)}
          onOpenFull={() => navigate(`/lockers/${encodeURIComponent(detail.code)}`)}
          onOpenIssues={() => navigate('/issues')}
        />
      )}

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
          orgName={editing.buildingId?.name ?? ''}
          siblingCount={lockers.filter((l) => groupKey(l) === groupKey(editing)).length}
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
