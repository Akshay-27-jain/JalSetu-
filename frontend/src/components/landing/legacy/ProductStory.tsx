import { CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck, FileText, ArrowRight, Gauge, Droplets, Zap, Clock } from 'lucide-react';
import { Reveal } from '../Reveal';

export function ProductStory() {
  return (
    <section id="product-story" className="relative bg-white py-24 sm:py-32 overflow-hidden border-t border-slate-100">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-brand-50/60 blur-3xl" />
      <div className="pointer-events-none absolute top-2/3 -right-32 h-96 w-96 rounded-full bg-aqua-50/60 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-28 sm:space-y-36">

        {/* Section Header */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
            <Droplets className="h-3.5 w-3.5 text-brand-600" />
            Product Walkthrough
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Engineered for Transparency. Built for Savings.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            See how JalSetu turns complicated water infrastructure into an effortless, dispute-free experience.
          </p>
        </Reveal>

        {/* STORY 1: KNOW WHERE YOUR WATER GOES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <Reveal className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">01 · Real-Time Telemetry</span>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Know where your water goes.
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Eliminate fixed maintenance disputes forever. JalSetu logs every household’s sub-meter with automated boundary verification and compares consumption against CPHEEO’s national 135 Liters per capita standard.
            </p>
            <ul className="space-y-3 text-sm text-slate-700 pt-2">
              {[
                'Individual digital & manual mechanical meter support',
                '30-day consumption curves with baseline benchmarking',
                '1-click bulk CSV imports for society facility staff',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Actual Usage Dashboard Mockup Card */}
          <Reveal delay={120} className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-7 shadow-card">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">Flat B-304 · Water Usage Trend</h4>
                    <p className="text-xs text-slate-500">Sub-Meter: <span className="font-mono text-slate-700">WTR-B304-01</span> · Status: Normal</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-3 py-1 text-xs">
                  -18% vs Avg
                </span>
              </div>

              {/* Stat summary pills */}
              <div className="grid grid-cols-3 gap-3 my-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Monthly Total</span>
                  <p className="font-display font-bold text-slate-900 text-lg sm:text-xl mt-0.5">8.42 kL</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">Tier 1 Slab</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Daily Average</span>
                  <p className="font-display font-bold text-slate-900 text-lg sm:text-xl mt-0.5">112 L/day</p>
                  <span className="text-[10px] text-brand-600 font-semibold">Within 135L norm</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Est. Bill</span>
                  <p className="font-display font-bold text-slate-900 text-lg sm:text-xl mt-0.5">₹340</p>
                  <span className="text-[10px] text-slate-500">Due Oct 5</span>
                </div>
              </div>

              {/* Visual simulated 7-day usage chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-slate-700">7-Day Consumption (Liters/day)</span>
                  <span className="text-[11px] text-slate-400">CPHEEO Benchmark: 135L</span>
                </div>
                <div className="flex items-end justify-between h-28 pt-2 gap-2">
                  {[
                    { day: 'Mon', val: 98, fill: 'bg-brand-400' },
                    { day: 'Tue', val: 110, fill: 'bg-brand-500' },
                    { day: 'Wed', val: 104, fill: 'bg-brand-400' },
                    { day: 'Thu', val: 125, fill: 'bg-brand-500' },
                    { day: 'Fri', val: 115, fill: 'bg-brand-400' },
                    { day: 'Sat', val: 132, fill: 'bg-brand-600' },
                    { day: 'Sun', val: 108, fill: 'bg-brand-500' },
                  ].map((d) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-bold text-slate-600">{d.val}L</span>
                      <div
                        className={`w-full rounded-t-lg ${d.fill} transition-all duration-300 hover:brightness-110`}
                        style={{ height: `${(d.val / 140) * 100}%` }}
                      />
                      <span className="text-[11px] font-medium text-slate-500">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* STORY 2: SPOT ABNORMAL USAGE EARLY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Actual Alert Interface Mockup Card */}
          <Reveal delay={120} className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-3xl border border-rose-200/90 bg-rose-50/40 p-4 sm:p-7 shadow-card">
              {/* Alert Header Badge */}
              <div className="flex items-center justify-between border-b border-rose-200/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm animate-pulse">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-950 text-sm sm:text-base">2σ Statistical Anomaly Detected</h4>
                    <p className="text-xs text-rose-700">Automated Night Flow Monitor · Dispatched at 06:14 AM</p>
                  </div>
                </div>
                <span className="rounded-full bg-rose-100 text-rose-800 font-bold px-3 py-1 text-xs border border-rose-200">
                  Critical Alert
                </span>
              </div>

              {/* Alert Details */}
              <div className="mt-5 space-y-3.5">
                <div className="rounded-2xl border border-rose-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Target Residence</p>
                      <p className="font-display font-bold text-slate-900 text-base mt-0.5">Flat A-202 · Wing A, 2nd Floor</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">ID: #LK-8842</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-500">Uninterrupted Flow:</span>
                      <p className="font-bold text-rose-600">4.8 Hours (01:20 - 06:00)</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Continuous Rate:</span>
                      <p className="font-bold text-rose-600">3.2 Liters / minute</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold text-slate-700 mb-1.5">Probable Diagnostic:</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Continuous baseline flow during inactive midnight hours strongly indicates a <strong>stuck toilet flush valve or underground pipe fracture</strong>.
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Email dispatched to Resident & Facility Manager
                    </span>
                    <span className="text-[11px] text-slate-400">Response &lt; 2h</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5 space-y-5 order-1 lg:order-2">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600">02 · Automated Leak AI</span>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Spot abnormal usage early.
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              A silent toilet leak can waste 20,000+ liters and trigger thousands of rupees in surprise bills. JalSetu’s statistical 2σ algorithm analyzes rolling midnight baselines to catch running flappers and burst lines within 24 hours.
            </p>
            <ul className="space-y-3 text-sm text-slate-700 pt-2">
              {[
                'Automated 2-sigma deviation threshold checks',
                'Continuous night-flow monitoring (01:00 AM – 05:00 AM)',
                'Instant dual email notifications to flat owner and maintenance',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* STORY 3: MAKE BILLING EFFORTLESS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <Reveal className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">03 · 1-Click Accounting</span>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Make billing effortless.
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              No more manual calculators or angry society meetings. JalSetu calculates progressive tiered slabs, blends tanker procurement costs, and generates tamper-proof PDF invoices with native Razorpay UPI payments.
            </p>
            <ul className="space-y-3 text-sm text-slate-700 pt-2">
              {[
                'CPHEEO 3-tier progressive conservation pricing',
                'Transparent tanker water cost apportionment (₹0 society deficit)',
                'Itemized PDF invoice delivery with instant UPI QR & receipt',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Actual Billing Interface Mockup Card */}
          <Reveal delay={120} className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-400">INVOICE #INV-2026-09-108</span>
                  <h4 className="font-bold text-slate-900 text-base">Monthly Water Utility Assessment</h4>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-3 py-1 text-xs border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Paid via UPI
                </span>
              </div>

              {/* Itemized slab table */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 text-slate-600 border-b border-slate-100">
                  <span>Tier 1 Base (0–10 kL @ ₹18/kL)</span>
                  <span className="font-mono font-semibold text-slate-900">₹180.00</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-slate-600 border-b border-slate-100">
                  <span>Tier 2 Surge (10–18 kL @ ₹32/kL)</span>
                  <span className="font-mono font-semibold text-slate-900">₹256.00</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-slate-600 border-b border-slate-100">
                  <span>Tanker Procurement Blended Share (2.1 kL)</span>
                  <span className="font-mono font-semibold text-slate-900">₹142.50</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-slate-600 border-b border-slate-100">
                  <span>Common Amenity Water Share</span>
                  <span className="font-mono font-semibold text-slate-900">₹65.00</span>
                </div>
                <div className="flex items-center justify-between py-2.5 text-sm font-bold text-slate-900 pt-3">
                  <span>Total Amount Due</span>
                  <span className="font-mono text-base text-brand-700">₹643.50</span>
                </div>
              </div>

              {/* Action buttons inside mockup */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">Transaction ID: <span className="font-mono text-slate-700">pay_O9rK18Vb3a</span></span>
                <span className="font-semibold text-brand-600 hover:text-brand-700 cursor-pointer flex items-center gap-1">
                  <FileText className="h-4 w-4" /> Download Official PDF
                </span>
              </div>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
