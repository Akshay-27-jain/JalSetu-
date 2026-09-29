import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Globe,
  Moon,
  Sun,
  Menu,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Check,
  AlertTriangle,
  Droplets,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  Receipt,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, type LanguageCode, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Badge } from './Badge';
import { PwaInstallButton } from './PwaInstallButton';
import { communityAdminApi, residentApi } from '../services/api';
import type { Alert } from '../types';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileNav?: () => void;
  unreadAlertsCount?: number;
}

const MONTHS_MAP: Record<LanguageCode, string[]> = {
  EN: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  HI: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
  MR: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'],
  GU: ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'],
  TA: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  TE: ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'],
  KN: ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್'],
  BN: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
  ES: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onOpenMobileNav,
  unreadAlertsCount: externalUnread = 0,
}) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [langOpen, setLangOpen] = useState(false);
  const [langToast, setLangToast] = useState<string | null>(null);
  const [langSearch, setLangSearch] = useState('');

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.native.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Interactive Month / Calendar Selector State
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Notification Bell State
  const [notifOpen, setNotifOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(externalUnread);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // User Profile Dropdown Menu State
  const [profileOpen, setProfileOpen] = useState(false);

  // Click outside refs
  const calendarRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real alerts when user opens notification dropdown
  const fetchLiveAlerts = async () => {
    try {
      setAlertsLoading(true);
      let list: Alert[] = [];
      if (user?.role === 'COMMUNITY_ADMIN') {
        list = await communityAdminApi.getAlerts();
      } else if (user?.role === 'RESIDENT') {
        list = await residentApi.getAlerts();
      }
      setAlerts(list);
      const unread = list.filter((a) => !a.isResolved).length;
      setUnreadCount(unread > 0 ? unread : list.length);
    } catch {
      // Fallback
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAlerts();
  }, [user]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthsList = MONTHS_MAP[language] || MONTHS_MAP.EN;
  const formattedMonth = `${monthsList[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  const handleSelectLanguage = (code: LanguageCode, name: string) => {
    setLanguage(code);
    setLangOpen(false);
    setLangToast(`Language set to ${name}`);
    setTimeout(() => setLangToast(null), 2500);
  };

  const handleMarkAllAlertsRead = () => {
    setUnreadCount(0);
    setAlerts((prev) => prev.map((a) => ({ ...a, isResolved: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getProfilePath = () => {
    if (user?.role === 'COMMUNITY_ADMIN') return '/community-admin/profile';
    if (user?.role === 'RESIDENT') return '/resident/profile';
    return '/main-admin/profile';
  };

  const getRoleVariant = () => {
    if (user?.role === 'MAIN_ADMIN') return 'admin';
    if (user?.role === 'COMMUNITY_ADMIN') return 'supply';
    return 'normal';
  };

  const getRoleName = () => {
    if (user?.role === 'MAIN_ADMIN') return 'Main Admin';
    if (user?.role === 'COMMUNITY_ADMIN') return 'Community Admin';
    return `Resident ${user?.flatNumber ? `(${user.flatNumber})` : ''}`;
  };

  const getAlertDetails = (a: any) => {
    const msg = (a.message || '').toLowerCase();
    const type = (a.type || a.alertType || '').toUpperCase();
    const flat = a.flatNumber || a.householdFlat;

    if (
      type === 'BILL_READY' ||
      msg.includes('payment') ||
      msg.includes('invoice') ||
      msg.includes('inv-') ||
      msg.includes('paid') ||
      msg.includes('receipt') ||
      msg.includes('razorpay')
    ) {
      const isPaid = msg.includes('received') || msg.includes('success') || msg.includes('paid');
      return {
        title: flat ? `Flat ${flat} • ${isPaid ? 'Payment Received' : 'Bill Statement'}` : isPaid ? 'Payment Confirmed' : 'Billing Invoice',
        badge: isPaid ? 'Receipt' : 'Bill Ready',
        badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
        iconClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
        Icon: isPaid ? CheckCircle2 : Receipt,
      };
    }

    if (type === 'ANOMALY' || msg.includes('leak') || msg.includes('pipe') || msg.includes('burst') || msg.includes('continuous')) {
      return {
        title: flat ? `Flat ${flat} • Anomaly Detected` : 'Pipe / Leak Alert',
        badge: 'Critical Leak',
        badgeClass: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
        iconClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
        Icon: AlertTriangle,
      };
    }

    if (type === 'OVERUSE' || msg.includes('overuse') || msg.includes('consumption') || msg.includes('threshold') || msg.includes('slab')) {
      return {
        title: flat ? `Flat ${flat} • High Usage` : 'Water Overuse Alert',
        badge: 'Overuse',
        badgeClass: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
        iconClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
        Icon: Droplets,
      };
    }

    return {
      title: flat ? `Flat ${flat} • Water Advisory` : 'Community Advisory',
      badge: 'Notice',
      badgeClass: 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800',
      iconClass: 'bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400',
      Icon: Bell,
    };
  };

  const formatNotificationTime = (a: any) => {
    const rawDate = a.sentAt || a.createdAt;
    if (!rawDate) return 'Recently';
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return 'Recently';
    const isToday = new Date().toDateString() === d.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `${timeStr} • Today` : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${timeStr}`;
  };

  const getNotificationHubLink = () => {
    if (user?.role === 'COMMUNITY_ADMIN') {
      return {
        to: '/community-admin/leakage',
        label: 'View All Leak & Anomaly Alerts →',
      };
    }
    if (user?.role === 'MAIN_ADMIN') {
      return {
        to: '/main-admin/support',
        label: 'View Support Escalations & System Alerts →',
      };
    }
    return {
      to: '/resident/alerts',
      label: 'View All Alerts & Notices Hub →',
    };
  };

  const displayTitle = title.includes('Community Management')
    ? t('communityManagementPanel', title)
    : title.includes('Resident Water')
    ? t('residentWaterPortal', title)
    : t(title, title);

  const displaySubtitle = subtitle ? t(subtitle, subtitle) : '';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#131B2E]/95 px-3 sm:px-5 lg:px-6 xl:px-8 backdrop-blur-md transition-colors duration-200 w-full min-w-0">
      {/* Toast message for language change */}
      {langToast && (
        <div className="absolute top-18 right-8 z-50 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs px-3.5 py-2 shadow-xl border border-slate-700 animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{langToast}</span>
        </div>
      )}

      {/* Left title & mobile toggle */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xs sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
            {displayTitle}
          </h1>
          {displaySubtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden xl:block truncate">
              {displaySubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right control widgets */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* 1. INTERACTIVE CALENDAR MONTH PICKER PILL */}
        <div className="relative" ref={calendarRef}>
          <div
            onClick={() => setCalendarOpen(!calendarOpen)}
            className="group flex cursor-pointer items-center gap-1 sm:gap-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 px-2 sm:px-3.5 py-1 sm:py-1.5 shadow-2xs transition-all hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-xs active:scale-[0.98]"
          >
            <button
              onClick={handlePrevMonth}
              className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>

            <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1 sm:gap-1.5 select-none whitespace-nowrap">
              <span className="hidden sm:inline">📅</span>
              <span className="font-display font-bold text-[11px] sm:text-xs">
                <span className="sm:hidden">{monthsList[selectedDate.getMonth()]?.substring(0, 3)} '{String(selectedDate.getFullYear()).slice(-2)}</span>
                <span className="hidden sm:inline">{formattedMonth}</span>
              </span>
            </span>

            <button
              onClick={handleNextMonth}
              className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>

          {/* Calendar Month Dropdown Menu */}
          {calendarOpen && (
            <div className="absolute right-0 mt-2 z-50 w-72 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-dropdown animate-fade-in text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5 mb-3">
                <span className="font-bold text-slate-900 dark:text-white">
                  {t('selectBillingMonth', 'Select Billing Month')}
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-0.5 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(new Date(selectedDate.getFullYear() - 1, selectedDate.getMonth(), 1));
                    }}
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                    title="Previous Year"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 px-1">
                    {selectedDate.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(new Date(selectedDate.getFullYear() + 1, selectedDate.getMonth(), 1));
                    }}
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                    title="Next Year"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => {
                  const isSelected = selectedDate.getMonth() === idx;
                  const isCurrentMonth = new Date().getMonth() === idx && new Date().getFullYear() === selectedDate.getFullYear();
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedDate(new Date(selectedDate.getFullYear(), idx, 1));
                        setCalendarOpen(false);
                      }}
                      className={`relative rounded-xl py-2 px-1 text-center font-medium text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-600 text-white font-bold shadow-sm shadow-brand-500/30'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{monthsList[idx] ? (monthsList[idx].length <= 5 ? monthsList[idx] : m) : m}</span>
                      {isCurrentMonth && !isSelected && (
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setCalendarOpen(false);
                  }}
                  className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  {t('jumpCurrentMonth', 'Current Month')} ({['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][new Date().getMonth()]} {new Date().getFullYear()})
                </button>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  ● {t('activeCycle', 'Active Cycle')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2. INTERACTIVE LANGUAGE SELECTOR DROPDOWN (100+ Languages) */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => {
              setLangOpen(!langOpen);
              setLangSearch('');
            }}
            className="flex h-8 sm:h-8.5 items-center gap-1 sm:gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131B2E] px-2 sm:px-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors shadow-2xs"
            title="Change Language (100+ Supported)"
          >
            <span className="text-sm">{currentLangObj.flag}</span>
            <span className="text-[10px] font-mono font-bold uppercase sm:hidden">{currentLangObj.code}</span>
            <span className="max-w-[70px] truncate hidden md:inline">{currentLangObj.native}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 z-50 w-60 sm:w-64 max-w-[92vw] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] p-2.5 shadow-2xl animate-fade-in text-xs">
              <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Global Languages (100+)
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md">
                  Multi-Language
                </span>
              </div>

              {/* Search Box */}
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Search 100+ languages..."
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-hidden focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Scrollable Language List */}
              <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        handleSelectLanguage(l.code, l.name);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                        language === l.code
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{l.flag}</span>
                        <div className="truncate">
                          <span className="font-semibold">{l.native}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">({l.name})</span>
                        </div>
                      </div>
                      {language === l.code && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                    </button>
                  ))
                ) : (
                  <p className="text-center py-4 text-xs text-slate-400">No matching language found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. PWA APP INSTALL BUTTON (Responsive for Mobile & Desktop) */}
        <PwaInstallButton variant="header-compact" />

        {/* 4. INTERACTIVE DARK / LIGHT THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="flex h-8 sm:h-8.5 w-8 sm:w-8.5 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131B2E] text-slate-600 dark:text-amber-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-2xs shrink-0"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* 4. INTERACTIVE NOTIFICATION CENTER DROPDOWN */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              if (!notifOpen) fetchLiveAlerts();
            }}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131B2E] text-slate-600 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-2xs relative"
            title="Notifications & Alerts"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] shadow-2xl animate-fade-in text-xs overflow-hidden">
              {/* Notification Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <h4 className="font-display font-bold text-slate-900 dark:text-white">
                    {t('activeAlerts', 'Notifications & Alerts')}
                  </h4>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAlertsRead}
                    className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                {alertsLoading ? (
                  <div className="py-8 text-center text-slate-400">Loading alerts...</div>
                ) : alerts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400 mb-1" />
                    <p className="font-semibold text-slate-700 dark:text-slate-200">All clear!</p>
                    <p className="text-[11px]">No active leak or overuse alerts</p>
                  </div>
                ) : (
                  alerts.slice(0, 5).map((a) => {
                    const visual = getAlertDetails(a);
                    const AlertIcon = visual.Icon;
                    return (
                      <div
                        key={a.id}
                        className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-3"
                      >
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${visual.iconClass}`}>
                          <AlertIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {visual.title}
                            </p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${visual.badgeClass}`}>
                              {visual.badge}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 mt-0.5">
                            {a.message}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            {formatNotificationTime(a)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Notification Footer Link */}
              <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-2.5 text-center">
                {(() => {
                  const hub = getNotificationHubLink();
                  return (
                    <Link
                      to={hub.to}
                      onClick={() => setNotifOpen(false)}
                      className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                    >
                      {hub.label}
                    </Link>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        {/* 5. INTERACTIVE USER PROFILE DROPDOWN MENU */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-[#131B2E] p-1.5 pr-2.5 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all active:scale-98"
            title="User Account Menu"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white shadow-sm">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{user?.fullName}</p>
              <Badge variant={getRoleVariant()} size="sm" className="mt-0.5 text-[10px] px-1.5 py-0">
                {getRoleName()}
              </Badge>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 z-50 w-56 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] p-2 shadow-2xl animate-fade-in text-xs">
              {/* Account Bio Header */}
              <div className="p-2.5 border-b border-slate-100 dark:border-slate-700 mb-1">
                <p className="font-bold text-slate-900 dark:text-white truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email}</p>
                <span className="inline-block mt-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[10px] font-bold px-2 py-0.5 border border-brand-200 dark:border-brand-800">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>

              {/* Menu Links */}
              <div className="space-y-1">
                <Link
                  to={getProfilePath()}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-700 dark:hover:text-brand-300 font-semibold transition-colors"
                >
                  <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <span>{t('profileSettings', 'My Profile & Settings')}</span>
                </Link>

                {user?.role === 'COMMUNITY_ADMIN' && (
                  <Link
                    to="/community-admin/households"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-700 dark:hover:text-brand-300 font-semibold transition-colors"
                  >
                    <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span>{t('householdsDirectory', 'Households Directory')}</span>
                  </Link>
                )}

                {user?.role === 'RESIDENT' && (
                  <Link
                    to="/resident/usage"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-700 dark:hover:text-brand-300 font-semibold transition-colors"
                  >
                    <Droplets className="h-4 w-4 text-brand-500" />
                    <span>{t('usageHistory', 'My Water Usage Logs')}</span>
                  </Link>
                )}

                <div className="pt-1">
                  <PwaInstallButton variant="sidebar" />
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 my-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('signOut', 'Sign Out')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
