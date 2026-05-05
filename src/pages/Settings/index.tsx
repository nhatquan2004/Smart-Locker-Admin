import { useEffect, useMemo, useState } from "react";
import { SettingInputItem } from "../../components/Settings/SettingInputItem";
import { SettingSectionCard } from "../../components/Settings/SettingSectionCard";
import { SettingStatCard } from "../../components/Settings/SettingStatCard";
import { SettingToggleItem } from "../../components/Settings/SettingToggleItem";
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
import styles from "./Settings.module.css";

type TSectionSavingState = Record<string, "idle" | "saving" | "saved">;

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let progress = 0;
    const step = 16 / duration;

    const timer = window.setInterval(() => {
      progress += step;
      if (progress >= 1) {
        progress = 1;
        window.clearInterval(timer);
      }

      setValue(Math.round(target * progress));
    }, 16);

    return () => window.clearInterval(timer);
  }, [target, duration]);

  return value;
}

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
  const [stats, setStats] = useState<TSettingStatItem[]>([]);
  const [overview, setOverview] = useState<TSettingsOverview | null>(null);
  const [values, setValues] = useState<Record<string, TSettingValue>>({});
  const [savingState, setSavingState] = useState<TSectionSavingState>({});
  const [activeSectionId, setActiveSectionId] = useState("otp-settings");

  useEffect(() => {
    getSettingsStats().then(setStats);
    getSettingsOverview().then((data) => {
      setOverview(data);
      setValues(buildInitialValues(data.sections));
    });
  }, []);

  useEffect(() => {
    const sections = overview?.sections ?? [];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveSectionId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0.2, 0.35, 0.5],
      },
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [overview]);

  const totalSections = useCountUp(overview?.sections.length ?? 0);
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

  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleSaveSection(section: TSettingSection) {
    setSavingState((prev) => ({
      ...prev,
      [section.id]: "saving",
    }));

    window.setTimeout(() => {
      if (!overview) return;

      const nextSections = overview.sections.map((item) => {
        if (item.id !== section.id) return item;

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

      setSavingState((prev) => ({
        ...prev,
        [section.id]: "saved",
      }));

      window.setTimeout(() => {
        setSavingState((prev) => ({
          ...prev,
          [section.id]: "idle",
        }));
      }, 1500);
    }, 900);
  }

  function handleSaveAll() {
    overview?.sections.forEach((section, index) => {
      window.setTimeout(() => {
        handleSaveSection(section);
      }, index * 120);
    });
  }

  function handleResetAll() {
    if (!overview) return;
    setValues(buildInitialValues(overview.sections));
  }

  return (
    <div className={styles.page}>
      <section className={`${styles.reveal} ${styles.hero}`}>
        <div className={styles.heroGlow}></div>

        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>System settings</span>
          <h1 className={styles.title}>Cấu hình hệ thống Smart Locker</h1>
          <p className={styles.description}>
            Quản lý OTP, locker, phần cứng, cảnh báo và tuỳ chọn hệ thống trong
            một nơi duy nhất.
          </p>
        </div>

        <div className={styles.heroAside}>
          <div className={styles.heroBadgeCard}>
            <span className={styles.heroBadgeIcon}>⚙️</span>
            <span className={styles.heroBadgeLabel}>Setting Sections</span>
            <strong className={styles.heroBadgeValue}>{totalSections}</strong>
            <p className={styles.heroBadgeText}>
              Nhóm cấu hình đang có sẵn trong trang quản trị
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.reveal} ${styles.statsGrid}`}>
        {stats.map((item) => (
          <SettingStatCard
            key={item.id}
            item={item}
            onClick={scrollToSection}
          />
        ))}
      </section>

      <div className={styles.contentWrap}>
        <section className={styles.sectionGrid}>
          {overview?.sections.map((section, index) => {
            const hasUnsavedChanges = sectionDirtyMap[section.id];
            const isSaving = savingState[section.id] === "saving";
            const isSaved = savingState[section.id] === "saved";
            const sectionHasInvalid = section.rows.some(
              (row) => invalidMap[row.id],
            );

            return (
              <div
                id={section.id}
                key={section.id}
                className={`${styles.reveal} ${styles.sectionItem}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <SettingSectionCard
                  title={section.title}
                  description={section.description}
                  badge={section.badge}
                  hasUnsavedChanges={hasUnsavedChanges}
                  isSaving={isSaving}
                  isSaved={isSaved}
                  canSave={hasUnsavedChanges && !sectionHasInvalid}
                  onSave={() => handleSaveSection(section)}
                >
                  {section.rows.map((row) =>
                    row.type === "toggle" ? (
                      <SettingToggleItem
                        key={row.id}
                        icon={row.icon}
                        label={row.label}
                        description={row.description}
                        enabled={Boolean(values[row.id])}
                        onChange={(value) => handleValueChange(row.id, value)}
                      />
                    ) : (
                      <SettingInputItem
                        key={row.id}
                        icon={row.icon}
                        label={row.label}
                        description={row.description}
                        value={String(values[row.id] ?? "")}
                        unit={row.unit}
                        invalid={invalidMap[row.id]}
                        inputKind={row.inputKind ?? "text"}
                        options={row.options}
                        onChange={(value) => handleValueChange(row.id, value)}
                      />
                    ),
                  )}
                </SettingSectionCard>
              </div>
            );
          })}
        </section>

        {overview ? (
          <aside className={styles.anchorNav}>
            {overview.sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`${styles.anchorItem} ${
                  activeSectionId === section.id ? styles.anchorItemActive : ""
                }`}
                onClick={() => scrollToSection(section.id)}
              >
                {section.title
                  .replace(" Settings", "")
                  .replace(" Configuration", "")}
              </button>
            ))}
          </aside>
        ) : null}
      </div>

      {hasAnyUnsavedChanges ? (
        <div className={styles.saveBar}>
          <span className={styles.saveBarText}>Bạn có thay đổi chưa lưu</span>

          <div className={styles.saveBarActions}>
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleResetAll}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className={styles.saveAllButton}
              onClick={handleSaveAll}
            >
              💾 Lưu tất cả
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
