import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Gauge,
  Receipt,
  Truck,
  BarChart3,
  AlertTriangle,
  HelpCircle,
  Calculator,
  Megaphone,
  UserCheck,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Home,
  UserPlus,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { communityAdminApi } from '../services/api';
import { PwaInstallButton } from './PwaInstallButton';
import type { Role } from '../types';

interface SubItem {
  label: string;
  to: string;
  end?: boolean;
}

interface NavSectionItem {
  id: string;
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  subItems?: SubItem[];
}

interface SidebarProps {
  role: Role;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  onCloseMobile,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Internal collapse state
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  // Expanded submenus state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    meters: true,
  });

  const toggleGroup = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Real community residents list
  const [realResidents, setRealResidents] = useState<Array<{ name: string; flat: string; avatar: string }>>([]);

  useEffect(() => {
    const fetchResidents = async () => {
      if (role === 'COMMUNITY_ADMIN') {
        try {
          const list = await communityAdminApi.getHouseholds();
          if (Array.isArray(list)) {
            setRealResidents(
              list.map((h) => ({
                name: h.residentName || (h as any).residentFullName || `Resident (${h.flatNumber})`,
                flat: `Flat ${h.flatNumber}`,
                avatar: (h.residentName || (h as any).residentFullName || h.flatNumber || 'R').substring(0, 2).toUpperCase(),
              }))
            );
          }
        } catch (err) {
          console.error('Failed to load community residents for sidebar:', err);
        }
      }
    };

    fetchResidents();

    window.addEventListener('household_updated', fetchResidents);
    return () => window.removeEventListener('household_updated', fetchResidents);
  }, [role, location.pathname]);

  // Hover Popover in Collapsed mode
  const [hoveredItem, setHoveredItem] = useState<{
    item: NavSectionItem;
    top: number;
  } | null>(null);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (item: NavSectionItem, e: React.MouseEvent<HTMLElement>) => {
    if (!isCollapsed) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredItem({
      item,
      top: rect.top,
    });
  };

  const handleMouseLeave = () => {
    if (!isCollapsed) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 200);
  };

  // Navigation tree definitions
  const mainAdminTree: NavSectionItem[] = [
    {
      id: 'dashboard',
      label: t('dashboard', 'Dashboard'),
      to: '/main-admin/dashboard',
      icon: LayoutDashboard,
      end: true,
      subItems: [
        { label: t('platformActivity', 'Platform Activity'), to: '/main-admin/dashboard', end: true },
        { label: t('globalCommunities', 'Global Communities'), to: '/main-admin/apartments' },
        { label: t('overallStatistics', 'Overall Statistics'), to: '/main-admin/reports' },
      ],
    },
    {
      id: 'apartments',
      label: t('apartments', 'Apartments'),
      to: '/main-admin/apartments',
      icon: Building2,
    },
    {
      id: 'admins',
      label: t('adminsDirectory', 'Admins Directory'),
      to: '/main-admin/admins',
      icon: Users,
    },
    {
      id: 'tariffs',
      label: t('tariffSlabs', 'Tariff Slabs & Pricing'),
      to: '/main-admin/tariffs',
      icon: Calculator,
    },
    {
      id: 'reports',
      label: t('analyticsLogs', 'Analytics & Logs'),
      to: '/main-admin/reports',
      icon: BarChart3,
    },
    {
      id: 'support',
      label: t('supportDesk', 'Support & Escalations'),
      to: '/main-admin/support',
      icon: HelpCircle,
    },
    {
      id: 'announcements',
      label: t('platformBroadcasts', 'Platform Broadcasts'),
      to: '/main-admin/announcements',
      icon: Megaphone,
    },
    {
      id: 'profile',
      label: t('adminProfile', 'Admin Profile'),
      to: '/main-admin/profile',
      icon: UserCheck,
    },
  ];

  const communityAdminTree: NavSectionItem[] = [
    {
      id: 'dashboard',
      label: t('dashboard', 'Dashboard'),
      to: '/community-admin/dashboard',
      icon: LayoutDashboard,
      end: true,
      subItems: [
        { label: t('activityOverview', 'Activity Overview'), to: '/community-admin/dashboard', end: true },
        { label: t('consumptionTrends', 'Consumption Trends'), to: '/community-admin/reports' },
        { label: t('top6Flats', 'Top 6 Flats Stats'), to: '/community-admin/dashboard' },
      ],
    },
    {
      id: 'households',
      label: t('householdsDirectory', 'Households Directory'),
      to: '/community-admin/households',
      icon: Home,
    },
    {
      id: 'meters',
      label: t('meterReadings', 'Meter Readings'),
      to: '/community-admin/meter-readings',
      icon: Gauge,
      subItems: [
        { label: t('singleReadingEntry', 'Single Reading Entry'), to: '/community-admin/meter-readings', end: true },
        { label: t('bulkCsvUpload', 'Bulk CSV Upload'), to: '/community-admin/meter-readings' },
      ],
    },
    {
      id: 'billing',
      label: t('invoicesBilling', 'Invoices & Billing'),
      to: '/community-admin/billing',
      icon: Receipt,
    },
    {
      id: 'bulk',
      label: t('bulkPurchases', 'Bulk Water Purchases'),
      to: '/community-admin/bulk-purchases',
      icon: Truck,
    },
    {
      id: 'reports',
      label: t('apportionmentReports', 'Apportionment Reports'),
      to: '/community-admin/reports',
      icon: BarChart3,
    },
    {
      id: 'leakage',
      label: t('leakageAlerts', 'Leakage & Alerts'),
      to: '/community-admin/leakage',
      icon: AlertTriangle,
    },
    {
      id: 'tariffs',
      label: t('tariffSlabs', 'Tariff Slabs'),
      to: '/community-admin/tariffs',
      icon: Calculator,
    },
    {
      id: 'support',
      label: t('supportDesk', 'Support Desk & Concerns'),
      to: '/community-admin/support',
      icon: HelpCircle,
    },
    {
      id: 'announcements',
      label: t('announcements', 'Announcements & Broadcasts'),
      to: '/community-admin/announcements',
      icon: Megaphone,
    },
    {
      id: 'profile',
      label: t('profileSettings', 'Profile & Settings'),
      to: '/community-admin/profile',
      icon: UserCheck,
    },
  ];

  const residentTree: NavSectionItem[] = [
    {
      id: 'dashboard',
      label: t('dashboard', 'Dashboard'),
      to: '/resident/dashboard',
      icon: LayoutDashboard,
      end: true,
      subItems: [
        { label: t('dailyWaterActivity', 'Daily Water Activity'), to: '/resident/dashboard', end: true },
        { label: t('monthlyTrendChart', 'Monthly Trend Chart'), to: '/resident/usage' },
        { label: t('slabConsumption', 'Slab Consumption'), to: '/resident/dashboard' },
      ],
    },
    {
      id: 'usage',
      label: t('usageHistory', 'Usage History'),
      to: '/resident/usage',
      icon: Gauge,
    },
    {
      id: 'bills',
      label: t('myInvoices', 'My Invoices'),
      to: '/resident/bills',
      icon: Receipt,
    },
    {
      id: 'watertips',
      label: t('waterSavingTips', 'Water Saving Tips'),
      to: '/resident/water-tips',
      icon: Lightbulb,
    },
    {
      id: 'alerts',
      label: t('overuseAlerts', 'Overuse & Leak Alerts'),
      to: '/resident/alerts',
      icon: Bell,
    },
    {
      id: 'announcements',
      label: t('announcements', 'Community Notices'),
      to: '/resident/announcements',
      icon: Megaphone,
    },
    {
      id: 'reports',
      label: t('conservationReports', 'Conservation Reports'),
      to: '/resident/reports',
      icon: BarChart3,
    },
    {
      id: 'support',
      label: t('supportConcerns', 'Support & Concerns'),
      to: '/resident/support',
      icon: HelpCircle,
    },
    {
      id: 'profile',
      label: t('myProfile', 'My Profile'),
      to: '/resident/profile',
      icon: UserCheck,
    },
  ];

  let navItems = residentTree;
  let roleTitle = 'RESIDENT';
  if (role === 'MAIN_ADMIN') {
    navItems = mainAdminTree;
    roleTitle = 'MAIN ADMIN';
  } else if (role === 'COMMUNITY_ADMIN') {
    navItems = communityAdminTree;
    roleTitle = 'COMMUNITY ADMIN';
  }

  const handleQuickAdd = () => {
    if (role === 'COMMUNITY_ADMIN') {
      navigate('/community-admin/households?action=new');
    } else {
      navigate('/resident/usage');
    }
  };

  return (
    <div
      className={`relative flex h-full max-h-[calc(100dvh-24px)] w-full flex-col overflow-visible rounded-3xl border border-slate-200/90 bg-white text-slate-800 shadow-xl backdrop-blur-2xl transition-all duration-300 dark:border-slate-800/80 dark:bg-[#131B2E] dark:text-slate-200 ${
        isCollapsed ? 'p-2' : 'p-3.5'
      }`}
    >
      {/* ALWAYS-VISIBLE PROMINENT FLOATING TOGGLE BUTTON ANCHORED ON THE EDGE */}
      <button
        onClick={handleToggle}
        className={`absolute z-50 hidden lg:flex h-7.5 w-7.5 items-center justify-center rounded-full bg-gradient-to-r from-brand-600 to-aqua-500 text-white shadow-md ring-2 ring-white dark:ring-[#131B2E] hover:scale-110 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
          isCollapsed ? '-right-3.5 top-3' : '-right-3.5 top-6'
        }`}
        title={isCollapsed ? 'Click to Expand Sidebar' : 'Click to Collapse Sidebar'}
        aria-label="Toggle sidebar expansion"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* TOP: Fixed User Profile Header */}
      <div className="shrink-0">
        <div className={`relative flex items-center ${isCollapsed ? 'justify-center p-1.5' : 'justify-between p-2.5'} rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-white/[0.05] dark:border-white/[0.08] shadow-sm`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} min-w-0`}>
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-aqua-500 font-bold text-white text-xs shadow-glow">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#131B2E]" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-aqua-400">
                    {roleTitle}
                  </span>
                  {user?.apartmentName && (
                    <span className="text-[9px] bg-brand-100 dark:bg-white/10 text-brand-700 dark:text-slate-300 font-semibold px-1.5 py-0.5 rounded">
                      {user.apartmentName.length > 12 ? `${user.apartmentName.substring(0, 12)}...` : user.apartmentName}
                    </span>
                  )}
                </div>
                <p className="truncate font-display text-xs font-bold text-slate-900 dark:text-white">
                  {user?.fullName || 'Community User'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION LABEL: MAIN */}
        <div className="px-2 pt-2.5 pb-1">
          <p className={`text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '•••' : 'MAIN'}
          </p>
        </div>
      </div>

      {/* MIDDLE: Scrollable Navigation Items Tree */}
      <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto pr-0.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedGroups[item.id] !== false;
          const isParentActive =
            location.pathname === item.to ||
            (item.subItems && item.subItems.some((s) => location.pathname === s.to));

          return (
            <div
              key={item.id}
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
              className="relative"
            >
              {/* Main Menu Item */}
              <NavLink
                to={item.to}
                end={item.end}
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                }}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold transition-all ${
                    isActive || (hasChildren && isParentActive)
                      ? 'bg-brand-50 text-brand-700 border border-brand-200/80 shadow-sm dark:bg-brand-500/25 dark:text-aqua-300 dark:border-brand-400/30'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isParentActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && hasChildren && (
                  <button
                    onClick={(e) => toggleGroup(item.id, e)}
                    className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </NavLink>

              {/* Expanded Tree Branches with Connecting Lines */}
              {!isCollapsed && hasChildren && isExpanded && (
                <div className="relative ml-4 pl-4 pt-1 pb-1 space-y-0.5">
                  {/* Vertical Connecting Line */}
                  <div className="absolute left-1.5 top-0 bottom-3 w-px bg-slate-300 dark:bg-white/15" />

                  {item.subItems!.map((sub) => {
                    const isSubActive = location.pathname === sub.to;
                    return (
                      <div key={sub.label} className="relative flex items-center">
                        {/* Horizontal Branch Connector Line */}
                        <div className="absolute -left-2.5 top-1/2 w-2.5 h-px bg-slate-300 dark:bg-white/15" />

                        <NavLink
                          to={sub.to}
                          end={sub.end}
                          onClick={onCloseMobile}
                          className={`flex w-full items-center rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                            isSubActive
                              ? 'bg-brand-100 text-brand-800 font-bold border-l-2 border-brand-600 dark:bg-brand-500/30 dark:text-aqua-200'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white'
                          }`}
                        >
                          <span>{sub.label}</span>
                        </NavLink>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Floating Hover Popover in Collapsed Mode */}
      {isCollapsed && hoveredItem && (
        <div
          style={{ top: Math.max(10, hoveredItem.top - 20) }}
          className="fixed left-[88px] z-50 w-56 rounded-2xl border border-slate-300 bg-white p-3.5 shadow-2xl backdrop-blur-2xl animate-fade-in text-xs dark:border-white/20 dark:bg-[#1f1b29]"
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <p className="font-bold text-slate-900 dark:text-white mb-2 px-1 border-b border-slate-200 dark:border-white/10 pb-1.5 flex items-center justify-between">
            <span>{hoveredItem.item.label}</span>
            <span className="text-[9px] uppercase tracking-wider text-brand-600 dark:text-aqua-400 font-bold">JalSetu</span>
          </p>

          {hoveredItem.item.subItems && hoveredItem.item.subItems.length > 0 ? (
            <div className="space-y-1">
              {hoveredItem.item.subItems.map((sub) => (
                <NavLink
                  key={sub.label}
                  to={sub.to}
                  end={sub.end}
                  onClick={() => setHoveredItem(null)}
                  className={({ isActive }) =>
                    `block rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white font-bold shadow-sm'
                        : 'text-slate-800 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white'
                    }`
                  }
                >
                  {sub.label}
                </NavLink>
              ))}
            </div>
          ) : (
            <NavLink
              to={hoveredItem.item.to}
              onClick={() => setHoveredItem(null)}
              className="block rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Open {hoveredItem.item.label}
            </NavLink>
          )}
        </div>
      )}

      {/* BOTTOM SECTION: Pinned at bottom - ALWAYS VISIBLE */}
      <div className="shrink-0 mt-auto pt-2.5 border-t border-slate-200 dark:border-white/[0.08] space-y-2">
        {/* PWA App Install Quick Launcher */}
        <div className={isCollapsed ? 'px-0' : 'px-0.5'}>
          <PwaInstallButton variant={isCollapsed ? 'icon-only' : 'sidebar'} />
        </div>

        {/* Real Community Directory */}
        {!isCollapsed && (
          <div className="space-y-1.5 px-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('liveDirectory', 'Live Directory')} ({role === 'COMMUNITY_ADMIN' ? realResidents.length : '1'})
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● Active</span>
            </div>

            <div className="space-y-1 max-h-20 overflow-y-auto scrollbar-thin pr-1">
              {role === 'COMMUNITY_ADMIN' ? (
                realResidents.length > 0 ? (
                  realResidents.map((c) => (
                    <div
                      key={c.name + c.flat}
                      className="flex items-center justify-between rounded-xl px-2 py-1 transition-colors hover:bg-slate-100/70 dark:hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-white/10 dark:text-slate-200 text-[9px] font-bold">
                          {c.avatar}
                          <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
                        </div>
                        <span className="truncate text-[11px] text-slate-800 dark:text-slate-200 font-semibold">{c.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{c.flat}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-slate-400 italic py-0.5 text-center">
                    {t('noResidentsAdded', 'No residents added yet')}
                  </div>
                )
              ) : (
                <NavLink
                  to="/resident/support"
                  className="flex items-center justify-between rounded-xl px-2 py-1 transition-colors hover:bg-slate-100/70 dark:hover:bg-white/[0.04] cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-white/10 dark:text-slate-200 text-[9px] font-bold">
                      CA
                      <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
                    </div>
                    <span className="truncate text-[11px] text-slate-800 dark:text-slate-200 font-semibold">{t('adminDesk', 'Admin Desk')}</span>
                  </div>
                  <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline">{t('support', 'Support')} &rarr;</span>
                </NavLink>
              )}
            </div>
          </div>
        )}

        {/* Quick Action Button: + Add Resident / Flat */}
        {!isCollapsed ? (
          <button
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] hover:shadow-orange-500/40 active:scale-[0.98] cursor-pointer"
          >
            {role === 'COMMUNITY_ADMIN' ? (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                <span>{t('addResidentFlat', '+ Add Resident / Flat')}</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>{t('logWaterReading', '+ Log Water Reading')}</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleQuickAdd}
            className="flex h-9 w-9 mx-auto items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25 hover:scale-105 cursor-pointer"
            title={role === 'COMMUNITY_ADMIN' ? t('addResidentFlat', 'Add Resident / Flat') : t('logWaterReading', 'Log Water Reading')}
          >
            {role === 'COMMUNITY_ADMIN' ? (
              <UserPlus className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        )}

        {/* LOGOUT BUTTON - PINNED & PROMINENT */}
        <button
          onClick={logout}
          className={`flex w-full items-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 text-xs transition-colors dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 cursor-pointer ${
            isCollapsed ? 'justify-center px-0 py-2' : ''
          }`}
          title="Sign out of JalSetu"
        >
          <LogOut className="h-3.5 w-3.5" />
          {!isCollapsed && <span>{t('signOut', 'Sign Out')}</span>}
        </button>
      </div>
    </div>
  );
};
