import React, { useState, useEffect } from 'react';
import { adminBillingApi, extractErrorMessage } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import type { Invoice, BillingStats, InvoiceStatus, BillingCycle } from '../../types';
import { printInvoiceStatement } from '../../utils/exportUtils';
import { exportToCsv } from '../../utils/exportCsv';
import { useConfirm } from '../../context/ConfirmDialogContext';
import { TableActionMenu, type ActionMenuItem } from '../../components/TableActionMenu';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonTable } from '../../components/SkeletonLoader';
import {
  Receipt,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Calendar,
  Layers,
  Search,
  Eye,
  Check,
  Printer,
  RefreshCw,
  Sliders,
  Archive,
  Lock,
  PlusCircle,
  FileCheck2,
  TrendingDown,
  TrendingUp,
  Download,
  Mail,
  Send,
  Bell,
  CalendarRange,
  FileText,
} from 'lucide-react';

export const BillingInvoicesPage: React.FC = () => {
  const { confirm } = useConfirm();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [cycles, setCycles] = useState<BillingCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const currentYearMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-08"
  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);
  const [statusFilter, setStatusFilter] = useState<'ALL' | InvoiceStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Billing Cycle Modals
  const [isOpenCycleModal, setIsOpenCycleModal] = useState(false);
  const [newCycleStart, setNewCycleStart] = useState('');
  const [newCycleEnd, setNewCycleEnd] = useState('');
  const [cycleSubmitting, setCycleSubmitting] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  const [isFinalizeModal, setIsFinalizeModal] = useState(false);
  const [finalizeCycleId, setFinalizeCycleId] = useState<number | null>(null);
  const [finalizeCommonWaterKl, setFinalizeCommonWaterKl] = useState<number>(0);
  const [finalizeDueDate, setFinalizeDueDate] = useState('');

  // Generate Bills Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genMonth, setGenMonth] = useState(currentYearMonth);
  const [genDueDate, setGenDueDate] = useState('');
  const [genCommonWaterKl, setGenCommonWaterKl] = useState<number>(0);
  const [generating, setGenerating] = useState(false);

  // View Invoice Detail Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Mark Paid Modal
  const [markingInvoice, setMarkingInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('OFFLINE_CASH');
  const [markSubmitting, setMarkSubmitting] = useState(false);

  // Household Adjustment Modal
  const [adjustingInvoice, setAdjustingInvoice] = useState<Invoice | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invData, statsData, cycleData] = await Promise.all([
        adminBillingApi.getInvoices({
          month: selectedMonth || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
        adminBillingApi.getBillingStats(selectedMonth || undefined),
        adminBillingApi.getBillingCycles().catch(() => []),
      ]);
      setInvoices(invData);
      setStats(statsData);
      setCycles(cycleData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, statusFilter]);

  const activeCycle =
    (selectedCycleId ? cycles.find((c) => c.id === selectedCycleId) : null) ||
    cycles.find((c) => c.status === 'OPEN') ||
    cycles[0] ||
    null;

  const getCycleMonthName = (startDateStr?: string) => {
    if (!startDateStr) return 'Current Billing Period';
    try {
      const parts = startDateStr.split('-');
      if (parts.length >= 2) {
        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const date = new Date(year, monthIndex, 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    } catch {
      // fallback
    }
    return startDateStr;
  };

  const getCycleDurationInfo = (startDateStr?: string, endDateStr?: string, status?: string) => {
    if (!startDateStr || !endDateStr) return null;
    try {
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      if (status === 'OPEN') {
        const diffTime = end.getTime() - today.getTime();
        const remainingDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (remainingDays > 1) {
          return `${remainingDays} days remaining`;
        } else if (remainingDays === 1) {
          return '1 day remaining';
        } else if (remainingDays === 0) {
          return 'Final day of cycle';
        } else {
          return 'Cycle period ended';
        }
      }
      return `${totalDays}-day cycle`;
    } catch {
      return null;
    }
  };

  const handleOpenCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCycleStart || !newCycleEnd) return;
    try {
      setCycleSubmitting(true);
      setError(null);
      await adminBillingApi.openBillingCycle({
        startDate: newCycleStart,
        endDate: newCycleEnd,
      });
      setSuccessMsg(`New billing cycle opened (${newCycleStart} to ${newCycleEnd})`);
      setIsOpenCycleModal(false);
      setNewCycleStart('');
      setNewCycleEnd('');
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCycleSubmitting(false);
    }
  };

  const handleFinalizeCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalizeCycleId) return;
    try {
      setCycleSubmitting(true);
      setError(null);
      await adminBillingApi.finalizeBillingCycle(finalizeCycleId, {
        dueDate: finalizeDueDate || undefined,
        commonAreaWaterKl: finalizeCommonWaterKl || 0,
      });
      setSuccessMsg('Billing cycle finalized & all household invoices computed successfully.');
      setIsFinalizeModal(false);
      setFinalizeCycleId(null);
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCycleSubmitting(false);
    }
  };

  const handleArchiveCycle = async (cycleId: number) => {
    const confirmed = await confirm({
      title: 'Archive Billing Cycle',
      message: 'Are you sure you want to archive this billing cycle? Invoices will be permanently locked and cannot be modified.',
      confirmText: 'Archive Cycle',
      variant: 'warning',
    });
    if (!confirmed) return;
    try {
      setLoading(true);
      setError(null);
      await adminBillingApi.archiveBillingCycle(cycleId);
      setSuccessMsg('Billing cycle archived successfully.');
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingInvoice) return;
    try {
      setAdjustSubmitting(true);
      setError(null);
      await adminBillingApi.applyHouseholdAdjustment(adjustingInvoice.id, {
        adjustmentAmount: Number(adjustmentAmount),
        reason: adjustmentReason || 'Billing adjustment',
      });
      setSuccessMsg(`Adjustment of ₹${adjustmentAmount} applied to Flat ${adjustingInvoice.flatNumber}.`);
      setAdjustingInvoice(null);
      setAdjustmentAmount(0);
      setAdjustmentReason('');
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const [autoDispatching, setAutoDispatching] = useState(false);

  const handleAutoDispatchBills = async () => {
    const monthToUse = selectedMonth || currentYearMonth;
    const confirmed = await confirm({
      title: 'Auto-Dispatch Invoices',
      message: `Auto-generate bills for ${monthToUse} and immediately dispatch PDF invoice emails to all registered residents?`,
      confirmText: 'Generate & Dispatch',
      variant: 'primary',
    });
    if (!confirmed) return;
    try {
      setAutoDispatching(true);
      setError(null);
      const res = await adminBillingApi.autoDispatchBills(monthToUse);
      setSuccessMsg(res.message);
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setAutoDispatching(false);
    }
  };

  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setError(null);
      const res = await adminBillingApi.generateMonthlyBills({
        billingMonth: genMonth,
        dueDate: genDueDate || undefined,
        commonAreaWaterKl: genCommonWaterKl || 0,
      });
      setSuccessMsg(res.message);
      setIsGenerateModalOpen(false);
      setSelectedMonth(genMonth);
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markingInvoice) return;
    try {
      setMarkSubmitting(true);
      await adminBillingApi.markInvoicePaid(markingInvoice.id, paymentMethod);
      setMarkingInvoice(null);
      setSuccessMsg(`Invoice ${markingInvoice.invoiceNumber} marked as PAID.`);
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setMarkSubmitting(false);
    }
  };

  const [emailingInvoiceId, setEmailingInvoiceId] = useState<number | null>(null);

  const handleDownloadPdf = async (invoiceId: number, invoiceNumber: string) => {
    try {
      await adminBillingApi.downloadInvoicePdf(invoiceId, invoiceNumber);
    } catch (err) {
      console.warn('Backend PDF download fallback:', err);
      const inv = invoices.find((i) => i.id === invoiceId);
      if (inv) {
        printInvoiceStatement(inv);
      }
    }
  };

  const handleEmailInvoice = async (invoice: Invoice, targetEmail?: string) => {
    try {
      setEmailingInvoiceId(invoice.id);
      setError(null);
      const emailToUse = targetEmail || invoice.residentEmail;
      const res = await adminBillingApi.emailInvoice(invoice.id, emailToUse || undefined);
      setSuccessMsg(`Invoice ${invoice.invoiceNumber} PDF emailed to ${emailToUse || 'registered resident email'}.`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setEmailingInvoiceId(null);
    }
  };

  const [remindingInvoiceId, setRemindingInvoiceId] = useState<number | null>(null);

  const handleSendReminder = async (invoice: Invoice) => {
    try {
      setRemindingInvoiceId(invoice.id);
      setError(null);
      await adminBillingApi.sendBillReminder(invoice.id);
      setSuccessMsg(`Payment reminder email dispatched for invoice ${invoice.invoiceNumber}.`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setRemindingInvoiceId(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && inv.status === 'PENDING') ||
      (statusFilter === 'PAID' && inv.status === 'PAID') ||
      (statusFilter === 'OVERDUE' && inv.status === 'OVERDUE');

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.flatNumber.toLowerCase().includes(term) ||
      (inv.meterSerialNumber && inv.meterSerialNumber.toLowerCase().includes(term)) ||
      (inv.residentName && inv.residentName.toLowerCase().includes(term));

    return matchesStatus && matchesSearch;
  });

  // Reset to page 1 on filter or search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Billing & Invoicing Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated tiered water billing, billing cycle management, common area apportionment, and ledger tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161F30] px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              exportToCsv(
                `JalSetu_Invoices_${selectedMonth || 'All'}`,
                filteredInvoices,
                [
                  { key: 'invoiceNumber', label: 'Invoice Number' },
                  { key: 'flatNumber', label: 'Flat' },
                  { key: 'residentName', label: 'Resident Name' },
                  { key: 'billingMonth', label: 'Billing Month' },
                  { key: 'consumptionKl', label: 'Consumption (kL)', formatter: (v) => (v ? v.toFixed(2) : '0.00') },
                  { key: 'baseCharge', label: 'Fixed Base Fee (₹)', formatter: (v) => (v ? `₹${v.toFixed(2)}` : '₹0.00') },
                  { key: 'meteredCharge', label: 'Tiered Metered Charge (₹)', formatter: (v) => (v ? `₹${v.toFixed(2)}` : '₹0.00') },
                  { key: 'sharedCharge', label: 'Tanker & Shared Charge (₹)', formatter: (v) => (v ? `₹${v.toFixed(2)}` : '₹0.00') },
                  { key: 'totalAmount', label: 'Total Amount (₹)', formatter: (v) => (v ? `₹${v.toFixed(2)}` : '₹0.00') },
                  { key: 'status', label: 'Status' },
                  { key: 'dueDate', label: 'Due Date' },
                  { key: 'paidAt', label: 'Paid Date' },
                ]
              );
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161F30] px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            title="Export current filtered invoices to CSV/Excel"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpenCycleModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-3.5 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Open New Cycle</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGenMonth(selectedMonth || currentYearMonth);
              setIsGenerateModalOpen(true);
              setSuccessMsg(null);
            }}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 active:scale-98 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-aqua-300" />
            <span>Generate Invoices</span>
          </button>

          <button
            type="button"
            onClick={handleAutoDispatchBills}
            disabled={autoDispatching}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Automatically calculate monthly bills and email PDF statements to all residents in 1 click"
          >
            {autoDispatching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            ) : (
              <Send className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{autoDispatching ? 'Dispatching...' : 'Auto-Bill & Email All'}</span>
          </button>
        </div>
      </div>

      {/* SUCCESS & ERROR ALERTS */}
      {successMsg && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-800 dark:text-rose-200 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* BILLING CYCLES ACTIVE LIFECYCLE HERO CARD */}
      {cycles.length > 0 && activeCycle ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-xs transition-all hover:shadow-card">
          {/* Top Status Accent Gradient Bar */}
          <div
            className={`h-1.5 w-full ${
              activeCycle.status === 'OPEN'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-brand-500'
                : activeCycle.status === 'FINALIZED'
                ? 'bg-gradient-to-r from-indigo-500 via-brand-500 to-purple-500'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
          />

          <div className="p-4 sm:p-5 lg:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            {/* Left: Cycle Details & Status */}
            <div className="flex items-start sm:items-center gap-4">
              <div
                className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-all ${
                  activeCycle.status === 'OPEN'
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 ring-4 ring-emerald-500/10'
                    : activeCycle.status === 'FINALIZED'
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 ring-4 ring-indigo-500/10'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {activeCycle.status === 'OPEN' ? (
                  <CalendarRange className="h-6 w-6" />
                ) : (
                  <FileCheck2 className="h-6 w-6" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Active Billing Cycle
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase shadow-2xs ${
                      activeCycle.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/90 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                        : activeCycle.status === 'FINALIZED'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/90 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800'
                        : 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        activeCycle.status === 'OPEN'
                          ? 'bg-emerald-500 animate-pulse'
                          : activeCycle.status === 'FINALIZED'
                          ? 'bg-indigo-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    {activeCycle.status === 'OPEN' ? 'Open & Recording' : activeCycle.status}
                  </span>

                  {getCycleDurationInfo(activeCycle.startDate, activeCycle.endDate, activeCycle.status) && (
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                      {getCycleDurationInfo(activeCycle.startDate, activeCycle.endDate, activeCycle.status)}
                    </span>
                  )}

                  {cycles.length > 1 && (
                    <select
                      value={activeCycle.id}
                      onChange={(e) => setSelectedCycleId(Number(e.target.value))}
                      className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-0.5 outline-none cursor-pointer focus:ring-1 focus:ring-brand-500"
                    >
                      {cycles.map((c) => (
                        <option key={c.id} value={c.id}>
                          Cycle #{c.id} ({c.startDate} - {c.status})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    {getCycleMonthName(activeCycle.startDate)} Period
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-mono font-semibold text-brand-700 dark:text-brand-300">
                    <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{activeCycle.startDate}</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span>{activeCycle.endDate}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Group: 2 Stat Blocks + Action CTA */}
            <div className="flex flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-3 sm:gap-4 shrink-0">
              {/* Stat Block 1: Invoices Issued */}
              <div className="flex-1 sm:flex-initial min-w-[130px] rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0E1524] px-3.5 py-2.5 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Invoices Issued
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-base font-extrabold text-slate-900 dark:text-white font-mono">
                      {activeCycle.totalInvoices || 0}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      units
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat Block 2: Total Billed Amount */}
              <div className="flex-1 sm:flex-initial min-w-[160px] rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0E1524] px-3.5 py-2.5 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
                  <IndianRupee className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Total Billed Amount
                  </div>
                  <div className="font-display text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    ₹{(activeCycle.totalBilledAmount || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button & Explanatory Subtext */}
              <div className="w-full sm:w-auto flex flex-col justify-center sm:items-end gap-1">
                {activeCycle.status === 'OPEN' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setFinalizeCycleId(activeCycle.id);
                        setIsFinalizeModal(true);
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white px-4 py-2.5 text-xs font-bold shadow-sm hover:shadow-brand-500/25 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Finalize & Lock Cycle</span>
                    </button>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 text-center sm:text-right">
                      Locks readings & issues bills
                    </span>
                  </>
                )}

                {activeCycle.status === 'FINALIZED' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleArchiveCycle(activeCycle.id)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <Archive className="h-3.5 w-3.5 text-slate-500" />
                      <span>Archive Cycle</span>
                    </button>
                    <span className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 text-center sm:text-right">
                      Cycle locked & invoices issued
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : cycles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#131B2E]/50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/80 dark:border-brand-800/60">
              <CalendarRange className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Active Billing Cycle</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Open a new billing cycle to track monthly water usage and issue flat invoices.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpenCycleModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Open Billing Cycle</span>
          </button>
        </div>
      ) : null}

      {/* Financial KPI Dashboard Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Invoiced Amount"
          value={`₹${(stats?.totalInvoicedAmount || 0).toLocaleString('en-IN')}`}
          subtitle={`${stats?.totalInvoicesCount || 0} invoices generated`}
          icon={Receipt}
          variant="normal"
        />
        <StatCard
          title="Total Collected Revenue"
          value={`₹${(stats?.totalCollectedAmount || 0).toLocaleString('en-IN')}`}
          subtitle={`${stats?.paidInvoicesCount || 0} paid (${stats?.collectionRatePercentage || 0}% rate)`}
          icon={IndianRupee}
          variant="normal"
        />
        <StatCard
          title="Pending Receivables"
          value={`₹${(stats?.totalPendingAmount || 0).toLocaleString('en-IN')}`}
          subtitle={`${stats?.pendingInvoicesCount || 0} pending payment`}
          icon={Clock}
          variant="billing"
        />
        <StatCard
          title="Overdue Dues"
          value={`₹${(stats?.totalOverdueAmount || 0).toLocaleString('en-IN')}`}
          subtitle={`${stats?.overdueInvoicesCount || 0} past due date`}
          icon={AlertCircle}
          variant="overuse"
        />
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3 py-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            {(['ALL', 'PENDING', 'PAID', 'OVERDUE'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-[#0B1120] text-brand-700 dark:text-brand-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'PENDING' ? 'Pending' : st === 'PAID' ? 'Paid' : 'Overdue'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar with Meter Number Support */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search flat, resident, invoice #, meter #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] pl-8 pr-3.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1120] focus:outline-none"
          />
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
            <p className="mt-3 text-xs font-semibold">Loading community invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Receipt className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2.5" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No invoices found for this period</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Click <strong>"Generate Monthly Invoices"</strong> above to compute tiered consumption bills for all households in 1 click.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Flat & Resident</th>
                  <th className="py-3 px-4">Meter Usage</th>
                  <th className="py-3 px-4">Cost Breakdown</th>
                  <th className="py-3 px-4">Adjustment</th>
                  <th className="py-3 px-4">Total Billed</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200/60 dark:border-brand-800 text-[11px]">
                            Flat {inv.flatNumber}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-semibold" title="Meter Serial Number">
                            {inv.meterSerialNumber || 'WM-' + inv.flatNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-1">
                          {inv.residentName || 'Unassigned'}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{inv.consumptionKl} kL</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {inv.meterReadingStartKl} → {inv.meterReadingEndKl} kL
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="space-y-0.5 font-mono text-[10px]">
                        <div>Base Fee: ₹{inv.baseCharge}</div>
                        <div>Metered: ₹{inv.meteredCharge}</div>
                        <div>Shared: ₹{inv.sharedCharge}</div>
                      </div>
                    </td>

                    {/* Adjustment Column */}
                    <td className="py-3.5 px-4">
                      {inv.adjustments && inv.adjustments !== 0 ? (
                        <span className={`inline-flex items-center gap-1 font-mono font-bold text-xs ${
                          inv.adjustments < 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {inv.adjustments < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                          ₹{inv.adjustments.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">₹0.00</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-sm text-slate-900 dark:text-white">
                      ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                      {inv.dueDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          inv.status === 'PAID'
                            ? 'normal'
                            : inv.status === 'OVERDUE'
                            ? 'overuse'
                            : 'billing'
                        }
                        size="sm"
                      >
                        {inv.status === 'PAID' ? '✓ Paid' : inv.status === 'OVERDUE' ? '⚠️ Overdue' : '⏳ Pending'}
                      </Badge>
                      {inv.paymentMethod && (
                        <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{inv.paymentMethod}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== 'PAID' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setMarkingInvoice(inv);
                              setPaymentMethod('OFFLINE_CASH');
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer shadow-2xs"
                            title="Mark as Paid"
                          >
                            <Check className="h-3 w-3" />
                            <span>Mark Paid</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
                            title="View Invoice Breakdown"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View</span>
                          </button>
                        )}

                        <TableActionMenu
                          items={[
                            {
                              label: 'View Invoice Details',
                              icon: Eye,
                              onClick: () => setSelectedInvoice(inv),
                            },
                            {
                              label: 'Apply Adjustment / Waiver',
                              icon: Sliders,
                              onClick: () => {
                                setAdjustingInvoice(inv);
                                setAdjustmentAmount(inv.adjustments || 0);
                                setAdjustmentReason('');
                              },
                            },
                            {
                              label: 'Email Invoice to Resident',
                              icon: Send,
                              onClick: () => handleEmailInvoice(inv),
                              disabled: emailingInvoiceId === inv.id,
                            },
                            ...(inv.status !== 'PAID'
                              ? [
                                  {
                                    label: 'Send Due Reminder',
                                    icon: Bell,
                                    onClick: () => handleSendReminder(inv),
                                    disabled: remindingInvoiceId === inv.id,
                                  },
                                ]
                              : []),
                            {
                              label: 'Download Official PDF',
                              icon: Download,
                              onClick: () => handleDownloadPdf(inv.id, inv.invoiceNumber),
                            },
                            {
                              label: 'Print Statement',
                              icon: Printer,
                              onClick: () => printInvoiceStatement(inv),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredInvoices.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newSize) => {
                setItemsPerPage(newSize);
                setCurrentPage(1);
              }}
              itemsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </div>

      {/* ---------------- OPEN NEW BILLING CYCLE MODAL ---------------- */}
      <Modal
        isOpen={isOpenCycleModal}
        onClose={() => setIsOpenCycleModal(false)}
        title="Open New Billing Cycle"
        subtitle="Establish the active water meter recording period for your society"
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsOpenCycleModal(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="open-cycle-form"
              disabled={cycleSubmitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {cycleSubmitting ? 'Opening...' : 'Open Cycle'}
            </button>
          </div>
        }
      >
        <form id="open-cycle-form" onSubmit={handleOpenCycle} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cycle Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={newCycleStart}
              onChange={(e) => setNewCycleStart(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cycle End Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={newCycleEnd}
              onChange={(e) => setNewCycleEnd(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* ---------------- FINALIZE BILLING CYCLE MODAL ---------------- */}
      <Modal
        isOpen={isFinalizeModal}
        onClose={() => setIsFinalizeModal(false)}
        title="Finalize Billing Cycle"
        subtitle="Lock readings and calculate all itemized invoices for this period"
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsFinalizeModal(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="finalize-cycle-form"
              disabled={cycleSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {cycleSubmitting ? 'Finalizing...' : 'Finalize & Issue Invoices'}
            </button>
          </div>
        }
      >
        <form id="finalize-cycle-form" onSubmit={handleFinalizeCycle} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Common Area Water Consumption (kL)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={finalizeCommonWaterKl}
              onChange={(e) => setFinalizeCommonWaterKl(Number(e.target.value))}
              placeholder="e.g. 50 kL for gardens, clubhouse, cleaning"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Invoice Due Date
            </label>
            <input
              type="date"
              value={finalizeDueDate}
              onChange={(e) => setFinalizeDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">Defaults to 15 days from today if left empty.</p>
          </div>
        </form>
      </Modal>

      {/* ---------------- HOUSEHOLD ADJUSTMENT MODAL ---------------- */}
      {adjustingInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setAdjustingInvoice(null)}
          title={`Adjust Invoice - Flat ${adjustingInvoice.flatNumber}`}
          subtitle={`Current Bill Total: ₹${adjustingInvoice.totalAmount} (Base: ₹${adjustingInvoice.baseCharge}, Metered: ₹${adjustingInvoice.meteredCharge}, Shared: ₹${adjustingInvoice.sharedCharge})`}
          maxWidth="sm"
          footer={
            <div className="flex justify-end gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setAdjustingInvoice(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="adjustment-form"
                disabled={adjustSubmitting}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                {adjustSubmitting ? 'Saving...' : 'Apply Adjustment'}
              </button>
            </div>
          }
        >
          <form id="adjustment-form" onSubmit={handleApplyAdjustment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Adjustment Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                placeholder="Enter negative (e.g. -200) for discount/rebate, positive (e.g. 50) for late penalty"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Use negative amounts (e.g. -150) for leak rebate / concession; positive for late fees.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Note
              </label>
              <input
                type="text"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="e.g. Plumber leak waiver, early payment discount"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------- GENERATE INVOICES MODAL ---------------- */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Monthly Invoices"
        subtitle="Compute tiered consumption charges, base maintenance fee, and tanker apportionment for all flats"
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="generate-bills-form"
              disabled={generating}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 cursor-pointer transition-all"
            >
              {generating ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Computing Invoices...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Run Automated Billing</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="generate-bills-form" onSubmit={handleGenerateInvoices} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Billing Month <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="month"
                required
                value={genMonth}
                onChange={(e) => setGenMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] pl-8 pr-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Due Date
            </label>
            <input
              type="date"
              value={genDueDate}
              onChange={(e) => setGenDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">Leave empty to default to 15 days from generation date.</p>
          </div>

          <div className="rounded-2xl border border-brand-200/80 dark:border-brand-900 bg-brand-50/60 dark:bg-brand-950/30 p-3.5 text-xs text-brand-950 dark:text-brand-200 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-brand-600" />
              Automated Calculation Engine Rules:
            </p>
            <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
              <li>Fetches metered readings logged in <strong>{genMonth}</strong> for each unit.</li>
              <li>Applies the society's tiered tariff slabs to consumption.</li>
              <li>Apportions common tanker procurement costs across flats.</li>
              <li>Adds the base society maintenance charge.</li>
            </ul>
          </div>
        </form>
      </Modal>

      {/* ---------------- ITEMIZE INVOICE BREAKDOWN MODAL ---------------- */}
      {selectedInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle={`Billing Period: ${selectedInvoice.billingMonth} | Flat ${selectedInvoice.flatNumber}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="text-xs">
                Status:{' '}
                <Badge
                  variant={
                    selectedInvoice.status === 'PAID'
                      ? 'normal'
                      : selectedInvoice.status === 'OVERDUE'
                      ? 'overuse'
                      : 'billing'
                  }
                  size="sm"
                >
                  {selectedInvoice.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={emailingInvoiceId === selectedInvoice.id}
                  onClick={() => handleEmailInvoice(selectedInvoice)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Send className={`h-3.5 w-3.5 ${emailingInvoiceId === selectedInvoice.id ? 'animate-spin' : ''}`} />
                  <span>Email Bill</span>
                </button>

                {selectedInvoice.status !== 'PAID' && (
                  <button
                    type="button"
                    disabled={remindingInvoiceId === selectedInvoice.id}
                    onClick={() => handleSendReminder(selectedInvoice)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <Bell className={`h-3.5 w-3.5 ${remindingInvoiceId === selectedInvoice.id ? 'animate-spin' : ''}`} />
                    <span>Send Reminder</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedInvoice.id, selectedInvoice.invoiceNumber)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/50 px-3.5 py-2 text-xs font-bold text-brand-700 dark:text-brand-300 hover:bg-brand-100 cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => printInvoiceStatement(selectedInvoice)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Flat & Resident Header Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 rounded-2xl bg-slate-50 dark:bg-[#0B1120] p-3 sm:p-3.5 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Flat Unit</span>
                <p className="font-bold text-slate-900 dark:text-white">Flat {selectedInvoice.flatNumber}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Occupant Name</span>
                <p className="font-bold text-slate-900 dark:text-white truncate">{selectedInvoice.residentName || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Meter Serial</span>
                <p className="font-mono font-bold text-brand-600 dark:text-brand-400 truncate">{selectedInvoice.meterSerialNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Total Consumption</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedInvoice.consumptionKl} kL</p>
              </div>
            </div>

            {/* Slab Calculation Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                1. Tiered Slab Consumption Charges
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs min-w-[320px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500">
                    <tr>
                      <th className="py-2 px-2.5 sm:px-3">Tariff Tier</th>
                      <th className="py-2 px-2 sm:px-3">Billed Volume (kL)</th>
                      <th className="py-2 px-2 sm:px-3">Rate (₹/kL)</th>
                      <th className="py-2 px-2.5 sm:px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedInvoice.slabBreakdown?.map((slab, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-2.5 sm:px-3 font-semibold text-slate-900 dark:text-white">{slab.slabName}</td>
                        <td className="py-2 px-2 sm:px-3 font-mono">{slab.volumeBilledKl} kL</td>
                        <td className="py-2 px-2 sm:px-3 font-mono">₹{slab.ratePerKl}/kL</td>
                        <td className="py-2 px-2.5 sm:px-3 text-right font-bold text-slate-900 dark:text-white">₹{slab.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold">
                      <td colSpan={3} className="py-2 px-2.5 sm:px-3 text-slate-700 dark:text-slate-300">Metered Subtotal</td>
                      <td className="py-2 px-2.5 sm:px-3 text-right text-brand-600 dark:text-brand-400">₹{selectedInvoice.meteredCharge.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Charges & Apportionment */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px]">
                2. Shared Apportionment, Base Maintenance & Adjustments
              </h4>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Base Connection & Maintenance Fee</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{selectedInvoice.baseCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-slate-600 dark:text-slate-400">Shared Water / Tanker Procurement Share</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 break-words">{selectedInvoice.apportionmentDetails}</p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white shrink-0">₹{selectedInvoice.sharedCharge.toFixed(2)}</span>
              </div>
              {selectedInvoice.adjustments !== undefined && selectedInvoice.adjustments !== 0 && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Special Adjustment / Concession</span>
                  <span className={selectedInvoice.adjustments < 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    ₹{selectedInvoice.adjustments.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                <span>Total Amount Due</span>
                <span className="text-brand-600 dark:text-brand-400">
                  ₹{selectedInvoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------- MARK AS PAID MODAL ---------------- */}
      {markingInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setMarkingInvoice(null)}
          title={`Record Payment for Flat ${markingInvoice.flatNumber}`}
          subtitle={`Invoice: ${markingInvoice.invoiceNumber} | Amount: ₹${markingInvoice.totalAmount}`}
          maxWidth="sm"
          footer={
            <div className="flex justify-end gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setMarkingInvoice(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="mark-paid-form"
                disabled={markSubmitting}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                {markSubmitting ? 'Recording...' : 'Confirm Payment'}
              </button>
            </div>
          }
        >
          <form id="mark-paid-form" onSubmit={handleMarkPaid} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none cursor-pointer"
              >
                <option value="OFFLINE_CASH">💵 Cash at Society Office</option>
                <option value="CHEQUE">📝 Bank Cheque</option>
                <option value="NEFT_RTGS">🏦 Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI_MANUAL">📱 Direct UPI Transfer</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
