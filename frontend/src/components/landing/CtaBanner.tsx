import { Link } from 'react-router-dom';
import { ArrowRight, LogIn } from 'lucide-react';
import { Button } from '../ui/Button';
import { Reveal } from '../Reveal';

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-[#0A1628] py-28 sm:py-36 text-white text-center">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[50rem] rounded-full bg-gradient-to-r from-brand-600/20 via-aqua-500/20 to-brand-400/15 blur-3xl" />

      {/* Grid dot pattern from Reference Image 4 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          {/* Category Pill / Tag */}
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-aqua-300">
            READY TO MAKE THE SWITCH?
          </span>

          {/* Headline matching Reference Image 4 */}
          <h2 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Turn every drop into{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-aqua-300 via-teal-200 to-brand-200 bg-clip-text text-transparent">
              a better decision.
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300/90 leading-relaxed">
            Join forward-thinking communities building a clearer, fairer future for water.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-brand-900 font-bold shadow-glow hover:bg-slate-100 hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Register Community
                <ArrowRight className="h-4 w-4 ml-1.5 text-brand-600" />
              </Button>
            </Link>

            <Link to="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 font-semibold transition-all hover:-translate-y-0.5"
              >
                <LogIn className="h-4 w-4 mr-1.5 text-aqua-300" />
                Sign In to Portal
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
