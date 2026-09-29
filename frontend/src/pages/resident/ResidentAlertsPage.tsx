import React, { useState, useEffect } from 'react';
import { residentApi, extractErrorMessage } from '../../services/api';
import type { Alert } from '../../types';
import { Link } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  Droplets,
  Receipt,
  CheckCircle2,
  RefreshCw,
  Search,
  Check,
  LifeBuoy,
  ArrowRight,
  Clock,
  ShieldAlert,
  CreditCard,
  FileText,
  Activity,
} from 'lucide-react';

export const ResidentAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter States
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'ANOMALY' | 'OVERUSE' | 'BILL_READY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await residentApi.getAlerts();
      setAlerts(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (alertId: number) => {
    try {
      await residentApi.markAlertRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleMarkAllRead = async () => {
    const unread = alerts.filter((a) => !a.isRead);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map((a) => residentApi.markAlertRead(a.id)));
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      setSuccessMsg('All alerts marked as read.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'UNREAD' && a.isRead) return false;
    if (filterType === 'ANOMALY' && a.type !== 'ANOMALY') return false;
    if (filterType === 'OVERUSE' && a.type !== 'OVERUSE') return false;
    if (filterType === 'BILL_READY' && a.type !== 'BILL_READY') return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return a.message.toLowerCase().includes(q) || a.type.toLowerCase().includes(q);
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const anomalyCount = alerts.filter((a) => a.type === 'ANOMALY').length;
  const overuseCount = alerts.filter((a) => a.type === 'OVERUSE').length;
  const billCount = alerts.filter((a) => a.type === 'BILL_READY').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Bell className="h-5 w-5" />
            </div>
            Water Usage &amp; Leak Alerts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time notifications regarding daily consumption spikes, tiered rate warnings, and official billing receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAlerts}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-700 dark:text-emerald-300 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {/* Leak Anomalies */}
        <div
          onClick={() => setFilterType(filterType === 'ANOMALY' ? 'ALL' : 'ANOMALY')}
          className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:scale-[1.01] ${
            filterType === 'ANOMALY'
              ? 'border-rose-500 bg-rose-500 text-white dark:border-rose-500 shadow-rose-500/20'
              : 'border-rose-200/80 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span className={filterType === 'ANOMALY' ? 'text-white' : 'text-rose-700 dark:text-rose-400'}>
              Leak Anomalies
            </span>
            <ShieldAlert className={`h-4 w-4 ${filterType === 'ANOMALY' ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`} />
          </div>
          <p className={`font-display text-2xl font-black mt-2 tabular-nums ${filterType === 'ANOMALY' ? 'text-white' : 'text-rose-900 dark:text-rose-200'}`}>
            {anomalyCount}
          </p>
          <p className={`text-[11px] mt-0.5 ${filterType === 'ANOMALY' ? 'text-rose-100' : 'text-rose-600 dark:text-rose-400'}`}>
            Outlier usage spikes detected
          </p>
        </div>

        {/* Overuse Surcharges */}
        <div
          onClick={() => setFilterType(filterType === 'OVERUSE' ? 'ALL' : 'OVERUSE')}
          className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:scale-[1.01] ${
            filterType === 'OVERUSE'
              ? 'border-amber-500 bg-amber-500 text-white dark:border-amber-500 shadow-amber-500/20'
              : 'border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span className={filterType === 'OVERUSE' ? 'text-white' : 'text-amber-700 dark:text-amber-400'}>
              Overuse Warnings
            </span>
            <AlertTriangle className={`h-4 w-4 ${filterType === 'OVERUSE' ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
          </div>
          <p className={`font-display text-2xl font-black mt-2 tabular-nums ${filterType === 'OVERUSE' ? 'text-white' : 'text-amber-900 dark:text-amber-200'}`}>
            {overuseCount}
          </p>
          <p className={`text-[11px] mt-0.5 ${filterType === 'OVERUSE' ? 'text-amber-100' : 'text-amber-600 dark:text-amber-400'}`}>
            Progressive slab rate triggers
          </p>
        </div>

        {/* Billing & Receipts */}
        <div
          onClick={() => setFilterType(filterType === 'BILL_READY' ? 'ALL' : 'BILL_READY')}
          className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:scale-[1.01] ${
            filterType === 'BILL_READY'
              ? 'border-sky-500 bg-sky-500 text-white dark:border-sky-500 shadow-sky-500/20'
              : 'border-sky-200/80 bg-sky-50/50 dark:border-sky-900/40 dark:bg-sky-950/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span className={filterType === 'BILL_READY' ? 'text-white' : 'text-sky-700 dark:text-sky-400'}>
              Invoices &amp; Receipts
            </span>
            <Receipt className={`h-4 w-4 ${filterType === 'BILL_READY' ? 'text-white' : 'text-sky-600 dark:text-sky-400'}`} />
          </div>
          <p className={`font-display text-2xl font-black mt-2 tabular-nums ${filterType === 'BILL_READY' ? 'text-white' : 'text-sky-900 dark:text-sky-200'}`}>
            {billCount}
          </p>
          <p className={`text-[11px] mt-0.5 ${filterType === 'BILL_READY' ? 'text-sky-100' : 'text-sky-600 dark:text-sky-400'}`}>
            Monthly statements &amp; payments
          </p>
        </div>

        {/* Unread Alerts */}
        <div
          onClick={() => setFilterType(filterType === 'UNREAD' ? 'ALL' : 'UNREAD')}
          className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:scale-[1.01] ${
            filterType === 'UNREAD'
              ? 'border-brand-600 bg-brand-600 text-white shadow-brand-500/20'
              : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#131B2E]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span className={filterType === 'UNREAD' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
              Unread Alerts
            </span>
            <Bell className={`h-4 w-4 ${filterType === 'UNREAD' ? 'text-white' : 'text-brand-600 dark:text-brand-400'}`} />
          </div>
          <p className={`font-display text-2xl font-black mt-2 tabular-nums ${filterType === 'UNREAD' ? 'text-white' : 'text-brand-600 dark:text-brand-400'}`}>
            {unreadCount}
          </p>
          <p className={`text-[11px] mt-0.5 ${filterType === 'UNREAD' ? 'text-brand-100' : 'text-slate-400 dark:text-slate-500'}`}>
            Actionable advisories
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#131B2E] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'ALL', label: `All Alerts (${alerts.length})` },
              { id: 'UNREAD', label: `Unread (${unreadCount})` },
              { id: 'ANOMALY', label: `Leak Anomalies (${anomalyCount})` },
              { id: 'OVERUSE', label: `Overuse Warnings (${overuseCount})` },
              { id: 'BILL_READY', label: `Invoices & Receipts (${billCount})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterType(t.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                filterType === t.id
                  ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#131B2E]">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3 dark:border-slate-800 dark:bg-[#131B2E]">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <h3 className="font-display text-base font-bold text-slate-800 dark:text-white">All Clear! No Matching Alerts</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your water meters are operating normally with zero unresolved anomalies or overdue items.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredAlerts.map((alert) => {
            const isAnomaly = alert.type === 'ANOMALY';
            const isOveruse = alert.type === 'OVERUSE';
            const isBill = alert.type === 'BILL_READY';
            const isPaidBill = isBill && (
              alert.message.toLowerCase().includes('payment of') ||
              alert.message.toLowerCase().includes('successfully processed') ||
              alert.message.toLowerCase().includes('paid')
            );

            let borderStyle = 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#131B2E]';
            let iconBox = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            let IconComponent = Bell;

            if (isAnomaly) {
              borderStyle = alert.isRead
                ? 'border-rose-200/70 bg-white dark:border-rose-900/40 dark:bg-[#131B2E]'
                : 'border-rose-300 bg-rose-50/40 ring-1 ring-rose-200 dark:border-rose-800 dark:bg-rose-950/20 dark:ring-rose-900/50';
              iconBox = 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
              IconComponent = Droplets;
            } else if (isOveruse) {
              borderStyle = alert.isRead
                ? 'border-amber-200/70 bg-white dark:border-amber-900/40 dark:bg-[#131B2E]'
                : 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-200 dark:border-amber-800 dark:bg-amber-950/20 dark:ring-amber-900/50';
              iconBox = 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
              IconComponent = AlertTriangle;
            } else if (isPaidBill) {
              borderStyle = alert.isRead
                ? 'border-emerald-200/70 bg-white dark:border-emerald-900/40 dark:bg-[#131B2E]'
                : 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/20 dark:ring-emerald-900/50';
              iconBox = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
              IconComponent = CheckCircle2;
            } else if (isBill) {
              borderStyle = alert.isRead
                ? 'border-sky-200/70 bg-white dark:border-sky-900/40 dark:bg-[#131B2E]'
                : 'border-sky-300 bg-sky-50/40 ring-1 ring-sky-200 dark:border-sky-800 dark:bg-sky-950/20 dark:ring-sky-900/50';
              iconBox = 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400';
              IconComponent = Receipt;
            }

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-5 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${borderStyle}`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBox} shadow-xs`}>
                    <IconComponent className="h-5 w-5" />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isAnomaly
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : isOveruse
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : isPaidBill
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      }`}>
                        {isPaidBill ? 'PAYMENT PROCESSED' : alert.type.replace('_', ' ')}
                      </span>

                      {!alert.isRead && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span>NEW</span>
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.sentAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Anomaly Actions */}
                  {isAnomaly && (
                    <>
                      <Link
                        to="/resident/usage"
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Activity className="h-3.5 w-3.5 text-brand-500" />
                        <span>Inspect Spike</span>
                      </Link>
                      <Link
                        to="/resident/support"
                        className="inline-flex items-center gap-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
                      >
                        <LifeBuoy className="h-3.5 w-3.5" />
                        <span>Report to Maintenance</span>
                      </Link>
                    </>
                  )}

                  {/* Overuse Actions */}
                  {isOveruse && (
                    <Link
                      to="/resident/usage"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 border border-amber-300 dark:border-amber-800 px-3.5 py-1.5 rounded-xl transition-colors"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      <span>View Usage Trends &amp; Tips</span>
                    </Link>
                  )}

                  {/* Bill Actions */}
                  {isBill && (
                    <Link
                      to="/resident/bills"
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors ${
                        isPaidBill
                          ? 'text-white bg-emerald-600 hover:bg-emerald-700'
                          : 'text-white bg-sky-600 hover:bg-sky-700'
                      }`}
                    >
                      {isPaidBill ? <FileText className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                      <span>{isPaidBill ? 'View Digital Receipt' : 'Pay Invoice Online'}</span>
                    </Link>
                  )}

                  {/* Mark Read */}
                  {!alert.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs active:scale-95 transition-all cursor-pointer"
                      title="Dismiss notification"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Dismiss</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
