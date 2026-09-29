import { Shield, Building2, Home, CheckCircle2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Reveal } from '../Reveal';

interface RoleData {
  title: string;
  subtitle: string;
  badge: string;
  icon: LucideIcon;
  iconColor: string;
  borderColor: string;
  features: string[];
}

const roles: RoleData[] = [
  {
    title: 'Platform Admin',
    subtitle: 'System oversight & compliance',
    badge: 'Super Admin',
    icon: Shield,
    iconColor: 'bg-indigo-600 text-white',
    borderColor: 'border-slate-200 hover:border-indigo-300',
    features: [
      'Multi-society oversight & tenant approvals',
      'Global tariff benchmarks & policy control',
      'System-wide telemetry & audit logging',
      'High-priority support escalation desk',
    ],
  },
  {
    title: 'Apartment Admin',
    subtitle: 'Society RWA & facility managers',
    badge: 'Community Admin',
    icon: Building2,
    iconColor: 'bg-brand-600 text-white',
    borderColor: 'border-slate-200 hover:border-brand-300',
    features: [
      'Manage wing directory, flats & residents',
      'Bulk CSV meter logging with validation',
      'Private tanker procurement apportionment',
      '1-click monthly billing cycle finalization',
    ],
  },
  {
    title: 'Resident',
    subtitle: 'Household flat owners & tenants',
    badge: 'Resident Portal',
    icon: Home,
    iconColor: 'bg-emerald-600 text-white',
    borderColor: 'border-slate-200 hover:border-emerald-300',
    features: [
      'Personal household daily telemetry curves',
      'CPHEEO 135L per-capita baseline tracker',
      'Itemized PDF bills with instant UPI pay',
      '24/7 ticket center for leaks & meter checks',
    ],
  },
];

export function UserRoles() {
  return (
    <section id="roles" className="relative bg-slate-50/70 py-24 sm:py-32 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
            One Platform. Every Role.
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Tailored Dashboards for the Whole Society
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Role-based access ensures the right visibility and actions for management, operations, and residents.
          </p>
        </Reveal>

        {/* 3-Column Roles Grid: Admin | Apartment Admin | Resident */}
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <Reveal key={role.title} delay={i * 100}>
                <article
                  className={`group flex h-full flex-col justify-between rounded-3xl border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover ${role.borderColor}`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${role.iconColor} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                        {role.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-xl font-bold text-slate-900">
                      {role.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{role.subtitle}</p>

                    {/* Features list */}
                    <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                      {role.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-7 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400 group-hover:text-brand-600 transition-colors">
                    Dedicated Workspace →
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
