import React, { useState, useEffect } from 'react';
import { residentApi, residentBillingApi, extractErrorMessage } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { ConsumptionComparisonView } from '../../components/ConsumptionComparisonView';
import { exportMeterReadingsToCsv, printInvoiceStatement } from '../../utils/exportUtils';
import {
  Droplets,
  Gauge,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Lightbulb,
  ArrowRight,
  AlertTriangle,
  BellRing,
  Activity,
  History,
  Download,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  Check,
  Zap,
  IndianRupee,
  Layers,
  Award,
  Filter,
  ShieldCheck,
  RefreshCw,
  Eye,
  Printer,
  Sliders,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';
import type { ResidentDashboard as DashboardData, Invoice, TariffPlan } from '../../types';
import {
  fetchGeminiPersonalizedTips,
  extractTopHouseholdInsight,
  type WaterTip,
  type HouseholdProfileForTips,
  type TopHouseholdInsight,
} from '../../services/geminiWaterTipsService';

export const ResidentDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tariff, setTariff] = useState<TariffPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gemini AI Personalized Water Tips
  const [aiTips, setAiTips] = useState<WaterTip[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [topInsight, setTopInsight] = useState<TopHouseholdInsight | null>(null);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BENCHMARK' | 'TIPS' | 'INVOICES'>('OVERVIEW');

  // Tips Category Filter
  const [selectedTipCategory, setSelectedTipCategory] = useState<'ALL' | 'BATHROOM' | 'KITCHEN' | 'LAUNDRY' | 'LEAKS' | 'HABITS'>('ALL');

  // Completed Tips in Local Storage
  const [completedTips, setCompletedTips] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jalsetu_completed_tips');
      return saved ? JSON.parse(saved) : ['tip-bathroom-aerator'];
    } catch {
      return ['tip-bathroom-aerator'];
    }
  });

  const toggleTipCompleted = (tipId: string) => {
    setCompletedTips((prev) => {
      const next = prev.includes(tipId) ? prev.filter((id) => id !== tipId) : [...prev, tipId];
      try {
        localStorage.setItem('jalsetu_completed_tips', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, invList, tariffData] = await Promise.all([
        residentApi.getDashboard(),
        residentBillingApi.getInvoices().catch(() => []),
        residentBillingApi.getTariffPlan().catch(() => null),
      ]);
      setData(res);
      setInvoices(invList);
      setTariff(tariffData);

      // Build profile for Gemini AI water tips
      const isHigh = (res.currentMonthConsumption || 0) > (res.communityAvgConsumption || 11.2);
      const hasLeak = res.activeAlerts?.some((a) => a.type === 'ANOMALY') || false;
      const hasOveruse = res.activeAlerts?.some((a) => a.type === 'OVERUSE') || isHigh;

      const profile: HouseholdProfileForTips = {
        flatNumber: res.flatNumber || 'Flat',
        apartmentName: res.apartmentName || 'Paras Garden Apartments',
        occupancyCount: 3,
        currentMonthUsageKl: res.currentMonthConsumption || 0,
        apartmentAvgUsageKl: res.communityAvgConsumption || 11.2,
        currentSlabName: tariffData?.slabs?.[1]?.name || 'Standard Tier (Slab 2)',
        currentSlabRate: tariffData?.slabs?.[1]?.ratePerKl || 28.0,
        activeAlertsCount: res.activeAlertsCount || 0,
        hasLeakAlert: hasLeak,
        hasOveruseAlert: hasOveruse,
        recentLogs: res.recentLogs?.map((l) => ({ readingDate: l.readingDate, consumptionKl: l.consumptionKl })),
        usageTrends: res.usageTrends,
      };

      setTipsLoading(true);
      fetchGeminiPersonalizedTips(profile)
        .then((generated) => {
          setAiTips(generated);
          setTopInsight(extractTopHouseholdInsight(profile, generated));
        })
        .catch((e) => {
          console.warn('Gemini tips fetch failed:', e);
        })
        .finally(() => {
          setTipsLoading(false);
        });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateTips = async () => {
    if (!data) return;
    try {
      setTipsLoading(true);
      const isHigh = (data.currentMonthConsumption || 0) > (data.communityAvgConsumption || 11.2);
      const hasLeak = data.activeAlerts?.some((a) => a.type === 'ANOMALY') || false;
      const hasOveruse = data.activeAlerts?.some((a) => a.type === 'OVERUSE') || isHigh;

      const profile: HouseholdProfileForTips = {
        flatNumber: data.flatNumber || 'Flat',
        apartmentName: data.apartmentName || 'Paras Garden Apartments',
        occupancyCount: 3,
        currentMonthUsageKl: data.currentMonthConsumption || 0,
        apartmentAvgUsageKl: data.communityAvgConsumption || 11.2,
        currentSlabName: tariff?.slabs?.[1]?.name || 'Standard Tier (Slab 2)',
        currentSlabRate: tariff?.slabs?.[1]?.ratePerKl || 28.0,
        activeAlertsCount: data.activeAlertsCount || 0,
        hasLeakAlert: hasLeak,
        hasOveruseAlert: hasOveruse,
        recentLogs: data.recentLogs?.map((l) => ({ readingDate: l.readingDate, consumptionKl: l.consumptionKl })),
        usageTrends: data.usageTrends,
      };

      const freshTips = await fetchGeminiPersonalizedTips(profile, selectedTipCategory);
      setAiTips(freshTips);
      setTopInsight(extractTopHouseholdInsight(profile, freshTips));
    } catch (err) {
      console.warn('Regenerate tips error:', err);
    } finally {
      setTipsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await residentApi.markAlertRead(id);
      fetchDashboard();
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const handleDownloadCsv = () => {
    if (data?.recentLogs) {
      exportMeterReadingsToCsv(data.recentLogs, data.flatNumber || 'MyFlat');
    }
  };

  const handleDownloadPdf = async (invoiceId: number, invoiceNumber: string) => {
    try {
      await residentBillingApi.downloadInvoicePdf(invoiceId, invoiceNumber);
    } catch (err) {
      console.warn('Backend PDF download fallback:', err);
      const inv = invoices.find((i) => i.id === invoiceId);
      if (inv) {
        printInvoiceStatement(inv);
      }
    }
  };

  const isBelowAverage =
    data && data.communityAvgConsumption > 0
      ? data.currentMonthConsumption <= data.communityAvgConsumption
      : true;

  const unreadOveruseAlerts = data?.activeAlerts?.filter((a) => !a.isRead && a.type === 'OVERUSE') || [];

  // Current Month / Billing Cycle Calculations
  const currentMonthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  const currentConsumption = data?.currentMonthConsumption || 0;
  const baseTierLimit = tariff?.baseTierLimitKl || 10;
  const baseRate = tariff?.baseRatePerKl || 15;
  const midTierLimit = tariff?.midTierLimitKl || 25;
  const midRate = tariff?.midRatePerKl || 25;
  const higherRate = tariff?.higherRatePerKl || 45;
  const baseMaintenanceFee = tariff?.baseMaintenanceFee || 150;

  // Estimated Metered Charge
  let estimatedMeteredCharge = 0;
  if (currentConsumption <= baseTierLimit) {
    estimatedMeteredCharge = currentConsumption * baseRate;
  } else if (currentConsumption <= midTierLimit) {
    estimatedMeteredCharge = baseTierLimit * baseRate + (currentConsumption - baseTierLimit) * midRate;
  } else {
    estimatedMeteredCharge =
      baseTierLimit * baseRate +
      (midTierLimit - baseTierLimit) * midRate +
      (currentConsumption - midTierLimit) * higherRate;
  }
  const estimatedTotalBill = Math.round(baseMaintenanceFee + estimatedMeteredCharge);
  const tierProgressPercent = Math.min(100, Math.round((currentConsumption / baseTierLimit) * 100));

  // Latest unpaid invoice
  const unpaidInvoice = invoices.find((i) => i.status !== 'PAID');
  const latestInvoice = invoices[0] || null;

  // Filtered Tips
  const filteredTips = aiTips.filter(
    (t) => selectedTipCategory === 'ALL' || t.category === selectedTipCategory
  );

  const totalSavedKl = aiTips
    .filter((t) => completedTips.includes(t.id))
    .reduce((sum, t) => sum + (t.potentialSavingsKl || 0), 0);

  const totalSavedInr = aiTips
    .filter((t) => completedTips.includes(t.id))
    .reduce((sum, t) => sum + (t.potentialSavingsInr || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* OVERUSE NOTIFICATION BANNER (When high consumption is detected) */}
      {unreadOveruseAlerts.length > 0 && (
        <div className="rounded-2xl border border-amber-200/90 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-4 sm:p-5 shadow-xs animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-3.5">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                    High Water Usage Notice
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-amber-800 dark:text-amber-300 font-semibold">Verification Recommended</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {unreadOveruseAlerts[0].message}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400">
                  Tip: Check for running toilet flushes, RO purifier drain lines, or open outdoor taps.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleMarkRead(unreadOveruseAlerts[0].id)}
              className="w-full sm:w-auto shrink-0 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 shadow-xs transition-all active:scale-95 cursor-pointer text-center"
            >
              Acknowledge Alert
            </button>
          </div>
        </div>
      )}

      {/* Welcome Banner with Quick Action Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t('welcomeHome', 'Welcome home')}, Flat {data?.flatNumber || '--'}
            </h2>
            {data?.meterSerialNumber && (
              <span className="rounded-lg bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold text-brand-700 dark:text-brand-300">
                {data.meterSerialNumber}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {data?.apartmentName || 'Paras Garden'} • {t('waterMonitoringPortal', 'Real-time Water Monitoring & Automated Conservation Portal')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDashboard}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{t('refresh', 'Refresh')}</span>
          </button>

          <Link
            to="/resident/invoices"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-brand-600 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 hover:shadow-brand-500/25 transition-all"
          >
            <Receipt className="h-4 w-4" />
            <span>{t('payViewBills', 'Pay & View Bills')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('currentMonthUsage', 'Current Month Usage')}
          value={data ? `${data.currentMonthConsumption} kL` : '--'}
          subtitle={t('totalVolumeConsumed', 'Total volume consumed')}
          icon={Droplets}
          iconBgColor="bg-brand-50 dark:bg-brand-950/60"
          iconColor="text-brand-600 dark:text-brand-400"
        />
        <StatCard
          title={t('lastReading', 'Last Meter Reading')}
          value={data?.lastReadingValue ? `${data.lastReadingValue} kL` : (data ? '0.00 kL' : '--')}
          subtitle={data?.lastReadingDate && data.lastReadingDate !== 'No readings yet' ? `${t('loggedOn', 'Logged on')} ${data.lastReadingDate}` : t('noLogsYet', 'No logs yet')}
          icon={Gauge}
          iconBgColor="bg-sky-50 dark:bg-sky-950/60"
          iconColor="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          title={t('communityBenchmark', 'Community Benchmark')}
          value={data ? `${data.communityAvgConsumption} kL` : '--'}
          subtitle={isBelowAverage ? t('belowCommunityAvg', '🌟 Below community average') : t('aboveCommunityAvg', '⚠️ Above community average')}
          icon={TrendingDown}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title={t('activeAlerts', 'Active Alerts')}
          value={data?.activeAlertsCount ?? '--'}
          subtitle={data?.activeAlertsCount ? `${data.activeAlertsCount} ${t('unreadNotices', 'unread notices')}` : t('noActiveAlerts', 'No active alerts')}
          icon={AlertCircle}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'OVERVIEW'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#131B2E] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>{t('overviewTrends', 'Overview & Trends')}</span>
        </button>

        <button
          onClick={() => setActiveTab('BENCHMARK')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'BENCHMARK'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#131B2E] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>{t('peerBenchmarking', 'Peer Benchmarking & Efficiency')}</span>
        </button>

        <button
          onClick={() => setActiveTab('TIPS')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'TIPS'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#131B2E] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <span>{t('waterSavingTips', 'Water-Saving Tips')} ({completedTips.length} {t('done', 'Done')})</span>
        </button>

        <button
          onClick={() => setActiveTab('INVOICES')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'INVOICES'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#131B2E] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>{t('invoicesBillingHistory', 'Invoices & Billing History')} ({invoices.length})</span>
        </button>
      </div>

      {/* ==================== TAB 1: OVERVIEW & TRENDS ==================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8 animate-fade-in">
          {/* Gemini AI Smart Water Insights Highlight Card */}
          {topInsight && (
            <div className={`rounded-2xl border p-6 sm:p-7 shadow-card transition-all relative overflow-hidden ${
              topInsight.priority === 'CRITICAL'
                ? 'border-rose-300 dark:border-rose-900/80 bg-gradient-to-r from-rose-500/10 via-rose-50/70 to-amber-50/40 dark:from-rose-950/40 dark:via-[#131B2E] dark:to-[#0B1120]'
                : topInsight.diffPercent > 10
                ? 'border-amber-300 dark:border-amber-900/80 bg-gradient-to-r from-amber-500/10 via-amber-50/70 to-brand-50/40 dark:from-amber-950/40 dark:via-[#131B2E] dark:to-[#0B1120]'
                : 'border-teal-200 dark:border-teal-900/80 bg-gradient-to-r from-teal-500/10 via-emerald-50/60 to-brand-50/40 dark:from-teal-950/40 dark:via-[#131B2E] dark:to-[#0B1120]'
            }`}>
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="h-3 w-3 animate-pulse text-teal-600 dark:text-teal-400" />
                      <span>Gemini AI Water Insight</span>
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      LPCD: ~{topInsight.lpcd} L/person/day
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      topInsight.diffPercent > 0
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {topInsight.diffPercent > 0 ? `+${topInsight.diffPercent}% vs Society Avg` : `${topInsight.diffPercent}% vs Society Avg`}
                    </span>
                  </div>

                  <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {topInsight.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {topInsight.subtext} Top recommendation: <strong className="text-slate-900 dark:text-white">{topInsight.recommendedAction}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 shadow-xs text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Target Savings</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      Save ~₹{topInsight.potentialSavingsInr}/mo
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      (~{topInsight.potentialSavingsKl} kL/mo)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('TIPS')}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span>View All AI Tips</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Top Split: Usage Trends & Current Cycle Summary */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Consumption Area Chart */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-card lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {t('consumptionTrends', 'Water Consumption Trend (kL)')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('dailyMeteredUsage', 'Daily metered usage over recent recorded dates')}
                  </p>
                </div>
                <Link
                  to="/resident/usage"
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
                >
                  {t('viewFullHistory', 'View Full History')} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                </div>
              ) : !data?.usageTrends || data.usageTrends.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <Droplets className="h-9 w-9 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t('noUsageLogsAvailable', 'No usage logs available')}</p>
                  <p className="text-[11px] text-slate-400">{t('logFirstReading', 'Log your first meter reading to start tracking trends.')}</p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.usageTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284C7" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#0284C7" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748B' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748B' }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] p-2.5 shadow-lg text-xs">
                                <p className="font-bold text-slate-900 dark:text-white">{payload[0].payload.label}</p>
                                <p className="text-brand-600 dark:text-brand-400 font-semibold">{payload[0].value} kL consumed</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="consumptionKl"
                        stroke="#0284C7"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorConsumption)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Right 1 Col: Current Billing Cycle Summary Card */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-brand-50/20 to-sky-50/30 dark:from-[#131B2E] dark:via-[#131B2E] dark:to-slate-900 p-6 shadow-card flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-brand-600" />
                    <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {t('currentBillingCycle', 'Current Billing Cycle')}
                    </h3>
                  </div>
                  <span className="rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 px-2.5 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-300">
                    {currentMonthName}
                  </span>
                </div>

                {/* Meter Tier Progress */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">{t('tier1SubsidizedAllowance', 'Tier 1 Subsidized Allowance:')}</span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      {currentConsumption.toFixed(1)} / {baseTierLimit} kL
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        currentConsumption > baseTierLimit
                          ? 'bg-rose-500'
                          : currentConsumption > baseTierLimit * 0.8
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${tierProgressPercent}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentConsumption <= baseTierLimit
                      ? `✨ ${(baseTierLimit - currentConsumption).toFixed(1)} kL remaining (Tier 1)`
                      : `⚠️ ${(currentConsumption - baseTierLimit).toFixed(1)} kL consumed (Tier 2)`}
                  </p>
                </div>

                {/* Estimated Bill Breakdown */}
                <div className="mt-5 rounded-2xl border border-slate-200/70 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t('baseMaintenanceFee', 'Base Maintenance Fee:')}</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">₹{baseMaintenanceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t('estimatedMeteredWater', 'Estimated Metered Water:')}</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">₹{estimatedMeteredCharge.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                    <span>{t('estimatedMonthBill', 'Estimated Month Bill:')}</span>
                    <span className="text-brand-600 dark:text-brand-400 font-mono">₹{estimatedTotalBill.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div>
                {unpaidInvoice ? (
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/80 dark:bg-amber-950/40 p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-amber-900 dark:text-amber-200">{t('unpaidBill', 'Unpaid Bill:')} ₹{unpaidInvoice.totalAmount.toFixed(2)}</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300">{t('dueOn', 'Due on')} {unpaidInvoice.dueDate}</p>
                    </div>
                    <Link
                      to="/resident/invoices"
                      className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 text-xs shadow-xs"
                    >
                      {t('payNow', 'Pay Now')}
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/80 dark:bg-emerald-950/40 p-3 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{t('allPriorSettled', 'All prior monthly invoices are fully settled!')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Peer Benchmarking Summary Snippet */}
          <ConsumptionComparisonView
            householdUsageKl={data?.currentMonthConsumption || 0}
            communityAvgKl={data?.communityAvgConsumption || 19.1}
            flatNumber={data?.flatNumber || 'Flat'}
            occupancyCount={3}
            areaSqft={1200}
          />

          {/* Recent Meter Readings Log */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Recent Meter Readings Log
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified daily meter readings logged by community administration or self-reported
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  disabled={!data?.recentLogs || data.recentLogs.length === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Export CSV</span>
                </button>

                <Link
                  to="/resident/usage"
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
                >
                  All Logs <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {!data?.recentLogs || data.recentLogs.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No meter readings recorded for your flat yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl">Log ID</th>
                      <th className="py-3 px-4">Reading Date</th>
                      <th className="py-3 px-4">Meter Reading (kL)</th>
                      <th className="py-3 px-4">Consumption (kL)</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4 rounded-r-xl text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                    {data.recentLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-brand-600 dark:text-brand-400 font-semibold">
                          LOG-{log.id}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {log.readingDate}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {log.meterReadingKl.toLocaleString()} kL
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {log.consumptionKl.toLocaleString()} kL
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            {log.source}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant={log.status === 'Overuse' ? 'overuse' : 'normal'} size="sm">
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: PEER BENCHMARKING ==================== */}
      {activeTab === 'BENCHMARK' && (
        <div className="space-y-6 animate-fade-in">
          <ConsumptionComparisonView
            householdUsageKl={data?.currentMonthConsumption || 0}
            communityAvgKl={data?.communityAvgConsumption || 19.1}
            flatNumber={data?.flatNumber || 'Flat'}
            occupancyCount={3}
            areaSqft={1200}
          />
        </div>
      )}

      {/* ==================== TAB 3: WATER SAVING TIPS FEED ==================== */}
      {activeTab === 'TIPS' && (
        <div className="space-y-6 animate-fade-in">
          {/* Achievement Trophy Banner */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-500/10 via-teal-50 to-emerald-50/40 dark:from-emerald-950/40 dark:to-slate-900 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/25">
                  <Award className="h-7 w-7" />
                </div>
                <div>
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Gemini AI Conservation Impact
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                    You have adopted {completedTips.length} of {aiTips.length} personalized habits
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Estimated monthly household impact: <strong className="text-emerald-700 dark:text-emerald-300">{totalSavedKl.toFixed(1)} kL saved (~₹{totalSavedInr}/month)</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRegenerateTips}
                  disabled={tipsLoading}
                  className="flex items-center gap-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/80 px-3.5 py-2 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${tipsLoading ? 'animate-spin' : ''}`} />
                  <span>{tipsLoading ? 'Evaluating Usage...' : 'Regenerate AI Tips'}</span>
                </button>

                <Link
                  to="/resident/water-tips"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-xs"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Savings Simulator</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All AI Tips' },
              { id: 'BATHROOM', label: '🚿 Bathroom & Showers' },
              { id: 'KITCHEN', label: '🍳 Kitchen & RO' },
              { id: 'LAUNDRY', label: '👕 Laundry & Eco Cycles' },
              { id: 'LEAKS', label: '🔍 Leak Audit & Pipes' },
              { id: 'HABITS', label: '🌱 Daily Habits' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedTipCategory(cat.id as any)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedTipCategory === cat.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tips Grid */}
          {tipsLoading ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] text-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Gemini AI is analyzing Flat {data?.flatNumber || 'A-101'}'s meter readings & slab rates...
              </p>
            </div>
          ) : filteredTips.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-10 text-center text-xs text-slate-500 dark:text-slate-400">
              No recommendations found for this filter. Try selecting "All AI Tips".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTips.map((tip) => {
                const isDone = completedTips.includes(tip.id);
                const isCritical = tip.priority === 'CRITICAL';
                return (
                  <div
                    key={tip.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                      isDone
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                        : isCritical
                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 shadow-card'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-card hover:border-brand-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                            isCritical ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {tip.priority}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                            {tip.category}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                          <Droplets className="h-3 w-3" />
                          ~{tip.potentialSavingsLiters.toLocaleString()} L/mo
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {tip.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {tip.description}
                      </p>

                      {tip.actionSteps && tip.actionSteps.length > 0 && (
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5 border border-slate-100 dark:border-slate-800 space-y-1">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Action Step:</p>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300">• {tip.actionSteps[0]}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        Saves: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">₹{tip.potentialSavingsInr}/mo</strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleTipCompleted(tip.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Adopted</span>
                          </>
                        ) : (
                          <span>I will do this</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 4: INVOICES & BILLING HISTORY ==================== */}
      {activeTab === 'INVOICES' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Monthly Water Invoices
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Itemized bills rendered with tiered volumetric slabs, base fee, and shared tanker apportionment
                </p>
              </div>

              <Link
                to="/resident/invoices"
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition-all shadow-xs"
              >
                <span>Full Billing Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {invoices.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No invoices generated yet for your flat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl">Invoice No</th>
                      <th className="py-3 px-4">Billing Month</th>
                      <th className="py-3 px-4">Consumption</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {inv.billingMonth}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-white">{inv.consumptionKl} kL</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold font-mono text-sm text-slate-900 dark:text-white">
                          ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {inv.dueDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              inv.status === 'PAID'
                                ? 'normal'
                                : inv.status === 'OVERDUE'
                                ? 'overuse'
                                : 'billing'
                            }
                            size="sm"
                          >
                            {inv.status === 'PAID' ? '✓ Paid' : inv.status === 'OVERDUE' ? '⚠️ Overdue' : '⏳ Pending'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                              className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 transition-all cursor-pointer"
                              title="Download PDF Bill"
                            >
                              <Download className="h-3 w-3 text-brand-600 dark:text-brand-400" />
                              <span>PDF</span>
                            </button>

                            {inv.status !== 'PAID' && (
                              <Link
                                to="/resident/invoices"
                                className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-700 transition-all shadow-xs"
                              >
                                <CreditCard className="h-3 w-3" />
                                <span>Pay</span>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
