import React, { useState, useEffect } from 'react';
import { adminBillingApi, extractErrorMessage } from '../../services/api';
import type { TariffPlan, ApportionmentMethod } from '../../types';
import {
  Layers,
  IndianRupee,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Sliders,
  Sparkles,
  Building2,
  Home,
  Users,
  Info,
  Check,
  Gauge,
} from 'lucide-react';

export const TariffConfigPage: React.FC = () => {
  const [tariff, setTariff] = useState<TariffPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tier Model Mode: 'TWO_TIER' | 'THREE_TIER'
  const [tierModelMode, setTierModelMode] = useState<'TWO_TIER' | 'THREE_TIER'>('TWO_TIER');

  // Form State
  const [baseFee, setBaseFee] = useState<number>(150);
  const [tier1Limit, setTier1Limit] = useState<number>(10);
  const [tier1Rate, setTier1Rate] = useState<number>(15);
  const [tier2Limit, setTier2Limit] = useState<number>(25);
  const [tier2Rate, setTier2Rate] = useState<number>(25);
  const [tier3Rate, setTier3Rate] = useState<number>(45);
  const [apportionmentMethod, setApportionmentMethod] = useState<ApportionmentMethod>('BY_FLAT_AREA');

  // Live Simulator State
  const [simConsumption, setSimConsumption] = useState<number>(18);

  const fetchTariff = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminBillingApi.getTariffPlan();
      setTariff(data);
      setBaseFee(data.baseMaintenanceFee);
      setTier1Limit(data.baseTierLimitKl);
      setTier1Rate(data.baseRatePerKl);
      setTier2Limit(data.midTierLimitKl);
      setTier2Rate(data.midRatePerKl);
      setTier3Rate(data.higherRatePerKl);
      setApportionmentMethod(data.apportionmentMethod);

      // Detect if current apartment configuration is 2-tier or 3-tier
      if (data.midTierLimitKl <= data.baseTierLimitKl || data.midRatePerKl <= 0) {
        setTierModelMode('TWO_TIER');
      } else {
        setTierModelMode('THREE_TIER');
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariff();
  }, []);

  const handleApplyPreset = (mode: 'TWO_TIER' | 'THREE_TIER') => {
    setTierModelMode(mode);
    if (mode === 'TWO_TIER') {
      setTier1Limit(10);
      setTier1Rate(15);
      setTier2Limit(10);
      setTier2Rate(0);
      setTier3Rate(45);
    } else {
      setTier1Limit(10);
      setTier1Rate(15);
      setTier2Limit(25);
      setTier2Rate(25);
      setTier3Rate(45);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const isThreeTier = tierModelMode === 'THREE_TIER';
    if (isThreeTier && tier2Limit <= tier1Limit) {
      setError('Tier 2 upper limit must be greater than Tier 1 limit in 3-Tier mode.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const effectiveTier2Limit = isThreeTier ? tier2Limit : tier1Limit;
      const effectiveTier2Rate = isThreeTier ? tier2Rate : 0;

      const updated = await adminBillingApi.updateTariffPlan({
        baseMaintenanceFee: baseFee,
        baseTierLimitKl: tier1Limit,
        baseRatePerKl: tier1Rate,
        midTierLimitKl: effectiveTier2Limit,
        midRatePerKl: effectiveTier2Rate,
        higherRatePerKl: tier3Rate,
        apportionmentMethod,
      });

      setTariff(updated);
      setSuccess(
        isThreeTier
          ? '3-Tier progressive tariff plan saved successfully!'
          : '2-Tier tariff plan (base rate for first 10 kL, higher rate beyond) saved successfully!'
      );
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Simulator calculation
  const calculateSimulatedBill = () => {
    let rem = simConsumption;
    const isThreeTier = tierModelMode === 'THREE_TIER';

    // Tier 1 (Base rate for first 10 kL)
    const s1Vol = Math.min(rem, tier1Limit);
    const s1Cost = s1Vol * tier1Rate;
    rem -= s1Vol;

    let s2Vol = 0;
    let s2Cost = 0;
    let s3Vol = 0;
    let s3Cost = 0;

    if (isThreeTier) {
      // Tier 2: 10 to 25 kL
      s2Vol = rem > 0 ? Math.min(rem, Math.max(0, tier2Limit - tier1Limit)) : 0;
      s2Cost = s2Vol * tier2Rate;
      rem -= s2Vol;

      // Tier 3: > 25 kL
      s3Vol = rem > 0 ? rem : 0;
      s3Cost = s3Vol * tier3Rate;
    } else {
      // Direct 2-Tier: Higher rate for everything beyond tier1Limit
      s3Vol = rem > 0 ? rem : 0;
      s3Cost = s3Vol * tier3Rate;
    }

    const meteredTotal = s1Cost + s2Cost + s3Cost;
    const grandTotal = meteredTotal + baseFee;

    return {
      s1Vol,
      s1Cost,
      s2Vol,
      s2Cost,
      s3Vol,
      s3Cost,
      meteredTotal,
      grandTotal,
    };
  };

  const sim = calculateSimulatedBill();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Configurable Tiered Tariff Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Calculate per-household water charges based on metered consumption volume with configurable rate tiers per apartment.
        </p>
      </div>

      {success && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-800 dark:text-rose-200 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Model Mode Preset Selector */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#161F30] p-5 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-brand-600" />
              <span>Select Community Tariff Architecture</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose between standard 2-tier billing (base rate for first 10 kL, higher rate beyond) or 3-tier progressive charging.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* 2-Tier Mode Card */}
          <button
            type="button"
            onClick={() => handleApplyPreset('TWO_TIER')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              tierModelMode === 'TWO_TIER'
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-2 ring-brand-500/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  2-Tier Standard Model (Specification)
                </span>
                {tierModelMode === 'TWO_TIER' && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white text-[10px]">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Base rate applied to the first 10 kL; higher rate applied to all consumption volume beyond 10 kL.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-brand-700 dark:text-brand-300 bg-brand-100/60 dark:bg-brand-900/40 px-2 py-1 rounded-lg w-fit">
              <span>0-10 kL: ₹{tier1Rate}/kL</span>
              <span>•</span>
              <span>&gt;10 kL: ₹{tier3Rate}/kL</span>
            </div>
          </button>

          {/* 3-Tier Mode Card */}
          <button
            type="button"
            onClick={() => handleApplyPreset('THREE_TIER')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              tierModelMode === 'THREE_TIER'
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-2 ring-brand-500/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  3-Tier Progressive Model
                </span>
                {tierModelMode === 'THREE_TIER' && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white text-[10px]">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Essential base (0-10 kL), standard family consumption (10-25 kL), and high-volume conservation tier (&gt;25 kL).
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/40 px-2 py-1 rounded-lg w-fit">
              <span>0-10 kL</span>
              <span>•</span>
              <span>10-25 kL</span>
              <span>•</span>
              <span>&gt;25 kL</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          {/* Base Connection Fee */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#161F30] p-5 sm:p-6 shadow-card space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                1. Base Maintenance Fee
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Fixed recurring monthly infrastructure charge per flat.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fixed Base Fee (₹ per flat / month)
              </label>
              <div className="relative max-w-xs">
                <IndianRupee className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  required
                  value={baseFee}
                  onChange={(e) => setBaseFee(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] pl-8 pr-3.5 py-2 font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1120] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tiered Consumption Slabs */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#161F30] p-5 sm:p-6 shadow-card space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand-600" />
                <span>
                  2. {tierModelMode === 'TWO_TIER' ? '2-Tier Rate Slabs' : '3-Tier Progressive Slabs'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {tierModelMode === 'TWO_TIER'
                  ? 'Base rate for first 10 kL; higher rate for consumption beyond.'
                  : 'Volumetric progressive charging to encourage water conservation.'}
              </p>
            </div>

            {/* Tier 1: Base Tier (First 10 kL) */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Base Tier (First {tier1Limit} kL)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Upper Limit (kL)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={tier1Limit}
                    onChange={(e) => setTier1Limit(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Base Rate (₹ per kL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={tier1Rate}
                    onChange={(e) => setTier1Rate(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Optional Tier 2 (Shown in 3-Tier Mode) */}
            {tierModelMode === 'THREE_TIER' && (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 space-y-2">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Tier 2: Standard Household Usage ({tier1Limit} to {tier2Limit} kL)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Upper Limit (kL)
                    </label>
                    <input
                      type="number"
                      min={tier1Limit + 1}
                      required
                      value={tier2Limit}
                      onChange={(e) => setTier2Limit(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Rate (₹ per kL)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={tier2Rate}
                      onChange={(e) => setTier2Rate(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Higher Tier (Beyond Tier 1 in 2-Tier mode, or Beyond Tier 2 in 3-Tier mode) */}
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                Higher Tier (All Usage Beyond {tierModelMode === 'TWO_TIER' ? tier1Limit : tier2Limit} kL)
              </span>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Higher Rate (₹ per kL)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={tier3Rate}
                  onChange={(e) => setTier3Rate(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Common Area Apportionment */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#161F30] p-5 sm:p-6 shadow-card space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand-600" />
                3. Shared Water Cost Apportionment Method
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Formula used to distribute bulk water tankers and common area water bills.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label
                className={`flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  apportionmentMethod === 'BY_METERED_CONSUMPTION_WITH_AREA_FALLBACK'
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0B1120] hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Gauge className="h-4 w-4 text-brand-600" />
                  <input
                    type="radio"
                    name="apportionment"
                    value="BY_METERED_CONSUMPTION_WITH_AREA_FALLBACK"
                    checked={apportionmentMethod === 'BY_METERED_CONSUMPTION_WITH_AREA_FALLBACK'}
                    onChange={() => setApportionmentMethod('BY_METERED_CONSUMPTION_WITH_AREA_FALLBACK')}
                    className="accent-brand-600"
                  />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">Metered + Area Fallback</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">By metered consumption, fallback to flat area</p>
                </div>
              </label>

              <label
                className={`flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  apportionmentMethod === 'BY_FLAT_AREA'
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0B1120] hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Home className="h-4 w-4 text-brand-600" />
                  <input
                    type="radio"
                    name="apportionment"
                    value="BY_FLAT_AREA"
                    checked={apportionmentMethod === 'BY_FLAT_AREA'}
                    onChange={() => setApportionmentMethod('BY_FLAT_AREA')}
                    className="accent-brand-600"
                  />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">By Flat Area (sq.ft)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Proportional to apartment floor size</p>
                </div>
              </label>

              <label
                className={`flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  apportionmentMethod === 'BY_OCCUPANCY'
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0B1120] hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-4 w-4 text-brand-600" />
                  <input
                    type="radio"
                    name="apportionment"
                    value="BY_OCCUPANCY"
                    checked={apportionmentMethod === 'BY_OCCUPANCY'}
                    onChange={() => setApportionmentMethod('BY_OCCUPANCY')}
                    className="accent-brand-600"
                  />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">By Occupancy Count</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Proportional to resident headcount</p>
                </div>
              </label>

              <label
                className={`flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  apportionmentMethod === 'EQUAL_PER_FLAT'
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0B1120] hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sliders className="h-4 w-4 text-brand-600" />
                  <input
                    type="radio"
                    name="apportionment"
                    value="EQUAL_PER_FLAT"
                    checked={apportionmentMethod === 'EQUAL_PER_FLAT'}
                    onChange={() => setApportionmentMethod('EQUAL_PER_FLAT')}
                    className="accent-brand-600"
                  />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">Equal Split</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Divided evenly across all registered units</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Updating Rates...' : 'Save & Activate Tariff Plan'}</span>
            </button>
          </div>
        </form>

        {/* Right: Live Interactive Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-3xl border border-brand-200 dark:border-brand-900/60 bg-linear-to-b from-brand-50/60 to-white dark:from-brand-950/40 dark:to-[#161F30] p-5 sm:p-6 shadow-card space-y-5">
            <div className="border-b border-brand-200/50 dark:border-brand-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-brand-600" />
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Live Bill Calculator
                </h3>
              </div>
              <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-900/60 px-2 py-0.5 rounded-full">
                {tierModelMode === 'TWO_TIER' ? '2-Tier Active' : '3-Tier Active'}
              </span>
            </div>

            {/* Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-slate-600 dark:text-slate-300">Simulate Monthly Metered Usage:</span>
                <span className="font-mono font-bold text-brand-600 text-sm">{simConsumption} kL</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={simConsumption}
                onChange={(e) => setSimConsumption(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0 kL</span>
                <span>{tier1Limit} kL</span>
                {tierModelMode === 'THREE_TIER' && <span>{tier2Limit} kL</span>}
                <span>60 kL</span>
              </div>
            </div>

            {/* Itemized Calculation Breakdown */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-[#0B1120]/80 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Fixed Base Maintenance:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹{baseFee.toFixed(2)}</span>
              </div>

              {/* Base Tier */}
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>
                  Base Tier ({sim.s1Vol} kL @ ₹{tier1Rate}):
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹{sim.s1Cost.toFixed(2)}</span>
              </div>

              {/* Tier 2 (if 3-Tier) */}
              {tierModelMode === 'THREE_TIER' && (
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>
                    Mid Tier ({sim.s2Vol} kL @ ₹{tier2Rate}):
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">₹{sim.s2Cost.toFixed(2)}</span>
                </div>
              )}

              {/* Higher Tier */}
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>
                  Higher Tier ({sim.s3Vol} kL @ ₹{tier3Rate}):
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹{sim.s3Cost.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-center">
                <span className="text-xs text-slate-500">Metered Consumption Subtotal:</span>
                <span className="font-mono font-bold text-brand-600">₹{sim.meteredTotal.toFixed(2)}</span>
              </div>

              <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-center">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Estimated Grand Total:</span>
                <span className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                  ₹{sim.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 p-3 text-[11px] text-brand-800 dark:text-brand-200 flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-brand-600 mt-0.5" />
              <span>
                Rates defined here are automatically applied when you click <strong>"Run Automated Billing"</strong> on the Invoices page.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
