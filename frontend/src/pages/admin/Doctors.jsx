import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axiosInstance.get('/api/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await axiosInstance.delete(`/api/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  const navLinks = ['Dashboard', 'Doctors', 'Patients', 'Appointments'];

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top Bar */}
      <div style={{ background: '#1a6b3a', color: '#fff', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🏥</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>HMS — Hospital Management System</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Providing quality healthcare management</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
          <span>🔔</span>
          <span>{user?.name || 'Admin'}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Navbar */}
      <div style={{ background: '#145c30', height: '44px', display: 'flex', alignItems: 'center', padding: '0 32px', gap: '2px', position: 'fixed', top: '52px', left: 0, right: 0, zIndex: 99 }}>
        {navLinks.map((item) => (
          <div
            key={item}
            onClick={() => navigate(`/admin/${item.toLowerCase()}`)}
            style={{
              color: '#fff', padding: '8px 16px', fontSize: '13px',
              cursor: 'pointer', borderRadius: '4px',
              background: item === 'Doctors' ? 'rgba(255,255,255,0.15)' : 'transparent',
              opacity: item === 'Doctors' ? 1 : 0.85,
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* News Bar */}
      <div style={{ background: '#e8f5ee', borderBottom: '1px solid #b6d9c4', padding: '8px 32px', fontSize: '12px', color: '#1a6b3a', display: 'flex', gap: '16px', alignItems: 'center', position: 'fixed', top: '96px', left: 0, right: 0, zIndex: 98 }}>
        <span style={{ background: '#1a6b3a', color: '#fff', padding: '2px 10px', borderRadius: '3px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>NEWS</span>
        <span>Welcome to Hospital Management System — Admin Panel</span>
      </div>

      {/* Main */}
      <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: '132px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#1a6b3a' }}>Doctors</h2>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Manage all registered doctors</p>
          </div>
          <button
            onClick={() => navigate('/register')}
            style={{ padding: '8px 16px', background: '#1a6b3a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
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
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '260px' }}
            />
            <span style={{ fontSize: '12px', color: '#64748b' }}>{filtered.length} doctors found</span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No doctors found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Doctor', 'Specialty', 'License', 'Available Days', 'Fee', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: '400', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, i) => (
                  <tr key={i} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e8f5ee', color: '#1a6b3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '500' }}>
                          {doc.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{doc.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{doc.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{doc.specialty || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{doc.license || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{doc.available_days || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{doc.fee ? `৳${doc.fee}` : '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => navigate(`/admin/doctors/${doc.id}`)}
                        style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', border: '1px solid #2980b9', color: '#2980b9', background: '#fff', marginRight: '4px' }}
                      >View</button>
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

      {/* Footer */}
      <div style={{ background: '#1a6b3a', color: '#fff', textAlign: 'center', padding: '14px', fontSize: '12px' }}>
        Copyright © 2024 — 2026 <strong>Hospital Management System</strong>. All Rights Reserved.
      </div>
    </div>
  );
}