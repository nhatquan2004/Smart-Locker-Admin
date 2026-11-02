import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Boxes,
  Users,
  PackageCheck,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  ShieldAlert,
  Megaphone,
  Bell,
  MapPin,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useTranslation } from "../../context/LanguageContext";
import lockerLogo from "../../assets/locker.png";
import { ApprovalBell } from "./ApprovalBell";
import { getMyBuildingName } from "../../service/buildingNames";
import { BroadcastModal } from "../notifications/BroadcastModal";
import { BankAccountBanner } from "./BankAccountBanner";

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
  const isBuildingAdmin = user?.role === "org_admin";
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  // Tên tòa nhà của Ban quản lý, lấy từ server vì thông tin đăng nhập không có tên tòa
  const [buildingName, setBuildingName] = useState<string | null>(null);

  useEffect(() => {
    if (!isBuildingAdmin) return;
    let active = true;
    getMyBuildingName()
      .then((name) => {
        if (active) setBuildingName(name);
      })
      .catch(() => {
        // Không đọc được thì dùng tên có sẵn trong thông tin đăng nhập
      });
    return () => {
      active = false;
    };
  }, [isBuildingAdmin]);

  const { t, language, toggleLanguage } = useTranslation();

  const navGroups = [
    {
      title: t("nav.sectionOverview"),
      items: [
        { label: t("nav.dashboard"), icon: <LayoutDashboard className="w-[18px] h-[18px]" />, to: "/dashboard" },
      ],
    },
    {
      title: t("nav.sectionManage"),
      items: [
        ...(isSuperAdmin
          ? [{ label: t("nav.organizations"), icon: <Building2 className="w-[18px] h-[18px]" />, to: "/organizations" }]
          : []),
        { label: t("nav.lockers"), icon: <Boxes className="w-[18px] h-[18px]" />, to: "/lockers" },
        // Vị trí thuộc về tòa nhà do Super Admin thiết lập, Ban quản lý không cần bản đồ
        ...(isSuperAdmin
          ? [{ label: t("nav.lockerMap"), icon: <MapPin className="w-[18px] h-[18px]" />, to: "/locker-map" }]
          : []),
        { label: t("nav.users"), icon: <Users className="w-[18px] h-[18px]" />, to: "/users" },
        { label: t("nav.shipments"), icon: <PackageCheck className="w-[18px] h-[18px]" />, to: "/shipments" },
        { label: t("nav.issues"), icon: <ShieldAlert className="w-[18px] h-[18px]" />, to: "/issues" },
      ],
    },
    {
      title: t("nav.sectionSystem"),
      items: [
        { label: t("nav.notifications"), icon: <Bell className="w-[18px] h-[18px]" />, to: "/notifications" },
        { label: t("nav.activities"), icon: <Activity className="w-[18px] h-[18px]" />, to: "/activities" },
        // Chỉ Ban quản lý có API đọc/sửa tài khoản nhận tiền và biểu phí của tòa mình
        ...(isBuildingAdmin
          ? [{ label: t("nav.paymentSettings"), icon: <Wallet className="w-[18px] h-[18px]" />, to: "/payment-settings" }]
          : []),
        // Trang này chỉ Super Admin vào được
        ...(isSuperAdmin
          ? [{ label: t("nav.settings"), icon: <Settings className="w-[18px] h-[18px]" />, to: "/settings" }]
          : []),
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-transparent text-[#1e293b] dark:text-slate-100">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[999] bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* ── TOP HEADER (Fixed Pin Top Navbar) ── */}
      <header className="top-navbar shrink-0 h-16 px-3 sm:px-6 flex items-center justify-between gap-3 border-b z-[1010] transition-colors duration-200">
        {/* Trái: logo, tên hệ thống và phạm vi quản lý */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="lg:hidden flex items-center justify-center w-10 h-10 -ml-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            aria-label={t("layout.toggleMenu")}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 shrink-0">
            <img src={lockerLogo} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
            <span className="hidden sm:block text-[16px] font-semibold tracking-tight whitespace-nowrap text-slate-900 dark:text-white">
              Smart Locker
            </span>
          </div>

          {/* Phạm vi quản lý: Toàn hệ thống hoặc tên đơn vị của Ban quản lý */}
          <div className="hidden md:flex items-center gap-1.5 h-7 pl-2.5 pr-3 rounded-full bg-slate-100 dark:bg-slate-800/80 text-[12px] font-medium text-slate-600 dark:text-slate-300 min-w-0">
            <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
            <span className="truncate max-w-[180px] xl:max-w-[300px]" title={isSuperAdmin ? t("nav.superAdminSystem") : (buildingName ?? user?.orgName)}>
              {isSuperAdmin ? t("layout.scopeAll") : (buildingName ?? user?.orgName)}
            </span>
          </div>
        </div>

        {/* Phải: các nút tiện ích dạng icon, không viền để header gọn */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {isBuildingAdmin && (
            <button
              type="button"
              id="broadcast-notification-btn"
              onClick={() => setIsBroadcastOpen(true)}
              className="h-9 px-2.5 sm:px-3 mr-1 rounded-full flex items-center gap-1.5 text-[12.5px] font-medium bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors cursor-pointer shrink-0"
              title={t("layout.broadcastTooltip")}
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">{t("layout.broadcastShort")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleLanguage}
            className="h-9 px-2.5 rounded-full flex items-center gap-1.5 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title={t("nav.langTooltip")}
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'vi' ? 'VI' : 'EN'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title={isDarkMode ? t("layout.toLight") : t("layout.toDark")}
            aria-label={isDarkMode ? t("layout.toLight") : t("layout.toDark")}
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Approval Bell — hiện với cả org_admin và super_admin */}
          <ApprovalBell />

          {/* Trạng thái kết nối realtime, chỉ là một chấm nhỏ kèm chú thích khi rê chuột */}
          <span
            className="hidden md:flex items-center justify-center w-9 h-9 shrink-0"
            title={t("nav.realtimeEngine")}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />
          </span>
        </div>
      </header>

      {/* ── BODY CONTAINER: FIXED LEFT SIDEBAR + SCROLLABLE RIGHT MAIN ── */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden relative">

        {/* ── FIXED LEFT SIDEBAR ── */}
        <aside
          className={[
            "sidebar-nav fixed lg:static top-16 bottom-0 left-0 h-[calc(100vh-64px)] lg:h-full z-[1000] lg:z-auto w-[250px] shrink-0 p-3",
            "flex flex-col transition-transform duration-200 ease-in-out bg-slate-50/80 dark:bg-slate-900/80 lg:bg-transparent",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="flex flex-col h-full p-3.5 rounded-2xl border shadow-sm backdrop-blur-md overflow-hidden">

            {/* Grouped Nav Links (Scrollable Nav List) */}
            <nav className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {navGroups.map((group) => (
                <div key={group.title} className="flex flex-col gap-1.5">
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
                          "relative flex items-center gap-3 px-3.5 h-[38px] rounded-xl text-[13px] font-medium transition-all duration-200 overflow-hidden",
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

            {/* User Profile Footer (Fixed Bottom Pinned Card) */}
            <div className="profile-card flex flex-col gap-2 p-3 rounded-xl border mt-3 shrink-0 bg-white/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-[11px] font-bold text-sky-700 dark:text-sky-300 shrink-0 font-mono">
                  {getInitials(user?.fullName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold truncate text-slate-900 dark:text-white" title={user?.fullName ?? "Super Admin"}>
                    {user?.fullName ?? "Super Admin"}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate" title={isSuperAdmin ? "Global System" : (buildingName ?? user?.orgName ?? "")}>
                    {isSuperAdmin ? "Global System" : (buildingName ?? user?.orgName ?? "—")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="logout-btn flex items-center justify-center gap-2 h-7.5 rounded-lg text-[11px] font-semibold border hover:bg-red-600 hover:text-white transition-colors w-full cursor-pointer mt-0.5"
              >
                <LogOut className="w-3.5 h-3.5" /> {t("nav.logout")}
              </button>
            </div>
          </div>
        </aside>

        {/* ── SCROLLABLE RIGHT MAIN PANEL ── */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
          <BankAccountBanner />
          <Outlet />
        </main>
      </div>

      {/* ── BROADCAST MODAL ── */}
      {isBroadcastOpen && (
        <BroadcastModal onClose={() => setIsBroadcastOpen(false)} />
      )}
    </div>
  );
}
