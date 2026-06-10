const express = require('express');
const router = express.Router();
const db = require('../config/db');

const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { 
  getProfile, 
  updateProfile, 
  getMyPatients,
  getPatientHistory,
  createPrescription, 
  getPrescription 
} = require('../controllers/doctorController');


router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT 
         d.id AS doctor_id,
         u.id AS user_id,
         u.name,
         u.email,
         d.specialty,
         COALESCE(d.fee, 0) AS fee,
         COALESCE(d.available_days, 'Contact for schedule') AS available_days,
         d.license,
         COALESCE(d.phone, '') AS phone,
         COALESCE(d.address, '') AS address,
         COALESCE(d.clinic_hours, '9:00 AM - 5:00 PM') AS clinic_hours,
         COALESCE(d.bio, '') AS bio,
         dept.name AS department_name,
         dept.id AS department_id
       FROM doctors d 
       JOIN users u ON u.id = d.user_id
       LEFT JOIN departments dept ON dept.id = d.department_id
       WHERE u.role = 'doctor'
       ORDER BY u.name ASC`
    );
    
    console.log(`✅ Found ${rows.length} doctors`); // Debug log
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


router.get('/admin/patients', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT u.id AS user_id, u.name, u.email, p.blood_group, p.phone, p.address, p.age, p.sex
       FROM users u 
       LEFT JOIN patients p ON p.user_id = u.id
       WHERE u.role = 'patient' 
       ORDER BY u.name ASC`
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.get('/admin/appointments', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT a.id AS appointment_id, a.date, a.time, a.status,
       u1.name AS patient_name, u2.name AS doctor_name, d.specialty
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u1 ON u1.id = p.user_id
       JOIN doctors d ON d.id = a.doctor_id
       JOIN users u2 ON u2.id = d.user_id
       ORDER BY a.date DESC`
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.put('/doctors/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const { specialty, fee, available_days } = req.body;
  try {
    await db.promise().query(
      'UPDATE doctors SET specialty=?, fee=?, available_days=? WHERE id=?',
      [specialty, fee, available_days, req.params.id]
    );
    res.status(200).json({ message: 'Doctor updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    await db.promise().query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


router.get('/profile', authMiddleware, roleMiddleware('doctor'), getProfile);
router.put('/profile', authMiddleware, roleMiddleware('doctor'), updateProfile);
router.get('/patients', authMiddleware, roleMiddleware('doctor'), getMyPatients);
router.get('/patient-history/:id', authMiddleware, roleMiddleware('doctor'), getPatientHistory);
router.post('/prescriptions', authMiddleware, roleMiddleware('doctor'), createPrescription);
router.get('/prescriptions/:appointmentId', authMiddleware, getPrescription);

module.exports = router;