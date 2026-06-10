import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import TopBar from '../components/Topbar';
import Footer from '../components/Footer';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching doctors from API...');
      
      const res = await axiosInstance.get('/api/doctors/all');
      console.log('API Response:', res);
      console.log('Response data:', res.data);
      console.log('Data type:', typeof res.data);
      console.log('Is array:', Array.isArray(res.data));
      
      if (res.data && Array.isArray(res.data)) {
        setDoctors(res.data);
        console.log(`${res.data.length} doctors loaded successfully`);
      } else {
        console.error('Unexpected response format:', res.data);
        setDoctors([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching doctors DETAILS:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Failed to load doctors. ';
      if (err.response?.status === 401) {
        errorMessage += 'Please login to continue.';
      } else if (err.response?.status === 403) {
        errorMessage += 'You do not have permission.';
      } else if (err.response?.status === 404) {
        errorMessage += 'API endpoint not found.';
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += err.message || 'Please try again later.';
      }
      
      setError(errorMessage);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };
  // Get unique departments from doctors
  const departments = [...new Set(doctors.map(doc => doc.specialty).filter(Boolean))];

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchDepartment = !selectedDepartment || doctor.specialty === selectedDepartment;
    const matchSearch = !searchTerm || 
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDepartment && matchSearch;
  });

  const handleBookAppointment = (doctorId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      navigate(`/patient/book-appointment?doctor=${doctorId}`);
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'D';
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132, textAlign: 'center' }}>
          Loading doctors...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      
      <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a6b3a', marginBottom: 8 }}>
            Our Doctors
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>
            Meet our experienced medical professionals
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fdecea',
            color: '#c0392b',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            textAlign: 'center'
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Search and Filter - Only show if doctors exist */}
        {doctors.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 2 }}>
                <input
                  type="text"
                  placeholder="🔍 Search by doctor name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 13,
                    outline: 'none',
                    background: '#fff'
                  }}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍⚕️</div>
            <h3 style={{ fontSize: 18, color: '#1e293b', marginBottom: 8 }}>No Doctors Found</h3>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              {error ? 'Please try again later.' : 'There are no doctors registered in the system yet.'}
            </p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 18, color: '#1e293b', marginBottom: 8 }}>No matching doctors</h3>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              No doctors found {selectedDepartment ? `in ${selectedDepartment}` : ''} matching "{searchTerm}"
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 24
          }}>
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.doctor_id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1a6b3a 0%, #145c30 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      fontWeight: 700,
                      color: '#fff'
                    }}>
                      {getInitials(doctor.name)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        Dr. {doctor.name}
                      </h3>
                      <p style={{ fontSize: 13, color: '#1a6b3a', fontWeight: 600, marginTop: 4 }}>
                        {doctor.specialty || 'General Physician'}
                      </p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                          📅 {doctor.available_days || 'Contact for schedule'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Consultation Fee</span>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#1a6b3a' }}>
                          ৳{doctor.fee || '—'}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleBookAppointment(doctor.doctor_id)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#1a6b3a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontWeight: 600,
                        marginTop: 8
                      }}
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}