import { Link } from 'react-router-dom';

export default function TopBar({ showLogin = false, showRegister = false }) {
  return (
    <>
      {/* Top Bar */}
      <div style={{ background: '#1a6b3a', color: '#fff', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🏥</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>HMS — Hospital Management System</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Providing quality healthcare management</div>
          </div>
        </div>
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

      {/* Navbar */}
      <div style={{ background: '#145c30', height: '44px', display: 'flex', alignItems: 'center', padding: '0 32px', gap: '2px' }}>
        {['Home', 'Departments', 'Doctors', 'Patients', 'Appointments', 'About Us', 'Contact'].map((item, i) => (
          <div key={item} style={{
            color: '#fff', padding: '8px 16px', fontSize: '13px',
            cursor: 'pointer', borderRadius: '4px',
            background: i === 0 ? 'rgba(255,255,255,0.15)' : 'transparent',
            opacity: i === 0 ? 1 : 0.85,
          }}>
            {item}
          </div>
        ))}
      </div>

      {/* News Bar */}
      <div style={{ background: '#e8f5ee', borderBottom: '1px solid #b6d9c4', padding: '8px 32px', fontSize: '12px', color: '#1a6b3a', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ background: '#1a6b3a', color: '#fff', padding: '2px 10px', borderRadius: '3px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>NEWS</span>
        <span>Welcome to Hospital Management System</span>
      </div>
    </>
  );
}