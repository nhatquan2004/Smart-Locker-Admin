import { useEffect, useMemo, useState } from "react";
import { SettingInputItem } from "../../components/Settings/SettingInputItem";
import { SettingToggleItem } from "../../components/Settings/SettingToggleItem";
import { useTranslation } from "../../context/LanguageContext";
import type { TranslationKey } from "../../i18n/translations";
import {
  getSettingsOverview,
  getSettingsStats,
} from "../../service/settings.service";
import type {
  TSettingsOverview,
  TSettingRow,
  TSettingSection,
  TSettingStatItem,
  TSettingValue,
} from "../../types/settings.type";

const tabCategoryIcons: Record<string, React.ReactNode> = {
  "otp-settings": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.778-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  ),
  "locker-settings": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  ),
  "locker-configuration": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  ),
  "hardware-settings": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  "notification-settings": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  "system-preferences": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
    </svg>
  ),
};

const sectionTitleMap: Record<string, TranslationKey> = {
  'otp-settings': 'settings.tabOtp',
  'locker-settings': 'settings.tabLocker',
  'locker-configuration': 'settings.tabLocker',
  'hardware-settings': 'settings.tabHardware',
  'notification-settings': 'settings.tabNotification',
  'system-preferences': 'settings.tabPreferences',
};

const rowLabelMap: Record<string, TranslationKey> = {
  'otp-expiry': 'settings.otpExpiryLabel',
  'otp-retry': 'settings.otpRetryLabel',
  'otp-regenerate': 'settings.otpRegenerateLabel',
  'cluster-count': 'settings.activeClustersLabel',
  'default-timeout': 'settings.unlockTimeoutLabel',
  'remote-unlock': 'settings.remoteUnlockLabel',
  'heartbeat-interval': 'settings.heartbeatLabel',
  'device-timeout': 'settings.deviceTimeoutLabel',
  'auto-refresh': 'settings.autoRefreshLabel',
  'shipment-alerts': 'settings.shipmentAlertsLabel',
  'admin-logs': 'settings.adminLogsLabel',
  'device-error-alerts': 'settings.deviceErrorAlertsLabel',
  'language': 'settings.languageLabel',
  'timezone': 'settings.timezoneLabel',
  'dark-surface': 'settings.darkSurfaceLabel',
};

const rowDescMap: Record<string, TranslationKey> = {
  'otp-expiry': 'settings.otpExpiryDesc',
  'otp-retry': 'settings.otpRetryDesc',
  'otp-regenerate': 'settings.otpRegenerateDesc',
  'cluster-count': 'settings.activeClustersDesc',
  'default-timeout': 'settings.unlockTimeoutDesc',
  'remote-unlock': 'settings.remoteUnlockDesc',
  'heartbeat-interval': 'settings.heartbeatDesc',
  'device-timeout': 'settings.deviceTimeoutDesc',
  'auto-refresh': 'settings.autoRefreshDesc',
  'shipment-alerts': 'settings.shipmentAlertsDesc',
  'admin-logs': 'settings.adminLogsDesc',
  'device-error-alerts': 'settings.deviceErrorAlertsDesc',
  'language': 'settings.languageDesc',
  'timezone': 'settings.timezoneDesc',
  'dark-surface': 'settings.darkSurfaceDesc',
};

const unitMap: Record<string, TranslationKey> = {
  'GIÂY': 'settings.unitSeconds',
  'LẦN': 'settings.unitTimes',
};

function buildInitialValues(sections: TSettingSection[]) {
  const values: Record<string, TSettingValue> = {};
  sections.forEach((section) => {
    section.rows.forEach((row) => {
      if (row.type === "toggle") {
        values[row.id] = row.enabled;
      } else {
        values[row.id] = row.value;
      }
    });
  });
  return values;
}

function getSectionDirty(
  section: TSettingSection,
  currentValues: Record<string, TSettingValue>,
) {
  return section.rows.some((row) => {
    const original = row.type === "toggle" ? row.enabled : row.value;
    return currentValues[row.id] !== original;
  });
}

function validateRow(row: TSettingRow, value: TSettingValue) {
  if (row.type === "toggle") return false;
  if (row.inputKind === "number") {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return true;
    if (typeof row.min === "number" && numeric < row.min) return true;
    if (typeof row.max === "number" && numeric > row.max) return true;
  }
  return false;
}

export function SettingsPage() {
  const { t } = useTranslation();
  const [, setStats] = useState<TSettingStatItem[]>([]);
  const [overview, setOverview] = useState<TSettingsOverview | null>(null);
  const [values, setValues] = useState<Record<string, TSettingValue>>({});
  const [activeTabId, setActiveTabId] = useState<string>("otp-settings");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  useEffect(() => {
    getSettingsStats().then(setStats);
    getSettingsOverview().then((data) => {
      setOverview(data);
      setValues(buildInitialValues(data.sections));
      if (data.sections.length > 0) {
        setActiveTabId(data.sections[0].id);
      }
    });
  }, []);

  const activeSection = useMemo(() => {
    return overview?.sections.find((s) => s.id === activeTabId) ?? overview?.sections[0];
  }, [overview, activeTabId]);

  const sectionDirtyMap = useMemo(() => {
    const result: Record<string, boolean> = {};
    overview?.sections.forEach((section) => {
      result[section.id] = getSectionDirty(section, values);
    });
    return result;
  }, [overview, values]);

  const hasAnyUnsavedChanges = useMemo(
    () => Object.values(sectionDirtyMap).some(Boolean),
    [sectionDirtyMap],
  );

  const invalidMap = useMemo(() => {
    const result: Record<string, boolean> = {};
    overview?.sections.forEach((section) => {
      section.rows.forEach((row) => {
        result[row.id] = validateRow(row, values[row.id]);
      });
    });
    return result;
  }, [overview, values]);

  function handleValueChange(id: string, value: TSettingValue) {
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  function handleSaveActiveSection() {
    if (!activeSection || !overview) return;
    setIsSaving(true);

    window.setTimeout(() => {
      const nextSections = overview.sections.map((item) => {
        if (item.id !== activeSection.id) return item;

        return {
          ...item,
          rows: item.rows.map((row) => {
            if (row.type === "toggle") {
              return {
                ...row,
                enabled: Boolean(values[row.id]),
              };
            }
            return {
              ...row,
              value: String(values[row.id]),
            };
          }),
        };
      });

      setOverview({
        ...overview,
        sections: nextSections,
      });

      setIsSaving(false);
      setSaveSuccessMsg(t('settings.successMsg'));
      setTimeout(() => setSaveSuccessMsg(""), 3500);
    }, 500);
  }

  function handleResetAll() {
    if (!overview) return;
    setValues(buildInitialValues(overview.sections));
  }

  if (!overview || !activeSection) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>{t('settings.loadingConfig')}</p>
      </div>
    );
  }

  const activeSectionTitle = sectionTitleMap[activeSection.id] ? t(sectionTitleMap[activeSection.id]) : activeSection.title;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px]">

      {/* Header Banner */}
      <section data-reveal className="relative overflow-hidden rounded-2xl glass-card hero-gradient p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs border border-slate-200">
        <div className="relative z-10 flex-1 min-w-0">
          <p className="eyebrow mb-1">{t('settings.systemControlCenter')}</p>
          <h1 className="text-[22px] font-bold text-slate-900 leading-tight">
            {t('settings.title')}
          </h1>
          <p className="mt-1 text-[13px] text-slate-600 leading-relaxed max-w-lg">
            {t('settings.desc')}
          </p>
        </div>

        {/* Live System Status Pill */}
        <div className="stat-pill relative z-10 flex items-center gap-2.5 p-3 rounded-xl border shrink-0 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold">{t('settings.engineStatus')}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{t('settings.operational')}</span>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[13px] font-bold leading-relaxed shadow-2xs animate-fade-in">
          {saveSuccessMsg}
        </div>
      )}

      {/* Modern Segmented Control Tab Bar */}
      <div data-reveal className="p-1.5 rounded-2xl glass-card shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {overview.sections.map((sec) => {
          const isActive = sec.id === activeTabId;
          const isDirty = sectionDirtyMap[sec.id];
          const icon = tabCategoryIcons[sec.id] ?? tabCategoryIcons["otp-settings"];
          const title = sectionTitleMap[sec.id] ? t(sectionTitleMap[sec.id]) : sec.title;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveTabId(sec.id)}
              className={[
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-sky-600 text-white shadow-xs font-bold border border-sky-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent",
              ].join(" ")}
            >
              <span className={isActive ? "text-white" : "text-sky-600"}>{icon}</span>
              <span>{title}</span>
              {isDirty && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Section Config Card Form */}
      <div data-reveal className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-sky-800 dark:text-sky-300 font-bold bg-sky-100 dark:bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-200 dark:border-sky-800 uppercase">
              {activeSection.badge}
            </span>
            <h2 className="text-[18px] font-bold text-slate-900 dark:text-white mt-2">{activeSectionTitle}</h2>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-0.5">
              {rowDescMap[activeSection.id] ? t(rowDescMap[activeSection.id]) : activeSection.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveActiveSection}
              disabled={!sectionDirtyMap[activeSection.id] || isSaving}
              className="h-9 px-4 rounded-xl text-[12px] font-bold bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
              </svg>
              {isSaving ? t('common.saving') : t('settings.btnSave')}
            </button>
          </div>
        </div>

        {/* Section Rows List */}
        <div className="flex flex-col gap-4 divide-y divide-slate-100 dark:divide-slate-800">
          {activeSection.rows.map((row) => {
            const label = rowLabelMap[row.id] ? t(rowLabelMap[row.id]) : row.label;
            const description = rowDescMap[row.id] ? t(rowDescMap[row.id]) : row.description;
            const rawUnit = row.type === 'input' ? row.unit : undefined;
            const unit = rawUnit && unitMap[rawUnit] ? t(unitMap[rawUnit]) : rawUnit;

            return (
              <div key={row.id} className="pt-4 first:pt-0">
                {row.type === "toggle" ? (
                  <SettingToggleItem
                    icon={row.icon}
                    label={label}
                    description={description}
                    enabled={Boolean(values[row.id])}
                    onChange={(val) => handleValueChange(row.id, val)}
                  />
                ) : (
                  <SettingInputItem
                    icon={row.icon}
                    label={label}
                    description={description}
                    value={String(values[row.id] ?? "")}
                    unit={unit}
                    invalid={invalidMap[row.id]}
                    inputKind={row.inputKind ?? "text"}
                    options={row.options}
                    onChange={(val) => handleValueChange(row.id, val)}
                  />
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Floating Save Bar on changes */}
      {hasAnyUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center justify-between gap-6 px-6 py-4 rounded-2xl border border-sky-300 bg-white/95 shadow-2xl backdrop-blur-md animate-fade-in">
          <span className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            {t('settings.unsavedChanges')}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetAll}
              className="h-9 px-4 rounded-xl text-[12px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            >
              {t('settings.btnRestore')}
            </button>
            <button
              type="button"
              onClick={handleSaveActiveSection}
              className="h-9 px-5 rounded-xl text-[12px] font-bold bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-md shadow-sky-600/20 cursor-pointer flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              </svg>
              {t('settings.btnSaveConfig')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
