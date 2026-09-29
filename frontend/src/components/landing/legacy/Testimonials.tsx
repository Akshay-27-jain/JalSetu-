import React from 'react';
import {
  Star,
  Quote,
  Building2,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  Users,
  Droplets,
} from 'lucide-react';
import { Reveal } from '../Reveal';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  society: string;
  city: string;
  flats: string;
  metric: string;
  metricLabel: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Before JalSetu, water was bundled into equal maintenance. Families with 2 members paid the exact same as homes with 6 members, leading to constant AGM disputes. With sub-metering and tiered slabs, our society water consumption fell by 32% and disputes dropped to zero.',
    author: 'Rahul Deshmukh',
    role: 'Secretary',
    society: 'Paras Garden Housing Society',
    city: 'Pune',
    flats: '94 Flats',
    metric: '32% Drop',
    metricLabel: 'In Total Consumption',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
  },
  {
    quote:
      'During peak Bengaluru summers, tanker bills were spiraling out of control. JalSetu’s tanker apportionment engine automatically blends tanker kL costs into our monthly cycle with 100% transparency. Our residents love having their PDF bills emailed directly.',
    author: 'Ananya Swaminathan',
    role: 'Management Committee',
    society: 'Palm Meadows Heights',
    city: 'Bengaluru',
    flats: '180 Flats',
    metric: '₹3.4L / yr',
    metricLabel: 'Tanker Cost Saved',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
  },
  {
    quote:
      'The 2-sigma AI leak alert is incredible. In our very first week, the system flagged 14 flats with abnormal continuous night usage. Every single one turned out to be a silent flush valve leak or pipe seepage that was previously undetected.',
    author: 'Vikramaditya Roy',
    role: 'Treasurer & Facility Head',
    society: 'Silver Oak Greens RWA',
    city: 'Mumbai',
    flats: '240 Flats',
    metric: '14 Leaks Caught',
    metricLabel: 'In First Fortnight',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative bg-white py-24 sm:py-32 overflow-hidden">
      {/* Background graphic elements */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 shadow-sm">
            <Award className="h-4 w-4 text-brand-600" />
            Verified Society Case Studies
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Trusted by Forward-Thinking Communities
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            See how residential societies across India eliminated billing friction, slashed tanker reliance, and built sustainable water habits.
          </p>
        </Reveal>

        {/* Testimonials 3-Column Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((item, idx) => (
            <Reveal key={item.society} delay={idx * 120}>
              <div className="group relative flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover">
                {/* Metric Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <span className="font-display text-2xl font-extrabold text-brand-600 group-hover:text-aqua-600 transition-colors">
                      {item.metric}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {item.metricLabel}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Quote Body */}
                <div className="mt-6 flex-1">
                  <Quote className="h-7 w-7 text-brand-200" />
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    "{item.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="mt-8 flex items-center gap-3.5 border-t border-slate-100 pt-5">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    <img
                      src={item.avatar}
                      alt={item.author}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-bold text-slate-900">
                      {item.author}
                    </h4>
                    <p className="truncate text-xs text-slate-500 font-medium">
                      {item.role} · <span className="text-brand-600">{item.society}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {item.city} ({item.flats})
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Trust Badges Ribbon */}
        <div className="mt-16 rounded-3xl bg-slate-900 px-6 py-8 sm:px-12 sm:py-10 text-white shadow-xl">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            <div className="pt-4 sm:pt-0">
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-aqua-300">4.2M+</p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-300">Liters Monitored</p>
              <p className="text-[11px] text-slate-500">Real-time daily telemetry</p>
            </div>
            <div className="pt-4 sm:pt-0">
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-white">99.8%</p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-300">Collection Rate</p>
              <p className="text-[11px] text-slate-500">Zero disputes recorded</p>
            </div>
            <div className="pt-4 sm:pt-0">
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-amber-300">&lt; 24h</p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-300">Leak Alert Response</p>
              <p className="text-[11px] text-slate-500">Automated 2σ anomaly trigger</p>
            </div>
            <div className="pt-4 sm:pt-0">
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-300">100%</p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-300">CPHEEO Compliant</p>
              <p className="text-[11px] text-slate-500">Aligned with 135L standard</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
