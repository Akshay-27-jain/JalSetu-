export type Role = 'MAIN_ADMIN' | 'COMMUNITY_ADMIN' | 'RESIDENT';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING_APPROVAL' | 'REJECTED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: Role;
  status?: AccountStatus;
  apartmentId?: number;
  householdId?: number;
  apartmentName?: string;
  flatNumber?: string;
  verificationNotes?: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
  status?: AccountStatus;
  fullName: string;
  email: string;
  phoneNumber?: string;
  apartmentId?: number;
  householdId?: number;
  apartmentName?: string;
  flatNumber?: string;
  verificationNotes?: string;
  
  // 3 Verification Documents
  doc1Url?: string;
  doc1Type?: string;
  doc1FileName?: string;
  
  doc2Url?: string;
  doc2Type?: string;
  doc2FileName?: string;
  
  doc3Url?: string;
  doc3Type?: string;
  doc3FileName?: string;
  
  // AI Verification Audit
  aiVerificationScore?: number;
  aiVerificationStatus?: 'AUTHENTIC' | 'NEEDS_REVIEW' | 'SUSPICIOUS' | 'REJECTED_FAKE' | 'PENDING_SCAN' | string;
  aiVerificationSummary?: string;

  // Backward compatibility
  documentUrl?: string;
  documentType?: string;
  documentFileName?: string;
}

export interface PendingVerification {
  verificationType?: 'COMMUNITY_ADMIN' | 'RESIDENT';
  userId?: number;
  apartmentId?: number;
  householdId?: number;
  apartmentName: string;
  flatNumber?: string;
  address?: string;
  totalHouseholds?: number;
  adminId?: number;
  adminFullName: string;
  adminEmail: string;
  adminPhone?: string;
  status: AccountStatus;
  
  // 3 Mandatory Verification Documents
  doc1Type?: string;
  doc1FileName?: string;
  doc1Url?: string;

  doc2Type?: string;
  doc2FileName?: string;
  doc2Url?: string;

  doc3Type?: string;
  doc3FileName?: string;
  doc3Url?: string;

  // Backward compatibility
  documentUrl?: string;
  documentFileName?: string;
  documentType?: string;

  // AI Verification Audit
  aiVerificationScore?: number;
  aiVerificationStatus?: 'AUTHENTIC' | 'NEEDS_REVIEW' | 'SUSPICIOUS' | 'REJECTED_FAKE' | 'PENDING_SCAN' | string;
  aiVerificationSummary?: string;
  aiExtractedDataJson?: string;

  verificationNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface VerificationStatusResponse {
  userId: number;
  email: string;
  fullName: string;
  role?: Role;
  apartmentId?: number;
  apartmentName?: string;
  householdId?: number;
  flatNumber?: string;
  status: AccountStatus;
  
  doc1Type?: string;
  doc1FileName?: string;
  doc1Url?: string;

  doc2Type?: string;
  doc2FileName?: string;
  doc2Url?: string;

  doc3Type?: string;
  doc3FileName?: string;
  doc3Url?: string;

  aiVerificationScore?: number;
  aiVerificationStatus?: string;
  aiVerificationSummary?: string;

  verificationNotes?: string;
  submittedAt?: string;

  // Backward compatibility
  documentType?: string;
  documentFileName?: string;
}

export interface GoogleOAuthRequest {
  token: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface Apartment {
  id: number;
  name: string;
  address?: string;
  totalHouseholds: number;
  registeredHouseholds: number;
  adminName?: string;
  adminEmail?: string;
  createdAt: string;
}

export interface Household {
  id: number;
  apartmentId: number;
  flatNumber: string;
  status?: AccountStatus;
  meterSerialNumber?: string;
  areaSqft?: number;
  occupancyCount?: number;
  hasMeter: boolean;
  inviteCode: string;
  residentName?: string;
  residentEmail?: string;
  residentPhone?: string;
  createdAt: string;
  latestReadingKl?: number;
  currentMonthConsumptionKl?: number;
  doc1Type?: string;
  doc1FileName?: string;
  doc1Url?: string;
  doc2Type?: string;
  doc2FileName?: string;
  doc2Url?: string;
  doc3Type?: string;
  doc3FileName?: string;
  doc3Url?: string;
  aiVerificationScore?: number;
  aiVerificationStatus?: string;
  aiVerificationSummary?: string;
  verificationNotes?: string;
}

export interface MeterReading {
  id: number;
  householdId: number;
  flatNumber: string;
  meterSerialNumber?: string;
  apartmentName: string;
  readingDate: string;
  meterReadingKl: number;
  consumptionKl: number;
  source: 'MANUAL' | 'CSV';
  status: 'Normal' | 'Overuse';
  createdAt: string;
}

export interface FailedRow {
  row: number;
  flatNumber?: string;
  readingDate?: string;
  meterReading?: string;
  reason: string;
}

export interface BulkUploadResult {
  successCount: number;
  failureCount: number;
  totalProcessed: number;
  failedRows: FailedRow[];
}

export interface Alert {
  id: number;
  householdId: number;
  flatNumber: string;
  type: 'OVERUSE' | 'ANOMALY' | 'BILL_READY' | 'SUPPLY_NOTICE';
  message: string;
  sentAt: string;
  isRead: boolean;
}

export interface TopConsumer {
  householdId: number;
  flatNumber: string;
  consumptionKl: number;
}

export interface UsageTrend {
  label: string;
  consumptionKl: number;
  communityAvgKl: number;
}

export interface CommunityAdminDashboard {
  apartmentId: number;
  apartmentName: string;
  totalHouseholds: number;
  meteredHouseholds: number;
  currentMonthConsumption: number;
  avgDailyUsage: number;
  activeAlertsCount: number;
  topConsumers: TopConsumer[];
  recentLogs: MeterReading[];
  activeAlerts: Alert[];
}

export interface ResidentDashboard {
  householdId: number;
  flatNumber: string;
  meterSerialNumber?: string;
  apartmentName: string;
  currentMonthConsumption: number;
  lastReadingValue: number;
  lastReadingDate: string;
  communityAvgConsumption: number;
  activeAlertsCount: number;
  usageTrends: UsageTrend[];
  recentLogs: MeterReading[];
  activeAlerts: Alert[];
}

export interface MainAdminStats {
  totalApartments: number;
  totalHouseholds: number;
  totalUsers: number;
  totalConsumptionCurrentMonth: number;
}

// ---------------- BILLING, TARIFF & RAZORPAY TYPES ----------------

export type ApportionmentMethod =
  | 'EQUAL_PER_FLAT'
  | 'BY_FLAT_AREA'
  | 'BY_OCCUPANCY'
  | 'BY_METERED_CONSUMPTION_WITH_AREA_FALLBACK';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface TariffPlan {
  id?: number;
  apartmentId?: number;
  baseMaintenanceFee: number;
  baseRatePerKl: number;      // Slab 1 rate (₹/kL)
  baseTierLimitKl: number;     // Slab 1 limit (kL)
  midRatePerKl: number;       // Slab 2 rate (₹/kL)
  midTierLimitKl: number;      // Slab 2 limit (kL)
  higherRatePerKl: number;    // Slab 3 rate (₹/kL)
  apportionmentMethod: ApportionmentMethod;
  effectiveFrom?: string;
}

export interface BulkPurchase {
  id: number;
  apartmentId: number;
  sourceType: 'TANKER' | 'BOREWELL' | 'MUNICIPAL' | 'RECYCLED';
  vendorName: string;
  volumeKl: number;
  unitCost: number;
  totalCost: number;
  purchasedAt: string;
  createdAt?: string;
}

export interface BulkPurchaseCycleSummary {
  apartmentId: number;
  billingMonth: string;
  totalVolumeKl: number;
  totalCost: number;
  effectiveUnitCost: number;
  deliveryCount: number;
  tankerVolumeKl: number;
  tankerCost: number;
  municipalVolumeKl: number;
  municipalCost: number;
}

export interface CreateBulkPurchaseRequest {
  sourceType?: 'TANKER' | 'BOREWELL' | 'MUNICIPAL' | 'RECYCLED';
  vendorName: string;
  volumeKl: number;
  unitCost: number;
  purchasedAt: string;
}

export type BillingCycleStatus = 'OPEN' | 'FINALIZED' | 'ARCHIVED';

export interface BillingCycle {
  id: number;
  apartmentId: number;
  startDate: string;
  endDate: string;
  status: BillingCycleStatus;
  createdAt: string;
  totalInvoices: number;
  totalBilledAmount: number;
}

export interface OpenBillingCycleRequest {
  startDate: string;
  endDate: string;
}

export interface FinalizeBillingCycleRequest {
  dueDate?: string;
  commonAreaWaterKl?: number;
}

export interface HouseholdAdjustmentRequest {
  adjustmentAmount: number;
  reason: string;
}

export interface LeakAnomalyItem {
  householdId: number;
  flatNumber: string;
  residentName?: string;
  residentEmail?: string;
  meterSerialNumber?: string;
  latestConsumptionKl: number;
  meanConsumptionKl: number;
  stdDevKl: number;
  zScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH_LEAK';
  status: string;
  readingDate: string;
}

export interface LeakScanResult {
  apartmentId: number;
  scannedAt: string;
  totalHouseholdsScanned: number;
  outliersDetected: number;
  highRiskLeakCount: number;
  averageConsumptionKl: number;
  anomalies: LeakAnomalyItem[];
}

export interface SlabBreakdownItem {
  slabName: string;
  volumeBilledKl: number;
  ratePerKl: number;
  amount: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  householdId: number;
  flatNumber: string;
  residentName?: string;
  residentEmail?: string;
  residentPhone?: string;
  meterSerialNumber?: string;
  billingMonth: string;
  meterReadingStartKl: number;
  meterReadingEndKl: number;
  consumptionKl: number;
  baseCharge: number;
  meteredCharge: number;
  sharedCharge: number;
  adjustments?: number;
  totalAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  generatedAt?: string;
  slabBreakdown?: SlabBreakdownItem[];
  apportionmentDetails?: string;
}

export interface GenerateBillsRequest {
  billingMonth: string;
  dueDate?: string;
  commonAreaWaterKl?: number;
}

export interface GenerateBillsResponse {
  billingMonth: string;
  totalHouseholds: number;
  generatedInvoicesCount: number;
  skippedInvoicesCount: number;
  totalBilledAmount: number;
  message: string;
}

export interface BillingStats {
  billingMonth: string;
  totalInvoicedAmount: number;
  totalCollectedAmount: number;
  totalPendingAmount: number;
  totalOverdueAmount: number;
  totalInvoicesCount: number;
  paidInvoicesCount: number;
  pendingInvoicesCount: number;
  overdueInvoicesCount: number;
  collectionRatePercentage: number;
}

export interface CreateRazorpayOrderResponse {
  keyId: string;
  orderId: string;
  invoiceNumber: string;
  invoiceId: number;
  amount: number;
  amountInPaise: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerContact: string;
  societyName: string;
  flatNumber: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentReceiptResponse {
  success: boolean;
  message: string;
  invoiceNumber: string;
  amountPaid: number;
  paymentId: string;
  orderId: string;
  paymentTime: string;
  receiptPdfUrl?: string;
}

export interface CommunityAdminDetail {
  adminId: number;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  role: Role;
  status?: AccountStatus;
  apartmentId?: number;
  apartmentName: string;
  apartmentAddress?: string;
  totalHouseholds: number;
  registeredHouseholds: number;
  activeMetersCount: number;
  totalMonthlyConsumptionKl: number;
  totalMonthlyRevenue: number;
  baseTariffSummary: string;
  adminCreatedAt: string;
  apartmentCreatedAt?: string;
  households: Household[];
}

export interface UpdateCommunityAdminRequest {
  adminFullName: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword?: string;
  apartmentName: string;
  apartmentAddress?: string;
  totalHouseholds: number;
  status?: AccountStatus;
}

export interface PlatformHousehold {
  id: number;
  apartmentId: number;
  apartmentName: string;
  flatNumber: string;
  status?: AccountStatus;
  meterSerialNumber?: string;
  areaSqft?: number;
  occupancyCount?: number;
  hasMeter: boolean;
  inviteCode: string;
  residentName?: string;
  residentEmail?: string;
  residentPhone?: string;
  latestReadingKl?: number;
  currentMonthConsumptionKl?: number;
  createdAt: string;
}

export interface MonthlyTrend {
  month: string;
  consumptionKl: number;
  billedAmount: number;
  collectedAmount: number;
}

export interface SocietyAnalytics {
  apartmentId: number;
  apartmentName: string;
  adminName: string;
  adminEmail: string;
  totalHouseholds: number;
  registeredHouseholds: number;
  activeMeters: number;
  consumptionKl: number;
  billedAmount: number;
  collectedAmount: number;
  collectionRate: number;
}

export interface TopConsumer {
  flatNumber: string;
  apartmentName: string;
  residentName: string;
  consumptionKl: number;
}

export interface PlatformAnalytics {
  totalApartments: number;
  totalHouseholds: number;
  totalUsers: number;
  totalActiveMeters: number;
  totalConsumptionCurrentMonth: number;
  totalBilledCurrentMonth: number;
  totalCollectedCurrentMonth: number;
  collectionRatePercentage: number;
  monthlyTrends: MonthlyTrend[];
  societyStats: SocietyAnalytics[];
  topConsumers: TopConsumer[];
}

export interface SendTestAlertRequest {
  recipientEmail: string;
  alertType?: 'ANOMALY' | 'OVERUSE';
  flatNumber?: string;
  consumptionKl?: number;
  meanConsumptionKl?: number;
  zScore?: number;
}

export interface NotifyResidentAlertRequest {
  householdId: number;
  overrideEmail?: string;
  customMessage?: string;
  force?: boolean;
  consumptionKl?: number;
  meanConsumptionKl?: number;
  zScore?: number;
  readingDate?: string;
}

export interface AlertDispatchResponse {
  success: boolean;
  message: string;
  recipientEmail: string;
  alertType: string;
  dispatchedAt: string;
}

export interface ApartmentTariffSummary {
  apartmentId: number;
  apartmentName: string;
  address?: string;
  totalHouseholds: number;
  registeredHouseholds: number;
  activeMetersCount: number;
  tariffId?: number;
  baseMaintenanceFee: number;
  baseRatePerKl: number;
  baseTierLimitKl: number;
  midRatePerKl: number;
  midTierLimitKl: number;
  higherRatePerKl: number;
  apportionmentMethod: ApportionmentMethod;
  effectiveFrom?: string;
}

export interface PlatformTariffOverview {
  totalApartments: number;
  averageBaseRate: number;
  averageMidRate: number;
  averageHigherRate: number;
  averageBaseFee: number;
  tariffs: ApartmentTariffSummary[];
}

export type TicketCategory = 'METER_DEFECT' | 'BILLING_DISPUTE' | 'WATER_LEAKAGE' | 'LOW_PRESSURE' | 'WATER_QUALITY' | 'GENERAL';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: number;
  apartmentId: number;
  apartmentName?: string;
  householdId?: number;
  flatNumber: string;
  userId?: number;
  residentName: string;
  residentEmail?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  isEscalatedToMainAdmin?: boolean;
  escalationReason?: string;
  escalatedAt?: string;
  ticketScope?: 'HOUSEHOLD' | 'COMMUNITY_ADMIN_ISSUE';
  mainAdminNotes?: string;
  resolvedByRole?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportTicketRequest {
  category: TicketCategory;
  priority?: TicketPriority;
  subject: string;
  description: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
  resolutionNotes?: string;
}

export interface EscalateTicketRequest {
  escalationReason: string;
}

export interface CreateCommunityConcernRequest {
  category: 'BULK_SUPPLY_ISSUE' | 'HARDWARE_DEFECT' | 'TARIFF_DISPUTE' | 'MUNICIPAL_OUTAGE' | 'GENERAL';
  priority?: 'MEDIUM' | 'HIGH' | 'URGENT';
  subject: string;
  description: string;
}

export interface ResolveTicketByMainAdminRequest {
  status: TicketStatus;
  mainAdminNotes: string;
  resolutionNotes?: string;
}

export type AnnouncementCategory = 'TANK_CLEANING' | 'SUPPLY_INTERRUPTION' | 'MAINTENANCE' | 'BILLING_NOTICE' | 'WATER_QUALITY' | 'RATIONING_ADVISORY' | 'GENERAL';
export type AnnouncementPriority = 'NORMAL' | 'IMPORTANT' | 'CRITICAL';

export interface Announcement {
  id: number;
  apartmentId?: number;
  apartmentName?: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  isPinned: boolean;
  isMainAdminBroadcast?: boolean;
  targetApartmentId?: number;
  forwardedToResidentsByEmail?: boolean;
  forwardedAt?: string;
  forwardedByAdminName?: string;
  publishDate?: string;
  expiryDate?: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  category?: AnnouncementCategory;
  priority?: AnnouncementPriority;
  isPinned?: boolean;
  publishDate?: string;
  expiryDate?: string;
  sendEmailBroadcast?: boolean;
}

export interface CreateMainAdminAnnouncementRequest {
  title: string;
  content: string;
  category?: AnnouncementCategory;
  priority?: AnnouncementPriority;
  isPinned?: boolean;
  targetApartmentId?: number;
  sendEmailBroadcast?: boolean;
}



