import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Droplets,
  Gauge,
  Receipt,
  AlertTriangle,
  Bell,
  Building2,
  Users,
  Calculator,
  Menu,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Role } from '../types';

interface MobileBottomNavProps {
  role: Role;
  onOpenMobileMenu: () => void;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  role,
  onOpenMobileMenu,
  unreadCount = 0,
}) => {
  const { t } = useLanguage();
  const location = useLocation();

  const getNavItems = () => {
    if (role === 'COMMUNITY_ADMIN') {
      return [
        { label: t('dashboard', 'Home'), to: '/community-admin/dashboard', icon: LayoutDashboard },
        { label: t('meters', 'Meters'), to: '/community-admin/meter-readings', icon: Gauge },
        { label: t('billing', 'Billing'), to: '/community-admin/billing', icon: Receipt },
        { label: t('leaks', 'Alerts'), to: '/community-admin/leakage', icon: AlertTriangle, badge: unreadCount },
      ];
    }
    if (role === 'RESIDENT') {
      return [
        { label: t('home', 'Home'), to: '/resident/dashboard', icon: Home },
        { label: t('usage', 'Usage'), to: '/resident/usage', icon: Droplets },
        { label: t('bills', 'Bills'), to: '/resident/bills', icon: Receipt },
        { label: t('alerts', 'Alerts'), to: '/resident/alerts', icon: Bell, badge: unreadCount },
      ];
    }
    return [
      { label: t('dashboard', 'Home'), to: '/main-admin/dashboard', icon: LayoutDashboard },
      { label: t('apartments', 'Societies'), to: '/main-admin/apartments', icon: Building2 },
      { label: t('admins', 'Admins'), to: '/main-admin/admins', icon: Users },
      { label: t('tariffs', 'Tariffs'), to: '/main-admin/tariffs', icon: Calculator },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 dark:bg-[#131B2E]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 shadow-2xl transition-colors pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-15 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                isActive
                  ? 'text-brand-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? 'bg-brand-500/15 dark:bg-cyan-400/15 scale-105'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-500 px-0.5 text-[8px] font-black text-white ring-1 ring-white dark:ring-slate-900">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-none mt-1 truncate max-w-[56px] text-center">
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* More Menu Drawer Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1 text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 cursor-pointer"
          aria-label="Open More Menu"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-xl">
            <Menu className="h-4.5 w-4.5" />
          </div>
          <span className="text-[10px] leading-none mt-1 text-center">
            {t('more', 'More')}
          </span>
        </button>
      </div>
    </nav>
  );
};
