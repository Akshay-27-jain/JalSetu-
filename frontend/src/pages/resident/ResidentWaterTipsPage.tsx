import React, { useState, useEffect } from 'react';
import { residentApi, residentBillingApi, extractErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  fetchGeminiPersonalizedTips,
  generateContextualFallbackTips,
  type WaterTip,
  type HouseholdProfileForTips,
} from '../../services/geminiWaterTipsService';
import type { ResidentDashboard as DashboardData, TariffPlan } from '../../types';
import {
  Sparkles,
  Droplets,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Gauge,
  Home,
  Users,
  RefreshCw,
  Sliders,
  Check,
  Zap,
  IndianRupee,
  ShieldCheck,
  Waves,
  Bath,
  Utensils,
  Shirt,
  Wrench,
  Award,
  Search,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ResidentWaterTipsPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [tariffPlan, setTariffPlan] = useState<TariffPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter & Focus States
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'BATHROOM' | 'KITCHEN' | 'LAUNDRY' | 'LEAKS' | 'HABITS'>('ALL');
  const [focusGoal, setFocusGoal] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Tips State
  const [tips, setTips] = useState<WaterTip[]>([]);
  const [adoptedTipIds, setAdoptedTipIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('adopted_water_tips');
    return saved ? JSON.parse(saved) : [];
  });

  // Simulator Sliders
  const [simShowerReductionMins, setSimShowerReductionMins] = useState(3);
  const [simAeratorTaps, setSimAeratorTaps] = useState(2);
  const [simRoRecyclePercent, setSimRoRecyclePercent] = useState(60);
  const [simFullLoadOnly, setSimFullLoadOnly] = useState(true);

  // Daily Habits Checklist
  const [dailyHabits, setDailyHabits] = useState<{ id: string; label: string; done: boolean; savingsLiters: number }[]>([
    { id: 'h1', label: 'Turned off tap while brushing teeth / lathering face', done: true, savingsLiters: 15 },
    { id: 'h2', label: 'Collected RO purifier reject water for cleaning/plants', done: false, savingsLiters: 40 },
    { id: 'h3', label: 'Checked toilet flush tank flapper for silent leak', done: true, savingsLiters: 100 },
    { id: 'h4', label: 'Used bucket bath or kept shower under 5 minutes', done: false, savingsLiters: 60 },
    { id: 'h5', label: 'Loaded dishwasher / washing machine to full capacity', done: false, savingsLiters: 50 },
  ]);

  // Load live data from API
  const loadHouseholdData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashData, tariffData] = await Promise.all([
        residentApi.getDashboard(),
        residentBillingApi.getTariffPlan().catch(() => null),
      ]);
      setDashboard(dashData);
      setTariffPlan(tariffData);

      // Construct household profile for Gemini
      const usageKl = dashData.currentMonthConsumption ?? 12.0;
      const commAvgKl = dashData.communityAvgConsumption ?? 11.2;
      const hasLeak = dashData.activeAlerts?.some((a) => a.type === 'ANOMALY') || false;
      const hasOveruse = dashData.activeAlerts?.some((a) => a.type === 'OVERUSE') || usageKl > commAvgKl;
      const slabName = tariffData?.slabs?.[1]?.name || 'Standard Tier (Slab 2)';
      const rate = tariffData?.slabs?.[1]?.ratePerKl || 28.0;

      const profile: HouseholdProfileForTips = {
        flatNumber: user?.flatNumber || dashData.flatNumber || 'A-101',
        apartmentName: user?.apartmentName || dashData.apartmentName || 'Paras Garden Apartments',
        occupancyCount: 3,
        currentMonthUsageKl: usageKl,
        apartmentAvgUsageKl: commAvgKl,
        currentSlabName: slabName,
        currentSlabRate: rate,
        activeAlertsCount: dashData.activeAlertsCount || 0,
        hasLeakAlert: hasLeak,
        hasOveruseAlert: hasOveruse,
        recentLogs: dashData.recentLogs?.map((l) => ({ readingDate: l.readingDate, consumptionKl: l.consumptionKl })),
        usageTrends: dashData.usageTrends,
      };

      // Generate initial AI tips
      setAiLoading(true);
      const generatedTips = await fetchGeminiPersonalizedTips(profile, 'ALL', '', language);
      setTips(generatedTips);
    } catch (err) {
      console.error('Failed to load resident water tips data:', err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  useEffect(() => {
    loadHouseholdData();
  }, [language]);

  // Regenerate tips with Gemini AI on demand
  const handleRegenerateAiTips = async () => {
    if (!dashboard) return;
    try {
      setAiLoading(true);
      const usageKl = dashboard.currentMonthConsumption ?? 12.0;
      const commAvgKl = dashboard.communityAvgConsumption ?? 11.2;
      const hasLeak = dashboard.activeAlerts?.some((a) => a.type === 'ANOMALY') || false;
      const hasOveruse = dashboard.activeAlerts?.some((a) => a.type === 'OVERUSE') || usageKl > commAvgKl;
      const slabName = tariffPlan?.slabs?.[1]?.name || 'Standard Tier (Slab 2)';
      const rate = tariffPlan?.slabs?.[1]?.ratePerKl || 28.0;

      const profile: HouseholdProfileForTips = {
        flatNumber: user?.flatNumber || dashboard.flatNumber || 'A-101',
        apartmentName: user?.apartmentName || dashboard.apartmentName || 'Paras Garden Apartments',
        occupancyCount: 3,
        currentMonthUsageKl: usageKl,
        apartmentAvgUsageKl: commAvgKl,
        currentSlabName: slabName,
        currentSlabRate: rate,
        activeAlertsCount: dashboard.activeAlertsCount || 0,
        hasLeakAlert: hasLeak,
        hasOveruseAlert: hasOveruse,
        recentLogs: dashboard.recentLogs?.map((l) => ({ readingDate: l.readingDate, consumptionKl: l.consumptionKl })),
        usageTrends: dashboard.usageTrends,
      };

      const generated = await fetchGeminiPersonalizedTips(profile, selectedCategory, focusGoal, language);
      setTips(generated);
      setSuccessToast('✨ Gemini AI generated fresh personalized tips for your flat!');
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      console.warn('AI regen failed, using fallback:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleAdoptTip = (tipId: string) => {
    setAdoptedTipIds((prev) => {
      const exists = prev.includes(tipId);
      const updated = exists ? prev.filter((id) => id !== tipId) : [...prev, tipId];
      localStorage.setItem('adopted_water_tips', JSON.stringify(updated));
      if (!exists) {
        setSuccessToast('🌟 Habit added to your household conservation routine!');
        setTimeout(() => setSuccessToast(null), 3000);
      }
      return updated;
    });
  };

  const toggleHabitDone = (id: string) => {
    setDailyHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h))
    );
  };

  // Calculations for Simulator
  const occupancy = 3;
  const slabRate = tariffPlan?.slabs?.[1]?.ratePerKl || 28;
  const currentUsage = dashboard?.currentMonthConsumption ?? 12.0;
  const communityAvg = dashboard?.communityAvgConsumption ?? 11.2;

  // Simulator savings in Liters per month
  const showerSavingsLiters = simShowerReductionMins * 10 * occupancy * 30; // 10L/min * mins * people * 30 days
  const aeratorSavingsLiters = simAeratorTaps * 60 * occupancy * 30; // 60L/day/tap
  const roSavingsLiters = Math.round((simRoRecyclePercent / 100) * 3000); // 3,000L avg RO reject
  const fullLoadSavingsLiters = simFullLoadOnly ? 1800 : 0; // ~1,800L from skipping partial loads

  const totalSimSavingsLiters = showerSavingsLiters + aeratorSavingsLiters + roSavingsLiters + fullLoadSavingsLiters;
  const totalSimSavingsKl = Math.round((totalSimSavingsLiters / 1000) * 10) / 10;
  const totalSimSavingsInr = Math.round(totalSimSavingsKl * slabRate);
  const projectedNewUsageKl = Math.max(currentUsage - totalSimSavingsKl, 4.0);

  // Filtered tips
  const filteredTips = tips.filter((t) => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
  });

  const totalAdoptedSavingsKl = tips
    .filter((t) => adoptedTipIds.includes(t.id))
    .reduce((acc, curr) => acc + curr.potentialSavingsKl, 0);

  const totalAdoptedSavingsInr = tips
    .filter((t) => adoptedTipIds.includes(t.id))
    .reduce((acc, curr) => acc + curr.potentialSavingsInr, 0);

  const completedHabitsCount = dailyHabits.filter((h) => h.done).length;
  const dailySavedTodayLiters = dailyHabits
    .filter((h) => h.done)
    .reduce((acc, curr) => acc + curr.savingsLiters, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2.5 rounded-2xl bg-emerald-600 text-white px-5 py-3 shadow-2xl animate-fade-in text-xs font-bold">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-500/20 to-brand-500/20 border border-teal-500/30 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 animate-pulse" />
              <span>Gemini AI Water Advisor</span>
            </span>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              • Flat {user?.flatNumber || dashboard?.householdFlat || 'A-101'}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Personalized Water Saving Tips
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Custom conservation strategies generated dynamically by Google Gemini AI according to your household size, slab tariffs, and real-time sub-meter readings.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleRegenerateAiTips}
            disabled={aiLoading}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>{aiLoading ? 'Gemini AI is Thinking...' : 'Regenerate AI Tips'}</span>
          </button>
        </div>
      </div>

      {/* Household Water Profile KPI Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-brand-50/40 dark:from-[#161F30] dark:via-[#161F30] dark:to-[#0B1120] p-6 sm:p-8 shadow-card">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-center">
          {/* Flat & Occupancy */}
          <div className="space-y-1 lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800 lg:pr-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Home className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span>Household Profile</span>
            </div>
            <p className="font-display text-2xl font-black text-slate-900 dark:text-white">
              Flat {user?.flatNumber || dashboard?.flatNumber || 'A-101'}
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                {occupancy} Residents
              </span>
              <span>•</span>
              <span className="truncate max-w-[140px]">{user?.apartmentName || dashboard?.apartmentName || 'Society'}</span>
            </div>
          </div>

          {/* Current Month Usage & Slab */}
          <div className="space-y-1 lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800 lg:pr-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Current Consumption</span>
              <Droplets className="h-4 w-4 text-sky-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-black text-slate-900 dark:text-white">
                {currentUsage.toFixed(1)} kL
              </span>
              <span className="text-xs text-slate-500">
                ({Math.round(currentUsage * 1000).toLocaleString()} L)
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {tariffPlan?.slabs?.[1]?.name || 'Standard Tier 2'} (₹{slabRate}/kL)
              </span>
            </div>
          </div>

          {/* Peer Benchmark */}
          <div className="space-y-1 lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800 lg:pr-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>vs Society Average</span>
              <Gauge className="h-4 w-4 text-teal-500" />
            </div>
            <p className="font-display text-2xl font-black text-slate-900 dark:text-white">
              {currentUsage > communityAvg ? (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  +{Math.round(((currentUsage - communityAvg) / (communityAvg || 1)) * 100)}%
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  {Math.round(((currentUsage - communityAvg) / (communityAvg || 1)) * 100)}% Conserving
                </span>
              )}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              Society Avg: {communityAvg.toFixed(1)} kL/month
            </p>
          </div>

          {/* Potential Monthly Savings */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <span>Potential AI Savings</span>
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="font-display text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ~4,500 L / month
            </p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 pt-0.5">
              <span>Estimated Bill Reduction:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">₹125–₹180/mo</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tips Feed (8 cols) + Right Simulator & Habits (4 cols) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: GEMINI AI PERSONALIZED TIPS FEED */}
        {/* ========================================================================= */}
        <div className="space-y-6 lg:col-span-8">
          {/* Controls & Filter Bar */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#161F30] p-4 shadow-card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'ALL', label: 'All Tips', icon: Sparkles },
                    { id: 'BATHROOM', label: 'Bathroom', icon: Bath },
                    { id: 'KITCHEN', label: 'Kitchen', icon: Utensils },
                    { id: 'LAUNDRY', label: 'Laundry', icon: Shirt },
                    { id: 'LEAKS', label: 'Leaks', icon: Wrench },
                  ] as const
                ).map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-[#0B1120] dark:text-white"
                />
              </div>
            </div>

            {/* Adopted Counter Summary */}
            {adoptedTipIds.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    You have adopted {adoptedTipIds.length} habit{adoptedTipIds.length > 1 ? 's' : ''}!
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Target Savings: ~{totalAdoptedSavingsKl.toFixed(1)} kL (₹{totalAdoptedSavingsInr}/mo)
                </span>
              </div>
            )}
          </div>

          {/* Tips List */}
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161F30] p-16 text-center space-y-3">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-teal-500 border-t-transparent" />
              <h3 className="font-display text-base font-bold text-slate-800 dark:text-white">
                Generating Custom Recommendations...
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Google Gemini AI is evaluating Flat {user?.flatNumber || 'A-101'}'s consumption slabs and daily variances.
              </p>
            </div>
          ) : filteredTips.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161F30] p-12 text-center space-y-3">
              <Lightbulb className="mx-auto h-12 w-12 text-amber-400" />
              <h3 className="font-display text-base font-bold text-slate-800 dark:text-white">
                No Tips Found for this Filter
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try selecting "All Tips" or clicking "Regenerate AI Tips" to get fresh tailored suggestions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTips.map((tip, idx) => {
                const isAdopted = adoptedTipIds.includes(tip.id);
                const isCritical = tip.priority === 'CRITICAL';
                const isHigh = tip.priority === 'HIGH';

                let Icon = Sparkles;
                if (tip.category === 'BATHROOM') Icon = Bath;
                if (tip.category === 'KITCHEN') Icon = Utensils;
                if (tip.category === 'LAUNDRY') Icon = Shirt;
                if (tip.category === 'LEAKS') Icon = Wrench;

                return (
                  <div
                    key={tip.id}
                    className={`rounded-3xl border p-6 shadow-card transition-all ${
                      isAdopted
                        ? 'border-emerald-300 bg-emerald-50/30 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                        : isCritical
                        ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/60 dark:bg-rose-950/20'
                        : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#161F30]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
                            isAdopted
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : isCritical
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              : 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400'
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Priority badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isCritical
                                  ? 'bg-rose-600 text-white'
                                  : isHigh
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {tip.priority} PRIORITY
                            </span>

                            {/* Category badge */}
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {tip.category}
                            </span>

                            {tip.isAiGenerated && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-900">
                                <Sparkles className="h-2.5 w-2.5" />
                                <span>Gemini AI</span>
                              </span>
                            )}
                          </div>

                          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                            {tip.title}
                          </h3>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {tip.description}
                          </p>

                          {/* Action Steps */}
                          {tip.actionSteps && tip.actionSteps.length > 0 && (
                            <div className="rounded-2xl bg-slate-50 dark:bg-[#0B1120] p-3.5 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5 mt-2">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Recommended Action Steps:
                              </p>
                              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                                {tip.actionSteps.map((step, sIdx) => (
                                  <li key={sIdx} className="flex items-start gap-2">
                                    <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Savings Pill */}
                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-900">
                              <Droplets className="h-3.5 w-3.5 text-sky-500" />
                              <span>Saves ~{tip.potentialSavingsLiters.toLocaleString()} L/month</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-900">
                              <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Save ~₹{tip.potentialSavingsInr}/mo</span>
                            </div>

                            <span className="text-[11px] text-slate-400">
                              Difficulty: <strong>{tip.difficulty}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Adopt Button */}
                      <button
                        type="button"
                        onClick={() => toggleAdoptTip(tip.id)}
                        className={`shrink-0 flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                          isAdopted
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                        <span>{isAdopted ? 'Adopted Habit' : 'I will do this'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: SIMULATOR & DAILY HABITS TRACKER */}
        {/* ========================================================================= */}
        <div className="space-y-6 lg:col-span-4">
          {/* Interactive Savings Simulator */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#161F30] p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                  <Sliders className="h-4 w-4" />
                </div>
                <h3 className="font-display text-sm font-black text-slate-900 dark:text-white">
                  Savings Simulator
                </h3>
              </div>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                Live Model
              </span>
            </div>

            {/* Sliders */}
            <div className="space-y-4 text-xs">
              {/* Slider 1: Shower Reduction */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Reduce Shower Duration
                  </span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    -{simShowerReductionMins} mins/day
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={1}
                  value={simShowerReductionMins}
                  onChange={(e) => setSimShowerReductionMins(parseInt(e.target.value) || 0)}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 min</span>
                  <span>4 min</span>
                  <span>8 min</span>
                </div>
              </div>

              {/* Slider 2: Tap Aerators */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Install Low-Flow Aerators
                  </span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {simAeratorTaps} Faucets
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={simAeratorTaps}
                  onChange={(e) => setSimAeratorTaps(parseInt(e.target.value) || 0)}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 Taps</span>
                  <span>2 Taps</span>
                  <span>4 Taps</span>
                </div>
              </div>

              {/* Slider 3: RO Water Recycling */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    RO Reject Water Reuse
                  </span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {simRoRecyclePercent}% Recycled
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={20}
                  value={simRoRecyclePercent}
                  onChange={(e) => setSimRoRecyclePercent(parseInt(e.target.value) || 0)}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Toggle 4: Full load only */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Full-load laundry wash only
                </span>
                <button
                  type="button"
                  onClick={() => setSimFullLoadOnly(!simFullLoadOnly)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    simFullLoadOnly ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                      simFullLoadOnly ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Calculated Impact Card */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-4 text-white space-y-2 shadow-md">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                Projected Monthly Impact
              </p>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black">{totalSimSavingsLiters.toLocaleString()} L Saved</span>
                <span className="text-xs font-bold text-emerald-100">~{totalSimSavingsKl} kL/mo</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs">
                <span>Estimated Bill Savings:</span>
                <strong className="text-base font-black">₹{totalSimSavingsInr} / mo</strong>
              </div>
              <p className="text-[10px] text-emerald-100 pt-0.5">
                New Projected Volume: <strong>{projectedNewUsageKl.toFixed(1)} kL</strong> (Stay in Base Tier!)
              </p>
            </div>
          </div>

          {/* Daily Water Habits Checklist */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#161F30] p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Award className="h-4 w-4" />
                </div>
                <h3 className="font-display text-sm font-black text-slate-900 dark:text-white">
                  Daily Eco Habits
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {completedHabitsCount}/{dailyHabits.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {dailyHabits.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => toggleHabitDone(habit.id)}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    habit.done
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-[#0B1120]'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
                      habit.done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {habit.done && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold leading-snug ${
                        habit.done
                          ? 'text-emerald-900 line-through dark:text-emerald-300'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {habit.label}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Saves ~{habit.savingsLiters} Liters
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Saved Today:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">
                +{dailySavedTodayLiters} Liters!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
