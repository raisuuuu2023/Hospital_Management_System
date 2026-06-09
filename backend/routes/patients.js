const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Get patient profile
router.get('/profile', authMiddleware, roleMiddleware('patient'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.name, u.email 
       FROM patients p 
       JOIN users u ON u.id = p.user_id 
       WHERE p.user_id = ?`,
      [req.user.id]
    );
    
    if (rows.length === 0) {
      // Return empty profile if not found
      return res.json({ profile: { name: req.user.name, email: req.user.email } });
    }
    
    res.json({ profile: rows[0] });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update patient profile
router.put('/profile', authMiddleware, roleMiddleware('patient'), async (req, res) => {
  const { phone, address, blood_group, dob } = req.body;
  const user_id = req.user.id;
  
  console.log('Updating profile for user:', user_id);
  console.log('Data:', { phone, address, blood_group, dob });
  
  try {
    // Check if patient record exists
    const [existing] = await db.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [user_id]
    );
    
    if (existing.length === 0) {
      // Create new patient record
      await db.query(
        `INSERT INTO patients (user_id, phone, address, blood_group, dob) 
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, phone || null, address || null, blood_group || null, dob || null]
      );
    } else {
      // Update existing record
      await db.query(
        `UPDATE patients 
         SET phone = ?, address = ?, blood_group = ?, dob = ?
         WHERE user_id = ?`,
        [phone || null, address || null, blood_group || null, dob || null, user_id]
      );
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get doctors list for patients
router.get('/doctors', async (req, res) => {
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
    
    res.json({ doctors: rows, success: true });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;