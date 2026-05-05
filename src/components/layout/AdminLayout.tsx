import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import lockerLogo from "../../assets/locker.png";
import "./AdminLayout.css";

const navItems = [
  { label: "Dashboard", icon: "📊", to: "/dashboard" },
  { label: "Lockers", icon: "🗄", to: "/lockers" },
  { label: "Activities", icon: "📜", to: "/activities" },
  { label: "Shipments", icon: "📦", to: "/shipments" },
  { label: "Users", icon: "👥", to: "/users" },
  { label: "Settings", icon: "⚙️", to: "/settings" },
];

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="admin-layout">
      {isMobileMenuOpen && (
        <div className="admin-sidebar__overlay" onClick={closeMobileMenu} />
      )}

      <aside
        className={`admin-sidebar ${isMobileMenuOpen ? "admin-sidebar--open" : ""}`}
      >
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__brand-mark">
            <img
              src={lockerLogo}
              alt="Smart Locker"
              className="admin-sidebar__brand-logo"
            />
          </span>

          <div>
            <h1 className="admin-sidebar__brand-title">Smart Locker</h1>
            <p className="admin-sidebar__brand-subtitle">Admin Control Panel</p>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`
              }
            >
              <span className="admin-sidebar__icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__avatar">QH</div>
          <div>
            <p className="admin-sidebar__footer-name">Quân Hoàng</p>
            <p className="admin-sidebar__footer-role">System Operator</p>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <button
            className="admin-menu-toggle"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
