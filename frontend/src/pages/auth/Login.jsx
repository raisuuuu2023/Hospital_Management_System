import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.post('/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate(`/${res.data.user.role}/dashboard`);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '6px',
    fontSize: '13px', outline: 'none',
    color: '#1e293b', marginBottom: '14px',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top Bar */}
      <div style={{ background: '#1a6b3a', color: '#fff', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🏥</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>HMS — Hospital Management System</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Providing quality healthcare management</div>
          </div>
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '5px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
          👤 Login Area
        </div>
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
        <span>Welcome to our Hospital</span>
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: '#f0f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '420px', border: '0.5px solid #e2e8f0' }}>

          {/* Card Header */}
          <div style={{ background: '#1a6b3a', padding: '24px 32px', color: '#fff', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '40px' }}>🩺</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>HMS Login Area</div>
              <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '2px' }}>Sign in to access your account</div>
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: '28px 32px' }}>
            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
              <Link to="/register" style={{ fontSize: '12px', color: '#1a6b3a', textDecoration: 'none' }}>
                👤 If you haven't registered
              </Link>
            </div>

            {error && (
              <div style={{ background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Email address *"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password *"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>
                <input type="checkbox" onChange={e => setShowPassword(e.target.checked)} />
                Show password
              </label>
              <span style={{ fontSize: '12px', color: '#1a6b3a', cursor: 'pointer' }}>
                🔒 Forgot password?
              </span>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? '#6dab89' : '#1a6b3a',
                color: '#fff', border: 'none', borderRadius: '6px',
                fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
              }}
            >
              {loading ? 'Signing in...' : '→ Login Now'}
            </button>

            
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1a6b3a', color: '#fff', textAlign: 'center', padding: '14px', fontSize: '12px', opacity: 0.9 }}>
        Copyright © 2024 — 2026 <strong>Hospital Management System</strong>. All Rights Reserved.
      </div>
    </div>
  );
}