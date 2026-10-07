import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, extractErrorMessage } from '../services/api';
import { AuthLayout } from '../layouts/AuthLayout';
import { useGoogleLogin } from '@react-oauth/google';
import { fetchGoogleUserProfile, isGoogleConfigured } from '../services/googleAuth';
import { GoogleOAuthModal } from '../components/GoogleOAuthModal';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles, Gauge, Home, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Email link URL parameters
  const emailParam = searchParams.get('email');
  const flatParam = searchParams.get('flat');
  const meterParam = searchParams.get('meter');
  const isResidentWelcome = !!(emailParam && (flatParam || meterParam));

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam.trim().toLowerCase());
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authApi.login(email.trim().toLowerCase(), password);
      login(res);

      if (res.status === 'PENDING_APPROVAL' || res.status === 'REJECTED') {
        navigate(`/verification-pending?email=${encodeURIComponent(res.email || email)}`);
        return;
      }

      if (res.role === 'MAIN_ADMIN') {
        navigate('/main-admin/dashboard');
      } else if (res.role === 'COMMUNITY_ADMIN') {
        navigate('/community-admin/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleManualGoogleSignIn = async (googleEmail: string, googleName: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.googleLogin({
        token: 'google-verified-token',
        email: googleEmail.trim().toLowerCase(),
        name: googleName || 'Google User',
      });

      if (!res.token && res.status === 'PENDING_APPROVAL') {
        navigate(
          `/register?googleEmail=${encodeURIComponent(googleEmail)}&googleName=${encodeURIComponent(
            googleName
          )}`
        );
        return;
      }

      login(res);

      if (res.status === 'PENDING_APPROVAL' || res.status === 'REJECTED') {
        navigate(`/verification-pending?email=${encodeURIComponent(res.email || googleEmail)}`);
        return;
      }

      if (res.role === 'MAIN_ADMIN') {
        navigate('/main-admin/dashboard');
      } else if (res.role === 'COMMUNITY_ADMIN') {
        navigate('/community-admin/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    } catch (err) {
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Real Google OAuth 2.0 Trigger
  const triggerGoogleOAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch real verified profile from Google OAuth2 API
        const profile = await fetchGoogleUserProfile(tokenResponse.access_token);

        // 2. Authenticate with JalSetu Backend API
        await handleManualGoogleSignIn(profile.email, profile.name || 'Google User');
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.warn('Google OAuth Popup cancelled or unconfigured:', errorResponse);
      setShowGoogleModal(true);
      setLoading(false);
    },
  });

  const handleGoogleBtnClick = () => {
    if (isGoogleConfigured()) {
      triggerGoogleOAuth();
    } else {
      setShowGoogleModal(true);
    }
  };

  return (
    <AuthLayout
      title={isResidentWelcome ? "Welcome Resident!" : "Welcome Back"}
      subtitle={
        isResidentWelcome
          ? `Sign in to access your water monitoring portal for Flat ${flatParam || ''}.`
          : "Sign in to your JalSetu account to access your water monitoring and billing portal."
      }
      footer={
        isResidentWelcome ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Need help signing in or forgot your details? Contact your <strong>Community Admin</strong> or Society Office.
          </p>
        ) : (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Want to onboard your residential community?{' '}
            <Link
              to="/register"
              className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 underline underline-offset-4"
            >
              Register Community Admin
            </Link>
          </p>
        )
      }
    >
      {/* Resident Email Onboarding Notice */}
      {isResidentWelcome && (
        <div className="mb-5 rounded-2xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/70 dark:bg-brand-950/40 p-4 text-xs text-brand-950 dark:text-brand-200 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-brand-900 dark:text-brand-300">
            <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <span>Account Ready for Onboarding</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
            {flatParam && (
              <span className="flex items-center gap-1 rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 border border-brand-200 dark:border-brand-800 shadow-2xs">
                <Home className="h-3 w-3 text-brand-500" />
                Flat {flatParam}
              </span>
            )}
            {meterParam && (
              <span className="flex items-center gap-1 rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 border border-brand-200 dark:border-brand-800 shadow-2xs">
                <Gauge className="h-3 w-3 text-brand-500" />
                {meterParam}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-0.5">
            Enter the <strong>temporary password</strong> from your welcome email to sign in. You can change your password immediately after logging in.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@community.com"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white transition-colors focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {isResidentWelcome ? "Temporary Password (from Email)" : "Password"}
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              autoFocus={isResidentWelcome}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-11 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white transition-colors focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-2.5 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm shadow-brand-500/25 transition-all disabled:opacity-50 mt-3 cursor-pointer"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Sign In to JalSetu Portal</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Privacy & Terms consent notice */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 underline underline-offset-2">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>

        {/* OAuth 2.0 Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-white dark:bg-[#131B2E] px-3 text-slate-400">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth 2.0 Button */}
        <button
          type="button"
          onClick={handleGoogleBtnClick}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>
      </form>

      {/* Google OAuth Modal & Setup Helper */}
      <GoogleOAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onManualGoogleSignIn={handleManualGoogleSignIn}
        title="Sign in with Google"
        subtitle="Sign in securely using your Google identity or configure Google Cloud Client ID."
      />
    </AuthLayout>
  );
};
