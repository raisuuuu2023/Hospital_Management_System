import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => { 
    fetchDoctors(); 
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching doctors from /api/patient/doctors');
      const res = await axiosInstance.get('/api/patient/doctors');
      
      console.log('API Response:', res.data);
      
      // Extract doctors array from response
      let doctorsList = [];
      if (res.data && res.data.doctors && Array.isArray(res.data.doctors)) {
        doctorsList = res.data.doctors;
      } else if (res.data && Array.isArray(res.data)) {
        doctorsList = res.data;
      }
      
      console.log(`Found ${doctorsList.length} doctors`);
      setDoctors(doctorsList);
      
      if (doctorsList.length === 0) {
        setError('No doctors available. Please contact administrator.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.error || 'Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selected) { 
      setError('Please select a doctor'); 
      return; 
    }
    if (!selectedDate) { 
      setError('Please select a date'); 
      return; 
    }

    setBooking(true);
    setError('');
    try {
      await axiosInstance.post('/api/appointments/book', {
        doctor_id: selected.doctor_id,
        date: selectedDate,
      });
      setSuccess('Appointment booked successfully! The doctor will confirm your time. Redirecting...');
      setTimeout(() => navigate('/patient/dashboard'), 2000);
    } catch (err) {
      console.error('Booking error:', err.response?.data);
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const inputStyle = {
    width: '100%', 
    padding: '10px 12px',
    border: '1.5px solid #e2e8f0', 
    borderRadius: '6px',
    fontSize: '13px', 
    outline: 'none',
    color: '#1e293b', 
    boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar active="Book Appointment" />
      <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a6b3a', margin: 0 }}>Book Appointment</h2>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Select a doctor and choose your preferred date</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
          {/* Doctors List */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a6b3a', marginBottom: 12 }}>
              Select a Doctor
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No doctors available</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {doctors.map((doc) => (
                  <div
                    key={doc.doctor_id}
                    onClick={() => { setSelected(doc); setError(''); setSelectedDate(''); }}
                    style={{
                      background: '#fff', 
                      borderRadius: 8, 
                      padding: '16px 20px',
                      border: `1.5px solid ${selected?.doctor_id === doc.doctor_id ? '#1a6b3a' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      background: selected?.doctor_id === doc.doctor_id ? '#f0f7f3' : '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a6b3a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>
                          {(doc.doctor_name || 'D')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Dr. {doc.doctor_name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{doc.specialty || 'General Physician'}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                            📅 Available: {doc.available_days || 'Contact for schedule'}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a' }}>৳{doc.fee || '—'}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>per visit</div>
                        {selected?.doctor_id === doc.doctor_id && (
                          <span style={{ fontSize: 11, background: '#1a6b3a', color: '#fff', padding: '2px 8px', borderRadius: 10, marginTop: 4, display: 'inline-block' }}>✓ Selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div>
            <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0', padding: 24, position: 'sticky', top: 150 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginBottom: 20 }}>
                Appointment Details
              </div>

              {success && (
                <div style={{ background: '#e8f5ee', color: '#1a6b3a', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 14, fontWeight: 500 }}>
                  ✓ {success}
                </div>
              )}
              {error && (
                <div style={{ background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 14 }}>
                  ⚠ {error}
                </div>
              )}

              {selected ? (
                <>
                  <div style={{ background: '#f0f7f3', borderRadius: 6, padding: '12px 14px', marginBottom: 20, border: '1px solid #b6d9c4' }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Selected Doctor</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginTop: 2 }}>Dr. {selected.doctor_name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{selected.specialty || 'General Physician'}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                      <strong>Consultation Fee:</strong> ৳{selected.fee}
                    </div>
                  </div>

                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Select Preferred Date *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={today}
                    max={maxDateStr}
                    onChange={e => {
                      setSelectedDate(e.target.value);
                      setError('');
                    }}
                    style={{ ...inputStyle, marginBottom: 20 }}
                  />
                  
                  {selectedDate && (
                    <div style={{ background: '#e8f5ee', padding: '10px', borderRadius: 6, marginBottom: 20, fontSize: 12, color: '#1a6b3a' }}>
                      📝 The clinic will confirm your appointment time based on doctor's availability.
                    </div>
                  )}

                  <button
                    onClick={handleBook}
                    disabled={booking || !selectedDate}
                    style={{
                      width: '100%', 
                      padding: '12px',
                      background: (booking || !selectedDate) ? '#6dab89' : '#1a6b3a',
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 6,
                      fontSize: 13, 
                      cursor: (booking || !selectedDate) ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {booking ? 'Booking...' : '✔ Confirm Appointment'}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: 13 }}>
                  👈 Please select a doctor first
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}