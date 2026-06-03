import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ active, setActive }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = ['Dashboard', 'Doctors', 'Patients', 'Appointments', 'Reports'];

  return (
    <div>
      {/* Top Navbar */}
      <div style={{
        background: '#1a6b3a',
        color: '#fff',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}>
        <div style={{ fontSize: '18px', fontWeight: '500' }}>
          🏥 HMS — Hospital Management
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {links.map(link => (
            <div
              key={link}
              onClick={() => setActive && setActive(link)}
              style={{
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                background: active === link ? 'rgba(255,255,255,0.2)' : 'transparent',
                opacity: active === link ? 1 : 0.85,
              }}
            >
              {link}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🔔</span>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#fff', color: '#1a6b3a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '600',
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span style={{ fontSize: '13px' }}>{user?.name || 'Admin'}</span>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none', color: '#fff',
            padding: '6px 12px', borderRadius: '6px',
            cursor: 'pointer', fontSize: '13px',
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* Sub Navbar */}
      <div style={{
        background: '#f0f7f3',
        borderBottom: '1px solid #b6d9c4',
        padding: '0 24px',
        display: 'flex',
        gap: '4px',
        position: 'fixed',
        top: '56px',
        left: 0,
        right: 0,
        zIndex: 99,
      }}>
        {['Overview', 'Analytics', 'Settings'].map(tab => (
          <div key={tab} style={{
            padding: '10px 16px',
            fontSize: '13px',
            color: tab === 'Overview' ? '#1a6b3a' : '#2d6a4f',
            cursor: 'pointer',
            borderBottom: tab === 'Overview' ? '2px solid #1a6b3a' : '2px solid transparent',
            fontWeight: tab === 'Overview' ? '500' : '400',
          }}>
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
}