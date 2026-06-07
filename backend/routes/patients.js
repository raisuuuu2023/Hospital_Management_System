const express = require('express');
const router  = express.Router();

const { authMiddleware,
        roleMiddleware }    = require('../middleware/auth');
const { getProfile,
        updateProfile,
        getDoctors }        = require('../controllers/patientController');

router.get('/profile', authMiddleware, roleMiddleware('patient'), getProfile);

router.put('/profile', authMiddleware, roleMiddleware('patient'), updateProfile);

router.get('/doctors', authMiddleware, roleMiddleware('patient'), getDoctors);

module.exports = router;