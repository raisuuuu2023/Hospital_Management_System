import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

export default function PatientProfile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    blood_group: '',
    phone: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await axiosInstance.get('/api/patient/profile');
      const profile = res.data.profile || res.data;
      
      if (profile) {
        let formattedDob = '';
        if (profile.dob) {
          formattedDob = new Date(profile.dob).toISOString().split('T');
        }

        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          dob: formattedDob,
          blood_group: profile.blood_group || '',
          phone: profile.phone || '',
          address: profile.address || ''
        });
      }
    } catch (err) {
      console.error("Error fetching profile records:", err);
      setMessage('❌ Failed to synchronize profile records.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      await axiosInstance.put('/api/patient/profile', {
        dob: formData.dob || null,
        blood_group: formData.blood_group,
        phone: formData.phone,
        address: formData.address
      });
      
      setMessage('✅ Success! Health profile parameters updated securely.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Profile alteration validation rejected.');
    } finally {
      setSaving(false);
    }
  };

  const C = {
    topbar: { background: '#1a6b3a', color: '#fff', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' },
    navbar: { background: '#145c30', height: 48, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 8, position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99 },
    main: { background: '#f8fafc', flex: 1, padding: '40px', marginTop: 128, minHeight: 'calc(100vh - 128px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', boxSizing: 'border-box' },
    card: { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '36px', width: '100%', maxWidth: '650px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', boxSizing: 'border-box' },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 },
    input: { width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, marginBottom: 20, outline: 'none', boxSizing: 'border-box', color: '#1e293b' }
  };

  return (
    <div style={{ fontFamily: '"Inter", "Segoe UI", sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      
      {/* Top Header */}
      <div style={C.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg style={{ width: 28, height: 28, fill: '#fff' }} viewBox="0 0 24 24"><path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/></svg>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>HMS Portal</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Logout</button>
        </div>
      </div>

      {/* Navbar Mapping */}
      <div style={C.navbar}>
        {[
          { label: 'Dashboard', path: '/patient/dashboard' },
          { label: 'Book Appointment', path: '/patient/book-appointment' },
          { label: 'My Profile', path: '/patient/profile' }
        ].map(link => {
          const isActive = window.location.pathname === link.path;
          return (
            <div key={link.label} onClick={() => navigate(link.path)} style={{ color: '#fff', padding: '8px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 6, fontWeight: isActive ? 600 : 500, background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent', opacity: isActive ? 1 : 0.75, transition: 'all 0.2s' }}>
              {link.label}
            </div>
          );
        })}
      </div>

      {/* Work Area Layout */}
      <div style={C.main}>
        <div style={C.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Personal Health Registry</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0 0' }}>Manage personal demographics and core physiological grouping records.</p>
            </div>
          </div>

          {message && (
            <div style={{ padding: '14px 16px', borderRadius: 8, fontSize: 14, marginBottom: 24, background: message.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: message.startsWith('✅') ? '#166534' : '#991b1b', border: `1px solid ${message.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`, fontWeight: 500 }}>
              {message}
            </div>
          )}

          {loading ? (
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', padding: '40px 0' }}>Synchronizing medical profile entries...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ ...C.label, color: '#94a3b8' }}>Account Legal Name (Read-only)</label>
                  <input type="text" style={{ ...C.input, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'not-allowed' }} value={formData.name} disabled />
                </div>
                <div>
                  <label style={{ ...C.label, color: '#94a3b8' }}>Registered Email (Read-only)</label>
                  <input type="email" style={{ ...C.input, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'not-allowed' }} value={formData.email} disabled />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={C.label}>Date of Birth</label>
                  <input type="date" name="dob" style={C.input} value={formData.dob} onChange={handleChange} />
                </div>
                <div>
                  <label style={C.label}>Blood Group Type</label>
                  <select name="blood_group" style={C.input} value={formData.blood_group} onChange={handleChange}>
                    <option value="">Select Category</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <label style={C.label}>Primary Cellular Contact Number</label>
              <input type="tel" name="phone" placeholder="e.g. 017XXXXXXXX" style={C.input} value={formData.phone} onChange={handleChange} />

              <label style={C.label}>Permanent Residential Address</label>
              <textarea name="address" rows="3" placeholder="Enter standard location mapping specs..." style={{ ...C.input, fontFamily: 'inherit', resize: 'vertical' }} value={formData.address} onChange={handleChange}></textarea>

              <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px', background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 12px rgba(26, 107, 58, 0.2)', transition: 'background-color 0.2s' }}>
                {saving ? 'Saving Records...' : 'Save Profile Configurations'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}