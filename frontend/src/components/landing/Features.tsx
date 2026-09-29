import { useState } from 'react';
import { Activity, Receipt, Building2, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Reveal } from '../Reveal';

interface FeatureCard {
  id: string;
  icon: typeof Activity;
  title: string;
  description: string;
  detail: string;
  iconBg: string;
  accentBorder: string;
  glowColor: string;
  tag: string;
  tagColor: string;
}

const featureCards: FeatureCard[] = [
  {
    id: 'monitoring',
    icon: Activity,
    title: 'Smart Water Monitoring',
    description: 'Track residential water consumption with clear and actionable insights.',
    detail: 'Continuous telemetry per flat with daily consumption curves and CPHEEO 135L baseline comparisons.',
    iconBg: 'bg-blue-500 text-white shadow-blue-200',
    accentBorder: 'hover:border-blue-300 hover:shadow-blue-100',
    glowColor: 'from-blue-500/10 via-transparent to-transparent',
    tag: 'Live Telemetry',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'billing',
    icon: Receipt,
    title: 'Automated Billing',
    description: 'Generate accurate water bills based on consumption.',
    detail: 'Automated 3-tier slab calculations, blended tanker cost distribution, and itemized PDF invoices with UPI links.',
    iconBg: 'bg-cyan-500 text-white shadow-cyan-200',
    accentBorder: 'hover:border-cyan-300 hover:shadow-cyan-100',
    glowColor: 'from-cyan-500/10 via-transparent to-transparent',
    tag: '1-Click Cycles',
    tagColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'management',
    icon: Building2,
    title: 'Residential Management',
    description: 'Manage residents, residences and water meters from one platform.',
    detail: 'Complete wing and flat directory with sub-meter pairing, CSV batch imports, and automated credential dispatch.',
    iconBg: 'bg-emerald-500 text-white shadow-emerald-200',
    accentBorder: 'hover:border-emerald-300 hover:shadow-emerald-100',
    glowColor: 'from-emerald-500/10 via-transparent to-transparent',
    tag: 'Directory Hub',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'security',
    icon: ShieldCheck,
    title: 'Secure Access',
    description: 'Role-based authentication keeps residential information protected.',
    detail: 'JWT stateless sessions, strict multi-tenant isolation, BCrypt password encryption, and PCI-DSS Level 1 payments.',
    iconBg: 'bg-amber-500 text-white shadow-amber-200',
    accentBorder: 'hover:border-amber-300 hover:shadow-amber-100',
    glowColor: 'from-amber-500/10 via-transparent to-transparent',
    tag: 'Bank-Grade Security',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
];

export function Features() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <section id="features" className="relative bg-gradient-to-b from-white via-slate-50/40 to-white py-24 sm:py-32 overflow-hidden border-t border-slate-100">
      {/* Soft ambient light blurs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[50rem] rounded-full bg-brand-50/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-aqua-50/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header exactly matching Reference Image 2 */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
            FEATURES
          </span>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Everything You Need to Manage{' '}
            <br className="hidden sm:block" />
            Water Smarter
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            A complete toolkit to monitor, manage, and bill residential water — all in one place.
          </p>
        </Reveal>

        {/* 4 Upgraded Glossy Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((f, i) => {
            const Icon = f.icon;
            const isHovered = activeCard === f.id;
            return (
              <Reveal key={f.id} delay={i * 80}>
                <div
                  onMouseEnter={() => setActiveCard(f.id)}
                  onMouseLeave={() => setActiveCard(null)}
                  onClick={() => setActiveCard(isHovered ? null : f.id)}
                  className={`group relative flex h-full flex-col justify-between rounded-[2rem] border border-slate-200/90 bg-white/95 p-7 sm:p-8 shadow-card transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl ${f.accentBorder}`}
                >
                  {/* Glossy top sheen highlight */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[2rem] bg-gradient-to-b from-white via-white/80 to-transparent" />

                  {/* Subtle hover gradient wash */}
                  <div className={`pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br ${f.glowColor} transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`} />

                  <div className="relative z-10">
                    {/* Top Row: Icon Square + Tag */}
                    <div className="flex items-center justify-between">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${f.iconBg} shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${f.tagColor}`}>
                        {f.tag}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="mt-6 font-display text-lg font-bold text-slate-900 leading-snug">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
                      {f.description}
                    </p>

                    {/* Expandable insight on hover */}
                    <div className={`overflow-hidden transition-all duration-300 ${
                      isHovered ? 'max-h-24 opacity-100 mt-4 pt-3 border-t border-slate-100' : 'max-h-0 opacity-0'
                    }`}>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {f.detail}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Verified
                    </span>
                    <span className="text-brand-600 group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
