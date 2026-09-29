import React, { useState, useEffect } from 'react';
import { communityAdminApi, extractErrorMessage } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import type { Announcement, AnnouncementCategory, AnnouncementPriority } from '../../types';
import { useConfirm } from '../../context/ConfirmDialogContext';
import {
  BellRing,
  Plus,
  Pin,
  Calendar,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Mail,
  Send,
  Droplets,
  ShieldAlert,
  Wrench,
  Receipt,
  AlertTriangle,
  Info,
  Search,
} from 'lucide-react';

const CATEGORY_MAP: Record<AnnouncementCategory, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  TANK_CLEANING: { label: 'Tank Cleaning Schedule', icon: Droplets, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  SUPPLY_INTERRUPTION: { label: 'Supply Interruption Notice', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  MAINTENANCE: { label: 'Pipeline Maintenance', icon: Wrench, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  BILLING_NOTICE: { label: 'Billing Cycle Update', icon: Receipt, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  WATER_QUALITY: { label: 'Water Quality Advisory', icon: AlertTriangle, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  GENERAL: { label: 'General Announcement', icon: Info, color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export const AnnouncementsPage: React.FC = () => {
  const { confirm } = useConfirm();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Announcement Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<AnnouncementCategory>('TANK_CLEANING');
  const [formPriority, setFormPriority] = useState<AnnouncementPriority>('NORMAL');
  const [formContent, setFormContent] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formBroadcastEmail, setFormBroadcastEmail] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communityAdminApi.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setError('Please provide title and announcement details.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const created = await communityAdminApi.createAnnouncement({
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        priority: formPriority,
        isPinned: formIsPinned,
        expiryDate: formExpiryDate || undefined,
        sendEmailBroadcast: formBroadcastEmail,
      });

      setSuccessMsg(
        `Announcement '${created.title}' published successfully!${
          formBroadcastEmail ? ' Broadcast emails sent to registered residents.' : ''
        }`
      );
      setIsModalOpen(false);
      setFormTitle('');
      setFormContent('');
      setFormCategory('TANK_CLEANING');
      setFormPriority('NORMAL');
      setFormIsPinned(false);
      setFormExpiryDate('');
      setFormBroadcastEmail(true);
      fetchAnnouncements();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Community Notice',
      message: 'Are you sure you want to permanently delete this community notice? Residents will no longer see this in their feed.',
      confirmText: 'Delete Notice',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await communityAdminApi.deleteAnnouncement(id);
      setSuccessMsg('Announcement removed successfully.');
      fetchAnnouncements();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const [forwardingId, setForwardingId] = useState<number | null>(null);

  const handleForwardToResidents = async (announcementId: number) => {
    try {
      setForwardingId(announcementId);
      setError(null);
      const res = await communityAdminApi.forwardAnnouncementToEmail(announcementId);
      const count = res.recipientCount ?? 0;
      setSuccessMsg(`📧 Successfully forwarded notice to ${count} registered resident inboxes!`);
      await fetchAnnouncements();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setForwardingId(null);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="h-6 w-6 text-brand-600" />
            Community Notices &amp; Announcements
          </h2>
          <p className="text-xs text-slate-500">
            Publish society water notices, inspect citywide platform broadcasts, and forward advisories to resident inboxes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAnnouncements}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-95 transition-all cursor-pointer"
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
            <span>Publish Notice</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'TANK_CLEANING', 'SUPPLY_INTERRUPTION', 'MAINTENANCE', 'BILLING_NOTICE', 'GENERAL'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'All Notices' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Announcements Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <BellRing className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="font-display text-base font-bold text-slate-800">No Announcements Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You haven't published any community notices yet. Create one to inform your residents about tank cleaning, maintenance or billing updates.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Publish Notice</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAnnouncements.map((a) => {
            const cat = CATEGORY_MAP[a.category] || CATEGORY_MAP.GENERAL;
            const IconComp = cat.icon;

            return (
              <div
                key={a.id}
                className={`rounded-3xl border bg-white p-6 shadow-card hover:border-brand-300 transition-all flex flex-col justify-between space-y-4 ${
                  a.isMainAdminBroadcast
                    ? 'border-sky-300 ring-2 ring-sky-100 bg-sky-50/20'
                    : a.isPinned
                    ? 'border-brand-300 ring-1 ring-brand-100'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {a.isMainAdminBroadcast ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-sky-100 text-sky-800 border border-sky-300">
                          🌐 Central Platform Broadcast
                        </span>
                      ) : (
                        <div className={`p-1.5 rounded-lg border ${cat.color}`}>
                          <IconComp className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${cat.color}`}>
                        {cat.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {a.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          <Pin className="h-3 w-3" /> Pinned
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        a.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : a.priority === 'IMPORTANT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {a.priority}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900">{a.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{a.content}</p>

                  {/* Forward to Residents Banner for Main Admin Broadcasts */}
                  {a.isMainAdminBroadcast && (
                    <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200">
                        <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                        {a.forwardedToResidentsByEmail ? (
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">
                            ✅ Forwarded to all resident emails {a.forwardedByAdminName ? `by ${a.forwardedByAdminName}` : ''}
                          </span>
                        ) : (
                          <span className="font-medium">
                            Forward this platform advisory to all your society residents via automated email.
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleForwardToResidents(a.id)}
                        disabled={forwardingId === a.id}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                      >
                        {forwardingId === a.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{a.forwardedToResidentsByEmail ? 'Forward Again' : 'Forward to All Residents'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Published {a.publishDate || (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent')}
                    {a.expiryDate && ` • Valid until ${a.expiryDate}`}
                  </span>

                  {!a.isMainAdminBroadcast && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Official Community Announcement"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as AnnouncementCategory)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            >
              <option value="TANK_CLEANING">💧 Tank Cleaning Schedule</option>
              <option value="SUPPLY_INTERRUPTION">⚠️ Supply Interruption Notice</option>
              <option value="MAINTENANCE">🔧 Pipeline / Valve Maintenance</option>
              <option value="BILLING_NOTICE">📄 Billing &amp; Tariff Surcharge Notice</option>
              <option value="WATER_QUALITY">🧪 Water Quality &amp; Filtration Advisory</option>
              <option value="GENERAL">📢 General Society Announcement</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Priority
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['NORMAL', 'IMPORTANT', 'CRITICAL'] as AnnouncementPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormPriority(p)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    formPriority === p
                      ? p === 'CRITICAL'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : p === 'IMPORTANT'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Biannual Overhead Water Tank Cleaning - Friday 10 AM to 2 PM"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Description / Instructions <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Write the full announcement details, time windows, and instructions for residents..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={formExpiryDate}
                onChange={(e) => setFormExpiryDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Pin notice to top</span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-3.5">
            <label className="flex items-center gap-2 text-xs font-bold text-brand-900 cursor-pointer">
              <input
                type="checkbox"
                checked={formBroadcastEmail}
                onChange={(e) => setFormBroadcastEmail(e.target.checked)}
                className="rounded border-brand-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-brand-600" />
                <span>Broadcast notice via transactional email to all registered resident inboxes</span>
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 cursor-pointer text-center"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? 'Publishing...' : 'Publish Announcement'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
