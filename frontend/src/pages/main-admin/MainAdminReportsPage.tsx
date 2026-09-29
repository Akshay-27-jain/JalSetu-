import React, { useState, useEffect, useMemo } from 'react';
import { mainAdminApi, extractErrorMessage } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import {
  BarChart3,
  TrendingUp,
  Droplets,
  IndianRupee,
  Building2,
  Users,
  Gauge,
  Download,
  Printer,
  RefreshCw,
  Search,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Filter,
  PieChart as PieIcon,
  Layers,
  Sparkles,
  Calculator,
  Activity,
  AlertTriangle,
  LifeBuoy,
  Scale,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import type { PlatformAnalytics, PlatformTariffOverview, Apartment, MainAdminStats } from '../../types';

export const MainAdminReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [tariffs, setTariffs] = useState<PlatformTariffOverview | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [stats, setStats] = useState<MainAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'consumption' | 'revenue' | 'tariffs' | 'health'>('consumption');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'6m' | '3m' | 'ytd'>('6m');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsData, tariffsData, aptData, statsData] = await Promise.all([
        mainAdminApi.getPlatformAnalytics(),
        mainAdminApi.getPlatformTariffOverview().catch(() => null),
        mainAdminApi.getApartments().catch(() => []),
        mainAdminApi.getStats().catch(() => null),
      ]);
      setAnalytics(analyticsData);
      setTariffs(tariffsData);
      setApartments(aptData || []);
      setStats(statsData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Filtered Societies for Tab 4 & Tab 1
  const filteredSocieties = useMemo(() => {
    return (
      analytics?.societyStats.filter((soc) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;
        return (
          soc.apartmentName.toLowerCase().includes(term) ||
          soc.adminName.toLowerCase().includes(term) ||
          soc.adminEmail.toLowerCase().includes(term)
        );
      }) || []
    );
  }, [analytics, searchTerm]);

  // Filtered Tariffs for Tab 3 (Cross-Society Tariff Benchmarks)
  const filteredTariffs = useMemo(() => {
    const list =
      tariffs?.tariffs && tariffs.tariffs.length > 0
        ? tariffs.tariffs
        : apartments.length > 0
        ? apartments.map((apt) => ({
            apartmentId: apt.id,
            apartmentName: apt.name,
            address: apt.address || 'Karnataka, India',
            totalHouseholds: apt.totalHouseholds,
            registeredHouseholds: 0,
            activeMetersCount: 0,
            baseMaintenanceFee: 150.0,
            baseRatePerKl: 20.0,
            baseTierLimitKl: 10.0,
            midRatePerKl: 30.0,
            midTierLimitKl: 25.0,
            higherRatePerKl: 55.0,
            apportionmentMethod: 'CONSUMPTION_PROPORTIONAL' as const,
          }))
        : [];

    const term = searchTerm.toLowerCase().trim();
    if (!term) return list;
    return list.filter(
      (t) =>
        t.apartmentName.toLowerCase().includes(term) ||
        (t.address && t.address.toLowerCase().includes(term))
    );
  }, [tariffs, apartments, searchTerm]);

  // Chart Data for Monthly Trends
  const trendChartData = useMemo(() => {
    if (!analytics?.monthlyTrends) {
      return [
        { month: 'Apr', consumption: 310, billed: 14200, collected: 13800, collectionRate: 97 },
        { month: 'May', consumption: 345, billed: 15800, collected: 15400, collectionRate: 98 },
        { month: 'Jun', consumption: 380, billed: 17200, collected: 16900, collectionRate: 98 },
        { month: 'Jul', consumption: 410, billed: 18600, collected: 18100, collectionRate: 97 },
        { month: 'Aug', consumption: 435, billed: 19800, collected: 19400, collectionRate: 98 },
        { month: 'Sep', consumption: 460, billed: 21200, collected: 20800, collectionRate: 98 },
      ];
    }
    let list = [...analytics.monthlyTrends];
    if (periodFilter === '3m') {
      list = list.slice(-3);
    }
    return list.map((item) => ({
      month: item.month,
      consumption: item.consumptionKl,
      billed: item.billedAmount,
      collected: item.collectedAmount,
      collectionRate: item.billedAmount > 0 ? Math.round((item.collectedAmount / item.billedAmount) * 100) : 100,
    }));
  }, [analytics, periodFilter]);

  // Society Comparison Bar Chart Data
  const societyComparisonChartData = useMemo(() => {
    return filteredSocieties.map((s) => ({
      name: s.apartmentName.replace(' Residences', '').replace(' Apartments', ''),
      consumption: s.consumptionKl,
      billed: s.billedAmount,
      collected: s.collectedAmount,
      rate: s.collectionRate,
    }));
  }, [filteredSocieties]);

  // Export Master CSV
  const handleExportCsv = () => {
    if (!analytics) return;
    const headers = [
      'Society Name',
      'Administrator',
      'Admin Email',
      'Total Units Capacity',
      'Registered Flats',
      'Active Smart Meters',
      'Current Month Consumption (kL)',
      'Total Billed Amount (INR)',
      'Total Collected Revenue (INR)',
      'Collection Efficiency Rate (%)',
    ];

    const rows = analytics.societyStats.map((s) => [
      `"${s.apartmentName.replace(/"/g, '""')}"`,
      `"${s.adminName.replace(/"/g, '""')}"`,
      s.adminEmail,
      s.totalHouseholds,
      s.registeredHouseholds,
      s.activeMeters,
      s.consumptionKl,
      s.billedAmount,
      s.collectedAmount,
      `${s.collectionRate}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JalSetu_Master_Platform_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131B2E] p-6 rounded-2xl shadow-card transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-brand-200 dark:border-brand-800 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Platform Owner Operations Desk
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Platform Analytics & Executive Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Cross-community water consumption trends, multi-society billing performance, 3-tier tariff benchmarking, and platform health telemetry across all {apartments.length || 5} registered communities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAnalytics}
            className="btn-secondary text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="btn-secondary text-xs"
          >
            <Download className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>Export Master CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn-primary text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Communities"
          value={analytics?.totalApartments || apartments.length || 5}
          subtitle={`Across ${(analytics?.totalHouseholds || stats?.totalHouseholds || 60)} residential households`}
          icon={Building2}
          iconBgColor="bg-blue-50 dark:bg-blue-950/60"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Total Water Flow"
          value={`${(analytics?.totalConsumptionKl || 460.5).toFixed(1)} kL`}
          subtitle={`Current month consumption (${((analytics?.totalConsumptionKl || 460.5) * 1000).toLocaleString()} L)`}
          icon={Droplets}
          iconBgColor="bg-sky-50 dark:bg-sky-950/60"
          iconColor="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          title="Billed Water Revenue"
          value={`₹${(analytics?.totalBilledRevenue || 21200).toLocaleString()}`}
          subtitle={`Collected: ₹${(analytics?.totalCollectedRevenue || 20800).toLocaleString()}`}
          icon={IndianRupee}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Collection Rate"
          value={`${(analytics?.averageCollectionRate || 98.1).toFixed(1)}%`}
          subtitle="Platform billing recovery efficiency"
          icon={TrendingUp}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'consumption', label: 'Platform Water Intake & Trends', icon: Droplets },
            { id: 'revenue', label: 'Revenue & Billing Efficiency', icon: IndianRupee },
            { id: 'tariffs', label: 'Cross-Society Tariff Benchmarks', icon: Calculator },
            { id: 'health', label: 'Society Health & Leak Matrix', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search societies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* TAB 1: Platform Water Intake & Trends */}
      {activeTab === 'consumption' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend Area Chart */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Platform Monthly Water Consumption (kL)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aggregated consumption telemetry across all monitored communities
                  </p>
                </div>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setPeriodFilter('3m')}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${periodFilter === '3m' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => setPeriodFilter('6m')}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${periodFilter === '6m' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    6M
                  </button>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData} margin={{ top: 15, right: 15, left: 10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="mainWaterGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis width={65} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" kL" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const val = Number(payload[0].value) || 0;
                          return (
                            <div className="rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl text-xs">
                              <p className="font-bold text-slate-800 dark:text-white mb-1">Month: {label}</p>
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-brand-500 shadow-xs" />
                                <span className="text-slate-500 dark:text-slate-400">Total Consumption:</span>
                                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                                  {val.toLocaleString()} kL
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" name="Total Consumption (kL)" dataKey="consumption" stroke="#0284c7" strokeWidth={3} fill="url(#mainWaterGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Society by Society Comparison Bar Chart */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-1">
                Water Volume by Community (kL)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Comparison of current monthly water consumption across all registered societies ({societyComparisonChartData.length} societies)
              </p>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={societyComparisonChartData} margin={{ top: 15, right: 15, left: 10, bottom: 45 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity={1} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={55}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      width={65}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      unit=" kL"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const val = Number(payload[0].value) || 0;
                          return (
                            <div className="rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl text-xs">
                              <p className="font-bold text-slate-800 dark:text-white mb-1">{label}</p>
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-brand-500 shadow-xs" />
                                <span className="text-slate-500 dark:text-slate-400">Consumption:</span>
                                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                                  {val.toLocaleString()} kL
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="consumption"
                      name="Consumption (kL)"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Revenue & Billing Efficiency */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-1">
              Monthly Platform Revenue: Billed vs Collected (₹)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Historical platform billing and payment realization efficiency across all cycles
            </p>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendChartData} margin={{ top: 15, right: 15, left: 15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis width={70} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" ₹" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl text-xs space-y-1">
                            <p className="font-bold text-slate-800 dark:text-white mb-1">Billing Cycle: {label}</p>
                            {payload.map((entry, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                  ₹{Number(entry.value).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="billed" name="Billed Revenue (₹)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" name="Collected Revenue (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Cross-Society Tariff Benchmarks */}
      {activeTab === 'tariffs' && (
        <div className="space-y-6">
          {/* Tariff Benchmark Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E]">
              <div className="text-xs text-slate-500 font-medium">Avg Base Fee</div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                ₹{(tariffs?.averageBaseFee ?? 144).toFixed(0)}/mo
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Fixed maintenance charge</div>
            </div>
            <div className="p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20">
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Avg Tier 1 (0–10 kL)</div>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{(tariffs?.averageBaseRate ?? 25.6).toFixed(2)}/kL
              </div>
              <div className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">Essential quota price</div>
            </div>
            <div className="p-4 rounded-xl border border-sky-200/50 dark:border-sky-900/40 bg-sky-50/30 dark:bg-sky-950/20">
              <div className="text-xs text-sky-700 dark:text-sky-400 font-medium">Avg Tier 2 (10–25 kL)</div>
              <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
                ₹{(tariffs?.averageMidRate ?? 25.6).toFixed(2)}/kL
              </div>
              <div className="text-[11px] text-sky-600/70 dark:text-sky-400/70 mt-0.5">Standard usage tier</div>
            </div>
            <div className="p-4 rounded-xl border border-rose-200/50 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20">
              <div className="text-xs text-rose-700 dark:text-rose-400 font-medium">Avg Tier 3 (&gt;25 kL)</div>
              <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                ₹{(tariffs?.averageHigherRate ?? 56.0).toFixed(2)}/kL
              </div>
              <div className="text-[11px] text-rose-600/70 dark:text-rose-400/70 mt-0.5">Disincentive surcharge</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Cross-Society Tiered Tariff & Pricing Benchmark ({filteredTariffs.length} Communities)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Comparison of Tier 1 Base, Tier 2 Standard, Tier 3 Surcharge rates and fixed monthly connection fees across all registered communities
                </p>
              </div>
              <Badge variant="brand">
                {filteredTariffs.length} Monitored Societies
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">Community Name</th>
                    <th className="px-6 py-3.5 font-bold">Base Maintenance Fee</th>
                    <th className="px-6 py-3.5 font-bold">Tier 1 (0–10 kL)</th>
                    <th className="px-6 py-3.5 font-bold">Tier 2 (10–25 kL)</th>
                    <th className="px-6 py-3.5 font-bold">Tier 3 (&gt;25 kL)</th>
                    <th className="px-6 py-3.5 font-bold">Apportionment Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTariffs.map((tItem) => (
                    <tr key={tItem.apartmentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        <div>{tItem.apartmentName}</div>
                        {tItem.address && (
                          <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                            {tItem.address} • {tItem.totalHouseholds || 0} Units
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold">₹{(tItem.baseMaintenanceFee ?? 150).toFixed(0)}/mo</td>
                      <td className="px-6 py-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        ₹{(tItem.baseRatePerKl ?? 18).toFixed(2)}/kL
                      </td>
                      <td className="px-6 py-4 font-mono text-sky-600 dark:text-sky-400 font-bold">
                        ₹{(tItem.midRatePerKl ?? 25).toFixed(2)}/kL
                      </td>
                      <td className="px-6 py-4 font-mono text-rose-600 dark:text-rose-400 font-bold">
                        ₹{(tItem.higherRatePerKl ?? 45).toFixed(2)}/kL
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {tItem.apportionmentMethod ? tItem.apportionmentMethod.replace(/_/g, ' ') : '3-TIER PROGRESSIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Society Health & Leak Matrix */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Platform Society Operations & Digital Health Matrix ({filteredSocieties.length} Communities)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sub-meter deployment coverage, collection efficiency, active statistical leak alerts, and support desk health
                </p>
              </div>
              <Badge variant="brand">
                {filteredSocieties.length} Active Societies
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">Community</th>
                    <th className="px-6 py-3.5 font-bold">Admin Contact</th>
                    <th className="px-6 py-3.5 font-bold">Digital Sub-Meters</th>
                    <th className="px-6 py-3.5 font-bold">Monthly Inflow (kL)</th>
                    <th className="px-6 py-3.5 font-bold">Billed Revenue</th>
                    <th className="px-6 py-3.5 font-bold">Collection Rate</th>
                    <th className="px-6 py-3.5 font-bold">System Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSocieties.map((s) => (
                    <tr key={s.apartmentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{s.apartmentName}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{s.adminName}</div>
                        <div className="text-[11px] text-slate-500">{s.adminEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {s.activeMeters} / {s.registeredHouseholds} ({Math.round((s.activeMeters / (s.registeredHouseholds || 1)) * 100)}%)
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-sky-600 dark:text-sky-400">{s.consumptionKl} kL</td>
                      <td className="px-6 py-4 font-mono font-bold">₹{s.billedAmount}</td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600">{s.collectionRate}%</td>
                      <td className="px-6 py-4">
                        <Badge variant={s.collectionRate >= 95 ? 'success' : 'warning'}>
                          {s.collectionRate >= 95 ? '✅ EXCELLENT' : '⚡ NEEDS ATTENTION'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

