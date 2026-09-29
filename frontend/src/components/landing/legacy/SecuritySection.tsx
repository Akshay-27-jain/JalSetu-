import { Key, ShieldCheck, Database, Lock, CheckCircle2 } from 'lucide-react';
import { Reveal } from '../Reveal';

const securityFeatures = [
  {
    icon: Key,
    title: 'JWT Authentication',
    tag: 'Stateless Sessions',
    desc: 'Cryptographically signed bearer tokens with automatic session expiration and refresh protection.',
    color: 'from-blue-600 to-indigo-600',
    border: 'hover:border-blue-300',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access (RBAC)',
    tag: 'Strict Privileges',
    desc: 'Fine-grained access control ensuring residents only see their own flat while admins manage community operations.',
    color: 'from-brand-600 to-aqua-600',
    border: 'hover:border-brand-300',
  },
  {
    icon: Database,
    title: 'Multi-Tenant Isolation',
    tag: 'Data Sovereignty',
    desc: 'Dedicated tenant boundaries per society. Zero cross-society data leakage or unauthorized access.',
    color: 'from-emerald-600 to-teal-600',
    border: 'hover:border-emerald-300',
  },
  {
    icon: Lock,
    title: 'Secure Access & Encryption',
    tag: 'End-to-End',
    desc: 'HTTPS TLS 1.3 in-transit encryption, BCrypt password hashing at-rest, and PCI-DSS Level 1 Razorpay checkout.',
    color: 'from-purple-600 to-pink-600',
    border: 'hover:border-purple-300',
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="relative bg-white py-24 sm:py-32 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Enterprise Security
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Built with Security at the Foundation
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Protecting residential telemetry and financial records with banking-grade protocols.
          </p>
        </Reveal>

        {/* 4 Security Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((sec, i) => {
            const Icon = sec.icon;
            return (
              <Reveal key={sec.title} delay={i * 80}>
                <div className={`group flex h-full flex-col justify-between rounded-3xl border border-slate-200/90 bg-slate-50/50 p-6 sm:p-7 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:bg-white hover:shadow-card ${sec.border}`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${sec.color} text-white shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-lg bg-white border border-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {sec.tag}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-base font-bold text-slate-900">
                      {sec.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      {sec.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Standard
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
