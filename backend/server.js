const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
  }
}
testConnection();

app.use((req, res, next) => { req.db = db; next(); });

// ============ ACTIVITY LOGGING HELPER ============
async function logActivity(userId, userRole, actionType, entityType, entityId = null, description = null) {
  try {
    await db.query(
      `INSERT INTO user_history (user_id, user_role, action_type, entity_type, entity_id, description, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, userRole, actionType, entityType, entityId, description]
    );
    console.log(`✅ Logged: ${userRole} - ${actionType}`);
    return true;
  } catch (err) {
    console.error('❌ Error logging activity:', err.message);
    return false;
  }
}

// Routes from files
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const doctorRoutes = require('./routes/doctors');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);

// ============ LOGIN ROUTE (with logging) ============
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('📝 Login attempt:', email);
  
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );
    
    // Log the login
    await logActivity(user.id, user.role, 'login', 'auth', user.id, `${user.role} logged in`);
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ INLINE ROUTES ============

// Patient doctors list
app.get('/api/patient/doctors', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.id AS doctor_id, u.name AS doctor_name, d.specialty,
      COALESCE(d.fee, 0) AS fee,
      COALESCE(d.available_days, 'Contact for schedule') AS available_days
      FROM doctors d JOIN users u ON u.id = d.user_id
      WHERE u.role = 'doctor' ORDER BY u.name ASC
    `);
    res.json({ doctors: rows, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book appointment
app.post('/api/appointments/book', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  const { doctor_id, date, time } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const [patient] = await db.query('SELECT id FROM patients WHERE user_id = ?', [decoded.id]);
    if (patient.length === 0) return res.status(400).json({ error: 'Patient profile not found' });
    const [result] = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time, status) VALUES (?, ?, ?, ?, 'pending')`,
      [patient[0].id, doctor_id, date, time || null]
    );
    
    await logActivity(decoded.id, 'patient', 'book', 'appointment', result.insertId, `Booked appointment with doctor ID: ${doctor_id}`);
    
    res.status(201).json({ message: 'Appointment booked successfully', appointment_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Patient profile
app.get('/api/patient/profile', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const [rows] = await db.query(
      `SELECT p.*, u.name, u.email FROM patients p JOIN users u ON u.id = p.user_id WHERE p.user_id = ?`,
      [decoded.id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update patient profile
app.put('/api/patient/profile', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  const { phone, address, blood_group, dob } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const [existing] = await db.query('SELECT id FROM patients WHERE user_id = ?', [decoded.id]);
    if (existing.length === 0) {
      await db.query(
        `INSERT INTO patients (user_id, phone, address, blood_group, dob) VALUES (?, ?, ?, ?, ?)`,
        [decoded.id, phone || null, address || null, blood_group || null, dob || null]
      );
    } else {
      await db.query(
        `UPDATE patients SET phone=?, address=?, blood_group=?, dob=? WHERE user_id=?`,
        [phone || null, address || null, blood_group || null, dob || null, decoded.id]
      );
    }
    
    await logActivity(decoded.id, 'patient', 'edit', 'profile', decoded.id, 'Updated profile');
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin patients
app.get('/api/doctors/admin/patients', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await db.query(`
      SELECT u.id AS user_id, u.name, u.email, p.blood_group, p.phone, p.address, p.age, p.sex
      FROM users u LEFT JOIN patients p ON p.user_id = u.id
      WHERE u.role = 'patient' ORDER BY u.name ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin appointments
app.get('/api/doctors/admin/appointments', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await db.query(`
      SELECT a.id AS appointment_id, a.date, a.time, a.status,
      u1.name AS patient_name, u2.name AS doctor_name, d.specialty
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN users u1 ON u1.id = p.user_id
      JOIN doctors d ON d.id = a.doctor_id
      JOIN users u2 ON u2.id = d.user_id
      ORDER BY a.date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ANALYTICS ENDPOINT (ONLY ONE) ============
app.post('/api/analytics/stats', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const userId = decoded.id;
    
    console.log('📊 Fetching analytics for user:', userId);
    
    const [totalActions] = await db.query('SELECT COUNT(*) as total FROM user_history WHERE user_id = ?', [userId]);
    const [actionsByType] = await db.query('SELECT action_type, COUNT(*) as count FROM user_history WHERE user_id = ? GROUP BY action_type ORDER BY count DESC', [userId]);
    const [recentActivities] = await db.query('SELECT action_type, entity_type, entity_id, description, created_at FROM user_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [userId]);
    const [dailyActivity] = await db.query('SELECT DATE(created_at) as date, COUNT(*) as count FROM user_history WHERE user_id = ? GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 14', [userId]);
    const [hourlyActivity] = await db.query('SELECT HOUR(created_at) as hour, COUNT(*) as count FROM user_history WHERE user_id = ? GROUP BY HOUR(created_at) ORDER BY hour ASC', [userId]);
    const [mostVisited] = await db.query('SELECT entity_type, COUNT(*) as visit_count FROM user_history WHERE user_id = ? AND action_type = "view" GROUP BY entity_type ORDER BY visit_count DESC LIMIT 5', [userId]);
    
    let peakHour = { hour: 0, count: 0 };
    if (hourlyActivity.length > 0) {
      peakHour = hourlyActivity.reduce((max, item) => item.count > max.count ? item : max);
    }
    
    console.log('✅ Total actions:', totalActions[0]?.total || 0);
    
    res.json({
      success: true,
      stats: {
        total_actions: totalActions[0]?.total || 0,
        actions_by_type: actionsByType || [],
        recent_activities: recentActivities || [],
        daily_activity: dailyActivity || [],
        hourly_activity: hourlyActivity || [],
        most_visited: mostVisited || [],
        peak_hour: peakHour
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Calculate summary
app.post('/api/analytics/calculate-summary', async (req, res) => {
  res.json({ success: true, message: 'Summary calculated' });
});

console.log('✅ Server ready');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});