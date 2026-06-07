import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = ['Dashboard', 'Doctors', 'Patients', 'Appointments', 'Reports'];

  return (
    <div>
      {/* Top Bar */}
      <div style={{
        background: '#1a6b3a', color: '#fff',
        height: '52px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', position: 'fixed',
        top: 0, left: 0, right: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🏥</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>HMS — Hospital Management System</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Providing quality healthcare management</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
          <span>🔔</span>
          <span>{user?.name || 'Admin'}</span>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.4)',
            color: '#fff', padding: '5px 14px',
            borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* Navbar */}
      <div style={{
        background: '#145c30', height: '44px',
        display: 'flex', alignItems: 'center',
        padding: '0 32px', gap: '2px',
        position: 'fixed', top: '52px',
        left: 0, right: 0, zIndex: 99,
      }}>
        {links.map(link => (
          <div
            key={link}
            onClick={() => navigate(`/admin/${link.toLowerCase()}`)}
            style={{
              color: '#fff', padding: '8px 16px',
              fontSize: '13px', cursor: 'pointer', borderRadius: '4px',
              background: active === link ? 'rgba(255,255,255,0.15)' : 'transparent',
              opacity: active === link ? 1 : 0.85,
            }}
          >
            {link}
          </div>
        ))}
      </div>

      {/* News Bar */}
      <div style={{
        background: '#e8f5ee', borderBottom: '1px solid #b6d9c4',
        padding: '8px 32px', fontSize: '12px', color: '#1a6b3a',
        display: 'flex', gap: '16px', alignItems: 'center',
        position: 'fixed', top: '96px', left: 0, right: 0, zIndex: 98,
      }}>
        <span style={{ background: '#1a6b3a', color: '#fff', padding: '2px 10px', borderRadius: '3px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>NEWS</span>
        <span>Welcome to Hospital Management System — Admin Panel</span>
      </div>
    </div>
  );
}