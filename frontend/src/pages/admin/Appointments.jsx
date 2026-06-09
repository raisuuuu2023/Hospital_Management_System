import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
        const res = await axiosInstance.get('/api/doctors/admin/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = appointments.filter(a => {
    const matchSearch =
      a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const statusStyle = (status) => ({
    padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
    background:
      status === 'confirmed' ? '#e8f5ee' :
      status === 'pending' ? '#fef9e7' :
      status === 'done' ? '#e8f0fe' : '#fdecea',
    color:
      status === 'confirmed' ? '#1a6b3a' :
      status === 'pending' ? '#b7770d' :
      status === 'done' ? '#2980b9' : '#c0392b',
  });

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <Navbar active="Appointments" />

      <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: '132px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#1a6b3a' }}>Appointments</h2>
            <p style={{ fontSize: '12px', color: '#64748b' }}>View all appointments</p>
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'pending', 'confirmed', 'done'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12px',
                  cursor: 'pointer', border: '1px solid #e2e8f0',
                  background: filter === f ? '#1a6b3a' : '#fff',
                  color: filter === f ? '#fff' : '#64748b',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '8px', border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              placeholder="🔍 Search by patient or doctor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '260px' }}
            />
            <span style={{ fontSize: '12px', color: '#64748b' }}>{filtered.length} appointments found</span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No appointments found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Patient', 'Doctor', 'Specialty', 'Date', 'Time', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: '400', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={i} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e8f5ee', color: '#1a6b3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '500' }}>
                          {a.patient_name?.charAt(0).toUpperCase()}
                        </div>
                        {a.patient_name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{a.doctor_name}</td>
                    <td style={{ padding: '12px 16px' }}>{a.specialty || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{a.date}</td>
                    <td style={{ padding: '12px 16px' }}>{a.time}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={statusStyle(a.status)}>{a.status}</span>
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