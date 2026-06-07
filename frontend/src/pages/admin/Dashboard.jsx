import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDoctors: 0, totalPatients: 0,
    totalAppointments: 0, pendingAppointments: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const apts = aptRes.data;
      setAppointments(apts.slice(0, 5));
      setStats({
        totalAppointments: apts.length,
        pendingAppointments: apts.filter(a => a.status === 'pending').length,
        totalDoctors: 0,
        totalPatients: 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div style={s.page}>
      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.brand}>🏥<br /><span style={{fontSize:13}}>HMS Admin</span></div>
        <nav>
          {[{icon:'📊',label:'Dashboard'},{icon:'👨‍⚕️',label:'Doctors'},{icon:'🧑‍🤝‍🧑',label:'Patients'},{icon:'📅',label:'Appointments'}].map(i => (
            <div key={i.label} style={s.navItem}>{i.icon} &nbsp;{i.label}</div>
          ))}
        </nav>
        <button onClick={handleLogout} style={s.logoutBtn}>🚪 Logout</button>
      </div>

      {/* MAIN */}
      <div style={s.main}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={{margin:0,color:'#1a3c5e'}}>Admin Dashboard</h2>
            <p style={{margin:0,color:'#888',fontSize:13}}>Hospital Management System</p>
          </div>
          <div style={s.avatar}>A</div>
        </div>

        {/* Cards */}
        <div style={s.grid4}>
          {[
            {label:'Total Doctors',value:stats.totalDoctors,icon:'👨‍⚕️',color:'#1976d2'},
            {label:'Total Patients',value:stats.totalPatients,icon:'🧑‍🤝‍🧑',color:'#388e3c'},
            {label:'Appointments',value:stats.totalAppointments,icon:'📅',color:'#f57c00'},
            {label:'Pending',value:stats.pendingAppointments,icon:'⏳',color:'#d32f2f'},
          ].map(c => (
            <div key={c.label} style={{...s.card, borderTop:`4px solid ${c.color}`}}>
              <div style={{fontSize:32}}>{c.icon}</div>
              <div style={{fontSize:28,fontWeight:'bold',color:c.color}}>{c.value}</div>
              <div style={{color:'#888',fontSize:13}}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={s.box}>
          <h3 style={{color:'#1a3c5e',marginTop:0}}>📋 Recent Appointments</h3>
          {loading ? <p>Loading...</p> : (
            <table style={s.table}>
              <thead>
                <tr style={{background:'#1a6b3a',color:'white'}}>
                  {['Patient','Doctor','Date','Status'].map(h=>(
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0
                  ? <tr><td colSpan={4} style={{textAlign:'center',padding:20,color:'#aaa'}}>No appointments found</td></tr>
                  : appointments.map((a,i) => (
                    <tr key={i} style={{background:i%2===0?'#f9f9f9':'white'}}>
                      <td style={s.td}>{a.patient_name||'N/A'}</td>
                      <td style={s.td}>{a.doctor_name||'N/A'}</td>
                      <td style={s.td}>{a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : 'N/A'}</td>
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
  const map = {approved:['#e8f5e9','#2e7d32'],pending:['#fff3e0','#e65100'],cancelled:['#ffebee','#c62828']};
  const [bg,color] = map[status]||['#f5f5f5','#333'];
  return <span style={{background:bg,color,padding:'3px 10px',borderRadius:12,fontSize:12}}>{status||'pending'}</span>;
};

const s = {
  page:{display:'flex',minHeight:'100vh',fontFamily:'Segoe UI,sans-serif',background:'#f0f4f8'},
  sidebar:{width:220,background:'#1a6b3a',display:'flex',flexDirection:'column',padding:'0',position:'fixed',height:'100vh'},
  brand:{textAlign:'center',padding:'24px 0 16px',color:'white',fontSize:22,borderBottom:'1px solid rgba(255,255,255,0.15)',marginBottom:10},
  navItem:{color:'white',padding:'13px 24px',cursor:'pointer',fontSize:14,transition:'background 0.2s'},
  logoutBtn:{margin:'auto 16px 24px',background:'#c0392b',border:'none',color:'white',padding:12,borderRadius:8,cursor:'pointer'},
  main:{marginLeft:220,flex:1,padding:30},
  header:{display:'flex',justifyContent:'space-between',alignItems:'center',background:'white',padding:'18px 24px',borderRadius:12,marginBottom:24,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'},
  avatar:{width:42,height:42,borderRadius:'50%',background:'#1a6b3a',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',fontSize:18},
  grid4:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20,marginBottom:24},
  card:{background:'white',borderRadius:12,padding:20,textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.07)'},
  box:{background:'white',borderRadius:12,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'},
  table:{width:'100%',borderCollapse:'collapse'},
  th:{padding:'11px 14px',textAlign:'left',fontWeight:600},
  td:{padding:'11px 14px',borderBottom:'1px solid #f0f0f0'},
};

export default AdminDashboard;