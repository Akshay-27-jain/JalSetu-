import React, { useState } from 'react';
import {
  BarChart3,
  Gauge,
  AlertTriangle,
  FileText,
  CheckCircle2,
  TrendingDown,
  Droplets,
  Building2,
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Users,
  Calendar,
} from 'lucide-react';
import { Reveal } from '../Reveal';

export function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState<'admin' | 'resident' | 'leakage' | 'invoice'>('admin');

  const tabs = [
    { id: 'admin', label: 'Society Admin Panel', icon: Building2, tag: 'Operations & Tariffs' },
    { id: 'resident', label: 'Resident Smart Portal', icon: Droplets, tag: 'Daily Telemetry & Bills' },
    { id: 'leakage', label: 'AI Anomaly & Leak Center', icon: AlertTriangle, tag: '2σ Statistical Alarms' },
    { id: 'invoice', label: 'PDF Invoice & Receipts', icon: FileText, tag: 'Itemized Tiered Bills' },
  ] as const;

  return (
    <section id="showcase" className="relative overflow-hidden bg-slate-900 py-24 sm:py-32 text-white">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[48rem] rounded-full bg-gradient-to-tr from-brand-600/20 via-aqua-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-aqua-400/30 bg-aqua-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-aqua-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-aqua-300" />
            Interactive Interface Preview
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Engineered for Transparency & Precision
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            Experience role-tailored dashboards designed for effortless society administration, transparent resident monitoring, and real-time water governance.
          </p>
        </Reveal>

        {/* Tab Navigation */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500 to-aqua-500 text-white shadow-glow'
                    : 'border border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-aqua-300'}`} />
                <span>{tab.label}</span>
                <span className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-700/60 text-slate-400'
                }`}>
                  {tab.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Showcase Content Panel */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Top Window Chrome */}
          <div className="mb-6 flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 font-mono text-xs text-slate-500">
                jalsetu.in/{activeTab === 'admin' ? 'community-admin/dashboard' : activeTab === 'resident' ? 'resident/dashboard' : activeTab === 'leakage' ? 'community-admin/leakage' : 'resident/invoices'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry Active
              </span>
            </div>
          </div>

          {/* TAB 1: COMMUNITY ADMIN DASHBOARD */}
          {activeTab === 'admin' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                  <p className="text-xs font-semibold text-slate-400">Total Billed Volume</p>
                  <p className="mt-1 text-2xl font-bold text-white">412.8 kL</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
                    <TrendingDown className="h-3 w-3" /> -14.2% vs last cycle
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                  <p className="text-xs font-semibold text-slate-400">Revenue Invoiced</p>
                  <p className="mt-1 text-2xl font-bold text-aqua-400">₹64,280</p>
                  <p className="mt-1 text-[11px] text-slate-400">Cycle: September 2026</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                  <p className="text-xs font-semibold text-slate-400">Collection Rate</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-400">96.8%</p>
                  <p className="mt-1 text-[11px] text-emerald-400/80">31 of 32 flats paid</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                  <p className="text-xs font-semibold text-slate-400">Tanker Procurement</p>
                  <p className="mt-1 text-2xl font-bold text-amber-400">12 Tankers</p>
                  <p className="mt-1 text-[11px] text-slate-400">72.0 kL shared water</p>
                </div>
              </div>

              {/* Middle Section: Chart & Quick Actions */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-white text-sm">Monthly Consumption by Slabs (kL)</h4>
                      <p className="text-xs text-slate-400">Tier 1 (0-10 kL), Tier 2 (10-25 kL), Tier 3 (&gt;25 kL)</p>
                    </div>
                    <span className="rounded-lg bg-brand-500/20 px-2.5 py-1 text-xs font-bold text-brand-300">
                      Tiered Slabs Active
                    </span>
                  </div>

                  {/* Simulated Visual Bar Chart */}
                  <div className="space-y-3 pt-2">
                    {[
                      { flat: 'A-101 (3 BHK)', t1: 10, t2: 4.2, t3: 0, total: '14.2 kL', amt: '₹477' },
                      { flat: 'A-204 (4 BHK)', t1: 10, t2: 15.0, t3: 6.8, total: '31.8 kL', amt: '₹1,240' },
                      { flat: 'B-103 (2 BHK)', t1: 7.8, t2: 0, t3: 0, total: '7.8 kL', amt: '₹306' },
                      { flat: 'B-302 (3 BHK)', t1: 10, t2: 8.5, t3: 0, total: '18.5 kL', amt: '₹608' },
                    ].map((row) => (
                      <div key={row.flat} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-200">{row.flat}</span>
                          <span className="text-slate-400 font-mono">{row.total} — <strong className="text-aqua-300">{row.amt}</strong></span>
                        </div>
                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
                          <div style={{ width: `${(row.t1 / 35) * 100}%` }} className="bg-emerald-500" title="Tier 1" />
                          <div style={{ width: `${(row.t2 / 35) * 100}%` }} className="bg-brand-500" title="Tier 2" />
                          <div style={{ width: `${(row.t3 / 35) * 100}%` }} className="bg-rose-500" title="Tier 3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <h5 className="font-bold text-white text-xs mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      1-Click Cycle Controls
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/70 text-xs">
                        <span>Current Cycle Status:</span>
                        <span className="font-bold text-emerald-400">OPEN (Sept 2026)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/70 text-xs">
                        <span>Bulk Invoices Generated:</span>
                        <span className="font-bold text-white">32 Households</span>
                      </div>
                      <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-aqua-600 text-white font-bold text-xs shadow-md hover:opacity-90">
                        ⚡ Generate & Email September Invoices
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESIDENT SMART PORTAL */}
          {activeTab === 'resident' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                  <span className="text-xs font-semibold text-slate-400">Current Month Volume</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">11.40</span>
                    <span className="text-sm font-semibold text-slate-400">kL (11,400 L)</span>
                  </div>
                  <div className="mt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Within Tier 2 Standard (10–25 kL)
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                  <span className="text-xs font-semibold text-slate-400">Peer Benchmarking</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-aqua-400">126.6</span>
                    <span className="text-xs font-semibold text-slate-400">L / person / day</span>
                  </div>
                  <div className="mt-2 text-[11px] text-aqua-300 font-semibold">
                    🏆 6.2% below CPHEEO 135 L Standard
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                  <span className="text-xs font-semibold text-slate-400">September Estimated Bill</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-400">₹429.20</span>
                  </div>
                  <button className="mt-2 w-full py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30">
                    💳 Pay Online via UPI / Card
                  </button>
                </div>
              </div>

              {/* Peer Benchmarking Chart */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <h4 className="font-bold text-white text-sm">30-Day Household Consumption Trend</h4>
                <p className="text-xs text-slate-400 mb-4">Daily metered readings showing weekday vs weekend usage patterns</p>
                <div className="h-32 w-full flex items-end gap-2 pt-4">
                  {[380, 410, 390, 420, 610, 680, 390, 400, 410, 390, 430, 590, 640, 380, 400].map((liters, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        style={{ height: `${(liters / 750) * 100}%` }}
                        className={`w-full rounded-t-sm transition-all ${
                          liters > 600 ? 'bg-amber-400' : 'bg-aqua-500'
                        }`}
                        title={`${liters} Liters`}
                      />
                      <span className="text-[9px] text-slate-500">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-2">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-aqua-500" /> Weekday Avg: 400 L</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Weekend Avg: 630 L</span>
                  <span className="text-emerald-400 font-semibold">Conservation Score: 88/100 (Gold)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEAK & ANOMALY DETECTION */}
          {activeTab === 'leakage' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Critical Anomaly Spike Flagged</h4>
                      <p className="text-xs text-rose-200">Flat B-201 recorded 4.85 kL on 24 Sept (+22.5σ above 0.80 kL baseline)</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-[11px] font-bold text-rose-300">
                    High Leak Risk
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <h5 className="font-bold text-white text-xs">Automated 2-Sigma Outlier Rules</h5>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Calculates 30-day baseline Mean (μ) and StdDev (σ)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Flags daily surges &gt; μ + 2σ as statistical anomalies
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Dispatches immediate advisory email with fixture guide
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <h5 className="font-bold text-white text-xs">Admin Actions</h5>
                  <div className="space-y-2">
                    <button className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold">
                      🚨 Send Urgent Leak Notice to Flat B-201
                    </button>
                    <button className="w-full py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold">
                      🔧 Assign Maintenance Plumber Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PDF INVOICE & RECEIPTS */}
          {activeTab === 'invoice' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="font-mono text-xs text-aqua-400">INV-202609-A103-0012</span>
                    <h4 className="font-bold text-white text-base">Tax Invoice & Utility Statement</h4>
                    <p className="text-xs text-slate-400">Flat A-103 (Akshay Jain) • Paras Garden Apartments</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-extrabold text-emerald-300">
                    PAID IN FULL (Razorpay UPI)
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-300">
                  <div>
                    <p className="text-slate-500">Meter Index Range:</p>
                    <p className="font-bold text-white font-mono">148.50 kL → 162.00 kL (13.50 kL net)</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Tier Breakdown:</p>
                    <p className="font-bold text-white">Tier 1: 10.0 kL @ ₹18 + Tier 2: 3.5 kL @ ₹28</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Shared Facilities & Base Fee:</p>
                    <p className="font-bold text-white">Fixed Maint: ₹150.00 + Shared: ₹0.00</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Total Settled Amount:</p>
                    <p className="font-bold text-emerald-400 text-sm font-mono">INR 428.00</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <span className="text-xs text-slate-400">📎 Official itemized PDF generated with OpenPDF telemetry engine</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
