import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { FloatingAssistant } from './components/FloatingAssistant';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { PwaOfflineBadge } from './components/PwaOfflineBadge';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerificationPendingPage } from './pages/VerificationPendingPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { ConfirmDialogProvider } from './context/ConfirmDialogContext';

import { MainAdminDashboard } from './pages/main-admin/MainAdminDashboard';
import { CommunityAdminsPage } from './pages/main-admin/CommunityAdminsPage';
import { MainAdminReportsPage } from './pages/main-admin/MainAdminReportsPage';
import { MainAdminTariffsPage } from './pages/main-admin/MainAdminTariffsPage';
import { MainAdminSupportDeskPage } from './pages/main-admin/MainAdminSupportDeskPage';
import { MainAdminAnnouncementsPage } from './pages/main-admin/MainAdminAnnouncementsPage';

// Community Admin
import { CommunityAdminDashboard } from './pages/community-admin/CommunityAdminDashboard';
import { HouseholdsPage } from './pages/community-admin/HouseholdsPage';
import { MeterReadingsPage } from './pages/community-admin/MeterReadingsPage';
import { ApportionmentReportsPage } from './pages/community-admin/ApportionmentReportsPage';
import { BillingInvoicesPage } from './pages/community-admin/BillingInvoicesPage';
import { TariffConfigPage } from './pages/community-admin/TariffConfigPage';
import { BulkPurchasesPage } from './pages/community-admin/BulkPurchasesPage';
import { LeakAnomalyTrackerPage } from './pages/community-admin/LeakAnomalyTrackerPage';
import { AdminSupportDeskPage } from './pages/community-admin/AdminSupportDeskPage';
import { AnnouncementsPage } from './pages/community-admin/AnnouncementsPage';

// Resident
import { ResidentDashboard } from './pages/resident/ResidentDashboard';
import { UsageHistoryPage } from './pages/resident/UsageHistoryPage';
import { ResidentInvoicesPage } from './pages/resident/ResidentInvoicesPage';
import { ResidentAlertsPage } from './pages/resident/ResidentAlertsPage';
import { ResidentSupportPage } from './pages/resident/ResidentSupportPage';
import { ResidentNoticesPage } from './pages/resident/ResidentNoticesPage';
import { ConservationReportsPage } from './pages/resident/ConservationReportsPage';
import { ResidentWaterTipsPage } from './pages/resident/ResidentWaterTipsPage';
import { ProfilePage } from './pages/resident/ProfilePage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './services/googleAuth';

// Floating Chatbot with page-aware context adaptation (login, register, landing, and dashboards)
const GlobalFloatingChatbot: React.FC = () => {
  return <FloatingAssistant />;
};

export const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ConfirmDialogProvider>
              <BrowserRouter>
            <Routes>
              {/* Public Landing, Auth & Legal Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verification-pending" element={<VerificationPendingPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/terms-and-conditions" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />
              <Route path="/cookie-policy" element={<CookiePolicyPage />} />
              <Route path="/404" element={<NotFoundPage />} />

              {/* Main Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['MAIN_ADMIN']} />}>
                <Route
                  path="/main-admin"
                  element={
                    <DashboardLayout
                      role="MAIN_ADMIN"
                      title="Main Admin Portal"
                      subtitle="Platform Owner Management Console"
                    />
                  }
                >
                  <Route path="dashboard" element={<MainAdminDashboard />} />
                  <Route path="apartments" element={<MainAdminDashboard />} />
                  <Route path="admins" element={<CommunityAdminsPage />} />
                  <Route path="tariffs" element={<MainAdminTariffsPage />} />
                  <Route path="reports" element={<MainAdminReportsPage />} />
                  <Route path="support" element={<MainAdminSupportDeskPage />} />
                  <Route path="announcements" element={<MainAdminAnnouncementsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>
              </Route>

              {/* Community Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']} />}>
                <Route
                  path="/community-admin"
                  element={
                    <DashboardLayout
                      role="COMMUNITY_ADMIN"
                      title="Community Management Panel"
                      subtitle="Household Water Usage & Meter Operations"
                    />
                  }
                >
                  <Route path="dashboard" element={<CommunityAdminDashboard />} />
                  <Route path="households" element={<HouseholdsPage />} />
                  <Route path="meter-readings" element={<MeterReadingsPage />} />
                  <Route path="billing" element={<BillingInvoicesPage />} />
                  <Route path="tariffs" element={<TariffConfigPage />} />
                  <Route path="bulk-purchases" element={<BulkPurchasesPage />} />
                  <Route path="reports" element={<ApportionmentReportsPage />} />
                  <Route path="leakage" element={<LeakAnomalyTrackerPage />} />
                  <Route path="support" element={<AdminSupportDeskPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>
              </Route>

              {/* Resident Routes */}
              <Route element={<ProtectedRoute allowedRoles={['RESIDENT']} />}>
                <Route
                  path="/resident"
                  element={
                    <DashboardLayout
                      role="RESIDENT"
                      title="Resident Water Portal"
                      subtitle="Personal Usage Monitoring & Consumption Analytics"
                    />
                  }
                >
                  <Route path="dashboard" element={<ResidentDashboard />} />
                  <Route path="usage" element={<UsageHistoryPage />} />
                  <Route path="bills" element={<ResidentInvoicesPage />} />
                  <Route path="invoices" element={<ResidentInvoicesPage />} />
                  <Route path="alerts" element={<ResidentAlertsPage />} />
                  <Route path="notifications" element={<ResidentAlertsPage />} />
                  <Route path="announcements" element={<ResidentNoticesPage />} />
                  <Route path="notices" element={<ResidentNoticesPage />} />
                  <Route path="reports" element={<ConservationReportsPage />} />
                  <Route path="water-tips" element={<ResidentWaterTipsPage />} />
                  <Route path="tips" element={<ResidentWaterTipsPage />} />
                  <Route path="support" element={<ResidentSupportPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>
              </Route>

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {/* Floating Gemini AI Chatbot */}
            <GlobalFloatingChatbot />

            {/* Cookie & Telemetry Consent Banner */}
            <CookieConsentBanner />

            {/* Global PWA Offline Badge & Install Banner */}
            <PwaOfflineBadge />
            <PwaInstallBanner />
          </BrowserRouter>
          </ConfirmDialogProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
