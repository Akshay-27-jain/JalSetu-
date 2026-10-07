import { useEffect, useRef, useState } from 'react';
import { Reveal } from '../Reveal';
import { authApi } from '../../services/api';
import { MainAdminStats } from '../../types';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  formatCommas?: boolean;
  start?: boolean;
}

function AnimatedCounter({
  value,
  duration = 2000,
  decimals = 0,
  formatCommas = false,
  start = true,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    if (!start) return;

    let startTimestamp: number | null = null;
    let frameId: number;

    const startValue = 0;
    const endValue = typeof value === 'number' && !isNaN(value) ? value : 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth Ease-Out Expo curve: fast initial burst, ultra-smooth landing
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration, start]);

  const safeNum = typeof displayValue === 'number' && !isNaN(displayValue) ? displayValue : 0;

  if (decimals > 0) {
    return <>{safeNum.toFixed(decimals)}</>;
  }

  const rounded = Math.round(safeNum);
  return <>{formatCommas ? rounded.toLocaleString() : rounded}</>;
}

export function StatsRibbon() {
  const [stats, setStats] = useState<MainAdminStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    authApi
      .getPlatformStats()
      .then((data) => {
        if (active && data) {
          setStats(data);
        }
      })
      .catch((err) => {
        console.warn('Unable to load live platform stats from DB, using baseline:', err);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Safety fallback so it always animates even if intersection doesn't trigger
    const timer = setTimeout(() => setIsVisible(true), 500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Values from PostgreSQL database with sensible baselines
  const communitiesCount = stats?.totalApartments ?? 120;
  const flatsCount = stats?.totalHouseholds ?? 18000;

  // Water tracked: if stats available, convert kL into Millions of Litres (ML)
  // e.g., 640.7 kL = 0.6 ML; 2500 kL = 2.5 ML
  const waterTrackedVal =
    stats?.totalConsumptionCurrentMonth != null
      ? stats.totalConsumptionCurrentMonth >= 1000
        ? stats.totalConsumptionCurrentMonth / 1000
        : stats.totalConsumptionCurrentMonth > 0
        ? stats.totalConsumptionCurrentMonth / 1000
        : 2.5
      : 2.5;

  const billingSpeedVal = 92.0;

  return (
    <section className="relative bg-white py-12" ref={containerRef}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          {/* Dark Navy Rounded Stats Card */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0B192C] p-8 sm:p-12 shadow-2xl text-white">
            {/* Subtle glow highlight */}
            <div className="pointer-events-none absolute -top-24 right-1/4 h-64 w-64 rounded-full bg-aqua-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />

            <div className="relative z-10 grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              {/* Stat 1: Communities onboarded */}
              <div className="text-left pt-4 sm:pt-0 sm:pl-0">
                <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  <AnimatedCounter
                    value={communitiesCount}
                    duration={1800}
                    formatCommas
                    start={isVisible}
                  />
                  <span className="text-aqua-300">+</span>
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-300/80 mt-2">
                  Communities onboarded
                </p>
              </div>

              {/* Stat 2: Flats monitored daily */}
              <div className="text-left pt-4 sm:pt-0 sm:pl-8">
                <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  <AnimatedCounter
                    value={flatsCount}
                    duration={2000}
                    formatCommas
                    start={isVisible}
                  />
                  <span className="text-aqua-300">+</span>
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-300/80 mt-2">
                  Flats monitored daily
                </p>
              </div>

              {/* Stat 3: Water tracked monthly */}
              <div className="text-left pt-4 sm:pt-0 sm:pl-8">
                <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  <AnimatedCounter
                    value={waterTrackedVal}
                    duration={2200}
                    decimals={1}
                    start={isVisible}
                  />
                  <span className="text-aqua-300">M L</span>
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-300/80 mt-2">
                  Water tracked monthly
                </p>
              </div>

              {/* Stat 4: Faster billing cycle */}
              <div className="text-left pt-4 sm:pt-0 sm:pl-8">
                <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  <AnimatedCounter
                    value={billingSpeedVal}
                    duration={2400}
                    decimals={1}
                    start={isVisible}
                  />
                  <span className="text-aqua-300">%</span>
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-300/80 mt-2">
                  Faster billing cycle
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
