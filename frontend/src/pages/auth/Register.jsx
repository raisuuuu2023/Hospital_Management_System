import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

export default function Register() {
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    // doctor
    specialization: '', license: '',
    // patient
    age: '', sex: '', address: '',
  });

  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/register', { ...form, role });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: '6px',
    fontSize: '13px', outline: 'none',
    color: '#1e293b', marginBottom: '12px',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '11px', color: '#64748b',
    display: 'block', marginBottom: '3px',
  };

  const roles = [
    { key: 'admin', label: 'Admin', icon: '🛡️' },
    { key: 'doctor', label: 'Doctor', icon: '🩺' },
    { key: 'patient', label: 'Patient', icon: '👤' },
  ];

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
        <Link to="/login" style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '5px 14px', borderRadius: '4px', fontSize: '12px', color: '#fff', textDecoration: 'none' }}>
          👤 Login Area
        </Link>
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
        <span>Welcome to Hospital Management System — Register to get started with your account.</span>
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: '#f0f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '500px', border: '0.5px solid #e2e8f0' }}>

          {/* Card Header */}
          <div style={{ background: '#1a6b3a', padding: '20px 32px', color: '#fff', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>📋</span>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '600' }}>Create Account</div>
              <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '2px' }}>Register as Admin, Doctor or Patient</div>
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: '24px 32px' }}>

            {error && (
              <div style={{ background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: '#e8f5ee', color: '#1a6b3a', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>
                {success}
              </div>
            )}

            {/* Role Selector */}
            <label style={labelStyle}>Select your role *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
              {roles.map(r => (
                <div
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  style={{
                    padding: '10px', border: `1.5px solid ${role === r.key ? '#1a6b3a' : '#e2e8f0'}`,
                    borderRadius: '6px', textAlign: 'center', cursor: 'pointer',
                    background: role === r.key ? '#f0f7f3' : '#fff',
                    color: role === r.key ? '#1a6b3a' : '#374151',
                    fontSize: '13px', fontWeight: role === r.key ? '500' : '400',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{r.icon}</div>
                  {r.label}
                </div>
              ))}
            </div>

            {/* Common Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Full name *</label>
                <input name="name" value={form.name} onChange={handle} placeholder="Full name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email address *</label>
                <input name="email" type="email" value={form.email} onChange={handle} placeholder="email@example.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Password *</label>
                <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirm password *</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handle} placeholder="••••••••" style={inputStyle} />
              </div>
            </div>

            {/* Doctor Fields */}
            {role === 'doctor' && (
              <div style={{ background: '#f0f7f3', borderRadius: '6px', padding: '14px', marginBottom: '12px', border: '1px solid #b6d9c4' }}>
                <div style={{ fontSize: '11px', color: '#1a6b3a', fontWeight: '600', marginBottom: '10px' }}>🩺 Doctor Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Specialization *</label>
                    <select name="specialization" value={form.specialization} onChange={handle} style={inputStyle}>
                      <option value="">Select...</option>
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>Orthopedic</option>
                      <option>Pediatrics</option>
                      <option>Dermatology</option>
                      <option>Gynecology</option>
                      <option>General Medicine</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>License number *</label>
                    <input name="license" value={form.license} onChange={handle} placeholder="LIC-2024-XXXX" style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* Patient Fields */}
            {role === 'patient' && (
              <div style={{ background: '#f0f7f3', borderRadius: '6px', padding: '14px', marginBottom: '12px', border: '1px solid #b6d9c4' }}>
                <div style={{ fontSize: '11px', color: '#1a6b3a', fontWeight: '600', marginBottom: '10px' }}>👤 Patient Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Age *</label>
                    <input name="age" type="number" value={form.age} onChange={handle} placeholder="Age" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Sex *</label>
                    <select name="sex" value={form.sex} onChange={handle} style={inputStyle}>
                      <option value="">Select...</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <label style={labelStyle}>Address *</label>
                <input name="address" value={form.address} onChange={handle} placeholder="Full address" style={{ ...inputStyle, marginBottom: 0 }} />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? '#6dab89' : '#1a6b3a',
                color: '#fff', border: 'none', borderRadius: '6px',
                fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500', marginTop: '4px',
              }}
            >
              {loading ? 'Creating account...' : '✔ Create Account'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px', color: '#64748b' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1a6b3a', fontWeight: '500', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1a6b3a', color: '#fff', textAlign: 'center', padding: '14px', fontSize: '12px' }}>
        Copyright © 2024 — 2026 <strong>Hospital Management System</strong>. All Rights Reserved.
      </div>
    </div>
  );
}