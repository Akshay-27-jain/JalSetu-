import React, { useState } from 'react';
import {
  Droplets,
  TrendingDown,
  TrendingUp,
  Award,
  Sparkles,
  Users,
  Home,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Target,
  Zap,
  IndianRupee,
  Share2,
  Activity,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

interface ConsumptionComparisonProps {
  householdUsageKl?: number;
  communityAvgKl?: number;
  apartmentAverageKl?: number;
  similarHouseholdAverageKl?: number;
  flatNumber?: string;
  occupancyCount?: number;
  areaSqft?: number;
}

export const ConsumptionComparisonView: React.FC<ConsumptionComparisonProps> = ({
  householdUsageKl = 0,
  communityAvgKl,
  apartmentAverageKl,
  similarHouseholdAverageKl,
  flatNumber = 'Flat',
  occupancyCount = 3,
  areaSqft = 1200,
}) => {
  const { t } = useLanguage();
  const [selectedBenchmarkTab, setSelectedBenchmarkTab] = useState<'COMMUNITY' | 'SIMILAR_HOMES' | 'PER_CAPITA'>('SIMILAR_HOMES');

  // Normalized values
  const myUsage = Math.max(0, householdUsageKl ?? 0);
  const commAvg = Math.max(1, communityAvgKl ?? apartmentAverageKl ?? 17.2);
  const occupants = Math.max(1, occupancyCount || 3);

  // Similar sized flats baseline (standard ~5.2 kL per occupant per month)
  const similarHomesBenchmark = similarHouseholdAverageKl ?? parseFloat((occupants * 5.2).toFixed(1));

  // Targets
  const topEfficientCommBenchmark = parseFloat((commAvg * 0.58).toFixed(1));
  const topEfficientSimilarBenchmark = parseFloat((similarHomesBenchmark * 0.60).toFixed(1));

  // Daily per capita calculation (Liters / person / day)
  const myDailyPerCapita = Math.round((myUsage * 1000) / (occupants * 30));
  const similarDailyPerCapita = Math.round((similarHomesBenchmark * 1000) / (occupants * 30));
  const cpheeoStandardDaily = 135; // Ministry of Housing & Urban Affairs / CPHEEO benchmark for urban apartments
  const efficientDailyTarget = 95; // Water efficient standard

  // Active baseline & target based on selected tab
  const activeBaseline =
    selectedBenchmarkTab === 'COMMUNITY'
      ? commAvg
      : selectedBenchmarkTab === 'SIMILAR_HOMES'
      ? similarHomesBenchmark
      : cpheeoStandardDaily;

  const activeTarget =
    selectedBenchmarkTab === 'COMMUNITY'
      ? topEfficientCommBenchmark
      : selectedBenchmarkTab === 'SIMILAR_HOMES'
      ? topEfficientSimilarBenchmark
      : efficientDailyTarget;

  // Efficiency Scoring & Grading relative to active cohort
  const computeEfficiency = () => {
    let diffPercent = 0;
    let comparisonLabel = '';

    if (selectedBenchmarkTab === 'COMMUNITY') {
      diffPercent = ((myUsage - commAvg) / commAvg) * 100;
      comparisonLabel = 'the society average';
    } else if (selectedBenchmarkTab === 'SIMILAR_HOMES') {
      diffPercent = ((myUsage - similarHomesBenchmark) / similarHomesBenchmark) * 100;
      comparisonLabel = `other ${occupants}-person flats (~${(similarHomesBenchmark / occupants).toFixed(1)} kL/person avg)`;
    } else {
      diffPercent = ((myDailyPerCapita - cpheeoStandardDaily) / cpheeoStandardDaily) * 100;
      comparisonLabel = `the CPHEEO standard (135 L/person/day)`;
    }

    if (diffPercent <= -25) {
      return {
        grade: 'A+',
        title: 'Water Conservation Champion',
        badgeColor: 'bg-emerald-500 text-white',
        bannerBg: 'from-emerald-500/10 via-emerald-50 to-teal-50/40 border-emerald-300 dark:from-emerald-950/40 dark:to-slate-900 dark:border-emerald-800',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        score: 96,
        description: `Outstanding! Your flat consumes ${Math.abs(Math.round(diffPercent))}% less water than ${comparisonLabel}.`,
      };
    }
    if (diffPercent <= 0) {
      return {
        grade: 'A',
        title: 'Efficient Water Saver',
        badgeColor: 'bg-sky-600 text-white',
        bannerBg: 'from-sky-500/10 via-blue-50 to-indigo-50/40 border-sky-300 dark:from-sky-950/40 dark:to-slate-900 dark:border-sky-800',
        textColor: 'text-sky-700 dark:text-sky-300',
        score: 85,
        description: `Great job! Your consumption is ${Math.abs(Math.round(diffPercent))}% below ${comparisonLabel}.`,
      };
    }
    if (diffPercent <= 25) {
      return {
        grade: 'B',
        title: 'Moderate / Normal Usage',
        badgeColor: 'bg-amber-500 text-white',
        bannerBg: 'from-amber-500/10 via-amber-50 to-orange-50/40 border-amber-300 dark:from-amber-950/40 dark:to-slate-900 dark:border-amber-800',
        textColor: 'text-amber-700 dark:text-amber-300',
        score: 68,
        description: `Your flat consumes ${Math.round(diffPercent)}% more water than ${comparisonLabel}. Minor reductions can drop you into subsidized slabs.`,
      };
    }
    return {
      grade: 'C',
      title: 'High Consumption Alert',
      badgeColor: 'bg-rose-600 text-white',
      bannerBg: 'from-rose-500/10 via-rose-50 to-amber-50/40 border-rose-300 dark:from-rose-950/40 dark:to-slate-900 dark:border-rose-800',
      textColor: 'text-rose-700 dark:text-rose-300',
      score: 45,
      description: `High usage detected (${Math.round(diffPercent)}% above ${comparisonLabel}). Risk of higher volumetric slab rates or concealed fixture leaks.`,
    };
  };

  const efficiency = computeEfficiency();

  // Dynamic Chart Data generation based on selected tab
  const getChartData = () => {
    if (selectedBenchmarkTab === 'COMMUNITY') {
      return [
        {
          name: `My Flat (${flatNumber})`,
          usage: myUsage,
          fill: '#0284c7', // Sky Blue
          subtitle: `${(myUsage * 1000).toLocaleString()} Liters`,
          badge: 'You',
        },
        {
          name: 'Society Average',
          usage: commAvg,
          fill: '#64748b', // Slate Gray
          subtitle: `${(commAvg * 1000).toLocaleString()} Liters`,
          badge: 'All Flats',
        },
        {
          name: 'Top 10% Savers Target',
          usage: topEfficientCommBenchmark,
          fill: '#10b981', // Emerald
          subtitle: `${(topEfficientCommBenchmark * 1000).toLocaleString()} Liters`,
          badge: 'Society Star',
        },
      ];
    }

    if (selectedBenchmarkTab === 'SIMILAR_HOMES') {
      return [
        {
          name: `My Flat (${flatNumber})`,
          usage: myUsage,
          fill: '#0284c7', // Sky Blue
          subtitle: `~${(myUsage / occupants).toFixed(1)} kL/person`,
          badge: `${occupants} Persons`,
        },
        {
          name: `${occupants}-Person Flats Avg`,
          usage: similarHomesBenchmark,
          fill: '#6366f1', // Indigo
          subtitle: `5.2 kL/person avg`,
          badge: 'Peer Group',
        },
        {
          name: `Efficient ${occupants}-Person Target`,
          usage: topEfficientSimilarBenchmark,
          fill: '#10b981', // Emerald
          subtitle: `3.1 kL/person target`,
          badge: 'Top 10% Peer',
        },
      ];
    }

    // PER_CAPITA Daily Liters
    return [
      {
        name: `My Flat (${flatNumber})`,
        usage: myDailyPerCapita,
        fill: '#0284c7',
        subtitle: `${myDailyPerCapita} L/person/day`,
        badge: 'Current',
      },
      {
        name: `${occupants}-Person Peer Avg`,
        usage: similarDailyPerCapita,
        fill: '#6366f1',
        subtitle: `${similarDailyPerCapita} L/person/day`,
        badge: 'Peer Avg',
      },
      {
        name: 'CPHEEO Benchmark',
        usage: cpheeoStandardDaily,
        fill: '#64748b',
        subtitle: '135 L/person/day standard',
        badge: 'National Std',
      },
      {
        name: 'Eco-Champion Target',
        usage: efficientDailyTarget,
        fill: '#10b981',
        subtitle: '95 L/person/day',
        badge: 'Water Star',
      },
    ];
  };

  const chartData = getChartData();

  // Potential monthly financial savings calculation
  const potentialSavingsKl =
    selectedBenchmarkTab === 'PER_CAPITA'
      ? Math.max(0, ((myDailyPerCapita - cpheeoStandardDaily) * occupants * 30) / 1000)
      : Math.max(0, myUsage - activeTarget);
  const potentialSavingsInr = Math.round(potentialSavingsKl * 28.0); // Avg Tier 2 rate ₹28/kL

  return (
    <div className="space-y-6">
      {/* 1. Header & Efficiency Grade Card */}
      <div className={`rounded-3xl border p-6 bg-gradient-to-r shadow-md transition-all ${efficiency.bannerBg}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md dark:bg-slate-800">
              <Award className="h-9 w-9 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className={`rounded-xl px-3 py-1 font-black text-sm uppercase tracking-wider ${efficiency.badgeColor}`}>
                  {t('grade', 'Grade')} {efficiency.grade}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {efficiency.title}
                </h3>
              </div>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                {efficiency.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-white/80 dark:bg-slate-800/80 px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('conservationScore', 'Conservation Score')}
              </div>
              <div className="font-black text-2xl text-blue-600 dark:text-blue-400">
                {efficiency.score}<span className="text-xs font-semibold text-slate-400">/100</span>
              </div>
            </div>
            <div className="h-10 w-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {selectedBenchmarkTab === 'PER_CAPITA' ? t('dailyPerPerson', 'Daily Per Person') : t('myConsumption', 'My Consumption')}
              </div>
              <div className="font-extrabold text-base text-slate-800 dark:text-white">
                {selectedBenchmarkTab === 'PER_CAPITA' ? (
                  <>
                    {myDailyPerCapita} <span className="text-xs font-normal text-slate-500">L/day</span>
                  </>
                ) : (
                  <>
                    {myUsage.toFixed(1)} <span className="text-xs font-normal text-slate-500">kL</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Peer Benchmarking Interactive Bar Chart */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              {t('peerBenchmarkingCommunity', 'Peer Benchmarking & Community Comparison')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedBenchmarkTab === 'COMMUNITY' && `Compare Flat ${flatNumber} against all society apartments & overall average`}
              {selectedBenchmarkTab === 'SIMILAR_HOMES' && `Compare Flat ${flatNumber} against other ${occupants}-person units in your apartment`}
              {selectedBenchmarkTab === 'PER_CAPITA' && `Compare your daily per-person consumption against national CPHEEO standards`}
            </p>
          </div>

          {/* Interactive Cohort Filter Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <button
              onClick={() => setSelectedBenchmarkTab('COMMUNITY')}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                selectedBenchmarkTab === 'COMMUNITY'
                  ? 'bg-white text-blue-700 shadow-xs font-bold dark:bg-slate-700 dark:text-white'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('allCommunity', 'All Community')}
            </button>
            <button
              onClick={() => setSelectedBenchmarkTab('SIMILAR_HOMES')}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                selectedBenchmarkTab === 'SIMILAR_HOMES'
                  ? 'bg-white text-blue-700 shadow-xs font-bold dark:bg-slate-700 dark:text-white'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {occupants}-{t('personUnits', 'Person Units')}
            </button>
            <button
              onClick={() => setSelectedBenchmarkTab('PER_CAPITA')}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                selectedBenchmarkTab === 'PER_CAPITA'
                  ? 'bg-white text-blue-700 shadow-xs font-bold dark:bg-slate-700 dark:text-white'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('lPersonDay', 'L/Person/Day')}
            </button>
          </div>
        </div>

        {/* Recharts Dynamic Bar Chart */}
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                unit={selectedBenchmarkTab === 'PER_CAPITA' ? ' L' : ' kL'}
              />
              <Tooltip
                cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl text-xs dark:border-slate-700 dark:bg-slate-800">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-slate-800 dark:text-white">{d.name}</span>
                          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {d.badge}
                          </span>
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 font-extrabold text-sm mt-1">
                          {d.usage} {selectedBenchmarkTab === 'PER_CAPITA' ? 'Liters/day' : 'kL'}
                          <span className="text-[11px] font-normal text-slate-500 ml-1.5">({d.subtitle})</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={activeBaseline}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                label={{
                  value:
                    selectedBenchmarkTab === 'COMMUNITY'
                      ? `Society Avg (${commAvg} kL)`
                      : selectedBenchmarkTab === 'SIMILAR_HOMES'
                      ? `${occupants}-Person Avg (${similarHomesBenchmark} kL)`
                      : `CPHEEO (135 L/d)`,
                  fill: '#94a3b8',
                  fontSize: 10,
                  position: 'top',
                }}
              />
              <Bar dataKey="usage" radius={[12, 12, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Benchmark Quick Summary Chips */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Card 1: Your Metric */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/70 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Home className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">
                {selectedBenchmarkTab === 'PER_CAPITA' ? 'Your Daily Per Person' : 'Your Monthly Dial'}
              </div>
              <div className="font-bold text-slate-900 dark:text-white">
                {selectedBenchmarkTab === 'PER_CAPITA' ? (
                  `${myDailyPerCapita} L / person / day`
                ) : (
                  `${myUsage.toFixed(1)} kL (${(myUsage / occupants).toFixed(1)} kL/person)`
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Cohort Benchmark */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-600 text-white">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">
                {selectedBenchmarkTab === 'COMMUNITY' && 'Society Benchmark'}
                {selectedBenchmarkTab === 'SIMILAR_HOMES' && `${occupants}-Person Benchmark`}
                {selectedBenchmarkTab === 'PER_CAPITA' && 'National CPHEEO Benchmark'}
              </div>
              <div className="font-bold text-slate-900 dark:text-white">
                {selectedBenchmarkTab === 'COMMUNITY' && `${commAvg.toFixed(1)} kL / flat`}
                {selectedBenchmarkTab === 'SIMILAR_HOMES' && `${similarHomesBenchmark.toFixed(1)} kL / flat (5.2 kL/person)`}
                {selectedBenchmarkTab === 'PER_CAPITA' && `135 L / person / day`}
              </div>
            </div>
          </div>

          {/* Card 3: Efficient Star Target */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">
                {selectedBenchmarkTab === 'COMMUNITY' && 'Top 10% Savers Target'}
                {selectedBenchmarkTab === 'SIMILAR_HOMES' && `Top ${occupants}-Person Target`}
                {selectedBenchmarkTab === 'PER_CAPITA' && 'Eco-Efficient Goal'}
              </div>
              <div className="font-bold text-emerald-700 dark:text-emerald-300">
                {selectedBenchmarkTab === 'COMMUNITY' && `${topEfficientCommBenchmark.toFixed(1)} kL / month`}
                {selectedBenchmarkTab === 'SIMILAR_HOMES' && `${topEfficientSimilarBenchmark.toFixed(1)} kL / month (3.1 kL/person)`}
                {selectedBenchmarkTab === 'PER_CAPITA' && `95 L / person / day`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Monthly Savings Estimator & Conservation Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Savings Card */}
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 p-6 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-2.5 font-bold text-indigo-950 dark:text-indigo-200">
            <IndianRupee className="h-5 w-5 text-indigo-600" />
            <h4>Conservation Financial Payoff</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {selectedBenchmarkTab === 'SIMILAR_HOMES'
              ? `By aligning your ${occupants}-person household usage with top-performing peer flats, you prevent volumetric slab step-ups.`
              : 'By optimizing your household water usage to match high-efficiency flats, you can prevent tier surge penalties.'}
          </p>

          <div className="mt-5 flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Potential Bill Reduction
              </div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                ₹{potentialSavingsInr} <span className="text-xs font-normal text-slate-400">/ month</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Volume Conserved
              </div>
              <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                ~{potentialSavingsKl.toFixed(1)} kL / cycle
              </div>
            </div>
          </div>
        </div>

        {/* Fast Action Checklist */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Target className="h-5 w-5 text-blue-600" />
            <h4>Quick Water Saving Targets for {occupants}-Person Flat</h4>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-200">🚰 Install aerator on kitchen faucet</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Save ~15 L/day</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-200">🚿 4-minute bucket shower challenge ({occupants} persons)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Save ~{occupants * 25} L/day</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-200">🧼 Run washing machine at full capacity</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Save ~40 L/load</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionComparisonView;
