const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');  // Use promise version
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
}
testConnection();

// Make db available to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ============ TEST ROUTE ============
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'patient']
    );
    
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);
  
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

// ============ PATIENT DOCTORS ROUTE ============
app.get('/api/patient/doctors', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id AS doctor_id,
        u.name AS doctor_name,
        d.specialty,
        COALESCE(d.fee, 0) AS fee,
        COALESCE(d.available_days, 'Contact for schedule') AS available_days,
        COALESCE(d.clinic_hours, '9:00 AM - 5:00 PM') AS clinic_hours
      FROM doctors d 
      JOIN users u ON u.id = d.user_id
      WHERE u.role = 'doctor'
      ORDER BY u.name ASC
    `);
    
    console.log(`✅ Found ${rows.length} doctors`);
    res.json({ doctors: rows, success: true });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ PUBLIC DOCTORS ROUTE ============
app.get('/api/doctors/all', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id AS doctor_id,
        u.name,
        u.email,
        d.specialty,
        COALESCE(d.fee, 0) AS fee,
        COALESCE(d.available_days, 'Contact for schedule') AS available_days,
        d.license
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      WHERE u.role = 'doctor'
      ORDER BY u.name ASC
    `);
    
    console.log(`✅ Found ${rows.length} doctors`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ BOOK APPOINTMENT ROUTE ============
app.post('/api/appointments/book', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const { doctor_id, date, time } = req.body;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    
    // Get patient_id
    const [patient] = await db.query('SELECT id FROM patients WHERE user_id = ?', [decoded.id]);
    if (patient.length === 0) {
      return res.status(400).json({ error: 'Patient profile not found' });
    }
    
    // Check if doctor exists
    const [doctor] = await db.query('SELECT id FROM doctors WHERE id = ?', [doctor_id]);
    if (doctor.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    const [result] = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [patient[0].id, doctor_id, date, time || null]
    );
    
    res.status(201).json({ 
      message: 'Appointment booked successfully', 
      appointment_id: result.insertId 
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ GET MY APPOINTMENTS ============
app.get('/api/appointments/my', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    
    const [patient] = await db.query('SELECT id FROM patients WHERE user_id = ?', [decoded.id]);
    if (patient.length === 0) {
      return res.json([]);
    }
    
    const [rows] = await db.query(`
      SELECT a.*, u.name as doctor_name, d.specialty, d.fee
      FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      JOIN users u ON u.id = d.user_id
      WHERE a.patient_id = ?
      ORDER BY a.date DESC
    `, [patient[0].id]);
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ PATIENT PROFILE ROUTE ============
app.get('/api/patient/profile', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const [rows] = await db.query(
      `SELECT p.*, u.name, u.email 
       FROM patients p 
       JOIN users u ON u.id = p.user_id 
       WHERE p.user_id = ?`,
      [decoded.id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Test: http://localhost:${PORT}/api/test`);
  console.log(`   Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`   Doctors: http://localhost:${PORT}/api/patient/doctors\n`);
});