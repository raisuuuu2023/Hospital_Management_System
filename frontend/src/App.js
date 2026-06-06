import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientDashboard from './pages/patient/Dashboard';

// ✅ Protected Route - login না করলে /login এ পাঠাবে
const ProtectedRoute = ({ element, allowedRole }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/login" />;
  return element;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />
          } />
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute element={<DoctorDashboard />} allowedRole="doctor" />
          } />
          <Route path="/patient/dashboard" element={
            <ProtectedRoute element={<PatientDashboard />} allowedRole="patient" />
          } />

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;