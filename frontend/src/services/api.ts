import axios from 'axios';
import type {
  LoginResponse,
  Apartment,
  Household,
  MeterReading,
  BulkUploadResult,
  Alert,
  CommunityAdminDashboard,
  ResidentDashboard,
  MainAdminStats,
  TariffPlan,
  BulkPurchase,
  CreateBulkPurchaseRequest,
  Invoice,
  GenerateBillsRequest,
  GenerateBillsResponse,
  BillingStats,
  CreateRazorpayOrderResponse,
  VerifyPaymentRequest,
  PaymentReceiptResponse,
  InvoiceStatus,
  CommunityAdminDetail,
  UpdateCommunityAdminRequest,
  PlatformHousehold,
  PlatformAnalytics,
  SendTestAlertRequest,
  NotifyResidentAlertRequest,
  AlertDispatchResponse,
  ApartmentTariffSummary,
  PlatformTariffOverview,
  SupportTicket,
  CreateSupportTicketRequest,
  UpdateTicketStatusRequest,
  EscalateTicketRequest,
  CreateCommunityConcernRequest,
  ResolveTicketByMainAdminRequest,
  Announcement,
  CreateAnnouncementRequest,
  CreateMainAdminAnnouncementRequest,
  AccountStatus,
  PendingVerification,
  VerificationStatusResponse,
  GoogleOAuthRequest,
} from '../types';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Format API error messages
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (data.validationErrors) {
        const entries = Object.entries(data.validationErrors);
        if (entries.length > 0) {
          return entries.map(([field, msg]) => `${field}: ${msg}`).join(', ');
        }
      }
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action';
    }
    if (error.response?.status === 401) {
      return 'Invalid email or password';
    }
    return error.message || 'An unexpected network error occurred';
  }
  return (error as Error)?.message || 'An unexpected error occurred';
}

// ---------------- API SERVICES ----------------

// Auth
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    return res.data;
  },
  registerCommunityAdmin: async (data: {
    communityName: string;
    address?: string;
    totalHouseholds?: number;
    adminFullName: string;
    adminEmail: string;
    adminPhone?: string;
    adminPassword: string;
    doc1Type?: string;
    doc1FileName?: string;
    doc1Base64?: string;
    doc2Type?: string;
    doc2FileName?: string;
    doc2Base64?: string;
    doc3Type?: string;
    doc3FileName?: string;
    doc3Base64?: string;
    documentType?: string;
    documentFileName?: string;
    documentBase64?: string;
  }): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/register/community-admin', data);
    return res.data;
  },
  googleLogin: async (data: GoogleOAuthRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/oauth/google', data);
    return res.data;
  },
  getVerificationStatus: async (email: string): Promise<VerificationStatusResponse> => {
    const res = await api.get<VerificationStatusResponse>('/auth/verification-status', {
      params: { email },
    });
    return res.data;
  },
  resubmitVerification: async (data: {
    communityName?: string;
    address?: string;
    totalHouseholds?: number;
    adminFullName?: string;
    adminEmail: string;
    adminPhone?: string;
    adminPassword?: string;
    doc1Type?: string;
    doc1FileName?: string;
    doc1Base64?: string;
    doc2Type?: string;
    doc2FileName?: string;
    doc2Base64?: string;
    doc3Type?: string;
    doc3FileName?: string;
    doc3Base64?: string;
    documentType?: string;
    documentFileName?: string;
    documentBase64?: string;
  }): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/resubmit-verification', data);
    return res.data;
  },
  registerResident: async (data: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    password: string;
    inviteCode: string;
    doc1Type?: string;
    doc1FileName?: string;
    doc1Base64?: string;
    doc2Type?: string;
    doc2FileName?: string;
    doc2Base64?: string;
    doc3Type?: string;
    doc3FileName?: string;
    doc3Base64?: string;
  }): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/register/resident', data);
    return res.data;
  },
  getProfile: async (): Promise<LoginResponse> => {
    const res = await api.get<LoginResponse>('/auth/me');
    return res.data;
  },
  updateProfile: async (data: {
    fullName: string;
    phoneNumber?: string;
  }): Promise<LoginResponse> => {
    const res = await api.put<LoginResponse>('/auth/me', data);
    return res.data;
  },
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string; success: boolean }> => {
    const res = await api.post<{ message: string; success: boolean }>('/auth/change-password', data);
    return res.data;
  },
  getPlatformStats: async (): Promise<MainAdminStats> => {
    const res = await api.get<MainAdminStats>('/auth/platform-stats');
    return res.data;
  },
};

// Main Admin
export const mainAdminApi = {
  getStats: async (): Promise<MainAdminStats> => {
    const res = await api.get<MainAdminStats>('/main-admin/stats');
    return res.data;
  },
  getApartments: async (): Promise<Apartment[]> => {
    const res = await api.get<Apartment[]>('/main-admin/apartments');
    return res.data;
  },
  getAllApartments: async (): Promise<Apartment[]> => {
    const res = await api.get<Apartment[]>('/main-admin/apartments');
    return res.data;
  },
  createApartment: async (data: {
    name: string;
    address?: string;
    totalHouseholds: number;
    adminFullName: string;
    adminEmail: string;
    adminPhone?: string;
    adminPassword: string;
    doc1Type?: string;
    doc1FileName?: string;
    doc1Base64?: string;
    doc2Type?: string;
    doc2FileName?: string;
    doc2Base64?: string;
    doc3Type?: string;
    doc3FileName?: string;
    doc3Base64?: string;
  }): Promise<Apartment> => {
    const res = await api.post<Apartment>('/main-admin/apartments', data);
    return res.data;
  },
  deleteApartment: async (id: number): Promise<void> => {
    await api.delete(`/main-admin/apartments/${id}`);
  },
  getCommunityAdmins: async (): Promise<CommunityAdminDetail[]> => {
    const res = await api.get<CommunityAdminDetail[]>('/main-admin/community-admins');
    return res.data;
  },
  getCommunityAdminById: async (id: number): Promise<CommunityAdminDetail> => {
    const res = await api.get<CommunityAdminDetail>(`/main-admin/community-admins/${id}`);
    return res.data;
  },
  updateCommunityAdmin: async (id: number, data: UpdateCommunityAdminRequest): Promise<CommunityAdminDetail> => {
    const res = await api.put<CommunityAdminDetail>(`/main-admin/community-admins/${id}`, data);
    return res.data;
  },
  updateCommunityAdminStatus: async (adminId: number, status: AccountStatus): Promise<{ message: string; status: AccountStatus }> => {
    const res = await api.put<{ message: string; status: AccountStatus }>(`/main-admin/community-admins/${adminId}/status`, { status });
    return res.data;
  },
  deleteCommunityAdmin: async (id: number): Promise<void> => {
    await api.delete(`/main-admin/community-admins/${id}`);
  },
  getAllHouseholds: async (): Promise<PlatformHousehold[]> => {
    const res = await api.get<PlatformHousehold[]>('/main-admin/households');
    return res.data;
  },
  updateHouseholdStatus: async (householdId: number, status: AccountStatus): Promise<{ message: string; status: AccountStatus }> => {
    const res = await api.put<{ message: string; status: AccountStatus }>(`/main-admin/households/${householdId}/status`, { status });
    return res.data;
  },
  getPlatformAnalytics: async (): Promise<PlatformAnalytics> => {
    const res = await api.get<PlatformAnalytics>('/main-admin/reports/analytics');
    return res.data;
  },
  getPlatformTariffOverview: async (): Promise<PlatformTariffOverview> => {
    const res = await api.get<PlatformTariffOverview>('/main-admin/tariffs');
    return res.data;
  },
  getSocietyTariffPlan: async (apartmentId: number): Promise<TariffPlan> => {
    const res = await api.get<TariffPlan>(`/main-admin/tariffs/${apartmentId}`);
    return res.data;
  },
  updateSocietyTariffPlan: async (apartmentId: number, data: TariffPlan): Promise<TariffPlan> => {
    const res = await api.put<TariffPlan>(`/main-admin/tariffs/${apartmentId}`, data);
    return res.data;
  },
  // Main Admin Support Desk & Escalations
  getSupportTickets: async (filter?: string): Promise<SupportTicket[]> => {
    const res = await api.get<SupportTicket[]>('/main-admin/support-tickets', {
      params: filter ? { filter } : {},
    });
    return res.data;
  },
  resolveSupportTicket: async (id: number, data: ResolveTicketByMainAdminRequest): Promise<SupportTicket> => {
    const res = await api.put<SupportTicket>(`/main-admin/support-tickets/${id}/resolve`, data);
    return res.data;
  },
  // Main Admin Announcements Broadcast
  getAnnouncements: async (): Promise<Announcement[]> => {
    const res = await api.get<Announcement[]>('/main-admin/announcements');
    return res.data;
  },
  createAnnouncement: async (data: CreateMainAdminAnnouncementRequest): Promise<Announcement> => {
    const res = await api.post<Announcement>('/main-admin/announcements', data);
    return res.data;
  },
  deleteAnnouncement: async (id: number): Promise<void> => {
    await api.delete(`/main-admin/announcements/${id}`);
  },
  // Main Admin Community & Resident Document Verification & Approval
  getPendingVerifications: async (): Promise<PendingVerification[]> => {
    const res = await api.get<PendingVerification[]>('/main-admin/verifications');
    return res.data;
  },
  reviewVerification: async (data: {
    action: 'APPROVE' | 'REJECT';
    notes?: string;
    verificationType?: 'COMMUNITY_ADMIN' | 'RESIDENT';
    targetId: number;
  }): Promise<PendingVerification> => {
    const res = await api.post<PendingVerification>('/main-admin/verifications/review', data);
    return res.data;
  },
  triggerAiScan: async (data: {
    verificationType: 'COMMUNITY_ADMIN' | 'RESIDENT';
    targetId: number;
  }): Promise<PendingVerification> => {
    const res = await api.post<PendingVerification>('/main-admin/verifications/ai-scan', data);
    return res.data;
  },
  approveVerification: async (apartmentId: number): Promise<PendingVerification> => {
    const res = await api.post<PendingVerification>(`/main-admin/verifications/${apartmentId}/approve`);
    return res.data;
  },
  rejectVerification: async (apartmentId: number, notes?: string): Promise<PendingVerification> => {
    const res = await api.post<PendingVerification>(`/main-admin/verifications/${apartmentId}/reject`, {
      action: 'REJECT',
      notes: notes || 'Verification documents were insufficient or invalid.',
    });
    return res.data;
  },
};

// Community Admin
export const communityAdminApi = {
  getDashboard: async (): Promise<CommunityAdminDashboard> => {
    const res = await api.get<CommunityAdminDashboard>('/community-admin/dashboard');
    return res.data;
  },
  getHouseholds: async (): Promise<Household[]> => {
    const res = await api.get<Household[]>('/community-admin/households');
    return res.data;
  },
  createHousehold: async (data: {
    flatNumber: string;
    meterSerialNumber?: string;
    areaSqft?: number;
    occupancyCount?: number;
    hasMeter?: boolean;
    residentFullName?: string;
    residentEmail?: string;
    residentPhone?: string;
    residentPassword?: string;
    doc1Type?: string;
    doc1FileName?: string;
    doc1Base64?: string;
    doc2Type?: string;
    doc2FileName?: string;
    doc2Base64?: string;
    doc3Type?: string;
    doc3FileName?: string;
    doc3Base64?: string;
  }): Promise<Household> => {
    const res = await api.post<Household>('/community-admin/households', data);
    return res.data;
  },
  updateHousehold: async (
    householdId: number,
    data: {
      flatNumber: string;
      meterSerialNumber?: string;
      areaSqft?: number;
      occupancyCount?: number;
      hasMeter?: boolean;
      residentFullName?: string;
      residentEmail?: string;
      residentPhone?: string;
      status?: AccountStatus;
      doc1Type?: string;
      doc1FileName?: string;
      doc1Base64?: string;
      doc2Type?: string;
      doc2FileName?: string;
      doc2Base64?: string;
      doc3Type?: string;
      doc3FileName?: string;
      doc3Base64?: string;
    }
  ): Promise<Household> => {
    const res = await api.put<Household>(`/community-admin/households/${householdId}`, data);
    return res.data;
  },
  updateHouseholdStatus: async (householdId: number, status: AccountStatus): Promise<{ message: string; status: AccountStatus }> => {
    const res = await api.put<{ message: string; status: AccountStatus }>(`/community-admin/households/${householdId}/status`, { status });
    return res.data;
  },
  deleteHousehold: async (householdId: number): Promise<void> => {
    await api.delete(`/community-admin/households/${householdId}`);
  },
  logMeterReading: async (data: {
    householdId: number;
    readingDate: string;
    meterReadingKl: number;
  }): Promise<MeterReading> => {
    const res = await api.post<MeterReading>('/community-admin/meter-readings', data);
    return res.data;
  },
  bulkUploadCsv: async (file: File): Promise<BulkUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<BulkUploadResult>('/community-admin/meter-readings/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  getMeterReadings: async (householdId?: number): Promise<MeterReading[]> => {
    const res = await api.get<MeterReading[]>('/community-admin/meter-readings', {
      params: householdId ? { householdId } : {},
    });
    return res.data;
  },
  getAlerts: async (): Promise<Alert[]> => {
    const res = await api.get<Alert[]>('/community-admin/alerts');
    return res.data;
  },
  sendHouseholdCredentials: async (householdId: number, recipientEmail?: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.post<{ success: boolean; message: string }>(
      `/community-admin/households/${householdId}/send-credentials`,
      {},
      { params: recipientEmail ? { recipientEmail } : {} }
    );
    return res.data;
  },
  // Support Tickets & Escalations
  getSupportTickets: async (): Promise<SupportTicket[]> => {
    const res = await api.get<SupportTicket[]>('/community-admin/support-tickets');
    return res.data;
  },
  updateTicketStatus: async (ticketId: number, data: UpdateTicketStatusRequest): Promise<SupportTicket> => {
    const res = await api.put<SupportTicket>(`/community-admin/support-tickets/${ticketId}/status`, data);
    return res.data;
  },
  escalateSupportTicket: async (ticketId: number, data: EscalateTicketRequest): Promise<SupportTicket> => {
    const res = await api.put<SupportTicket>(`/community-admin/support-tickets/${ticketId}/escalate`, data);
    return res.data;
  },
  raiseCommunityConcern: async (data: CreateCommunityConcernRequest): Promise<SupportTicket> => {
    const res = await api.post<SupportTicket>('/community-admin/support-tickets/community-concern', data);
    return res.data;
  },
  // Announcements & Email Forwarding
  getAnnouncements: async (): Promise<Announcement[]> => {
    const res = await api.get<Announcement[]>('/community-admin/announcements');
    return res.data;
  },
  createAnnouncement: async (data: CreateAnnouncementRequest): Promise<Announcement> => {
    const res = await api.post<Announcement>('/community-admin/announcements', data);
    return res.data;
  },
  deleteAnnouncement: async (id: number): Promise<void> => {
    await api.delete(`/community-admin/announcements/${id}`);
  },
  forwardAnnouncementToEmail: async (announcementId: number): Promise<{ success: boolean; message: string; recipientCount: number }> => {
    const res = await api.post<{ success: boolean; message: string; recipientCount: number }>(`/community-admin/announcements/${announcementId}/forward-email`);
    return res.data;
  },
};

// Community Admin - Billing & Invoices
export const adminBillingApi = {
  getTariffPlan: async (): Promise<TariffPlan> => {
    const res = await api.get<TariffPlan>('/admin/tariffs');
    return res.data;
  },
  updateTariffPlan: async (data: TariffPlan): Promise<TariffPlan> => {
    const res = await api.put<TariffPlan>('/admin/tariffs', data);
    return res.data;
  },
  getBulkPurchases: async (): Promise<BulkPurchase[]> => {
    const res = await api.get<BulkPurchase[]>('/admin/bulk-purchases');
    return res.data;
  },
  getBulkPurchaseSummary: async (month?: string): Promise<BulkPurchaseCycleSummary> => {
    const res = await api.get<BulkPurchaseCycleSummary>('/admin/bulk-purchases/summary', {
      params: month ? { month } : {},
    });
    return res.data;
  },
  logBulkPurchase: async (data: CreateBulkPurchaseRequest): Promise<BulkPurchase> => {
    const res = await api.post<BulkPurchase>('/admin/bulk-purchases', data);
    return res.data;
  },
  deleteBulkPurchase: async (id: number): Promise<void> => {
    await api.delete(`/admin/bulk-purchases/${id}`);
  },
  getBillingCycles: async (): Promise<BillingCycle[]> => {
    const res = await api.get<BillingCycle[]>('/admin/billing/cycles');
    return res.data;
  },
  openBillingCycle: async (data: OpenBillingCycleRequest): Promise<BillingCycle> => {
    const res = await api.post<BillingCycle>('/admin/billing/cycles/open', data);
    return res.data;
  },
  finalizeBillingCycle: async (cycleId: number, data: FinalizeBillingCycleRequest): Promise<BillingCycle> => {
    const res = await api.post<BillingCycle>(`/admin/billing/cycles/${cycleId}/finalize`, data);
    return res.data;
  },
  archiveBillingCycle: async (cycleId: number): Promise<BillingCycle> => {
    const res = await api.post<BillingCycle>(`/admin/billing/cycles/${cycleId}/archive`);
    return res.data;
  },
  applyHouseholdAdjustment: async (invoiceId: number, data: HouseholdAdjustmentRequest): Promise<Invoice> => {
    const res = await api.put<Invoice>(`/admin/billing/invoices/${invoiceId}/adjustments`, data);
    return res.data;
  },
  generateMonthlyBills: async (data: GenerateBillsRequest): Promise<GenerateBillsResponse> => {
    const res = await api.post<GenerateBillsResponse>('/admin/billing/generate', data);
    return res.data;
  },
  autoDispatchBills: async (month?: string): Promise<GenerateBillsResponse> => {
    const res = await api.post<GenerateBillsResponse>('/admin/billing/auto-dispatch', null, {
      params: month ? { month } : {},
    });
    return res.data;
  },
  getInvoices: async (params?: { month?: string; status?: InvoiceStatus }): Promise<Invoice[]> => {
    const res = await api.get<Invoice[]>('/admin/billing/invoices', { params });
    return res.data;
  },
  getInvoiceById: async (id: number): Promise<Invoice> => {
    const res = await api.get<Invoice>(`/admin/billing/invoices/${id}`);
    return res.data;
  },
  markInvoicePaid: async (id: number, paymentMethod?: string): Promise<Invoice> => {
    const res = await api.post<Invoice>(`/admin/billing/invoices/${id}/mark-paid`, null, {
      params: { paymentMethod: paymentMethod || 'OFFLINE_CASH' },
    });
    return res.data;
  },
  getBillingStats: async (month?: string): Promise<BillingStats> => {
    const res = await api.get<BillingStats>('/admin/billing/stats', {
      params: month ? { month } : {},
    });
    return res.data;
  },
  scanLeaks: async (): Promise<LeakScanResult> => {
    const res = await api.post<LeakScanResult>('/admin/alerts/scan-leaks');
    return res.data;
  },
  getLeakAnomalies: async (): Promise<LeakScanResult> => {
    const res = await api.get<LeakScanResult>('/admin/alerts/anomalies');
    return res.data;
  },
  sendTestAlert: async (data: SendTestAlertRequest): Promise<AlertDispatchResponse> => {
    const res = await api.post<AlertDispatchResponse>('/admin/alerts/send-test-email', data);
    return res.data;
  },
  notifyResident: async (data: NotifyResidentAlertRequest): Promise<AlertDispatchResponse> => {
    const res = await api.post<AlertDispatchResponse>('/admin/alerts/notify-resident', data);
    return res.data;
  },
  downloadInvoicePdf: async (invoiceId: number, invoiceNumber: string): Promise<void> => {
    const res = await api.get(`/admin/billing/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `JalSetu_Invoice_${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  emailInvoice: async (invoiceId: number, recipientEmail?: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.post<{ success: boolean; message: string }>(
      `/admin/billing/invoices/${invoiceId}/email`,
      {},
      { params: recipientEmail ? { recipientEmail } : {} }
    );
    return res.data;
  },
  sendBillReminder: async (invoiceId: number): Promise<{ success: boolean; message: string }> => {
    const res = await api.post<{ success: boolean; message: string }>(`/admin/billing/invoices/${invoiceId}/send-reminder`);
    return res.data;
  },
};

// Resident APIs
export const residentApi = {
  getDashboard: async (): Promise<ResidentDashboard> => {
    const res = await api.get<ResidentDashboard>('/resident/dashboard');
    return res.data;
  },
  logMeterReading: async (data: {
    readingDate: string;
    meterReadingKl: number;
  }): Promise<MeterReading> => {
    const res = await api.post<MeterReading>('/resident/meter-readings', data);
    return res.data;
  },
  getMeterReadings: async (): Promise<MeterReading[]> => {
    const res = await api.get<MeterReading[]>('/resident/meter-readings');
    return res.data;
  },
  getAlerts: async (): Promise<Alert[]> => {
    const res = await api.get<Alert[]>('/resident/alerts');
    return res.data;
  },
  markAlertRead: async (alertId: number): Promise<void> => {
    await api.patch(`/resident/alerts/${alertId}/read`);
  },
  // Resident Support & Concerns
  getSupportTickets: async (): Promise<SupportTicket[]> => {
    const res = await api.get<SupportTicket[]>('/resident/support-tickets');
    return res.data;
  },
  createSupportTicket: async (data: CreateSupportTicketRequest): Promise<SupportTicket> => {
    const res = await api.post<SupportTicket>('/resident/support-tickets', data);
    return res.data;
  },
  // Resident Community Notices
  getAnnouncements: async (): Promise<Announcement[]> => {
    const res = await api.get<Announcement[]>('/resident/announcements');
    return res.data;
  },
};

// Resident Billing & Razorpay
export const residentBillingApi = {
  getInvoices: async (): Promise<Invoice[]> => {
    const res = await api.get<Invoice[]>('/resident/billing/invoices');
    return res.data;
  },
  getInvoiceById: async (id: number): Promise<Invoice> => {
    const res = await api.get<Invoice>(`/resident/billing/invoices/${id}`);
    return res.data;
  },
  downloadInvoicePdf: async (invoiceId: number, invoiceNumber: string): Promise<void> => {
    const res = await api.get(`/resident/billing/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `JalSetu_Invoice_${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  getTariffPlan: async (): Promise<TariffPlan> => {
    const res = await api.get<TariffPlan>('/resident/billing/tariff-plan');
    return res.data;
  },
  createRazorpayOrder: async (invoiceId: number): Promise<CreateRazorpayOrderResponse> => {
    const res = await api.post<CreateRazorpayOrderResponse>(`/resident/billing/invoices/${invoiceId}/create-razorpay-order`);
    return res.data;
  },
  verifyPayment: async (invoiceId: number, data: VerifyPaymentRequest): Promise<PaymentReceiptResponse> => {
    const res = await api.post<PaymentReceiptResponse>(`/resident/billing/invoices/${invoiceId}/verify-payment`, data);
    return res.data;
  },
};
