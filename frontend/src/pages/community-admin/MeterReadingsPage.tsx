import React, { useState, useEffect, useRef } from 'react';
import { communityAdminApi, extractErrorMessage } from '../../services/api';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import {
  Gauge,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  ListFilter,
  Search,
  Calendar,
  Layers,
  History,
  TrendingUp,
  Plus,
  RefreshCw,
  ChevronDown,
  Check,
  X,
  Home,
  User,
} from 'lucide-react';
import type { Household, MeterReading, BulkUploadResult } from '../../types';

export const MeterReadingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'history'>('single');

  const [households, setHouseholds] = useState<Household[]>([]);
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);

  // Single Entry Form
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<number | ''>('');
  const [readingDate, setReadingDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [meterReadingKl, setMeterReadingKl] = useState<string>('');
  const [singleSubmitting, setSingleSubmitting] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);
  const [singleSuccess, setSingleSuccess] = useState<string | null>(null);

  // Searchable Flat & Meter Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [flatSearchQuery, setFlatSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Bulk Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkUploadResult | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // History Filter
  const [filterHouseholdId, setFilterHouseholdId] = useState<string>('ALL');
  const [historySearch, setHistorySearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [hList, rList] = await Promise.all([
        communityAdminApi.getHouseholds(),
        communityAdminApi.getMeterReadings(),
      ]);
      setHouseholds(hList);
      setReadings(rList);
      if (hList.length > 0 && selectedHouseholdId === '') {
        setSelectedHouseholdId(hList[0].id);
      }
    } catch (err) {
      console.error('Error loading meter data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered flats for searchable dropdown
  const filteredHouseholdsForSelect = households.filter((h) => {
    const q = flatSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      h.flatNumber.toLowerCase().includes(q) ||
      (h.meterSerialNumber && h.meterSerialNumber.toLowerCase().includes(q)) ||
      (h.residentName && h.residentName.toLowerCase().includes(q)) ||
      (h.residentEmail && h.residentEmail.toLowerCase().includes(q)) ||
      (h.residentPhone && h.residentPhone.toLowerCase().includes(q))
    );
  });

  // Compute live consumption preview for Single Entry
  const selectedHousehold = households.find((h) => h.id === selectedHouseholdId);
  const priorReading = selectedHousehold?.latestReadingKl;
  const currentReadingNum = parseFloat(meterReadingKl);
  let liveConsumptionPreview: string | null = null;
  let liveValidationError: string | null = null;

  if (!isNaN(currentReadingNum)) {
    if (priorReading !== undefined && priorReading !== null) {
      if (currentReadingNum < priorReading) {
        liveValidationError = `Reading (${currentReadingNum} kL) is lower than previous reading (${priorReading} kL). Meters only increase.`;
      } else {
        liveConsumptionPreview = `${(currentReadingNum - priorReading).toFixed(2)} kL`;
      }
    } else {
      liveConsumptionPreview = `${currentReadingNum.toFixed(2)} kL (Baseline: 0.00 kL)`;
    }
  }

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouseholdId || !readingDate || !meterReadingKl) {
      setSingleError('Please fill in all fields.');
      return;
    }

    const val = parseFloat(meterReadingKl);
    if (isNaN(val) || val < 0) {
      setSingleError('Meter reading must be a valid non-negative number.');
      return;
    }

    if (priorReading !== undefined && priorReading !== null && val < priorReading) {
      setSingleError(
        `Meter reading (${val} kL) cannot be lower than the previous recorded reading (${priorReading} kL).`
      );
      return;
    }

    try {
      setSingleSubmitting(true);
      setSingleError(null);
      setSingleSuccess(null);

      const saved = await communityAdminApi.logMeterReading({
        householdId: Number(selectedHouseholdId),
        readingDate,
        meterReadingKl: val,
      });

      const household = households.find((h) => h.id === Number(selectedHouseholdId));
      setSingleSuccess(
        `Successfully recorded reading of ${saved.meterReadingKl} kL for Flat ${saved.flatNumber} (Meter: ${household?.meterSerialNumber || `MTR-${saved.flatNumber}`})! Calculated consumption: ${saved.consumptionKl} kL.`
      );
      setMeterReadingKl('');
      loadData();
    } catch (err) {
      setSingleError(extractErrorMessage(err));
    } finally {
      setSingleSubmitting(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sampleFlats = households.map((h) => h.flatNumber);
    const flat1 = sampleFlats[0] || 'A-101';
    const flat2 = sampleFlats[1] || 'A-102';
    const today = new Date().toISOString().split('T')[0];

    const csvContent =
      'flat_number,reading_date,meter_reading_kl\n' +
      `${flat1},${today},125.5\n` +
      `${flat2},${today},89.0\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'meter_readings_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setBulkError('Please select a CSV file to upload.');
      return;
    }

    try {
      setBulkUploading(true);
      setBulkError(null);
      setBulkResult(null);

      const res = await communityAdminApi.bulkUploadCsv(selectedFile);
      setBulkResult(res);
      loadData();
    } catch (err) {
      setBulkError(extractErrorMessage(err));
    } finally {
      setBulkUploading(false);
    }
  };

  // History Pagination State
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);

  useEffect(() => {
    setHistoryPage(1);
  }, [filterHouseholdId, historySearch]);

  const filteredHistory = readings.filter((r) => {
    const matchesHousehold =
      filterHouseholdId === 'ALL' || r.householdId === Number(filterHouseholdId);
    const q = historySearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.flatNumber.toLowerCase().includes(q) ||
      (r.meterSerialNumber && r.meterSerialNumber.toLowerCase().includes(q)) ||
      r.readingDate.includes(q) ||
      r.source.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q);
    return matchesHousehold && matchesSearch;
  });

  const totalHistoryPages = Math.ceil(filteredHistory.length / historyPageSize) || 1;
  const paginatedHistory = filteredHistory.slice(
    (historyPage - 1) * historyPageSize,
    historyPage * historyPageSize
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Water Meter Readings Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log manual meter entries, bulk upload monthly CSV sheets, and track household usage history by meter serial.
          </p>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-white dark:bg-[#131B2E] text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Single Entry</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'bulk'
                ? 'bg-white dark:bg-[#131B2E] text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Bulk CSV Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white dark:bg-[#131B2E] text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Reading History</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SINGLE MANUAL ENTRY */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-[#131B2E] dark:border-slate-800 p-6 sm:p-8 shadow-card lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Log Single Meter Reading
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Search or select a residential flat and its assigned meter serial number to log today's dial reading.
              </p>
            </div>

            {singleError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800/60 p-3.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{singleError}</span>
              </div>
            )}

            {singleSuccess && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800/60 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>{singleSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSingleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* SEARCHABLE Flat & Meter Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Flat & Meter Serial <span className="text-rose-500">*</span>
                  </label>

                  {/* Dropdown Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white transition-all hover:bg-white dark:hover:bg-slate-800/70 hover:border-brand-400 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer text-left"
                  >
                    {selectedHousehold ? (
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="font-bold text-slate-900 dark:text-white shrink-0">Flat {selectedHousehold.flatNumber}</span>
                        <span className="text-slate-300 dark:text-slate-600 font-normal">•</span>
                        <span className="font-mono text-[11px] font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/50 px-1.5 py-0.5 rounded border border-brand-200/50 dark:border-brand-800/50 shrink-0 flex items-center gap-1">
                          <Gauge className="h-3 w-3 text-brand-600 dark:text-brand-400" />
                          {selectedHousehold.meterSerialNumber || `MTR-${selectedHousehold.flatNumber}`}
                        </span>
                        {selectedHousehold.residentName && (
                          <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                            ({selectedHousehold.residentName})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Select Flat & Meter...</span>
                    )}

                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''}`} />
                  </button>

                  {/* Dropdown Menu Popover */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] p-2 shadow-2xl animate-fade-in">
                      {/* Search Input Box */}
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search flat no, meter serial, resident..."
                          value={flatSearchQuery}
                          onChange={(e) => setFlatSearchQuery(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 focus:outline-none"
                        />
                        {flatSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setFlatSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {/* Header Count */}
                      <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <span>Residential Units</span>
                        <span>{filteredHouseholdsForSelect.length} flats found</span>
                      </div>

                      {/* Options List */}
                      <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {filteredHouseholdsForSelect.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                            No flat or meter matching "{flatSearchQuery}"
                          </div>
                        ) : (
                          filteredHouseholdsForSelect.map((h) => {
                            const isSelected = selectedHouseholdId === h.id;
                            return (
                              <button
                                key={h.id}
                                type="button"
                                onClick={() => {
                                  setSelectedHouseholdId(h.id);
                                  setIsDropdownOpen(false);
                                  setFlatSearchQuery('');
                                  setSingleError(null);
                                }}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-200 border border-brand-200/60 dark:border-brand-800/60 font-bold'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono font-bold text-xs ${
                                    isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {h.flatNumber}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900 dark:text-white">Flat {h.flatNumber}</span>
                                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                        <Gauge className="h-2.5 w-2.5 text-brand-500" />
                                        {h.meterSerialNumber || `MTR-${h.flatNumber}`}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                      {h.residentName ? h.residentName : 'Unregistered'}
                                      {h.latestReadingKl != null ? ` • Last: ${h.latestReadingKl} kL` : ''}
                                    </p>
                                  </div>
                                </div>

                                {isSelected && (
                                  <Check className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reading Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Reading Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      value={readingDate}
                      onChange={(e) => setReadingDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Meter Reading Value */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Meter Reading (kL) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Gauge className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={meterReadingKl}
                      onChange={(e) => {
                        setMeterReadingKl(e.target.value);
                        setSingleError(null);
                      }}
                      placeholder="e.g. 128.75"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-16 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <span className="absolute right-3.5 top-2.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                      kL
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Validation & Calculation Feedback Callout */}
              {liveValidationError ? (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-200 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Monotonic Sequence Violation</span>
                  </div>
                  <p>{liveValidationError}</p>
                </div>
              ) : liveConsumptionPreview ? (
                <div className="rounded-2xl border border-brand-100 dark:border-brand-900/60 bg-brand-50/50 dark:bg-brand-950/30 p-4 text-xs space-y-1 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Calculated Water Consumption:</span>
                    <span className="font-mono text-base font-extrabold text-brand-700 dark:text-brand-300">
                      {liveConsumptionPreview}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span>
                      Previous Recorded Dial: {priorReading !== undefined ? `${priorReading} kL` : 'None'}
                    </span>
                    <span>
                      New Dial: {Number(currentReadingNum ?? 0).toFixed(2)} kL
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={singleSubmitting || !!liveValidationError}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>{singleSubmitting ? 'Logging...' : 'Submit Validated Reading'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Info Column */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-[#131B2E] dark:border-slate-800 p-6 shadow-card space-y-4">
              <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                Selected Unit Details
              </h4>
              {selectedHousehold ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Flat Unit</span>
                    <span className="font-bold text-slate-900 dark:text-white">Flat {selectedHousehold.flatNumber}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Meter Serial</span>
                    <span className="font-mono font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded">
                      {selectedHousehold.meterSerialNumber || `MTR-${selectedHousehold.flatNumber}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Occupant Name</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedHousehold.residentName || 'Unregistered'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Last Recorded Dial</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedHousehold.latestReadingKl != null
                        ? `${selectedHousehold.latestReadingKl} kL`
                        : 'No logs yet'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Month Consumption</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      {selectedHousehold.currentMonthConsumptionKl != null
                        ? `${selectedHousehold.currentMonthConsumptionKl} kL`
                        : '0.00 kL'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">No household selected.</p>
              )}
            </div>

            <div className="rounded-2xl border border-sky-100 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/30 p-5 text-xs text-sky-900 dark:text-sky-300 space-y-2">
              <h5 className="font-bold flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                Monotonic Meter Validation
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                JalSetu strictly verifies that every new dial reading is greater than or equal to the previous log, ensuring accurate calculation without meter reversal anomalies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULK CSV UPLOAD */}
      {activeTab === 'bulk' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-[#131B2E] dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Bulk CSV Meter Upload
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload your community monthly sheet in CSV format to import multiple meter readings in one step.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {bulkError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800/60 p-3.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{bulkError}</span>
            </div>
          )}

          <form onSubmit={handleBulkUpload} className="space-y-6">
            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-8 text-center hover:border-brand-400 dark:hover:border-brand-500 transition-colors">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-brand-500 mb-3" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {selectedFile ? selectedFile.name : 'Select or drag & drop CSV file here'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                CSV headers must contain: <code className="font-mono text-slate-700 dark:text-slate-300">flat_number, reading_date, meter_reading_kl</code>
              </p>
              <input
                type="file"
                accept=".csv"
                id="csvFileInput"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="csvFileInput"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-brand-700 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Browse Local CSV</span>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!selectedFile || bulkUploading}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
              >
                {bulkUploading ? 'Validating & Importing...' : 'Validate & Import CSV Readings'}
              </button>
            </div>
          </form>

          {/* Bulk Upload Results */}
          {bulkResult && (
            <div className="space-y-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5 animate-fade-in">
              <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                Upload Validation Summary
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white dark:bg-[#131B2E] p-3 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Total Rows</p>
                  <p className="font-display text-base font-bold text-slate-900 dark:text-white">{bulkResult.totalProcessed}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Successfully Imported</p>
                  <p className="font-display text-base font-bold text-emerald-800 dark:text-emerald-200">{bulkResult.successCount}</p>
                </div>
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 border border-rose-200 dark:border-rose-800">
                  <p className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Failed / Rejected</p>
                  <p className="font-display text-base font-bold text-rose-800 dark:text-rose-200">{bulkResult.failureCount}</p>
                </div>
              </div>

              {bulkResult.failedRows.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    <span>The following rows could not be processed due to validation errors:</span>
                  </p>
                  <div className="overflow-x-auto rounded-2xl border border-rose-100 dark:border-rose-900/50">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-rose-50/70 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3.5">Row #</th>
                          <th className="py-2.5 px-3.5">Flat Number</th>
                          <th className="py-2.5 px-3.5">Reading Date</th>
                          <th className="py-2.5 px-3.5">Submitted Value</th>
                          <th className="py-2.5 px-3.5">Rejection Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100 dark:divide-rose-900/40 bg-white dark:bg-[#131B2E] text-slate-700 dark:text-slate-300 font-medium">
                        {bulkResult.failedRows.map((f, idx) => (
                          <tr key={idx} className="hover:bg-rose-50/30 dark:hover:bg-rose-950/20">
                            <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">Row {f.row}</td>
                            <td className="py-2.5 px-3.5 font-mono">{f.flatNumber || 'N/A'}</td>
                            <td className="py-2.5 px-3.5">{f.readingDate || 'N/A'}</td>
                            <td className="py-2.5 px-3.5 font-bold">{f.meterReading ? `${f.meterReading} kL` : 'N/A'}</td>
                            <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400 font-medium">{f.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>All {bulkResult.successCount} rows were validated and recorded successfully without any errors!</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: READING HISTORY */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-[#131B2E] dark:border-slate-800 p-6 shadow-card space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Community Meter Readings Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit trail of all validated manual and CSV meter reading submissions
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Household selector filter */}
              <select
                value={filterHouseholdId}
                onChange={(e) => setFilterHouseholdId(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Households</option>
                {households.map((h) => (
                  <option key={h.id} value={h.id}>
                    Flat {h.flatNumber} ({h.meterSerialNumber || `MTR-${h.flatNumber}`})
                  </option>
                ))}
              </select>

              {/* Search by Flat, Meter Serial Number, or Date */}
              <div className="relative w-64 sm:w-80">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Flat, Meter No, Date..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              No matching meter readings found for "{historySearch}".
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Log ID</th>
                      <th className="py-3 px-4">Flat Unit</th>
                      <th className="py-3 px-4">Meter Serial No.</th>
                      <th className="py-3 px-4">Reading Date</th>
                      <th className="py-3 px-4">Meter Reading</th>
                      <th className="py-3 px-4">Consumption</th>
                      <th className="py-3 px-4">Upload Source</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {paginatedHistory.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-brand-600 dark:text-brand-400 font-semibold">
                          LOG-{log.id}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          Flat {log.flatNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">
                            <Gauge className="h-3 w-3 text-brand-500" />
                            <span>{log.meterSerialNumber || `MTR-${log.flatNumber}`}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.readingDate}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                          {log.meterReadingKl} kL
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white tabular-nums">
                          {log.consumptionKl} kL
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                            {log.source}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge
                            variant={log.status === 'Overuse' ? 'overuse' : 'normal'}
                            size="sm"
                          >
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={historyPage}
                totalPages={totalHistoryPages}
                totalItems={filteredHistory.length}
                itemsPerPage={historyPageSize}
                onPageChange={setHistoryPage}
                onItemsPerPageChange={(newSize) => {
                  setHistoryPageSize(newSize);
                  setHistoryPage(1);
                }}
                itemsPerPageOptions={[10, 25, 50, 100]}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
