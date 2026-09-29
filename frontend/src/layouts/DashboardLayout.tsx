import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { PageHeader } from '../components/PageHeader';
import { MobileBottomNav } from '../components/MobileBottomNav';
import type { Role } from '../types';

interface DashboardLayoutProps {
  role: Role;
  title: string;
  subtitle?: string;
  unreadCount?: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  role,
  title,
  subtitle,
  unreadCount = 0,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 flex flex-row w-full overflow-x-hidden transition-colors duration-200">
      {/* Desktop Sticky macOS Glass Sidebar (In-flow flex layout to never overlap) */}
      <aside
        className={`sticky top-0 h-screen z-30 hidden lg:flex flex-col shrink-0 p-3 transition-all duration-300 ${
          isCollapsed ? 'w-[88px]' : 'w-72 xl:w-80'
        }`}
      >
        <Sidebar
          role={role}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>

      {/* Mobile Drawer Overlay (< lg) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-76 max-w-[85vw] p-3 shadow-2xl animate-fade-in z-50">
            <Sidebar
              role={role}
              onCloseMobile={() => setMobileOpen(false)}
              isCollapsed={false}
            />
          </aside>
        </div>
      )}

      {/* Main Content Area - Expands & Adapts to any Screen */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen w-full transition-all duration-300">
        <PageHeader
          title={title}
          subtitle={subtitle}
          onOpenMobileNav={() => setMobileOpen(true)}
          unreadAlertsCount={unreadCount}
        />

        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 xl:p-8 pb-24 lg:pb-8 animate-fade-in w-full min-w-0">
          <div className="mx-auto max-w-7xl w-full min-w-0">
            <Outlet />
          </div>
        </main>

        {/* Mobile Native App Bottom Navigation Bar */}
        <MobileBottomNav
          role={role}
          onOpenMobileMenu={() => setMobileOpen(true)}
          unreadCount={unreadCount}
        />
      </div>
    </div>
  );
};
