const db     = require('../config/db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, email, password, role,
          bloodGroup, phone, address, age, sex,
          specialization, license } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const allowedRoles = ['patient', 'doctor', 'admin'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const [existing] = await db.promise().query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const userId = result.insertId;

    if (role === 'patient') {
      await db.promise().query(
        'INSERT INTO patients (user_id, blood_group, phone, address, age, sex) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, bloodGroup || null, phone || null, address || null, age || null, sex || null]
      );
    }

    if (role === 'doctor') {
      await db.promise().query(
        'INSERT INTO doctors (user_id, specialty, license) VALUES (?, ?, ?)',
        [userId, specialization || null, license || null]
      );
    }

    res.status(201).json({ message: 'Registration successful' });

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?', [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id:   user.id,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = { register, login };
