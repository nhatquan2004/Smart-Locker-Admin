import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useTranslation } from "../../context/LanguageContext";
import lockerLogo from "../../assets/locker.png";

// SVG icons — 18px
const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const IconOrg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18"/>
    <path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/>
    <path d="M9 9h6"/>
    <path d="M9 13h6"/>
    <path d="M9 17h6"/>
  </svg>
);

const IconLockers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="9" y1="3" x2="9" y2="21"/>
    <line x1="15" y1="3" x2="15" y2="21"/>
    <circle cx="6" cy="12" r="1" fill="currentColor"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
    <circle cx="18" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const IconActivity = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const IconShipments = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme_mode");
    if (saved) return saved === "dark";
    return false; // Default to Light Mode if not set
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme_mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme_mode", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const isSuperAdmin = user?.role === "super_admin";

  const { t, language, toggleLanguage } = useTranslation();

  const navGroups = [
    {
      title: "TỔNG QUAN",
      items: [
        { label: t("nav.dashboard"), icon: <IconDashboard />, to: "/dashboard" },
      ],
    },
    {
      title: "QUẢN LÝ",
      items: [
        ...(isSuperAdmin
          ? [{ label: t("nav.organizations"), icon: <IconOrg />, to: "/organizations" }]
          : []),
        { label: t("nav.lockers"), icon: <IconLockers />, to: "/lockers" },
        { label: t("nav.users"), icon: <IconUsers />, to: "/users" },
        { label: t("nav.shipments"), icon: <IconShipments />, to: "/shipments" },
      ],
    },
    {
      title: "HỆ THỐNG",
      items: [
        { label: t("nav.activities"), icon: <IconActivity />, to: "/activities" },
        { label: t("nav.settings"), icon: <IconSettings />, to: "/settings" },
      ],
    },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "SA";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-[#1e293b] dark:text-slate-100">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* ── TOP HEADER (Full Width 1-Row Header) ── */}
      <header className="top-navbar sticky top-0 z-[1010] h-16 px-4 lg:px-6 flex items-center justify-between border-b backdrop-blur-md shadow-2xs transition-colors duration-200">
        {/* Left: Brand + Scope Selector */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <IconClose /> : <IconMenu />}
          </button>

          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white p-0.5 shadow-2xs border border-slate-200 dark:border-slate-700">
              <img src={lockerLogo} alt="Smart Locker" className="w-full h-full object-cover rounded" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[15px] font-bold leading-tight">Smart Locker</span>
              <span className="role-badge text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase">
                {isSuperAdmin ? "SUPER ADMIN" : "ORG ADMIN"}
              </span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* System Scope Indicator (Visible on Tablet/Desktop md+) */}
          <div className="nav-pill hidden md:flex items-center gap-2 h-9 px-3.5 rounded-full border text-[12px] min-w-0">
            <span className="text-sky-600 dark:text-sky-400 font-semibold shrink-0">{t("nav.system")}:</span>
            <span className="font-bold truncate">
              {isSuperAdmin ? t("nav.superAdminSystem") : user?.orgName}
            </span>
          </div>
        </div>

        {/* Right: Controls & Realtime Status */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="nav-pill h-9 px-2.5 sm:px-3.5 rounded-full flex items-center gap-1 text-[11px] font-semibold border transition-all cursor-pointer shrink-0"
            title={t("nav.langTooltip")}
          >
            <span>{language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="nav-pill h-9 px-2.5 sm:px-3.5 rounded-full flex items-center gap-1 text-[11px] font-semibold border transition-all cursor-pointer shrink-0"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span>{isDarkMode ? "🌙" : "☀️"}</span>
            <span className="hidden sm:inline">{isDarkMode ? " Dark" : " Light"}</span>
          </button>

          {/* Realtime Status Badge */}
          <span className="hidden md:inline-flex h-9 px-3.5 rounded-full items-center gap-2 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t("nav.realtimeEngine")}
          </span>
        </div>
      </header>

      {/* ── BODY CONTAINER: SIDEBAR + MAIN CONTENT ── */}
      <div className="flex flex-1 min-w-0">

        {/* ── SIDEBAR ── */}
        <aside
          className={[
            "sidebar-nav fixed lg:sticky top-16 left-0 h-[calc(100vh-64px)] z-[1000] lg:z-auto w-[240px] shrink-0 p-3.5",
            "flex flex-col gap-5 overflow-y-auto",
            "transition-transform duration-200 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="flex flex-col gap-5 h-full p-4 rounded-2xl border shadow-sm backdrop-blur-md overflow-y-auto">

            {/* Grouped Nav Links */}
            <nav className="flex flex-col gap-5 flex-1">
              {navGroups.map((group) => (
                <div key={group.title} className="flex flex-col gap-2">
                  <span className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    {group.title}
                  </span>
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={closeMobileMenu}
                        className={({ isActive }) => [
                          "relative flex items-center gap-3 px-3.5 h-[40px] rounded-xl text-[13px] font-medium transition-all duration-200 overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent dark:from-sky-500/25 dark:via-sky-500/10 dark:to-transparent text-sky-700 dark:text-sky-300 font-bold shadow-2xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-sky-500/10 hover:via-sky-500/5 hover:to-transparent",
                        ].join(" ")}
                      >
                        {({ isActive }) => (
                          <>
                            {/* Active Indicator Bar */}
                            {isActive && (
                              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sky-600 dark:bg-sky-400 shadow-sm" />
                            )}
                            <span className={`shrink-0 transition-colors ${isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"}`}>
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* User profile footer */}
            <div className="profile-card flex flex-col gap-2 p-3 rounded-xl border mt-auto">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-[11px] font-bold text-sky-700 dark:text-sky-300 shrink-0 font-mono">
                  {getInitials(user?.fullName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold truncate">{user?.fullName ?? "Super Admin"}</p>
                  <p className="text-[10px] opacity-70 truncate">{user?.orgName ?? "Global System"}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="logout-btn flex items-center justify-center gap-2 h-8 rounded-lg text-[11px] font-semibold border hover:bg-red-600 hover:text-white transition-colors w-full cursor-pointer mt-1"
              >
                <IconLogout /> {t("nav.logout")}
              </button>
            </div>
          </div>
        </aside>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
