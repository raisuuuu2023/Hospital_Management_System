import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

export default function DoctorDashboard() {
 const [appointments, setAppointments] = useState([]);
 const [loading, setLoading] = useState(true);
 const { user, logout } = useAuth();
 const navigate = useNavigate();

 useEffect(() => {
 axiosInstance.get('/api/appointments/doctor')
 .then(r => setAppointments(r.data.appointments || r.data || []))
 .catch(console.error)
 .finally(() => setLoading(false));
 }, []);

 const today = new Date().toDateString();
 const todayApts = appointments.filter(a => new Date(a.date).toDateString() === today);
 const pending = appointments.filter(a => a.status === 'pending');

 const handleConfirm = async (id) => {
 try {
 await axiosInstance.patch(`/api/appointments/${id}/status`, { status: 'confirmed' });
 setAppointments(prev => prev.map(a => a.appointment_id === id ? { ...a, status:'confirmed' } : a));
 } catch (err) { console.error(err); }
 };

 const C = {
 topbar: { background:'#1a6b3a', color:'#fff', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', position:'fixed', top:0, left:0, right:0, zIndex:100 },
 navbar: { background:'#145c30', height:44, display:'flex', alignItems:'center', padding:'0 32px', gap:2, position:'fixed', top:52, left:0, right:0, zIndex:99 },
 newsbar: { background:'#e8f5ee', borderBottom:'1px solid #b6d9c4', padding:'8px 32px', fontSize:12, color:'#1a6b3a', display:'flex', gap:16, alignItems:'center', position:'fixed', top:96, left:0, right:0, zIndex:98 },
 main: { background:'#f0f7f3', flex:1, padding:'24px 32px', marginTop:132 },
 card: { background:'#fff', borderRadius:8, border:'0.5px solid #e2e8f0', padding:'20px 24px' },
 };

 const statCards = [
 { title:"Today's Appointments", value:todayApts.length, icon:'📅', color:'#1a6b3a', sub:'Scheduled today' },
 { title:'Pending Approval', value:pending.length, icon:'⏳', color:'#e67e22', sub:'Need confirmation' },
 { title:'Total Appointments', value:appointments.length, icon:'📋', color:'#2980b9', sub:'All time' },
 { title:'Completed', value:appointments.filter(a=>a.status==='done').length, icon:'✅', color:'#6a1b9a', sub:'Done' },
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
 <span style={{ fontWeight:600 }}>{user?.name || 'Doctor'}</span>
 <button onClick={() => { logout(); navigate('/login'); }} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.4)', color:'#fff', padding:'5px 14px', borderRadius:4, cursor:'pointer', fontSize:12 }}>Logout</button>
 </div>
 </div>

 <div style={C.navbar}>
 {[{label:'Dashboard',path:'/doctor/dashboard'},{label:'Appointments',path:'/doctor/appointments'},{label:'My Patients',path:'/doctor/patients'},{label:'My Profile',path:'/doctor/profile'}].map(link => (
 <div key={link.label} onClick={() => navigate(link.path)} style={{ color:'#fff', padding:'8px 16px', fontSize:13, cursor:'pointer', borderRadius:4, fontWeight:link.label==='Dashboard'?600:400, background:link.label==='Dashboard'?'rgba(255,255,255,0.15)':'transparent', opacity:link.label==='Dashboard'?1:0.85 }}>
 {link.label}
 </div>
 ))}
 </div>

 <div style={C.newsbar}>
 <span style={{ background:'#1a6b3a', color:'#fff', padding:'2px 10px', borderRadius:3, fontSize:11, fontWeight:700, flexShrink:0 }}>NEWS</span>
 <span style={{ fontWeight:500 }}>Welcome to Hospital Management System — Doctor Panel</span>
 </div>

 <div style={C.main}>
 <div style={{ marginBottom:20 }}>
 <div style={{ fontSize:16, fontWeight:700, color:'#1a6b3a' }}>Welcome, Dr. {user?.name || 'Doctor'}! 👋</div>
 <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{new Date().toLocaleDateString('en-BD',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
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
 <div style={{ fontSize:14, fontWeight:700, color:'#1a6b3a' }}>Today's Appointments ({todayApts.length})</div>
 <span onClick={() => navigate('/doctor/appointments')} style={{ fontSize:12, color:'#1a6b3a', cursor:'pointer', fontWeight:500 }}>View all →</span>
 </div>
 {loading ? <p style={{ color:'#94a3b8', fontSize:13 }}>Loading...</p> : (
 <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
 <thead>
 <tr style={{ background:'#f8fafc' }}>
 {['Patient','Time','Status','Action'].map(h => (
 <th key={h} style={{ textAlign:'left', padding:'10px 12px', color:'#64748b', fontWeight:600, borderBottom:'1px solid #f1f5f9' }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {todayApts.length === 0
 ? <tr><td colSpan={4} style={{ textAlign:'center', padding:32, color:'#94a3b8' }}>No appointments today 🎉</td></tr>
 : todayApts.map((a, i) => (
 <tr key={i} style={{ borderBottom:'0.5px solid #f1f5f9' }}>
 <td style={{ padding:'10px 12px' }}>
 <div style={{ display:'flex', alignItems:'center', gap:8 }}>
 <div style={{ width:28, height:28, borderRadius:'50%', background:'#e8f5ee', color:'#1a6b3a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>
 {(a.patient_name||'P')[0]}
 </div>
 <span style={{ fontWeight:500 }}>{a.patient_name||'—'}</span>
 </div>
 </td>
 <td style={{ padding:'10px 12px', color:'#64748b' }}>{a.time||'—'}</td>
 <td style={{ padding:'10px 12px' }}><StatusBadge status={a.status}/></td>
 <td style={{ padding:'10px 12px' }}>
 {a.status === 'pending' && (
 <button onClick={() => handleConfirm(a.appointment_id)} style={{ padding:'4px 10px', borderRadius:4, fontSize:11, cursor:'pointer', border:'1px solid #1a6b3a', color:'#1a6b3a', background:'#fff', fontWeight:600 }}>Confirm</button>
 )}
 </td>
 </tr>
 ))
 }
 </tbody>
 </table>
 )}
 </div>

 <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
 <div style={C.card}>
 <div style={{ fontSize:14, fontWeight:700, color:'#1a6b3a', marginBottom:12 }}>⏳ Pending Approvals ({pending.length})</div>
 {pending.length === 0
 ? <p style={{ color:'#94a3b8', fontSize:13, textAlign:'center', padding:'12px 0' }}>All caught up! ✅</p>
 : pending.slice(0,3).map((a,i) => (
 <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'0.5px solid #f1f5f9' }}>
 <div>
 <div style={{ fontSize:13, fontWeight:600 }}>{a.patient_name||'—'}</div>
 <div style={{ fontSize:11, color:'#64748b' }}>{a.date ? new Date(a.date).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'} • {a.time||'—'}</div>
 </div>
 <button onClick={() => handleConfirm(a.appointment_id)} style={{ padding:'4px 10px', borderRadius:4, fontSize:11, cursor:'pointer', border:'1px solid #1a6b3a', color:'#1a6b3a', background:'#fff', fontWeight:600 }}>Confirm</button>
 </div>
 ))
 }
 </div>

 <div style={C.card}>
 <div style={{ fontSize:14, fontWeight:700, color:'#1a6b3a', marginBottom:12 }}>Schedule Summary</div>
 {[
 { label:"Today's Patients", value:todayApts.length, color:'#1a6b3a' },
 { label:'Pending', value:pending.length, color:'#e67e22' },
 { label:'Confirmed', value:appointments.filter(a=>a.status==='confirmed').length, color:'#2980b9' },
 { label:'Completed', value:appointments.filter(a=>a.status==='done').length, color:'#6a1b9a' },
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

const StatusBadge = ({ status }) => {
 const map = { confirmed:['#e8f5ee','#1a6b3a','Confirmed'], pending:['#fef9e7','#b7770d','Pending'], done:['#e8f5ee','#1a6b3a','Done'], cancelled:['#fdecea','#c0392b','Cancelled'] };
 const [bg, color, label] = map[status] || ['#f1f5f9','#64748b',status||'—'];
 return <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:bg, color }}>{label}</span>;
};