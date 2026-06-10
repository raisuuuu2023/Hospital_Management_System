const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Simplified activity logging
async function logActivity(userId, userRole, actionType, entityType, entityId = null, description = null) {
  try {
    const query = `INSERT INTO user_history (user_id, user_role, action_type, entity_type, entity_id, description, created_at) 
                   VALUES (?, ?, ?, ?, ?, ?, NOW())`;
    const values = [userId, userRole, actionType, entityType, entityId, description];
    
    const [result] = await db.query(query, values);
    console.log(`✅ Login logged for user ${userId} (${userRole})`);
    return result;
  } catch (err) {
    console.error('❌ Failed to log activity:', err.message);
    return null;
  }
}

// Register controller
const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'patient']
    );
    
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Login controller - THIS IS WHERE LOGIN GETS LOGGED
const login = async (req, res) => {
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
    
    // THIS LINE LOGS THE LOGIN - Make sure it's here
    await logActivity(user.id, user.role, 'login', 'auth', user.id, `${user.role} logged in`);
    
    console.log(`✅ User ${user.email} logged in successfully`);
    
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
};

module.exports = { register, login };