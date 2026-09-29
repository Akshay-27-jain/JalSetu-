import React, { useState, useEffect } from 'react';
import { residentApi, extractErrorMessage } from '../../services/api';
import type { Announcement, AnnouncementCategory } from '../../types';
import {
  BellRing,
  Pin,
  Calendar,
  AlertTriangle,
  Info,
  Droplets,
  Wrench,
  Receipt,
  Search,
  RefreshCw,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

const CATEGORY_ICONS: Record<AnnouncementCategory, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  TANK_CLEANING: { label: 'Tank Cleaning Schedule', icon: Droplets, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  SUPPLY_INTERRUPTION: { label: 'Supply Interruption Notice', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  MAINTENANCE: { label: 'Pipeline Maintenance', icon: Wrench, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  BILLING_NOTICE: { label: 'Billing Cycle Update', icon: Receipt, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  WATER_QUALITY: { label: 'Water Quality Advisory', icon: AlertTriangle, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  GENERAL: { label: 'General Announcement', icon: Info, color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export const ResidentNoticesPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await residentApi.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = announcements.filter((a) => {
    const matchCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  const pinnedNotices = filteredNotices.filter((a) => a.isPinned);
  const otherNotices = filteredNotices.filter((a) => !a.isPinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="h-6 w-6 text-brand-600" />
            Community Notices &amp; Announcements
          </h2>
          <p className="text-xs text-slate-500">
            Official broadcasts, tank cleaning schedules, supply shutdown windows, and society water advisories.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchNotices}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-95 transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Notices</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
          {['ALL', 'TANK_CLEANING', 'SUPPLY_INTERRUPTION', 'MAINTENANCE', 'BILLING_NOTICE', 'GENERAL'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'All Notices' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Notices Feed */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <BellRing className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="font-display text-base font-bold text-slate-800">No Active Announcements</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no broadcasts or notices published for your residential society.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* PINNED NOTICES SECTION */}
          {pinnedNotices.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                <Pin className="h-4 w-4" />
                <span>Pinned High-Priority Notices</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {pinnedNotices.map((notice) => {
                  const cat = CATEGORY_ICONS[notice.category] || CATEGORY_ICONS.GENERAL;
                  const IconComp = cat.icon;
                  return (
                    <div
                      key={notice.id}
                      className="rounded-3xl border-2 border-brand-300 bg-gradient-to-r from-brand-50/60 via-white to-white p-6 shadow-card space-y-3 relative overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl border ${cat.color}`}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${cat.color}`}>
                            {cat.label}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                            <Pin className="h-3 w-3" /> Pinned
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {notice.publishDate}
                          </span>
                          {notice.expiryDate && (
                            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              Valid until {notice.expiryDate}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-display text-lg font-bold text-slate-900">{notice.title}</h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OTHER RECENT NOTICES */}
          {otherNotices.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Recent Community Announcements</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherNotices.map((notice) => {
                  const cat = CATEGORY_ICONS[notice.category] || CATEGORY_ICONS.GENERAL;
                  const IconComp = cat.icon;
                  return (
                    <div
                      key={notice.id}
                      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg border ${cat.color}`}>
                              <IconComp className="h-3.5 w-3.5" />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${cat.color}`}>
                              {cat.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {notice.publishDate}
                          </span>
                        </div>

                        <h4 className="font-display text-base font-bold text-slate-900">{notice.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                          {notice.content}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Official Notice #{notice.id}</span>
                        <span className="font-semibold text-slate-500">Community Management</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
