import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientDashboard from './pages/patient/Dashboard';
import Doctors from './pages/admin/Doctors';
import MyAppointments from './pages/doctor/MyAppointments';
// CRITICAL NEW IMPORTS: Bringing in your missing patient pages
import BookAppointment from './pages/patient/BookAppointment';
import PatientProfile from './pages/patient/Profile';

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

         
          <Route path="/admin/dashboard" element={
            <ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute element={<Doctors />} allowedRole="admin" />
          } />

          <Route path="/doctor/appointments" element={
  <ProtectedRoute element={<MyAppointments />} allowedRole="doctor" />
} />
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute element={<DoctorDashboard />} allowedRole="doctor" />
          } />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={
            <ProtectedRoute element={<PatientDashboard />} allowedRole="patient" />
          } />
          
          
          <Route path="/patient/book-appointment" element={
            <ProtectedRoute element={<BookAppointment />} allowedRole="patient" />
          } />

        
          <Route path="/patient/profile" element={
            <ProtectedRoute element={<PatientProfile />} allowedRole="patient" />
          } />

          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;