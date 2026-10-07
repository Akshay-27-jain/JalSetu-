import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mainAdminApi, extractErrorMessage } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonTable } from '../../components/SkeletonLoader';
import { Building2, Users, Droplets, ShieldCheck, Plus, Search, Mail, MapPin, CheckCircle2, AlertCircle, ArrowRight, UserCheck, FileText, UploadCloud, Bot, Phone } from 'lucide-react';
import type { Apartment, MainAdminStats } from '../../types';

export const MainAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<MainAdminStats | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // New Apartment Form
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [totalHouseholds, setTotalHouseholds] = useState<number | ''>(20);
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // 3 Verification Documents State
  const [doc1Type, setDoc1Type] = useState('SOCIETY_REGISTRATION_DEED');
  const [doc1FileName, setDoc1FileName] = useState('');
  const [doc1Base64, setDoc1Base64] = useState<string | undefined>(undefined);

  const [doc2Type, setDoc2Type] = useState('GOVERNMENT_ID_PROOF');
  const [doc2FileName, setDoc2FileName] = useState('');
  const [doc2Base64, setDoc2Base64] = useState<string | undefined>(undefined);

  const [doc3Type, setDoc3Type] = useState('RWA_BOARD_RESOLUTION');
  const [doc3FileName, setDoc3FileName] = useState('');
  const [doc3Base64, setDoc3Base64] = useState<string | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState('');

  // Generic file upload to base64 handler
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (fileName: string, base64: string) => void,
    onError: (msg: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onError(`File "${file.name}" exceeds 10MB limit. Please upload a smaller PDF or image.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSuccess(file.name, reader.result);
      }
    };
    reader.onerror = () => {
      onError(`Failed to read "${file.name}". Please try another file.`);
    };
    reader.readAsDataURL(file);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, aptsData] = await Promise.all([
        mainAdminApi.getStats(),
        mainAdminApi.getApartments(),
      ]);
      setStats(statsData);
      setApartments(aptsData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !adminFullName.trim() || !adminEmail.trim() || !adminPassword) {
      setModalError('Please fill in all required fields.');
      return;
    }

    // Check duplicate documents if multiple uploaded
    if (doc1Base64 && doc2Base64 && doc3Base64) {
      const cleanPayload = (b64?: string) => {
        if (!b64) return '';
        const idx = b64.indexOf(',');
        return idx !== -1 && idx < 100 ? b64.substring(idx + 1).trim() : b64.trim();
      };
      const p1 = cleanPayload(doc1Base64);
      const p2 = cleanPayload(doc2Base64);
      const p3 = cleanPayload(doc3Base64);
      if (p1 === p2 || p1 === p3 || p2 === p3) {
        setModalError('⚠️ Duplicate Document Error: All 3 verification documents must be distinct, separate files. Duplicate uploads detected.');
        return;
      }
    }

    try {
      setSubmitting(true);
      setModalError(null);
      await mainAdminApi.createApartment({
        name: name.trim(),
        address: address.trim() || undefined,
        totalHouseholds: typeof totalHouseholds === 'number' && totalHouseholds > 0 ? totalHouseholds : 20,
        adminFullName: adminFullName.trim(),
        adminEmail: adminEmail.trim(),
        adminPhone: adminPhone.trim() || undefined,
        adminPassword,
        doc1Type: doc1Base64 ? doc1Type : undefined,
        doc1FileName: doc1Base64 ? doc1FileName : undefined,
        doc1Base64: doc1Base64 || undefined,
        doc2Type: doc2Base64 ? doc2Type : undefined,
        doc2FileName: doc2Base64 ? doc2FileName : undefined,
        doc2Base64: doc2Base64 || undefined,
        doc3Type: doc3Base64 ? doc3Type : undefined,
        doc3FileName: doc3Base64 ? doc3FileName : undefined,
        doc3Base64: doc3Base64 || undefined,
      });

      // Reset form & close modal
      setName('');
      setAddress('');
      setTotalHouseholds(20);
      setAdminFullName('');
      setAdminEmail('');
      setAdminPhone('');
      setAdminPassword('');
      setDoc1FileName('');
      setDoc1Base64(undefined);
      setDoc2FileName('');
      setDoc2Base64(undefined);
      setDoc3FileName('');
      setDoc3Base64(undefined);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setModalError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApartments = apartments.filter(
    (apt) =>
      apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.adminName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Banner & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Platform Owner Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            High-level overview of all onboarded apartment communities and global water metrics.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-brand-500/25 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus className="h-4 w-4" />
          <span>Onboard New Community</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Communities"
          value={stats?.totalApartments ?? '--'}
          subtitle="Active residential apartments"
          icon={Building2}
          iconBgColor="bg-brand-50 dark:bg-brand-950/50"
          iconColor="text-brand-600 dark:text-brand-400"
        />
        <StatCard
          title="Total Households"
          value={stats?.totalHouseholds ?? '--'}
          subtitle="Tracked flat units"
          icon={Users}
          iconBgColor="bg-aqua-50 dark:bg-aqua-950/50"
          iconColor="text-aqua-600 dark:text-aqua-400"
        />
        <StatCard
          title="Platform Users"
          value={stats?.totalUsers ?? '--'}
          subtitle="Admins & residents enrolled"
          icon={ShieldCheck}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Monthly Consumption"
          value={stats ? `${stats.totalConsumptionCurrentMonth} kL` : '--'}
          subtitle="Water logged across platform"
          icon={Droplets}
          iconBgColor="bg-purple-50 dark:bg-purple-950/50"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Communities Directory */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131B2E] p-5 sm:p-6 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Apartment Communities Directory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              List of managed residential communities and their designated Community Admins.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search communities or admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 py-2 text-xs"
            />
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={4} columns={7} />
        ) : filteredApartments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No communities found"
            description="Onboard your first apartment community or adjust your search filter."
            action={{
              label: 'Onboard Community',
              onClick: () => setIsModalOpen(true),
              icon: Plus,
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Community Name</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Households</th>
                  <th className="py-3 px-4">Community Admin</th>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-200">
                {filteredApartments.map((apt) => (
                  <tr key={apt.id} className="table-row">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800 flex items-center justify-center font-bold">
                        {apt.name.charAt(0)}
                      </div>
                      <span>{apt.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {apt.address || 'Not specified'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">{apt.registeredHouseholds}</span>
                      <span className="text-slate-400 tabular-nums"> / {apt.totalHouseholds} units</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {apt.adminName || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {apt.adminEmail || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="normal" size="sm" dot>Active</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/main-admin/admins"
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-800 transition-all hover:bg-brand-100 dark:hover:bg-brand-900/40"
                        title="Manage Community Admin"
                      >
                        <span>Manage</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard Apartment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard Apartment Community"
        subtitle="Create an apartment community and its first Community Admin in one transaction"
        maxWidth="2xl"
      >
        {modalError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleCreateApartment} className="space-y-4">
          {/* Section 1: Community Details */}
          <div className="rounded-2xl bg-slate-50/70 dark:bg-[#0B1120]/50 p-4 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              1. Community Basic Details
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="input-label">
                  Apartment / Community Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Palm Meadows Residences"
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="input-label">
                  Address / Location
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 77 Green Valley Road, Sector 4, Bangalore"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">
                  Total Households / Units <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={totalHouseholds}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setTotalHouseholds('');
                    } else {
                      const parsed = parseInt(val, 10);
                      setTotalHouseholds(isNaN(parsed) ? '' : parsed);
                    }
                  }}
                  onBlur={() => {
                    if (totalHouseholds === '' || Number(totalHouseholds) < 1) {
                      setTotalHouseholds(20);
                    }
                  }}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Community Administrator Account */}
          <div className="rounded-2xl bg-slate-50/70 dark:bg-[#0B1120]/50 p-4 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              2. Community Administrator Account
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="input-label">
                  Admin Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  placeholder="e.g. Robert Vance"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">
                  Admin Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@society.org"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">
                  Initial Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Verification Documents (3-Doc AI Package) */}
          <div className="rounded-2xl border border-brand-200 dark:border-brand-800/80 bg-brand-50/30 dark:bg-[#0B1120]/70 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-200/70 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  3. Verification Documents (3-Doc AI Package)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-100/80 dark:bg-brand-950/80 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                AI Authenticity Audit
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload verification documents for this community. The automated AI engine checks seals, authority headers, and authenticity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Doc 1 Card */}
              <div
                className={`rounded-xl border p-3 text-xs space-y-2 transition-all ${
                  doc1Base64
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161F30]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-brand-600" />
                    Doc 1: Society Deed
                  </span>
                  {doc1Base64 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>

                <select
                  value={doc1Type}
                  onChange={(e) => setDoc1Type(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-2 py-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="SOCIETY_REGISTRATION_DEED">Society Registration Deed</option>
                  <option value="SALE_DEED">Property / Land Title Deed</option>
                  <option value="LAND_REGISTRY_PROOF">Municipal Land Registry Proof</option>
                </select>

                <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                  <UploadCloud className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                    {doc1FileName ? (doc1FileName.length > 18 ? doc1FileName.substring(0, 18) + '...' : doc1FileName) : 'Upload Society Deed'}
                  </span>
                  <span className="text-[9px] text-slate-400">PDF, PNG, JPG (Max 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        (fileName, base64) => {
                          setDoc1FileName(fileName);
                          setDoc1Base64(base64);
                        },
                        (msg) => setModalError(msg)
                      )
                    }
                  />
                </label>
              </div>

              {/* Doc 2 Card */}
              <div
                className={`rounded-xl border p-3 text-xs space-y-2 transition-all ${
                  doc2Base64
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161F30]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                    Doc 2: Admin Govt ID
                  </span>
                  {doc2Base64 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>

                <select
                  value={doc2Type}
                  onChange={(e) => setDoc2Type(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-2 py-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="GOVERNMENT_ID_PROOF">Aadhaar / Passport / Voter ID</option>
                  <option value="AADHAAR_CARD">Aadhaar Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="PAN_CARD">PAN Card (Entity / Signatory)</option>
                </select>

                <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                  <UploadCloud className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                    {doc2FileName ? (doc2FileName.length > 18 ? doc2FileName.substring(0, 18) + '...' : doc2FileName) : 'Upload Govt ID'}
                  </span>
                  <span className="text-[9px] text-slate-400">PDF, PNG, JPG (Max 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        (fileName, base64) => {
                          setDoc2FileName(fileName);
                          setDoc2Base64(base64);
                        },
                        (msg) => setModalError(msg)
                      )
                    }
                  />
                </label>
              </div>

              {/* Doc 3 Card */}
              <div
                className={`rounded-xl border p-3 text-xs space-y-2 transition-all ${
                  doc3Base64
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161F30]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-emerald-600" />
                    Doc 3: Signatory Proof
                  </span>
                  {doc3Base64 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>

                <select
                  value={doc3Type}
                  onChange={(e) => setDoc3Type(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-2 py-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="RWA_BOARD_RESOLUTION">RWA Board Resolution</option>
                  <option value="AUTH_SIGNATORY_PROOF">Authorized Signatory Letter</option>
                  <option value="MUNICIPAL_WATER_SANCTION">Municipal Water Connection Sanction</option>
                  <option value="ELECTRICITY_SANCTION">Substation / Common Bill</option>
                </select>

                <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                  <UploadCloud className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                    {doc3FileName ? (doc3FileName.length > 18 ? doc3FileName.substring(0, 18) + '...' : doc3FileName) : 'Upload Proof'}
                  </span>
                  <span className="text-[9px] text-slate-400">PDF, PNG, JPG (Max 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        (fileName, base64) => {
                          setDoc3FileName(fileName);
                          setDoc3Base64(base64);
                        },
                        (msg) => setModalError(msg)
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs"
            >
              {submitting ? 'Creating...' : 'Create Apartment & Admin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
