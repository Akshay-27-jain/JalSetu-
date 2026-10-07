import React, { useState, useEffect } from 'react';
import { residentApi, extractErrorMessage } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Badge } from '../../components/Badge';
import {
  Gauge,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  History,
  Droplets,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  Download,
} from 'lucide-react';
import { exportMeterReadingsToCsv } from '../../utils/exportUtils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { MeterReading } from '../../types';

export const UsageHistoryPage: React.FC = () => {
  const { t } = useLanguage();
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSelfReport, setShowSelfReport] = useState(false);

  // Entry Form
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meterReadingKl, setMeterReadingKl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const data = await residentApi.getMeterReadings();
      setReadings(data);
    } catch (err) {
      console.error('Failed to load readings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const latestPrior = readings.length > 0 ? readings[0].meterReadingKl : null;
  const currentReadingNum = parseFloat(meterReadingKl);
  let livePreview: string | null = null;
  let liveValidationError: string | null = null;

  if (!isNaN(currentReadingNum)) {
    if (latestPrior !== null) {
      if (currentReadingNum < latestPrior) {
        liveValidationError = `Reading (${currentReadingNum} kL) is lower than your previous recorded meter dial (${latestPrior} kL). Meters only increase.`;
      } else {
        livePreview = `${(currentReadingNum - latestPrior).toFixed(2)} kL`;
      }
    } else {
      livePreview = `${currentReadingNum.toFixed(2)} kL (Baseline: 0.00 kL)`;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readingDate || !meterReadingKl) {
      setFormError('Please fill in both the reading date and meter reading value.');
      return;
    }

    const val = parseFloat(meterReadingKl);
    if (isNaN(val) || val < 0) {
      setFormError('Meter reading must be a valid positive number.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      setFormSuccess(null);

      const res = await residentApi.logMeterReading({
        readingDate,
        meterReadingKl: val,
      });

      setFormSuccess(
        `Reading of ${res.meterReadingKl} kL logged successfully! Calculated usage: ${res.consumptionKl} kL.`
      );
      setMeterReadingKl('');
      fetchReadings();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregations
  const totalConsumption = readings.reduce((acc, r) => acc + r.consumptionKl, 0);
  const avgDaily = readings.length > 0 ? (totalConsumption / readings.length).toFixed(2) : '0.00';
  const overuseCount = readings.filter((r) => r.status === 'Overuse').length;

  const chartData = [...readings].reverse().map((r) => ({
    date: r.readingDate,
    consumption: r.consumptionKl,
    meter: r.meterReadingKl,
    status: r.status,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            {t('usageHistory', 'Water Usage & Meter Reading History')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological audit of verified daily household water readings and consumption logs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => exportMeterReadingsToCsv(readings, readings[0]?.flatNumber || 'MyFlat')}
            disabled={readings.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowSelfReport(!showSelfReport)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 shadow-brand-500/25 active:scale-95 transition-all cursor-pointer w-fit"
          >
            <Plus className="h-4 w-4" />
            <span>{showSelfReport ? 'Hide Reading Form' : 'Log Water Reading'}</span>
            {showSelfReport ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5 text-brand-500" /> Total Recorded Volume
          </span>
          <p className="text-xl font-bold font-display text-slate-900 dark:text-white tabular-nums">
            {totalConsumption.toFixed(2)} kL
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Across all recorded cycles</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Daily Average Usage
          </span>
          <p className="text-xl font-bold font-display text-slate-900 dark:text-white tabular-nums">
            {avgDaily} kL / day
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Standard household benchmark</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Overuse Records
          </span>
          <p className="text-xl font-bold font-display text-slate-900 dark:text-white tabular-nums">
            {overuseCount} Days
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Days exceeding 1.2 kL threshold</p>
        </div>
      </div>

      {/* Optional Self-Report Form (Collapsible) */}
      {showSelfReport && (
        <div className="rounded-2xl border border-brand-200 dark:border-brand-800/80 bg-brand-50/40 dark:bg-brand-950/20 p-6 shadow-sm animate-fade-in space-y-4">
          <div className="flex items-center gap-2 text-brand-900 dark:text-brand-300 font-bold text-sm">
            <Gauge className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span>Self-Report Meter Reading</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Official readings are logged by community maintenance. Use this form if you wish to record an interim reading yourself.
          </p>

          {formError && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reading Date</label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Meter Dial Value (kL)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder={latestPrior ? `Current: ${latestPrior} kL` : 'e.g. 105.50'}
                value={meterReadingKl}
                onChange={(e) => setMeterReadingKl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 font-bold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Reading'}</span>
              </button>
            </div>
          </form>

          {livePreview && (
            <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-brand-100 dark:border-brand-800 text-xs text-brand-800 dark:text-brand-300 font-semibold flex items-center justify-between">
              <span>Calculated Usage for this entry:</span>
              <span className="text-sm font-bold text-brand-700 dark:text-brand-400">{livePreview}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Consumption Trend Graph */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Daily Water Consumption Trend (kL)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Volume consumed between verified meter readings
            </p>
          </div>
          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Tier Threshold: 1.2 kL/day
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Droplets className="h-9 w-9 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No consumption records available</p>
            <p className="text-[11px] text-slate-400">Records logged by the community admin will appear here.</p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] p-3 shadow-lg text-xs space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">{d.date}</p>
                          <p className="text-brand-600 dark:text-brand-400 font-bold tabular-nums">Volume Consumed: {d.consumption} kL</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] tabular-nums">Cumulative Meter: {d.meter} kL</p>
                          <Badge variant={d.status === 'Overuse' ? 'overuse' : 'normal'} size="sm">
                            {d.status}
                          </Badge>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="#0284C7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#usageGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Verified Consumption Records Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Verified Water Usage Records
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official readings recorded by community administration or self-reported
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {readings.length} Total Records
          </span>
        </div>

        {readings.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            No consumption records logged for your flat yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Log ID</th>
                  <th className="py-3 px-4">Reading Date</th>
                  <th className="py-3 px-4 font-bold text-brand-700 dark:text-brand-400">Water Consumed (kL)</th>
                  <th className="py-3 px-4">Meter Dial (kL)</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                {readings.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-brand-600 dark:text-brand-400 font-semibold">
                      LOG-{r.id}
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                      {r.readingDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                      <span className={r.status === 'Overuse' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}>
                        {r.consumptionKl.toLocaleString()} kL
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 tabular-nums">
                      {r.meterReadingKl.toLocaleString()} kL
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-semibold">
                        {r.source === 'MANUAL' ? 'Admin / Manual' : r.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={r.status === 'Overuse' ? 'overuse' : 'normal'} size="sm">
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
