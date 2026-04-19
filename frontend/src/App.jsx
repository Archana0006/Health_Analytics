import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';


// Lazy load pages ...
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Predictions = lazy(() => import('./pages/Predictions'));
const Records = lazy(() => import('./pages/Records'));
const Register = lazy(() => import('./pages/Register'));
const Settings = lazy(() => import('./pages/Settings'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Documents = lazy(() => import('./pages/Documents'));
const Patients = lazy(() => import('./pages/Patients'));
const Doctors = lazy(() => import('./pages/Doctors'));
const LabDashboard = lazy(() => import('./pages/LabDashboard'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Notifications = lazy(() => import('./pages/Notifications'));
const UsersManagement = lazy(() => import('./pages/UsersManagement'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    style={{ height: '100%', width: '100%' }}
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuth();
  if (token === undefined) return <LoadingFallback />;
  if (!token) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their respective correct dashboard if they try to access unauthorized area
    const landing = user?.role === 'admin' ? '/admin-dashboard' : (user?.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
    return <Navigate to={landing} replace />;
  }
  
  return children;
};

const LoadingFallback = () => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-deep)', gap: '1.5rem', width: '100%' }}>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '72px', height: '72px', border: '3px solid rgba(108,99,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }}></div>
      <div style={{ position: 'absolute', color: 'var(--primary)', animation: 'pulse 2s ease-in-out infinite' }}>
        <HeartPulse size={28} />
      </div>
    </div>
    <p style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.03em' }}>Initializing HealthAI...</p>
  </div>
);

function AppContent() {
  const { token, user } = useAuth();
  const location = useLocation();

  return (
    <div className="app">
      {token && <Navbar />}
      <div style={{ display: 'flex', position: 'relative', minHeight: 'calc(100vh - 70px)' }}>
        {token && <Sidebar />}
        <main className={token ? 'main-content' : ''} style={{ flex: 1, minWidth: 0 }}>
          <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route path="/login" element={token ? <Navigate to="/" replace /> : <PageTransition><Login /></PageTransition>} />
                <Route path="/register" element={token ? <Navigate to="/" replace /> : <PageTransition><Register /></PageTransition>} />
                <Route path="/forgot-password" element={token ? <Navigate to="/" replace /> : <PageTransition><ForgotPassword /></PageTransition>} />
                <Route path="/reset-password/:token" element={token ? <Navigate to="/" replace /> : <PageTransition><ResetPassword /></PageTransition>} />

                {/* Protected Routes */}
                <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
                <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><PageTransition><DoctorDashboard /></PageTransition></ProtectedRoute>} />
                <Route path="/patient-dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PageTransition><PatientDashboard /></PageTransition></ProtectedRoute>} />
                
                <Route path="/analytics" element={<ProtectedRoute><PageTransition><Analytics /></PageTransition></ProtectedRoute>} />
                <Route path="/analytics/:patientId" element={<ProtectedRoute><PageTransition><Analytics /></PageTransition></ProtectedRoute>} />
                <Route path="/predictions" element={<ProtectedRoute><PageTransition><Predictions /></PageTransition></ProtectedRoute>} />
                <Route path="/records" element={<ProtectedRoute><PageTransition><Records /></PageTransition></ProtectedRoute>} />
                <Route path="/records/:patientId" element={<ProtectedRoute><PageTransition><Records /></PageTransition></ProtectedRoute>} />
                <Route path="/patients" element={<ProtectedRoute><PageTransition><Patients /></PageTransition></ProtectedRoute>} />
                <Route path="/doctors" element={<ProtectedRoute><PageTransition><Doctors /></PageTransition></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><UsersManagement /></PageTransition></ProtectedRoute>} />
                <Route path="/documents" element={<ProtectedRoute><PageTransition><Documents /></PageTransition></ProtectedRoute>} />
                <Route path="/documents/:patientId" element={<ProtectedRoute><PageTransition><Documents /></PageTransition></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute><PageTransition><Appointments /></PageTransition></ProtectedRoute>} />
                <Route path="/appointments/:patientId" element={<ProtectedRoute><PageTransition><Appointments /></PageTransition></ProtectedRoute>} />
                <Route path="/labs" element={<ProtectedRoute><PageTransition><LabDashboard /></PageTransition></ProtectedRoute>} />
                <Route path="/timeline" element={<ProtectedRoute><PageTransition><Timeline /></PageTransition></ProtectedRoute>} />
                <Route path="/timeline/:patientId" element={<ProtectedRoute><PageTransition><Timeline /></PageTransition></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><PageTransition><Notifications /></PageTransition></ProtectedRoute>} />

                {/* Root & Fallback */}
                <Route path="/" element={
                  !token ? <Navigate to="/login" /> : 
                  (user?.role === 'admin' ? <Navigate to="/admin-dashboard" /> : 
                  (user?.role === 'doctor' ? <Navigate to="/doctor-dashboard" /> : 
                  <Navigate to="/patient-dashboard" />))
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              },
            }}
          />
          <AppContent />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
