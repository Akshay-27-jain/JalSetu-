import React, { useState, useEffect } from 'react';
import { mainAdminApi, extractErrorMessage } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import {
  Megaphone,
  Plus,
  Radio,
  Building2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  Send,
  Mail,
  Users,
  Info,
  Layers,
} from 'lucide-react';
import type {
  Announcement,
  AnnouncementCategory,
  AnnouncementPriority,
  CreateMainAdminAnnouncementRequest,
  Apartment,
} from '../../types';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const MainAdminAnnouncementsPage: React.FC = () => {
  const { confirm, showAlert } = useConfirm();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<CreateMainAdminAnnouncementRequest>({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    isPinned: false,
    targetApartmentId: undefined,
    sendEmailBroadcast: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [annData, aptData] = await Promise.all([
        mainAdminApi.getAnnouncements(),
        mainAdminApi.getApartments(),
      ]);
      setAnnouncements(annData);
      setApartments(aptData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      await showAlert('Please fill out both the announcement title and content.', 'Missing Information', 'warning');
      return;
    }

    try {
      setFormLoading(true);
      await mainAdminApi.createAnnouncement(formData);
      setFeedbackMsg({
        type: 'success',
        text: 'Platform announcement broadcasted successfully! Community Admins can now view and forward it to residents.',
      });
      setIsModalOpen(false);
      setFormData({
        title: '',
        content: '',
        category: 'GENERAL',
        priority: 'NORMAL',
        isPinned: false,
        targetApartmentId: undefined,
        sendEmailBroadcast: true,
      });
      await fetchData();
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: extractErrorMessage(err),
      });
    } finally {
      setFormLoading(false);
      setTimeout(() => setFeedbackMsg(null), 6000);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Broadcast Notice',
      message: 'Are you sure you want to permanently delete this broadcast notice? Community Admins and residents will no longer see it.',
      confirmText: 'Delete Broadcast',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await mainAdminApi.deleteAnnouncement(id);
      setFeedbackMsg({
        type: 'success',
        text: 'Announcement notice removed.',
      });
      await fetchData();
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: extractErrorMessage(err),
      });
    } finally {
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">🚨 CRITICAL</span>;
      case 'IMPORTANT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">⚡ IMPORTANT</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">NORMAL</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-sky-400/30 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> Multi-Tier Platform Broadcasts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Platform Announcements & Advisories
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Broadcast city-level municipal water advisories, quality alerts, or rationing guidelines to all societies or specific apartment complexes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-sm font-semibold backdrop-blur transition-all border border-white/15"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-900 font-bold rounded-xl text-sm shadow-lg shadow-sky-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Broadcast
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-sky-900 dark:text-sky-200">
        <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">How Multi-Tier Announcements Work:</p>
          <p className="text-sky-800 dark:text-sky-300 mt-0.5 leading-relaxed">
            Announcements published here immediately appear in the Community Admins' dashboards. Community Admins can review them and click <strong>"Forward to All Households via Email"</strong> with a single click to broadcast the notice directly into every resident's personal inbox.
          </p>
        </div>
      </div>

      {/* Feedback Message */}
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

      {/* Broadcasts List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading platform broadcasts...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Megaphone className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Announcements Active</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mt-1">
            Click <strong>"New Broadcast"</strong> above to publish a citywide or society-specific water management notice.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all hover:shadow-md space-y-3"
            >
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-bold">
                    #{ann.id}
                  </span>

                  {ann.targetApartmentId ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                      <Building2 className="w-3.5 h-3.5" /> Specific Society: {apartments.find(a => a.id === ann.targetApartmentId)?.name || `ID #${ann.targetApartmentId}`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                      <Radio className="w-3.5 h-3.5" /> All Communities (Platform-wide)
                    </span>
                  )}

                  {getPriorityBadge(ann.priority)}

                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Category: <strong className="text-slate-700 dark:text-slate-300">{ann.category.replace(/_/g, ' ')}</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                  title="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Body */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {ann.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 whitespace-pre-wrap leading-relaxed">
                  {ann.content}
                </p>
              </div>

              {/* Footer metadata */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Broadcasted on: {new Date(ann.createdAt).toLocaleString()}</span>
                </div>

                {ann.forwardedToResidentsByEmail ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Mail className="w-3.5 h-3.5" /> Forwarded to households by {ann.forwardedByAdminName || 'Community Admin'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Mail className="w-3.5 h-3.5" /> Ready for Community Admins to forward via email
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Composer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Platform Announcement"
        subtitle="Broadcast advisories directly to community management portals"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Target Community Audience *
            </label>
            <select
              value={formData.targetApartmentId !== undefined ? String(formData.targetApartmentId) : 'ALL'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetApartmentId: e.target.value === 'ALL' ? undefined : Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
            >
              <option value="ALL">📢 All Communities (Platform-wide / City-level Broadcast)</option>
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  🏢 {apt.name} ({apt.totalHouseholds} households)
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Municipal Supply Rationing Advisory / Monsoon Quality Check"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AnnouncementCategory })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
              >
                <option value="RATIONING_ADVISORY">Rationing Advisory</option>
                <option value="WATER_QUALITY">Water Quality Report</option>
                <option value="MAINTENANCE">Maintenance & Pipeline</option>
                <option value="SUPPLY_INTERRUPTION">Supply Interruption</option>
                <option value="GENERAL">General Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Priority Level *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as AnnouncementPriority })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">⚡ Important</option>
                <option value="CRITICAL">🚨 Critical Alert</option>
              </select>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Announcement Message / Advisory Details *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide complete guidelines, expected timings, conservation recommendations..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <input
              type="checkbox"
              id="sendEmailCheckbox"
              checked={formData.sendEmailBroadcast || false}
              onChange={(e) => setFormData({ ...formData, sendEmailBroadcast: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="sendEmailCheckbox" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              Send email notification to Community Administrators immediately
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={formLoading}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {formLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Broadcast Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
