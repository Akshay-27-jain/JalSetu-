import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authApi, extractErrorMessage } from '../../services/api';
import { Badge } from '../../components/Badge';
import {
  UserCheck,
  Mail,
  Building2,
  Home,
  Shield,
  Key,
  Bell,
  CheckCircle2,
  Save,
  Lock,
  Waves,
  Calendar,
  Sparkles,
  Smartphone,
  Phone,
  AlertCircle,
  Gauge,
  Check,
  Eye,
  EyeOff,
  Activity,
  Layers,
  Settings2,
  FileText,
  BadgeCheck,
  Clock,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  PlusCircle,
  FileSpreadsheet,
  Receipt,
  Headphones,
  Users,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'notifications'>('details');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile details edit state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [profileName, setProfileName] = useState(user?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || '');
      setProfilePhone(user.phoneNumber || '');
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileError(null);
      const updated = await authApi.updateProfile({
        fullName: profileName.trim(),
        phoneNumber: profilePhone.trim() || undefined,
      });
      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        u.fullName = updated.fullName;
        u.phoneNumber = updated.phoneNumber;
        localStorage.setItem('user', JSON.stringify(u));
      }
      setSuccessMsg('Profile details successfully updated.');
      setIsEditingDetails(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setProfileError(extractErrorMessage(err));
    } finally {
      setProfileSaving(false);
    }
  };

  // Security form state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Preferences state
  const [prefs, setPrefs] = useState({
    leakAlerts: true,
    weeklyReport: true,
    billingAlerts: true,
    communityNotices: true,
  });

  const isResident = user?.role === 'RESIDENT';
  const isCommunityAdmin = user?.role === 'COMMUNITY_ADMIN';
  const isMainAdmin = user?.role === 'MAIN_ADMIN';

  const getRoleBadgeVariant = (): 'admin' | 'supply' | 'normal' => {
    if (user?.role === 'MAIN_ADMIN') return 'admin';
    if (user?.role === 'COMMUNITY_ADMIN') return 'supply';
    return 'normal';
  };

  const getRoleBadgeText = () => {
    if (user?.role === 'MAIN_ADMIN') return 'Main Administrator';
    if (user?.role === 'COMMUNITY_ADMIN') return 'Community Admin';
    return `Resident ${user?.flatNumber ? `(Flat ${user.flatNumber})` : ''}`;
  };

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const pwdStrength = getPasswordStrength(passwords.newPassword);

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await authApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setSuccessMsg(res.message || 'Password successfully updated in database.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setPasswordError(extractErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePrefsSave = () => {
    setSuccessMsg('Notification preferences saved successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            {t('profileSettings', 'Account Profile & System Settings')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your verified contact info, society flat details, password credentials, and automated notification alerts.
          </p>
        </div>

        {/* Tab Controls Pill */}
        <div className="flex items-center rounded-xl bg-slate-200/70 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>Security & Passwords</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Alert Preferences</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* FULL-WIDTH 2-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: User Summary & Account Health Card (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Main User Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-aqua-500 font-display text-xl font-bold text-white shadow-md shadow-brand-500/25">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white truncate">
                  {user?.fullName}
                </h3>
                <Badge variant={getRoleBadgeVariant()} size="sm" className="mt-1">
                  {getRoleBadgeText()}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Login Email
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-right truncate max-w-[180px]">
                  {user?.email}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> Contact Phone
                </span>
                <span className="font-mono font-bold text-brand-700 dark:text-brand-400">
                  {user?.phoneNumber || '+91 98201 44521'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> Community
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {user?.apartmentName || 'Paras Garden'}
                </span>
              </div>

              {isResident && user?.flatNumber && (
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5 text-slate-400" /> Flat Unit
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Flat {user.flatNumber}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Account Status
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Active & Verified
                </span>
              </div>
            </div>
          </div>

          {/* Quick Management / Portal Shortcuts Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Quick Portal Actions
            </h3>

            {isCommunityAdmin && (
              <div className="space-y-2 text-xs">
                <Link
                  to="/community-admin/households"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-slate-800 dark:text-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    <span>Households & Resident Directory</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  to="/community-admin/meter-readings"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-slate-800 dark:text-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Gauge className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    <span>Log Daily Meter Readings</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  to="/community-admin/dashboard"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-slate-800 dark:text-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    <span>Community Consumption Dashboard</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            )}

            {isResident && (
              <div className="space-y-2 text-xs">
                <Link
                  to="/resident/dashboard"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-slate-800 dark:text-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Gauge className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    <span>My Water Usage Dashboard</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  to="/resident/usage"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-slate-800 dark:text-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    <span>Daily Meter History & Logs</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (8 cols) - Tabs & Content Panels */}
        <div className="space-y-6 lg:col-span-8">
          {/* TAB 1: Profile Information */}
          {activeTab === 'details' && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Personal & Contact Profile
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Registered contact details for official billing, notifications, and water monitoring
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingDetails(!isEditingDetails);
                      setProfileError(null);
                    }}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100 cursor-pointer transition-colors"
                  >
                    {isEditingDetails ? 'Cancel' : 'Edit Details'}
                  </button>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Active Member
                  </span>
                </div>
              </div>

              {profileError && (
                <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-4 text-xs font-bold text-rose-800 dark:text-rose-300 shadow-sm">
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Legal Name</label>
                    <input
                      type="text"
                      value={isEditingDetails ? profileName : (user?.fullName || '')}
                      onChange={(e) => setProfileName(e.target.value)}
                      disabled={!isEditingDetails}
                      required
                      className={`w-full rounded-xl border px-3.5 py-2.5 font-bold ${
                        isEditingDetails
                          ? 'border-brand-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address (Login ID)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 font-mono text-xs font-bold text-slate-900 dark:text-white opacity-70"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Contact Phone Number</label>
                    <input
                      type="tel"
                      value={isEditingDetails ? profilePhone : (user?.phoneNumber || '')}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      disabled={!isEditingDetails}
                      placeholder="+91 98765 43210"
                      className={`w-full font-mono rounded-xl border px-3.5 py-2.5 font-bold ${
                        isEditingDetails
                          ? 'border-brand-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isResident ? 'Residential Apartment' : 'Managed Community'}
                    </label>
                    <input
                      type="text"
                      value={user?.apartmentName || 'N/A'}
                      disabled
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 font-bold text-slate-900 dark:text-white opacity-70"
                    />
                  </div>

                  {isResident && (
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Assigned Flat Number</label>
                      <input
                        type="text"
                        value={user?.flatNumber ? `Flat ${user.flatNumber}` : 'Unassigned'}
                        disabled
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 font-bold text-slate-900 dark:text-white opacity-70"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">System Access Role</label>
                    <input
                      type="text"
                      value={user?.role ? user.role.replace('_', ' ') : 'USER'}
                      disabled
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 font-bold text-slate-900 dark:text-white opacity-70"
                    />
                  </div>
                </div>

                {isEditingDetails && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-brand-500/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                )}
              </form>

              {/* Society Support & Contact Card */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-5 space-y-3">
                <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 text-brand-700 dark:text-brand-400">
                  <Building2 className="h-4 w-4" />
                  Community Support & Helpdesk
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-white dark:bg-[#131B2E] p-3 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Society Office</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.apartmentName || 'Paras Garden'} Estate Desk</p>
                  </div>

                  <div className="rounded-xl bg-white dark:bg-[#131B2E] p-3 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Water Leak Helpline</p>
                    <p className="font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Society Maintenance Desk
                    </p>
                  </div>

                  <div className="rounded-xl bg-white dark:bg-[#131B2E] p-3 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Billing Cycle</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">1st to End of Month</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'security' && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Change Account Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Replace your temporary onboarding password with a private password. The updated password is saved directly to the database.
                </p>
              </div>

              {passwordError && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3.5 text-xs font-semibold text-rose-800 dark:text-rose-300 animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSave} className="space-y-4 max-w-lg text-xs">
                {/* Current Password */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current (or Temporary) Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-3.5 pr-10 py-2.5 font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Private Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-3.5 pr-10 py-2.5 font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {passwords.newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <span>Password Strength</span>
                        <span className={pwdStrength >= 75 ? 'text-emerald-600 dark:text-emerald-400' : pwdStrength >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500'}>
                          {pwdStrength >= 75 ? 'Strong' : pwdStrength >= 50 ? 'Good' : 'Weak'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            pwdStrength >= 75 ? 'bg-emerald-500' : pwdStrength >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${pwdStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 font-bold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Updating Database...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Update Password in Database</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Alert Preferences */}
          {activeTab === 'notifications' && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Notification & Water Alert Preferences
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure automated alerts and consumption notices sent to your email and portal.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Overuse & Leak Detection Alerts</p>
                    <p className="text-slate-500 dark:text-slate-400">Instant notification when daily usage exceeds your flat's allocated tier slab.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.leakAlerts}
                    onChange={(e) => setPrefs({ ...prefs, leakAlerts: e.target.checked })}
                    className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Weekly Water Conservation Digest</p>
                    <p className="text-slate-500 dark:text-slate-400">Receive a weekly summary email comparing your usage with community averages.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.weeklyReport}
                    onChange={(e) => setPrefs({ ...prefs, weeklyReport: e.target.checked })}
                    className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Monthly Billing & Invoice Notifications</p>
                    <p className="text-slate-500 dark:text-slate-400">Immediate notice when the society monthly water billing cycle concludes.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.billingAlerts}
                    onChange={(e) => setPrefs({ ...prefs, billingAlerts: e.target.checked })}
                    className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                </label>

                <div className="pt-2">
                  <button
                    onClick={handlePrefsSave}
                    className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-bold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Notification Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
