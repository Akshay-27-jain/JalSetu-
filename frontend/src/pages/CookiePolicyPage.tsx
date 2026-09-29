import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ArrowLeft, CheckCircle2, Info, Settings, BarChart2 } from 'lucide-react';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';

export const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 mt-16">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Cookie className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Cookie Policy
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Effective Date: January 1, 2026 · Last updated: September 2026
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-amber-600" />
              1. What Are Cookies?
            </h2>
            <p className="text-slate-600">
              Cookies are small text files placed on your device when you visit the JalSetu platform. They help us keep you signed in, remember your preferences, and understand how the platform is used — so we can keep improving it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-amber-600" />
              2. Cookies We Use
            </h2>
            <div className="space-y-4">
              {[
                {
                  name: 'Essential Cookies',
                  desc: 'Required for the platform to function. These include your JWT authentication token (stored in httpOnly cookies or localStorage), session identifiers, and CSRF protection tokens. You cannot opt out of these.',
                  badge: 'Always Active',
                  badgeColor: 'bg-emerald-100 text-emerald-700',
                },
                {
                  name: 'Preference Cookies',
                  desc: 'Remember your UI settings such as dark/light mode, language preferences, and notification dismissal states. These persist across sessions for your convenience.',
                  badge: 'Optional',
                  badgeColor: 'bg-amber-100 text-amber-700',
                },
                {
                  name: 'Analytics Cookies',
                  desc: 'Help us understand which pages are visited most, where errors occur, and how residents interact with the billing and meter-reading features. We do not sell this data to third parties.',
                  badge: 'Optional',
                  badgeColor: 'bg-amber-100 text-amber-700',
                },
              ].map((c) => (
                <div key={c.name} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${c.badgeColor}`}>
                      {c.badge}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <BarChart2 className="h-4 w-4 text-amber-600" />
              3. Third-Party Cookies
            </h2>
            <ul className="space-y-2 pl-2 text-slate-600">
              {[
                'Razorpay — payment processing (PCI-DSS Level 1 compliant, their own cookie policy applies).',
                'Google OAuth — if you use Sign in with Google for platform authentication.',
                'We do NOT use Facebook Pixel, Google Ads, or any advertising/retargeting cookies.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Cookie className="h-4 w-4 text-amber-600" />
              4. Managing Your Cookie Preferences
            </h2>
            <p className="text-slate-600 mb-3">
              You can manage cookie preferences at any time through the cookie consent banner shown on your first visit. You can also clear cookies from your browser settings at any time. Clearing essential cookies will sign you out of the platform.
            </p>
            <p className="text-slate-600">
              Most browsers allow you to refuse cookies or delete them. Visit your browser's help documentation for specific instructions on managing cookies.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            For cookie-related inquiries, contact us at{' '}
            <a href="mailto:privacy@jalsetu.in" className="text-brand-600 font-semibold underline">
              privacy@jalsetu.in
            </a>
            .
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicyPage;
