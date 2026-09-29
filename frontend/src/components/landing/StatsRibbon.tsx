import { Reveal } from '../Reveal';

export function StatsRibbon() {
  return (
    <section className="relative bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          {/* Dark Navy Rounded Stats Card — top 'secure by design' text removed */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0B192C] p-8 sm:p-12 shadow-2xl text-white">
            {/* Subtle glow highlight */}
            <div className="pointer-events-none absolute -top-24 right-1/4 h-64 w-64 rounded-full bg-aqua-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />

            <div className="relative z-10 grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              {/* Stat 1 */}
              <div className="text-left pt-4 sm:pt-0 sm:pl-0">
                <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  120<span className="text-aqua-300">+</span>
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-300/80 mt-2">
                  Communities onboarded
                </p>
              </div>

              {/* Stat 2 */}
              <div className="text-left pt-4 sm:pt-0 sm:pl-8">
                <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  18,000<span className="text-aqua-300">+</span>
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-300/80 mt-2">
                  Flats monitored daily
                </p>
              </div>

              {/* Stat 3 */}
              <div className="text-left pt-4 sm:pt-0 sm:pl-8">
                <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  2.5<span className="text-aqua-300">M L</span>
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-300/80 mt-2">
                  Water tracked monthly
                </p>
              </div>

              {/* Stat 4 */}
              <div className="text-left pt-4 sm:pt-0 sm:pl-8">
                <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  92.<span className="text-aqua-300">0%</span>
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
