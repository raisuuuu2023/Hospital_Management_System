import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import TopBar from '../components/Topbar';
import Footer from '../components/Footer';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ doctors: 0, patients: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
    fetchStats();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get('/api/departments');
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      // Fallback to default departments if API fails
      setDepartments([
        { id: 1, name: 'Cardiology', description: 'Heart and cardiovascular diseases treatment', icon: '❤️', color: '#e74c3c' },
        { id: 2, name: 'Neurology', description: 'Brain, nervous system and spinal cord disorders', icon: '🧠', color: '#3498db' },
        { id: 3, name: 'Pediatrics', description: 'Medical care for infants, children and adolescents', icon: '👶', color: '#2ecc71' },
        { id: 4, name: 'Gynecology', description: "Women's reproductive health and pregnancy care", icon: '👩', color: '#9b59b6' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [doctorsRes, patientsRes] = await Promise.all([
        axiosInstance.get('/api/doctors/all').catch(() => ({ data: [] })),
        axiosInstance.get('/api/patients/all').catch(() => ({ data: [] }))
      ]);
      setStats({
        doctors: doctorsRes.data?.length || 0,
        patients: patientsRes.data?.length || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleDepartmentClick = (departmentName) => {
    navigate(`/doctors?department=${encodeURIComponent(departmentName)}`);
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132, textAlign: 'center' }}>
          Loading departments...
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
            Medical Departments
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>
            Our hospital offers specialized care across multiple departments
          </p>
        </div>

        {/* Departments Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: 24,
          marginBottom: 40
        }}>
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => handleDepartmentClick(dept.name)}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  background: `${dept.color || '#1a6b3a'}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32
                }}>
                  {dept.icon || '🏥'}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    {dept.name}
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Specialized Care
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 16 }}>
                {dept.description}
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTop: '1px solid #f1f5f9',
                paddingTop: 12
              }}>
                <span style={{ fontSize: 12, color: '#1a6b3a', fontWeight: 500 }}>
                  View Doctors →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div style={{
          background: 'linear-gradient(135deg, #1a6b3a 0%, #145c30 100%)',
          borderRadius: 12,
          padding: 32,
          color: '#fff',
          textAlign: 'center'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 700 }}>{departments.length}</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Departments</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 700 }}>{stats.doctors}+</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Specialists</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 700 }}>{stats.patients}+</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Happy Patients</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 700 }}>24/7</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Emergency Care</div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}