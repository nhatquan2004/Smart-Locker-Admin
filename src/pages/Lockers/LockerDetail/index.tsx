import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLockerStationById } from '../../../service/lockerStation.service'
import type { TCompartment, TLockerStation } from '../../../types/lockerStation.type'
import { AppButton } from '../../../components/common'
import { useTranslation } from '../../../context/LanguageContext'

export function LockerDetailPage() {
  const navigate = useNavigate()
  const { lockerId } = useParams()
  const { t } = useTranslation()

  const [station, setStation] = useState<TLockerStation | null>(null)
  const [selectedCompartment, setSelectedCompartment] = useState<TCompartment | null>(null)
  const [unlockMessage, setUnlockMessage] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)

  useEffect(() => {
    getLockerStationById(lockerId || 'station-001').then((res) => {
      if (res) {
        setStation(res)
        if (res.compartments.length > 0) {
          setSelectedCompartment(res.compartments[0])
        }
      }
    })
  }, [lockerId])

  function handleRemoteUnlock(compCode: string) {
    setIsUnlocking(true)
    setUnlockMessage('')
    setTimeout(() => {
      setIsUnlocking(false)
      setUnlockMessage(`✓ ${t('lockers.unlockLocker')} ${compCode} ${t('common.success')} (RS485 ACK)!`)
      setTimeout(() => setUnlockMessage(''), 4000)
    }, 600)
  }

  if (!station) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1250px]">

      {/* Hero */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="relative z-10 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/lockers')}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-sky-600 dark:text-sky-400 hover:underline mb-3 transition-colors cursor-pointer"
          >
            ← {t('common.back')}
          </button>

          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-mono text-sky-800 dark:text-sky-300 font-bold bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
              {station.code}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">{station.orgName}</span>
          </div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight truncate">{station.name}</h1>
          <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">📍 {station.location}</p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate(`/lockers/${station.id}/hardware`)}
            className="btn-sec-custom h-10 px-4 rounded-xl text-[13px] font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1.5"
          >
            🔧 {t('lockers.hardwareSensors')}
          </button>
        </div>
      </section>

      {/* Main Layout: Physical Locker Rack (Left) & Inspector Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Col: Interactive Physical Cabinet Rack Simulation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="setting-card-custom p-6 rounded-2xl shadow-xs flex flex-col gap-5 border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                  Interactive Rack View
                </span>
                <h2 className="setting-title-custom text-[16px] font-bold mt-1.5">{t('lockers.title')}</h2>
              </div>

              {/* Status Legend with Guaranteed High-Contrast Text Color */}
              <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0 shadow-2xs" />
                  <span>{t('lockers.statusAvailable')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-sky-500 shrink-0 shadow-2xs" />
                  <span>{t('lockers.statusOccupied')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-red-500 shrink-0 shadow-2xs" />
                  <span>{t('lockers.statusMaintenance')}</span>
                </span>
              </div>
            </div>

            {/* Cabinet Physical Frame Box */}
            <div className="p-5 rounded-2xl bg-slate-900 dark:bg-slate-950 border-4 border-slate-800 shadow-inner flex flex-col gap-4">
              <div className="flex items-center justify-between text-white text-[11px] font-mono px-2">
                <span className="font-bold tracking-wider text-slate-300">MASTER CONTROL PANEL</span>
                <span className="text-emerald-400 font-bold">MCU: {station.masterController.temperatureCelsius}°C · ONLINE</span>
              </div>

              {/* Locker Doors Rack Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {station.compartments.map((comp) => {
                  const isSelected = selectedCompartment?.id === comp.id
                  const isAvailable = comp.status === 'available'
                  const isOccupied = comp.status === 'occupied'

                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => setSelectedCompartment(comp)}
                      className={[
                        "flex flex-col items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden select-none",
                        comp.size === 'large' ? "min-h-[140px]" : comp.size === 'medium' ? "min-h-[110px]" : "min-h-[90px]",
                        isSelected ? "ring-4 ring-sky-400 scale-[1.02]" : "",
                        isAvailable
                          ? "bg-emerald-950/70 border-emerald-500/60 text-emerald-100 hover:bg-emerald-900/80"
                          : isOccupied
                            ? "bg-sky-950/70 border-sky-500/60 text-sky-100 hover:bg-sky-900/80"
                            : "bg-red-950/70 border-red-500/60 text-red-100 hover:bg-red-900/80",
                      ].join(" ")}
                    >
                      {/* Door Code Header */}
                      <div className="flex items-center justify-between w-full text-[11px] font-mono font-bold">
                        <span>{comp.code}</span>
                        <span className="uppercase text-[9px] opacity-80 px-1.5 py-0.5 rounded bg-black/40">{comp.size}</span>
                      </div>

                      {/* Status LED Dot */}
                      <div className="my-2 flex flex-col items-center gap-1">
                        <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse' :
                            isOccupied ? 'bg-sky-400 shadow-md shadow-sky-400/50' : 'bg-red-500 animate-ping'
                          }`} />
                        <span className="text-[11px] font-bold">
                          {isAvailable ? 'VACANT' : isOccupied ? 'OCCUPIED' : 'FAULT'}
                        </span>
                      </div>

                      {/* Lock status indicator at bottom */}
                      <div className="text-[9px] font-mono text-slate-300">
                        {comp.hardwareState.relayLock === 'LOCKED' ? '🔒 Locked' : '🔓 Unlocked'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Selected Compartment Inspector & Remote Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedCompartment ? (
            <div className="setting-card-custom p-6 rounded-2xl shadow-xs flex flex-col gap-5 border sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                    Compartment Inspector
                  </span>
                  <h3 className="setting-title-custom text-[18px] font-bold mt-1.5">{t('common.details')} {selectedCompartment.code}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 capitalize">
                  Size: {selectedCompartment.size}
                </span>
              </div>

              {unlockMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[12px] font-bold leading-relaxed animate-fade-in">
                  {unlockMessage}
                </div>
              )}

              {/* Parcel / Shipment Info if Occupied */}
              {selectedCompartment.currentShipment ? (
                <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-300">{t('shipments.title')}</span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">{selectedCompartment.currentShipment.storedAt}</span>
                  </div>
                  <p className="text-[15px] font-bold text-slate-900 dark:text-white">{selectedCompartment.currentShipment.recipientName}</p>
                  <p className="text-[12px] font-mono text-slate-700 dark:text-slate-300 font-semibold">SĐT: {selectedCompartment.currentShipment.recipientPhone}</p>
                  <div className="pt-2 border-t border-sky-200/60 dark:border-sky-800/60 flex items-center justify-between text-[12px]">
                    <span className="setting-desc-custom">OTP:</span>
                    <span className="font-mono font-bold text-sky-800 dark:text-sky-300 text-[14px]">{selectedCompartment.currentShipment.otpCode || '----'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl setting-input-custom text-center text-[12px] font-bold">
                  <span>{t('lockers.statusAvailable')}</span>
                </div>
              )}

              {/* Hardware Sensors Status */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[12px] font-mono font-bold setting-desc-custom uppercase">{t('lockers.hardwareSensors')}</h4>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="p-2.5 rounded-xl setting-input-custom flex flex-col gap-1">
                    <span className="text-[10px] opacity-70 font-mono">{t('lockers.relayState')}</span>
                    <span className={`font-bold font-mono ${selectedCompartment.hardwareState.relayLock === 'LOCKED' ? 'setting-title-custom' : 'text-amber-500'}`}>
                      {selectedCompartment.hardwareState.relayLock}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl setting-input-custom flex flex-col gap-1">
                    <span className="text-[10px] opacity-70 font-mono">{t('lockers.irSensor')}</span>
                    <span className="font-bold font-mono setting-title-custom">
                      {selectedCompartment.hardwareState.irObjectSensor}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl setting-input-custom flex flex-col gap-1">
                    <span className="text-[10px] opacity-70 font-mono">{t('lockers.doorStatus')}</span>
                    <span className="font-bold font-mono setting-title-custom">
                      {selectedCompartment.hardwareState.doorSwitch}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl setting-input-custom flex flex-col gap-1">
                    <span className="text-[10px] opacity-70 font-mono">{t('lockers.battery')}</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {selectedCompartment.hardwareState.voltage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remote Control Button */}
              <div className="pt-2">
                <AppButton
                  className="w-full h-11"
                  disabled={isUnlocking}
                  onClick={() => handleRemoteUnlock(selectedCompartment.code)}
                >
                  {isUnlocking ? t('common.saving') : `🔓 ${t('lockers.unlockLocker')} ${selectedCompartment.code}`}
                </AppButton>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl setting-card-custom text-center setting-desc-custom text-[13px]">
              {t('lockers.desc')}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
