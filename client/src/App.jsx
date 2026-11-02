import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

// Workspace & Dashboard Pages
import DashboardPage from './pages/DashboardPage';
import DocumentAnalyzerPage from './pages/DocumentAnalyzerPage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import AnalysisHistoryPage from './pages/AnalysisHistoryPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#070d1e',
            color: '#f8fafc',
            border: '1px solid rgba(0, 210, 255, 0.25)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
            fontSize: '13px',
            borderRadius: '14px',
          },
          success: {
            iconTheme: {
              primary: '#00d2ff',
              secondary: '#070d1e',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#070d1e',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes with Global Navbar & Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Protected Workspace & Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analyzer" element={<DocumentAnalyzerPage />} />
          <Route path="/result/:id" element={<AnalysisResultPage />} />
          <Route path="/history" element={<AnalysisHistoryPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
