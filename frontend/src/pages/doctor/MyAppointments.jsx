import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const StatusBadge = ({ status }) => {
  const map = {
    confirmed: ['#e8f5ee', '#1a6b3a', 'Confirmed'],
    pending: ['#fef9e7', '#b7770d', 'Pending'],
    done: ['#e8f5ee', '#6a1b9a', 'Done'],
    cancelled: ['#fdecea', '#c0392b', 'Cancelled'],
  };
  const [bg, color, label] = map[status] || ['#f1f5f9', '#64748b', status || '—'];
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color }}>{label}</span>;
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axiosInstance.get('/api/appointments/doctor');
      setAppointments(res.data.appointments || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await axiosInstance.patch(`/api/appointments/${id}/status`, { status: 'confirmed' });
      fetchAppointments();
    } catch (err) { console.error(err); }
  };

  const handleDone = async (id) => {
    try {
      await axiosInstance.patch(`/api/appointments/${id}/status`, { status: 'done' });
      fetchAppointments();
    } catch (err) { console.error(err); }
  };

  const filtered = appointments.filter(a => {
    const matchSearch = a.patient_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const btnStyle = (color) => ({
    padding: '4px 10px', borderRadius: 4, fontSize: 11,
    cursor: 'pointer', border: `1px solid ${color}`,
    color, background: '#fff', fontWeight: 600, marginRight: 4,
  });

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <Navbar active="Appointments" />

      <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a6b3a', margin: 0 }}>My Appointments</h2>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Manage your patient appointments</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'pending', 'confirmed', 'done'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12,
                cursor: 'pointer', border: '1px solid #e2e8f0',
                background: filter === f ? '#1a6b3a' : '#fff',
                color: filter === f ? '#fff' : '#64748b',
                textTransform: 'capitalize', fontWeight: filter === f ? 600 : 400,
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              placeholder="🔍 Search by patient name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, outline: 'none', width: 260 }}
            />
            <span style={{ fontSize: 12, color: '#64748b' }}>{filtered.length} appointments found</span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>No appointments found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Patient', 'Date', 'Time', 'Blood Group', 'Phone', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.appointment_id || i} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8f5ee', color: '#1a6b3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                          {(a.patient_name || 'P')[0]}
                        </div>
                        <span style={{ fontWeight: 500 }}>{a.patient_name || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {a.date ? new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{a.time || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: '#e74c3c', fontWeight: 600 }}>{a.blood_group || '—'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{a.patient_phone || '—'}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={a.status} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      {a.status === 'pending' && (
                        <button onClick={() => handleConfirm(a.appointment_id)} style={btnStyle('#1a6b3a')}>
                          Confirm
                        </button>
                      )}
                      {a.status === 'confirmed' && (
                        <button onClick={() => handleDone(a.appointment_id)} style={btnStyle('#6a1b9a')}>
                          Mark Done
                        </button>
                      )}
                      {a.status === 'done' && (
                        <button
                          onClick={() => navigate(`/doctor/prescription/${a.appointment_id}`)}
                          style={btnStyle('#2980b9')}
                        >
                          Prescription
                        </button>
                      )}
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