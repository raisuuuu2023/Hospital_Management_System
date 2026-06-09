import { Link, useNavigate } from 'react-router-dom';

export default function TopBar({ showLogin = false, showRegister = false }) {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Departments', path: '/departments' },
    { label: 'Doctors', path: '/doctors' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <>
      {/* Top Bar */}
      <div style={{ background: '#1a6b3a', color: '#fff', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span style={{ fontSize: '22px' }}>🏥</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>HMS — Hospital Management System</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Providing quality healthcare management</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {showLogin && (
            <Link to="/login" style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '5px 14px', borderRadius: '4px', fontSize: '12px', color: '#fff', textDecoration: 'none' }}>
              👤 Login Area
            </Link>
          )}
          {showRegister && (
            <Link to="/register" style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '5px 14px', borderRadius: '4px', fontSize: '12px', color: '#fff', textDecoration: 'none' }}>
              📋 Register
            </Link>
          )}
        </div>
      </div>

      {/* Navbar */}
      <div style={{ background: '#145c30', height: '44px', display: 'flex', alignItems: 'center', padding: '0 32px', gap: '2px', position: 'fixed', top: '52px', left: 0, right: 0, zIndex: 99 }}>
        {navItems.map((item, i) => (
          <div 
            key={item.label} 
            onClick={() => navigate(item.path)}
            style={{
              color: '#fff', 
              padding: '8px 16px', 
              fontSize: '13px',
              cursor: 'pointer', 
              borderRadius: '4px',
              transition: 'background 0.2s',
              background: window.location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
              opacity: window.location.pathname === item.path ? 1 : 0.85,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              if (window.location.pathname !== item.path) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* News Bar */}
      <div style={{ background: '#e8f5ee', borderBottom: '1px solid #b6d9c4', padding: '8px 32px', fontSize: '12px', color: '#1a6b3a', display: 'flex', gap: '16px', alignItems: 'center', position: 'fixed', top: '96px', left: 0, right: 0, zIndex: 98 }}>
        <span style={{ background: '#1a6b3a', color: '#fff', padding: '2px 10px', borderRadius: '3px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>NEWS</span>
        <span>Welcome to Hospital Management System</span>
      </div>
    </>
  );
}