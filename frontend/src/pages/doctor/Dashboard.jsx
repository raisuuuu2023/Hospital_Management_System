import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    axios.get('http://localhost:5000/api/appointments/doctor', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => setAppointments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const today = new Date().toDateString();
  const todayApts = appointments.filter(a => new Date(a.appointment_date).toDateString() === today);

  return (
    <div style={s.page}>
      <div style={{...s.sidebar, background:'#1565c0'}}>
        <div style={s.brand}>👨‍⚕️<br /><span style={{fontSize:13}}>Doctor Panel</span></div>
        <nav>
          {[{icon:'📊',label:'Dashboard'},{icon:'📅',label:'Appointments'},{icon:'🧑‍🤝‍🧑',label:'My Patients'}].map(i=>(
            <div key={i.label} style={s.navItem}>{i.icon} &nbsp;{i.label}</div>
          ))}
        </nav>
        <button onClick={handleLogout} style={s.logoutBtn}>🚪 Logout</button>
      </div>
      <div style={s.main}>
        <div style={s.header}>
          <div>
            <h2 style={{margin:0,color:'#1a3c5e'}}>Doctor Dashboard</h2>
            <p style={{margin:0,color:'#888',fontSize:13}}>Welcome, Dr. {user.name||'Doctor'} 👋</p>
          </div>
          <div style={{...s.avatar,background:'#1565c0'}}>{(user.name||'D')[0].toUpperCase()}</div>
        </div>

        <div style={s.grid4}>
          {[
            {label:"Today's",value:todayApts.length,icon:'📅',color:'#1976d2'},
            {label:'Total',value:appointments.length,icon:'📋',color:'#388e3c'},
            {label:'Pending',value:appointments.filter(a=>a.status==='pending').length,icon:'⏳',color:'#f57c00'},
            {label:'Completed',value:appointments.filter(a=>a.status==='completed').length,icon:'✅',color:'#7b1fa2'},
          ].map(c=>(
            <div key={c.label} style={{...s.card,borderTop:`4px solid ${c.color}`}}>
              <div style={{fontSize:32}}>{c.icon}</div>
              <div style={{fontSize:28,fontWeight:'bold',color:c.color}}>{c.value}</div>
              <div style={{color:'#888',fontSize:13}}>{c.label} Appointments</div>
            </div>
          ))}
        </div>

        <div style={s.box}>
          <h3 style={{color:'#1a3c5e',marginTop:0}}>📅 Today's Appointments ({todayApts.length})</h3>
          {loading ? <p>Loading...</p> : (
            <table style={s.table}>
              <thead>
                <tr style={{background:'#1565c0',color:'white'}}>
                  {['Patient','Date','Reason','Status'].map(h=><th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {todayApts.length===0
                  ? <tr><td colSpan={4} style={{textAlign:'center',padding:20,color:'#aaa'}}>No appointments today 🎉</td></tr>
                  : todayApts.map((a,i)=>(
                    <tr key={i} style={{background:i%2===0?'#f9f9f9':'white'}}>
                      <td style={s.td}>{a.patient_name||'N/A'}</td>
                      <td style={s.td}>{a.appointment_date?new Date(a.appointment_date).toLocaleDateString():'N/A'}</td>
                      <td style={s.td}>{a.reason||'General Checkup'}</td>
                      <td style={s.td}><StatusBadge status={a.status}/></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({status}) => {
  const map = {approved:['#e8f5e9','#2e7d32'],pending:['#fff3e0','#e65100'],completed:['#e3f2fd','#1565c0']};
  const [bg,color] = map[status]||['#f5f5f5','#333'];
  return <span style={{background:bg,color,padding:'3px 10px',borderRadius:12,fontSize:12}}>{status||'pending'}</span>;
};

const s = {
  page:{display:'flex',minHeight:'100vh',fontFamily:'Segoe UI,sans-serif',background:'#f0f4f8'},
  sidebar:{width:220,display:'flex',flexDirection:'column',padding:'0',position:'fixed',height:'100vh'},
  brand:{textAlign:'center',padding:'24px 0 16px',color:'white',fontSize:22,borderBottom:'1px solid rgba(255,255,255,0.15)',marginBottom:10},
  navItem:{color:'white',padding:'13px 24px',cursor:'pointer',fontSize:14},
  logoutBtn:{margin:'auto 16px 24px',background:'#c0392b',border:'none',color:'white',padding:12,borderRadius:8,cursor:'pointer'},
  main:{marginLeft:220,flex:1,padding:30},
  header:{display:'flex',justifyContent:'space-between',alignItems:'center',background:'white',padding:'18px 24px',borderRadius:12,marginBottom:24,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'},
  avatar:{width:42,height:42,borderRadius:'50%',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',fontSize:18},
  grid4:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20,marginBottom:24},
  card:{background:'white',borderRadius:12,padding:20,textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.07)'},
  box:{background:'white',borderRadius:12,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'},
  table:{width:'100%',borderCollapse:'collapse'},
  th:{padding:'11px 14px',textAlign:'left',fontWeight:600},
  td:{padding:'11px 14px',borderBottom:'1px solid #f0f0f0'},
};

export default DoctorDashboard;