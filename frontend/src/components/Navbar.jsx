import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ active, links = [], news }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div>
      <div style={{ background: '#1a6b3a', color: '#fff', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏥</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>HMS — Hospital Management System</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Providing quality healthcare management</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
          <span>🔔</span>
          <span>{user?.name || 'User'}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '5px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ background: '#145c30', height: 44, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 2, position: 'fixed', top: 52, left: 0, right: 0, zIndex: 99 }}>
        {links.map(link => (
          <div key={link.label} onClick={() => navigate(link.path)} style={{ color: '#fff', padding: '8px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 4, background: active === link.label ? 'rgba(255,255,255,0.15)' : 'transparent', opacity: active === link.label ? 1 : 0.85 }}>
            {link.label}
          </div>
        ))}
      </div>

      <div style={{ background: '#e8f5ee', borderBottom: '1px solid #b6d9c4', padding: '8px 32px', fontSize: 12, color: '#1a6b3a', display: 'flex', gap: 16, alignItems: 'center', position: 'fixed', top: 96, left: 0, right: 0, zIndex: 98 }}>
        <span style={{ background: '#1a6b3a', color: '#fff', padding: '2px 10px', borderRadius: 3, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>NEWS</span>
        <span>{news || 'Welcome to Hospital Management System'}</span>
      </div>
    </div>
  );
}