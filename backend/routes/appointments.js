const express = require('express');
const router  = express.Router();

const { authMiddleware,
        roleMiddleware }       = require('../middleware/auth');
const { bookAppointment,
        getMyAppointments,
        getDoctorAppointments,
        updateStatus }         = require('../controllers/appointmentController');

router.post(
  '/',
  authMiddleware,
  roleMiddleware('patient'),
  bookAppointment
);

router.get(
  '/my',
  authMiddleware,
  roleMiddleware('patient'),
  getMyAppointments
);

router.get(
  '/doctor',
  authMiddleware,
  roleMiddleware('doctor'),
  getDoctorAppointments
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('doctor'),
  updateStatus
);

module.exports = router;