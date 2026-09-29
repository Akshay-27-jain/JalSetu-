import React, { useState, useEffect } from 'react';
import { adminBillingApi, extractErrorMessage } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import type { BulkPurchase, BulkPurchaseCycleSummary } from '../../types';
import { useConfirm } from '../../context/ConfirmDialogContext';
import {
  Truck,
  Droplets,
  IndianRupee,
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  Building2,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
} from 'lucide-react';

export const BulkPurchasesPage: React.FC = () => {
  const { confirm } = useConfirm();
  const [purchases, setPurchases] = useState<BulkPurchase[]>([]);
  const [summary, setSummary] = useState<BulkPurchaseCycleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month / Cycle Filter
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'TANKER' | 'MUNICIPAL'>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add Tanker / Municipal Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState<'TANKER' | 'MUNICIPAL'>('TANKER');
  const [vendorName, setVendorName] = useState('');
  const [volumeKl, setVolumeKl] = useState<number>(12);
  const [unitCost, setUnitCost] = useState<number>(65);
  const [purchasedAt, setPurchasedAt] = useState<string>(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, summaryData] = await Promise.all([
        adminBillingApi.getBulkPurchases(),
        adminBillingApi.getBulkPurchaseSummary(selectedMonth !== 'ALL' ? selectedMonth : undefined),
      ]);
      setPurchases(data);
      setSummary(summaryData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [selectedMonth]);

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || volumeKl <= 0 || unitCost <= 0) {
      setModalError('Please fill in all bulk water purchase details.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);
      await adminBillingApi.logBulkPurchase({
        sourceType,
        vendorName: vendorName.trim(),
        volumeKl,
        unitCost,
        purchasedAt,
      });
      setIsModalOpen(false);
      setVendorName('');
      setVolumeKl(12);
      setUnitCost(65);
      fetchPurchases();
    } catch (err) {
      setModalError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Water Purchase Entry',
      message: 'Are you sure you want to permanently delete this water purchase entry? This will update cycle costs immediately.',
      confirmText: 'Delete Entry',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      setDeletingId(id);
      await adminBillingApi.deleteBulkPurchase(id);
      fetchPurchases();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered Purchases
  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.purchasedAt.includes(searchTerm);
    const matchesMonth =
      selectedMonth === 'ALL' || (p.purchasedAt && p.purchasedAt.startsWith(selectedMonth));
    const matchesSource = sourceFilter === 'ALL' || p.sourceType === sourceFilter;
    return matchesSearch && matchesMonth && matchesSource;
  });

  // Unique Months for Dropdown
  const availableMonths = Array.from(
    new Set(purchases.map((p) => p.purchasedAt ? p.purchasedAt.slice(0, 7) : currentYearMonth))
  ).sort().reverse();
  if (!availableMonths.includes(currentYearMonth)) {
    availableMonths.unshift(currentYearMonth);
  }

  // Pagination Slicing
  const totalPages = Math.ceil(filteredPurchases.length / pageSize) || 1;
  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bulk Water Purchase & Procurement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track external tanker deliveries and municipal supply billing, calculate unit costs per cycle, and apportion shared water costs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchPurchases}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-xs transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setModalError(null);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 active:scale-98 cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Log Bulk Purchase</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-800 dark:text-rose-200 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Droplets}
          title={selectedMonth === 'ALL' ? 'Total Volume Procured' : `${selectedMonth} Volume`}
          value={`${(summary?.totalVolumeKl || 0).toLocaleString()} kL`}
          subtitle={`Tanker: ${summary?.tankerVolumeKl || 0} kL | Muni: ${summary?.municipalVolumeKl || 0} kL`}
          trend={{ value: `${summary?.deliveryCount || 0} entries`, isPositive: true }}
          color="blue"
        />

        <StatCard
          icon={IndianRupee}
          title={selectedMonth === 'ALL' ? 'Total Water Expenditure' : `${selectedMonth} Spend`}
          value={`₹${(summary?.totalCost || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle={`Tankers: ₹${summary?.tankerCost || 0} | Muni: ₹${summary?.municipalCost || 0}`}
          color="green"
        />

        <StatCard
          icon={TrendingUp}
          title="Effective Unit Cost"
          value={`₹${summary?.effectiveUnitCost || 0}/kL`}
          subtitle="Weighted average cost per kL"
          color="amber"
        />

        <StatCard
          icon={Truck}
          title="Deliveries / Batches"
          value={`${summary?.deliveryCount || 0} Batches`}
          subtitle={selectedMonth === 'ALL' ? 'All recorded cycles' : `Active cycle ${selectedMonth}`}
          color="purple"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor or date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Cycle/Month Dropdown */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Billing Cycles</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  Cycle: {m}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Sources</option>
              <option value="TANKER">Tanker Deliveries</option>
              <option value="MUNICIPAL">Municipal Supply</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-medium text-slate-400 self-end sm:self-center">
          Showing <strong>{filteredPurchases.length}</strong> records
        </span>
      </div>

      {/* Procurement Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
            <p className="mt-3 text-xs font-semibold">Loading bulk water procurement records...</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <Truck className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-200">No water purchases recorded</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Log external tanker deliveries and municipal water bills to automatically calculate cycle unit rates and apportion shared costs.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">Delivery / Invoice ID</th>
                    <th className="py-3 px-4">Source Type</th>
                    <th className="py-3 px-4">Supplier / Vendor</th>
                    <th className="py-3 px-4">Procured Volume</th>
                    <th className="py-3 px-4">Unit Rate</th>
                    <th className="py-3 px-4">Total Cost</th>
                    <th className="py-3 px-4">Procurement Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {paginatedPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                        PUR-{p.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.sourceType === 'MUNICIPAL'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                        }`}>
                          {p.sourceType === 'MUNICIPAL' ? '🏛️ Municipal' : '🚚 Tanker'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {p.vendorName}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono">
                        {p.volumeKl} kL <span className="text-[10px] font-normal text-slate-400">({(p.volumeKl * 1000).toLocaleString()} L)</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        ₹{p.unitCost} / kL
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{p.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {p.purchasedAt}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all cursor-pointer disabled:opacity-50 ml-auto"
                          title="Delete Entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPurchases.length}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              itemsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </div>

      {/* ---------------- LOG BULK PURCHASE MODAL ---------------- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Bulk Water Procurement"
        subtitle="Record tanker delivery or municipal water billing to track cycle volume and calculate shared costs"
        maxWidth="md"
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-tanker-form"
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 cursor-pointer transition-all text-center"
            >
              {submitting ? 'Saving Procurement Log...' : 'Save Procurement Record'}
            </button>
          </div>
        }
      >
        {modalError && (
          <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{modalError}</span>
          </div>
        )}

        <form id="add-tanker-form" onSubmit={handleCreatePurchase} className="space-y-4">
          {/* Source Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Procurement Source <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSourceType('TANKER')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  sourceType === 'TANKER'
                    ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Truck className="h-4 w-4" />
                <span>Tanker Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('MUNICIPAL')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  sourceType === 'MUNICIPAL'
                    ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Municipal Supply</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supplier / Board / Agency Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={sourceType === 'TANKER' ? 'e.g. Sri Balaji Water Tankers' : 'e.g. Bangalore Water Supply Board (BWSSB)'}
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Volume in kL (1000L) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={volumeKl}
                onChange={(e) => setVolumeKl(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rate (₹ per kL) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Procurement / Invoice Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                required
                value={purchasedAt}
                onChange={(e) => setPurchasedAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-8 pr-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Computed Total Preview */}
          <div className="rounded-2xl border border-brand-200 dark:border-brand-900 bg-brand-50/50 dark:bg-brand-950/30 p-3 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Total Procurement Cost:</span>
            <span className="font-bold font-mono text-sm text-brand-600 dark:text-brand-400">
              ₹{(volumeKl * unitCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </form>
      </Modal>
    </div>
  );
};
