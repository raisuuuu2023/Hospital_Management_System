const db = require('../config/db');

// 1. GET PATIENT PROFILE
const getProfile = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         u.id        AS user_id,
         u.name,
         u.email,
         u.role,
         p.id        AS patient_id,
         p.dob,
         p.blood_group,
         p.phone,
         p.address
       FROM users u
       LEFT JOIN patients p ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json({ profile: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// 2. UPDATE PATIENT PROFILE
const updateProfile = async (req, res) => {
  const { dob, blood_group, phone, address } = req.body;
  const user_id = req.user.id;

  try {
    const [existing] = await db.promise().query(
      'SELECT id FROM patients WHERE user_id = ?',
      [user_id]
    );

    if (existing.length === 0) {
      await db.promise().query(
        `INSERT INTO patients (user_id, dob, blood_group, phone, address)
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, dob, blood_group, phone, address]
      );
    } else {
      await db.promise().query(
        `UPDATE patients
         SET dob = ?, blood_group = ?, phone = ?, address = ?
         WHERE user_id = ?`,
         [dob, blood_group, phone, address, user_id]
      );
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// 3. GET DOCTORS DIRECTORY (FIXED: Pulls blood group safely for matching)
const getDoctors = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         d.id           AS doctor_id,
         u.name         AS doctor_name,
         u.email,
         d.specialty,
         d.fee,
         d.available_days,
         dp.blood_group AS doctor_blood_group
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN patients dp ON dp.user_id = u.id
       ORDER BY u.name ASC`
    );

    res.status(200).json({ doctors: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = { getProfile, updateProfile, getDoctors };