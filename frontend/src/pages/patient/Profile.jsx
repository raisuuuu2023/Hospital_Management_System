import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    blood_group: '', phone: '', address: '', dob: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/api/patients/profile');
      const p = res.data.profile || res.data;
      setProfile(p);
      setForm({
        blood_group: p.blood_group || '',
        phone: p.phone || '',
        address: p.address || '',
        dob: p.dob ? p.dob.split('T')[0] : '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await axiosInstance.put('/api/patients/profile', form);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: '6px',
    fontSize: '13px', outline: 'none',
    color: '#1e293b', boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <Navbar active="My Profile" />

      <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132 }}>

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a6b3a', margin: 0 }}>My Profile</h2>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>View and update your personal information</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>

            {/* Left - Avatar Card */}
            <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', padding: 24, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1a6b3a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, margin: '0 auto 16px' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{profile?.email}</div>
              <div style={{ marginTop: 12, display: 'inline-block', padding: '4px 14px', background: '#e8f5ee', color: '#1a6b3a', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                Patient
              </div>

              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '0.5px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Blood Group</span>
                  <span style={{ fontWeight: 700, color: '#e74c3c' }}>{profile?.blood_group || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '0.5px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Phone</span>
                  <span style={{ fontWeight: 600 }}>{profile?.phone || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0' }}>
                  <span style={{ color: '#64748b' }}>Address</span>
                  <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: 120 }}>{profile?.address || '—'}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/patient/book-appointment')}
                style={{ width: '100%', marginTop: 20, padding: '10px', background: '#1a6b3a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
              >
                📅 Book Appointment
              </button>
            </div>

            {/* Right - Edit Form */}
            <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a' }}>Personal Information</div>
                {!editing && (
                  <button onClick={() => setEditing(true)} style={{ padding: '6px 14px', background: '#f0f7f3', border: '1px solid #b6d9c4', color: '#1a6b3a', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                    ✏️ Edit
                  </button>
                )}
              </div>

              {success && <div style={{ background: '#e8f5ee', color: '#1a6b3a', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 14 }}>{success}</div>}
              {error && <div style={{ background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 14 }}>{error}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
                  <input value={user?.name || ''} disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
                  <input value={profile?.email || ''} disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>Blood Group</label>
                  {editing ? (
                    <select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })} style={inputStyle}>
                      <option value="">Select...</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                    </select>
                  ) : (
                    <input value={profile?.blood_group || '—'} disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} />
                  )}
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>Phone</label>
                  {editing ? (
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+880XXXXXXXXXX" style={inputStyle} />
                  ) : (
                    <input value={profile?.phone || '—'} disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} />
                  )}
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>Date of Birth</label>
                  {editing ? (
                    <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} style={inputStyle} />
                  ) : (
                    <input value={profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : '—'} disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} />
                  )}
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>Address</label>
                  {editing ? (
                    <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your address" style={inputStyle} />
                  ) : (
                    <input value={profile?.address || '—'} disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} />
                  )}
                </div>
              </div>

              {editing && (
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px', background: saving ? '#6dab89' : '#1a6b3a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => { setEditing(false); setError(''); setSuccess(''); }} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}