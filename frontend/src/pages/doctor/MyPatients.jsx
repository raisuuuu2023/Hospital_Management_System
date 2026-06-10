import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function MyPatients() {
 const [patients, setPatients] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [filter, setFilter] = useState('all');
 const [selectedPatient, setSelectedPatient] = useState(null);
 const [showModal, setShowModal] = useState(false);
 const navigate = useNavigate();

 useEffect(() => {
 fetchPatients();
 }, []);

 const fetchPatients = async () => {
 try {
 setLoading(true);
 const res = await axiosInstance.get('/api/doctors/patients');
 setPatients(res.data.patients || res.data || []);
 } catch (err) {
 console.error('Error fetching patients:', err);
 } finally {
 setLoading(false);
 }
 };

 const filteredPatients = patients.filter(patient => {
 const matchSearch = patient.name?.toLowerCase().includes(search.toLowerCase()) ||
 patient.email?.toLowerCase().includes(search.toLowerCase()) ||
 patient.phone?.includes(search);
 const matchFilter = filter === 'all' || 
 (filter === 'active' && patient.total_visits > 0) ||
 (filter === 'new' && patient.total_visits === 0);
 return matchSearch && matchFilter;
 });

 const getInitials = (name) => {
 return name ? name.charAt(0).toUpperCase() : 'P';
 };

 const getRandomColor = (name) => {
 const colors = ['#1a6b3a', '#2980b9', '#e67e22', '#6a1b9a', '#c0392b', '#16a085'];
 const index = name ? name.length % colors.length : 0;
 return colors[index];
 };

 const PatientModal = ({ patient, onClose }) => {
 if (!patient) return null;

 return (
 <div style={{
 position: 'fixed',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 background: 'rgba(0,0,0,0.5)',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 zIndex: 1000
 }} onClick={onClose}>
 <div style={{
 background: '#fff',
 borderRadius: '12px',
 maxWidth: '500px',
 width: '90%',
 maxHeight: '80vh',
 overflow: 'auto',
 padding: '24px'
 }} onClick={e => e.stopPropagation()}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
 <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a6b3a', margin: 0 }}>Patient Details</h3>
 <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
 </div>

 <div style={{ textAlign: 'center', marginBottom: '20px' }}>
 <div style={{
 width: '80px',
 height: '80px',
 borderRadius: '50%',
 background: `linear-gradient(135deg, ${getRandomColor(patient.name)} 0%, ${getRandomColor(patient.name)}80 100%)`,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 margin: '0 auto',
 fontSize: '32px',
 fontWeight: 700,
 color: '#fff'
 }}>
 {getInitials(patient.name)}
 </div>
 </div>

 <div style={{ marginBottom: '16px' }}>
 <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Full Name</div>
 <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{patient.name || '—'}</div>
 </div>

 <div style={{ marginBottom: '16px' }}>
 <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Email</div>
 <div style={{ fontSize: '14px', color: '#1e293b' }}>{patient.email || '—'}</div>
 </div>

 <div style={{ marginBottom: '16px' }}>
 <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Phone</div>
 <div style={{ fontSize: '14px', color: '#1e293b' }}>{patient.phone || '—'}</div>
 </div>

 <div style={{ marginBottom: '16px' }}>
 <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Blood Group</div>
 <div style={{ fontSize: '14px', fontWeight: 600, color: '#c0392b' }}>{patient.blood_group || '—'}</div>
 </div>

 <div style={{ marginBottom: '16px' }}>
 <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Date of Birth</div>
 <div style={{ fontSize: '14px', color: '#1e293b' }}>{patient.dob ? new Date(patient.dob).toLocaleDateString() : '—'}</div>
 </div>

 <div style={{ marginBottom: '16px' }}>
 <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Address</div>
 <div style={{ fontSize: '14px', color: '#1e293b' }}>{patient.address || '—'}</div>
 </div>

 <div style={{ marginBottom: '16px' }}>
 <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Total Visits</div>
 <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a6b3a' }}>{patient.total_visits || 0}</div>
 </div>

 <div style={{ marginBottom: '16px' }}>
 <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Last Visit</div>
 <div style={{ fontSize: '14px', color: '#1e293b' }}>{patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'No visits yet'}</div>
 </div>

 <button
 onClick={() => {
 onClose();
 navigate(`/doctor/patient-history/${patient.patient_id}`);
 }}
 style={{
 width: '100%',
 padding: '12px',
 background: '#1a6b3a',
 color: '#fff',
 border: 'none',
 borderRadius: '6px',
 fontSize: '13px',
 cursor: 'pointer',
 fontWeight: 600,
 marginTop: '8px'
 }}
 >
 View Full Medical History
 </button>
 </div>
 </div>
 );
 };

 return (
 <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
 <Navbar active="My Patients" />
 
 <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132 }}>
 
 {/* Header */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
 <div>
 <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a6b3a', margin: 0 }}>My Patients</h2>
 <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Manage and view your patient list</p>
 </div>
 <div style={{ fontSize: 12, color: '#64748b', background: '#fff', padding: '6px 12px', borderRadius: 6 }}>
 Total: {filteredPatients.length} patients
 </div>
 </div>

 {/* Stats Cards */}
 <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
 <div style={{ flex: 1, background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
 <div style={{ width: 44, height: 44, borderRadius: 8, background: '#1a6b3a18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
 👥
 </div>
 <div>
 <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Total Patients</div>
 <div style={{ fontSize: 26, fontWeight: 700, color: '#1a6b3a' }}>{patients.length}</div>
 </div>
 </div>
 
 <div style={{ flex: 1, background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
 <div style={{ width: 44, height: 44, borderRadius: 8, background: '#2980b918', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
 📋
 </div>
 <div>
 <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Active Patients</div>
 <div style={{ fontSize: 26, fontWeight: 700, color: '#2980b9' }}>{patients.filter(p => p.total_visits > 0).length}</div>
 </div>
 </div>
 
 <div style={{ flex: 1, background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
 <div style={{ width: 44, height: 44, borderRadius: 8, background: '#e67e2218', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
 🆕
 </div>
 <div>
 <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>New Patients</div>
 <div style={{ fontSize: 26, fontWeight: 700, color: '#e67e22' }}>{patients.filter(p => p.total_visits === 0).length}</div>
 </div>
 </div>
 </div>

 {/* Search and Filter */}
 <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
 <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
 <input
 placeholder="🔍 Search by name, email or phone..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, outline: 'none', width: 300 }}
 />
 <div style={{ display: 'flex', gap: 8 }}>
 {['all', 'active', 'new'].map(f => (
 <button
 key={f}
 onClick={() => setFilter(f)}
 style={{
 padding: '6px 14px',
 borderRadius: 6,
 fontSize: 12,
 cursor: 'pointer',
 border: '1px solid #e2e8f0',
 background: filter === f ? '#1a6b3a' : '#fff',
 color: filter === f ? '#fff' : '#64748b',
 textTransform: 'capitalize',
 fontWeight: filter === f ? 600 : 400
 }}
 >
 {f === 'all' ? 'All Patients' : f === 'active' ? 'Active' : 'New'}
 </button>
 ))}
 </div>
 </div>

 {/* Patients Table */}
 {loading ? (
 <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>Loading patients...</div>
 ) : filteredPatients.length === 0 ? (
 <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
 <div style={{ fontSize: 48, marginBottom: 16 }}>👩‍⚕️</div>
 <div>No patients found</div>
 <div style={{ fontSize: 11, marginTop: 8, color: '#94a3b8' }}>Patients who book appointments with you will appear here</div>
 </div>
 ) : (
 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
 <thead>
 <tr style={{ background: '#f8fafc' }}>
 {['Patient', 'Contact', 'Blood Group', 'Visits', 'Last Visit', 'Actions'].map(h => (
 <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {filteredPatients.map((patient, i) => (
 <tr key={patient.patient_id || i} style={{ borderBottom: '0.5px solid #f1f5f9', cursor: 'pointer' }} onClick={() => {
 setSelectedPatient(patient);
 setShowModal(true);
 }}>
 <td style={{ padding: '12px 16px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
 <div style={{
 width: 36,
 height: 36,
 borderRadius: '50%',
 background: `linear-gradient(135deg, ${getRandomColor(patient.name)} 0%, ${getRandomColor(patient.name)}80 100%)`,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 fontSize: 14,
 fontWeight: 700,
 color: '#fff'
 }}>
 {getInitials(patient.name)}
 </div>
 <div>
 <div style={{ fontWeight: 600, color: '#1e293b' }}>{patient.name || '—'}</div>
 <div style={{ fontSize: 11, color: '#94a3b8' }}>{patient.email || '—'}</div>
 </div>
 </div>
 </td>
 <td style={{ padding: '12px 16px', color: '#64748b' }}>
 {patient.phone || '—'}
 </td>
 <td style={{ padding: '12px 16px' }}>
 <span style={{
 padding: '2px 8px',
 borderRadius: 12,
 fontSize: 11,
 fontWeight: 600,
 background: patient.blood_group ? '#fdecea' : '#f1f5f9',
 color: patient.blood_group ? '#c0392b' : '#64748b'
 }}>
 {patient.blood_group || 'Unknown'}
 </span>
 </td>
 <td style={{ padding: '12px 16px' }}>
 <span style={{
 padding: '2px 8px',
 borderRadius: 12,
 fontSize: 11,
 fontWeight: 600,
 background: patient.total_visits > 0 ? '#e8f5ee' : '#fef9e7',
 color: patient.total_visits > 0 ? '#1a6b3a' : '#b7770d'
 }}>
 {patient.total_visits || 0} visits
 </span>
 </td>
 <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>
 {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
 </td>
 <td style={{ padding: '12px 16px' }}>
 <button
 onClick={(e) => {
 e.stopPropagation();
 navigate(`/doctor/patient-history/${patient.patient_id}`);
 }}
 style={{
 padding: '4px 10px',
 borderRadius: 4,
 fontSize: 11,
 cursor: 'pointer',
 border: '1px solid #1a6b3a',
 color: '#1a6b3a',
 background: '#fff',
 fontWeight: 600
 }}
 >
 View History
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 </div>

 {/* Patient Details Modal */}
 {showModal && selectedPatient && (
 <PatientModal patient={selectedPatient} onClose={() => setShowModal(false)} />
 )}

 <Footer />
 </div>
 );
}