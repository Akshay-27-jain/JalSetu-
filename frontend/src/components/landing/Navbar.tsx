import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '../Logo';
import { Button } from '../ui/Button';
import { PwaInstallButton } from '../PwaInstallButton';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const go = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 60);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  const onDark = !scrolled && !mobileOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-xs'
          : mobileOpen
          ? 'border-b border-slate-200 bg-white shadow-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="w-full flex items-center justify-between px-6 sm:px-8 lg:px-12 py-3.5 sm:py-4">
        <Logo size="md" dark={onDark} />

        <div className="hidden items-center gap-1.5 lg:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => go(link.href)}
              className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                onDark
                  ? 'text-white/90 hover:bg-white/15 hover:text-white drop-shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <PwaInstallButton
            variant="pill"
            className={onDark ? 'bg-white/15 text-white border-white/25 hover:bg-white/25' : ''}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className={onDark ? 'text-white hover:bg-white/10 font-semibold' : 'text-slate-700 hover:bg-slate-100 font-semibold'}
          >
            Sign In
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/register')}
            className={onDark ? 'bg-white text-brand-700 hover:bg-brand-50 font-bold shadow-sm' : 'bg-brand-600 text-white hover:bg-brand-700 font-bold shadow-xs'}
          >
            Register Society
          </Button>
        </div>

        <button
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors lg:hidden ${
            onDark ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
          }`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 shadow-xl">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => go(link.href)}
                className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
              </button>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <PwaInstallButton variant="sidebar" />
              <Button variant="secondary" onClick={() => go('/login')}>
                Sign In
              </Button>
              <Button className="bg-brand-600 text-white hover:bg-brand-700" onClick={() => go('/register')}>
                Register Society
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
