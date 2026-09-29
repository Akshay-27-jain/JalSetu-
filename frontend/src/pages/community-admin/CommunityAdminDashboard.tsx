import React, { useState, useEffect } from 'react';
import { communityAdminApi, extractErrorMessage } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Users, Gauge, AlertCircle, Droplets, ArrowUpRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CommunityAdminDashboard as DashboardData } from '../../types';

export const CommunityAdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await communityAdminApi.getDashboard();
      setData(res);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const barColors = ['#0284C7', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {data?.apartmentName || 'Paras Garden'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('waterMonitoringPortal', 'Water Usage & Automated Conservation Monitoring System')}
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('totalHouseholds', 'Total Households')}
          value={data?.totalHouseholds ?? '--'}
          subtitle={`${data?.meteredHouseholds ?? 0} actively metered`}
          icon={Users}
          iconBgColor="bg-brand-50 dark:bg-brand-950/50"
          iconColor="text-brand-600 dark:text-brand-400"
        />
        <StatCard
          title={t('currentMonthUsage', 'Current Month Usage')}
          value={data ? `${data.currentMonthConsumption} kL` : '--'}
          subtitle="Metered apartment volume"
          icon={Droplets}
          iconBgColor="bg-sky-50 dark:bg-sky-950/50"
          iconColor="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          title={t('activeAlerts', 'Active Alerts')}
          value={data?.activeAlertsCount ?? '--'}
          subtitle={data?.activeAlertsCount ? `${data.activeAlertsCount} require attention` : 'All normal'}
          icon={AlertCircle}
          iconBgColor="bg-amber-50 dark:bg-amber-950/50"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title={t('avgDailyUsage', 'Avg Daily Usage')}
          value={data ? `${data.avgDailyUsage} kL` : '--'}
          subtitle="Community daily average"
          icon={Gauge}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Center Charts & Alerts Split Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top 6 Consumers Bar Chart */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131B2E] p-6 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {t('top6Flats', 'Monthly Consumption by Household (kL) — Top 6')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('consumptionTrends', 'Metered water usage for the current billing cycle')}
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">kL (Kiloliters)</span>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            </div>
          ) : !data?.topConsumers || data.topConsumers.length === 0 ? (
            <EmptyState
              icon={Droplets}
              title="No consumption logs recorded this cycle"
              description="Readings will appear here once submitted by residents or administrators."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topConsumers} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="flatNumber"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.15)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] p-2.5 shadow-dropdown text-xs">
                            <p className="font-bold text-slate-900 dark:text-white">{payload[0].payload.flatNumber}</p>
                            <p className="text-brand-600 dark:text-brand-400 font-semibold">{payload[0].value} kL</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="consumptionKl" radius={[6, 6, 0, 0]}>
                    {data.topConsumers.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Active Alerts Panel */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131B2E] p-6 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t('activeAlerts', 'Active Alerts')}
            </h3>
            <Badge variant="overuse" size="sm" dot>
              {data?.activeAlerts?.length || 0} alerts
            </Badge>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
            {!data?.activeAlerts || data.activeAlerts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-8">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">No active alerts</p>
                <p className="text-[11px] text-slate-400">All community meters operating within standard range.</p>
              </div>
            ) : (
              data.activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col gap-1 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{alert.flatNumber}</span>
                    <Badge
                      variant={
                        alert.type === 'OVERUSE'
                          ? 'overuse'
                          : alert.type === 'ANOMALY'
                          ? 'anomaly'
                          : 'billing'
                      }
                      size="sm"
                      dot
                    >
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{alert.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {new Date(alert.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Usage Logs Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131B2E] p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t('recentUsageLogs', 'Recent Usage Logs')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest household meter readings logged across the community
            </p>
          </div>
        </div>

        {!data?.recentLogs || data.recentLogs.length === 0 ? (
          <EmptyState
            icon={Gauge}
            title="No meter readings recorded yet"
            description="Submitted meter logs will be indexed here automatically."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Log ID</th>
                  <th className="py-3 px-4">Flat Unit</th>
                  <th className="py-3 px-4">Reading Date</th>
                  <th className="py-3 px-4">Meter Reading (kL)</th>
                  <th className="py-3 px-4">Consumption (kL)</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-200">
                {data.recentLogs.map((log) => (
                  <tr key={log.id} className="table-row">
                    <td className="py-3.5 px-4 font-mono text-brand-600 dark:text-brand-400 font-semibold">
                      LOG-{log.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {log.flatNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {log.readingDate}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                      {log.meterReadingKl.toLocaleString()} kL
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white tabular-nums">
                      {log.consumptionKl.toLocaleString()} kL
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700">
                        {log.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant={log.status === 'Overuse' ? 'overuse' : 'normal'} size="sm" dot>
                        {log.status}
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
