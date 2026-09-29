import React, { useState, useEffect, useMemo } from 'react';
import { mainAdminApi, extractErrorMessage } from '../../services/api';
import { Modal } from '../../components/Modal';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import {
  LifeBuoy,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Search,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  Send,
  X,
  FileText,
  HelpCircle,
  Flame,
} from 'lucide-react';
import type { SupportTicket, TicketStatus, TicketCategory } from '../../types';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const MainAdminSupportDeskPage: React.FC = () => {
  const { showAlert } = useConfirm();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'escalated' | 'concerns' | 'pending' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Resolution Modal State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolveStatus, setResolveStatus] = useState<TicketStatus>('RESOLVED');
  const [mainAdminNotes, setMainAdminNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mainAdminApi.getSupportTickets(activeTab);
      setTickets(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeTab]);

  const handleOpenResolveModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResolveStatus(ticket.status === 'RESOLVED' ? 'RESOLVED' : 'RESOLVED');
    setMainAdminNotes(ticket.mainAdminNotes || '');
    setResolutionNotes(ticket.resolutionNotes || '');
  };

  const handleCloseResolveModal = () => {
    setSelectedTicket(null);
    setMainAdminNotes('');
    setResolutionNotes('');
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!mainAdminNotes.trim()) {
      await showAlert('Please enter Main Admin resolution remarks before completing.', 'Remarks Required', 'warning');
      return;
    }

    try {
      setActionLoading(true);
      await mainAdminApi.resolveSupportTicket(selectedTicket.id, {
        status: resolveStatus,
        mainAdminNotes: mainAdminNotes.trim(),
        resolutionNotes: resolutionNotes.trim() || undefined,
      });

      setFeedbackMsg({
        type: 'success',
        text: `Ticket #${selectedTicket.id} updated to ${resolveStatus} successfully. Stakeholders notified.`,
      });
      handleCloseResolveModal();
      await fetchTickets();
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: extractErrorMessage(err),
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMsg(null), 6000);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = tickets.length;
    const escalated = tickets.filter((t) => t.isEscalatedToMainAdmin).length;
    const societyConcerns = tickets.filter((t) => t.ticketScope === 'COMMUNITY_ADMIN_ISSUE').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const pending = total - resolved;

    return { total, escalated, societyConcerns, resolved, pending };
  }, [tickets]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.apartmentName && t.apartmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.residentName && t.residentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.flatNumber && t.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [tickets, searchTerm, categoryFilter]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">🔥 URGENT</span>;
      case 'HIGH':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">⚡ HIGH</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">MEDIUM</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <Badge variant="success">✅ RESOLVED</Badge>;
      case 'CLOSED':
        return <Badge variant="secondary">CLOSED</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning">⏳ IN PROGRESS</Badge>;
      default:
        return <Badge variant="danger">OPEN</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-sky-400/30 flex items-center gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5 text-sky-400" /> Platform Governance Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Support Desk & Escalations
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Monitor society grievances across all communities, resolve escalated resident issues, and handle high-priority society administrator concerns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-sm font-semibold backdrop-blur transition-all border border-white/15"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Feedback message */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Issues"
          value={stats.total}
          subtitle="All platform tickets"
          icon={LifeBuoy}
          iconBgColor="bg-sky-50 dark:bg-sky-950/60"
          iconColor="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          title="⚡ Escalated"
          value={stats.escalated}
          subtitle="From Community Admins"
          icon={Zap}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="🚨 Society Concerns"
          value={stats.societyConcerns}
          subtitle="Society-level outages/defects"
          icon={AlertTriangle}
          iconBgColor="bg-rose-50 dark:bg-rose-950/60"
          iconColor="text-rose-600 dark:text-rose-400"
        />
        <StatCard
          title="⏳ Pending Action"
          value={stats.pending}
          subtitle="Open or in-progress"
          icon={Clock}
          iconBgColor="bg-orange-50 dark:bg-orange-950/60"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatCard
          title="✅ Resolved"
          value={stats.resolved}
          subtitle="Closed / Resolved"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Filters & Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          {[
            { id: 'all', label: 'All Platform Issues', count: stats.total },
            { id: 'escalated', label: '⚡ Escalated Tickets', count: stats.escalated },
            { id: 'concerns', label: '🚨 Society Concerns', count: stats.societyConcerns },
            { id: 'pending', label: '⏳ Pending', count: stats.pending },
            { id: 'resolved', label: '✅ Resolved', count: stats.resolved },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-bold">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search society, flat, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
          >
            <option value="ALL">All Categories</option>
            <option value="BULK_SUPPLY_ISSUE">Bulk Supply Issue</option>
            <option value="HARDWARE_DEFECT">Hardware Defect</option>
            <option value="TARIFF_DISPUTE">Tariff Dispute</option>
            <option value="MUNICIPAL_OUTAGE">Municipal Outage</option>
            <option value="METER_DEFECT">Meter Defect</option>
            <option value="BILLING_DISPUTE">Billing Dispute</option>
            <option value="WATER_LEAKAGE">Water Leakage</option>
            <option value="LOW_PRESSURE">Low Pressure</option>
            <option value="WATER_QUALITY">Water Quality</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading support tickets across societies...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
          <button
            onClick={fetchTickets}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Support Issues Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mt-1">
            {searchTerm || categoryFilter !== 'ALL'
              ? 'No tickets match your search filters.'
              : 'All societies are operating smoothly with no unresolved escalations.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${
                ticket.isEscalatedToMainAdmin
                  ? 'border-amber-300/80 dark:border-amber-700/60 bg-amber-50/10'
                  : ticket.ticketScope === 'COMMUNITY_ADMIN_ISSUE'
                  ? 'border-rose-300/80 dark:border-rose-700/60 bg-rose-50/10'
                  : 'border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Left ticket details */}
                <div className="space-y-3 flex-1">
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-bold">
                      #{ticket.id}
                    </span>

                    {ticket.ticketScope === 'COMMUNITY_ADMIN_ISSUE' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5" /> Society Admin Concern
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                        <User className="w-3 h-3" /> Resident Ticket
                      </span>
                    )}

                    {ticket.isEscalatedToMainAdmin && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                        <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Escalated to Main Admin
                      </span>
                    )}

                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}

                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Category: <strong className="text-slate-600 dark:text-slate-300">{ticket.category.replace(/_/g, ' ')}</strong>
                    </span>
                  </div>

                  {/* Subject and Description */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {ticket.subject}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 whitespace-pre-wrap leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Metadata banner: Society, Flat, Resident, Date */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-sky-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {ticket.apartmentName || `Society #${ticket.apartmentId}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{ticket.residentName || 'Administrator'}</span>
                      {ticket.flatNumber && (
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          (Flat {ticket.flatNumber})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reported: {new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Escalation details box */}
                  {ticket.isEscalatedToMainAdmin && ticket.escalationReason && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-3 rounded-r-xl text-xs text-amber-900 dark:text-amber-200">
                      <p className="font-bold flex items-center gap-1.5 mb-1">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        Escalation Reason from Community Admin:
                      </p>
                      <p className="italic">{ticket.escalationReason}</p>
                      {ticket.escalatedAt && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                          Escalated on: {new Date(ticket.escalatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Main Admin Resolution Box if present */}
                  {ticket.mainAdminNotes && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-500 p-3 rounded-r-xl text-xs text-emerald-900 dark:text-emerald-200">
                      <p className="font-bold flex items-center gap-1.5 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Main Admin Resolution & Action Taken:
                      </p>
                      <p className="whitespace-pre-wrap">{ticket.mainAdminNotes}</p>
                      {ticket.resolvedAt && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                          Resolved on: {new Date(ticket.resolvedAt).toLocaleString()} (by {ticket.resolvedByRole || 'Main Admin'})
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Action Button */}
                <div className="flex flex-col gap-2 shrink-0 md:w-48">
                  <button
                    onClick={() => handleOpenResolveModal(ticket)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {ticket.status === 'RESOLVED' ? 'Update Resolution' : 'Resolve / Action'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={handleCloseResolveModal}
        title={selectedTicket ? `Resolve Ticket #${selectedTicket.id}: ${selectedTicket.subject}` : 'Resolve Ticket'}
        subtitle="Platform Governance & Resolution Desk"
        maxWidth="lg"
      >
        {selectedTicket && (
          <div className="space-y-4">
            {/* Context snippet */}
            <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                <p>
                  <strong className="text-slate-900 dark:text-white">Society:</strong> {selectedTicket.apartmentName || `Society #${selectedTicket.apartmentId}`}
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-white">Raised by:</strong> {selectedTicket.residentName || 'Resident'} {selectedTicket.flatNumber ? `(Flat ${selectedTicket.flatNumber})` : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  {selectedTicket.category.replace(/_/g, ' ')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                  {selectedTicket.priority} Priority
                </span>
              </div>

              {selectedTicket.escalationReason && (
                <div className="text-amber-700 dark:text-amber-300 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                  <strong>Escalation note from Community Admin:</strong> {selectedTicket.escalationReason}
                </div>
              )}
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Update Status *
                </label>
                <select
                  value={resolveStatus}
                  onChange={(e) => setResolveStatus(e.target.value as TicketStatus)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white font-medium"
                >
                  <option value="RESOLVED">✅ RESOLVED (Platform Resolution Complete)</option>
                  <option value="IN_PROGRESS">⏳ IN_PROGRESS (Investigation / Technician Underway)</option>
                  <option value="CLOSED">🔒 CLOSED (Archived)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Main Admin Resolution Remarks & Instructions *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain resolution steps taken, technician dispatch report, bulk meter adjustments, or instructions to the community..."
                  value={mainAdminNotes}
                  onChange={(e) => setMainAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  This resolution note will be permanently logged and emailed to the Community Admin and resident.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseResolveModal}
                  disabled={actionLoading}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Resolution
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
