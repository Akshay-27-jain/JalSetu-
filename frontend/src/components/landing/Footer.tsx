import { Link } from 'react-router-dom';
import { Waves, Heart, Mail, Phone, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { Logo } from '../Logo';
import { PwaInstallButton } from '../PwaInstallButton';

const linkGroups = [
  {
    title: 'Platform',
    links: [
      { label: 'Features', to: '/#features' },
      { label: 'How It Works', to: '/#how-it-works' },
      { label: 'FAQ', to: '/#faq' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', to: '/login' },
      { label: 'Register Community', to: '/register' },
      { label: 'Admin Portal', to: '/login' },
      { label: 'Resident Portal', to: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookie Policy', to: '/cookies' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white">
      <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Logo size="md" to="/" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              JalSetu is an enterprise-grade smart water management & automated billing platform empowering residential societies with sub-meter telemetry, CPHEEO tiered tariff apportionment, 2σ leak alarms, and itemized PDF invoices.
            </p>
            <div className="mt-5 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-600 shrink-0" />
                <span>support@jalsetu.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
                <span>India · Smart City Water Grid Initiative</span>
              </div>
            </div>
            <div className="mt-6">
              <PwaInstallButton variant="pill" />
            </div>
          </div>

          {/* Navigation Links Columns */}
          {linkGroups.map((group, i) => (
            <div key={i} className="min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">{group.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-xs sm:text-sm text-slate-600 transition-colors hover:text-brand-600 font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-12 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 JalSetu Platform. All rights reserved. Made for smart residential water conservation.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
