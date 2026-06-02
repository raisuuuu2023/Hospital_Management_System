import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axiosInstance.post('/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
      <div style={{ width: 320, padding: 32, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>Hospital Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width:'100%', marginBottom:12, padding:8 }} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          style={{ width:'100%', marginBottom:12, padding:8 }} />
        <button onClick={handleLogin} style={{ width:'100%', padding:10, background:'#2563eb', color:'#fff', border:'none', borderRadius:4 }}>
          Login
        </button>
      </div>
    </div>
  );
}
