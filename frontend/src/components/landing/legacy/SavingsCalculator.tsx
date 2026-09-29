import React, { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingDown,
  Droplets,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  Building2,
  PieChart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '../Reveal';
import { Button } from '../ui/Button';

export function SavingsCalculator() {
  const [flatCount, setFlatCount] = useState<number>(120);
  const [monthlyTankerSpend, setMonthlyTankerSpend] = useState<number>(85000);
  const [wasteFactor, setWasteFactor] = useState<number>(30); // 30% reduction from sub-metering awareness

  // Derived calculations
  const calculations = useMemo(() => {
    // Average 3.8 members per flat consuming ~135 Liters per day (CPHEEO standard)
    const dailyBaseSocietyLiters = flatCount * 3.8 * 135;
    const monthlySocietyLiters = dailyBaseSocietyLiters * 30;
    
    // Water volume saved per month and year through behavioral sub-metering + leak alerts
    const monthlyLitersSaved = (monthlySocietyLiters * (wasteFactor / 100));
    const annualLitersSavedLakhs = ((monthlyLitersSaved * 12) / 100000).toFixed(1);

    // Direct tanker cost savings (typically 35% - 50% tanker reduction)
    const annualTankerSpend = monthlyTankerSpend * 12;
    const annualTankerSavings = Math.round(annualTankerSpend * (wasteFactor / 100) * 1.15);

    // Pump electrical energy savings (~₹18 per kL pumped)
    const annualEnergySaved = Math.round((monthlyLitersSaved * 12 / 1000) * 12.5);

    // Total Community Annual Financial Savings
    const totalAnnualSavings = annualTankerSavings + annualEnergySaved;
    const monthlySavingsPerFlat = Math.round((totalAnnualSavings / 12) / flatCount);

    return {
      monthlySocietyLiters: (monthlySocietyLiters / 100000).toFixed(1),
      annualLitersSavedLakhs,
      annualTankerSavings,
      annualEnergySaved,
      totalAnnualSavings,
      monthlySavingsPerFlat,
      paybackDays: totalAnnualSavings > 0 ? Math.max(15, Math.round((flatCount * 120) / (totalAnnualSavings / 365))) : 30,
    };
  }, [flatCount, monthlyTankerSpend, wasteFactor]);

  return (
    <section id="calculator" className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-brand-50/30 to-white py-24 sm:py-32">
      {/* Subtle ambient blur spots */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-aqua-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 shadow-sm">
            <Calculator className="h-4 w-4 text-brand-600" />
            ROI & Water Conservation Estimator
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Calculate Your Community’s Savings
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Sub-metering awareness and rapid leak detection reduce unmonitored residential water consumption by 25% to 40%. Adjust your society parameters below to see estimated annual gains.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Controls Column */}
          <Reveal className="lg:col-span-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-card">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Building2 className="h-5 w-5 text-brand-600" />
                Society Parameters
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Tailor these sliders to match your residential society's profile.
              </p>

              <div className="mt-8 space-y-7">
                {/* Parameter 1: Flat Count */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Total Residential Flats
                    </label>
                    <span className="rounded-lg bg-brand-50 px-3 py-1 font-mono text-sm font-extrabold text-brand-700 border border-brand-200">
                      {flatCount} Flats
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={500}
                    step={5}
                    value={flatCount}
                    onChange={(e) => setFlatCount(Number(e.target.value))}
                    className="mt-3 w-full h-2.5 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-brand-600 focus:outline-none"
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>15 Flats</span>
                    <span>150 Flats</span>
                    <span>500 Flats</span>
                  </div>
                </div>

                {/* Parameter 2: Monthly Tanker Spend */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Monthly Tanker & Procurement Spend
                    </label>
                    <span className="rounded-lg bg-amber-50 px-3 py-1 font-mono text-sm font-extrabold text-amber-700 border border-amber-200">
                      ₹{monthlyTankerSpend.toLocaleString('en-IN')} / mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={400000}
                    step={5000}
                    value={monthlyTankerSpend}
                    onChange={(e) => setMonthlyTankerSpend(Number(e.target.value))}
                    className="mt-3 w-full h-2.5 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-600 focus:outline-none"
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>₹5,000</span>
                    <span>₹2,00,000</span>
                    <span>₹4,00,000</span>
                  </div>
                </div>

                {/* Parameter 3: Conservation & Leak Elimination Factor */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Target Leakage & Waste Reduction
                    </label>
                    <span className="rounded-lg bg-emerald-50 px-3 py-1 font-mono text-sm font-extrabold text-emerald-700 border border-emerald-200">
                      {wasteFactor}% Reduction
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={45}
                    step={1}
                    value={wasteFactor}
                    onChange={(e) => setWasteFactor(Number(e.target.value))}
                    className="mt-3 w-full h-2.5 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 focus:outline-none"
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>15% (Moderate)</span>
                    <span>30% (Standard CPHEEO)</span>
                    <span>45% (Aggressive)</span>
                  </div>
                </div>

                {/* Sub-metering Trust Badges */}
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>CPHEEO 135L Baseline</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Zero Maintenance Deficit</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Automated 2σ Leak Alarms</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>100% Auditable Itemized Bills</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Results Column */}
          <Reveal className="lg:col-span-6" delay={150}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-950 p-6 sm:p-9 text-white shadow-2xl border border-slate-800">
              {/* Top Highlight Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Projected Annual Impact
                </span>
                <span className="text-xs text-slate-400 font-mono">Payback in ~{calculations.paybackDays} days</span>
              </div>

              {/* Total Financial Savings Header */}
              <div className="mt-6 border-b border-slate-800/80 pb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Annual Society Financial Savings
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-aqua-300 via-emerald-300 to-white">
                    ₹{calculations.totalAnnualSavings.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ year</span>
                </div>
                <p className="mt-1 text-xs text-emerald-400 font-medium">
                  ≈ ₹{calculations.monthlySavingsPerFlat.toLocaleString('en-IN')} saved per household each month on maintenance!
                </p>
              </div>

              {/* Grid of Key Outcomes */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center gap-2 text-aqua-400">
                    <Droplets className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Water Conserved</span>
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    {calculations.annualLitersSavedLakhs} <span className="text-sm font-normal text-slate-300">Lakh Liters</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Equal to ~{Math.round(Number(calculations.annualLitersSavedLakhs) * 10)} full water tankers</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Tanker Cost Cut</span>
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    ₹{calculations.annualTankerSavings.toLocaleString('en-IN')}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Reduced tanker procurement</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Pump Electricity</span>
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    ₹{calculations.annualEnergySaved.toLocaleString('en-IN')}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Lower hydro-pneumatic run time</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center gap-2 text-brand-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Billing Disputes</span>
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    0 %
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Complete itemized auditability</p>
                </div>
              </div>

              {/* Call to Action Inside Card */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <Link to="/register" className="w-full sm:flex-1">
                  <Button size="lg" className="w-full bg-gradient-to-r from-aqua-400 via-brand-500 to-brand-600 text-white font-bold shadow-glow hover:opacity-95">
                    Start Saving for Your Society
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="w-full border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white font-semibold">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
