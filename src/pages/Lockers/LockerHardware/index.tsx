import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Radio, DoorOpen, Terminal, Play, RefreshCw } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────
type SensorStatus = 'ok' | 'error' | 'idle' | 'testing'
type LogLevel = 'info' | 'success' | 'error' | 'warn'

interface LogEntry {
  id: number
  ts: string
  level: LogLevel
  msg: string
}

interface SensorState {
  status: SensorStatus
  value: string
  lastTested: string
}

// ─── Mock API calls (swap these for real WebSocket/REST later) ─
async function apiTestSolenoid(_compartmentId: string): Promise<string> {
  // TODO: POST /api/hardware/relay/open { compartmentId, durationMs: 300 }
  await new Promise(r => setTimeout(r, 800))
  return 'RELAY_ACK 200 OK — Solenoid mở 300ms, tự đóng lại.'
}

async function apiReadIR(_compartmentId: string): Promise<string> {
  // TODO: GET /api/hardware/sensor/ir/:compartmentId
  await new Promise(r => setTimeout(r, 500))
  const raw = Math.random() > 0.3 ? 'LOW' : 'HIGH'
  return `IR_READ OK — Raw: ${raw} (${raw === 'LOW' ? 'Không có vật thể' : 'Phát hiện vật thể trong ngăn'})`
}

async function apiReadDoorSwitch(_compartmentId: string): Promise<string> {
  // TODO: GET /api/hardware/sensor/door/:compartmentId
  await new Promise(r => setTimeout(r, 500))
  const state = Math.random() > 0.5 ? 'CLOSED' : 'OPEN'
  return `DOOR_SWITCH OK — State: ${state} (${state === 'CLOSED' ? 'Cửa đóng ✓' : 'Cửa đang mở ⚠'})`
}

// ─── Component ───────────────────────────────────────────────
export function LockerHardwarePage() {
  const navigate = useNavigate()
  const { lockerId } = useParams()
  const stationLabel = lockerId ?? 'ST-001'

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 0, ts: now(), level: 'info', msg: 'Bảng test phần cứng đã sẵn sàng. Chọn một ngăn và chạy lệnh kiểm thử.' },
  ])
  const [selectedSlot, setSelectedSlot] = useState('A01')

  const [solenoid, setSolenoid] = useState<SensorState>({ status: 'idle', value: '—', lastTested: '—' })
  const [ir, setIr] = useState<SensorState>({ status: 'idle', value: '—', lastTested: '—' })
  const [door, setDoor] = useState<SensorState>({ status: 'idle', value: '—', lastTested: '—' })

  const slots = ['A01', 'A02', 'A03', 'B01', 'B02', 'B03']

  const pushLog = useCallback((level: LogLevel, msg: string) => {
    setLogs(prev => [...prev.slice(-49), { id: Date.now(), ts: now(), level, msg }])
  }, [])

  async function testSolenoid() {
    setSolenoid(p => ({ ...p, status: 'testing' }))
    pushLog('info', `[SOLENOID] Kích hoạt ngăn ${selectedSlot} — gửi lệnh OPEN relay...`)
    try {
      const result = await apiTestSolenoid(selectedSlot)
      setSolenoid({ status: 'ok', value: 'ACK 200 OK', lastTested: now() })
      pushLog('success', `[SOLENOID] ✓ ${result}`)
    } catch {
      setSolenoid({ status: 'error', value: 'NACK ERROR', lastTested: now() })
      pushLog('error', '[SOLENOID] ✗ Không nhận được phản hồi từ bo mạch relay.')
    }
  }

  async function testIR() {
    setIr(p => ({ ...p, status: 'testing' }))
    pushLog('info', `[IR SENSOR] Đọc giá trị cảm biến hồng ngoại ngăn ${selectedSlot}...`)
    try {
      const result = await apiReadIR(selectedSlot)
      const hasObject = result.includes('HIGH')
      setIr({ status: 'ok', value: hasObject ? 'HIGH (Có vật thể)' : 'LOW (Trống)', lastTested: now() })
      pushLog('success', `[IR SENSOR] ✓ ${result}`)
    } catch {
      setIr({ status: 'error', value: 'READ ERROR', lastTested: now() })
      pushLog('error', '[IR SENSOR] ✗ Lỗi đọc cảm biến.')
    }
  }

  async function testDoor() {
    setDoor(p => ({ ...p, status: 'testing' }))
    pushLog('info', `[DOOR SWITCH] Đọc trạng thái công tắc từ cửa ngăn ${selectedSlot}...`)
    try {
      const result = await apiReadDoorSwitch(selectedSlot)
      const isClosed = result.includes('CLOSED')
      setDoor({ status: 'ok', value: isClosed ? 'CLOSED (Đóng)' : 'OPEN (Mở)', lastTested: now() })
      pushLog('success', `[DOOR SWITCH] ✓ ${result}`)
    } catch {
      setDoor({ status: 'error', value: 'READ ERROR', lastTested: now() })
      pushLog('error', '[DOOR SWITCH] ✗ Lỗi đọc công tắc cửa.')
    }
  }

  async function runAllTests() {
    pushLog('warn', `══ CHẠY TOÀN BỘ KIỂM THỬ — Ngăn: ${selectedSlot} ══`)
    await testSolenoid()
    await testIR()
    await testDoor()
    pushLog('success', '══ Hoàn tất toàn bộ kiểm thử. ══')
  }

  function clearLogs() {
    setLogs([{ id: Date.now(), ts: now(), level: 'info', msg: 'Console đã được xóa.' }])
  }

  const isTesting = [solenoid, ir, door].some(s => s.status === 'testing')

  return (
    <div className="flex flex-col gap-5 max-w-[1250px]">

      {/* ── Header ── */}
      <section data-reveal className="rounded-2xl glass-card hero-gradient border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-sky-600 dark:text-sky-400 hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Sơ Đồ Cụm Tủ
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded">
              HARDWARE TEST CONSOLE
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{stationLabel}</span>
          </div>
          <h1 className="text-[20px] font-bold text-slate-900 dark:text-white mt-1">Kiểm Thử Phần Cứng Ngăn Tủ</h1>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
            Ổ khóa Solenoid · Cảm biến hồng ngoại IR · Công tắc cửa (Reed Switch)
          </p>
        </div>

        {/* Slot Selector */}
        <div className="shrink-0 flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Chọn ngăn test</span>
          <div className="flex gap-2 flex-wrap">
            {slots.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSlot(s)}
                className={[
                  'h-9 w-14 rounded-lg text-[12px] font-mono font-bold border transition-all cursor-pointer',
                  selectedSlot === s
                    ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 Sensor Cards + Console ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* Left: Sensor Cards */}
        <div className="flex flex-col gap-4">

          {/* Solenoid Lock */}
          <SensorCard
            icon={<Lock className="w-5 h-5" />}
            label="Ổ Khóa Solenoid"
            description={`Kéo relay mở ngăn ${selectedSlot} trong 300ms rồi tự đóng lại`}
            accentColor="blue"
            state={solenoid}
            onTest={testSolenoid}
            disabled={isTesting}
          />

          {/* IR Sensor */}
          <SensorCard
            icon={<Radio className="w-5 h-5" />}
            label="Cảm Biến Hồng Ngoại (IR)"
            description={`Đọc trạng thái phát hiện vật thể trong ngăn ${selectedSlot}`}
            accentColor="amber"
            state={ir}
            onTest={testIR}
            disabled={isTesting}
          />

          {/* Door Switch */}
          <SensorCard
            icon={<DoorOpen className="w-5 h-5" />}
            label="Công Tắc Từ Cửa (Reed Switch)"
            description={`Kiểm tra cửa ngăn ${selectedSlot} đang đóng hay mở`}
            accentColor="emerald"
            state={door}
            onTest={testDoor}
            disabled={isTesting}
          />

          {/* Run All */}
          <button
            onClick={runAllTests}
            disabled={isTesting}
            className="h-11 rounded-xl font-bold text-[13px] bg-sky-600 hover:bg-sky-700 text-white border border-sky-700 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Chạy toàn bộ kiểm thử — Ngăn {selectedSlot}
          </button>
        </div>

        {/* Right: Console Log — sticky so header never cuts off */}
        <div className="lg:sticky lg:top-4 setting-card-custom rounded-2xl border shadow-xs flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '480px' }}>
          {/* Console Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-[12px] font-mono font-bold setting-title-custom">CONSOLE OUTPUT</span>
            </div>
            <button
              onClick={clearLogs}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear
            </button>
          </div>

          {/* Console Body */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11.5px] leading-relaxed bg-slate-950 custom-scrollbar space-y-1">
            {logs.map(entry => (
              <div key={entry.id} className="flex gap-2.5">
                <span className="text-slate-600 shrink-0 select-none">{entry.ts}</span>
                <span className={logColor(entry.level)}>{logPrefix(entry.level)}</span>
                <span className="text-slate-300 break-all">{entry.msg}</span>
              </div>
            ))}
            {isTesting && (
              <div className="flex items-center gap-2 text-sky-400 mt-2">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>Đang gửi lệnh...</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Sub-component: Sensor Card ───────────────────────────────
type AccentColor = 'blue' | 'amber' | 'emerald'

const accentMap: Record<AccentColor, { icon: string; badge: string; dot: string; btn: string }> = {
  blue: {
    icon: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    dot: 'bg-sky-500',
    btn: 'border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    dot: 'bg-amber-500',
    btn: 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    btn: 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950',
  },
}

const statusLabel: Record<SensorStatus, string> = {
  idle: 'CHƯA KIỂM THỬ',
  testing: 'ĐANG KIỂM THỬ...',
  ok: 'HOẠT ĐỘNG ✓',
  error: 'LỖI ✗',
}

const statusDot: Record<SensorStatus, string> = {
  idle: 'bg-slate-400',
  testing: 'bg-sky-400 animate-pulse',
  ok: 'bg-emerald-500',
  error: 'bg-red-500',
}

const statusText: Record<SensorStatus, string> = {
  idle: 'text-slate-500',
  testing: 'text-sky-500',
  ok: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
}

interface SensorCardProps {
  icon: React.ReactNode
  label: string
  description: string
  accentColor: AccentColor
  state: SensorState
  onTest: () => void
  disabled: boolean
}

function SensorCard({ icon, label, description, accentColor, state, onTest, disabled }: SensorCardProps) {
  const c = accentMap[accentColor]
  return (
    <div className="setting-card-custom rounded-2xl border shadow-2xs p-5 flex items-start gap-4">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${c.icon}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="setting-title-custom font-bold text-[14px]">{label}</span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[state.status]}`} />
            {statusLabel[state.status]}
          </span>
        </div>
        <p className="setting-desc-custom text-[12px] mt-0.5 mb-2">{description}</p>

        {/* Value row */}
        <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3.5 py-2 border border-slate-100 dark:border-slate-700 mb-3">
          <div>
            <span className="text-[10px] font-mono setting-desc-custom uppercase font-semibold block">Kết quả đọc</span>
            <span className={`font-mono font-bold text-[13px] ${statusText[state.status]}`}>{state.value}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono setting-desc-custom uppercase font-semibold block">Lần cuối test</span>
            <span className="font-mono text-[12px] setting-title-custom">{state.lastTested}</span>
          </div>
        </div>

        {/* Test button */}
        <button
          onClick={onTest}
          disabled={disabled}
          className={[
            'h-8 px-4 rounded-lg text-[12px] font-bold border transition-all cursor-pointer active:scale-95 disabled:opacity-40 flex items-center gap-1.5',
            c.btn,
          ].join(' ')}
        >
          <Play className="w-3.5 h-3.5" />
          {state.status === 'testing' ? 'Đang test...' : 'Kiểm thử'}
        </button>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────
function now() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function logColor(level: LogLevel) {
  return {
    info: 'text-slate-500 shrink-0',
    success: 'text-emerald-400 shrink-0',
    error: 'text-red-400 shrink-0',
    warn: 'text-amber-400 shrink-0',
  }[level]
}

function logPrefix(level: LogLevel) {
  return {
    info: 'INFO  ',
    success: 'OK    ',
    error: 'ERROR ',
    warn: 'WARN  ',
  }[level]
}
