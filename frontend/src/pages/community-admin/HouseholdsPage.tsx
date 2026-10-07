import React, { useState, useEffect } from 'react';
import { communityAdminApi, extractErrorMessage } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import {
  Users,
  Plus,
  Copy,
  Check,
  Search,
  KeyRound,
  Home,
  AlertCircle,
  Mail,
  User,
  Lock,
  UserPlus,
  Eye,
  EyeOff,
  RefreshCw,
  Gauge,
  Phone,
  Sparkles,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Download,
  FileText,
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  UploadCloud,
  CheckCircle2,
  Bot,
} from 'lucide-react';
import type { Household, AccountStatus } from '../../types';
import { exportToCsv } from '../../utils/exportCsv';

export const HouseholdsPage: React.FC = () => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State (New Household)
  const [flatNumber, setFlatNumber] = useState('');
  const [meterSerialNumber, setMeterSerialNumber] = useState('');
  const [areaSqft, setAreaSqft] = useState<number | ''>(1200);
  const [occupancyCount, setOccupancyCount] = useState<number | ''>(3);
  const [hasMeter, setHasMeter] = useState<boolean>(true);
  const [residentFullName, setResidentFullName] = useState('');
  const [residentEmail, setResidentEmail] = useState('');
  const [residentPhone, setResidentPhone] = useState('');
  const [residentPassword, setResidentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 3 Mandatory Verification Documents State (Add Modal)
  const [doc1Type, setDoc1Type] = useState('PROPERTY_TAX_OR_SALE_DEED');
  const [doc1FileName, setDoc1FileName] = useState('');
  const [doc1Base64, setDoc1Base64] = useState<string | undefined>(undefined);

  const [doc2Type, setDoc2Type] = useState('AADHAAR_CARD');
  const [doc2FileName, setDoc2FileName] = useState('');
  const [doc2Base64, setDoc2Base64] = useState<string | undefined>(undefined);

  const [doc3Type, setDoc3Type] = useState('ELECTRICITY_BILL');
  const [doc3FileName, setDoc3FileName] = useState('');
  const [doc3Base64, setDoc3Base64] = useState<string | undefined>(undefined);

  // Edit Modal State
  const [editingHousehold, setEditingHousehold] = useState<Household | null>(null);
  const [editFlatNumber, setEditFlatNumber] = useState('');
  const [editMeterSerial, setEditMeterSerial] = useState('');
  const [editAreaSqft, setEditAreaSqft] = useState<number | ''>(1200);
  const [editOccupancy, setEditOccupancy] = useState<number | ''>(3);
  const [editHasMeter, setEditHasMeter] = useState<boolean>(true);
  const [editResidentName, setEditResidentName] = useState('');
  const [editResidentEmail, setEditResidentEmail] = useState('');
  const [editResidentPhone, setEditResidentPhone] = useState('');
  const [editStatus, setEditStatus] = useState<AccountStatus>('ACTIVE');
  const [editDoc1Type, setEditDoc1Type] = useState('PROPERTY_TAX_OR_SALE_DEED');
  const [editDoc1FileName, setEditDoc1FileName] = useState('');
  const [editDoc1Base64, setEditDoc1Base64] = useState<string | undefined>(undefined);
  const [editDoc2Type, setEditDoc2Type] = useState('AADHAAR_CARD');
  const [editDoc2FileName, setEditDoc2FileName] = useState('');
  const [editDoc2Base64, setEditDoc2Base64] = useState<string | undefined>(undefined);
  const [editDoc3Type, setEditDoc3Type] = useState('ELECTRICITY_BILL');
  const [editDoc3FileName, setEditDoc3FileName] = useState('');
  const [editDoc3Base64, setEditDoc3Base64] = useState<string | undefined>(undefined);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Inspection / 3-Doc Dossier Viewer Modal State
  const [viewingHousehold, setViewingHousehold] = useState<Household | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'DOC1' | 'DOC2' | 'DOC3'>('DOC1');

  // Delete Modal State
  const [deletingHousehold, setDeletingHousehold] = useState<Household | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Email Credentials Modal State
  const [credentialsHousehold, setCredentialsHousehold] = useState<Household | null>(null);
  const [credentialsEmail, setCredentialsEmail] = useState<string>('');
  const [sendingCredentials, setSendingCredentials] = useState<boolean>(false);
  const [credentialsSuccessMsg, setCredentialsSuccessMsg] = useState<string | null>(null);
  const [credentialsModalError, setCredentialsModalError] = useState<string | null>(null);

  // Success Confirmation Modal
  const [createdSuccess, setCreatedSuccess] = useState<{
    flatNumber: string;
    meterSerialNumber: string;
    residentName: string;
    residentEmail: string;
    residentPhone?: string;
    temporaryPassword: string;
    inviteCode: string;
    status?: string;
  } | null>(null);

  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communityAdminApi.getHouseholds();
      setHouseholds(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new' || params.get('add') === 'true') {
      setIsModalOpen(true);
    }
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const generateRandomPasswordString = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = 'Res@';
    for (let i = 0; i < 5; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const generateRandomPassword = () => {
    setResidentPassword(generateRandomPasswordString());
  };

  const handleFlatChange = (val: string) => {
    setFlatNumber(val);
    if (val.trim()) {
      const clean = val.trim().replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const rand = Math.floor(1000 + Math.random() * 9000);
      setMeterSerialNumber(`MTR-${clean}-${rand}`);
    } else {
      setMeterSerialNumber('');
    }
  };

  // Generic file upload to base64 handler
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (fileName: string, base64: string) => void,
    onError: (msg: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onError(`File "${file.name}" exceeds 10MB limit. Please upload a smaller PDF or image.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSuccess(file.name, reader.result);
      }
    };
    reader.onerror = () => {
      onError(`Failed to read "${file.name}". Please try another file.`);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber.trim()) {
      setModalError('Flat number is required.');
      return;
    }

    const hasResident = Boolean(residentEmail.trim());

    // If resident is being onboarded, all 3 documents are required
    if (hasResident) {
      if (!doc1Base64) {
        setModalError('Document 1 (Flat Paper / Rent Agreement) is mandatory for resident onboarding.');
        return;
      }
      if (!doc2Base64) {
        setModalError('Document 2 (Government ID Proof) is mandatory for resident onboarding.');
        return;
      }
      if (!doc3Base64) {
        setModalError('Document 3 (Authorized Signatory Proof / Utility Bill) is mandatory for resident onboarding.');
        return;
      }

      const cleanPayload = (b64?: string) => {
        if (!b64) return '';
        const idx = b64.indexOf(',');
        return idx !== -1 && idx < 100 ? b64.substring(idx + 1).trim() : b64.trim();
      };
      const p1 = cleanPayload(doc1Base64);
      const p2 = cleanPayload(doc2Base64);
      const p3 = cleanPayload(doc3Base64);

      if (p1 === p2 || p1 === p3 || p2 === p3) {
        setModalError('⚠️ Duplicate Document Detected: All 3 verification documents must be distinct, separate files. Identical files are not permitted.');
        return;
      }
    }

    try {
      setSubmitting(true);
      setModalError(null);

      let finalResidentPassword = residentPassword.trim();
      if (hasResident && !finalResidentPassword) {
        finalResidentPassword = generateRandomPasswordString();
      }

      const res = await communityAdminApi.createHousehold({
        flatNumber: flatNumber.trim().toUpperCase(),
        meterSerialNumber: meterSerialNumber.trim() || undefined,
        areaSqft: typeof areaSqft === 'number' && areaSqft > 0 ? areaSqft : 1200,
        occupancyCount: typeof occupancyCount === 'number' && occupancyCount > 0 ? occupancyCount : 3,
        hasMeter,
        residentFullName: residentFullName.trim() || undefined,
        residentEmail: residentEmail.trim().toLowerCase() || undefined,
        residentPhone: residentPhone.trim() || undefined,
        residentPassword: finalResidentPassword || undefined,
        doc1Type: hasResident ? doc1Type : undefined,
        doc1FileName: hasResident ? doc1FileName : undefined,
        doc1Base64: hasResident ? doc1Base64 : undefined,
        doc2Type: hasResident ? doc2Type : undefined,
        doc2FileName: hasResident ? doc2FileName : undefined,
        doc2Base64: hasResident ? doc2Base64 : undefined,
        doc3Type: hasResident ? doc3Type : undefined,
        doc3FileName: hasResident ? doc3FileName : undefined,
        doc3Base64: hasResident ? doc3Base64 : undefined,
      });

      setIsModalOpen(false);
      fetchHouseholds();

      if (residentEmail.trim()) {
        setCreatedSuccess({
          flatNumber: res.flatNumber,
          meterSerialNumber: res.meterSerialNumber || `MTR-${res.flatNumber}`,
          residentName: res.residentName || residentFullName || 'Resident',
          residentEmail: res.residentEmail || residentEmail,
          residentPhone: res.residentPhone || residentPhone,
          temporaryPassword: finalResidentPassword,
          inviteCode: res.inviteCode,
          status: res.status || 'PENDING_APPROVAL',
        });
      }

      // Reset form
      setFlatNumber('');
      setMeterSerialNumber('');
      setAreaSqft(1200);
      setOccupancyCount(3);
      setResidentFullName('');
      setResidentEmail('');
      setResidentPhone('');
      setResidentPassword('');
      setDoc1FileName('');
      setDoc1Base64(undefined);
      setDoc2FileName('');
      setDoc2Base64(undefined);
      setDoc3FileName('');
      setDoc3Base64(undefined);
    } catch (err) {
      setModalError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Status Change Handler
  const handleHouseholdStatusChange = async (householdId: number, newStatus: AccountStatus) => {
    const h = households.find((item) => item.id === householdId);
    const originalStatus = h?.status || 'ACTIVE';
    setHouseholds((prev) => prev.map((item) => (item.id === householdId ? { ...item, status: newStatus } : item)));
    try {
      await communityAdminApi.updateHouseholdStatus(householdId, newStatus);
      setCredentialsSuccessMsg(`Account status for Flat ${h?.flatNumber || ''} (${h?.residentName || 'Resident'}) updated to ${newStatus}.`);
      setTimeout(() => setCredentialsSuccessMsg(null), 4000);
    } catch (err) {
      setHouseholds((prev) => prev.map((item) => (item.id === householdId ? { ...item, status: originalStatus } : item)));
      setError(extractErrorMessage(err));
    }
  };

  // Open Edit Modal
  const openEditModal = (h: Household) => {
    setEditingHousehold(h);
    setEditFlatNumber(h.flatNumber);
    setEditMeterSerial(h.meterSerialNumber || `MTR-${h.flatNumber}`);
    setEditAreaSqft(h.areaSqft || 1200);
    setEditOccupancy(h.occupancyCount || 3);
    setEditHasMeter(h.hasMeter ?? true);
    setEditResidentName(h.residentName || '');
    setEditResidentEmail(h.residentEmail || '');
    setEditResidentPhone(h.residentPhone || '');
    setEditStatus(h.status || 'ACTIVE');
    setEditDoc1Type(h.doc1Type || 'PROPERTY_TAX_OR_SALE_DEED');
    setEditDoc1FileName(h.doc1FileName || '');
    setEditDoc1Base64(h.doc1Url || undefined);
    setEditDoc2Type(h.doc2Type || 'AADHAAR_CARD');
    setEditDoc2FileName(h.doc2FileName || '');
    setEditDoc2Base64(h.doc2Url || undefined);
    setEditDoc3Type(h.doc3Type || 'ELECTRICITY_BILL');
    setEditDoc3FileName(h.doc3FileName || '');
    setEditDoc3Base64(h.doc3Url || undefined);
    setEditError(null);
  };

  // Handle Edit Submit
  const handleUpdateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHousehold) return;

    try {
      setEditSubmitting(true);
      setEditError(null);

      await communityAdminApi.updateHousehold(editingHousehold.id, {
        flatNumber: editFlatNumber.trim().toUpperCase(),
        meterSerialNumber: editMeterSerial.trim() || undefined,
        areaSqft: typeof editAreaSqft === 'number' && editAreaSqft > 0 ? editAreaSqft : 1200,
        occupancyCount: typeof editOccupancy === 'number' && editOccupancy > 0 ? editOccupancy : 3,
        hasMeter: editHasMeter,
        residentFullName: editResidentName.trim() || undefined,
        residentEmail: editResidentEmail.trim().toLowerCase() || undefined,
        residentPhone: editResidentPhone.trim() || undefined,
        doc1Type: editDoc1Base64 ? editDoc1Type : undefined,
        doc1FileName: editDoc1Base64 ? editDoc1FileName : undefined,
        doc1Base64: editDoc1Base64,
        doc2Type: editDoc2Base64 ? editDoc2Type : undefined,
        doc2FileName: editDoc2Base64 ? editDoc2FileName : undefined,
        doc2Base64: editDoc2Base64,
        doc3Type: editDoc3Base64 ? editDoc3Type : undefined,
        doc3FileName: editDoc3Base64 ? editDoc3FileName : undefined,
        doc3Base64: editDoc3Base64,
      });

      if (editStatus !== (editingHousehold.status || 'ACTIVE')) {
        await communityAdminApi.updateHouseholdStatus(editingHousehold.id, editStatus);
      }

      setEditingHousehold(null);
      fetchHouseholds();
    } catch (err) {
      setEditError(extractErrorMessage(err));
    } finally {
      setEditSubmitting(false);
    }
  };

  // Handle Delete Submit
  const handleDeleteHousehold = async () => {
    if (!deletingHousehold) return;

    try {
      setDeleteSubmitting(true);
      setDeleteError(null);

      await communityAdminApi.deleteHousehold(deletingHousehold.id);
      setDeletingHousehold(null);
      fetchHouseholds();
    } catch (err) {
      setDeleteError(extractErrorMessage(err));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleDispatchCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialsHousehold) return;

    if (!credentialsEmail || !credentialsEmail.includes('@')) {
      setCredentialsModalError('Please enter a valid recipient email address.');
      return;
    }

    try {
      setSendingCredentials(true);
      setCredentialsModalError(null);
      await communityAdminApi.sendHouseholdCredentials(credentialsHousehold.id, credentialsEmail.trim());
      setCredentialsSuccessMsg(`Login credentials successfully emailed to ${credentialsEmail.trim()} for Flat ${credentialsHousehold.flatNumber}.`);
      setCredentialsHousehold(null);
    } catch (err) {
      setCredentialsModalError(extractErrorMessage(err));
    } finally {
      setSendingCredentials(false);
    }
  };

  // Helper for rendering AI Authenticity Badges in Table & Inspector
  const renderAiBadge = (score?: number, status?: string) => {
    const scoreVal = score ?? 0;
    if (status === 'REJECTED_FAKE') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <ShieldAlert className="h-3 w-3 text-rose-600" />
          <span>{scoreVal}% • Fake/Demo</span>
        </span>
      );
    }
    if (status === 'SUSPICIOUS' || scoreVal < 50) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/70 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
          <AlertTriangle className="h-3 w-3 text-orange-600" />
          <span>{scoreVal}% • Suspicious</span>
        </span>
      );
    }
    if (status === 'NEEDS_REVIEW' || scoreVal < 80) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <AlertCircle className="h-3 w-3 text-amber-600" />
          <span>{scoreVal}% • Review</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        <Sparkles className="h-3 w-3 text-emerald-600" />
        <span>{scoreVal}% • Authentic</span>
      </span>
    );
  };

  // Helper for Status column rendering
  const renderStatusBadge = (status?: AccountStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Pending Main Admin</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <span>🔴 Rejected</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span>⏸ Inactive</span>
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <span>🚫 Blocked</span>
          </span>
        );
      case 'ACTIVE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span>🟢 Active</span>
          </span>
        );
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredHouseholds = households.filter((h) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      h.flatNumber.toLowerCase().includes(term) ||
      (h.meterSerialNumber && h.meterSerialNumber.toLowerCase().includes(term)) ||
      h.inviteCode.toLowerCase().includes(term) ||
      (h.residentName && h.residentName.toLowerCase().includes(term)) ||
      (h.residentEmail && h.residentEmail.toLowerCase().includes(term)) ||
      (h.residentPhone && h.residentPhone.toLowerCase().includes(term))
    );
  });

  const totalPages = Math.ceil(filteredHouseholds.length / itemsPerPage) || 1;
  const paginatedHouseholds = filteredHouseholds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Households & Resident Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Provision residential flat units, upload 3-document packages for AI verification, and manage occupant accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchHouseholds}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              exportToCsv(
                'JalSetu_Households_Directory',
                households,
                [
                  { key: 'flatNumber', label: 'Flat Number' },
                  { key: 'residentName', label: 'Resident Name', formatter: (v) => v || 'Unregistered' },
                  { key: 'residentEmail', label: 'Email', formatter: (v) => v || 'N/A' },
                  { key: 'residentPhone', label: 'Phone', formatter: (v) => v || 'N/A' },
                  { key: 'hasMeter', label: 'Metered', formatter: (v) => (v ? 'Yes' : 'No (Unmetered)') },
                  { key: 'meterSerialNumber', label: 'Meter Serial Number', formatter: (v) => v || 'N/A' },
                  { key: 'areaSqft', label: 'Carpet Area (Sq.Ft.)', formatter: (v) => v || 1350 },
                  { key: 'occupancyCount', label: 'Occupancy', formatter: (v) => v || 3 },
                  { key: 'status', label: 'Account Status', formatter: (v) => v || 'ACTIVE' },
                  { key: 'aiVerificationScore', label: 'AI Score (%)', formatter: (v) => (v != null ? `${v}%` : 'N/A') },
                  { key: 'inviteCode', label: 'Invite Code' },
                ]
              );
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs active:scale-95 transition-all cursor-pointer"
            title="Export household directory to CSV/Excel"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 shadow-brand-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Flat & Resident</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {credentialsSuccessMsg && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{credentialsSuccessMsg}</span>
          </div>
          <button onClick={() => setCredentialsSuccessMsg(null)} className="text-emerald-700 dark:text-emerald-300 hover:opacity-75 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-card">
          <p className="text-xs font-medium text-slate-400">Total Flats</p>
          <p className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1">{households.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-card">
          <p className="text-xs font-medium text-slate-400">Active Metered Units</p>
          <p className="font-display text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">
            {households.filter((h) => h.hasMeter).length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-card">
          <p className="text-xs font-medium text-slate-400">Pending Main Admin Approval</p>
          <p className="font-display text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {households.filter((h) => h.status === 'PENDING_APPROVAL').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-card">
          <p className="text-xs font-medium text-slate-400">Active Resident Accounts</p>
          <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {households.filter((h) => h.status === 'ACTIVE' && h.residentEmail).length}
          </p>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-card space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Flat, Meter No, Resident, Phone, or Invite Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-[#0B1120] focus:border-brand-500 focus:outline-none"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing {filteredHouseholds.length} of {households.length} units
          </span>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : filteredHouseholds.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No flat units found matching your search.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full min-w-[1150px] text-left text-xs border-collapse">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 pl-6 pr-4 min-w-[140px]">Flat Unit</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Meter Serial No.</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Assigned Resident</th>
                    <th className="py-3.5 px-4 min-w-[130px]">Size & Occupancy</th>
                    <th className="py-3.5 px-4 min-w-[190px]">AI 3-Doc Package</th>
                    <th className="py-3.5 px-4 min-w-[110px]">Usage (kL)</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Account Status</th>
                    <th className="py-3.5 px-4 min-w-[130px]">Invite Code</th>
                    <th className="py-3.5 pl-4 pr-6 min-w-[130px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-200">
                  {paginatedHouseholds.map((h) => {
                    const isCopied = copiedCode === `inv-${h.id}`;
                    const hasDocs = Boolean(h.doc1Url || h.doc2Url || h.doc3Url || h.aiVerificationScore != null);

                    return (
                      <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Flat Unit */}
                        <td className="py-3.5 pl-6 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/80 font-mono font-bold text-brand-700 dark:text-brand-300 text-xs border border-brand-200 dark:border-brand-800">
                              {h.flatNumber}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">Flat {h.flatNumber}</span>
                              <span className="text-[10px] text-slate-400">ID #{h.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Meter Serial */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Gauge className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                            <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {h.meterSerialNumber || `MTR-${h.flatNumber}`}
                            </span>
                          </div>
                        </td>

                        {/* Assigned Resident */}
                        <td className="py-3.5 px-4">
                          {h.residentName || h.residentEmail ? (
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 dark:text-white">{h.residentName || 'Resident'}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{h.residentEmail}</p>
                              {h.residentPhone && (
                                <p className="text-[10px] font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-brand-500" />
                                  <span>{h.residentPhone}</span>
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No resident assigned</span>
                          )}
                        </td>

                        {/* Size & Occupancy */}
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{h.areaSqft || 1200} sq.ft</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{h.occupancyCount || 3} Occupants</p>
                          </div>
                        </td>

                        {/* AI 3-Doc Package & Score */}
                        <td className="py-3.5 px-4">
                          {hasDocs ? (
                            <div className="space-y-1">
                              {renderAiBadge(h.aiVerificationScore, h.aiVerificationStatus)}
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingHousehold(h);
                                  setActiveDocTab('DOC1');
                                }}
                                className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer mt-1"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Inspect 3 Documents</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No docs uploaded</span>
                          )}
                        </td>

                        {/* Usage */}
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {h.currentMonthConsumptionKl != null ? `${h.currentMonthConsumptionKl} kL` : '0 kL'}
                            </p>
                            <p className="text-[10px] text-slate-400">This Month</p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {renderStatusBadge(h.status)}
                            {h.status !== 'PENDING_APPROVAL' && (
                              <div>
                                <select
                                  value={h.status || 'ACTIVE'}
                                  onChange={(e) => handleHouseholdStatusChange(h.id, e.target.value as AccountStatus)}
                                  className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-transparent border-0 underline cursor-pointer p-0 hover:text-slate-800"
                                  title="Change operational status"
                                >
                                  <option value="ACTIVE">Set Active</option>
                                  <option value="INACTIVE">Set Inactive</option>
                                  <option value="BLOCKED">Set Blocked</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Invite Code */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleCopy(h.inviteCode, `inv-${h.id}`)}
                            className={`group flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                              isCopied
                                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700'
                            }`}
                            title="Click to copy invite code"
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <KeyRound className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-600" />
                                <span className="font-bold">{h.inviteCode}</span>
                                <Copy className="h-3 w-3 text-slate-400 group-hover:text-brand-600 opacity-60 group-hover:opacity-100" />
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pl-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setCredentialsHousehold(h);
                                setCredentialsEmail(h.residentEmail || '');
                                setCredentialsModalError(null);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-all cursor-pointer"
                              title="Email Login Credentials to Resident"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(h)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 transition-all cursor-pointer"
                              title="Edit Flat & Resident"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDeletingHousehold(h);
                                setDeleteError(null);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-300 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                              title="Delete Flat Unit"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredHouseholds.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newSize) => {
                setItemsPerPage(newSize);
                setCurrentPage(1);
              }}
              itemsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </div>

      {/* ---------------- ADD HOUSEHOLD & RESIDENT MODAL (WITH 3-DOC UPLOAD) ---------------- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Flat & Resident (3-Doc AI Security Package)"
        subtitle="Provision flat unit, assign water meter, and upload resident's 3 mandatory verification documents"
        maxWidth="2xl"
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {residentEmail
                ? '🤖 Will run AI authenticity check and submit to Main Admin for approval'
                : 'ℹ️ Flat will be created without resident account'}
            </p>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-household-form"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
              >
                {submitting ? 'Running AI Scan & Creating...' : 'Save Unit & Submit for Verification'}
              </button>
            </div>
          </div>
        }
      >
        {modalError && (
          <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{modalError}</span>
          </div>
        )}

        <form id="add-household-form" onSubmit={handleCreateHousehold} className="space-y-4">
          {/* Section 1 & 2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Flat Unit Info */}
            <div className="space-y-3 rounded-2xl bg-slate-50/70 dark:bg-[#0B1120]/50 p-4 border border-slate-200/70 dark:border-slate-800">
              <div className="border-b border-slate-200/80 dark:border-slate-800 pb-1.5 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5" />
                  1. Flat Unit Information
                </h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Flat Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A-101 or B-402"
                  value={flatNumber}
                  onChange={(e) => handleFlatChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Meter Serial Number</span>
                  <span className="text-[10px] text-slate-400 font-normal">Auto-generated</span>
                </label>
                <div className="relative">
                  <Gauge className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. MTR-A101-4921"
                    value={meterSerialNumber}
                    onChange={(e) => setMeterSerialNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] pl-8 pr-3 py-1.5 font-mono text-xs font-bold text-brand-700 dark:text-brand-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Area (Sq. Ft)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={areaSqft}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setAreaSqft('');
                      } else {
                        const parsed = parseFloat(val);
                        setAreaSqft(isNaN(parsed) ? '' : parsed);
                      }
                    }}
                    onBlur={() => {
                      if (areaSqft === '' || Number(areaSqft) < 100) {
                        setAreaSqft(1200);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Occupancy Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={occupancyCount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setOccupancyCount('');
                      } else {
                        const parsed = parseInt(val, 10);
                        setOccupancyCount(isNaN(parsed) ? '' : parsed);
                      }
                    }}
                    onBlur={() => {
                      if (occupancyCount === '' || Number(occupancyCount) < 1) {
                        setOccupancyCount(1);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="hasMeter"
                  checked={hasMeter}
                  onChange={(e) => setHasMeter(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="hasMeter" className="text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Has dedicated physical water meter installed
                </label>
              </div>
            </div>

            {/* Right Column: Resident Details */}
            <div className="space-y-3 rounded-2xl bg-slate-50/70 dark:bg-[#0B1120]/50 p-4 border border-slate-200/70 dark:border-slate-800">
              <div className="border-b border-slate-200/80 dark:border-slate-800 pb-1.5 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  2. Resident Account Details
                </h4>
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800">
                  Routes to Main Admin
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resident Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Akshay Sharma"
                    value={residentFullName}
                    onChange={(e) => setResidentFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resident Email (Login ID)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="resident@gmail.com"
                    value={residentEmail}
                    onChange={(e) => setResidentEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={residentPhone}
                    onChange={(e) => setResidentPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Temporary Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 cursor-pointer bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>✨ Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={residentPassword}
                    onChange={(e) => setResidentPassword(e.target.value)}
                    placeholder="Temporary password"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] pl-8 pr-9 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 3 Mandatory Verification Documents (Upload Cards) */}
          <div className="rounded-2xl border border-brand-200 dark:border-brand-800/80 bg-brand-50/30 dark:bg-[#0B1120]/70 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-200/70 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  3. Mandatory Verification Documents (3-Doc AI Package)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-100/80 dark:bg-brand-950/80 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                Mandatory for Resident Approval
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload all 3 required documents. The AI engine will audit each file for authentic seals, registered authority headers, and watermarks before dispatching the application to the Main Admin.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Doc 1 Card */}
              <div className={`rounded-xl border p-3 text-xs space-y-2 transition-all ${
                doc1Base64
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-brand-600" />
                    Doc 1: Flat Paper *
                  </span>
                  {doc1Base64 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>

                <select
                  value={doc1Type}
                  onChange={(e) => setDoc1Type(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-2 py-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="PROPERTY_TAX_OR_SALE_DEED">Sale Deed / Possession</option>
                  <option value="REGISTERED_RENT_AGREEMENT">Registered Rent Agreement</option>
                  <option value="ALLOTMENT_LETTER">Society Allotment Letter</option>
                </select>

                <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                  <UploadCloud className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                    {doc1FileName ? doc1FileName.substring(0, 18) + '...' : 'Upload Flat Proof'}
                  </span>
                  <span className="text-[9px] text-slate-400">PDF, PNG, JPG (Max 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        (fileName, base64) => {
                          setDoc1FileName(fileName);
                          setDoc1Base64(base64);
                        },
                        (msg) => setModalError(msg)
                      )
                    }
                  />
                </label>
              </div>

              {/* Doc 2 Card */}
              <div className={`rounded-xl border p-3 text-xs space-y-2 transition-all ${
                doc2Base64
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                    Doc 2: Govt ID *
                  </span>
                  {doc2Base64 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>

                <select
                  value={doc2Type}
                  onChange={(e) => setDoc2Type(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-2 py-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="AADHAAR_CARD">Aadhaar Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="VOTER_ID">Voter ID Card</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>

                <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                  <UploadCloud className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                    {doc2FileName ? doc2FileName.substring(0, 18) + '...' : 'Upload Govt ID'}
                  </span>
                  <span className="text-[9px] text-slate-400">PDF, PNG, JPG (Max 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        (fileName, base64) => {
                          setDoc2FileName(fileName);
                          setDoc2Base64(base64);
                        },
                        (msg) => setModalError(msg)
                      )
                    }
                  />
                </label>
              </div>

              {/* Doc 3 Card */}
              <div className={`rounded-xl border p-3 text-xs space-y-2 transition-all ${
                doc3Base64
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-emerald-600" />
                    Doc 3: Signatory/Bill *
                  </span>
                  {doc3Base64 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>

                <select
                  value={doc3Type}
                  onChange={(e) => setDoc3Type(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-2 py-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ELECTRICITY_BILL">Electricity Bill</option>
                  <option value="LANDLORD_NOC">Landlord / Owner NOC</option>
                  <option value="PROPERTY_TAX_RECEIPT">Tax / Water Bill</option>
                  <option value="AUTH_REPRESENTATIVE_LETTER">Signatory Letter</option>
                </select>

                <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                  <UploadCloud className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                    {doc3FileName ? doc3FileName.substring(0, 18) + '...' : 'Upload Utility / NOC'}
                  </span>
                  <span className="text-[9px] text-slate-400">PDF, PNG, JPG (Max 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        (fileName, base64) => {
                          setDoc3FileName(fileName);
                          setDoc3Base64(base64);
                        },
                        (msg) => setModalError(msg)
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* ---------------- EDIT Flat & Resident Modal ---------------- */}
      {editingHousehold && (
        <Modal
          isOpen={true}
          onClose={() => setEditingHousehold(null)}
          title={`Edit Flat ${editingHousehold.flatNumber}`}
          subtitle="Update flat configuration, meter serial number, and assigned resident profile"
          maxWidth="2xl"
          footer={
            <div className="flex flex-col sm:flex-row justify-end gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setEditingHousehold(null)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-household-form"
                disabled={editSubmitting}
                className="w-full sm:w-auto rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 cursor-pointer text-center"
              >
                {editSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          }
        >
          {editError && (
            <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{editError}</span>
            </div>
          )}

          <form id="edit-household-form" onSubmit={handleUpdateHousehold} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Flat Unit Info */}
              <div className="space-y-3 rounded-2xl bg-slate-50/70 dark:bg-[#0B1120]/50 p-4 border border-slate-200/70 dark:border-slate-800">
                <div className="border-b border-slate-200/80 dark:border-slate-800 pb-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5" />
                    Flat Unit Details
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Flat Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFlatNumber}
                    onChange={(e) => setEditFlatNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meter Serial Number
                  </label>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={editMeterSerial}
                      onChange={(e) => setEditMeterSerial(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] pl-8 pr-3 py-1.5 font-mono text-xs font-bold text-brand-700 dark:text-brand-400 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Area (Sq. Ft)
                    </label>
                    <input
                      type="number"
                      min="100"
                      value={editAreaSqft}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setEditAreaSqft('');
                        } else {
                          const parsed = parseFloat(val);
                          setEditAreaSqft(isNaN(parsed) ? '' : parsed);
                        }
                      }}
                      onBlur={() => {
                        if (editAreaSqft === '' || Number(editAreaSqft) < 100) {
                          setEditAreaSqft(1200);
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Occupancy Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={editOccupancy}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setEditOccupancy('');
                        } else {
                          const parsed = parseInt(val, 10);
                          setEditOccupancy(isNaN(parsed) ? '' : parsed);
                        }
                      }}
                      onBlur={() => {
                        if (editOccupancy === '' || Number(editOccupancy) < 1) {
                          setEditOccupancy(1);
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="editHasMeter"
                    checked={editHasMeter}
                    onChange={(e) => setEditHasMeter(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <label htmlFor="editHasMeter" className="text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Has active water meter installed
                  </label>
                </div>
              </div>

              {/* Right Column: Resident Contact */}
              <div className="space-y-3 rounded-2xl bg-slate-50/70 dark:bg-[#0B1120]/50 p-4 border border-slate-200/70 dark:border-slate-800">
                <div className="border-b border-slate-200/80 dark:border-slate-800 pb-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Resident Profile
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resident Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={editResidentName}
                      onChange={(e) => setEditResidentName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resident Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={editResidentEmail}
                      onChange={(e) => setEditResidentEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={editResidentPhone}
                      onChange={(e) => setEditResidentPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as AccountStatus)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE (Authorized - Login Enabled)</option>
                    <option value="INACTIVE">INACTIVE (Temporarily Disabled - Login Blocked)</option>
                    <option value="BLOCKED">BLOCKED (Suspended / Locked - Login Forbidden)</option>
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL (Under Main Admin Verification)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Replace 3 Documents Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1120]/50 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-brand-600" />
                <span>Replace / Update Verification Documents</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Edit Doc 1 */}
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] text-xs space-y-1.5">
                  <span className="font-bold text-[11px] block">1. Flat Ownership / Rent Agreement</span>
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                    <UploadCloud className="h-3.5 w-3.5 text-slate-400 mb-0.5" />
                    <span className="text-[10px] font-semibold text-brand-600 truncate max-w-[120px]">
                      {editDoc1FileName || 'Upload replacement'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(
                          e,
                          (fileName, base64) => {
                            setEditDoc1FileName(fileName);
                            setEditDoc1Base64(base64);
                          },
                          (msg) => setEditError(msg)
                        )
                      }
                    />
                  </label>
                </div>

                {/* Edit Doc 2 */}
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] text-xs space-y-1.5">
                  <span className="font-bold text-[11px] block">2. Government ID Proof</span>
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                    <UploadCloud className="h-3.5 w-3.5 text-slate-400 mb-0.5" />
                    <span className="text-[10px] font-semibold text-brand-600 truncate max-w-[120px]">
                      {editDoc2FileName || 'Upload replacement'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(
                          e,
                          (fileName, base64) => {
                            setEditDoc2FileName(fileName);
                            setEditDoc2Base64(base64);
                          },
                          (msg) => setEditError(msg)
                        )
                      }
                    />
                  </label>
                </div>

                {/* Edit Doc 3 */}
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] text-xs space-y-1.5">
                  <span className="font-bold text-[11px] block">3. Signatory / Utility Proof</span>
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                    <UploadCloud className="h-3.5 w-3.5 text-slate-400 mb-0.5" />
                    <span className="text-[10px] font-semibold text-brand-600 truncate max-w-[120px]">
                      {editDoc3FileName || 'Upload replacement'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(
                          e,
                          (fileName, base64) => {
                            setEditDoc3FileName(fileName);
                            setEditDoc3Base64(base64);
                          },
                          (msg) => setEditError(msg)
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------- 3-DOC DOSSIER & AI VERIFICATION INSPECTOR MODAL ---------------- */}
      {viewingHousehold && (
        <Modal
          isOpen={true}
          onClose={() => setViewingHousehold(null)}
          title={`Verification Package — Flat ${viewingHousehold.flatNumber}`}
          subtitle="Inspect uploaded 3-document package and AI authenticity audit findings"
          maxWidth="3xl"
        >
          <div className="space-y-4">
            {/* Header info */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {viewingHousehold.residentName || `Resident Flat ${viewingHousehold.flatNumber}`}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {viewingHousehold.residentEmail || 'No email provided'} • {viewingHousehold.residentPhone || 'No phone'}
                </p>
              </div>
              <div>{renderAiBadge(viewingHousehold.aiVerificationScore, viewingHousehold.aiVerificationStatus)}</div>
            </div>

            {/* AI Audit Findings */}
            {viewingHousehold.aiVerificationSummary && (
              <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 p-3.5 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300">
                  <Bot className="h-4 w-4" />
                  <span>AI Authenticity Engine Analysis</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {viewingHousehold.aiVerificationSummary}
                </p>
              </div>
            )}

            {/* 3-Doc Tabs */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveDocTab('DOC1')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeDocTab === 'DOC1'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>1. Flat Proof</span>
                  {viewingHousehold.doc1Url ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDocTab('DOC2')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeDocTab === 'DOC2'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>2. Govt ID</span>
                  {viewingHousehold.doc2Url ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDocTab('DOC3')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeDocTab === 'DOC3'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>3. Signatory/Utility</span>
                  {viewingHousehold.doc3Url ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  )}
                </button>
              </div>

              {/* Active Doc Subtitle */}
              {(() => {
                let docUrl: string | undefined;
                let docType: string | undefined;
                let docName: string | undefined;
                let label = '';

                if (activeDocTab === 'DOC1') {
                  docUrl = viewingHousehold.doc1Url;
                  docType = viewingHousehold.doc1Type || 'Flat Ownership Proof';
                  docName = viewingHousehold.doc1FileName || 'flat_proof.pdf';
                  label = 'Flat Ownership / Registered Rent Agreement';
                } else if (activeDocTab === 'DOC2') {
                  docUrl = viewingHousehold.doc2Url;
                  docType = viewingHousehold.doc2Type || 'Government ID Proof';
                  docName = viewingHousehold.doc2FileName || 'govt_id.pdf';
                  label = 'Government ID (Aadhaar / Passport / Voter ID)';
                } else {
                  docUrl = viewingHousehold.doc3Url;
                  docType = viewingHousehold.doc3Type || 'Utility / Signatory Proof';
                  docName = viewingHousehold.doc3FileName || 'signatory_utility_proof.pdf';
                  label = 'Utility Bill / Landlord NOC / Representative Proof';
                }

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{label}</span>
                        <span className="text-slate-400 text-[11px] ml-2 font-mono">({docType} • {docName})</span>
                      </div>
                      {docUrl && (
                        <a
                          href={docUrl}
                          download={docName}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </a>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900/5 dark:bg-black/30 p-2 overflow-hidden flex flex-col items-center justify-center min-h-[350px]">
                      {!docUrl ? (
                        <div className="text-center py-16 text-slate-400">
                          <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                          <p className="text-xs font-semibold">No digital document attached for this requirement.</p>
                        </div>
                      ) : docUrl.startsWith('data:image') || docName.match(/\.(png|jpe?g|webp|gif)$/i) ? (
                        <img
                          src={docUrl}
                          alt="Verification Document Preview"
                          className="max-h-[420px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                        />
                      ) : (
                        <iframe
                          src={docUrl}
                          title="Verification PDF Document"
                          className="w-full h-[450px] rounded-lg border-0 bg-white"
                        />
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewingHousehold(null)}
                className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------- DELETE Confirmation Modal ---------------- */}
      {deletingHousehold && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingHousehold(null)}
          title="Delete Flat & Resident"
          subtitle="Are you sure you want to remove this flat from the community?"
          maxWidth="sm"
          footer={
            <div className="flex flex-col sm:flex-row justify-end gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setDeletingHousehold(null)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteHousehold}
                disabled={deleteSubmitting}
                className="w-full sm:w-auto rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 cursor-pointer text-center"
              >
                {deleteSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          }
        >
          {deleteError && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 p-4 text-xs text-rose-900 dark:text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Permanent Removal Warning</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Deleting <strong>Flat {deletingHousehold.flatNumber}</strong> (Meter: <code>{deletingHousehold.meterSerialNumber || `MTR-${deletingHousehold.flatNumber}`}</code>) will permanently remove its assigned resident account, recorded meter reading logs, and water alerts from the database.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------- Email Credentials Modal ---------------- */}
      {credentialsHousehold && (
        <Modal
          isOpen={true}
          onClose={() => setCredentialsHousehold(null)}
          title={`Email Login Credentials — Flat ${credentialsHousehold.flatNumber}`}
          subtitle="Dispatches welcome email with login link, assigned meter serial, and temporary password"
          maxWidth="md"
          footer={
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setCredentialsHousehold(null)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingCredentials}
                onClick={handleDispatchCredentials}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 cursor-pointer transition-all text-center"
              >
                <Mail className={`h-3.5 w-3.5 ${sendingCredentials ? 'animate-spin' : ''}`} />
                <span>{sendingCredentials ? 'Dispatching Email...' : 'Send Credentials Email'}</span>
              </button>
            </div>
          }
        >
          {credentialsModalError && (
            <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{credentialsModalError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] p-4 text-xs space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Flat Unit:</span>
                <span className="font-bold text-slate-900 dark:text-white">Flat {credentialsHousehold.flatNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Meter Serial:</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{credentialsHousehold.meterSerialNumber || `MTR-${credentialsHousehold.flatNumber}`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Resident Name:</span>
                <span className="font-semibold">{credentialsHousehold.residentName || `Resident Flat ${credentialsHousehold.flatNumber}`}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Recipient Email Address
                </label>
                <button
                  type="button"
                  onClick={() => setCredentialsEmail('jainakshay0804@gmail.com')}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  Use Admin Email (Test)
                </button>
              </div>
              <input
                type="email"
                required
                value={credentialsEmail}
                onChange={(e) => setCredentialsEmail(e.target.value)}
                placeholder="resident@example.com or your email"
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-[#0B1120] dark:text-white"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                The resident will receive an email with their assigned flat, meter, login URL, and credentials.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------- Success Notification Modal ---------------- */}
      {createdSuccess && (
        <Modal
          isOpen={true}
          onClose={() => setCreatedSuccess(null)}
          title="Resident Submitted for Verification"
          subtitle="3-Document package analyzed by AI and forwarded to Main Admin for final authorization"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Application Routed to Main Admin Queue!</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                The resident application for <strong>{createdSuccess.residentName}</strong> (Flat {createdSuccess.flatNumber}) has been pre-verified by AI and placed in the Main Admin&apos;s pending approvals queue. An under-review notification email was sent to <strong>{createdSuccess.residentEmail}</strong>.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Flat Unit</span>
                <span className="font-bold text-slate-900 dark:text-white">Flat {createdSuccess.flatNumber}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Meter Serial</span>
                <span className="font-mono font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/80 px-2 py-0.5 rounded">
                  {createdSuccess.meterSerialNumber}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Resident Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{createdSuccess.residentName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Login Email</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{createdSuccess.residentEmail}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Temporary Password</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                  {createdSuccess.temporaryPassword}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Self-Registration Invite Code</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{createdSuccess.inviteCode}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCreatedSuccess(null)}
                className="rounded-xl bg-brand-600 px-6 py-2 text-xs font-bold text-white hover:bg-brand-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
