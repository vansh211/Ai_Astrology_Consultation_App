import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StarsBackground from './components/StarsBackground';
import HelpAssistant from './components/HelpAssistant';
import ComplaintModal from './components/ComplaintModal';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import Bookings from './pages/Bookings';
import Consultations from './pages/Consultations';
import ConsultationDetails from './pages/ConsultationDetails';
import Profile from './pages/Profile';
import ClientDashboard from './pages/ClientDashboard';
import AstrologerDashboard from './pages/AstrologerDashboard';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'client') {
    return <ClientDashboard />;
  }
  return <AstrologerDashboard />;
};

function AppContent() {
  const [complaintOpen, setComplaintOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative bg-astro-cream">
      <StarsBackground />
      <Navbar />
      <main className="flex-1 pb-12">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultations"
            element={
              <ProtectedRoute>
                <Consultations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultations/:id"
            element={
              <ProtectedRoute>
                <ConsultationDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['astrologer']}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer onReportProblem={() => setComplaintOpen(true)} />
      <HelpAssistant />
      <ComplaintModal isOpen={complaintOpen} onClose={() => setComplaintOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
