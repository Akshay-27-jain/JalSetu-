import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mainAdminApi, extractErrorMessage } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonTable } from '../../components/SkeletonLoader';
import { Building2, Users, Droplets, ShieldCheck, Plus, Search, Mail, MapPin, CheckCircle2, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
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
  const [totalHouseholds, setTotalHouseholds] = useState<number>(20);
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

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
    if (!name || !totalHouseholds || !adminFullName || !adminEmail || !adminPassword) {
      setModalError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);
      await mainAdminApi.createApartment({
        name: name.trim(),
        address: address.trim(),
        totalHouseholds,
        adminFullName: adminFullName.trim(),
        adminEmail: adminEmail.trim(),
        adminPassword,
      });

      // Reset form & close modal
      setName('');
      setAddress('');
      setTotalHouseholds(20);
      setAdminFullName('');
      setAdminEmail('');
      setAdminPassword('');
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
        maxWidth="lg"
      >
        {modalError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleCreateApartment} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                onChange={(e) => setTotalHouseholds(parseInt(e.target.value) || 1)}
                className="input-field"
              />
            </div>

            <div className="border-t sm:col-span-2 border-slate-100 dark:border-slate-800 pt-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Community Administrator Account
              </h4>
            </div>

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
                placeholder="admin@palmmeadows.com"
                className="input-field"
              />
            </div>

            <div className="sm:col-span-2">
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
