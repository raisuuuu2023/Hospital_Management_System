const express = require('express');
const router  = express.Router();

const { authMiddleware,
        roleMiddleware }      = require('../middleware/auth');
const { getProfile,
        updateProfile,
        createPrescription,
        getPrescription }     = require('../controllers/doctorController');

router.get(
  '/profile',
  authMiddleware,
  roleMiddleware('doctor'),
  getProfile
);

router.put(
  '/profile',
  authMiddleware,
  roleMiddleware('doctor'),
  updateProfile
);

router.post(
  '/prescriptions',
  authMiddleware,
  roleMiddleware('doctor'),
  createPrescription
);

router.get(
  '/prescriptions/:appointmentId',
  authMiddleware,
  getPrescription
);

module.exports = router;