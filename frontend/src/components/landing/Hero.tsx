import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { PwaInstallButton } from '../PwaInstallButton';
import { gsap } from 'gsap';
import landingBgImg from '../../assets/landing-bg.jpg';

export function Hero() {
  const headlineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(tagRef.current,       { opacity: 0, y: 15, duration: 0.6 })
        .from(headlineRef.current,  { opacity: 0, y: 35, duration: 0.8 }, '-=0.35')
        .from(subtitleRef.current,  { opacity: 0, y: 20, duration: 0.6 }, '-=0.45')
        .from(buttonsRef.current,   { opacity: 0, y: 16, scale: 0.98, duration: 0.5 }, '-=0.35')
        .from(trustRef.current,     { opacity: 0, y: 16, duration: 0.6 }, '-=0.25');
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      className="relative flex h-[100dvh] min-h-[640px] w-full flex-col justify-center items-center overflow-hidden px-4"
    >
      {/* Cinematic Water Background Photo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src={landingBgImg}
          alt="Water Background"
          className="h-full w-full object-cover scale-105"
        />
        {/* Cinematic underwater sunlight: crystal clear ripples & sunbeams with gentle vignette for crisp text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/60" />
      </div>

      {/* Content Container — Centered vertically within full viewport */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12">

        {/* Small top category tag */}
        <div ref={tagRef} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-aqua-400/40 bg-slate-950/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-aqua-300 backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua-400"></span>
            </span>
            Smart Water Platform for Residential Communities
          </span>
        </div>

        {/* Main Headline */}
        <div ref={headlineRef} className="mt-5 max-w-4xl">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-[4.75rem] font-extrabold leading-[1.06] text-white tracking-tight drop-shadow-xl">
            Water management,{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-aqua-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
              made simple.
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mx-auto mt-5 max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-slate-200/90 font-normal drop-shadow"
        >
          Individual digital sub-meters, automated CPHEEO tiered tariffs, and 24-hour leak detection for apartment societies with zero manual spreadsheets.
        </p>

        {/* Actions: Register Community & Install App Only */}
        <div
          ref={buttonsRef}
          className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row"
        >
          <Link to="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-white to-brand-50 text-brand-700 shadow-glow hover:shadow-xl font-bold transition-all hover:-translate-y-0.5 hover:scale-[1.02] px-7 py-3 text-sm sm:text-base"
            >
              Register Community
              <ArrowRight className="h-4 w-4 text-brand-600 ml-1.5" />
            </Button>
          </Link>

          {/* Clean PWA Install Button */}
          <div className="w-full sm:w-auto">
            <PwaInstallButton
              variant="hero"
              className="w-full sm:w-auto backdrop-blur-md border-white/30 bg-white/10 hover:bg-white/20 text-white shadow-lg font-semibold transition-all hover:-translate-y-0.5 px-6 py-2.5"
            />
          </div>
        </div>

        {/* Simple, Sweet, and Clean Trust Line */}
        <div
          ref={trustRef}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs sm:text-sm font-medium text-slate-200/90 drop-shadow"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-aqua-300" />
            Works with any sub-meter
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-aqua-300" />
            15-minute society setup
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-aqua-300" />
            Zero hardware lock-in
          </span>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-slate-400 sm:flex pointer-events-none">
        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-300/80">Scroll</span>
        <span className="flex h-7 w-3.5 justify-center rounded-full border border-white/25 pt-1">
          <span className="h-1.5 w-1 animate-bounce rounded-full bg-aqua-400" />
        </span>
      </div>

      {/* Subtle smooth bottom gradient fade into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-slate-50/50" />
    </section>
  );
}
