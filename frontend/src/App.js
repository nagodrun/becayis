import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FeedbackButton } from './components/FeedbackButton';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import CreateEditListing from './pages/CreateEditListing';
import ChatPage from './pages/ChatPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Help from './pages/Help';
import KVKK from './pages/KVKK';
import KVKKBasvuru from './pages/KVKKBasvuru';
import Cookies from './pages/Cookies';
import MembershipAgreement from './pages/MembershipAgreement';

// Scroll to top component - always scroll to top on any navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Always scroll to top on route change or page refresh
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Yukleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/help" element={<Help />} />
          <Route path="/kvkk" element={<KVKK />} />
          <Route path="/kvkk-basvuru" element={<KVKKBasvuru />} />
          <Route path="/cerezler" element={<Cookies />} />
          <Route path="/uyelik-sozlesmesi" element={<MembershipAgreement />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/profile/complete"
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/create"
            element={
              <ProtectedRoute>
                <CreateEditListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:id/edit"
            element={
              <ProtectedRoute>
                <CreateEditListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          {/* Redirect /profile and /messages to dashboard */}
          <Route
            path="/profile"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/messages"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
          <FeedbackButton />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
