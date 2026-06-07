import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import TopBar from '../../components/Topbar';
import Footer from '../../components/Footer';

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
      console.error('Login error:', err);
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

      <TopBar showRegister={true} />

      <div style={{ flex: 1, background: '#f0f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '420px', border: '0.5px solid #e2e8f0' }}>

          <div style={{ background: '#1a6b3a', padding: '24px 32px', color: '#fff', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '40px' }}>🩺</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>HMS Login Area</div>
              <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '2px' }}>Sign in to access your account</div>
            </div>
          </div>

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

      <Footer />
    </div>
  );
}