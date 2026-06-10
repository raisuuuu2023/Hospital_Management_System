import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [aptRes, profileRes] = await Promise.all([
        axiosInstance.get('/api/appointments/my').catch(() => ({ data:{ appointments:[] } })),
        axiosInstance.get('/api/patients/profile').catch(() => ({ data:null })),
      ]);
      setAppointments(aptRes.data.appointments || aptRes.data || []);
      setProfile(profileRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const upcoming = appointments.filter(a => a.status==='confirmed' || a.status==='pending');

  const C = {
    topbar: { background:'#1a6b3a', color:'#fff', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', position:'fixed', top:0, left:0, right:0, zIndex:100 },
    navbar: { background:'#145c30', height:44, display:'flex', alignItems:'center', padding:'0 32px', gap:2, position:'fixed', top:52, left:0, right:0, zIndex:99 },
    newsbar: { background:'#e8f5ee', borderBottom:'1px solid #b6d9c4', padding:'8px 32px', fontSize:12, color:'#1a6b3a', display:'flex', gap:16, alignItems:'center', position:'fixed', top:96, left:0, right:0, zIndex:98 },
    main: { background:'#f0f7f3', flex:1, padding:'24px 32px', marginTop:132 },
    card: { background:'#fff', borderRadius:8, border:'0.5px solid #e2e8f0', padding:'20px 24px' },
  };

  const statCards = [
    { title:'Upcoming Appointments', value:upcoming.length, icon:'📅', color:'#1a6b3a', sub:'Confirmed & Pending' },
    { title:'Total Appointments', value:appointments.length, icon:'📋', color:'#2980b9', sub:'All time' },
    { title:'Completed', value:appointments.filter(a=>a.status==='done').length, icon:'✅', color:'#e67e22', sub:'Done visits' },
  ];

  return (
    <div style={{ fontFamily:'Segoe UI, sans-serif', minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      <div style={C.topbar}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:22 }}>🏥</span>
          <div>
            <div style={{ fontSize:15, fontWeight:700 }}>HMS — Hospital Management System</div>
            <div style={{ fontSize:11, opacity:0.7 }}>Providing quality healthcare management</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:13 }}>
          <span>🔔</span>
          <span style={{ fontWeight:600 }}>{user?.name || 'Patient'}</span>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.4)', color:'#fff', padding:'5px 14px', borderRadius:4, cursor:'pointer', fontSize:12 }}>Logout</button>
        </div>
      </div>

      <div style={C.navbar}>
        {[{label:'Dashboard',path:'/patient/dashboard'},{label:'Book Appointment',path:'/patient/book-appointment'},{label:'My Profile',path:'/patient/profile'}].map(link => (
          <div key={link.label} onClick={() => navigate(link.path)} style={{ color:'#fff', padding:'8px 16px', fontSize:13, cursor:'pointer', borderRadius:4, fontWeight:link.label==='Dashboard'?600:400, background:link.label==='Dashboard'?'rgba(255,255,255,0.15)':'transparent', opacity:link.label==='Dashboard'?1:0.85 }}>
            {link.label}
          </div>
        ))}
      </div>

      <div style={C.newsbar}>
        <span style={{ background:'#1a6b3a', color:'#fff', padding:'2px 10px', borderRadius:3, fontSize:11, fontWeight:700, flexShrink:0 }}>NEWS</span>
        <span style={{ fontWeight:500 }}>Welcome to Hospital Management System — Patient Portal</span>
      </div>

      <div style={C.main}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#1a6b3a' }}>Welcome back, {user?.name?.split(' ')[0] || 'Patient'}! 👋</div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>Here's your health summary</div>
        </div>

        <div style={{ display:'flex', gap:14, marginBottom:20 }}>
          {statCards.map(card => (
            <div key={card.title} style={{ flex:1, background:'#fff', borderRadius:8, border:'0.5px solid #e2e8f0', borderLeft:`3px solid ${card.color}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:8, background:`${card.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>{card.title}</div>
                <div style={{ fontSize:26, fontWeight:700, color:card.color }}>{card.value}</div>
                <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>{card.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14 }}>
          <div style={C.card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#1a6b3a' }}>My Appointments</div>
              <span onClick={() => navigate('/patient/book-appointment')} style={{ fontSize:12, color:'#1a6b3a', cursor:'pointer', fontWeight:500 }}>Book new →</span>
            </div>
            {loading ? <p style={{ color:'#94a3b8', fontSize:13 }}>Loading...</p> : (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Doctor','Date','Time','Status'].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'10px 12px', color:'#64748b', fontWeight:600, borderBottom:'1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0
                    ? <tr><td colSpan={4} style={{ textAlign:'center', padding:32, color:'#94a3b8' }}>No appointments yet. <span onClick={() => navigate('/patient/book-appointment')} style={{ color:'#1a6b3a', cursor:'pointer', fontWeight:600 }}>Book one!</span></td></tr>
                    : appointments.slice(0,5).map((a,i) => (
                      <tr key={i} style={{ borderBottom:'0.5px solid #f1f5f9' }}>
                        <td style={{ padding:'10px 12px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:28, height:28, borderRadius:'50%', background:'#e8f5ee', color:'#1a6b3a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>
                              {(a.doctor_name||'D')[0]}
                            </div>
                            <span style={{ fontWeight:500 }}>{a.doctor_name||'—'}</span>
                          </div>
                        </td>
                        <td style={{ padding:'10px 12px', color:'#64748b' }}>{a.date ? new Date(a.date).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}</td>
                        <td style={{ padding:'10px 12px', color:'#64748b' }}>{a.time||'—'}</td>
                        <td style={{ padding:'10px 12px' }}><StatusBadge status={a.status}/></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={C.card}>
              <div style={{ fontSize:14, fontWeight:700, color:'#1a6b3a', marginBottom:14 }}>My Profile</div>
              {[
                { label:'Name', value:user?.name },
                { label:'Blood Group', value:profile?.blood_group, color:'#e74c3c' },
                { label:'Phone', value:profile?.phone },
                { label:'Gender', value:profile?.gender },
                { label:'Address', value:profile?.address },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', justifyContent:'space-between', fontSize:13, paddingBottom:8, borderBottom:'0.5px solid #f1f5f9', marginBottom:8 }}>
                  <span style={{ color:'#64748b', fontWeight:500 }}>{item.label}</span>
                  <span style={{ fontWeight:700, color:item.color||'#1e293b' }}>{item.value||'—'}</span>
                </div>
              ))}
              <button onClick={() => navigate('/patient/profile')} style={{ width:'100%', padding:8, background:'#f0f7f3', border:'1px solid #b6d9c4', color:'#1a6b3a', borderRadius:6, fontSize:12, cursor:'pointer', marginTop:4, fontWeight:600 }}>
                ✏️ Edit Profile
              </button>
            </div>

            <div style={C.card}>
              <div style={{ fontSize:14, fontWeight:700, color:'#1a6b3a', marginBottom:12 }}>💡 Health Tips</div>
              {['Drink 8 glasses of water daily 💧','Exercise at least 30 mins a day 🏃','Get 7-8 hours of sleep 😴','Eat balanced meals 🥗'].map((tip,i) => (
                <div key={i} style={{ fontSize:12, color:'#64748b', padding:'7px 0', borderBottom:i<3?'0.5px solid #f1f5f9':'none', fontWeight:500 }}>{tip}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const map = { confirmed:['#e8f5ee','#1a6b3a','Confirmed'], pending:['#fef9e7','#b7770d','Pending'], done:['#e8f5ee','#1a6b3a','Done'], cancelled:['#fdecea','#c0392b','Cancelled'] };
  const [bg, color, label] = map[status] || ['#f1f5f9','#64748b',status||'—'];
  return <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:bg, color }}>{label}</span>;
};