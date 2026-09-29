import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Server, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';

export const PrivacyPolicyPage: React.FC = () => {
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Effective Date: January 1, 2026 • Last updated: September 2026
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              1. Introduction & Scope
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              JalSetu ("we", "our", or "the Platform") operates a smart sub-metering, water telemetry, and automated tiered utility billing system for residential communities and housing societies. We are deeply committed to protecting the privacy, accuracy, and security of all personal data, consumption logs, and billing information collected through our IoT hardware and web application.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              2. Information We Collect
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              We collect information strictly necessary for water tracking, fair tiered cost apportionment, leak anomaly detection, and monthly utility invoice generation:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>User Profile & Account Information:</strong> Full name, registered email address, assigned apartment society name, and flat number.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Water Meter Telemetry:</strong> Ultrasonic sub-meter serial numbers, daily meter readings in kiloliters (kL), consumption timestamps, and calculated standard deviations (\(\sigma\)).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Billing & Payment Metadata:</strong> Monthly generated itemized invoices, payment status, Razorpay payment order references, and payment timestamps. (We do not store raw credit card numbers or UPI PINs).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Community Concerns & Notices:</strong> Support ticket descriptions, maintenance notes, and society broadcast announcements.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              3. How We Use Your Data
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              Your data is processed strictly for legitimate operational purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Computing exact progressive 3-tier consumption charges and base maintenance fees.</li>
              <li>Running automated statistical \(2\sigma\) anomaly scans to alert residents of potential plumbing leaks.</li>
              <li>Generating itemized PDF invoices and delivering email alerts to verified household residents.</li>
              <li>Providing multi-language AI Copilot assistance directly within your portal.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              4. Multi-Tenant Data Isolation & Security
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              All data is segregated under strict multi-tenant boundaries. Individual household residents can only view their own flat consumption and invoices. Community administrators can only access flats and records within their registered apartment society. All API transactions are secured via JSON Web Tokens (JWT), BCrypt password hashing, and encrypted TLS transport.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              5. Data Retention & Your Rights
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Historical water meter readings and billing records are retained for auditing and historical trend analysis. Residents may request profile corrections or account status reviews at any time by contacting their Community Administrator or submitting a ticket through the Resident Support Desk.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            For inquiries regarding our privacy practices or data compliance, please reach out to <a href="mailto:privacy@jalsetu.in" className="text-blue-600 font-semibold underline">privacy@jalsetu.in</a>.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
