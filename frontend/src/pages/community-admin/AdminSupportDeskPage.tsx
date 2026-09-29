import React, { useState, useEffect } from 'react';
import { communityAdminApi, extractErrorMessage } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import type {
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  EscalateTicketRequest,
  CreateCommunityConcernRequest,
} from '../../types';
import {
  LifeBuoy,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Droplets,
  Receipt,
  Gauge,
  MessageSquare,
  ChevronDown,
  Edit3,
  User,
  Home,
  Send,
  AlertCircle,
  Zap,
  ShieldAlert,
  Building2,
  Plus,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  WATER_LEAKAGE: { label: 'Water Leakage', icon: Droplets, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  BILLING_DISPUTE: { label: 'Billing / Surcharge Inquiry', icon: Receipt, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  METER_DEFECT: { label: 'Meter Dial Calibration', icon: Gauge, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  LOW_PRESSURE: { label: 'Low Flow Pressure', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  WATER_QUALITY: { label: 'Water Quality', icon: LifeBuoy, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  GENERAL: { label: 'General Concern', icon: MessageSquare, color: 'text-slate-600 bg-slate-50 border-slate-200' },
  BULK_SUPPLY_ISSUE: { label: 'Bulk Supply Failure', icon: AlertTriangle, color: 'text-red-700 bg-red-100 border-red-300' },
  HARDWARE_DEFECT: { label: 'Society Hardware Defect', icon: Wrench, color: 'text-indigo-700 bg-indigo-100 border-indigo-300' },
  TARIFF_DISPUTE: { label: 'Tariff Dispute', icon: Receipt, color: 'text-amber-700 bg-amber-100 border-amber-300' },
  MUNICIPAL_OUTAGE: { label: 'Municipal Outage', icon: Zap, color: 'text-purple-700 bg-purple-100 border-purple-300' },
};
import { useConfirm } from '../../context/ConfirmDialogContext';

export const AdminSupportDeskPage: React.FC = () => {
  const { showAlert } = useConfirm();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus | 'ESCALATED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Resolve / Update Modal State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [updateStatus, setUpdateStatus] = useState<TicketStatus>('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Escalation Modal State
  const [escalateTicket, setEscalateTicket] = useState<SupportTicket | null>(null);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalating, setEscalating] = useState(false);

  // Society Concern Modal State
  const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);
  const [concernData, setConcernData] = useState<CreateCommunityConcernRequest>({
    category: 'BULK_SUPPLY_ISSUE',
    priority: 'HIGH',
    subject: '',
    description: '',
  });
  const [submittingConcern, setSubmittingConcern] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communityAdminApi.getSupportTickets();
      setTickets(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenUpdateModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setUpdateStatus(ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status);
    setResolutionNotes(ticket.resolutionNotes || '');
  };

  const handleSaveTicketUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setUpdating(true);
      setError(null);
      await communityAdminApi.updateTicketStatus(selectedTicket.id, {
        status: updateStatus,
        resolutionNotes: resolutionNotes.trim() || undefined,
      });
      setSuccessMsg(`Support ticket #${selectedTicket.id} updated to ${updateStatus}!`);
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUpdating(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateTicket) return;
    if (!escalationReason.trim()) {
      await showAlert('Please enter a reason for escalating this ticket to Main Admin.', 'Reason Required', 'warning');
      return;
    }

    try {
      setEscalating(true);
      setError(null);
      await communityAdminApi.escalateSupportTicket(escalateTicket.id, {
        escalationReason: escalationReason.trim(),
      });
      setSuccessMsg(`⚡ Ticket #${escalateTicket.id} has been escalated to Main Admin for intervention!`);
      setEscalateTicket(null);
      setEscalationReason('');
      fetchTickets();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setEscalating(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  const handleCreateConcernSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concernData.subject.trim() || !concernData.description.trim()) {
      await showAlert('Please fill out the subject and description before submitting.', 'Missing Fields', 'warning');
      return;
    }

    try {
      setSubmittingConcern(true);
      setError(null);
      await communityAdminApi.raiseCommunityConcern(concernData);
      setSuccessMsg('🚨 Society problem reported directly to Main Admin! Main Admin will review and assist.');
      setIsConcernModalOpen(false);
      setConcernData({
        category: 'BULK_SUPPLY_ISSUE',
        priority: 'HIGH',
        subject: '',
        description: '',
      });
      fetchTickets();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmittingConcern(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ESCALATED'
        ? t.isEscalatedToMainAdmin
        : t.status === statusFilter;
    const matchCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      t.flatNumber.toLowerCase().includes(q) ||
      (t.residentName && t.residentName.toLowerCase().includes(q)) ||
      t.subject.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q);
    return matchStatus && matchCategory && matchSearch;
  });

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const escalatedCount = tickets.filter((t) => t.isEscalatedToMainAdmin).length;
  const urgentCount = tickets.filter((t) => (t.priority === 'URGENT' || t.priority === 'HIGH') && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-[#131B2E] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            Resident Support &amp; Concerns Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resolve household complaints or escalate complex society-wide issues directly to the Main Admin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchTickets}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConcernModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>🚨 Report Society Issue to Main Admin</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-700 dark:text-emerald-300 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 p-5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <span>Pending Open</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="font-display text-2xl font-bold text-amber-900 dark:text-amber-200">{openCount}</p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400">Requires triage / assignment</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-800 p-5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            <span>High Priority / Leaks</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="font-display text-2xl font-bold text-rose-900 dark:text-rose-200">{urgentCount}</p>
          <p className="text-[11px] text-rose-700 dark:text-rose-400">Urgent action required</p>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-100/40 dark:bg-amber-900/30 dark:border-amber-700 p-5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            <span>⚡ Escalated</span>
            <Zap className="h-4 w-4 text-amber-600" />
          </div>
          <p className="font-display text-2xl font-bold text-amber-900 dark:text-amber-200">{escalatedCount}</p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400">Under Main Admin review</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-[#131B2E] dark:border-slate-800 p-5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>In Progress</span>
            <Wrench className="h-4 w-4 text-sky-500" />
          </div>
          <p className="font-display text-2xl font-bold text-sky-600 dark:text-sky-400">{inProgressCount}</p>
          <p className="text-[11px] text-slate-400">Technician dispatched</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-[#131B2E] dark:border-slate-800 p-5 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount}</p>
          <p className="text-[11px] text-slate-400">Closed issues</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200/60 dark:border-slate-800">
          {(['ALL', 'OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Tickets' : st === 'ESCALATED' ? '⚡ Escalated' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="BULK_SUPPLY_ISSUE">Bulk Supply Failure</option>
            <option value="HARDWARE_DEFECT">Society Hardware Defect</option>
            <option value="WATER_LEAKAGE">Water Leakage</option>
            <option value="BILLING_DISPUTE">Billing Inquiry</option>
            <option value="METER_DEFECT">Meter Calibration</option>
            <option value="LOW_PRESSURE">Low Pressure</option>
            <option value="WATER_QUALITY">Water Quality</option>
            <option value="GENERAL">General</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search flat, resident, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-card space-y-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No support tickets match your search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Ticket ID</th>
                  <th className="py-3 px-4">Flat / Source</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Subject &amp; Issue Summary</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status &amp; Escalation</th>
                  <th className="py-3 px-4">Date Logged</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium text-slate-700 dark:text-slate-300">
                {paginatedTickets.map((t) => {
                  const cat = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.GENERAL;
                  const IconComp = cat.icon;
                  const isOpen = t.status === 'OPEN';
                  const isInProgress = t.status === 'IN_PROGRESS';
                  const isResolved = t.status === 'RESOLVED' || t.status === 'CLOSED';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        #{t.id}
                      </td>

                      <td className="py-3.5 px-4">
                        {t.ticketScope === 'COMMUNITY_ADMIN_ISSUE' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                            <Building2 className="w-3.5 h-3.5" /> Society Issue
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">Flat {t.flatNumber}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 dark:text-slate-300">{t.residentName}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${cat.color}`}>
                          <IconComp className="h-3 w-3" />
                          {cat.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{t.subject}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{t.description}</p>
                          {t.isEscalatedToMainAdmin && t.escalationReason && (
                            <p className="text-[10.5px] text-amber-600 dark:text-amber-400 italic">
                              ⚡ Escalated: {t.escalationReason}
                            </p>
                          )}
                          {t.mainAdminNotes && (
                            <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              🛡️ Main Admin: {t.mainAdminNotes}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.priority === 'URGENT' || t.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : t.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {t.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2.5 py-0.5 rounded-xl text-xs font-bold border ${
                            isOpen
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              : isInProgress
                              ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>

                          {t.isEscalatedToMainAdmin && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              <Zap className="w-2.5 h-2.5" /> Escalated to Main Admin
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isResolved && !t.isEscalatedToMainAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setEscalateTicket(t);
                                setEscalationReason('');
                              }}
                              className="inline-flex items-center gap-1 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 shadow-2xs active:scale-95 transition-all cursor-pointer"
                              title="Escalate to Main Admin"
                            >
                              <Zap className="h-3.5 w-3.5 text-amber-600" />
                              <span>Escalate</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenUpdateModal(t)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Update</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredTickets.length > pageSize && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredTickets.length / pageSize)}
              totalItems={filteredTickets.length}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* UPDATE / RESOLVE MODAL */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Update Support Ticket #${selectedTicket?.id} — ${selectedTicket?.flatNumber ? `Flat ${selectedTicket.flatNumber}` : 'Society Concern'}`}
      >
        {selectedTicket && (
          <form onSubmit={handleSaveTicketUpdate} className="space-y-4">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Resident: {selectedTicket.residentName}</span>
                <span className="font-mono text-slate-500">{selectedTicket.residentEmail || 'No email registered'}</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{selectedTicket.subject}</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedTicket.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ticket Lifecycle Status <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['IN_PROGRESS', 'RESOLVED', 'CLOSED'] as TicketStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setUpdateStatus(st)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                      updateStatus === st
                        ? st === 'RESOLVED' || st === 'CLOSED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Resolution Notes / Technician Action Log
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Plumber inspected utility valve on 15-Aug and replaced washer. Flow normal."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:bg-white focus:border-sky-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                These notes will be immediately visible to the resident in their portal.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 cursor-pointer text-center"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{updating ? 'Saving...' : 'Save & Update Status'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ESCALATE TICKET MODAL */}
      <Modal
        isOpen={!!escalateTicket}
        onClose={() => setEscalateTicket(null)}
        title={`⚡ Escalate Ticket #${escalateTicket?.id} to Main Admin`}
      >
        {escalateTicket && (
          <form onSubmit={handleEscalateSubmit} className="space-y-4">
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                Escalation to Central Platform Operations
              </p>
              <p>
                Use this when local resolution is not possible (e.g. municipal bulk line fracture, vendor hardware defect, tariff system adjustment).
              </p>
            </div>

            <div className="text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-xl space-y-1">
              <p><strong>Flat:</strong> {escalateTicket.flatNumber} • <strong>Resident:</strong> {escalateTicket.residentName}</p>
              <p><strong>Subject:</strong> {escalateTicket.subject}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Escalation Reason & Notes for Main Admin <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Explain why this issue requires Main Admin intervention, what local checks have failed, or what external support is required..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEscalateTicket(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={escalating}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-50"
              >
                {escalating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Confirm Escalation
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* REPORT SOCIETY CONCERN MODAL */}
      <Modal
        isOpen={isConcernModalOpen}
        onClose={() => setIsConcernModalOpen(false)}
        title="🚨 Report Society-Level Problem to Main Admin"
      >
        <form onSubmit={handleCreateConcernSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit society-wide emergencies, bulk pipeline failures, municipal outages, or tariff disputes directly to the Main Admin dashboard.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Problem Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={concernData.category}
              onChange={(e) => setConcernData({ ...concernData, category: e.target.value as any })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="BULK_SUPPLY_ISSUE">Bulk Water Tanker / Inflow Shortage</option>
              <option value="HARDWARE_DEFECT">Society Bulk Digital Meter / Sensor Failure</option>
              <option value="MUNICIPAL_OUTAGE">Municipal Main Pipeline Cut / Low Pressure</option>
              <option value="TARIFF_DISPUTE">Platform Tariff Structure / Billing Surcharge Issue</option>
              <option value="GENERAL">General Society Administrative Concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Priority <span className="text-rose-500">*</span>
            </label>
            <select
              value={concernData.priority}
              onChange={(e) => setConcernData({ ...concernData, priority: e.target.value as any })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="HIGH">⚡ High Priority</option>
              <option value="URGENT">🔥 Urgent / Emergency Outage</option>
              <option value="MEDIUM">Medium Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Subject Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Society Inflow Line Valve Broken / 3rd Tanker Delivery Contaminated"
              value={concernData.subject}
              onChange={(e) => setConcernData({ ...concernData, subject: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Description & Requested Intervention <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe the issue in detail, affected towers, current sump water levels, or vendor details..."
              value={concernData.description}
              onChange={(e) => setConcernData({ ...concernData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsConcernModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingConcern}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50"
            >
              {submittingConcern ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit Problem to Main Admin
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
