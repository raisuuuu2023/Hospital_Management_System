import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function DoctorProfile() {
 const [profile, setProfile] = useState(null);
 const [loading, setLoading] = useState(true);
 const [editing, setEditing] = useState(false);
 const [saving, setSaving] = useState(false);
 const [success, setSuccess] = useState('');
 const [error, setError] = useState('');
 const { user } = useAuth();
 const navigate = useNavigate();

 const [formData, setFormData] = useState({
 name: '',
 email: '',
 phone: '',
 specialty: '',
 fee: '',
 available_days: '',
 clinic_hours: '',
 license: '',
 bio: '',
 address: ''
 });

 useEffect(() => {
 fetchProfile();
 }, []);

 const fetchProfile = async () => {
 try {
 setLoading(true);
 const res = await axiosInstance.get('/api/doctors/profile');
 const data = res.data.profile || res.data;
 setProfile(data);
 setFormData({
 name: data.name || user?.name || '',
 email: data.email || user?.email || '',
 phone: data.phone || '',
 specialty: data.specialty || '',
 fee: data.fee || '',
 available_days: data.available_days || '',
 clinic_hours: data.clinic_hours || '9:00 AM - 5:00 PM',
 license: data.license || '',
 bio: data.bio || '',
 address: data.address || ''
 });
 } catch (err) {
 console.error('Error fetching profile:', err);
 setError('Failed to load profile');
 } finally {
 setLoading(false);
 }
 };

 const handleUpdate = async () => {
 setSaving(true);
 setError('');
 setSuccess('');
 
 try {
 await axiosInstance.put('/api/doctors/profile', {
 name: formData.name,
 phone: formData.phone,
 specialty: formData.specialty,
 fee: formData.fee,
 available_days: formData.available_days,
 clinic_hours: formData.clinic_hours,
 license: formData.license,
 bio: formData.bio,
 address: formData.address
 });
 
 setSuccess('Profile updated successfully!');
 setEditing(false);
 fetchProfile();
 
 setTimeout(() => setSuccess(''), 3000);
 } catch (err) {
 console.error('Error updating profile:', err);
 setError(err.response?.data?.error || 'Failed to update profile');
 setTimeout(() => setError(''), 3000);
 } finally {
 setSaving(false);
 }
 };

 const inputStyle = {
 width: '100%',
 padding: '10px 12px',
 border: '1.5px solid #e2e8f0',
 borderRadius: '6px',
 fontSize: '13px',
 outline: 'none',
 color: '#1e293b',
 boxSizing: 'border-box',
 };

 const textareaStyle = {
 width: '100%',
 padding: '10px 12px',
 border: '1.5px solid #e2e8f0',
 borderRadius: '6px',
 fontSize: '13px',
 outline: 'none',
 color: '#1e293b',
 boxSizing: 'border-box',
 resize: 'vertical',
 fontFamily: 'Segoe UI, sans-serif',
 };

 const labelStyle = {
 fontSize: '12px',
 color: '#64748b',
 fontWeight: 600,
 display: 'block',
 marginBottom: '6px',
 };

 if (loading) {
 return (
 <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
 <Navbar active="My Profile" />
 <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132 }}>
 <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
 Loading profile...
 </div>
 </div>
 <Footer />
 </div>
 );
 }

 return (
 <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
 <Navbar active="My Profile" />
 
 <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132 }}>
 
 <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a6b3a', margin: 0 }}>Doctor Profile</h2>
 <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Manage your professional information</p>
 </div>
 {!editing && (
 <button
 onClick={() => setEditing(true)}
 style={{
 padding: '8px 20px',
 background: '#1a6b3a',
 color: '#fff',
 border: 'none',
 borderRadius: '6px',
 fontSize: '13px',
 cursor: 'pointer',
 fontWeight: 600,
 }}
 >
 ✏️ Edit Profile
 </button>
 )}
 </div>

 {success && (
 <div style={{ background: '#e8f5ee', color: '#1a6b3a', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', marginBottom: 20 }}>
 ✓ {success}
 </div>
 )}
 
 {error && (
 <div style={{ background: '#fdecea', color: '#c0392b', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', marginBottom: 20 }}>
 ⚠ {error}
 </div>
 )}

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
 
 {/* Left Column - Info Card */}
 <div>
 <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
 <div style={{ background: 'linear-gradient(135deg, #1a6b3a 0%, #145c30 100%)', padding: '24px', textAlign: 'center', color: '#fff' }}>
 <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#fff', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700, color: '#1a6b3a' }}>
 {(formData.name || 'D')[0].toUpperCase()}
 </div>
 <h3 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>Dr. {formData.name}</h3>
 <p style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>{formData.specialty || 'General Physician'}</p>
 </div>
 
 <div style={{ padding: 20 }}>
 <div style={{ marginBottom: 16 }}>
 <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>📧 Email</div>
 <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{formData.email}</div>
 </div>
 
 <div style={{ marginBottom: 16 }}>
 <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>📞 Phone</div>
 <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{formData.phone || 'Not provided'}</div>
 </div>
 
 <div style={{ marginBottom: 16 }}>
 <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>💰 Consultation Fee</div>
 <div style={{ fontSize: 18, fontWeight: 700, color: '#1a6b3a' }}>৳{formData.fee || 'Not set'}</div>
 </div>
 
 <div style={{ marginBottom: 16 }}>
 <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>📋 License Number</div>
 <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{formData.license || 'Not provided'}</div>
 </div>
 
 <div style={{ marginBottom: 16 }}>
 <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>⏰ Clinic Hours</div>
 <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{formData.clinic_hours}</div>
 </div>

 <div style={{ marginBottom: 16 }}>
 <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>📅 Available Days</div>
 <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{formData.available_days || 'Not set'}</div>
 </div>
 </div>
 </div>
 </div>

 {/* Right Column - Edit Form */}
 <div>
 <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid #e2e8f0', padding: 24 }}>
 
 <div style={{ marginBottom: 24 }}>
 <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #e8f5ee' }}>
 Basic Information
 </h3>
 
 <div style={{ marginBottom: 16 }}>
 <label style={labelStyle}>Full Name *</label>
 <input
 type="text"
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 disabled={!editing}
 style={{ ...inputStyle, background: editing ? '#fff' : '#f8fafc' }}
 />
 </div>
 
 <div style={{ marginBottom: 16 }}>
 <label style={labelStyle}>Specialty *</label>
 <select
 value={formData.specialty}
 onChange={(e) => setFormData({...formData, specialty: e.target.value})}
 disabled={!editing}
 style={{ ...inputStyle, background: editing ? '#fff' : '#f8fafc' }}
 >
 <option value="">Select Specialty</option>
 <option value="Cardiology">Cardiology</option>
 <option value="Neurology">Neurology</option>
 <option value="Pediatrics">Pediatrics</option>
 <option value="Dermatology">Dermatology</option>
 <option value="Orthopedics">Orthopedics</option>
 <option value="Gynecology">Gynecology</option>
 <option value="Ophthalmology">Ophthalmology</option>
 <option value="Psychiatry">Psychiatry</option>
 <option value="General Medicine">General Medicine</option>
 </select>
 </div>
 
 <div style={{ marginBottom: 16 }}>
 <label style={labelStyle}>Phone Number</label>
 <input
 type="tel"
 value={formData.phone}
 onChange={(e) => setFormData({...formData, phone: e.target.value})}
 disabled={!editing}
 placeholder="Enter your phone number"
 style={{ ...inputStyle, background: editing ? '#fff' : '#f8fafc' }}
 />
 </div>
 </div>

 <div style={{ marginBottom: 24 }}>
 <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #e8f5ee' }}>
 Professional Information
 </h3>
 
 <div style={{ marginBottom: 16 }}>
 <label style={labelStyle}>Consultation Fee (BDT) *</label>
 <input
 type="number"
 value={formData.fee}
 onChange={(e) => setFormData({...formData, fee: e.target.value})}
 disabled={!editing}
 placeholder="e.g., 800"
 style={{ ...inputStyle, background: editing ? '#fff' : '#f8fafc' }}
 />
 </div>
 
 
 
 <div style={{ marginBottom: 16 }}>
 <label style={labelStyle}>Clinic Hours</label>
 <input
 type="text"
 value={formData.clinic_hours}
 onChange={(e) => setFormData({...formData, clinic_hours: e.target.value})}
 disabled={!editing}
 placeholder="e.g., 9:00 AM - 5:00 PM"
 style={{ ...inputStyle, background: editing ? '#fff' : '#f8fafc' }}
 />
 </div>
 </div>

 <div style={{ marginBottom: 24 }}>
 <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #e8f5ee' }}>
 Additional Information
 </h3>
 
 <div style={{ marginBottom: 16 }}>
 <label style={labelStyle}>Clinic Address</label>
 <textarea
 value={formData.address}
 onChange={(e) => setFormData({...formData, address: e.target.value})}
 disabled={!editing}
 rows="3"
 placeholder="Enter your clinic or hospital address"
 style={{ ...textareaStyle, background: editing ? '#fff' : '#f8fafc' }}
 />
 </div>
 
 <div style={{ marginBottom: 16 }}>
 <label style={labelStyle}>Bio / About</label>
 <textarea
 value={formData.bio}
 onChange={(e) => setFormData({...formData, bio: e.target.value})}
 disabled={!editing}
 rows="4"
 placeholder="Brief introduction about yourself, qualifications, experience..."
 style={{ ...textareaStyle, background: editing ? '#fff' : '#f8fafc' }}
 />
 </div>
 </div>

 {editing && (
 <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
 <button
 onClick={handleUpdate}
 disabled={saving}
 style={{
 flex: 1,
 padding: '12px',
 background: saving ? '#6dab89' : '#1a6b3a',
 color: '#fff',
 border: 'none',
 borderRadius: '6px',
 fontSize: '13px',
 cursor: saving ? 'not-allowed' : 'pointer',
 fontWeight: 600,
 }}
 >
 {saving ? 'Saving...' : '💾 Save Changes'}
 </button>
 <button
 onClick={() => {
 setEditing(false);
 fetchProfile();
 }}
 style={{
 flex: 1,
 padding: '12px',
 background: '#f1f5f9',
 color: '#64748b',
 border: 'none',
 borderRadius: '6px',
 fontSize: '13px',
 cursor: 'pointer',
 fontWeight: 600,
 }}
 >
 Cancel
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 
 <Footer />
 </div>
 );
}