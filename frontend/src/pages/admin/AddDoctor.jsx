import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AddDoctor() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    specialization: 'General Medicine', license: '', fee: '', available_days: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axiosInstance.post('/api/auth/register', { ...formData, role: 'doctor' });
      setMessage('✅ Doctor registered successfully! Redirecting back...');
      setTimeout(() => navigate('/admin/doctors'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Error registering doctor.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 6,
    border: '1px solid #cbd5e1', fontSize: 13, marginTop: 4,
    marginBottom: 14, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <Navbar active="Doctors" />

      <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: '132px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', padding: '28px', width: '100%', maxWidth: 550 }}>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a6b3a', margin: '0 0 4px 0' }}>Add New Doctor</h2>
          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 20px 0' }}>Create an account and clinical profile for a new doctor.</p>

          {message && (
            <div style={{ padding: '10px 12px', borderRadius: 6, fontSize: 13, marginBottom: 16, background: message.startsWith('✅') ? '#e8f5ee' : '#fdecea', color: message.startsWith('✅') ? '#1a6b3a' : '#c0392b', fontWeight: 500 }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Full Name</label>
                <input type="text" name="name" style={inputStyle} placeholder="Dr. John Smith" value={formData.name} onChange={handleChange} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Email Address</label>
                <input type="email" name="email" style={inputStyle} placeholder="doctor@hms.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Password</label>
                <input type="password" name="password" style={inputStyle} placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Specialization</label>
                <select name="specialization" style={inputStyle} value={formData.specialization} onChange={handleChange}>
                  {['Cardiology', 'Pediatrics', 'Dermatology', 'General Medicine', 'Neurology', 'Orthopedic', 'Gynecology'].map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>License Number</label>
                <input type="text" name="license" style={inputStyle} placeholder="BMDC-XXXXX" value={formData.license} onChange={handleChange} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Consultation Fee (৳)</label>
                <input type="number" name="fee" style={inputStyle} placeholder="700" value={formData.fee} onChange={handleChange} required />
              </div>
            </div>

            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Available Days</label>
            <input type="text" name="available_days" style={inputStyle} placeholder="Sat, Mon, Wed" value={formData.available_days} onChange={handleChange} required />

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#1a6b3a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 6 }}>
              {loading ? 'Creating account...' : 'Register Doctor'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}