const db = require('../config/db');

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

    res.status(200).json({ profile: rows[0] });

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

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


const getDoctors = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         d.id          AS id,           
         d.id          AS doctor_id,    
         u.name        AS name,         
         u.name        AS doctor_name,
         u.email       AS email,
         d.specialty   AS specialty,   
         d.specialty   AS department,   
         d.fee         AS fee,
         d.available_days AS available_days
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       ORDER BY u.name ASC`
    );

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = { getProfile, updateProfile, getDoctors };