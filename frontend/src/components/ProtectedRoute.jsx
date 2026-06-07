import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
    if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" />;
    if (user.role === 'patient') return <Navigate to="/patient/dashboard" />;
    return <Navigate to="/login" />;
  }

  return children;
}