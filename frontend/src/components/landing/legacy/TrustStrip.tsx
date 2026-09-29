import { useEffect, useRef } from 'react';
import { Gauge, Activity, Receipt, AlertTriangle } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const capabilities = [
  {
    icon: Gauge,
    title: 'Sub-Metering',
    desc: 'Digital IoT & mechanical CSV logging',
    color: 'text-blue-600 bg-blue-50 border-blue-200/80 group-hover:border-blue-300',
    iconBg: 'bg-blue-600 text-white',
  },
  {
    icon: Activity,
    title: 'Monitoring',
    desc: 'Daily telemetry vs 135L CPHEEO norm',
    color: 'text-brand-600 bg-brand-50 border-brand-200/80 group-hover:border-brand-300',
    iconBg: 'bg-brand-600 text-white',
  },
  {
    icon: Receipt,
    title: 'Billing',
    desc: 'Fair 3-tier tariffs & itemized PDF invoices',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80 group-hover:border-emerald-300',
    iconBg: 'bg-emerald-600 text-white',
  },
  {
    icon: AlertTriangle,
    title: 'Alerts',
    desc: '2σ leak AI & continuous flow detection',
    color: 'text-amber-600 bg-amber-50 border-amber-200/80 group-hover:border-amber-300',
    iconBg: 'bg-amber-600 text-white',
  },
];

export function TrustStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        itemsRef.current,
        { opacity: 0, y: 20, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.65,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative bg-white border-y border-slate-200/80 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
          Core Platform Capabilities
        </p>

        {/* 4 Pillars: Sub-metering | Monitoring | Billing | Alerts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                ref={(el) => { itemsRef.current[i] = el; }}
                className="group flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card"
                style={{ opacity: 0 }}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.iconBg} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-slate-900 text-sm">{c.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
