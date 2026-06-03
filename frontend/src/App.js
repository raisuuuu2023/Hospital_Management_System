import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';

function TestUI() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1 }}>
        <Navbar />
        <div style={{ marginTop: '60px', padding: '32px', background: '#f1f5f9', minHeight: '100vh' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <StatCard title="Total Patients" value="120" icon="🧑‍🤝‍🧑" color="#3b82f6" />
            <StatCard title="Total Doctors" value="15" icon="👨‍⚕️" color="#10b981" />
            <StatCard title="Appointments" value="8" icon="📅" color="#f59e0b" />
            <StatCard title="Revenue" value="$4200" icon="💰" color="#8b5cf6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TestUI />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;