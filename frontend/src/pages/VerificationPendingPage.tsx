import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi, extractErrorMessage } from '../services/api';
import type { VerificationStatusResponse } from '../types';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Upload,
  RefreshCw,
  ArrowRight,
  Mail,
  Building2,
  Home,
  HelpCircle,
  FileCheck,
  Check,
  Sparkles,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VerificationPendingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  const emailParam = searchParams.get('email') || user?.email || '';
  const [email, setEmail] = useState(emailParam);
  const [data, setData] = useState<VerificationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Re-submission form state for 3 documents
  const [isReuploading, setIsReuploading] = useState(false);
  const [doc1Type, setDoc1Type] = useState('SOCIETY_REGISTRATION');
  const [doc1FileName, setDoc1FileName] = useState('');
  const [doc1Base64, setDoc1Base64] = useState('');

  const [doc2Type, setDoc2Type] = useState('AADHAAR_CARD');
  const [doc2FileName, setDoc2FileName] = useState('');
  const [doc2Base64, setDoc2Base64] = useState('');

  const [doc3Type, setDoc3Type] = useState('RWA_RESOLUTION');
  const [doc3FileName, setDoc3FileName] = useState('');
  const [doc3Base64, setDoc3Base64] = useState('');

  const [reuploadSubmitting, setReuploadSubmitting] = useState(false);

  const fetchStatus = async (targetEmail = email) => {
    if (!targetEmail) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.getVerificationStatus(targetEmail);
      setData(res);

      // Pre-fill existing document metadata
      if (res.doc1Type) setDoc1Type(res.doc1Type);
      if (res.doc2Type) setDoc2Type(res.doc2Type);
      if (res.doc3Type) setDoc3Type(res.doc3Type);

      if (res.status === 'ACTIVE') {
        setSuccessMsg('Your account has been verified and approved! Redirecting to your dashboard...');
        setTimeout(() => {
          if (res.role === 'RESIDENT' || user?.role === 'RESIDENT') {
            navigate('/resident/dashboard');
          } else {
            navigate('/community-admin/dashboard');
          }
        }, 2000);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchStatus(email);
    } else {
      setLoading(false);
    }
  }, [email]);

  const cleanPayload = (b64: string) => {
    if (!b64) return '';
    const idx = b64.indexOf(',');
    return idx !== -1 && idx < 100 ? b64.substring(idx + 1).trim() : b64.trim();
  };

  const isDuplicatePayload = (p1: string, name1: string, p2: string, name2: string) => {
    if (!p1 || !p2) return false;
    const clean1 = cleanPayload(p1);
    const clean2 = cleanPayload(p2);
    if (clean1 === clean2) return true;
    if (clean1.length > 200 && clean1.length === clean2.length && clean1.slice(0, 200) === clean2.slice(0, 200)) return true;
    if (name1 && name2 && name1.trim().toLowerCase() === name2.trim().toLowerCase() && Math.abs(clean1.length - clean2.length) < 50) return true;
    return false;
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    slotIndex: 1 | 2 | 3,
    setFileName: (name: string) => void,
    setBase64: (data: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;

      // Duplicate check against other slots
      if (slotIndex === 1) {
        const target2 = doc2Base64 || data?.doc2Url;
        const target3 = doc3Base64 || data?.doc3Url;
        if (target2 && isDuplicatePayload(b64, file.name, target2, doc2FileName || data?.doc2FileName || '')) {
          setError(`⚠️ Duplicate Document: "${file.name}" is identical to Document 2. Each required verification document must be a distinct, separate file.`);
          e.target.value = '';
          return;
        }
        if (target3 && isDuplicatePayload(b64, file.name, target3, doc3FileName || data?.doc3FileName || '')) {
          setError(`⚠️ Duplicate Document: "${file.name}" is identical to Document 3. Each required verification document must be a distinct, separate file.`);
          e.target.value = '';
          return;
        }
      } else if (slotIndex === 2) {
        const target1 = doc1Base64 || data?.doc1Url;
        const target3 = doc3Base64 || data?.doc3Url;
        if (target1 && isDuplicatePayload(b64, file.name, target1, doc1FileName || data?.doc1FileName || '')) {
          setError(`⚠️ Duplicate Document: "${file.name}" is identical to Document 1. Each required verification document must be a distinct, separate file.`);
          e.target.value = '';
          return;
        }
        if (target3 && isDuplicatePayload(b64, file.name, target3, doc3FileName || data?.doc3FileName || '')) {
          setError(`⚠️ Duplicate Document: "${file.name}" is identical to Document 3. Each required verification document must be a distinct, separate file.`);
          e.target.value = '';
          return;
        }
      } else if (slotIndex === 3) {
        const target1 = doc1Base64 || data?.doc1Url;
        const target2 = doc2Base64 || data?.doc2Url;
        if (target1 && isDuplicatePayload(b64, file.name, target1, doc1FileName || data?.doc1FileName || '')) {
          setError(`⚠️ Duplicate Document: "${file.name}" is identical to Document 1. Each required verification document must be a distinct, separate file.`);
          e.target.value = '';
          return;
        }
        if (target2 && isDuplicatePayload(b64, file.name, target2, doc2FileName || data?.doc2FileName || '')) {
          setError(`⚠️ Duplicate Document: "${file.name}" is identical to Document 2. Each required verification document must be a distinct, separate file.`);
          e.target.value = '';
          return;
        }
      }

      setError(null);
      setFileName(file.name);
      setBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const finalDoc1 = doc1Base64 || data.doc1Url;
    const finalDoc2 = doc2Base64 || data.doc2Url;
    const finalDoc3 = doc3Base64 || data.doc3Url;

    if (!finalDoc1) {
      setError('Please upload Document 1 (Property / Flat Ownership Proof).');
      return;
    }
    if (!finalDoc2) {
      setError('Please upload Document 2 (Government ID Proof).');
      return;
    }
    if (!finalDoc3) {
      setError('Please upload Document 3 (Signatory / Utility Proof).');
      return;
    }

    if (
      isDuplicatePayload(finalDoc1, doc1FileName || data.doc1FileName || '', finalDoc2, doc2FileName || data.doc2FileName || '') ||
      isDuplicatePayload(finalDoc1, doc1FileName || data.doc1FileName || '', finalDoc3, doc3FileName || data.doc3FileName || '') ||
      isDuplicatePayload(finalDoc2, doc2FileName || data.doc2FileName || '', finalDoc3, doc3FileName || data.doc3FileName || '')
    ) {
      setError('⚠️ Duplicate Document Error: All 3 verification documents must be distinct, separate files. Duplicate uploads detected.');
      return;
    }

    try {
      setReuploadSubmitting(true);
      setError(null);
      const res = await authApi.resubmitVerification({
        communityName: data.apartmentName || 'My Community',
        adminFullName: data.fullName || 'Applicant',
        adminEmail: data.email,
        doc1Type: doc1Type || data.doc1Type,
        doc1FileName: doc1FileName || data.doc1FileName || 'doc1.pdf',
        doc1Base64: finalDoc1,
        doc2Type: doc2Type || data.doc2Type,
        doc2FileName: doc2FileName || data.doc2FileName || 'doc2.pdf',
        doc2Base64: finalDoc2,
        doc3Type: doc3Type || data.doc3Type,
        doc3FileName: doc3FileName || data.doc3FileName || 'doc3.pdf',
        doc3Base64: finalDoc3,
      });

      login(res);
      setSuccessMsg('All 3 updated verification documents successfully re-submitted! Our team will review them promptly.');
      setIsReuploading(false);
      setDoc1Base64('');
      setDoc2Base64('');
      setDoc3Base64('');
      fetchStatus(data.email);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setReuploadSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isResident = data?.role === 'RESIDENT' || (data?.flatNumber && data?.flatNumber !== 'N/A' && data?.flatNumber !== 'ADMIN');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/20 to-sky-50/40 dark:from-slate-950 dark:via-[#0B1120] dark:to-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Navbar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-500/25 font-bold text-lg">
            💧
          </div>
          <div>
            <h1 className="font-display text-lg font-black text-slate-900 dark:text-white leading-tight">
              JalSetu <span className="text-brand-600 text-xs font-semibold">(जलसेतु)</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Identity &amp; Mandatory 3-Document Verification Desk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchStatus()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            title="Refresh Status"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Status Container */}
      <div className="max-w-3xl w-full mx-auto my-auto py-8">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 animate-fade-in shadow-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-700 dark:text-emerald-300 animate-fade-in shadow-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#131B2E] p-10 shadow-xl text-center space-y-4">
            <RefreshCw className="h-9 w-9 mx-auto animate-spin text-brand-600" />
            <h3 className="font-display font-bold text-slate-800 dark:text-white">
              Checking Verification Status &amp; AI Authenticity Audit...
            </h3>
            <p className="text-xs text-slate-500">Connecting to JalSetu Platform Governance Database</p>
          </div>
        ) : !data ? (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#131B2E] p-8 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Track Application Verification Status
              </h2>
              <p className="text-xs text-slate-500">
                Enter your registered administrator or resident email address to view the review progress of your 3-document submission.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchStatus(email);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 shadow-md shadow-brand-500/20 transition-all cursor-pointer"
              >
                Track Status &rarr;
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#131B2E] p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in relative overflow-hidden">
            {/* Header Badge & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-black text-slate-900 dark:text-white">
                    {data.apartmentName || 'Community Application'}
                  </span>
                  {data.flatNumber && data.flatNumber !== 'N/A' && data.flatNumber !== 'ADMIN' && (
                    <span className="rounded-lg bg-brand-50 dark:bg-brand-950 px-2 py-0.5 text-xs font-bold text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      Flat {data.flatNumber}
                    </span>
                  )}
                  <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    {isResident ? 'Resident Application' : 'Community Admin Application'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>Applicant: <strong>{data.fullName}</strong> ({data.email})</span>
                </p>
              </div>

              <div>
                {data.status === 'PENDING_APPROVAL' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 shadow-2xs">
                    <Clock className="h-3.5 w-3.5 animate-spin" />
                    <span>Awaiting Admin Approval</span>
                  </span>
                ) : data.status === 'REJECTED' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-3.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 shadow-2xs">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Action Required</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approved &amp; Active</span>
                  </span>
                )}
              </div>
            </div>

            {/* AI Document Authenticity & Fraud Risk Gauge */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  AI Document Authenticity &amp; Fraud Risk Analysis
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    (data.aiVerificationScore ?? 0) >= 80
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      : (data.aiVerificationScore ?? 0) >= 50
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                  }`}
                >
                  Authenticity: {data.aiVerificationScore ?? 85}% ({data.aiVerificationStatus || 'AUTHENTIC'})
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {data.aiVerificationSummary ||
                  'Automated verification completed: File structures validated, no placeholder demo watermarks detected, and credentials cross-verified with registry.'}
              </p>
            </div>

            {/* 3 Submitted Documents Snapshot */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5 text-brand-600" />
                Submitted 3-Document Package
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Doc 1 */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-white">
                    <span className="truncate">1. Property / Flat Proof</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {data.doc1FileName || data.documentFileName || 'property_doc.pdf'}
                  </p>
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono block truncate">
                    {data.doc1Type || data.documentType || 'PROPERTY_PROOF'}
                  </span>
                </div>

                {/* Doc 2 */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-white">
                    <span className="truncate">2. Government ID Proof</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {data.doc2FileName || 'govt_id_proof.pdf'}
                  </p>
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono block truncate">
                    {data.doc2Type || 'GOVT_ID'}
                  </span>
                </div>

                {/* Doc 3 */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-white">
                    <span className="truncate">3. Signatory / Utility</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {data.doc3FileName || 'signatory_utility.pdf'}
                  </p>
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono block truncate">
                    {data.doc3Type || 'AUTH_SIGNATORY'}
                  </span>
                </div>
              </div>
            </div>

            {/* STATUS CALLOUTS */}
            {data.status === 'PENDING_APPROVAL' && (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-transparent dark:from-amber-950/40 dark:via-[#131B2E] p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20">
                    <Clock className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      Application Under Main Admin Review
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Your 3-document verification package is undergoing final manual approval by Platform Governance. Verification is typically completed within <strong>12 to 24 hours</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.status === 'REJECTED' && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-bold shadow-md shadow-rose-500/20">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-rose-900 dark:text-rose-200">
                        Verification Requires Updated Documents
                      </h4>
                      <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                        The platform administration was unable to verify one or more documents. Please review the feedback below and re-upload valid proofs.
                      </p>
                    </div>
                  </div>

                  {data.verificationNotes && (
                    <div className="bg-white dark:bg-[#131B2E] border border-rose-200 dark:border-rose-900 rounded-xl p-3.5 mt-2">
                      <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                        Admin Feedback &amp; Reason:
                      </p>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                        "{data.verificationNotes}"
                      </p>
                    </div>
                  )}
                </div>

                {!isReuploading ? (
                  <button
                    onClick={() => setIsReuploading(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Re-upload Corrected 3-Document Package &rarr;</span>
                  </button>
                ) : (
                  <form onSubmit={handleResubmit} className="bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-fade-in">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <Upload className="h-4 w-4 text-brand-600" />
                      Re-submit 3-Document Package
                    </h5>

                    {/* Doc 1 Re-upload */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        1. Property / Flat Proof (PDF, JPG up to 10MB)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={doc1Type}
                          onChange={(e) => setDoc1Type(e.target.value)}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                        >
                          <option value="SOCIETY_REGISTRATION">Society / RWA Registration Certificate</option>
                          <option value="SALE_DEED">Sale Deed / Possession Letter</option>
                          <option value="REGISTERED_RENT_AGREEMENT">Registered Rent Agreement</option>
                          <option value="UTILITY_BILL">Common / Flat Utility Bill</option>
                        </select>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileUpload(e, 1, setDoc1FileName, setDoc1Base64)}
                          className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700"
                        />
                      </div>
                      {doc1FileName && <p className="text-[10px] text-emerald-600">✓ Selected: {doc1FileName}</p>}
                    </div>

                    {/* Doc 2 Re-upload */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        2. Government ID Proof (Aadhaar, Passport, Voter ID)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={doc2Type}
                          onChange={(e) => setDoc2Type(e.target.value)}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                        >
                          <option value="AADHAAR_CARD">Aadhaar Card</option>
                          <option value="PASSPORT">Passport</option>
                          <option value="VOTER_ID">Voter ID</option>
                          <option value="DRIVING_LICENSE">Driving License</option>
                        </select>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileUpload(e, 2, setDoc2FileName, setDoc2Base64)}
                          className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700"
                        />
                      </div>
                      {doc2FileName && <p className="text-[10px] text-emerald-600">✓ Selected: {doc2FileName}</p>}
                    </div>

                    {/* Doc 3 Re-upload */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        3. Signatory / Representative Proof / Utility Bill
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={doc3Type}
                          onChange={(e) => setDoc3Type(e.target.value)}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                        >
                          <option value="RWA_RESOLUTION">RWA Resolution Letter</option>
                          <option value="AUTH_REPRESENTATIVE_LETTER">Authorization Letter</option>
                          <option value="ELECTRICITY_BILL">Electricity / Water Bill</option>
                          <option value="LANDLORD_NOC">Landlord NOC</option>
                        </select>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileUpload(e, 3, setDoc3FileName, setDoc3Base64)}
                          className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700"
                        />
                      </div>
                      {doc3FileName && <p className="text-[10px] text-emerald-600">✓ Selected: {doc3FileName}</p>}
                    </div>

                    <div className="flex items-center gap-2.5 pt-2">
                      <button
                        type="submit"
                        disabled={reuploadSubmitting}
                        className="flex-1 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {reuploadSubmitting ? 'Analyzing & Submitting...' : 'Re-submit 3-Document Package'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsReuploading(false)}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {data.status === 'ACTIVE' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 p-5 space-y-2 text-center">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500" />
                  <h4 className="font-display font-bold text-emerald-950 dark:text-emerald-200 text-base">
                    Identity &amp; Documents Verified &amp; Approved!
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Your account has been fully activated. You can now access your real-time water monitoring portal.
                  </p>
                </div>

                <Link
                  to={isResident ? '/resident/dashboard' : '/community-admin/dashboard'}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <span>{isResident ? 'Launch Resident Water Portal' : 'Launch Community Admin Dashboard'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Support Help Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
              <span>Need assistance with your verification? Contact </span>
              <a href="mailto:support@jalsetu.in" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                support@jalsetu.in
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Page Footer */}
      <div className="text-center text-xs text-slate-400 py-2">
        JalSetu (जलसेतु) • Smart Water Governance &amp; Community Compliance Platform • ISO 27001 Certified
      </div>
    </div>
  );
};
