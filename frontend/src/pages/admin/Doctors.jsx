import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editDoctor, setEditDoctor] = useState(null);
  const [editForm, setEditForm] = useState({ specialty: '', fee: '', available_days: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/doctors/all');
      const docsArray = Array.isArray(res.data) ? res.data : res.data.doctors || [];
      setDoctors(docsArray);
    } catch (err) {
      console.error('Error loading doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`);
      fetchDoctors();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  const handleEdit = (doc) => {
    setEditDoctor(doc);
    setEditForm({
      specialty: doc.specialty || '',
      fee: doc.fee || '',
      available_days: doc.available_days || '',
    });
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axiosInstance.put(`/api/admin/doctors/${editDoctor.doctor_id}`, editForm);
      setEditDoctor(null);
      fetchDoctors();
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.error || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    (d.specialty)?.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
    borderRadius: '6px', fontSize: '13px', outline: 'none',
    boxSizing: 'border-box', marginBottom: '12px',
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <Navbar active="Doctors" />

      {/* Edit Modal */}
      {editDoctor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a6b3a', marginBottom: '4px' }}>Update Doctor</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Dr. {editDoctor.name}</p>

            <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>Specialization</label>
            <select
              value={editForm.specialty}
              onChange={e => setEditForm({ ...editForm, specialty: e.target.value })}
              style={inputStyle}
            >
              {['Cardiology', 'Neurology', 'Orthopedic', 'Pediatrics', 'Dermatology', 'Gynecology', 'General Medicine'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>Consultation Fee (৳)</label>
            <input
              type="number"
              value={editForm.fee}
              onChange={e => setEditForm({ ...editForm, fee: e.target.value })}
              placeholder="700"
              style={inputStyle}
            />

            <label style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>Available Days</label>
            <input
              type="text"
              value={editForm.available_days}
              onChange={e => setEditForm({ ...editForm, available_days: e.target.value })}
              placeholder="Sat, Mon, Wed"
              style={inputStyle}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={handleUpdate}
                disabled={saving}
                style={{ flex: 1, padding: '10px', background: saving ? '#6dab89' : '#1a6b3a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditDoctor(null)}
                style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: '132px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a6b3a', margin: 0 }}>Doctors Registry</h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>Manage all registered clinical practitioners</p>
          </div>
          <button
            onClick={() => navigate('/admin/add-doctor')}
            style={{ padding: '8px 16px', background: '#1a6b3a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Add Doctor
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: '8px', border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              placeholder="🔍 Search by name or specialty..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '280px' }}
            />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{filtered.length} doctors found</span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Loading doctors...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No doctors found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Doctor', 'Specialty', 'License', 'Available Days', 'Fee', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, i) => (
                  <tr key={doc.doctor_id || i} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e8f5ee', color: '#1a6b3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                          {(doc.name || 'D')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>Dr. {doc.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{doc.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{doc.specialty || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{doc.license || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{doc.available_days || '—'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a6b3a' }}>{doc.fee ? `৳${doc.fee}` : '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleEdit(doc)}
                        style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', border: '1px solid #e67e22', color: '#e67e22', background: '#fff', marginRight: '6px' }}
                      >Update</button>
                      <button
                        onClick={() => handleDelete(doc.user_id)}
                        style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', border: '1px solid #e74c3c', color: '#e74c3c', background: '#fff' }}
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}