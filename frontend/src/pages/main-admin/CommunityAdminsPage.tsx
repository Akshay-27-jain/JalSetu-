import React, { useState, useEffect } from 'react';
import { mainAdminApi, extractErrorMessage } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  Users,
  Droplets,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Gauge,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Download,
  Clock,
  FileText,
  FileCheck,
  XCircle,
  ExternalLink,
  Sparkles,
  Bot,
  Check,
  AlertCircle,
  UploadCloud,
  Sliders,
  Zap,
} from 'lucide-react';
import type {
  CommunityAdminDetail,
  UpdateCommunityAdminRequest,
  PlatformHousehold,
  AccountStatus,
  PendingVerification,
} from '../../types';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const CommunityAdminsPage: React.FC = () => {
  const { confirm } = useConfirm();
  // Main Tab State: 'ADMINS' | 'PENDING_APPROVALS' | 'ALL_RESIDENTS'
  const [activeTab, setActiveTab] = useState<'ADMINS' | 'PENDING_APPROVALS' | 'ALL_RESIDENTS'>('ADMINS');

  const [admins, setAdmins] = useState<CommunityAdminDetail[]>([]);
  const [allHouseholds, setAllHouseholds] = useState<PlatformHousehold[]>([]);
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [societyFilter, setSocietyFilter] = useState<string>('ALL');

  // Pending Approvals Filters
  const [verifStatusFilter, setVerifStatusFilter] = useState<'PENDING_ONLY' | 'REJECTED_ONLY' | 'ALL'>('PENDING_ONLY');
  const [verifRoleFilter, setVerifRoleFilter] = useState<'ALL' | 'COMMUNITY_ADMIN' | 'RESIDENT'>('ALL');
  const [verifRiskFilter, setVerifRiskFilter] = useState<'ALL' | 'AUTHENTIC' | 'NEEDS_REVIEW' | 'SUSPICIOUS_OR_FAKE'>('ALL');

  // Verification Review Modals
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'DOC1' | 'DOC2' | 'DOC3'>('DOC1');
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [aiScanningId, setAiScanningId] = useState<string | null>(null);

  // Re-run AI Analysis Options Modal State
  const [isRerunModalOpen, setIsRerunModalOpen] = useState(false);
  const [rerunTarget, setRerunTarget] = useState<PendingVerification | null>(null);
  const [rerunScanMode, setRerunScanMode] = useState<'DEEP_FORENSIC' | 'STRICT_FRAUD' | 'FAST_HEURISTIC'>('DEEP_FORENSIC');
  const [rerunCheckDuplicates, setRerunCheckDuplicates] = useState(true);
  const [rerunCheckNameMatch, setRerunCheckNameMatch] = useState(true);
  const [rerunCheckAddressMatch, setRerunCheckAddressMatch] = useState(true);
  const [rerunCheckStampSeal, setRerunCheckStampSeal] = useState(true);
  const [rerunCheckTampering, setRerunCheckTampering] = useState(true);

  // Selected Admin for Modals
  const [selectedAdmin, setSelectedAdmin] = useState<CommunityAdminDetail | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);

  // View Modal Active Sub-Tab
  const [viewModalTab, setViewModalTab] = useState<'OVERVIEW' | 'RESIDENTS'>('RESIDENTS');
  const [modalResidentSearch, setModalResidentSearch] = useState('');

  // Edit Form State
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editStatus, setEditStatus] = useState<AccountStatus>('ACTIVE');
  const [editAptName, setEditAptName] = useState('');
  const [editAptAddress, setEditAptAddress] = useState('');
  const [editTotalHouseholds, setEditTotalHouseholds] = useState<number>(20);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Household View & Edit Modal for Main Admin
  const [selectedHousehold, setSelectedHousehold] = useState<PlatformHousehold | null>(null);
  const [isHouseholdModalOpen, setIsHouseholdModalOpen] = useState(false);
  const [editHouseholdFlat, setEditHouseholdFlat] = useState('');
  const [editHouseholdResidentName, setEditHouseholdResidentName] = useState('');
  const [editHouseholdResidentEmail, setEditHouseholdResidentEmail] = useState('');
  const [editHouseholdResidentPhone, setEditHouseholdResidentPhone] = useState('');
  const [editHouseholdMeter, setEditHouseholdMeter] = useState('');
  const [editHouseholdArea, setEditHouseholdArea] = useState<number>(1200);
  const [editHouseholdOccupancy, setEditHouseholdOccupancy] = useState<number>(2);
  const [editHouseholdHasMeter, setEditHouseholdHasMeter] = useState<boolean>(true);
  const [editHouseholdStatus, setEditHouseholdStatus] = useState<AccountStatus>('ACTIVE');
  const [savingHousehold, setSavingHousehold] = useState(false);
  const [householdModalError, setHouseholdModalError] = useState<string | null>(null);

  // Onboard New Form State
  const [newAptName, setNewAptName] = useState('');
  const [newAptAddress, setNewAptAddress] = useState('');
  const [newTotalHouseholds, setNewTotalHouseholds] = useState<number>(20);
  const [newAdminFullName, setNewAdminFullName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Onboard 3-Document Package State
  const [newDoc1Type, setNewDoc1Type] = useState('SOCIETY_REGISTRATION_DEED');
  const [newDoc1FileName, setNewDoc1FileName] = useState('');
  const [newDoc1Base64, setNewDoc1Base64] = useState('');

  const [newDoc2Type, setNewDoc2Type] = useState('GOVERNMENT_ID_PROOF');
  const [newDoc2FileName, setNewDoc2FileName] = useState('');
  const [newDoc2Base64, setNewDoc2Base64] = useState('');

  const [newDoc3Type, setNewDoc3Type] = useState('RWA_BOARD_RESOLUTION');
  const [newDoc3FileName, setNewDoc3FileName] = useState('');
  const [newDoc3Base64, setNewDoc3Base64] = useState('');

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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [adminsData, householdsData, verificationsData] = await Promise.all([
        mainAdminApi.getCommunityAdmins(),
        mainAdminApi.getAllHouseholds(),
        mainAdminApi.getPendingVerifications(),
      ]);
      setAdmins(adminsData);
      setAllHouseholds(householdsData);
      setVerifications(verificationsData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Approve Verification (supports both Community Admin & Resident)
  const handleApproveVerification = async (v: PendingVerification) => {
    const isResident = v.verificationType === 'RESIDENT';
    const targetId = isResident ? (v.userId || 0) : (v.apartmentId || 0);
    const targetName = isResident
      ? `Resident ${v.adminFullName} (Flat ${v.flatNumber || ''}, ${v.apartmentName})`
      : `Community Admin ${v.adminFullName} (${v.apartmentName})`;

    const confirmed = await confirm({
      title: 'Approve & Activate Account',
      message: `Are you sure you want to verify and approve ${targetName}? Their account will be activated and an email notification will be dispatched immediately.`,
      confirmText: 'Verify & Activate',
      cancelText: 'Cancel',
      variant: 'primary',
    });
    if (!confirmed) return;
    try {
      setReviewSubmitting(true);
      await mainAdminApi.reviewVerification({
        action: 'APPROVE',
        verificationType: v.verificationType || 'COMMUNITY_ADMIN',
        targetId,
      });
      setSuccessMessage(`Successfully approved ${targetName}. Account is now ACTIVE and notification email has been dispatched.`);
      setTimeout(() => setSuccessMessage(null), 6000);
      setIsDocViewerOpen(false);
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleOpenRejectModal = (v: PendingVerification) => {
    setSelectedVerification(v);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  // Reject Verification (supports both Community Admin & Resident)
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerification) return;
    const isResident = selectedVerification.verificationType === 'RESIDENT';
    const targetId = isResident ? (selectedVerification.userId || 0) : (selectedVerification.apartmentId || 0);

    try {
      setReviewSubmitting(true);
      await mainAdminApi.reviewVerification({
        action: 'REJECT',
        verificationType: selectedVerification.verificationType || 'COMMUNITY_ADMIN',
        targetId,
        notes: rejectReason,
      });
      setSuccessMessage(
        `Verification for "${selectedVerification.adminFullName}" marked as REJECTED with feedback notes sent to ${selectedVerification.adminEmail}.`
      );
      setTimeout(() => setSuccessMessage(null), 6000);
      setIsRejectModalOpen(false);
      setIsDocViewerOpen(false);
      setSelectedVerification(null);
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Open AI Scan Options Configuration Popup Modal
  const openRerunModal = (v: PendingVerification) => {
    setRerunTarget(v);
    setRerunScanMode('DEEP_FORENSIC');
    setRerunCheckDuplicates(true);
    setRerunCheckNameMatch(true);
    setRerunCheckAddressMatch(true);
    setRerunCheckStampSeal(true);
    setRerunCheckTampering(true);
    setIsRerunModalOpen(true);
  };

  // Trigger on-demand AI Verification Scan (Opens configuration popup)
  const handleTriggerAiScan = (v: PendingVerification) => {
    openRerunModal(v);
  };

  // Execute AI Scan with user-selected scan options
  const handleExecuteRerunScan = async () => {
    if (!rerunTarget) return;
    const isResident = rerunTarget.verificationType === 'RESIDENT';
    const targetId = isResident ? (rerunTarget.userId || 0) : (rerunTarget.apartmentId || 0);
    const scanKey = `${rerunTarget.verificationType}_${targetId}`;

    try {
      setAiScanningId(scanKey);
      const updated = await mainAdminApi.triggerAiScan({
        verificationType: rerunTarget.verificationType || 'COMMUNITY_ADMIN',
        targetId,
        scanMode: rerunScanMode,
        checkDuplicates: rerunCheckDuplicates,
        checkNameMatch: rerunCheckNameMatch,
        checkAddressMatch: rerunCheckAddressMatch,
        checkStampSeal: rerunCheckStampSeal,
        checkTampering: rerunCheckTampering,
      });

      // Update local lists
      setVerifications((prev) =>
        prev.map((item) => {
          const itemKey = `${item.verificationType}_${item.verificationType === 'RESIDENT' ? item.userId : item.apartmentId}`;
          return itemKey === scanKey ? { ...item, ...updated } : item;
        })
      );

      // If the inspected verification modal is currently open for this target, update it live
      if (selectedVerification) {
        const selKey = `${selectedVerification.verificationType}_${selectedVerification.verificationType === 'RESIDENT' ? selectedVerification.userId : selectedVerification.apartmentId}`;
        if (selKey === scanKey) {
          setSelectedVerification((prev) => (prev ? { ...prev, ...updated } : prev));
        }
      }

      setSuccessMessage(
        `AI Authenticity scan complete for ${rerunTarget.adminFullName}: Score ${updated.aiVerificationScore || 0}% (${updated.aiVerificationStatus}) [Mode: ${rerunScanMode.replace('_', ' ')}]`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
      setIsRerunModalOpen(false);
      setRerunTarget(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setAiScanningId(null);
    }
  };

  // Permanently Delete Verification Application (Community or Resident)
  const handleDeleteVerification = async (v: PendingVerification) => {
    const isResident = v.verificationType === 'RESIDENT';
    const targetName = isResident
      ? `resident application for "${v.adminFullName}" (Flat ${v.flatNumber || 'N/A'}, ${v.apartmentName})`
      : `community application for "${v.apartmentName}" (Admin: ${v.adminFullName})`;

    const confirmed = await confirm({
      title: 'Permanently Delete Application',
      message: `Are you sure you want to permanently delete and remove this ${targetName}? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      setReviewSubmitting(true);
      if (isResident && v.householdId) {
        await communityAdminApi.deleteHousehold(v.householdId);
      } else if (v.apartmentId) {
        await mainAdminApi.deleteApartment(v.apartmentId);
      }
      setSuccessMessage(`Successfully deleted ${targetName}.`);
      setTimeout(() => setSuccessMessage(null), 5000);
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Quick stats computed
  const totalAdminsCount = admins.length;
  const totalApartmentsCount = new Set(admins.map((a) => a.apartmentId).filter(Boolean)).size;
  const totalHouseholdsManaged = admins.reduce((acc, a) => acc + (a.totalHouseholds || 0), 0);
  const totalActiveMeters = allHouseholds.filter((h) => h.meterSerialNumber && h.meterSerialNumber.trim() !== '').length;

  // Search Filter for Admins
  const filteredAdmins = admins.filter((admin) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      admin.adminName.toLowerCase().includes(term) ||
      admin.adminEmail.toLowerCase().includes(term) ||
      (admin.adminPhone && admin.adminPhone.toLowerCase().includes(term)) ||
      admin.apartmentName.toLowerCase().includes(term) ||
      (admin.apartmentAddress && admin.apartmentAddress.toLowerCase().includes(term))
    );
  });

  // Search & Filter for All Platform Residents
  const filteredPlatformResidents = allHouseholds.filter((h) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSociety = societyFilter === 'ALL' || h.apartmentName === societyFilter;
    const matchesSearch =
      !term ||
      h.flatNumber.toLowerCase().includes(term) ||
      (h.residentName && h.residentName.toLowerCase().includes(term)) ||
      (h.residentEmail && h.residentEmail.toLowerCase().includes(term)) ||
      (h.residentPhone && h.residentPhone.toLowerCase().includes(term)) ||
      (h.meterSerialNumber && h.meterSerialNumber.toLowerCase().includes(term)) ||
      h.apartmentName.toLowerCase().includes(term);

    return matchesSociety && matchesSearch;
  });

  // Search & Filter for Pending Verifications
  const filteredVerifications = verifications.filter((v) => {
    // Status filter: Default PENDING_ONLY, or REJECTED_ONLY, or ALL
    if (verifStatusFilter === 'PENDING_ONLY' && v.status !== 'PENDING_APPROVAL') return false;
    if (verifStatusFilter === 'REJECTED_ONLY' && v.status !== 'REJECTED') return false;

    // Role filter
    if (verifRoleFilter === 'COMMUNITY_ADMIN' && v.verificationType !== 'COMMUNITY_ADMIN') return false;
    if (verifRoleFilter === 'RESIDENT' && v.verificationType !== 'RESIDENT') return false;

    // Risk filter
    if (verifRiskFilter === 'AUTHENTIC' && (v.aiVerificationScore || 0) < 80) return false;
    if (
      verifRiskFilter === 'NEEDS_REVIEW' &&
      ((v.aiVerificationScore || 0) >= 80 || v.aiVerificationStatus === 'REJECTED_FAKE')
    )
      return false;
    if (
      verifRiskFilter === 'SUSPICIOUS_OR_FAKE' &&
      v.aiVerificationStatus !== 'REJECTED_FAKE' &&
      v.aiVerificationStatus !== 'SUSPICIOUS'
    )
      return false;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      v.apartmentName.toLowerCase().includes(term) ||
      v.adminFullName.toLowerCase().includes(term) ||
      v.adminEmail.toLowerCase().includes(term) ||
      (v.flatNumber && v.flatNumber.toLowerCase().includes(term)) ||
      (v.adminPhone && v.adminPhone.toLowerCase().includes(term)) ||
      (v.doc1Type && v.doc1Type.toLowerCase().includes(term)) ||
      (v.doc2Type && v.doc2Type.toLowerCase().includes(term)) ||
      (v.doc3Type && v.doc3Type.toLowerCase().includes(term)) ||
      (v.aiVerificationStatus && v.aiVerificationStatus.toLowerCase().includes(term)) ||
      (v.status && v.status.toLowerCase().includes(term))
    );
  });

  // Counts for Pending Approvals Tabs
  const pendingActionCount = verifications.filter((v) => v.status === 'PENDING_APPROVAL').length;
  const rejectedHistoryCount = verifications.filter((v) => v.status === 'REJECTED').length;
  const pendingAdminCount = verifications.filter(
    (v) =>
      v.verificationType === 'COMMUNITY_ADMIN' &&
      (verifStatusFilter === 'ALL' ||
        (verifStatusFilter === 'PENDING_ONLY' ? v.status === 'PENDING_APPROVAL' : v.status === 'REJECTED'))
  ).length;
  const pendingResidentCount = verifications.filter(
    (v) =>
      v.verificationType === 'RESIDENT' &&
      (verifStatusFilter === 'ALL' ||
        (verifStatusFilter === 'PENDING_ONLY' ? v.status === 'PENDING_APPROVAL' : v.status === 'REJECTED'))
  ).length;
  const highRiskCount = verifications.filter(
    (v) =>
      (v.aiVerificationStatus === 'REJECTED_FAKE' || v.aiVerificationStatus === 'SUSPICIOUS') &&
      (verifStatusFilter === 'ALL' ||
        (verifStatusFilter === 'PENDING_ONLY' ? v.status === 'PENDING_APPROVAL' : v.status === 'REJECTED'))
  ).length;

  // Pagination States
  const [adminPage, setAdminPage] = useState(1);
  const [adminPageSize, setAdminPageSize] = useState(10);

  const [resPage, setResPage] = useState(1);
  const [resPageSize, setResPageSize] = useState(10);

  const [verifPage, setVerifPage] = useState(1);
  const [verifPageSize, setVerifPageSize] = useState(10);

  useEffect(() => {
    setAdminPage(1);
    setResPage(1);
    setVerifPage(1);
  }, [searchTerm, societyFilter, verifRoleFilter, verifRiskFilter, activeTab]);

  const totalAdminPages = Math.ceil(filteredAdmins.length / adminPageSize) || 1;
  const paginatedAdmins = filteredAdmins.slice((adminPage - 1) * adminPageSize, adminPage * adminPageSize);

  const totalResPages = Math.ceil(filteredPlatformResidents.length / resPageSize) || 1;
  const paginatedPlatformResidents = filteredPlatformResidents.slice((resPage - 1) * resPageSize, resPage * resPageSize);

  const totalVerifPages = Math.ceil(filteredVerifications.length / verifPageSize) || 1;
  const paginatedVerifications = filteredVerifications.slice((verifPage - 1) * verifPageSize, verifPage * verifPageSize);

  // Status helper styling
  const getStatusSelectClass = (status?: AccountStatus) => {
    switch (status) {
      case 'INACTIVE':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 focus:ring-amber-500';
      case 'BLOCKED':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 focus:ring-rose-500';
      case 'ACTIVE':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500';
    }
  };

  // Status Change Handlers
  const handleAdminStatusChange = async (adminId: number, newStatus: AccountStatus) => {
    const admin = admins.find((a) => a.adminId === adminId);
    const originalStatus = admin?.status || 'ACTIVE';
    setAdmins((prev) => prev.map((a) => (a.adminId === adminId ? { ...a, status: newStatus } : a)));
    try {
      await mainAdminApi.updateCommunityAdminStatus(adminId, newStatus);
      setSuccessMessage(`Account status for ${admin?.adminName || 'Admin'} set to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setAdmins((prev) => prev.map((a) => (a.adminId === adminId ? { ...a, status: originalStatus } : a)));
      setError(extractErrorMessage(err));
    }
  };

  const handleResidentStatusChange = async (householdId: number, newStatus: AccountStatus) => {
    const h = allHouseholds.find((item) => item.id === householdId);
    const originalStatus = h?.status || 'ACTIVE';
    setAllHouseholds((prev) => prev.map((item) => (item.id === householdId ? { ...item, status: newStatus } : item)));
    try {
      await mainAdminApi.updateHouseholdStatus(householdId, newStatus);
      setSuccessMessage(`Account status for Flat ${h?.flatNumber || ''} (${h?.residentName || 'Resident'}) set to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setAllHouseholds((prev) => prev.map((item) => (item.id === householdId ? { ...item, status: originalStatus } : item)));
      setError(extractErrorMessage(err));
    }
  };

  // Open View Modal
  const handleOpenView = async (admin: CommunityAdminDetail) => {
    try {
      const detailed = await mainAdminApi.getCommunityAdminById(admin.adminId);
      setSelectedAdmin(detailed);
    } catch {
      setSelectedAdmin(admin);
    }
    setViewModalTab('RESIDENTS');
    setModalResidentSearch('');
    setIsViewModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (admin: CommunityAdminDetail) => {
    setSelectedAdmin(admin);
    setEditFullName(admin.adminName);
    setEditEmail(admin.adminEmail);
    setEditPhone(admin.adminPhone || '');
    setEditPassword('');
    setEditStatus(admin.status || 'ACTIVE');
    setEditAptName(admin.apartmentName);
    setEditAptAddress(admin.apartmentAddress || '');
    setEditTotalHouseholds(admin.totalHouseholds || 20);
    setModalError(null);
    setIsEditModalOpen(true);
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    if (!editFullName.trim() || !editEmail.trim() || !editAptName.trim()) {
      setModalError('Please fill in all required fields.');
      return;
    }
    try {
      setFormSubmitting(true);
      setModalError(null);
      const payload: UpdateCommunityAdminRequest = {
        adminFullName: editFullName.trim(),
        adminEmail: editEmail.trim(),
        adminPhone: editPhone.trim() || undefined,
        adminPassword: editPassword.trim() || undefined,
        status: editStatus,
        apartmentName: editAptName.trim(),
        apartmentAddress: editAptAddress.trim() || undefined,
        totalHouseholds: editTotalHouseholds,
      };
      const updated = await mainAdminApi.updateCommunityAdmin(selectedAdmin.adminId, payload);
      setSuccessMessage(`Successfully updated details for ${updated.adminName} (${updated.apartmentName}).`);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      setModalError(extractErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Admin
  const handleOpenDelete = (admin: CommunityAdminDetail) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAdmin) return;
    try {
      setFormSubmitting(true);
      await mainAdminApi.deleteCommunityAdmin(selectedAdmin.adminId);
      setSuccessMessage(`Community Administrator ${selectedAdmin.adminName} and society ${selectedAdmin.apartmentName} have been deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedAdmin(null);
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
      setIsDeleteModalOpen(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Onboard New Community & Admin
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAptName.trim() || !newAdminFullName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim()) {
      setModalError('Please fill in all required fields.');
      return;
    }
    if (!newDoc1Base64) {
      setModalError('Document 1 (Society Registration Deed / Property Proof) is mandatory.');
      return;
    }
    if (!newDoc2Base64) {
      setModalError('Document 2 (Government ID Proof) is mandatory.');
      return;
    }
    if (!newDoc3Base64) {
      setModalError('Document 3 (RWA Board Resolution / Authorized Signatory Proof) is mandatory.');
      return;
    }

    const cleanPayload = (b64: string) => {
      if (!b64) return '';
      const idx = b64.indexOf(',');
      return idx !== -1 && idx < 100 ? b64.substring(idx + 1).trim() : b64.trim();
    };
    const p1 = cleanPayload(newDoc1Base64);
    const p2 = cleanPayload(newDoc2Base64);
    const p3 = cleanPayload(newDoc3Base64);
    if (p1 === p2 || p1 === p3 || p2 === p3) {
      setModalError('⚠️ Duplicate Document Error: All 3 verification documents must be distinct, separate files. Duplicate uploads detected.');
      return;
    }

    try {
      setFormSubmitting(true);
      setModalError(null);
      await mainAdminApi.createApartment({
        name: newAptName.trim(),
        address: newAptAddress.trim() || undefined,
        totalHouseholds: newTotalHouseholds,
        adminFullName: newAdminFullName.trim(),
        adminEmail: newAdminEmail.trim(),
        adminPhone: newAdminPhone.trim() || undefined,
        adminPassword: newAdminPassword,
        doc1Type: newDoc1Type,
        doc1FileName: newDoc1FileName,
        doc1Base64: newDoc1Base64,
        doc2Type: newDoc2Type,
        doc2FileName: newDoc2FileName,
        doc2Base64: newDoc2Base64,
        doc3Type: newDoc3Type,
        doc3FileName: newDoc3FileName,
        doc3Base64: newDoc3Base64,
      });
      setSuccessMessage(`Successfully onboarded ${newAptName} with administrator ${newAdminFullName}! AI document authenticity checks applied.`);
      setIsOnboardModalOpen(false);
      setNewAptName('');
      setNewAptAddress('');
      setNewTotalHouseholds(20);
      setNewAdminFullName('');
      setNewAdminEmail('');
      setNewAdminPhone('');
      setNewAdminPassword('');
      setNewDoc1FileName('');
      setNewDoc1Base64('');
      setNewDoc2FileName('');
      setNewDoc2Base64('');
      setNewDoc3FileName('');
      setNewDoc3Base64('');
      fetchData();
    } catch (err) {
      setModalError(extractErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filter residents within modal
  const modalFilteredResidents =
    selectedAdmin?.households?.filter((h) => {
      const term = modalResidentSearch.toLowerCase().trim();
      if (!term) return true;
      return (
        h.flatNumber.toLowerCase().includes(term) ||
        (h.residentName && h.residentName.toLowerCase().includes(term)) ||
        (h.residentEmail && h.residentEmail.toLowerCase().includes(term)) ||
        (h.residentPhone && h.residentPhone.toLowerCase().includes(term)) ||
        (h.meterSerialNumber && h.meterSerialNumber.toLowerCase().includes(term))
      );
    }) || [];

  // Open Household Edit Modal for Main Admin
  const handleOpenHouseholdModal = (h: PlatformHousehold) => {
    setSelectedHousehold(h);
    setEditHouseholdFlat(h.flatNumber);
    setEditHouseholdResidentName(h.residentName !== 'Vacant / Unregistered' ? h.residentName : '');
    setEditHouseholdResidentEmail(h.residentEmail !== 'N/A' ? h.residentEmail : '');
    setEditHouseholdResidentPhone(h.residentPhone || '');
    setEditHouseholdMeter(h.meterSerialNumber || '');
    setEditHouseholdArea(h.areaSqft || 1200);
    setEditHouseholdOccupancy(h.occupancyCount || 2);
    setEditHouseholdHasMeter(h.hasMeter ?? true);
    setEditHouseholdStatus(h.status || 'ACTIVE');
    setHouseholdModalError(null);
    setIsHouseholdModalOpen(true);
  };

  // Save Household Changes (Platform Main Admin)
  const handleSaveHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHousehold) return;
    if (!editHouseholdFlat.trim()) {
      setHouseholdModalError('Flat number is required');
      return;
    }

    try {
      setSavingHousehold(true);
      setHouseholdModalError(null);

      await mainAdminApi.updateHousehold(selectedHousehold.id, {
        flatNumber: editHouseholdFlat.trim(),
        meterSerialNumber: editHouseholdMeter.trim() || undefined,
        areaSqft: Number(editHouseholdArea),
        occupancyCount: Number(editHouseholdOccupancy),
        hasMeter: editHouseholdHasMeter,
        status: editHouseholdStatus,
        residentFullName: editHouseholdResidentName.trim() || undefined,
        residentEmail: editHouseholdResidentEmail.trim() || undefined,
        residentPhone: editHouseholdResidentPhone.trim() || undefined,
      });

      // Update state locally
      setAllHouseholds((prev) =>
        prev.map((item) =>
          item.id === selectedHousehold.id
            ? {
                ...item,
                flatNumber: editHouseholdFlat.trim(),
                meterSerialNumber: editHouseholdMeter.trim() || undefined,
                areaSqft: Number(editHouseholdArea),
                occupancyCount: Number(editHouseholdOccupancy),
                hasMeter: editHouseholdHasMeter,
                status: editHouseholdStatus,
                residentName: editHouseholdResidentName.trim() || 'Vacant / Unregistered',
                residentEmail: editHouseholdResidentEmail.trim() || 'N/A',
                residentPhone: editHouseholdResidentPhone.trim() || undefined,
              }
            : item
        )
      );

      setSuccessMessage(`Successfully updated Flat ${editHouseholdFlat} in ${selectedHousehold.apartmentName}!`);
      setTimeout(() => setSuccessMessage(null), 5000);
      setIsHouseholdModalOpen(false);
    } catch (err) {
      setHouseholdModalError(extractErrorMessage(err));
    } finally {
      setSavingHousehold(false);
    }
  };

  // Export Residents to CSV
  const handleExportResidentsCsv = () => {
    const headers = [
      'Society',
      'Flat Number',
      'Resident Name',
      'Email',
      'Phone',
      'Meter Serial #',
      'Occupancy',
      'Area (Sqft)',
      'Current Month Usage (kL)',
      'Invite Code',
    ];
    const rows = filteredPlatformResidents.map((h) => [
      `"${h.apartmentName.replace(/"/g, '""')}"`,
      `"${h.flatNumber}"`,
      `"${(h.residentName || 'Unassigned').replace(/"/g, '""')}"`,
      h.residentEmail || '',
      h.residentPhone || '',
      h.meterSerialNumber || '',
      h.occupancyCount || 0,
      h.areaSqft || 0,
      h.currentMonthConsumptionKl || 0,
      h.inviteCode || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JalSetu_Platform_Residents_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueSocieties = Array.from(new Set(allHouseholds.map((h) => h.apartmentName))).filter(Boolean);

  // Helper for rendering AI Authenticity Badges
  const renderAiScoreBadge = (score?: number, status?: string) => {
    const scoreVal = score ?? 0;
    if (status === 'REJECTED_FAKE') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/70 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
          <span>{scoreVal}% • Fake/Demo Flagged</span>
        </span>
      );
    }
    if (status === 'SUSPICIOUS' || scoreVal < 50) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/70 px-2.5 py-1 text-[11px] font-bold text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
          <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
          <span>{scoreVal}% • Suspicious Risk</span>
        </span>
      );
    }
    if (status === 'NEEDS_REVIEW' || scoreVal < 80) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/70 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
          <span>{scoreVal}% • Needs Review</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
        <span>{scoreVal}% • Authentic</span>
      </span>
    );
  };

  // Helper for rendering AI Risk Badges
  const renderRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;
    const level = riskLevel.toUpperCase();
    if (level === 'HIGH_RISK') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 text-[9px] font-extrabold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <ShieldAlert className="h-2.5 w-2.5 text-rose-600" /> High Risk
        </span>
      );
    }
    if (level === 'MODERATE_RISK') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
          <AlertTriangle className="h-2.5 w-2.5 text-amber-600" /> Mod Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" /> Low Risk
      </span>
    );
  };

  // Helper for modal document view active file
  const getActiveDocData = (v: PendingVerification | null, tab: 'DOC1' | 'DOC2' | 'DOC3') => {
    if (!v) return { url: undefined, type: undefined, name: undefined, label: '' };
    if (tab === 'DOC1') {
      return {
        url: v.doc1Url || v.documentUrl,
        type: v.doc1Type || v.documentType || 'Property / Flat Paper',
        name: v.doc1FileName || v.documentFileName || 'property_document.pdf',
        label: v.verificationType === 'RESIDENT' ? 'Flat Ownership / Rent Agreement' : 'Property / Society Registration Deed',
      };
    }
    if (tab === 'DOC2') {
      return {
        url: v.doc2Url,
        type: v.doc2Type || 'Government ID Proof',
        name: v.doc2FileName || 'government_id.pdf',
        label: 'Government ID (Aadhaar / Passport / Voter ID)',
      };
    }
    return {
      url: v.doc3Url,
      type: v.doc3Type || 'Authorized Signatory / Utility Bill',
      name: v.doc3FileName || 'signatory_utility_proof.pdf',
      label: v.verificationType === 'RESIDENT' ? 'Utility Bill / Landlord NOC' : 'RWA Board Resolution / Authorized Signatory Letter',
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Community Administrators & Residents Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Master directory of society administrators, flat households, resident contacts, and 3-document AI verification pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>

          {activeTab === 'ALL_RESIDENTS' && (
            <button
              type="button"
              onClick={handleExportResidentsCsv}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            >
              <Download className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setModalError(null);
              setIsOnboardModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard Community Admin</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <span className="flex-1">{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-800 dark:text-rose-200 animate-fade-in">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-800 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Community Admins"
          value={totalAdminsCount.toString()}
          subtitle="Authorized society managers"
          icon={ShieldCheck}
          variant="normal"
        />
        <StatCard
          title="Managed Communities"
          value={totalApartmentsCount.toString()}
          subtitle="Active residential societies"
          icon={Building2}
          variant="normal"
        />
        <StatCard
          title="Total Registered Flats"
          value={allHouseholds.length.toString()}
          subtitle={`Out of ${totalHouseholdsManaged} capacity units`}
          icon={Users}
          variant="billing"
        />
        <StatCard
          title="Pending Document Reviews"
          value={verifications.length.toString()}
          subtitle={`${pendingAdminCount} Admins • ${pendingResidentCount} Residents`}
          icon={Clock}
          variant="overuse"
        />
      </div>

      {/* Main View Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('ADMINS');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'ADMINS'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Community Administrators ({admins.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('PENDING_APPROVALS');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'PENDING_APPROVALS'
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Pending 3-Doc Approvals ({verifications.length})</span>
          {verifications.length > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-xs">
              {verifications.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('ALL_RESIDENTS');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'ALL_RESIDENTS'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>All Platform Residents ({allHouseholds.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'ADMINS'
                  ? 'Search by admin name, email, society...'
                  : activeTab === 'PENDING_APPROVALS'
                  ? 'Search applicant, flat #, society, email...'
                  : 'Search by resident name, flat #, email, phone...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1120] focus:outline-none transition-all"
            />
          </div>

          {activeTab === 'PENDING_APPROVALS' && (
            <>
              {/* Status Filter (Pending Queue vs Rejected History) */}
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setVerifStatusFilter('PENDING_ONLY')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    verifStatusFilter === 'PENDING_ONLY'
                      ? 'bg-white dark:bg-[#131B2E] text-amber-600 dark:text-amber-400 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  🟡 Pending Review ({pendingActionCount})
                </button>
                <button
                  type="button"
                  onClick={() => setVerifStatusFilter('REJECTED_ONLY')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    verifStatusFilter === 'REJECTED_ONLY'
                      ? 'bg-white dark:bg-[#131B2E] text-rose-600 dark:text-rose-400 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  🔴 Rejected Archive ({rejectedHistoryCount})
                </button>
                <button
                  type="button"
                  onClick={() => setVerifStatusFilter('ALL')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    verifStatusFilter === 'ALL'
                      ? 'bg-white dark:bg-[#131B2E] text-slate-900 dark:text-white shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({verifications.length})
                </button>
              </div>

              {/* Role Filter */}
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setVerifRoleFilter('ALL')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    verifRoleFilter === 'ALL'
                      ? 'bg-white dark:bg-[#131B2E] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Roles
                </button>
                <button
                  type="button"
                  onClick={() => setVerifRoleFilter('COMMUNITY_ADMIN')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    verifRoleFilter === 'COMMUNITY_ADMIN'
                      ? 'bg-white dark:bg-[#131B2E] text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Admins ({pendingAdminCount})
                </button>
                <button
                  type="button"
                  onClick={() => setVerifRoleFilter('RESIDENT')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    verifRoleFilter === 'RESIDENT'
                      ? 'bg-white dark:bg-[#131B2E] text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Residents ({pendingResidentCount})
                </button>
              </div>

              {/* AI Risk Filter */}
              <select
                value={verifRiskFilter}
                onChange={(e) => setVerifRiskFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All AI Risk Levels</option>
                <option value="AUTHENTIC">🟢 Authentic (Score 80%+)</option>
                <option value="NEEDS_REVIEW">🟡 Needs Review (Score &lt;80%)</option>
                <option value="SUSPICIOUS_OR_FAKE">🔴 Flagged / Suspicious ({highRiskCount})</option>
              </select>
            </>
          )}

          {activeTab === 'ALL_RESIDENTS' && uniqueSocieties.length > 1 && (
            <select
              value={societyFilter}
              onChange={(e) => setSocietyFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Communities ({uniqueSocieties.length})</option>
              {uniqueSocieties.map((soc) => (
                <option key={soc} value={soc}>
                  {soc}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
          <span>
            Showing{' '}
            <strong>
              {activeTab === 'ADMINS'
                ? filteredAdmins.length
                : activeTab === 'PENDING_APPROVALS'
                ? filteredVerifications.length
                : filteredPlatformResidents.length}
            </strong>{' '}
            records
          </span>
        </div>
      </div>

      {/* ---------------- TAB 1: COMMUNITY ADMINS TABLE ---------------- */}
      {activeTab === 'ADMINS' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
              <p className="mt-3 text-xs font-semibold">Loading administrators directory...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <ShieldCheck className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-200">No community administrators found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchTerm ? 'No results matched your search query.' : 'Click "Onboard Community Admin" to register a residential society.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 pl-6 pr-4 min-w-[200px]">Administrator</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Assigned Society</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Contact Info</th>
                      <th className="py-3.5 px-4 min-w-[160px]">Capacity & Occupancy</th>
                      <th className="py-3.5 px-4 min-w-[140px]">Meters & Usage</th>
                      <th className="py-3.5 px-4 min-w-[130px]">Status</th>
                      <th className="py-3.5 pl-4 pr-6 min-w-[120px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedAdmins.map((admin) => {
                      const occupancyRate =
                        admin.totalHouseholds > 0
                          ? Math.round((admin.registeredHouseholds / admin.totalHouseholds) * 100)
                          : 0;

                      return (
                        <tr key={admin.adminId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Administrator Profile */}
                          <td className="py-3.5 pl-6 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-950/80 font-bold text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                                {admin.adminName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white text-xs">{admin.adminName}</p>
                                <span className="font-mono text-[10px] text-slate-400">ID #{admin.adminId}</span>
                              </div>
                            </div>
                          </td>

                          {/* Assigned Society */}
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-bold text-brand-700 dark:text-brand-300 text-xs">{admin.apartmentName}</p>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                <span className="truncate max-w-[160px]">{admin.apartmentAddress || 'Location not specified'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                            <div className="space-y-1">
                              <a
                                href={`mailto:${admin.adminEmail}`}
                                className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                              >
                                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>{admin.adminEmail}</span>
                              </a>
                              {admin.adminPhone && (
                                <a
                                  href={`tel:${admin.adminPhone}`}
                                  className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                >
                                  <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span>{admin.adminPhone}</span>
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Capacity & Occupancy */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5 w-36">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {admin.registeredHouseholds} / {admin.totalHouseholds} Flats
                                </span>
                                <span className="font-bold text-brand-600 dark:text-brand-400">{occupancyRate}%</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                  className="h-full rounded-full bg-brand-500 transition-all duration-500"
                                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Meters & Usage */}
                          <td className="py-3.5 px-4 text-[11px]">
                            <div>
                              <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                                <Gauge className="h-3.5 w-3.5 text-brand-500" />
                                <span>{admin.activeMetersCount} Meters</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {admin.totalMonthlyConsumptionKl} kL this month
                              </p>
                            </div>
                          </td>

                          {/* Status Dropdown */}
                          <td className="py-3.5 px-4">
                            <select
                              value={admin.status || 'ACTIVE'}
                              onChange={(e) => handleAdminStatusChange(admin.adminId, e.target.value as AccountStatus)}
                              className={`text-[11px] font-bold rounded-xl px-2.5 py-1.5 border outline-none cursor-pointer transition-all ${getStatusSelectClass(
                                admin.status
                              )}`}
                              title="Update Community Admin status"
                            >
                              <option value="ACTIVE" className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300">
                                ● Active
                              </option>
                              <option value="INACTIVE" className="bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300">
                                ● Inactive
                              </option>
                              <option value="BLOCKED" className="bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300">
                                ● Blocked
                              </option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 pl-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenView(admin)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 transition-all cursor-pointer"
                                title="View Full Admin & Society Residents"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(admin)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-all cursor-pointer"
                                title="Edit Administrator & Community Info"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(admin)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer"
                                title="Delete Administrator"
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
                currentPage={adminPage}
                totalPages={totalAdminPages}
                totalItems={filteredAdmins.length}
                itemsPerPage={adminPageSize}
                onPageChange={setAdminPage}
                onItemsPerPageChange={(newSize) => {
                  setAdminPageSize(newSize);
                  setAdminPage(1);
                }}
                itemsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </div>
      )}

      {/* ---------------- TAB 2: PENDING APPROVALS QUEUE TABLE (3-DOC AI VERIFIED) ---------------- */}
      {activeTab === 'PENDING_APPROVALS' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161F30] shadow-card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
              <p className="mt-3 text-xs font-semibold">Loading verification queue...</p>
            </div>
          ) : filteredVerifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <FileCheck className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-200">No pending verification applications</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchTerm
                  ? 'No applications matched your search filters.'
                  : 'All community administrator and resident 3-document packages have been verified and processed.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1060px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 pl-6 pr-3 min-w-[190px] w-[210px]">Applicant & Role</th>
                      <th className="py-3.5 px-3 min-w-[150px] w-[170px]">Community Society</th>
                      <th className="py-3.5 px-3 min-w-[150px] w-[160px]">Contact Details</th>
                      <th className="py-3.5 px-3 min-w-[160px] w-[180px]">3-Document Package</th>
                      <th className="py-3.5 px-3 min-w-[150px] w-[165px]">AI Authenticity</th>
                      <th className="py-3.5 px-3 min-w-[100px] w-[110px]">Date</th>
                      <th className="py-3.5 px-3 min-w-[90px] w-[95px]">Status</th>
                      <th className="py-3.5 pl-3 pr-6 min-w-[130px] w-[140px] text-right">Review Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedVerifications.map((v) => {
                      const isResident = v.verificationType === 'RESIDENT';
                      const rowKey = `${v.verificationType}_${isResident ? v.userId : v.apartmentId}`;
                      const isScanningThis = aiScanningId === rowKey;

                      return (
                        <tr key={rowKey} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Applicant & Role */}
                          <td className="py-3.5 pl-6 pr-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs border ${
                                  isResident
                                    ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                                    : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                }`}
                              >
                                {v.adminFullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[120px]">{v.adminFullName}</p>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide shrink-0 ${
                                      isResident
                                        ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300'
                                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                                    }`}
                                  >
                                    {isResident ? `Resident (Flat ${v.flatNumber || 'N/A'})` : 'Admin'}
                                  </span>
                                </div>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {isResident ? `User #${v.userId}` : `Apt #${v.apartmentId}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Community Society */}
                          <td className="py-3.5 px-3">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[160px]">{v.apartmentName}</p>
                              {v.address && (
                                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                  <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                  <span className="truncate max-w-[140px]">{v.address}</span>
                                </div>
                              )}
                              {!isResident && v.totalHouseholds && (
                                <span className="text-[10px] text-slate-500 mt-0.5 inline-block font-mono">
                                  Capacity: {v.totalHouseholds} units
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Contact Details */}
                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                            <div className="space-y-1">
                              <a
                                href={`mailto:${v.adminEmail}`}
                                className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate max-w-[150px]"
                              >
                                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate">{v.adminEmail}</span>
                              </a>
                              {v.adminPhone && (
                                <a
                                  href={`tel:${v.adminPhone}`}
                                  className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                >
                                  <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span>{v.adminPhone}</span>
                                </a>
                              )}
                            </div>
                          </td>

                          {/* 3-Document Package */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedVerification(v);
                                    setActiveDocTab('DOC1');
                                    setIsDocViewerOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/60 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                                  title={`Doc 1: ${v.doc1Type || 'Property Proof'}`}
                                >
                                  <FileText className="h-3 w-3 text-brand-500" />
                                  <span>Doc 1</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedVerification(v);
                                    setActiveDocTab('DOC2');
                                    setIsDocViewerOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/60 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                                  title={`Doc 2: ${v.doc2Type || 'Govt ID'}`}
                                >
                                  <FileText className="h-3 w-3 text-indigo-500" />
                                  <span>Doc 2</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedVerification(v);
                                    setActiveDocTab('DOC3');
                                    setIsDocViewerOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/60 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                                  title={`Doc 3: ${v.doc3Type || 'Signatory / Utility Proof'}`}
                                >
                                  <FileText className="h-3 w-3 text-emerald-500" />
                                  <span>Doc 3</span>
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVerification(v);
                                  setActiveDocTab('DOC1');
                                  setIsDocViewerOpen(true);
                                }}
                                className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Inspect Dossier</span>
                              </button>
                            </div>
                          </td>

                          {/* AI Authenticity & Fraud Risk */}
                          <td className="py-3.5 px-3">
                            {(() => {
                              let riskLevel = '';
                              if (v.aiExtractedDataJson) {
                                try {
                                  const d = JSON.parse(v.aiExtractedDataJson);
                                  riskLevel = d.riskLevel;
                                } catch (e) {}
                              }
                              return (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {renderAiScoreBadge(v.aiVerificationScore, v.aiVerificationStatus)}
                                    {riskLevel && renderRiskBadge(riskLevel)}
                                  </div>
                                  {v.aiVerificationSummary && (
                                    <p
                                      className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]"
                                      title={v.aiVerificationSummary}
                                    >
                                      {v.aiVerificationSummary}
                                    </p>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          {/* Submitted Date */}
                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="whitespace-nowrap">
                                {v.submittedAt
                                  ? new Date(v.submittedAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : 'Recent'}
                              </span>
                            </div>
                            {v.verificationNotes && (
                              <p
                                className="text-[10px] text-rose-500 mt-1 max-w-[110px] truncate"
                                title={v.verificationNotes}
                              >
                                Note: {v.verificationNotes}
                              </p>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3">
                            {v.status === 'PENDING_APPROVAL' ? (
                              <Badge variant="warning" size="sm">
                                Pending
                              </Badge>
                            ) : v.status === 'REJECTED' ? (
                              <Badge variant="danger" size="sm">
                                Rejected
                              </Badge>
                            ) : (
                              <Badge variant="normal" size="sm">
                                Active
                              </Badge>
                            )}
                          </td>

                          {/* Review Actions */}
                          <td className="py-3.5 pl-3 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Re-run AI Scan */}
                              <button
                                type="button"
                                onClick={() => handleTriggerAiScan(v)}
                                disabled={isScanningThis || reviewSubmitting}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 transition-all cursor-pointer disabled:opacity-50"
                                title="Re-run AI Authenticity & Fraud Analysis"
                              >
                                <Sparkles className={`h-3.5 w-3.5 ${isScanningThis ? 'animate-spin' : ''}`} />
                              </button>

                              {/* Inspect 3 Docs */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVerification(v);
                                  setActiveDocTab('DOC1');
                                  setIsDocViewerOpen(true);
                                }}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 transition-all cursor-pointer"
                                title="Inspect 3-Document Package"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>

                              {/* Approve */}
                              <button
                                type="button"
                                onClick={() => handleApproveVerification(v)}
                                disabled={reviewSubmitting}
                                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-98 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                title={v.status === 'REJECTED' ? "Re-Approve Application & Activate Account" : "Approve Application & Activate Account"}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{v.status === 'REJECTED' ? 'Re-Approve' : 'Approve'}</span>
                              </button>

                              {/* Reject / Delete Action */}
                              {v.status === 'REJECTED' ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVerification(v)}
                                  disabled={reviewSubmitting}
                                  className="flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 px-2 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                  title="Permanently Delete Rejected Application"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRejectModal(v)}
                                  disabled={reviewSubmitting}
                                  className="flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 px-2 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                  title="Reject Application with Feedback Notes"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={verifPage}
                totalPages={totalVerifPages}
                totalItems={filteredVerifications.length}
                itemsPerPage={verifPageSize}
                onPageChange={setVerifPage}
                onItemsPerPageChange={(newSize) => {
                  setVerifPageSize(newSize);
                  setVerifPage(1);
                }}
                itemsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </div>
      )}

      {/* ---------------- TAB 3: MASTER PLATFORM RESIDENTS & HOUSEHOLDS TABLE ---------------- */}
      {activeTab === 'ALL_RESIDENTS' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161F30] shadow-card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
              <p className="mt-3 text-xs font-semibold">Loading platform residents directory...</p>
            </div>
          ) : filteredPlatformResidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-200">No resident households found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">No flat households matched your search criteria.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 pl-6 pr-4 min-w-[120px]">Flat #</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Resident Name</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Community Society</th>
                      <th className="py-3.5 px-4 min-w-[190px]">Contact (Email & Phone)</th>
                      <th className="py-3.5 px-4 min-w-[150px]">Meter Serial No</th>
                      <th className="py-3.5 px-4 min-w-[140px]">Occupancy & Area</th>
                      <th className="py-3.5 px-4 min-w-[120px]">Current Usage</th>
                      <th className="py-3.5 px-4 min-w-[130px]">Account Status</th>
                      <th className="py-3.5 pl-4 pr-3 min-w-[110px]">Invite Code</th>
                      <th className="py-3.5 pl-3 pr-6 min-w-[120px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                    {paginatedPlatformResidents.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 pl-6 pr-4 font-bold text-brand-700 dark:text-brand-400">
                          <span className="bg-brand-50 dark:bg-brand-950/80 px-2 py-0.5 rounded border border-brand-200/60 dark:border-brand-800">
                            Flat {h.flatNumber}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                              {(h.residentName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{h.residentName || 'Unassigned'}</p>
                              <span className="text-[10px] text-slate-400 font-mono">ID #{h.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{h.apartmentName}</td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                          <div>
                            {h.residentEmail ? (
                              <a href={`mailto:${h.residentEmail}`} className="hover:text-brand-600 block">
                                {h.residentEmail}
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">No email</span>
                            )}
                            {h.residentPhone && <span className="text-[10px] text-slate-400 block">{h.residentPhone}</span>}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {h.meterSerialNumber ? (
                            <span className="font-mono text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {h.meterSerialNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">No meter linked</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-slate-600 dark:text-slate-300">
                          <div>
                            <span>{h.occupancyCount || 0} residents</span>
                            <span className="text-slate-400 text-[10px] block">{h.areaSqft || 1200} sq.ft</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {h.currentMonthConsumptionKl || 0} kL
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={h.status || 'ACTIVE'}
                            onChange={(e) => handleResidentStatusChange(h.id, e.target.value as AccountStatus)}
                            className={`text-[11px] font-bold rounded-xl px-2.5 py-1.5 border outline-none cursor-pointer transition-all ${getStatusSelectClass(
                              h.status
                            )}`}
                            title="Update Resident / Household status"
                          >
                            <option value="ACTIVE" className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300">
                              ● Active
                            </option>
                            <option value="INACTIVE" className="bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300">
                              ● Inactive
                            </option>
                            <option value="BLOCKED" className="bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300">
                              ● Blocked
                            </option>
                          </select>
                        </td>

                        <td className="py-3.5 pl-4 pr-3 font-mono text-[10px] text-slate-500">
                          <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {h.inviteCode}
                          </span>
                        </td>

                        <td className="py-3.5 pl-3 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenHouseholdModal(h)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50/80 dark:bg-brand-950/60 px-2.5 py-1.5 text-[11px] font-bold text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-all cursor-pointer shadow-2xs"
                            title="View full details and edit flat information"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit Info</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={resPage}
                totalPages={totalResPages}
                totalItems={filteredPlatformResidents.length}
                itemsPerPage={resPageSize}
                onPageChange={setResPage}
                onItemsPerPageChange={(newSize) => {
                  setResPageSize(newSize);
                  setResPage(1);
                }}
                itemsPerPageOptions={[10, 25, 50, 100]}
              />
            </>
          )}
        </div>
      )}

      {/* ---------------- 1. VIEW DETAILS MODAL (WITH RESIDENTS LIST) ---------------- */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Community Administrator & Society Overview"
        maxWidth="3xl"
      >
        {selectedAdmin && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-brand-200 dark:border-brand-800 bg-linear-to-r from-brand-50/80 to-sky-50/50 dark:from-brand-950/60 dark:to-[#0B1120] p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white text-base font-extrabold shadow-md shadow-brand-500/20">
                    {selectedAdmin.adminName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedAdmin.adminName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-xs text-brand-700 dark:text-brand-300">
                        {selectedAdmin.apartmentName}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-mono text-[11px] text-slate-500">ID #{selectedAdmin.adminId}</span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    selectedAdmin.status === 'BLOCKED'
                      ? 'danger'
                      : selectedAdmin.status === 'INACTIVE'
                      ? 'warning'
                      : 'normal'
                  }
                  size="md"
                >
                  {selectedAdmin.status === 'BLOCKED'
                    ? '🚫 Blocked Admin'
                    : selectedAdmin.status === 'INACTIVE'
                    ? '⏸ Inactive Admin'
                    : '✓ Active Administrator'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setViewModalTab('RESIDENTS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewModalTab === 'RESIDENTS'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Registered Residents & Flats ({selectedAdmin.households?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setViewModalTab('OVERVIEW')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewModalTab === 'OVERVIEW'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Overview & Infrastructure</span>
              </button>
            </div>

            {viewModalTab === 'RESIDENTS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search resident name, flat #, meter #, email..."
                      value={modalResidentSearch}
                      onChange={(e) => setModalResidentSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">
                    {modalFilteredResidents.length} of {selectedAdmin.households?.length || 0} Flats
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  {modalFilteredResidents.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400">
                      No resident households registered under this society yet.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3">Flat</th>
                          <th className="py-2.5 px-3">Resident Name</th>
                          <th className="py-2.5 px-3">Contact</th>
                          <th className="py-2.5 px-3">Meter Serial No</th>
                          <th className="py-2.5 px-3">Usage</th>
                          <th className="py-2.5 px-3 text-right">Invite Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                        {modalFilteredResidents.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-bold text-brand-700 dark:text-brand-400">Flat {h.flatNumber}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                              {h.residentName || 'Unassigned'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                              <div>{h.residentEmail || '-'}</div>
                              {h.residentPhone && <div className="text-[10px] text-slate-400">{h.residentPhone}</div>}
                            </td>
                            <td className="py-2.5 px-3">
                              {h.meterSerialNumber ? (
                                <span className="font-mono text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-1.5 py-0.5 rounded border border-brand-200/50 dark:border-brand-800">
                                  {h.meterSerialNumber}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px] italic">None</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                              {h.currentMonthConsumptionKl || 0} kL
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[10px] text-slate-400">{h.inviteCode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {viewModalTab === 'OVERVIEW' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-brand-500" />
                      <span>Admin Credentials</span>
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Email Address</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedAdmin.adminEmail}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Phone Number</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {selectedAdmin.adminPhone || 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Assigned Role</span>
                        <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{selectedAdmin.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-brand-500" />
                      <span>Community Infrastructure</span>
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Society / Apartment Name</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedAdmin.apartmentName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Address</span>
                        <span className="text-slate-700 dark:text-slate-300">{selectedAdmin.apartmentAddress || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Household Units Capacity</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {selectedAdmin.registeredHouseholds} Registered / {selectedAdmin.totalHouseholds} Total Units
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-3.5 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5 text-brand-500" />
                    <span>Water Telemetry & Tariffs</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Consumption</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block font-mono">
                        {selectedAdmin.totalMonthlyConsumptionKl} kL
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Revenue Collected</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">
                        ₹{selectedAdmin.totalMonthlyRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Occupancy Rate</span>
                      <span className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5 block">
                        {selectedAdmin.totalHouseholds > 0
                          ? `${Math.round((selectedAdmin.registeredHouseholds / selectedAdmin.totalHouseholds) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Active Tariff: </span>
                    <span>{selectedAdmin.baseTariffSummary}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(selectedAdmin);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161F30] px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Information</span>
              </button>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------- 2. EDIT ADMIN & SOCIETY MODAL ---------------- */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Administrator & Society Profile"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {modalError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              1. Administrator Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reset Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Status *</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AccountStatus)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE (Authorized - Login Enabled)</option>
                  <option value="INACTIVE">INACTIVE (Temporarily Disabled - Login Blocked)</option>
                  <option value="BLOCKED">BLOCKED (Suspended / Locked - Login Forbidden)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 my-2" />

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              2. Society / Apartment Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Apartment Community Name *
                </label>
                <input
                  type="text"
                  required
                  value={editAptName}
                  onChange={(e) => setEditAptName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  value={editAptAddress}
                  onChange={(e) => setEditAptAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Total Households Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  required
                  value={editTotalHouseholds}
                  onChange={(e) => setEditTotalHouseholds(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-700 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {formSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---------------- 3. DELETE CONFIRMATION MODAL ---------------- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="md"
      >
        {selectedAdmin && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div className="text-xs text-rose-800 dark:text-rose-200 space-y-1">
                <p className="font-bold">This action cannot be undone.</p>
                <p>
                  Deleting administrator <strong>{selectedAdmin.adminName}</strong> will permanently remove access to society{' '}
                  <strong>{selectedAdmin.apartmentName}</strong>, along with all associated flats, water logs, and billing statements.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-xs space-y-1">
              <div>
                <strong>Admin:</strong> {selectedAdmin.adminName} ({selectedAdmin.adminEmail})
              </div>
              <div>
                <strong>Society:</strong> {selectedAdmin.apartmentName}
              </div>
              <div>
                <strong>Flats Registered:</strong> {selectedAdmin.registeredHouseholds} units
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={formSubmitting}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {formSubmitting ? 'Deleting...' : 'Yes, Delete Administrator'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------- 4. ONBOARD NEW COMMUNITY ADMIN MODAL (WITH 3-DOC PACKAGE) ---------------- */}
      <Modal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        title="Onboard New Community Administrator (3-Doc AI Security Package)"
        subtitle="Register residential society, provision admin account, and attach mandatory 3-document verification dossier"
        maxWidth="2xl"
      >
        <form onSubmit={handleOnboardSubmit} className="space-y-4">
          {modalError && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200 animate-fade-in">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Section 1 & 2 in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 1: Society Info */}
            <div className="space-y-3 rounded-2xl bg-slate-50/70 dark:bg-[#0B1120]/50 p-4 border border-slate-200/70 dark:border-slate-800">
              <div className="border-b border-slate-200/80 dark:border-slate-800 pb-1.5 flex items-center justify-between">
                <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  1. Society Details
                </h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Society / Apartment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Greenwood Heights Residences"
                  value={newAptName}
                  onChange={(e) => setNewAptName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 42, HSR Layout, Bengaluru"
                  value={newAptAddress}
                  onChange={(e) => setNewAptAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Households Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  required
                  value={newTotalHouseholds}
                  onChange={(e) => setNewTotalHouseholds(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Section 2: Admin Credentials */}
            <div className="space-y-3 rounded-2xl bg-slate-50/70 dark:bg-[#0B1120]/50 p-4 border border-slate-200/70 dark:border-slate-800">
              <div className="border-b border-slate-200/80 dark:border-slate-800 pb-1.5 flex items-center justify-between">
                <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  2. Admin Credentials
                </h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={newAdminFullName}
                  onChange={(e) => setNewAdminFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@greenwood.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
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
                Mandatory for Society Activation
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload all 3 required documents. The AI engine will audit each file for authentic seals, registered authority headers, and watermarks during onboarding.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Doc 1 Card */}
              <div
                className={`rounded-xl border p-3 text-xs space-y-2 transition-all ${
                  newDoc1Base64
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161F30]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-brand-600" />
                    Doc 1: Society Deed *
                  </span>
                  {newDoc1Base64 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>

                <select
                  value={newDoc1Type}
                  onChange={(e) => setNewDoc1Type(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-2 py-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="SOCIETY_REGISTRATION_DEED">Society Registration Deed</option>
                  <option value="SALE_DEED">Property / Land Title Deed</option>
                  <option value="LAND_REGISTRY_PROOF">Municipal Land Registry Proof</option>
                </select>

                <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                  <UploadCloud className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                    {newDoc1FileName ? newDoc1FileName.substring(0, 18) + '...' : 'Upload Society Deed'}
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
                          setNewDoc1FileName(fileName);
                          setNewDoc1Base64(base64);
                        },
                        (msg) => setModalError(msg)
                      )
                    }
                  />
                </label>
              </div>

              {/* Doc 2 Card */}
              <div
                className={`rounded-xl border p-3 text-xs space-y-2 transition-all ${
                  newDoc2Base64
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161F30]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                    Doc 2: Govt ID *
                  </span>
                  {newDoc2Base64 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>

                <select
                  value={newDoc2Type}
                  onChange={(e) => setNewDoc2Type(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-2 py-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="GOVERNMENT_ID_PROOF">Aadhaar / Passport / Voter ID</option>
                  <option value="AADHAAR_CARD">Aadhaar Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="PAN_CARD">PAN Card (Entity / Signatory)</option>
                </select>

                <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                  <UploadCloud className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                    {newDoc2FileName ? newDoc2FileName.substring(0, 18) + '...' : 'Upload Govt ID'}
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
                          setNewDoc2FileName(fileName);
                          setNewDoc2Base64(base64);
                        },
                        (msg) => setModalError(msg)
                      )
                    }
                  />
                </label>
              </div>

              {/* Doc 3 Card */}
              <div
                className={`rounded-xl border p-3 text-xs space-y-2 transition-all ${
                  newDoc3Base64
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161F30]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-emerald-600" />
                    Doc 3: Signatory Proof *
                  </span>
                  {newDoc3Base64 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>

                <select
                  value={newDoc3Type}
                  onChange={(e) => setNewDoc3Type(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] px-2 py-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="RWA_BOARD_RESOLUTION">RWA Board Resolution</option>
                  <option value="AUTH_SIGNATORY_PROOF">Authorized Signatory Letter</option>
                  <option value="MUNICIPAL_WATER_SANCTION">Municipal Water Connection Sanction</option>
                  <option value="ELECTRICITY_SANCTION">Substation / Common Bill</option>
                </select>

                <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-center transition-all">
                  <UploadCloud className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                    {newDoc3FileName ? newDoc3FileName.substring(0, 18) + '...' : 'Upload Signatory Proof'}
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
                          setNewDoc3FileName(fileName);
                          setNewDoc3Base64(base64);
                        },
                        (msg) => setModalError(msg)
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsOnboardModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-700 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {formSubmitting ? 'Verifying & Onboarding...' : 'Onboard Society & Admin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---------------- 5. 3-DOCUMENT & AI VERIFICATION INSPECTOR MODAL ---------------- */}
      <Modal
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        title="3-Document Package & AI Authenticity Inspector"
        maxWidth="4xl"
      >
        {selectedVerification && (
          <div className="space-y-4">
            {/* Header info banner */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm border ${
                      selectedVerification.verificationType === 'RESIDENT'
                        ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300'
                    }`}
                  >
                    {selectedVerification.adminFullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {selectedVerification.adminFullName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                          selectedVerification.verificationType === 'RESIDENT'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                        }`}
                      >
                        {selectedVerification.verificationType === 'RESIDENT'
                          ? `Resident • Flat ${selectedVerification.flatNumber || 'N/A'}`
                          : 'Community Administrator'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                      {selectedVerification.apartmentName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTriggerAiScan(selectedVerification)}
                    disabled={
                      aiScanningId ===
                        `${selectedVerification.verificationType}_${
                          selectedVerification.verificationType === 'RESIDENT'
                            ? selectedVerification.userId
                            : selectedVerification.apartmentId
                        }` || reviewSubmitting
                    }
                    className="flex items-center gap-1.5 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Sparkles
                      className={`h-3.5 w-3.5 text-purple-600 ${
                        aiScanningId ===
                        `${selectedVerification.verificationType}_${
                          selectedVerification.verificationType === 'RESIDENT'
                            ? selectedVerification.userId
                            : selectedVerification.apartmentId
                        }`
                          ? 'animate-spin'
                          : ''
                      }`}
                    />
                    <span>Re-run AI Analysis</span>
                  </button>
                </div>
              </div>

              {/* Applicant info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedVerification.adminEmail}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Number</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedVerification.adminPhone || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Society Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {selectedVerification.address || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Authenticity & Fraud Risk Audit Panel */}
            {(() => {
              let aiData: any = null;
              if (selectedVerification.aiExtractedDataJson) {
                try {
                  aiData = JSON.parse(selectedVerification.aiExtractedDataJson);
                } catch (e) {
                  aiData = null;
                }
              }

              const scoreVal = selectedVerification.aiVerificationScore ?? 0;
              const isHighRisk = selectedVerification.aiVerificationStatus === 'REJECTED_FAKE' || (aiData?.riskLevel === 'HIGH_RISK');
              const isModRisk = selectedVerification.aiVerificationStatus === 'SUSPICIOUS' || scoreVal < 50 || (aiData?.riskLevel === 'MODERATE_RISK');
              const isLowRisk = !isHighRisk && !isModRisk;

              return (
                <div
                  className={`rounded-2xl border p-4 transition-all shadow-sm ${
                    isHighRisk
                      ? 'border-rose-300 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40'
                      : isModRisk
                      ? 'border-amber-300 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40'
                      : 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40'
                  }`}
                >
                  {/* Top Bar with Title, Engine badge, Scan mode, Score & Action */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                        isHighRisk ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/60' :
                        isModRisk ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/60' :
                        'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60'
                      }`}>
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                            AI Document Authenticity & Anti-Fraud Forensic Audit
                          </h4>
                          {aiData?.scanMode && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              <Zap className="h-2.5 w-2.5 text-purple-600" />
                              {aiData.scanMode.replace('_', ' ')}
                            </span>
                          )}
                          {aiData?.riskLevel && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                              aiData.riskLevel === 'HIGH_RISK'
                                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/50 dark:text-rose-200'
                                : aiData.riskLevel === 'MODERATE_RISK'
                                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-200'
                            }`}>
                              {aiData.riskLevel === 'HIGH_RISK' ? <ShieldAlert className="h-2.5 w-2.5" /> :
                               aiData.riskLevel === 'MODERATE_RISK' ? <AlertTriangle className="h-2.5 w-2.5" /> :
                               <CheckCircle2 className="h-2.5 w-2.5" />}
                              {aiData.riskLevel.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {aiData?.scanEngine || 'JalSetu Forensic Vision AI v2.4 + Cryptographic Verification'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {renderAiScoreBadge(selectedVerification.aiVerificationScore, selectedVerification.aiVerificationStatus)}
                      <button
                        type="button"
                        onClick={() => openRerunModal(selectedVerification)}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-100/70 hover:bg-purple-200/80 dark:bg-purple-900/40 dark:hover:bg-purple-900/70 px-2.5 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 transition-all cursor-pointer"
                        title="Re-configure scan and run again"
                      >
                        <Sliders className="h-3 w-3" />
                        <span>Re-run Options</span>
                      </button>
                    </div>
                  </div>

                  {/* Confidence Progress Bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Composite Authenticity Confidence:</span>
                      <span className="font-mono text-sm font-extrabold">{scoreVal}% / 100%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/60">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          scoreVal >= 80
                            ? 'bg-emerald-500'
                            : scoreVal >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(scoreVal, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Executive Actionable Recommendation Banner */}
                  {(aiData?.recommendation || selectedVerification.aiVerificationSummary) && (
                    <div className={`mt-3 rounded-xl p-3 border text-xs font-medium flex items-start gap-2.5 ${
                      isHighRisk
                        ? 'bg-rose-100/80 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        : isModRisk
                        ? 'bg-amber-100/80 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        : 'bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    }`}>
                      {isHighRisk ? (
                        <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                      ) : isModRisk ? (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[10px] block opacity-80 mb-0.5">
                          Executive AI Recommendation
                        </span>
                        <span>{aiData?.recommendation || selectedVerification.aiVerificationSummary}</span>
                      </div>
                    </div>
                  )}

                  {/* Critical Red Flags Box (if any) */}
                  {aiData?.redFlags && aiData.redFlags.length > 0 && (
                    <div className="mt-3 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-100/70 dark:bg-rose-950/60 p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                        <AlertCircle className="h-4 w-4" />
                        <span>Critical Fraud & Tamper Alerts ({aiData.redFlags.length})</span>
                      </div>
                      <div className="space-y-1 pl-5">
                        {aiData.redFlags.map((flag: string, idx: number) => (
                          <p key={idx} className="text-xs text-rose-800 dark:text-rose-200 font-medium">
                            • {flag}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6-Point Verification Matrix (Grid) */}
                  {aiData?.checklist && aiData.checklist.length > 0 && (
                    <div className="mt-3.5 space-y-2">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        6-Point Forensic Verification Matrix
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {aiData.checklist.map((item: any) => {
                          const isPass = item.status === 'PASS';
                          return (
                            <div
                              key={item.id}
                              className={`rounded-xl border p-2.5 flex items-start gap-2.5 transition-all ${
                                isPass
                                  ? 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                                  : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900'
                              }`}
                            >
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                                isPass ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                              }`}>
                                {isPass ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {item.title}
                                  </h5>
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                                    isPass ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
                                  {item.details}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Per-Document Breakdown (3 Documents) */}
                  {aiData?.docBreakdown && aiData.docBreakdown.length > 0 && (
                    <div className="mt-3.5 space-y-2">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Per-Document Authenticity Breakdown
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {aiData.docBreakdown.map((doc: any) => {
                          const isPass = doc.status === 'PASS';
                          return (
                            <div
                              key={doc.docNumber}
                              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-2.5 space-y-1.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400">Doc {doc.docNumber}</span>
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                  isPass ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                                }`}>
                                  {doc.score}% • {doc.status}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                                {doc.docName}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                                {doc.notes}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Audit Logs Trail */}
                  {aiData?.auditLogs && aiData.auditLogs.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/50">
                      <details className="group cursor-pointer">
                        <summary className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-between">
                          <span>Evidence Trail & Validation Logs ({aiData.auditLogs.length} events)</span>
                          <span className="text-[10px] text-brand-600 dark:text-brand-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-2 space-y-1 pl-2 font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                          {aiData.auditLogs.map((log: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="text-emerald-500">✔</span>
                              <span>{log}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3-Document Selector Tabs */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveDocTab('DOC1')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeDocTab === 'DOC1'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>1. Flat / Property Proof</span>
                  {selectedVerification.doc1Url || selectedVerification.documentUrl ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDocTab('DOC2')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeDocTab === 'DOC2'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>2. Government ID Proof</span>
                  {selectedVerification.doc2Url ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDocTab('DOC3')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeDocTab === 'DOC3'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>3. Signatory / Utility Proof</span>
                  {selectedVerification.doc3Url ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  )}
                </button>
              </div>

              {/* Active Document Sub-Header */}
              {(() => {
                const activeDoc = getActiveDocData(selectedVerification, activeDocTab);
                return (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 py-1 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{activeDoc.label}</span>
                      <span className="text-slate-400 text-[11px] ml-2 font-mono">
                        (Declared Type: {activeDoc.type || 'N/A'} • File: {activeDoc.name || 'document.pdf'})
                      </span>
                    </div>
                    {activeDoc.url && (
                      <a
                        href={activeDoc.url}
                        download={activeDoc.name || 'document.pdf'}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download This File</span>
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Document Viewer Frame / Preview */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900/5 dark:bg-black/30 p-2 overflow-hidden flex flex-col items-center justify-center min-h-[420px]">
              {(() => {
                const activeDoc = getActiveDocData(selectedVerification, activeDocTab);
                if (!activeDoc.url) {
                  return (
                    <div className="text-center py-16 text-slate-400">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-semibold">No digital document attached for this requirement tab.</p>
                    </div>
                  );
                }
                const isImage =
                  activeDoc.url.startsWith('data:image') ||
                  activeDoc.name?.match(/\.(png|jpe?g|webp|gif)$/i);

                if (isImage) {
                  return (
                    <img
                      src={activeDoc.url}
                      alt="Verification Document Preview"
                      className="max-h-[500px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                    />
                  );
                }
                return (
                  <iframe
                    src={activeDoc.url}
                    title="Verification PDF Document"
                    className="w-full h-[520px] rounded-lg border-0 bg-white"
                  />
                );
              })()}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDocViewerOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Close Inspector
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDocViewerOpen(false);
                    handleOpenRejectModal(selectedVerification);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Application</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveVerification(selectedVerification)}
                  disabled={reviewSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approve & Activate Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------- 5.5 RE-RUN AI ANALYSIS CONFIGURATION MODAL ---------------- */}
      <Modal
        isOpen={isRerunModalOpen}
        onClose={() => {
          if (!aiScanningId) {
            setIsRerunModalOpen(false);
            setRerunTarget(null);
          }
        }}
        title="Re-run AI Document Authenticity & Fraud Analysis"
        subtitle="Select forensic engine depth and toggle multi-factor verification checks before launching scan"
        maxWidth="max-w-2xl"
      >
        {rerunTarget && (
          <div className="space-y-5">
            {/* Target Information Card */}
            <div className="rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/40 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-purple-900 dark:text-purple-200">
                      {rerunTarget.verificationType === 'RESIDENT' ? 'Resident Verification' : 'Community Admin Verification'}
                    </span>
                    <span className="rounded-full bg-purple-200/70 dark:bg-purple-800/60 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-300">
                      Target #{rerunTarget.verificationType === 'RESIDENT' ? rerunTarget.userId : rerunTarget.apartmentId}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                    {rerunTarget.adminFullName}
                    {rerunTarget.flatNumber && <span className="font-normal text-slate-500"> • Flat {rerunTarget.flatNumber}</span>}
                    <span className="font-normal text-slate-500"> • {rerunTarget.apartmentName}</span>
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Current Score</span>
                <span className="text-xs font-extrabold font-mono text-purple-700 dark:text-purple-300">
                  {rerunTarget.aiVerificationScore || 0}% ({rerunTarget.aiVerificationStatus || 'PENDING'})
                </span>
              </div>
            </div>

            {/* Scan Mode Selection */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                1. Select AI Forensic Engine Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Deep Forensic */}
                <button
                  type="button"
                  onClick={() => setRerunScanMode('DEEP_FORENSIC')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    rerunScanMode === 'DEEP_FORENSIC'
                      ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 ring-2 ring-purple-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span>Deep Forensic</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Full multi-layer neural scan. Cryptographic hashing, pixel analysis, stamp & name cross-matching.
                  </p>
                </button>

                {/* Strict Anti-Fraud */}
                <button
                  type="button"
                  onClick={() => setRerunScanMode('STRICT_FRAUD')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    rerunScanMode === 'STRICT_FRAUD'
                      ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/50 ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 mb-1">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    <span>Strict Anti-Fraud</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Elevated fraud threshold. Flags minor discrepancies in signatures, duplicate hashes, or demo files.
                  </p>
                </button>

                {/* Fast Heuristic */}
                <button
                  type="button"
                  onClick={() => setRerunScanMode('FAST_HEURISTIC')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    rerunScanMode === 'FAST_HEURISTIC'
                      ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/50 ring-2 ring-brand-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300 mb-1">
                    <Sparkles className="h-4 w-4 text-brand-600" />
                    <span>Fast Heuristic</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Rapid checks on structural format, file headers, dimensions, and applicant identity matching.
                  </p>
                </button>
              </div>
            </div>

            {/* Configurable Verification Checkpoints */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                2. Configure Verification Checkpoints
              </label>

              <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3">
                {/* Duplicate Detection */}
                <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rerunCheckDuplicates}
                    onChange={(e) => setRerunCheckDuplicates(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">
                      Cross-Document Duplicate & Anti-Collision Check
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">
                      Detects if identical files were uploaded to bypass the 3 distinct document requirement.
                    </span>
                  </div>
                </label>

                {/* Identity Name Match */}
                <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rerunCheckNameMatch}
                    onChange={(e) => setRerunCheckNameMatch(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">
                      Applicant Identity & Name Cross-Match
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">
                      Cross-matches applicant registered name against Government Photo ID text records.
                    </span>
                  </div>
                </label>

                {/* Address Consistency */}
                <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rerunCheckAddressMatch}
                    onChange={(e) => setRerunCheckAddressMatch(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">
                      Property & Community Address Consistency
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">
                      Verifies apartment/society naming, unit flat numbers, and municipal registry details.
                    </span>
                  </div>
                </label>

                {/* Seals & Stamps */}
                <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rerunCheckStampSeal}
                    onChange={(e) => setRerunCheckStampSeal(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">
                      Official Stamps, Emblems & Signature Verification
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">
                      Scans for notary stamps, municipal emblems, and authorized signatures on legal deeds.
                    </span>
                  </div>
                </label>

                {/* Tampering Integrity */}
                <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rerunCheckTampering}
                    onChange={(e) => setRerunCheckTampering(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">
                      Digital Forensic Integrity & Anti-Tampering
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">
                      Inspects PDF stream structures, image compression artifacts, and placeholder demo files.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsRerunModalOpen(false);
                  setRerunTarget(null);
                }}
                disabled={Boolean(aiScanningId)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteRerunScan}
                disabled={Boolean(aiScanningId)}
                className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`h-4 w-4 ${aiScanningId ? 'animate-spin' : ''}`} />
                <span>{aiScanningId ? 'Analyzing Documents...' : 'Start AI Analysis'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------- 6. REJECT VERIFICATION MODAL WITH FEEDBACK REASON ---------------- */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Verification Application"
        maxWidth="md"
      >
        {selectedVerification && (
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="text-xs text-rose-800 dark:text-rose-200 space-y-1">
                  <p className="font-bold">Provide clear reason for rejection</p>
                  <p>
                    An explanation email will be dispatched to <strong>{selectedVerification.adminEmail}</strong>. The applicant will be able to log in to their pending verification status screen and re-submit corrected documents.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quick Feedback Templates
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  'Document 1 (Flat Paper / Rent Agreement) is blurry or illegible. Please re-scan clearly.',
                  'Government ID (Doc 2) does not match the applicant name provided during registration.',
                  'Missing official RWA / Society seal and authorized signature on Document 3.',
                  'Placeholder / sample demo document detected by AI verification. Please submit genuine real documents.',
                  'Utility bill / NOC is expired or older than 3 months. Please upload recent proof.',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/50 dark:hover:text-brand-300 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg transition-all cursor-pointer text-left"
                  >
                    + {preset.slice(0, 48)}...
                  </button>
                ))}
              </div>

              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rejection Notes / Corrective Guidance *
              </label>
              <textarea
                required
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain what was incorrect and what 3 documents the applicant must re-upload..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] p-3 text-xs text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewSubmitting || !rejectReason.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>{reviewSubmitting ? 'Submitting...' : 'Confirm Rejection'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ---------------- 7. MAIN ADMIN HOUSEHOLD VIEW & EDIT MODAL ---------------- */}
      <Modal
        isOpen={isHouseholdModalOpen}
        onClose={() => setIsHouseholdModalOpen(false)}
        title={selectedHousehold ? `Manage Flat ${selectedHousehold.flatNumber} (${selectedHousehold.apartmentName})` : 'Manage Household'}
        subtitle="View and update flat specifications, smart meter binding, resident contact info, and status"
        maxWidth="max-w-2xl"
      >
        {selectedHousehold && (
          <form onSubmit={handleSaveHousehold} className="space-y-5">
            {householdModalError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{householdModalError}</span>
              </div>
            )}

            {/* Quick Telemetry Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Current Usage</p>
                <p className="text-base font-extrabold text-brand-700 dark:text-brand-400 mt-0.5">
                  {selectedHousehold.currentMonthConsumptionKl || 0} <span className="text-xs font-normal">kL</span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Latest Meter Reading</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {selectedHousehold.latestReadingKl || 0} <span className="text-xs font-normal">kL</span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Resident Invite Code</p>
                <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 truncate">
                  {selectedHousehold.inviteCode}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Flat / Unit Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editHouseholdFlat}
                    onChange={(e) => setEditHouseholdFlat(e.target.value)}
                    placeholder="e.g. A-101"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={editHouseholdStatus}
                    onChange={(e) => setEditHouseholdStatus(e.target.value as AccountStatus)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="ACTIVE">Active (Billing & App Access)</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>

              {/* Resident Contact Information */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Assigned Resident Contact Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Resident Full Name
                    </label>
                    <input
                      type="text"
                      value={editHouseholdResidentName}
                      onChange={(e) => setEditHouseholdResidentName(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Resident Email
                    </label>
                    <input
                      type="email"
                      value={editHouseholdResidentEmail}
                      onChange={(e) => setEditHouseholdResidentEmail(e.target.value)}
                      placeholder="e.g. resident@society.com"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editHouseholdResidentPhone}
                      onChange={(e) => setEditHouseholdResidentPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Meter & Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Smart Meter Serial No
                  </label>
                  <input
                    type="text"
                    value={editHouseholdMeter}
                    onChange={(e) => setEditHouseholdMeter(e.target.value)}
                    placeholder="e.g. MTR-PM-101"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-brand-700 dark:text-brand-300 outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Area (Sq. Ft)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="20000"
                    value={editHouseholdArea}
                    onChange={(e) => setEditHouseholdArea(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Occupancy (Persons)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={editHouseholdOccupancy}
                    onChange={(e) => setEditHouseholdOccupancy(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Has Meter Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Individual Meter Installed</p>
                  <p className="text-[11px] text-slate-400">If unchecked, this flat is billed on shared/apportioned allocation.</p>
                </div>
                <input
                  type="checkbox"
                  checked={editHouseholdHasMeter}
                  onChange={(e) => setEditHouseholdHasMeter(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsHouseholdModalOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingHousehold}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-700 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {savingHousehold ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
