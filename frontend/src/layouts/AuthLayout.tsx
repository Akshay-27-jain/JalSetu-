import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Waves, ArrowRight, Sun, Moon } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const VIDEO_URL = 'https://videos.pexels.com/video-files/2776522/2776522-hd_1920_1080_30fps.mp4';
const POSTER_URL = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1920&q=80';

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'xl',
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  };

  const maxWidthClass =
    maxWidth === 'md'
      ? 'max-w-md'
      : maxWidth === 'lg'
      ? 'max-w-lg'
      : maxWidth === '2xl'
      ? 'max-w-2xl'
      : maxWidth === '3xl'
      ? 'max-w-3xl'
      : 'max-w-xl';

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden">
      {/* Left visual panel with crystal water video background (50% split) */}
      <aside
        className="relative hidden lg:flex lg:w-1/2 min-h-screen flex-col justify-between overflow-hidden shrink-0"
        onMouseMove={handleMouseMove}
      >
        {/* Looping Water Video */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER_URL}
          aria-hidden="true"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        {/* Ambient Dark Overlays for text contrast */}
        <div className="absolute inset-0 bg-brand-950/75" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/60 via-brand-950/70 to-aqua-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(47,163,255,0.2),transparent_60%)]" />

        {/* Subtle Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative flex h-full min-h-screen flex-col p-8 sm:p-10 lg:p-12 xl:p-14 text-white z-10 w-full text-left">
          <Link to="/" className="inline-flex w-fit shrink-0" aria-label="JalSetu home">
            <Logo size="lg" dark />
          </Link>

          {/* Centerpiece — flex-1 + flex + items-center centers it in remaining vertical space */}
          <div className="flex flex-1 items-center">
            <div
              className="max-w-lg text-left"
              style={{
                transform: `translate(${mouse.x * 0.35}px, ${mouse.y * 0.35}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-glow">
                <Waves className="h-7 w-7 text-aqua-300 animate-pulse" />
              </div>

              <h2 className="font-display text-3xl font-extrabold leading-tight text-white drop-shadow-md xl:text-4xl text-left">
                Smart Water Management for{' '}
                <span className="bg-gradient-to-r from-aqua-300 via-teal-200 to-brand-300 bg-clip-text text-transparent">
                  Modern Communities.
                </span>
              </h2>

              <p className="mt-4 text-sm xl:text-base leading-relaxed text-brand-100/85 drop-shadow-sm text-left">
                JalSetu empowers residential societies with transparent digital meter tracking, automated tiered billing, and proactive leak protection.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-between border-t border-white/10 pt-4 w-full">
            <p className="text-xs text-brand-200/60">© 2026 JalSetu. All rights reserved.</p>
            <Link
              to="/"
              className="group flex items-center gap-1.5 text-xs font-semibold text-aqua-200 transition-colors hover:text-white"
            >
              Back to home
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Right form panel (50% split) */}
      <main className="relative flex w-full lg:w-1/2 min-h-screen flex-col justify-center overflow-y-auto px-4 py-8 sm:px-8 md:px-10 lg:px-10 xl:px-14">
        {/* Top Floating Controls (Theme Toggle & Back to Home) */}
        <div className="absolute top-6 right-6 sm:right-10 flex items-center gap-3 z-20">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-[#131B2E]/80 text-slate-600 dark:text-amber-400 backdrop-blur-md shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>
        </div>

        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-100/50 dark:bg-brand-950/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-aqua-100/40 dark:bg-aqua-950/20 blur-3xl" />

        <div className={`relative mx-auto w-full ${maxWidthClass}`}>
          {/* Mobile Header with Logo */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link to="/" aria-label="JalSetu home">
              <Logo size="md" />
            </Link>
            <Link to="/" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700">
              ← Back to Home
            </Link>
          </div>

          {/* Form Header */}
          <div className="animate-fade-in">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">{subtitle}</p>
          </div>

          {/* Form Container */}
          <div className="mt-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 sm:p-8 shadow-sm animate-fade-in">
            {children}
          </div>

          {/* Footer Link */}
          {footer && (
            <div className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400 animate-fade-in">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
