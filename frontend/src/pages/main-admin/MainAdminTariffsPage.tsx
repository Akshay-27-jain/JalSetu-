import React, { useState, useEffect } from 'react';
import {
  Building2,
  Droplets,
  Layers,
  IndianRupee,
  Calculator,
  Sliders,
  Sparkles,
  Search,
  Edit3,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Scale,
  Gauge,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  Home,
  Zap,
} from 'lucide-react';
import { mainAdminApi, extractErrorMessage } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import type {
  PlatformTariffOverview,
  ApartmentTariffSummary,
  TariffPlan,
  ApportionmentMethod,
} from '../../types';

export const MainAdminTariffsPage: React.FC = () => {
  const [overview, setOverview] = useState<PlatformTariffOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string>('ALL');

  // Interactive Live Billing Simulator State
  const [simMode, setSimMode] = useState<'SINGLE' | 'COMPARE'>('SINGLE');
  const [simApartmentId, setSimApartmentId] = useState<number | null>(null);
  const [simVolume, setSimVolume] = useState<number>(18);

  // Edit Tariff Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<ApartmentTariffSummary | null>(null);
  const [savingTariff, setSavingTariff] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Modal Form State
  const [formBaseFee, setFormBaseFee] = useState<number>(150);
  const [formTier1Limit, setFormTier1Limit] = useState<number>(10);
  const [formTier1Rate, setFormTier1Rate] = useState<number>(15);
  const [formTier2Limit, setFormTier2Limit] = useState<number>(25);
  const [formTier2Rate, setFormTier2Rate] = useState<number>(25);
  const [formTier3Rate, setFormTier3Rate] = useState<number>(45);
  const [formApportionment, setFormApportionment] = useState<ApportionmentMethod>('CONSUMPTION_PROPORTIONAL');
  const [formTierMode, setFormTierMode] = useState<'TWO_TIER' | 'THREE_TIER'>('THREE_TIER');

  const fetchOverview = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await mainAdminApi.getPlatformTariffOverview();
      setOverview(data);

      if (data.tariffs && data.tariffs.length > 0 && simApartmentId === null) {
        setSimApartmentId(data.tariffs[0].apartmentId);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const openEditModal = (apt: ApartmentTariffSummary) => {
    setEditingApartment(apt);
    setFormBaseFee(apt.baseMaintenanceFee ?? 150);
    setFormTier1Limit(apt.baseTierLimitKl ?? 10);
    setFormTier1Rate(apt.baseRatePerKl ?? 15);
    setFormTier2Limit(apt.midTierLimitKl ?? 25);
    setFormTier2Rate(apt.midRatePerKl ?? 25);
    setFormTier3Rate(apt.higherRatePerKl ?? 45);
    setFormApportionment(apt.apportionmentMethod ?? 'CONSUMPTION_PROPORTIONAL');

    if ((apt.midTierLimitKl ?? 0) <= (apt.baseTierLimitKl ?? 0) || (apt.midRatePerKl ?? 0) <= 0) {
      setFormTierMode('TWO_TIER');
    } else {
      setFormTierMode('THREE_TIER');
    }

    setModalError(null);
    setModalSuccess(null);
    setIsEditModalOpen(true);
  };

  const handleApplyPreset = (mode: 'TWO_TIER' | 'THREE_TIER') => {
    setFormTierMode(mode);
    if (mode === 'TWO_TIER') {
      setFormTier1Limit(10);
      setFormTier1Rate(15);
      setFormTier2Limit(10);
      setFormTier2Rate(0);
      setFormTier3Rate(45);
    } else {
      setFormTier1Limit(10);
      setFormTier1Rate(15);
      setFormTier2Limit(25);
      setFormTier2Rate(25);
      setFormTier3Rate(45);
    }
  };

  const handleSaveTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApartment) return;

    const isThreeTier = formTierMode === 'THREE_TIER';
    if (isThreeTier && formTier2Limit <= formTier1Limit) {
      setModalError('Tier 2 upper limit must be greater than Tier 1 limit in 3-Tier mode.');
      return;
    }

    try {
      setSavingTariff(true);
      setModalError(null);
      setModalSuccess(null);

      const effectiveTier2Limit = isThreeTier ? formTier2Limit : formTier1Limit;
      const effectiveTier2Rate = isThreeTier ? formTier2Rate : 0;

      const payload: TariffPlan = {
        apartmentId: editingApartment.apartmentId,
        baseMaintenanceFee: Number(formBaseFee),
        baseTierLimitKl: Number(formTier1Limit),
        baseRatePerKl: Number(formTier1Rate),
        midTierLimitKl: Number(effectiveTier2Limit),
        midRatePerKl: Number(effectiveTier2Rate),
        higherRatePerKl: Number(formTier3Rate),
        apportionmentMethod: formApportionment,
      };

      await mainAdminApi.updateSocietyTariffPlan(editingApartment.apartmentId, payload);
      setModalSuccess(`Tariff policy for ${editingApartment.apartmentName} updated successfully!`);

      await fetchOverview(true);

      setTimeout(() => {
        setIsEditModalOpen(false);
      }, 1200);
    } catch (err) {
      setModalError(extractErrorMessage(err));
    } finally {
      setSavingTariff(false);
    }
  };

  // Live Bill Calculation Helper
  const calculateBillForTariff = (tariff: ApartmentTariffSummary, volume: number) => {
    let rem = volume;
    const isThreeTier = (tariff.midTierLimitKl ?? 0) > (tariff.baseTierLimitKl ?? 0) && (tariff.midRatePerKl ?? 0) > 0;

    // Slab 1
    const s1Vol = Math.min(rem, tariff.baseTierLimitKl ?? 10);
    const s1Cost = s1Vol * (tariff.baseRatePerKl ?? 15);
    rem -= s1Vol;

    let s2Vol = 0;
    let s2Cost = 0;
    let s3Vol = 0;
    let s3Cost = 0;

    if (isThreeTier) {
      // Slab 2
      const s2Capacity = Math.max(0, (tariff.midTierLimitKl ?? 25) - (tariff.baseTierLimitKl ?? 10));
      s2Vol = rem > 0 ? Math.min(rem, s2Capacity) : 0;
      s2Cost = s2Vol * (tariff.midRatePerKl ?? 25);
      rem -= s2Vol;

      // Slab 3
      s3Vol = rem > 0 ? rem : 0;
      s3Cost = s3Vol * (tariff.higherRatePerKl ?? 45);
    } else {
      // Slab 3 direct
      s3Vol = rem > 0 ? rem : 0;
      s3Cost = s3Vol * (tariff.higherRatePerKl ?? 45);
    }

    const meteredTotal = s1Cost + s2Cost + s3Cost;
    const baseFee = tariff.baseMaintenanceFee ?? 150;
    const grandTotal = meteredTotal + baseFee;
    const avgRate = volume > 0 ? meteredTotal / volume : 0;

    return {
      s1Vol,
      s1Cost,
      s2Vol,
      s2Cost,
      s3Vol,
      s3Cost,
      meteredTotal,
      baseFee,
      grandTotal,
      avgRate,
      isThreeTier,
    };
  };

  // Filtered Tariffs
  const filteredTariffs = (overview?.tariffs ?? []).filter((apt) => {
    const matchesSearch =
      apt.apartmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.address && apt.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(apt.apartmentId).includes(searchTerm);

    const matchesMethod =
      selectedMethodFilter === 'ALL' || apt.apportionmentMethod === selectedMethodFilter;

    return matchesSearch && matchesMethod;
  });

  const selectedSimTariff = overview?.tariffs.find((t) => t.apartmentId === simApartmentId) || overview?.tariffs[0];
  const simResult = selectedSimTariff ? calculateBillForTariff(selectedSimTariff, simVolume) : null;

  const getMethodBadgeVariant = (method: ApportionmentMethod) => {
    switch (method) {
      case 'CONSUMPTION_PROPORTIONAL':
        return 'normal';
      case 'EQUAL_FLAT':
        return 'info';
      case 'AREA_WEIGHTED':
      case 'BY_FLAT_AREA':
        return 'billing';
      case 'OCCUPANCY_WEIGHTED':
      case 'BY_OCCUPANCY':
        return 'anomaly';
      default:
        return 'neutral';
    }
  };

  const getMethodLabel = (method: ApportionmentMethod) => {
    switch (method) {
      case 'CONSUMPTION_PROPORTIONAL':
        return 'Metered Consumption Proportional';
      case 'EQUAL_FLAT':
        return 'Equal Flat Split (Fallback)';
      case 'AREA_WEIGHTED':
      case 'BY_FLAT_AREA':
        return 'Area-Weighted (Sq.Ft.)';
      case 'OCCUPANCY_WEIGHTED':
      case 'BY_OCCUPANCY':
        return 'Occupancy Headcount';
      default:
        return method;
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Loading platform tariff benchmarks & society pricing slabs...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Platform Tariff Slabs & Pricing Governance
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Cross-society progressive water rate tiers, common supply apportionment formulas & live billing simulator
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchOverview(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-[#161F30] dark:text-slate-200 dark:hover:bg-slate-800/80"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync Tariffs'}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* KPI Benchmark Cards */}
      {overview && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Monitored Societies"
            value={overview.totalApartments}
            subtitle="Active pricing policies"
            icon={Building2}
            iconBgColor="bg-blue-50 dark:bg-blue-950/60"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Avg Base Rate (Slab 1)"
            value={`₹${Number(overview.averageBaseRate ?? 0).toFixed(2)}`}
            subtitle="First 10 kL consumption"
            icon={Droplets}
            iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            title="Avg Mid Rate (Slab 2)"
            value={`₹${Number(overview.averageMidRate ?? 0).toFixed(2)}`}
            subtitle="10 kL – 25 kL usage"
            icon={Layers}
            iconBgColor="bg-amber-50 dark:bg-amber-950/60"
            iconColor="text-amber-600 dark:text-amber-400"
          />
          <StatCard
            title="Avg Surcharge (Slab 3)"
            value={`₹${Number(overview.averageHigherRate ?? 0).toFixed(2)}`}
            subtitle="Above 25 kL high tier"
            icon={TrendingUp}
            iconBgColor="bg-rose-50 dark:bg-rose-950/60"
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <StatCard
            title="Avg Fixed Maintenance"
            value={`₹${Number(overview.averageBaseFee ?? 0).toFixed(0)}`}
            subtitle="Base recurring fee/mo"
            icon={IndianRupee}
            iconBgColor="bg-purple-50 dark:bg-purple-950/60"
            iconColor="text-purple-600 dark:text-purple-400"
          />
        </div>
      )}

      {/* Interactive Cross-Society Live Billing Simulator */}
      <div className="rounded-3xl border border-blue-200/80 bg-linear-to-br from-blue-50/60 via-white to-sky-50/40 p-6 shadow-sm dark:border-blue-900/40 dark:from-blue-950/20 dark:via-[#161F30] dark:to-sky-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Multi-Society Live Tariff & Billing Simulator
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  <Sparkles className="h-3 w-3" /> Real-Time Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate household water consumption volume and observe progressive slab breakdown across communities
              </p>
            </div>
          </div>

          {/* Mode Switch */}
          <div className="inline-flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
            <button
              onClick={() => setSimMode('SINGLE')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                simMode === 'SINGLE'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-blue-600 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Single Society Deep Dive
            </button>
            <button
              onClick={() => setSimMode('COMPARE')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                simMode === 'COMPARE'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-blue-600 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Cross-Society Comparison
            </button>
          </div>
        </div>

        {/* Simulator Controls */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Slider & Presets (Left Column) */}
          <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/60 lg:col-span-5">
            {simMode === 'SINGLE' && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Residential Society
                </label>
                <select
                  value={simApartmentId ?? ''}
                  onChange={(e) => setSimApartmentId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-hidden transition-all focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
                >
                  {overview?.tariffs.map((apt) => (
                    <option key={apt.apartmentId} value={apt.apartmentId}>
                      {apt.apartmentName} ({apt.totalHouseholds} Flats)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Simulated Household Consumption
                </label>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-2xl font-black text-blue-600 dark:text-blue-400">
                    {simVolume}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">kL (m³)</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="60"
                step="0.5"
                value={simVolume}
                onChange={(e) => setSimVolume(parseFloat(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-blue-100 accent-blue-600 dark:bg-slate-800"
              />

              {/* Quick Presets */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[5, 10, 18, 25, 35, 50].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setSimVolume(preset)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      simVolume === preset
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {preset} kL
                  </button>
                ))}
              </div>
            </div>

            {selectedSimTariff && simMode === 'SINGLE' && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <div className="flex items-center justify-between font-medium">
                  <span>Active Policy:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {(selectedSimTariff.midTierLimitKl ?? 0) > (selectedSimTariff.baseTierLimitKl ?? 0)
                      ? '3-Tier Progressive Surcharge'
                      : '2-Tier Base + Surcharge'}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Apportionment Formula:</span>
                  <span>{getMethodLabel(selectedSimTariff.apportionmentMethod)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Output (Right Column) */}
          <div className="lg:col-span-7">
            {simMode === 'SINGLE' && simResult && selectedSimTariff ? (
              <div className="space-y-4">
                {/* Visual Slabs Meter Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>Volume Apportionment Breakdown ({simVolume} kL Total)</span>
                    <span>₹{Number(simResult.meteredTotal ?? 0).toFixed(2)} Metered Charges</span>
                  </div>

                  {/* Progressive Bar */}
                  <div className="flex h-7 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    {simResult.s1Vol > 0 && (
                      <div
                        style={{ width: `${(simResult.s1Vol / Math.max(1, simVolume)) * 100}%` }}
                        className="flex items-center justify-center bg-emerald-500 text-[11px] font-bold text-white transition-all"
                        title={`Slab 1 Base: ${simResult.s1Vol} kL @ ₹${selectedSimTariff.baseRatePerKl}/kL`}
                      >
                        {simResult.s1Vol} kL
                      </div>
                    )}
                    {simResult.s2Vol > 0 && (
                      <div
                        style={{ width: `${(simResult.s2Vol / Math.max(1, simVolume)) * 100}%` }}
                        className="flex items-center justify-center bg-amber-500 text-[11px] font-bold text-white transition-all"
                        title={`Slab 2 Mid: ${simResult.s2Vol} kL @ ₹${selectedSimTariff.midRatePerKl}/kL`}
                      >
                        {simResult.s2Vol} kL
                      </div>
                    )}
                    {simResult.s3Vol > 0 && (
                      <div
                        style={{ width: `${(simResult.s3Vol / Math.max(1, simVolume)) * 100}%` }}
                        className="flex items-center justify-center bg-rose-500 text-[11px] font-bold text-white transition-all"
                        title={`Slab 3 Surge: ${simResult.s3Vol} kL @ ₹${selectedSimTariff.higherRatePerKl}/kL`}
                      >
                        {simResult.s3Vol} kL
                      </div>
                    )}
                  </div>

                  {/* Slab Details Tiles */}
                  <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
                    <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-2.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Slab 1 (Base 0–{selectedSimTariff.baseTierLimitKl}kL)
                      </span>
                      <p className="font-display text-base font-bold text-emerald-800 dark:text-emerald-300">
                        ₹{Number(simResult.s1Cost ?? 0).toFixed(2)}
                      </p>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        {simResult.s1Vol} kL × ₹{selectedSimTariff.baseRatePerKl}
                      </span>
                    </div>

                    <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-2.5 dark:border-amber-900/40 dark:bg-amber-950/20">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        Slab 2 ({selectedSimTariff.baseTierLimitKl}–{selectedSimTariff.midTierLimitKl}kL)
                      </span>
                      <p className="font-display text-base font-bold text-amber-800 dark:text-amber-300">
                        ₹{Number(simResult.s2Cost ?? 0).toFixed(2)}
                      </p>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400">
                        {simResult.s2Vol} kL × ₹{selectedSimTariff.midRatePerKl}
                      </span>
                    </div>

                    <div className="rounded-xl border border-rose-200/60 bg-rose-50/50 p-2.5 dark:border-rose-900/40 dark:bg-rose-950/20">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                        Slab 3 (&gt;{selectedSimTariff.midTierLimitKl}kL Surge)
                      </span>
                      <p className="font-display text-base font-bold text-rose-800 dark:text-rose-300">
                        ₹{Number(simResult.s3Cost ?? 0).toFixed(2)}
                      </p>
                      <span className="text-[11px] text-rose-600 dark:text-rose-400">
                        {simResult.s3Vol} kL × ₹{selectedSimTariff.higherRatePerKl}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Summary Row */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900/60">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Fixed Maintenance Fee
                    </span>
                    <p className="mt-1 font-display text-xl font-bold text-slate-800 dark:text-slate-200">
                      ₹{Number(simResult.baseFee ?? 0).toFixed(2)}
                    </p>
                    <span className="text-[11px] text-slate-400">Monthly flat recurring</span>
                  </div>

                  <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-center dark:border-blue-900/50 dark:bg-blue-950/30">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      Effective Unit Rate
                    </span>
                    <p className="mt-1 font-display text-xl font-bold text-blue-700 dark:text-blue-300">
                      ₹{Number(simResult.avgRate ?? 0).toFixed(2)}{' '}
                      <span className="text-xs font-normal text-blue-600/70">/kL</span>
                    </p>
                    <span className="text-[11px] text-blue-600/80 dark:text-blue-400">Metered avg rate</span>
                  </div>

                  <div className="rounded-2xl border border-blue-600 bg-blue-600 p-4 text-center text-white shadow-md shadow-blue-500/20 dark:bg-blue-600">
                    <span className="text-xs font-semibold text-blue-100">Total Simulated Bill</span>
                    <p className="mt-1 font-display text-2xl font-black text-white">
                      ₹{Number(simResult.grandTotal ?? 0).toFixed(2)}
                    </p>
                    <span className="text-[11px] text-blue-200">Metered + Base Fee</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Cross-Society Comparison Cards */
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {overview?.tariffs.map((apt) => {
                  const bill = calculateBillForTariff(apt, simVolume);
                  return (
                    <div
                      key={apt.apartmentId}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-800"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{apt.apartmentName}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {apt.totalHouseholds} households • {apt.activeMetersCount} meters
                          </span>
                        </div>
                        <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          ₹{Number(bill.grandTotal ?? 0).toFixed(0)}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>Slab 1 ({bill.s1Vol}kL @ ₹{apt.baseRatePerKl}):</span>
                          <span className="font-semibold">₹{Number(bill.s1Cost ?? 0).toFixed(2)}</span>
                        </div>
                        {bill.s2Vol > 0 && (
                          <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>Slab 2 ({bill.s2Vol}kL @ ₹{apt.midRatePerKl}):</span>
                            <span className="font-semibold">₹{Number(bill.s2Cost ?? 0).toFixed(2)}</span>
                          </div>
                        )}
                        {bill.s3Vol > 0 && (
                          <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                            <span>Slab 3 ({bill.s3Vol}kL @ ₹{apt.higherRatePerKl}):</span>
                            <span>₹{Number(bill.s3Cost ?? 0).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>Fixed Base Fee:</span>
                          <span>₹{Number(bill.baseFee ?? 0).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <span>Effective Rate: ₹{Number(bill.avgRate ?? 0).toFixed(2)}/kL</span>
                        <button
                          onClick={() => openEditModal(apt)}
                          className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          Edit Tariff &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Society Tariff Slabs & Policies Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Residential Society Pricing Policies ({filteredTariffs.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage tiered rate slabs, surcharge triggers, and common area apportionment algorithms
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search society by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-hidden transition-all focus:border-blue-500 dark:border-slate-800 dark:bg-[#161F30] dark:text-slate-200 sm:w-64"
              />
            </div>

            {/* Apportionment Filter */}
            <select
              value={selectedMethodFilter}
              onChange={(e) => setSelectedMethodFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden dark:border-slate-800 dark:bg-[#161F30] dark:text-slate-300"
            >
              <option value="ALL">All Apportionment Models</option>
              <option value="CONSUMPTION_PROPORTIONAL">Metered Consumption</option>
              <option value="EQUAL_FLAT">Equal Flat Split</option>
              <option value="AREA_WEIGHTED">Area-Weighted (Sq.Ft.)</option>
              <option value="OCCUPANCY_WEIGHTED">Occupancy Headcount</option>
            </select>
          </div>
        </div>

        {/* Tariffs Cards Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredTariffs.map((apt) => {
            const isThreeTier = (apt.midTierLimitKl ?? 0) > (apt.baseTierLimitKl ?? 0) && (apt.midRatePerKl ?? 0) > 0;

            return (
              <div
                key={apt.apartmentId}
                className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-[#161F30]"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                          {apt.apartmentName}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          ID: #{apt.apartmentId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {apt.address || 'Smart Meter Integrated Community'}
                      </p>
                    </div>

                    <Badge variant={getMethodBadgeVariant(apt.apportionmentMethod)} size="sm">
                      {getMethodLabel(apt.apportionmentMethod)}
                    </Badge>
                  </div>

                  {/* Society Stats Row */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 text-blue-500" />
                      <span>{apt.totalHouseholds} Total Flats</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{apt.activeMetersCount} Active Meters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="h-3.5 w-3.5 text-purple-500" />
                      <span>₹{apt.baseMaintenanceFee ?? 150} Base Fixed Fee</span>
                    </div>
                  </div>

                  {/* Pricing Slab Cards */}
                  <div className="mt-5 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Configured Rate Tiers & Surcharges
                    </span>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      {/* Slab 1 */}
                      <div className="rounded-2xl border border-emerald-200/80 bg-linear-to-b from-emerald-50/70 to-emerald-100/30 p-3.5 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-emerald-900/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                            Slab 1 (Base)
                          </span>
                          <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                            0–{apt.baseTierLimitKl} kL
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="font-display text-xl font-black text-emerald-700 dark:text-emerald-300">
                            ₹{apt.baseRatePerKl}
                          </span>
                          <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400">/kL</span>
                        </div>
                        <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                          Standard baseline tier
                        </p>
                      </div>

                      {/* Slab 2 */}
                      <div className="rounded-2xl border border-amber-200/80 bg-linear-to-b from-amber-50/70 to-amber-100/30 p-3.5 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-amber-900/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                            Slab 2 (Mid)
                          </span>
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                            {isThreeTier ? `${apt.baseTierLimitKl}–${apt.midTierLimitKl} kL` : 'N/A (2-Tier)'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="font-display text-xl font-black text-amber-700 dark:text-amber-300">
                            {isThreeTier ? `₹${apt.midRatePerKl}` : '—'}
                          </span>
                          {isThreeTier && <span className="text-[11px] text-amber-600/80 dark:text-amber-400">/kL</span>}
                        </div>
                        <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                          {isThreeTier ? 'Moderate volume tier' : 'Direct jump to surge'}
                        </p>
                      </div>

                      {/* Slab 3 */}
                      <div className="rounded-2xl border border-rose-200/80 bg-linear-to-b from-rose-50/70 to-rose-100/30 p-3.5 dark:border-rose-900/50 dark:from-rose-950/30 dark:to-rose-900/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400">
                            Slab 3 (Surge)
                          </span>
                          <span className="rounded-md bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                            &gt;{isThreeTier ? apt.midTierLimitKl : apt.baseTierLimitKl} kL
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="font-display text-xl font-black text-rose-700 dark:text-rose-300">
                            ₹{apt.higherRatePerKl}
                          </span>
                          <span className="text-[11px] text-rose-600/80 dark:text-rose-400">/kL</span>
                        </div>
                        <p className="mt-1 text-[10px] text-rose-600 dark:text-rose-400">
                          High overuse penalty
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Auto-calculated upon monthly meter reading</span>
                  </div>

                  <button
                    onClick={() => openEditModal(apt)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Configure Tariff</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Society Tariff Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Configure Tariff: ${editingApartment?.apartmentName || ''}`}
        subtitle="Adjust tiered rate slabs, surge thresholds, fixed charges, and cost apportionment algorithm"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTariff} className="space-y-6">
          {modalError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {modalSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{modalSuccess}</span>
            </div>
          )}

          {/* Preset Buttons */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">Tariff Model Template</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Select progressive slab architecture for this community
              </p>
            </div>

            <div className="inline-flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => handleApplyPreset('TWO_TIER')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  formTierMode === 'TWO_TIER'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-blue-600 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                2-Tier Standard
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('THREE_TIER')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  formTierMode === 'THREE_TIER'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-blue-600 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                3-Tier Progressive
              </button>
            </div>
          </div>

          {/* Slabs Form Fields */}
          <div className="space-y-4">
            {/* Base Maintenance Fee */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Base Fixed Maintenance Fee (₹ / Month)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={formBaseFee}
                onChange={(e) => setFormBaseFee(parseFloat(e.target.value) || 0)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-hidden focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="150"
                required
              />
              <span className="text-[11px] text-slate-400">
                Mandatory fixed charge added to every generated invoice.
              </span>
            </div>

            {/* Slab 1 (Base Rate) */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                  Slab 1: Base Consumption Tier
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Subsidized Baseline
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Upper Volume Threshold (kL)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formTier1Limit}
                    onChange={(e) => setFormTier1Limit(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-900 outline-hidden dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Rate per kL (₹/kL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formTier1Rate}
                    onChange={(e) => setFormTier1Rate(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-900 outline-hidden dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-300"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Slab 2 (Mid Tier - Optional) */}
            {formTierMode === 'THREE_TIER' && (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                    Slab 2: Moderate Usage Tier
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    Standard Rate
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Upper Volume Threshold (kL)
                    </label>
                    <input
                      type="number"
                      min={formTier1Limit + 1}
                      value={formTier2Limit}
                      onChange={(e) => setFormTier2Limit(parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-900 outline-hidden dark:border-amber-800 dark:bg-slate-800 dark:text-amber-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Rate per kL (₹/kL)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formTier2Rate}
                      onChange={(e) => setFormTier2Rate(parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-900 outline-hidden dark:border-amber-800 dark:bg-slate-800 dark:text-amber-300"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Slab 3 (Higher Rate / Surge) */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-rose-800 dark:text-rose-300">
                  Slab 3: High Consumption Surcharge
                </span>
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                  Overuse Penalty
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Rate per kL for usage beyond {formTierMode === 'THREE_TIER' ? formTier2Limit : formTier1Limit} kL (₹/kL)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formTier3Rate}
                  onChange={(e) => setFormTier3Rate(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-900 outline-hidden dark:border-rose-800 dark:bg-slate-800 dark:text-rose-300"
                  required
                />
              </div>
            </div>

            {/* Apportionment Formula */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Common Water Cost Apportionment Method
              </label>
              <select
                value={formApportionment}
                onChange={(e) => setFormApportionment(e.target.value as ApportionmentMethod)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-hidden focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="CONSUMPTION_PROPORTIONAL">
                  Metered Consumption Proportional (Recommended)
                </option>
                <option value="EQUAL_FLAT">Equal Flat Distribution (Fallback)</option>
                <option value="AREA_WEIGHTED">Flat Carpet Area Weighted (Sq.Ft.)</option>
                <option value="OCCUPANCY_WEIGHTED">Household Occupancy Headcount Weighted</option>
              </select>
              <span className="text-[11px] text-slate-400">
                Formula used when dividing bulk tanker deliveries and common area supply among flats.
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingTariff}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {savingTariff ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving Policy...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Tariff Policy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
