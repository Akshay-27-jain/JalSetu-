import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, CheckSquare, Droplets, CreditCard, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 mt-16">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Terms of Service
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Effective Date: January 1, 2026 • Version 2.0
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              By accessing, signing in, or registering on JalSetu as a Platform Admin, Community Administrator, or Household Resident, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use the platform or its automated utility billing services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Droplets className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              2. Sub-Metering & Automated Apportionment Rules
            </h2>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-300 pl-2">
              <li>
                <strong>3-Tier Progressive Tariffs:</strong> Each housing society configures its own progressive tier slabs (Base 0–10 kL, Mid 10–25 kL, and Surge &gt;25 kL) and fixed infrastructure maintenance fees. Consumption is measured via smart ultrasonic IoT meters.
              </li>
              <li>
                <strong>Bulk Tanker & Common Water Apportionment:</strong> Private tanker deliveries and municipal bulk water are apportioned proportionally according to each flat's metered consumption or carpet area weighting as resolved by the society general body.
              </li>
              <li>
                <strong>Unmetered Flat Fallbacks:</strong> Unmetered flats receive an equitable average apportionment until a certified sub-meter is installed and calibrated.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              3. Monthly Invoicing & Online Payments
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              Monthly utility invoices are generated automatically at the end of each billing cycle:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Residents receive an automated email with itemized PDF breakdown upon cycle finalization.</li>
              <li>Online payments can be settled securely via Razorpay (UPI, Net Banking, Debit/Credit Cards).</li>
              <li>Offline cash or cheque payments can be recorded and verified directly by the Community Administrator.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              4. Statistical Leak Detection & Resident Responsibilities
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              JalSetu's \(2\sigma\) automated leak detection scans are provided as an early warning monitoring tool. While our algorithms detect anomalous spikes and continuous flow deviations, residents remain responsible for inspecting private plumbing fixtures (e.g. toilet flappers, flush valves, RO units) and maintaining their indoor water lines.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Scale className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              5. Dispute Resolution & Support Desk
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Any dispute regarding meter readings, slab calculations, or tanker shared costs should be raised via the in-app <strong>Support Desk</strong> to the designated Community Administrator. Escalated society-level concerns may be reviewed by the JalSetu Platform Management.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            For legal inquiries or terms clarification, contact our compliance desk at <a href="mailto:legal@jalsetu.in" className="text-indigo-600 font-semibold underline">legal@jalsetu.in</a>.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
