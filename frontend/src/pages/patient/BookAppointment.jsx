import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

export default function BookAppointment() {
  const [allDoctors, setAllDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);
  const [patientBloodGroup, setPatientBloodGroup] = useState('');
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch doctors and patient profile on mount
  useEffect(() => {
    const fetchDataOnMount = async () => {
      try {
        setFetching(true);
        const [doctorsRes, profileRes] = await Promise.all([
          axiosInstance.get('/api/patient/doctors'),
          axiosInstance.get('/api/patient/profile').catch(() => ({ data: null }))
        ]);

        // 1. Set Doctors
        const docs = doctorsRes.data.doctors || doctorsRes.data || [];
        setAllDoctors(docs);
        
        // Extract unique specialties dynamically from DB records
        const uniqueDepts = [...new Set(docs.map(d => d.specialty).filter(Boolean))];
        setDepartments(uniqueDepts.length > 0 ? uniqueDepts : ['Neurology', 'General Medicine', 'Cardiology']);

        // 2. Set Patient Blood Group for matching indicators
        const profile = profileRes?.data?.profile || profileRes?.data;
        if (profile && profile.blood_group) {
          setPatientBloodGroup(profile.blood_group);
        }
      } catch (err) {
        console.error("Error setting up booking directories:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchDataOnMount();
  }, []);

  // Filter doctors list based on selected department
  useEffect(() => {
    if (selectedDept) {
      const filtered = allDoctors.filter(d => d.specialty === selectedDept);
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
    setSelectedDoctor('');
    setSelectedDoctorDetails(null);
  }, [selectedDept, allDoctors]);

  // Track specific information profiles for selected doctor
  useEffect(() => {
    if (selectedDoctor) {
      const doc = filteredDoctors.find(d => String(d.doctor_id) === String(selectedDoctor));
      setSelectedDoctorDetails(doc || null);
    } else {
      setSelectedDoctorDetails(null);
    }
  }, [selectedDoctor, filteredDoctors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !time) {
      setMessage('⚠️ Please complete all form selections.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      await axiosInstance.post('/api/appointments', {
        doctor_id: Number(selectedDoctor),
        date,
        time
      });
      setMessage('✅ Success! Appointment reserved successfully. Redirecting...');
      setTimeout(() => navigate('/patient/dashboard'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Failed to book appointment slot.');
    } finally {
      setLoading(false);
    }
  };

  const C = {
    topbar: { background: '#1a6b3a', color: '#fff', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' },
    navbar: { background: '#145c30', height: 48, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 8, position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99 },
    main: { background: '#f8fafc', flex: 1, padding: '40px', marginTop: 128, minHeight: 'calc(100vh - 128px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', boxSizing: 'border-box' },
    container: { display: 'grid', gridTemplateColumns: selectedDoctorDetails ? '1.2fr 1fr' : '1fr', gap: '32px', width: '100%', maxWidth: '1000px', transition: 'all 0.3s ease' },
    card: { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', boxSizing: 'border-box' },
    
    // UI Color differentiation definitions
    titleText: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' },
    subTitleText: { fontSize: 14, color: '#64748b', margin: '0 0 28px 0' },
    fieldLabel: { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 },
    dataLabel: { color: '#64748b', fontWeight: 500, fontSize: 14 },
    dataValue: { color: '#1e293b', fontWeight: 600, fontSize: 14 },
    
    input: { width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, marginBottom: 20, outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#1e293b' },
  };

  return (
    <div style={{ fontFamily: '"Inter", "Segoe UI", sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      
      {/* Top Header */}
      <div style={C.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg style={{ width: 28, height: 28, fill: '#fff' }} viewBox="0 0 24 24"><path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/></svg>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>HMS Portal</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Logout</button>
        </div>
      </div>

      {/* Modern Subnavbar Menu */}
      <div style={C.navbar}>
        {[
          { label: 'Dashboard', path: '/patient/dashboard' },
          { label: 'Book Appointment', path: '/patient/book-appointment' },
          { label: 'My Profile', path: '/patient/profile' }
        ].map(link => {
          const isActive = window.location.pathname === link.path;
          return (
            <div key={link.label} onClick={() => navigate(link.path)} style={{ color: '#fff', padding: '8px 16px', fontSize: 13, cursor: 'pointer', borderRadius: 6, fontWeight: isActive ? 600 : 500, background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent', opacity: isActive ? 1 : 0.75 }}>
              {link.label}
            </div>
          );
        })}
      </div>

      {/* Main Container */}
      <div style={C.main}>
        <div style={C.container}>
          
          {/* Appointment Form */}
          <div style={C.card}>
            <h2 style={C.titleText}>Book Medical Appointment</h2>
            <p style={C.subTitleText}>Select specialized clinical tracks and coordinate slots with attending physicians.</p>

            {message && (
              <div style={{ padding: '14px 16px', borderRadius: 8, fontSize: 14, marginBottom: 24, background: message.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: message.startsWith('✅') ? '#166534' : '#991b1b', border: `1px solid ${message.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`, fontWeight: 500 }}>
                {message}
              </div>
            )}

            {fetching ? (
              <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', padding: '40px 0' }}>Loading available specialist directories...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <label style={C.fieldLabel}>Clinical Specialization Department</label>
                <select style={C.input} value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} required>
                  <option value="">Choose department division...</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <label style={C.fieldLabel}>Available Medical Practitioners</label>
                <select style={C.input} value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} disabled={!selectedDept} required>
                  <option value="">Choose designated practitioner...</option>
                  {filteredDoctors.map(doc => {
                    // Check if blood group parameters match profile indices dynamically
                    const isBloodMatch = patientBloodGroup && doc.blood_group === patientBloodGroup;
                    return (
                      <option key={doc.doctor_id} value={doc.doctor_id}>
                        {doc.doctor_name || doc.name} {isBloodMatch ? ' (🩸 Matches Your Blood Group)' : ''}
                      </option>
                    );
                  })}
                </select>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={C.fieldLabel}>Desired Session Date</label>
                    <input type="date" style={C.input} min={new Date().toISOString().split('T')} value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={C.fieldLabel}>Preferred Time Slot</label>
                    <input type="time" style={C.input} value={time} onChange={(e) => setTime(e.target.value)} required />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(26, 107, 58, 0.2)' }}>
                  {loading ? 'Processing Schedule...' : 'Register Complete Booking'}
                </button>
              </form>
            )}
          </div>

          {/* Right Side Info Pane (Titles vs Data clearly differentiated) */}
          {selectedDoctorDetails && (
            <div style={{ ...C.card, borderLeft: '4px solid #1a6b3a', background: '#fafafa' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#475569', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Practitioner Profile Summary</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e8f5ee', color: '#1a6b3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
                  {(selectedDoctorDetails.doctor_name || 'D')}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{selectedDoctorDetails.doctor_name || selectedDoctorDetails.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{selectedDoctorDetails.specialty || 'Attending Physician'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>
                  <span style={C.dataLabel}>Consultation Fee</span>
                  <span style={{ ...C.dataValue, color: '#1a6b3a', fontWeight: 700 }}>৳ {selectedDoctorDetails.fee || '0.00'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>
                  <span style={C.dataLabel}>Available Schedule</span>
                  <span style={C.dataValue}>{selectedDoctorDetails.available_days || 'Mon, Wed, Fri'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>
                  <span style={C.dataLabel}>Doctor Blood Group</span>
                  <span style={{ ...C.dataValue, color: '#e74c3c' }}>{selectedDoctorDetails.blood_group || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={C.dataLabel}>Hospital Location</span>
                  <span style={C.dataValue}>Main OPD Block A</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}