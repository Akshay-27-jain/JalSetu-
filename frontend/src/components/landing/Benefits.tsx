import { Users, Truck, AlertTriangle, FileText, Droplets, Gauge, CheckCircle2, Sparkles } from 'lucide-react';
import { Reveal } from '../Reveal';

const benefitsList = [
  {
    icon: Users,
    title: 'Zero Maintenance Disputes',
    tag: 'Community Harmony',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
    description: 'Flats pay strictly for actual volume consumed via individual sub-meters. Conservative families stop cross-subsidizing heavy water wasters.',
    highlight: '100% Fair Billing',
    gradient: 'from-blue-500 to-indigo-600',
    edgeColor: 'border-t-blue-500 hover:border-blue-400 hover:shadow-blue-100',
    accentText: 'text-blue-600',
  },
  {
    icon: Truck,
    title: 'Eliminate Tanker Deficits',
    tag: 'Zero Deficit',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
    description: 'Private water tanker procurement volumes and costs are automatically blended into monthly cycles with zero end-of-year maintenance shortfalls.',
    highlight: 'Blended Cost Model',
    gradient: 'from-amber-500 to-orange-600',
    edgeColor: 'border-t-amber-500 hover:border-amber-400 hover:shadow-amber-100',
    accentText: 'text-amber-600',
  },
  {
    icon: AlertTriangle,
    title: '24-Hour Leak Detection',
    tag: 'AI Anomaly Watch',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200/80',
    description: 'Automated 2-sigma statistical analysis detects running toilet flappers and underground pipe leaks during midnight hours before wall damage occurs.',
    highlight: '< 24h Early Alerts',
    gradient: 'from-rose-500 to-red-600',
    edgeColor: 'border-t-rose-500 hover:border-rose-400 hover:shadow-rose-100',
    accentText: 'text-rose-600',
  },
  {
    icon: FileText,
    title: 'Automated Itemized Billing',
    tag: '1-Click Cycles',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    description: 'Generate itemized PDF invoices detailing sub-meter readings, CPHEEO tiered tariff rates, tanker surcharges, and instant Razorpay UPI pay links.',
    highlight: 'Email & PDF Delivery',
    gradient: 'from-emerald-500 to-teal-600',
    edgeColor: 'border-t-emerald-500 hover:border-emerald-400 hover:shadow-emerald-100',
    accentText: 'text-emerald-600',
  },
  {
    icon: Droplets,
    title: 'Save up to 32% Water',
    tag: 'Conservation First',
    tagColor: 'bg-sky-50 text-sky-700 border-sky-200/80',
    description: 'Tiered tariff slabs incentivize mindful usage and penalize reckless wastage, reducing overall apartment water consumption without rationing.',
    highlight: 'CPHEEO 135L Baseline',
    gradient: 'from-sky-500 to-cyan-600',
    edgeColor: 'border-t-sky-500 hover:border-sky-400 hover:shadow-sky-100',
    accentText: 'text-sky-600',
  },
  {
    icon: Gauge,
    title: 'Zero Hardware Lock-In',
    tag: 'Flexible Inputs',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
    description: 'Compatible with existing mechanical dial meters via 1-click bulk CSV imports or modern ultrasonic IoT digital meters with zero costly retrofit mandates.',
    highlight: 'Digital & Manual CSV',
    gradient: 'from-purple-500 to-indigo-600',
    edgeColor: 'border-t-purple-500 hover:border-purple-400 hover:shadow-purple-100',
    accentText: 'text-purple-600',
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="relative bg-white py-24 sm:py-32 overflow-hidden border-t border-slate-100">
      {/* Ambient background blur */}
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-brand-50/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-aqua-50/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50/90 border border-brand-200/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 shadow-2xs">
            <img src="/water-drop.svg" alt="JalSetu Logo" className="h-4 w-4 rounded shrink-0 shadow-xs" />
            Core Benefits
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Why Modern Societies Switch to JalSetu
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Say goodbye to lump-sum maintenance fees and endless WhatsApp arguments. Enjoy transparent, fair, and automated water management.
          </p>
        </Reveal>

        {/* 6 Core Societal Advantage Cards with Distinct Colored Top Edges */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefitsList.map((b, i) => {
            const Icon = b.icon;
            return (
              <Reveal key={b.title} delay={i * 70}>
                <article
                  className={`group relative flex h-full flex-col justify-between rounded-3xl border border-slate-200/90 border-t-4 bg-white p-7 sm:p-8 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${b.edgeColor}`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${b.gradient} text-white shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${b.tagColor}`}>
                        {b.tag}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-lg font-bold text-slate-900 leading-snug">
                      {b.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                      {b.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border bg-slate-50 border-slate-100 ${b.accentText}`}>
                      {b.highlight}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Proven Impact
                    </span>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
