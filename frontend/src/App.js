import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientDashboard from './pages/patient/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AddDoctor from './pages/admin/AddDoctor';
import Appointments from './pages/admin/Appointments';
import Patients from './pages/admin/Patients';
import MyAppointments from './pages/doctor/MyAppointments';
import BookAppointment from './pages/patient/BookAppointment';
import Profile from './pages/patient/Profile';
import DoctorProfile from './pages/doctor/profile'; 
import DoctorMyPatients from './pages/doctor/MyPatients';
import Departments from './pages/departments';
import Doctors from './pages/doctors';


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
          {/* Public Routes - MUST come first */}
          <Route path="/" element={<Home />} />
          <Route path="/" element={<Navigate to="/departments" />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
     

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />} />
          <Route path="/admin/doctors" element={<ProtectedRoute element={<AdminDoctors />} allowedRole="admin" />} />
          <Route path="/admin/add-doctor" element={<ProtectedRoute element={<AddDoctor />} allowedRole="admin" />} />
          <Route path="/admin/appointments" element={<ProtectedRoute element={<Appointments />} allowedRole="admin" />} />
          <Route path="/admin/patients" element={<ProtectedRoute element={<Patients />} allowedRole="admin" />} />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute element={<DoctorDashboard />} allowedRole="doctor" />} />
          <Route path="/doctor/appointments" element={<ProtectedRoute element={<MyAppointments />} allowedRole="doctor" />} />
          <Route path="/doctor/profile" element={<ProtectedRoute element={<DoctorProfile />} allowedRole="doctor" />} />
          <Route path="/doctor/patients" element={<ProtectedRoute element={<DoctorMyPatients />} allowedRole="doctor" />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<ProtectedRoute element={<PatientDashboard />} allowedRole="patient" />} />
          <Route path="/patient/book-appointment" element={<ProtectedRoute element={<BookAppointment />} allowedRole="patient" />} />
          <Route path="/patient/profile" element={<ProtectedRoute element={<Profile />} allowedRole="patient" />} />

          {/* Catch-all route - MUST be last */}
          <Route path="*" element={<Navigate to="/departments" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;