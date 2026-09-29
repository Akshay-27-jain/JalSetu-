import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import {
  AlertTriangle,
  Activity,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Droplets,
  Info,
  User,
  Mail,
  Calendar,
  Search,
  Clock,
  Send,
  X,
  Sparkles,
  Download,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  Building,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { adminBillingApi } from '../../services/api';
import { Pagination } from '../../components/Pagination';
import type { LeakScanResult, LeakAnomalyItem } from '../../types';

export const LeakAnomalyTrackerPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<LeakScanResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Row-level notify modal state
  const [selectedAnomaly, setSelectedAnomaly] = useState<LeakAnomalyItem | null>(null);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [advisoryNote, setAdvisoryNote] = useState<string>(
    'Our smart telemetry detected an abnormal water flow spike on your flat meter today. Please verify that all taps, toilet flushes, and appliance valves are securely shut to prevent overuse surcharges.'
  );
  const [notifying, setNotifying] = useState<boolean>(false);

  // Resolved list in local state for UI acknowledgement
  const [resolvedHouseholdIds, setResolvedHouseholdIds] = useState<number[]>([]);

  const fetchAnomalies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminBillingApi.getLeakAnomalies();
      setScanResult(data);
    } catch (err: any) {
      console.error('Failed to fetch leak anomalies:', err);
      setError(err.response?.data?.message || 'Failed to fetch leak anomalies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerScan = async () => {
    setScanning(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await adminBillingApi.scanLeaks();
      setScanResult(data);
      setSuccessMsg(
        `Diagnostics complete: ${data.totalHouseholdsScanned} households audited. Found ${data.outliersDetected} active usage anomalies.`
      );
    } catch (err: any) {
      console.error('Leak diagnostics scan failed:', err);
      setError(err.response?.data?.message || 'Failed to complete leak diagnostics scan.');
    } finally {
      setScanning(false);
    }
  };

  const handleNotifyResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnomaly) return;

    if (!recipientEmail || !recipientEmail.includes('@')) {
      setError('Please provide a valid recipient email address.');
      return;
    }

    setNotifying(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await adminBillingApi.notifyResident({
        householdId: selectedAnomaly.householdId,
        overrideEmail: recipientEmail.trim(),
        customMessage: advisoryNote.trim(),
        force: true,
        consumptionKl: selectedAnomaly.latestConsumptionKl,
        meanConsumptionKl: selectedAnomaly.meanConsumptionKl,
        zScore: selectedAnomaly.zScore,
        readingDate: selectedAnomaly.readingDate,
      });

      if (res.success) {
        setSuccessMsg(`Leak advisory successfully delivered via Gmail SMTP to ${res.recipientEmail} (Flat ${selectedAnomaly.flatNumber}).`);
        setSelectedAnomaly(null);
      } else {
        setError(res.message || 'Advisory dispatch failed.');
      }
    } catch (err: any) {
      console.error('Failed to notify resident:', err);
      setError(err.response?.data?.message || 'Failed to send resident leak advisory email.');
    } finally {
      setNotifying(false);
    }
  };

  const handleResolveAlert = (householdId: number, flatNumber: string) => {
    setResolvedHouseholdIds((prev) => [...prev, householdId]);
    setSuccessMsg(`Anomaly status for Flat ${flatNumber} marked as resolved / inspected.`);
  };

  const handleExportCsv = () => {
    if (!scanResult?.anomalies || scanResult.anomalies.length === 0) return;
    const headers = ['Flat Number', 'Resident Name', 'Resident Email', 'Meter Serial', 'Latest Usage (kL)', 'Baseline Mean (kL/day)', 'Deviation', 'Severity', 'Reading Date'];
    const rows = scanResult.anomalies.map((a) => [
      a.flatNumber,
      a.residentName || 'Unassigned',
      a.residentEmail || 'N/A',
      a.meterSerialNumber,
      a.latestConsumptionKl,
      a.meanConsumptionKl,
      `+${a.zScore} sigma`,
      a.riskLevel,
      a.readingDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Leak_Anomalies_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  // Filter anomalies
  const rawList = scanResult?.anomalies || [];
  const filteredList = rawList.filter((item) => {
    const matchesSearch =
      item.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.residentName && item.residentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.meterSerialNumber && item.meterSerialNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRisk = riskFilter === 'ALL' || item.riskLevel === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#161F30] to-blue-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Continuous Telemetry & Anomaly Diagnostics Active</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
              Smart Leak & Anomaly Diagnostics
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Automated telemetry monitoring detecting abnormal consumption surges, continuous fixture leaks, and potential pipe bursts across all residential units.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!scanResult?.anomalies || scanResult.anomalies.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-sky-300" />
              <span>Export Audit CSV</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerScan}
              disabled={scanning}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Auditing Meters...' : 'Run Diagnostics Scan'}</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* SUCCESS / ERROR NOTIFICATIONS */}
      {successMsg && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 dark:text-emerald-300 hover:opacity-75 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-4 text-xs sm:text-sm text-rose-800 dark:text-rose-200 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-semibold">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 dark:text-rose-300 hover:opacity-75 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monitored Units */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#131B2E]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monitored Units
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-black text-slate-900 dark:text-white">
            {loading ? '...' : scanResult?.totalHouseholdsScanned || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active automated meters</p>
        </div>

        {/* Flagged Anomalies */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#131B2E]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Usage Anomalies
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-black text-amber-600 dark:text-amber-400">
            {loading ? '...' : scanResult?.outliersDetected || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Exceeding standard variance</p>
        </div>

        {/* Critical Leaks */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#131B2E]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Critical Leaks
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-black text-rose-600 dark:text-rose-400">
            {loading ? '...' : scanResult?.highRiskLeakCount || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Urgent inspection required</p>
        </div>

        {/* Community Daily Average */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#131B2E]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Community Daily Mean
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Droplets className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-black text-slate-900 dark:text-white">
            {loading ? '...' : `${scanResult?.averageConsumptionKl || 0} kL`}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Normal per-unit daily benchmark</p>
        </div>
      </div>

      {/* ANOMALY DETECTION OVERVIEW CARD */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20 p-5 dark:border-slate-800 dark:bg-[#131B2E] dark:from-[#131B2E] dark:to-slate-900 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="rounded-2xl bg-brand-50 dark:bg-brand-950/80 p-2.5 text-brand-600 dark:text-brand-400 shrink-0">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Continuous Flow Anomaly Detection Standards
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl bg-white dark:bg-slate-800/80 p-3 border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">1. Dynamic Baselining</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Establishes rolling 30-day baseline consumption profiles for every household.</span>
              </div>
              <div className="rounded-2xl bg-white dark:bg-slate-800/80 p-3 border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">2. Surge & Leak Identification</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Flags surges that exceed normal baseline by &gt;200% or show continuous non-stop night flow.</span>
              </div>
              <div className="rounded-2xl bg-white dark:bg-slate-800/80 p-3 border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">3. Instant Resident Advisory</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Dispatches in-app notices and email alerts with practical fixture checking instructions.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH, FILTER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Flat, Resident, or Meter Serial..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="relative">
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white py-2.5 pl-4 pr-8 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Severity Levels</option>
              <option value="HIGH_LEAK">Critical Leaks Only</option>
              <option value="MEDIUM">Moderate Anomalies</option>
              <option value="LOW">Low Outliers</option>
            </select>
          </div>
        </div>

        {/* Scan Timestamp */}
        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
          <Clock className="h-3.5 w-3.5" />
          <span>Last Audited: {scanResult?.scannedAt ? new Date(scanResult.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
        </div>
      </div>

      {/* ANOMALIES TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-[#131B2E]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Flat & Resident</th>
                <th className="py-3.5 px-4">Meter Serial</th>
                <th className="py-3.5 px-4">Latest Usage</th>
                <th className="py-3.5 px-4">Baseline Normal</th>
                <th className="py-3.5 px-4">Spike vs Normal</th>
                <th className="py-3.5 px-4">Risk Severity</th>
                <th className="py-3.5 px-4">Detected On</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-brand-600" />
                      <span>Auditing telemetry and meter readings...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        No Active Leaks or Anomalies Detected
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        All monitored residential units are operating within normal baseline consumption ranges.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const isSevere = item.riskLevel === 'HIGH_LEAK';
                  const isResolved = resolvedHouseholdIds.includes(item.householdId);
                  const spikePercent = item.meanConsumptionKl > 0
                    ? Math.round(((item.latestConsumptionKl - item.meanConsumptionKl) / item.meanConsumptionKl) * 100)
                    : 150;

                  return (
                    <tr
                      key={item.householdId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Flat & Resident */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 dark:text-white">
                          Flat {item.flatNumber}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3" />
                          <span>{item.residentName || `Resident Flat ${item.flatNumber}`}</span>
                        </div>
                        {item.residentEmail && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Mail className="h-2.5 w-2.5" />
                            <span>{item.residentEmail}</span>
                          </div>
                        )}
                      </td>

                      {/* Meter Serial */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.meterSerialNumber || 'WM-' + item.flatNumber}
                      </td>

                      {/* Latest Usage */}
                      <td className="py-3.5 px-4">
                        <span className="font-display font-black text-rose-600 dark:text-rose-400 text-sm">
                          {item.latestConsumptionKl} kL
                        </span>
                      </td>

                      {/* Baseline Mean */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {item.meanConsumptionKl} kL/day
                      </td>

                      {/* Spike vs Normal */}
                      <td className="py-3.5 px-4 font-bold">
                        <span
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs ${
                            isSevere
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                          }`}
                        >
                          <TrendingUp className="h-3 w-3" />
                          <span>+{spikePercent}% Surge</span>
                        </span>
                      </td>

                      {/* Risk Severity */}
                      <td className="py-3.5 px-4">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle className="h-3 w-3" />
                            <span>Resolved</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              isSevere
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-amber-500 text-white shadow-sm'
                            }`}
                          >
                            <ShieldAlert className="h-3 w-3" />
                            <span>{isSevere ? 'Critical Leak' : 'Moderate Surge'}</span>
                          </span>
                        )}
                      </td>

                      {/* Reading Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{item.readingDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAnomaly(item);
                              setRecipientEmail(item.residentEmail || '');
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                            title="Dispatch Leak Advisory Email"
                          >
                            <Send className="h-3 w-3" />
                            <span>Notify Resident</span>
                          </button>

                          {!isResolved && (
                            <button
                              type="button"
                              onClick={() => handleResolveAlert(item.householdId, item.flatNumber)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                              title="Mark Inspected / Resolved"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Clear</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && filteredList.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize}
            onItemsPerPageChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            totalItems={filteredList.length}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* NOTIFY RESIDENT ADVISORY MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
        title={selectedAnomaly ? `Dispatch Leak Advisory — Flat ${selectedAnomaly.flatNumber}` : 'Dispatch Leak Advisory'}
        subtitle="Sends an official water conservation advisory and fixture inspection notice"
        maxWidth="lg"
      >
        {selectedAnomaly && (
          <div className="space-y-4">
            {/* Anomaly summary box */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 text-xs space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Resident / Occupant:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedAnomaly.residentName || `Flat ${selectedAnomaly.flatNumber}`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Detected Consumption Surge:</span>
                <strong className="text-rose-600 dark:text-rose-400 font-black text-sm">{selectedAnomaly.latestConsumptionKl} kL</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Normal 30-Day Baseline:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedAnomaly.meanConsumptionKl} kL/day (+{selectedAnomaly.zScore}σ deviation)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Detected Reading Date:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedAnomaly.readingDate}</span>
              </div>
            </div>

            <form onSubmit={handleNotifyResident} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Recipient Email
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Live SMTP Active
                  </span>
                </div>

                {/* Email quick selection chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setRecipientEmail('jainakshay0804@gmail.com')}
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                      recipientEmail === 'jainakshay0804@gmail.com'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    🚀 My Test Email (jainakshay0804@gmail.com)
                  </button>
                  {selectedAnomaly.residentEmail && selectedAnomaly.residentEmail !== 'jainakshay0804@gmail.com' && (
                    <button
                      type="button"
                      onClick={() => setRecipientEmail(selectedAnomaly.residentEmail || '')}
                      className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                        recipientEmail === selectedAnomaly.residentEmail
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      Flat {selectedAnomaly.flatNumber} ({selectedAnomaly.residentEmail})
                    </button>
                  )}
                </div>

                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="resident@example.com or your email"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  Select your test Gmail address above or type any verified email to receive the live HTML alert instantly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Advisory Message
                </label>
                <textarea
                  rows={3}
                  value={advisoryNote}
                  onChange={(e) => setAdvisoryNote(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAnomaly(null)}
                  className="rounded-2xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={notifying}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className={`h-3.5 w-3.5 ${notifying ? 'animate-spin' : ''}`} />
                  <span>{notifying ? 'Dispatching Advisory...' : 'Send Advisory Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
