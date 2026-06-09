import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import TopBar from '../../components/Topbar';
import Footer from '../../components/Footer';

export default function Register() {
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    // Doctor fields
    specialization: '', license: '', clinic_hours: '', bio: '', doctor_phone: '', doctor_address: '',
    // Patient fields
    age: '', sex: '', bloodGroup: '', phone: '', address: '',
  });

  const navigate = useNavigate();
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

// In Register.jsx - handleSubmit function
const handleSubmit = async () => {
  setError('');
  if (form.password !== form.confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  
  setLoading(true);
  try {
    const payload = { 
      name: form.name,
      email: form.email,
      password: form.password,
      role: role
    };
    
    // Add doctor-specific fields
    if (role === 'doctor') {
      payload.specialization = form.specialization;
      payload.license = form.license;
      payload.clinic_hours = form.clinic_hours || '9:00 AM - 5:00 PM';
      payload.bio = form.bio || '';
      payload.doctor_phone = form.doctor_phone;
      payload.doctor_address = form.doctor_address;
    }
    
    // Add patient-specific fields
    if (role === 'patient') {
      payload.age = form.age;
      payload.sex = form.sex;
      payload.bloodGroup = form.bloodGroup;
      payload.phone = form.phone;
      payload.address = form.address;
    }
    
    await axiosInstance.post('/api/auth/register', payload);
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

  const textareaStyle = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: '6px',
    fontSize: '13px', outline: 'none',
    color: '#1e293b', marginBottom: '12px',
    boxSizing: 'border-box', resize: 'vertical',
    fontFamily: 'Segoe UI, sans-serif',
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

      <TopBar showLogin={true} />

      {/* Main */}
      <div style={{ flex: 1, background: '#f0f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '550px', border: '0.5px solid #e2e8f0' }}>

          <div style={{ background: '#1a6b3a', padding: '20px 32px', color: '#fff', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>📋</span>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '600' }}>Create Account</div>
              <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '2px' }}>Register as Admin, Doctor or Patient</div>
            </div>
          </div>

          <div style={{ padding: '24px 32px', maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <div style={{ background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>
                ⚠ {error}
              </div>
            )}
            {success && (
              <div style={{ background: '#e8f5ee', color: '#1a6b3a', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>
                ✓ {success}
              </div>
            )}

            <label style={labelStyle}>Select your role *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
              {roles.map(r => (
                <div key={r.key} onClick={() => {
                  setRole(r.key);
                  setError('');
                }} style={{
                  padding: '10px', border: `1.5px solid ${role === r.key ? '#1a6b3a' : '#e2e8f0'}`,
                  borderRadius: '6px', textAlign: 'center', cursor: 'pointer',
                  background: role === r.key ? '#f0f7f3' : '#fff',
                  color: role === r.key ? '#1a6b3a' : '#374151',
                  fontSize: '13px', fontWeight: role === r.key ? '500' : '400',
                }}>
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

            {/* Doctor Fields - Updated with all new columns */}
            {role === 'doctor' && (
              <div style={{ background: '#f0f7f3', borderRadius: '6px', padding: '14px', marginBottom: '12px', border: '1px solid #b6d9c4' }}>
                <div style={{ fontSize: '11px', color: '#1a6b3a', fontWeight: '600', marginBottom: '10px' }}>🩺 Doctor Information</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Specialization *</label>
                    <select 
                      name="specialization" 
                      value={form.specialization} 
                      onChange={handle} 
                      required
                      style={inputStyle}
                    >
                      <option value="">Select...</option>
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>Gynecology</option>
                      <option>Pediatrics</option>
                      <option>Dermatology</option>
                      <option>Orthopedics</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>License Number *</label>
                    <input 
                      name="license" 
                      value={form.license} 
                      onChange={handle} 
                      required
                      placeholder="LIC-2024-XXXX" 
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <input 
                      name="doctor_phone" 
                      value={form.doctor_phone} 
                      onChange={handle} 
                      required
                      placeholder="+880XXXXXXXXXX" 
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Clinic Hours</label>
                    <input 
                      name="clinic_hours" 
                      value={form.clinic_hours} 
                      onChange={handle} 
                      placeholder="9:00 AM - 5:00 PM" 
                      style={inputStyle} 
                    />
                  </div>
                </div>
                
                <div>
                  <label style={labelStyle}>Clinic Address *</label>
                  <input 
                    name="doctor_address" 
                    value={form.doctor_address} 
                    onChange={handle} 
                    required
                    placeholder="Clinic/Hospital address" 
                    style={inputStyle} 
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>Bio / About</label>
                  <textarea 
                    name="bio" 
                    value={form.bio} 
                    onChange={handle} 
                    placeholder="Brief introduction, qualifications, experience..."
                    rows="3"
                    style={textareaStyle}
                  />
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
                  <div>
                    <label style={labelStyle}>Blood Group *</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handle} style={inputStyle}>
                      <option value="">Select...</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                      <option>O+</option>
                      <option>O-</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <input name="phone" type="tel" value={form.phone} onChange={handle} placeholder="+880XXXXXXXXXX" style={inputStyle} />
                  </div>
                </div>
                <label style={labelStyle}>Address *</label>
                <input name="address" value={form.address} onChange={handle} placeholder="Full address" style={{ ...inputStyle, marginBottom: 0 }} />
              </div>
            )}

            {/* Admin note */}
            {role === 'admin' && (
              <div style={{ background: '#fef9e7', borderRadius: '6px', padding: '14px', marginBottom: '12px', border: '1px solid #fdebd0' }}>
                <div style={{ fontSize: '11px', color: '#b7770d', fontWeight: '600', marginBottom: '10px' }}>🛡️ Admin Information</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Admin accounts have full system access. Please ensure you have authorization before creating an admin account.
                </div>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', padding: '12px',
              background: loading ? '#6dab89' : '#1a6b3a',
              color: '#fff', border: 'none', borderRadius: '6px',
              fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500', marginTop: '4px',
            }}>
              {loading ? 'Creating account...' : '✔ Create Account'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px', color: '#64748b' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1a6b3a', fontWeight: '500', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}