import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const mainStyle = { background:'#f0f7f3', flex:1, padding:'24px 32px', marginTop:132, minHeight:'calc(100vh - 132px)' };
const cardStyle = { background:'#fff', borderRadius:8, border:'0.5px solid #e2e8f0', padding:'20px 24px' };

const StatCard = ({ title, value, icon, color, sub }) => (
  <div style={{ flex:1, background:'#fff', borderRadius:8, border:'0.5px solid #e2e8f0', borderLeft:`3px solid ${color}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
    <div style={{ width:44, height:44, borderRadius:8, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>{title}</div>
      <div style={{ fontSize:26, fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>{sub}</div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    confirmed: ['#e8f5ee','#1a6b3a','Confirmed'],
    pending: ['#fef9e7','#b7770d','Pending'],
    done: ['#e8f5ee','#6a1b9a','Done'],
    cancelled: ['#fdecea','#c0392b','Cancelled'],
  };
  const [bg, color, label] = map[status] || ['#f1f5f9','#64748b', status||'—'];
  return <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:bg, color }}>{label}</span>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ doctors:0, patients:0, appointments:0, pending:0 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docRes, patRes, aptRes] = await Promise.all([
        axiosInstance.get('/api/doctors/all').catch(() => ({ data:[] })),
        axiosInstance.get('/api/doctors/admin/patients').catch(() => ({ data:[] })),
        axiosInstance.get('/api/doctors/admin/appointments').catch(() => ({ data:[] })),
      ]);

      const docsCount = Array.isArray(docRes.data) ? docRes.data.length : (docRes.data.doctors?.length || 0);
      const patsCount = Array.isArray(patRes.data) ? patRes.data.length : (patRes.data.patients?.length || 0);
      const apts = Array.isArray(aptRes.data) ? aptRes.data : (aptRes.data.appointments || []);

      setStats({
        doctors: docsCount,
        patients: patsCount,
        appointments: apts.length,
        pending: apts.filter(a => a.status === 'pending').length
      });
      setAppointments(apts.slice(0, 5));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title:'Total Doctors', value:stats.doctors, icon:'👨‍⚕️', color:'#1a6b3a', sub:'Registered doctors' },
    { title:'Total Patients', value:stats.patients, icon:'🧑‍🤝‍🧑', color:'#2980b9', sub:'Registered patients' },
    { title:'Appointments', value:stats.appointments, icon:'📅', color:'#e67e22', sub:'All time' },
    { title:'Pending', value:stats.pending, icon:'⏳', color:'#e74c3c', sub:'Need attention' },
  ];

  const quickActions = [
    { label:'+ Add New Doctor', path:'/admin/add-doctor', bg:'#136634' },
    { label:'👨‍⚕️ Manage Doctors', path:'/admin/doctors', bg:'#1a6b3a' },
  ];

  return (
    <div style={{ fontFamily:'Segoe UI, sans-serif', minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      <Navbar active="Dashboard" />

      <div style={mainStyle}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#1a6b3a' }}>Welcome back, {user?.name || 'Admin'}! 👋</div>
          <div style={{ fontSize:12, color:'#274d81', marginTop:2 }}>Here's your hospital overview</div>
        </div>

        <div style={{ display:'flex', gap:14, marginBottom:20 }}>
          {statCards.map(card => <StatCard key={card.title} {...card} />)}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14 }}>

          <div style={cardStyle}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#064e22' }}>Recent Appointments</div>
            </div>
            {loading ? <p style={{ color:'#2e72d2', fontSize:13 }}>Loading...</p> : (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Patient','Doctor','Date','Status'].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'10px 12px', color:'#64748b', fontWeight:600, borderBottom:'1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0
                    ? <tr><td colSpan={4} style={{ textAlign:'center', padding:32, color:'#94a3b8' }}>No appointments found</td></tr>
                    : appointments.map((a, i) => (
                      <tr key={a.appointment_id || a.id || i} style={{ borderBottom:'0.5px solid #f1f5f9' }}>
                        <td style={{ padding:'10px 12px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:28, height:28, borderRadius:'50%', background:'#e8f5ee', color:'#1a6b3a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>
                              {(a.patient_name||'P')[0]}
                            </div>
                            <span style={{ fontWeight:500 }}>{a.patient_name||'—'}</span>
                          </div>
                        </td>
                        <td style={{ padding:'10px 12px', fontWeight:500 }}>{a.doctor_name||'—'}</td>
                        <td style={{ padding:'10px 12px', color:'#64748b' }}>
                          {a.date ? new Date(a.date).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}
                        </td>
                        <td style={{ padding:'10px 12px' }}><StatusBadge status={a.status} /></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={cardStyle}>
              <div style={{ fontSize:14, fontWeight:700, color:'#1a6b3a', marginBottom:14 }}>Quick Actions</div>
              {quickActions.map(btn => (
                <button key={btn.label} onClick={() => navigate(btn.path)} style={{ width:'100%', padding:'9px 14px', background:btn.bg, color:'white', border:'none', borderRadius:6, fontSize:12, cursor:'pointer', textAlign:'left', fontWeight:600, marginBottom:8 }}>
                  {btn.label}
                </button>
              ))}
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize:14, fontWeight:700, color:'#1a6b3a', marginBottom:14 }}>Hospital Summary</div>
              {[
                { label:'Active Doctors', value:stats.doctors, color:'#1a6b3a' },
                { label:'Total Patients', value:stats.patients, color:'#2980b9' },
                { label:'Confirmed', value:appointments.filter(a=>a.status==='confirmed').length, color:'#1a6b3a' },
                { label:'Pending Review', value:stats.pending, color:'#e74c3c' },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', justifyContent:'space-between', fontSize:13, paddingBottom:8, borderBottom:'0.5px solid #f1f5f9', marginBottom:8 }}>
                  <span style={{ color:'#64748b', fontWeight:500 }}>{item.label}</span>
                  <span style={{ fontWeight:700, color:item.color }}>{item.value}</span>
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