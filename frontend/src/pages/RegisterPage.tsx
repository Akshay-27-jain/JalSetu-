import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, extractErrorMessage } from '../services/api';
import { AuthLayout } from '../layouts/AuthLayout';
import { useGoogleLogin } from '@react-oauth/google';
import { fetchGoogleUserProfile, isGoogleConfigured } from '../services/googleAuth';
import { GoogleOAuthModal } from '../components/GoogleOAuthModal';
import {
  Building2,
  Mail,
  Lock,
  User,
  MapPin,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Phone,
  FileCheck,
  Upload,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const googleEmailParam = searchParams.get('googleEmail') || '';
  const googleNameParam = searchParams.get('googleName') || '';

  // Account Credentials
  const [fullName, setFullName] = useState(googleNameParam);
  const [email, setEmail] = useState(googleEmailParam);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Community Specific Fields
  const [communityName, setCommunityName] = useState('');
  const [address, setAddress] = useState('');
  const [totalHouseholds, setTotalHouseholds] = useState<number>(24);

  // 3 Mandatory Verification Documents
  // Document 1: Society Registration Certificate / Property Title Deed
  const [doc1Type, setDoc1Type] = useState('SOCIETY_REGISTRATION');
  const [doc1FileName, setDoc1FileName] = useState('');
  const [doc1Base64, setDoc1Base64] = useState('');

  // Document 2: Administrator Government ID Proof
  const [doc2Type, setDoc2Type] = useState('AADHAAR_CARD');
  const [doc2FileName, setDoc2FileName] = useState('');
  const [doc2Base64, setDoc2Base64] = useState('');

  // Document 3: RWA Board Resolution / Authorized Representative Letter
  const [doc3Type, setDoc3Type] = useState('RWA_RESOLUTION');
  const [doc3FileName, setDoc3FileName] = useState('');
  const [doc3Base64, setDoc3Base64] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanPayload = (b64: string) => {
    if (!b64) return '';
    const idx = b64.indexOf(',');
    return idx !== -1 && idx < 100 ? b64.substring(idx + 1).trim() : b64.trim();
  };

  const isDuplicatePayload = (p1: string, name1: string, p2: string, name2: string) => {
    if (!p1 || !p2) return false;
    const clean1 = cleanPayload(p1);
    const clean2 = cleanPayload(p2);
    if (clean1 === clean2) return true;
    if (clean1.length > 200 && clean1.length === clean2.length && clean1.slice(0, 200) === clean2.slice(0, 200)) return true;
    if (name1 && name2 && name1.trim().toLowerCase() === name2.trim().toLowerCase() && Math.abs(clean1.length - clean2.length) < 50) return true;
    return false;
  };

  const loadTestDocuments = async (type: 'authentic' | 'fake' | 'duplicate') => {
    try {
      setLoading(true);
      setError(null);
      
      let doc1Name: string;
      let doc2Name: string;
      let doc3Name: string;
      let folder: string;

      if (type === 'duplicate') {
        folder = 'authentic';
        doc1Name = '1_society_registration_certificate.png';
        doc2Name = '1_society_registration_certificate.png';
        doc3Name = '1_society_registration_certificate.png';
      } else if (type === 'fake') {
        folder = 'fake_demo';
        doc1Name = '1_sample_placeholder_deed.png';
        doc2Name = '2_test_dummy_id_proof.png';
        doc3Name = '3_fake_watermark_resolution.png';
      } else {
        folder = 'authentic';
        doc1Name = '1_society_registration_certificate.png';
        doc2Name = '2_admin_aadhaar_card_proof.png';
        doc3Name = '3_rwa_board_resolution.png';
      }

      const [res1, res2, res3] = await Promise.all([
        fetch(`/test-documents/${folder}/${doc1Name}`),
        fetch(`/test-documents/${folder}/${doc2Name}`),
        fetch(`/test-documents/${folder}/${doc3Name}`),
      ]);

      const [blob1, blob2, blob3] = await Promise.all([res1.blob(), res2.blob(), res3.blob()]);

      const blobToBase64 = (blob: Blob): Promise<string> =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

      const [b64_1, b64_2, b64_3] = await Promise.all([
        blobToBase64(blob1),
        blobToBase64(blob2),
        blobToBase64(blob3),
      ]);

      setDoc1FileName(doc1Name);
      setDoc1Base64(b64_1);
      setDoc2FileName(doc2Name);
      setDoc2Base64(b64_2);
      setDoc3FileName(doc3Name);
      setDoc3Base64(b64_3);

      if (!communityName) setCommunityName(type === 'authentic' ? 'Palm Meadows Residences' : (type === 'duplicate' ? 'Duplicate Test Society' : 'Sample Silicon Palms'));
      if (!fullName) setFullName('Vikram Malhotra');
      if (!email) setEmail(type === 'authentic' ? 'applicant.sample@housingboard.org' : (type === 'duplicate' ? 'duplicate.test@housingboard.org' : 'test.admin@housingboard.org'));
      if (!address) setAddress('Sector 4, Bangalore');

      if (type === 'duplicate') {
        setError('⚠️ Notice: Loaded 3 duplicate files. Submitting this will trigger AI duplicate fraud detection (REJECTED_FAKE, Score: 15%).');
      }
    } catch (e) {
      console.error('Failed to load sample docs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (googleEmailParam) setEmail(googleEmailParam);
    if (googleNameParam) setFullName(googleNameParam);
  }, [googleEmailParam, googleNameParam]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    slotIndex: 1 | 2 | 3,
    setFileName: (name: string) => void,
    setBase64: (data: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;

      // Duplicate check against other slots
      if (slotIndex === 1) {
        if (doc2Base64 && isDuplicatePayload(b64, file.name, doc2Base64, doc2FileName)) {
          setError(`⚠️ Duplicate Document Detected: "${file.name}" is identical to Document 2 (Govt ID Proof). All 3 required verification documents must be distinct, separate files.`);
          e.target.value = '';
          return;
        }
        if (doc3Base64 && isDuplicatePayload(b64, file.name, doc3Base64, doc3FileName)) {
          setError(`⚠️ Duplicate Document Detected: "${file.name}" is identical to Document 3 (Board Resolution). All 3 required verification documents must be distinct, separate files.`);
          e.target.value = '';
          return;
        }
      } else if (slotIndex === 2) {
        if (doc1Base64 && isDuplicatePayload(b64, file.name, doc1Base64, doc1FileName)) {
          setError(`⚠️ Duplicate Document Detected: "${file.name}" is identical to Document 1 (Society Registration Proof). All 3 required verification documents must be distinct, separate files.`);
          e.target.value = '';
          return;
        }
        if (doc3Base64 && isDuplicatePayload(b64, file.name, doc3Base64, doc3FileName)) {
          setError(`⚠️ Duplicate Document Detected: "${file.name}" is identical to Document 3 (Board Resolution). All 3 required verification documents must be distinct, separate files.`);
          e.target.value = '';
          return;
        }
      } else if (slotIndex === 3) {
        if (doc1Base64 && isDuplicatePayload(b64, file.name, doc1Base64, doc1FileName)) {
          setError(`⚠️ Duplicate Document Detected: "${file.name}" is identical to Document 1 (Society Registration Proof). All 3 required verification documents must be distinct, separate files.`);
          e.target.value = '';
          return;
        }
        if (doc2Base64 && isDuplicatePayload(b64, file.name, doc2Base64, doc2FileName)) {
          setError(`⚠️ Duplicate Document Detected: "${file.name}" is identical to Document 2 (Govt ID Proof). All 3 required verification documents must be distinct, separate files.`);
          e.target.value = '';
          return;
        }
      }

      setError(null);
      setFileName(file.name);
      setBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim().length > 0) {
      console.warn('Bot submission blocked.');
      return;
    }

    if (!fullName || !email || !password || !communityName) {
      setError('Please fill in all mandatory account credentials and society details.');
      return;
    }

    if (!doc1Base64 || !doc2Base64 || !doc3Base64) {
      setError('All 3 mandatory verification documents (Society Registration, Admin Govt ID, and RWA Board Resolution) must be uploaded.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await authApi.registerCommunityAdmin({
        communityName: communityName.trim(),
        address: address.trim(),
        totalHouseholds,
        adminFullName: fullName.trim(),
        adminEmail: email.trim().toLowerCase(),
        adminPhone: phone.trim() || undefined,
        adminPassword: password,
        doc1Type,
        doc1FileName: doc1FileName || 'society_reg_proof.pdf',
        doc1Base64,
        doc2Type,
        doc2FileName: doc2FileName || 'admin_govt_id.pdf',
        doc2Base64,
        doc3Type,
        doc3FileName: doc3FileName || 'rwa_resolution.pdf',
        doc3Base64,
      });

      login(res);
      navigate(`/verification-pending?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleManualGooglePreFill = async (googleEmail: string, googleName: string) => {
    setEmail(googleEmail.trim().toLowerCase());
    if (googleName) {
      setFullName(googleName.trim());
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

        // 2. Pre-fill the registration form with genuine Google verified details
        await handleManualGooglePreFill(profile.email, profile.name || '');
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
      title="Onboard Community Society"
      subtitle="Register your residential community with mandatory 3-Document AI Authenticity & Platform Admin Verification."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Google OAuth pre-fill */}
        <button
          type="button"
          onClick={handleGoogleBtnClick}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
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
          <span>Pre-fill with Google Account</span>
        </button>

        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-[#131B2E] px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 absolute">
            Or Complete Application
          </span>
        </div>

        {/* SECTION 1: Community Society Details */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>1. Residential Society Details</span>
          </h4>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Society / Community Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Palm Meadows Residences"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Society Address / Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Sector 4, Bangalore"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Total Household Flats Capacity
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={totalHouseholds}
                onChange={(e) => setTotalHouseholds(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Administrator Credentials */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span>2. Community Administrator Credentials</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Vikram Malhotra"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@society.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password (min 6 chars) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-10 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: 3 Mandatory Verification Documents */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5" />
              <span>3. Mandatory Verification Documents (All 3 Required)</span>
            </h4>


          </div>

          {/* Document 1 Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white text-[10px]">1</span>
                <span>Society Registration Deed / Title Certificate *</span>
              </label>
              {doc1Base64 && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Attached
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={doc1Type}
                onChange={(e) => setDoc1Type(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="SOCIETY_REGISTRATION">Society Registration Certificate</option>
                <option value="TITLE_DEED">Apartment Title Deed / Sale Deed</option>
                <option value="POSSESSION_HANDOVER">Builder Handover Certificate</option>
              </select>

              <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                <Upload className="h-3.5 w-3.5" />
                <span className="truncate max-w-[170px]">{doc1FileName || 'Upload Doc 1 (PDF/JPG)'}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 1, setDoc1FileName, setDoc1Base64)}
                />
              </label>
            </div>
          </div>

          {/* Document 2 Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">2</span>
                <span>Administrator Government ID Proof *</span>
              </label>
              {doc2Base64 && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Attached
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={doc2Type}
                onChange={(e) => setDoc2Type(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="AADHAAR_CARD">Aadhaar Card</option>
                <option value="PASSPORT">Passport</option>
                <option value="VOTER_ID">Voter ID</option>
                <option value="DRIVING_LICENSE">Driving License</option>
              </select>

              <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                <Upload className="h-3.5 w-3.5" />
                <span className="truncate max-w-[170px]">{doc2FileName || 'Upload Doc 2 (PDF/JPG)'}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 2, setDoc2FileName, setDoc2Base64)}
                />
              </label>
            </div>
          </div>

          {/* Document 3 Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px]">3</span>
                <span>RWA Resolution / Authorized Signatory Letter *</span>
              </label>
              {doc3Base64 && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Attached
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={doc3Type}
                onChange={(e) => setDoc3Type(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="RWA_RESOLUTION">RWA / Society Board Resolution Letter</option>
                <option value="AUTH_LETTER">Authorized Signatory Authorization Letter</option>
                <option value="COMMON_UTILITY_BILL">Society Common Area Electricity / Water Bill</option>
              </select>

              <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                <Upload className="h-3.5 w-3.5" />
                <span className="truncate max-w-[170px]">{doc3FileName || 'Upload Doc 3 (PDF/JPG)'}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 3, setDoc3FileName, setDoc3Base64)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Hidden Honeypot Field */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none' }}
        />
        {/* Privacy & Terms acceptance checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 dark:border-slate-600 accent-brand-600 cursor-pointer"
          />
          <span className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors select-none">
            I have read and agree to JalSetu's{' '}
            <Link to="/terms" target="_blank" onClick={(e) => e.stopPropagation()} className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 underline underline-offset-2">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" target="_blank" onClick={(e) => e.stopPropagation()} className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 underline underline-offset-2">
              Privacy Policy
            </Link>
            . I confirm all submitted documents are authentic and I am the authorised representative of this residential community. *
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !doc1Base64 || !doc2Base64 || !doc3Base64 || !agreedToTerms}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 px-4 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 active:scale-98 transition-all cursor-pointer disabled:opacity-50 mt-2"
        >
          {loading ? (
            <span>Running AI Verification & Submitting...</span>
          ) : (
            <>
              <span>Submit 3-Document Package for Verification</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          Already registered your society?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Sign In here
          </Link>
        </p>
      </form>

      {/* Google OAuth Modal & Setup Helper */}
      <GoogleOAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onManualGoogleSignIn={handleManualGooglePreFill}
        title="Pre-fill with Google Account"
        subtitle="Quickly auto-fill administrator contact details using verified Google identity."
      />
    </AuthLayout>
  );
};
