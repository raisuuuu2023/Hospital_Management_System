const express = require('express');
const router  = express.Router();
const db      = require('../config/db'); 

const { 
  authMiddleware,
  roleMiddleware 
} = require('../middleware/auth');

const { 
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateStatus 
} = require('../controllers/appointmentController');

// 1. GET ALL APPOINTMENTS (Admin Dashboard Overview)
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const [rows] = await db.promise().query(`
        SELECT 
          a.id AS appointment_id, 
          a.date, 
          a.time, 
          a.status,
          up.name AS patient_name,
          ud.name AS doctor_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users up ON p.user_id = up.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users ud ON d.user_id = ud.id
        ORDER BY a.date DESC, a.time DESC
      `);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Server error fetching full schedule logs', details: err.message });
    }
  }
);

// 2. BOOK AN APPOINTMENT (Patient Portal)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('patient'),
  bookAppointment
);

// 3. GET MY APPOINTMENTS (Patient Portal List View)
router.get(
  '/my',
  authMiddleware,
  roleMiddleware('patient'),
  getMyAppointments
);

// 4. GET DOCTOR APPOINTMENTS (Doctor Panel List View)
router.get(
  '/doctor',
  authMiddleware,
  roleMiddleware('doctor'),
  getDoctorAppointments
);

// 5. UPDATE APPOINTMENT STATUS (Doctor Approval / Admin Cancellation)
router.patch(
  '/:id/status',
  authMiddleware,
  updateStatus 
);

module.exports = router;