import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments - handle different response formats
      const aptRes = await axiosInstance.get('/api/appointments/my').catch(() => ({ data: [] }));
      let appointmentsData = [];
      if (aptRes.data) {
        if (Array.isArray(aptRes.data)) {
          appointmentsData = aptRes.data;
        } else if (aptRes.data.appointments && Array.isArray(aptRes.data.appointments)) {
          appointmentsData = aptRes.data.appointments;
        } else {
          appointmentsData = [];
        }
      }
      setAppointments(appointmentsData);
      
      // Fetch profile
      const profileRes = await axiosInstance.get('/api/patient/profile').catch(() => ({ data: null }));
      setProfile(profileRes.data?.profile || profileRes.data);
      
    } catch (err) { 
      console.error('Error fetching data:', err);
      setAppointments([]);
    } finally { 
      setLoading(false); 
    }
  };

  // Safe filtering - ensure appointments is an array
  const upcoming = Array.isArray(appointments) 
    ? appointments.filter(a => a.status === 'confirmed' || a.status === 'pending')
    : [];
    
  const completed = Array.isArray(appointments)
    ? appointments.filter(a => a.status === 'done')
    : [];

  const statCards = [
    { title: 'Upcoming Appointments', value: upcoming.length, icon: '📅', color: '#1a6b3a', sub: 'Confirmed & Pending' },
    { title: 'Total Appointments', value: Array.isArray(appointments) ? appointments.length : 0, icon: '📋', color: '#2980b9', sub: 'All time' },
    { title: 'Completed', value: completed.length, icon: '✅', color: '#e67e22', sub: 'Done visits' },
  ];

  const StatusBadge = ({ status }) => {
    const map = { 
      confirmed: ['#e8f5ee', '#1a6b3a', 'Confirmed'], 
      pending: ['#fef9e7', '#b7770d', 'Pending'], 
      done: ['#e8f5ee', '#6a1b9a', 'Completed'], 
      cancelled: ['#fdecea', '#c0392b', 'Cancelled'] 
    };
    const [bg, color, label] = map[status] || ['#f1f5f9', '#64748b', status || '—'];
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color }}>{label}</span>;
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar active="Dashboard" />
        <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132, textAlign: 'center' }}>
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <Navbar active="Dashboard" />
      
      <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132 }}>
        
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a6b3a' }}>Welcome back, {user?.name?.split(' ')[0] || 'Patient'}! 👋</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Here's your health summary</div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          {statCards.map(card => (
            <div key={card.title} style={{ 
              flex: 1, background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', 
              borderLeft: `3px solid ${card.color}`, padding: '16px 20px', 
              display: 'flex', alignItems: 'center', gap: 14 
            }}>
              <div style={{ 
                width: 44, height: 44, borderRadius: 8, background: `${card.color}18`, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 
              }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>{card.title}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{card.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          
          {/* Appointments Table */}
          <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a' }}>My Appointments</div>
              <span 
                onClick={() => navigate('/patient/book-appointment')} 
                style={{ fontSize: 12, color: '#1a6b3a', cursor: 'pointer', fontWeight: 500 }}
              >
                Book new →
              </span>
            </div>
            
            {Array.isArray(appointments) && appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                No appointments yet. 
                <span 
                  onClick={() => navigate('/patient/book-appointment')} 
                  style={{ color: '#1a6b3a', cursor: 'pointer', fontWeight: 600, marginLeft: 4 }}
                >
                  Book one!
                </span>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Doctor', 'Date', 'Time', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(appointments) && appointments.slice(0, 5).map((a, i) => (
                    <tr key={i} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ 
                            width: 28, height: 28, borderRadius: '50%', background: '#e8f5ee', 
                            color: '#1a6b3a', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', fontSize: 11, fontWeight: 700 
                          }}>
                            {(a.doctor_name || 'D')[0]}
                          </div>
                          <span style={{ fontWeight: 500 }}>{a.doctor_name || '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>
                        {a.date ? new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{a.time || 'TBD'}</td>
                      <td style={{ padding: '10px 12px' }}><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            
            {/* Profile Card */}
            <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', padding: '20px 24px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginBottom: 14 }}>My Profile</div>
              {[
                { label: 'Name', value: user?.name },
                { label: 'Blood Group', value: profile?.blood_group, color: '#e74c3c' },
                { label: 'Phone', value: profile?.phone },
                { label: 'Gender', value: profile?.sex || profile?.gender },
                { label: 'Address', value: profile?.address },
              ].map(item => (
                <div key={item.label} style={{ 
                  display: 'flex', justifyContent: 'space-between', fontSize: 13, 
                  paddingBottom: 8, borderBottom: '0.5px solid #f1f5f9', marginBottom: 8 
                }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color || '#1e293b' }}>{item.value || '—'}</span>
                </div>
              ))}
              <button 
                onClick={() => navigate('/patient/profile')} 
                style={{ 
                  width: '100%', padding: 8, background: '#f0f7f3', border: '1px solid #b6d9c4', 
                  color: '#1a6b3a', borderRadius: 6, fontSize: 12, cursor: 'pointer', 
                  marginTop: 4, fontWeight: 600 
                }}
              >
                ✏️ Edit Profile
              </button>
            </div>

            {/* Health Tips Card */}
            <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', padding: '20px 24px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginBottom: 12 }}>💡 Health Tips</div>
              {[
                'Drink 8 glasses of water daily 💧',
                'Exercise at least 30 mins a day 🏃',
                'Get 7-8 hours of sleep 😴',
                'Eat balanced meals 🥗'
              ].map((tip, i) => (
                <div key={i} style={{ 
                  fontSize: 12, color: '#64748b', padding: '7px 0', 
                  borderBottom: i < 3 ? '0.5px solid #f1f5f9' : 'none', fontWeight: 500 
                }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}