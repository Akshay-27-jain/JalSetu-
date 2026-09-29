import { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, Building2, Gauge, ShieldCheck, Zap } from 'lucide-react';
import { Reveal } from '../Reveal';

interface StepItem {
  num: string;
  title: string;
  desc: string;
  pill: string;
  highlight: string;
  icon: typeof Building2;
}

const stepsData: StepItem[] = [
  {
    num: '01',
    title: 'Connect your community',
    desc: 'Set up your society and add homes in minutes.',
    pill: '15-min Onboarding',
    highlight: 'Add wings, flats, and residents instantly with 1-click CSV directory upload and automatic credential dispatch.',
    icon: Building2,
  },
  {
    num: '02',
    title: 'Read every drop',
    desc: 'Bring your meter readings into one calm dashboard.',
    pill: 'Real-time Telemetry',
    highlight: 'Log mechanical dial meters or sync digital IoT meters to track household consumption against CPHEEO’s 135L standard.',
    icon: Gauge,
  },
  {
    num: '03',
    title: 'Run a smarter society',
    desc: 'Spot issues, send bills, and keep everyone informed.',
    pill: 'Automated Invoices',
    highlight: 'Detect continuous night leaks within 24 hours and dispatch itemized tiered bills with native Razorpay UPI payments.',
    icon: Zap,
  },
];

const comparison = [
  {
    feature: 'Cost Distribution',
    traditional: 'Fixed equal split across all flats regardless of usage — heavy wasters are subsidized',
    jalsetu: 'Pay strictly for actual volume consumed via individual household sub-meters',
  },
  {
    feature: 'Conservation Incentive',
    traditional: 'Zero incentive; conservative families pay for wasteful neighbors',
    jalsetu: 'CPHEEO tiered slab rates reward green habits and penalize reckless wastage',
  },
  {
    feature: 'Leak Detection',
    traditional: 'Leaks run unnoticed for weeks until damp foundation or huge water bills occur',
    jalsetu: 'Automated 2σ anomaly algorithm flags continuous night flows within 24 hours',
  },
  {
    feature: 'Water Tanker Auditing',
    traditional: 'Unaccounted tanker costs cause annual maintenance budget shortfalls',
    jalsetu: 'Itemized tanker procurement logs with exact cost breakdown blended per kL',
  },
  {
    feature: 'Resident Transparency',
    traditional: 'Opaque lump-sum maintenance bill with recurring neighborhood disputes',
    jalsetu: 'Personal resident portal with 30-day consumption curves and PDF invoices',
  },
];

export function HowItWorks() {
  const [selectedStep, setSelectedStep] = useState(0);

  return (
    <section id="how-it-works" className="relative bg-slate-50/60 py-24 sm:py-32 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">

        {/* Top Header matching Reference Image 2 */}
        <div>
          <Reveal className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              A BETTER FLOW, FROM METER TO MIND
            </span>

            <h2 className="mt-4 font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Simple enough for today.{' '}
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-aqua-500 via-teal-500 to-brand-600 bg-clip-text text-transparent">
                Smart enough for tomorrow.
              </span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              JalSetu turns scattered readings and manual follow-ups into a shared source of truth your whole community can trust.
            </p>
          </Reveal>

          {/* Clean & Simple Interactive 3-Card Step Pipeline */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {stepsData.map((st, idx) => {
              const isSelected = selectedStep === idx;
              const Icon = st.icon;
              return (
                <div
                  key={st.num}
                  onClick={() => setSelectedStep(idx)}
                  className={`group relative flex flex-col justify-between rounded-3xl border p-7 sm:p-8 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-brand-400 shadow-card -translate-y-1.5 ring-2 ring-brand-500/10'
                      : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Row: Circular Badge & Tag */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full font-mono text-sm font-extrabold transition-colors ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-aqua-100/70 text-aqua-800 group-hover:bg-aqua-200'
                        }`}
                      >
                        {st.num}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                          isSelected
                            ? 'bg-brand-50 text-brand-700 border border-brand-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {st.pill}
                      </span>
                    </div>

                    {/* Step Title & Subtitle */}
                    <h3 className="mt-6 font-display text-xl font-bold text-slate-900 leading-snug">
                      {st.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                      {st.desc}
                    </p>

                    {/* Interactive Highlight Details */}
                    <div className={`mt-5 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                    }`}>
                      {st.highlight}
                    </div>
                  </div>

                  {/* Interactive Status Indicator */}
                  <div className="mt-6 pt-3 flex items-center justify-between text-xs font-semibold">
                    <span className={isSelected ? 'text-brand-600 font-bold' : 'text-slate-400'}>
                      {isSelected ? 'Active Step' : 'Click to inspect'}
                    </span>
                    <span className={`transition-transform duration-200 ${isSelected ? 'translate-x-1 text-brand-600' : 'text-slate-400 group-hover:translate-x-1'}`}>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: COMPARISON TABLE */}
        <div className="border-t border-slate-200/80 pt-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Why Switch to JalSetu
            </span>
            <h3 className="mt-2 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl lg:text-4xl">
              Traditional Fixed Maintenance vs JalSetu
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              See how fair sub-metering transforms community harmony and water conservation.
            </p>
          </Reveal>

          <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-4 px-5 font-bold text-slate-700 w-1/4">Key Dimension</th>
                    <th className="py-4 px-5 font-bold text-rose-700 w-3/8">Traditional Fixed Split</th>
                    <th className="py-4 px-5 font-bold text-brand-700 bg-brand-50/50 w-3/8">JalSetu Smart Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparison.map((row) => (
                    <tr key={row.feature} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900 align-top">{row.feature}</td>
                      <td className="py-4 px-5 text-slate-500 align-top">
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{row.traditional}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-800 bg-brand-50/20 align-top">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{row.jalsetu}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
