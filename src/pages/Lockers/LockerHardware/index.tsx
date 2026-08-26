import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppButton } from '../../../components/common'

export function LockerHardwarePage() {
  const navigate = useNavigate()
  const { lockerId } = useParams()

  const [testResult, setTestResult] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  const hardwareMock = useMemo(() => {
    return {
      lockerId,
      lockerCode: `STATION-${lockerId?.slice(0, 8) ?? 'ST-001'}`,
      controller: 'Industrial Gateway MCU RS485 / ESP32-S3',
      relayModule: '16-Channel Solenoid Relay Board',
      reedSwitch: 'Reed Magnetic Door Sensor Array',
      irSensor: 'IR Infrared Parcel Detection Board',
      powerSupply: 'DC 12V / 10A Switched Mode',
      networkStatus: 'ONLINE (RS485 Modbus RTU)',
      ping: '18 ms',
      lastHeartbeat: 'vừa xong',
      firmwareVersion: 'v2.4.12-pro',
      voltage: '12.1V DC (Stable)',
      temperature: '27.4°C',
    }
  }, [lockerId])

  function handleTestHardware(actionName: string) {
    setIsTesting(true)
    setTestResult('')
    setTimeout(() => {
      setIsTesting(false)
      setTestResult(`✓ Đã kích hoạt lệnh [${actionName}] thành công. Bo mạch phản hồi RS485 ACK 200 OK!`)
      setTimeout(() => setTestResult(''), 4000)
    }, 600)
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Hero */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="relative z-10 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-sky-600 hover:text-sky-700 mb-3 transition-colors cursor-pointer"
          >
            ← Quay lại Sơ Đồ Cụm Tủ
          </button>

          <p className="eyebrow mb-1">Hardware & Sensor Monitor</p>
          <h1 className="text-[22px] font-bold text-slate-900 leading-tight truncate">
            Giám Sát Phần Cứng Realtime · {hardwareMock.lockerCode}
          </h1>
          <p className="mt-1 text-[13px] text-slate-600 leading-relaxed max-w-lg">
            Theo dõi bo mạch MCU RS485, rơ-le khóa điện từ 12V, mảng cảm biến hồng ngoại IR và công tắc hành trình cửa.
          </p>
        </div>

        <div className="relative z-10 shrink-0 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="eyebrow text-emerald-800 font-bold">Network Sensor Status</span>
          </div>
          <p className="text-[20px] font-bold text-emerald-900 leading-none font-mono">
            ONLINE 100%
          </p>
          <p className="mt-1 text-[11px] font-mono text-emerald-700">
            Ping: {hardwareMock.ping} • RS485 Modbus
          </p>
        </div>
      </section>

      {testResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[13px] font-bold leading-relaxed shadow-2xs animate-fade-in">
          {testResult}
        </div>
      )}

      {/* Hardware Monitoring Grid */}
      <section data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Controller Card */}
        <article className="flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs">
          <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-3">Bo điều khiển trung tâm</h2>
          <div className="flex flex-col divide-y divide-slate-100 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">MCU Controller</span>
              <span className="font-semibold text-slate-900 font-mono text-[12px]">{hardwareMock.controller}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Firmware Version</span>
              <span className="font-mono text-sky-700 font-bold">{hardwareMock.firmwareVersion}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Nhiệt độ MCU</span>
              <span className="font-mono text-emerald-700 font-bold">{hardwareMock.temperature}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Nguồn cấp DC</span>
              <span className="font-mono text-slate-800 font-bold">{hardwareMock.voltage}</span>
            </div>
          </div>
        </article>

        {/* Actuators Card */}
        <article className="flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs">
          <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-3">Bo mạch Relay & Khóa</h2>
          <div className="flex flex-col divide-y divide-slate-100 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Relay Module</span>
              <span className="text-slate-900 font-medium">{hardwareMock.relayModule}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Loại khóa điện từ</span>
              <span className="text-slate-900 font-medium">12V Solenoid Push Lock</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Chuẩn giao tiếp</span>
              <span className="font-mono text-sky-700 font-bold">RS485 Industrial Bus</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Trạng thái Relay</span>
              <span className="font-mono text-emerald-700 font-bold">ACK 200 OK</span>
            </div>
          </div>
        </article>

        {/* Sensors Card */}
        <article className="flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs">
          <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-3">Mảng cảm biến IoT</h2>
          <div className="flex flex-col divide-y divide-slate-100 text-[13px]">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Cảm biến hồng ngoại IR</span>
              <span className="font-bold text-emerald-700 font-mono">HOẠT ĐỘNG (OK)</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Công tắc từ cửa (Reed)</span>
              <span className="font-bold text-emerald-700 font-mono">HOẠT ĐỘNG (OK)</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Mạch bảo vệ quá dòng</span>
              <span className="font-bold text-slate-900 font-mono">ACTIVE (10A max)</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 font-medium">Cảnh báo báo động</span>
              <span className="font-mono text-slate-500">Không có cảnh báo</span>
            </div>
          </div>
        </article>

        {/* Test Control Toolbar */}
        <article className="md:col-span-3 flex flex-col gap-4 p-6 rounded-2xl glass-card shadow-xs">
          <h2 className="text-[15px] font-bold text-slate-900">Bảng điều khiển kiểm thử phần cứng (Hardware Test Tools)</h2>
          <div className="flex flex-wrap gap-3">
            <AppButton
              disabled={isTesting}
              onClick={() => handleTestHardware('PING MCU RS485 BOARD')}
            >
              ⚡ Test Ping Board Gateway
            </AppButton>
            <AppButton
              variant="secondary"
              disabled={isTesting}
              onClick={() => handleTestHardware('RESET IR SENSOR ARRAY')}
            >
              🔄 Reset Mảng Cảm Biến IR
            </AppButton>
            <AppButton
              variant="secondary"
              disabled={isTesting}
              onClick={() => handleTestHardware('CHECK RELAY VOLTAGE 12V')}
            >
              🔋 Kiểm Tra Nguồn DC 12V
            </AppButton>
          </div>
        </article>

      </section>

    </div>
  )
}
