import React, { useState, useEffect } from 'react';
import { residentApi, extractErrorMessage } from '../../services/api';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import type { SupportTicket, TicketCategory, TicketPriority, TicketStatus } from '../../types';
import {
  LifeBuoy,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Droplets,
  Search,
  Filter,
  MessageSquare,
  Wrench,
  Gauge,
  Receipt,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  Send,
  Check,
} from 'lucide-react';

const CATEGORY_MAP: Record<TicketCategory, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  WATER_LEAKAGE: { label: 'Water Leakage / Pipe Burst', icon: Droplets, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  BILLING_DISPUTE: { label: 'Billing / Surcharge Inquiry', icon: Receipt, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  METER_DEFECT: { label: 'Sub-Meter Dial Calibration', icon: Gauge, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  LOW_PRESSURE: { label: 'Low Flow Pressure', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  WATER_QUALITY: { label: 'Water Quality / Discoloration', icon: LifeBuoy, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  GENERAL: { label: 'General Society Concern', icon: MessageSquare, color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export const ResidentSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Ticket Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formCategory, setFormCategory] = useState<TicketCategory>('WATER_LEAKAGE');
  const [formPriority, setFormPriority] = useState<TicketPriority>('MEDIUM');
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await residentApi.getSupportTickets();
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formDescription.trim()) {
      setError('Please provide both subject and detailed description.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const created = await residentApi.createSupportTicket({
        category: formCategory,
        priority: formPriority,
        subject: formSubject.trim(),
        description: formDescription.trim(),
      });
      setSuccessMsg(`Support concern #${created.id} submitted to Community Management!`);
      setIsModalOpen(false);
      setFormSubject('');
      setFormDescription('');
      setFormCategory('WATER_LEAKAGE');
      setFormPriority('MEDIUM');
      fetchTickets();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      t.subject.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            Resident Support &amp; Concerns Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit water leakage reports, meter calibration requests, or billing inquiries directly to your society admin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchTickets}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Raise New Concern</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-700 dark:text-emerald-300 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Open Submissions</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{openCount}</p>
          <p className="text-[11px] text-slate-400">Awaiting management review</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>In Progress</span>
            <Wrench className="h-4 w-4 text-brand-500" />
          </div>
          <p className="font-display text-2xl font-bold text-brand-600 dark:text-brand-400 tabular-nums">{inProgressCount}</p>
          <p className="text-[11px] text-slate-400">Technician / plumber assigned</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{resolvedCount}</p>
          <p className="text-[11px] text-slate-400">Successfully closed</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/60 dark:border-slate-700">
          {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Tickets' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by subject, issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E]">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-12 text-center space-y-3">
            <LifeBuoy className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="font-display text-base font-bold text-slate-800 dark:text-white">No Support Tickets Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              You currently have no open or recorded support requests matching this filter.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Submit a Concern</span>
            </button>
          </div>
        ) : (
          paginatedTickets.map((ticket) => {
            const catInfo = CATEGORY_MAP[ticket.category] || CATEGORY_MAP.GENERAL;
            const IconComponent = catInfo.icon;
            const isOpen = ticket.status === 'OPEN';
            const isInProgress = ticket.status === 'IN_PROGRESS';
            const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';

            return (
              <div
                key={ticket.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm hover:border-brand-300 dark:hover:border-brand-700 transition-all space-y-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${catInfo.color} dark:bg-opacity-20`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">#{ticket.id}</span>
                        <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">{ticket.subject}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${catInfo.color} dark:bg-opacity-20`}>
                          {catInfo.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        Submitted on {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Status & Priority Badges */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-xl border ${
                      isOpen
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        : isInProgress
                        ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>

                    <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${
                      ticket.priority === 'URGENT' || ticket.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : ticket.priority === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {ticket.priority} Priority
                    </span>
                  </div>
                </div>

                {/* Description Body */}
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {ticket.description}
                </p>

                {/* Admin Resolution Notes if any */}
                {ticket.resolutionNotes && (
                  <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Community Management Update / Resolution Note:</span>
                    </div>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed pl-6">
                      {ticket.resolutionNotes}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}

        {filteredTickets.length > pageSize && (
          <div className="flex justify-center pt-2">
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

      {/* RAISE NEW CONCERN MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Raise Support Request or Concern"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit your concern directly to the community administrative desk. For urgent leaks, mark priority as High or Urgent.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Issue Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as TicketCategory)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="WATER_LEAKAGE">💧 Water Leakage / Pipe Burst</option>
              <option value="BILLING_DISPUTE">📑 Billing / Surcharge Clarification</option>
              <option value="METER_DEFECT">⚙️ Sub-Meter Dial Calibration</option>
              <option value="LOW_PRESSURE">⚠️ Low Water Pressure</option>
              <option value="WATER_QUALITY">🧪 Water Quality / Discoloration</option>
              <option value="GENERAL">💬 General Society Concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TicketPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormPriority(p)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    formPriority === p
                      ? p === 'URGENT' || p === 'HIGH'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Utility valve leak or Meter dial display dim"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the issue, location in flat (kitchen, bathroom, riser shaft), and any observations..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3.5 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 cursor-pointer text-center"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
