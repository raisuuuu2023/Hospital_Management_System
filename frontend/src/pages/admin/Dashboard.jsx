import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

const topbarStyle = { background:'#1a6b3a', color:'#fff', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', position:'fixed', top:0, left:0, right:0, zIndex:100 };
const navbarStyle = { background:'#145c30', height:44, display:'flex', alignItems:'center', padding:'0 32px', gap:2, position:'fixed', top:52, left:0, right:0, zIndex:99 };
const newsbarStyle = { background:'#e8f5ee', borderBottom:'1px solid #b6d9c4', padding:'8px 32px', fontSize:12, color:'#1a6b3a', display:'flex', gap:16, alignItems:'center', position:'fixed', top:96, left:0, right:0, zIndex:98 };
const mainStyle = { background:'#f0f7f3', flex:1, padding:'24px 32px', marginTop:132 };
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
    done: ['#e8f5ee','#1a6b3a','Done'],
    cancelled: ['#fdecea','#c0392b','Cancelled'],
  };
  const [bg, color, label] = map[status] || ['#f1f5f9','#64748b', status||'—'];
  return <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:bg, color }}>{label}</span>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ doctors:0, patients:0, appointments:0, pending:0 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [docRes, patRes, aptRes] = await Promise.all([
        axiosInstance.get('/api/doctors').catch(() => ({ data:[] })),
        axiosInstance.get('/api/patients').catch(() => ({ data:[] })),
        axiosInstance.get('/api/appointments').catch(() => ({ data:[] })),
      ]);
      const apts = Array.isArray(aptRes.data) ? aptRes.data : [];
      setStats({ doctors: docRes.data.length||0, patients: patRes.data.length||0, appointments: apts.length, pending: apts.filter(a => a.status==='pending').length });
      setAppointments(apts.slice(0,5));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const navLinks = [
    { label:'Dashboard', path:'/admin/dashboard' },
    { label:'Doctors', path:'/admin/doctors' },
    { label:'Patients', path:'/admin/patients' },
    { label:'Appointments', path:'/admin/appointments' },
  ];

  const statCards = [
    { title:'Total Doctors', value:stats.doctors, icon:'👨‍⚕️', color:'#1a6b3a', sub:'Registered doctors' },
    { title:'Total Patients', value:stats.patients, icon:'🧑‍🤝‍🧑', color:'#2980b9', sub:'Registered patients' },
    { title:'Appointments', value:stats.appointments, icon:'📅', color:'#e67e22', sub:'All time' },
    { title:'Pending', value:stats.pending, icon:'⏳', color:'#e74c3c', sub:'Need attention' },
  ];

  const quickActions = [
    { label:'+ Add New Doctor', path:'/register', bg:'#136634' },
    { label:'📅 View All Appointments', path:'/admin/appointments', bg:'#1172b3' },
    { label:'🧑‍🤝‍🧑 Manage Patients', path:'/admin/patients', bg:'#601490' },
    { label:'👨‍⚕️ Manage Doctors', path:'/admin/doctors', bg:'#c7bbb0' },
  ];

  return (
    <div style={{ fontFamily:'Segoe UI, sans-serif', minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      <div style={topbarStyle}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:22 }}>🏥</span>
          <div>
            <div style={{ fontSize:15, fontWeight:700 }}>HMS — Hospital Management System</div>
            <div style={{ fontSize:11, opacity:0.7 }}>Providing quality healthcare management</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:13 }}>
          <span>🔔</span>
          <span style={{ fontWeight:600 }}>{user?.name || 'Admin'}</span>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.4)', color:'#fff', padding:'5px 14px', borderRadius:4, cursor:'pointer', fontSize:12 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={navbarStyle}>
        {navLinks.map(link => (
          <div key={link.label} onClick={() => navigate(link.path)} style={{ color:'#fff', padding:'8px 16px', fontSize:13, cursor:'pointer', borderRadius:4, fontWeight:link.label==='Dashboard'?600:400, background:link.label==='Dashboard'?'rgba(255,255,255,0.15)':'transparent', opacity:link.label==='Dashboard'?1:0.85 }}>
            {link.label}
          </div>
        ))}
      </div>

      <div style={newsbarStyle}>
        <span style={{ background:'#1a6b3a', color:'#fff', padding:'2px 10px', borderRadius:3, fontSize:11, fontWeight:700, flexShrink:0 }}>NEWS</span>
        <span style={{ fontWeight:500 }}>Welcome to Hospital Management System — Admin Panel</span>
      </div>

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
              <span onClick={() => navigate('/admin/appointments')} style={{ fontSize:12, color:'#0d5c2d', cursor:'pointer', fontWeight:500 }}>View all →</span>
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
                      <tr key={i} style={{ borderBottom:'0.5px solid #f1f5f9' }}>
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