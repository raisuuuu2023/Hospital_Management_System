const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Only keep register here - login is handled in server.js
router.post('/register', register);

router.get('/profile', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'Profile accessed successfully',
    user: req.user   
  });
});

router.get('/admin-only', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.status(200).json({
    message: 'Welcome, admin!',
    user: req.user
  });
});

router.get('/doctor-only', authMiddleware, roleMiddleware('doctor'), (req, res) => {
  res.status(200).json({
    message: 'Welcome, doctor!',
    user: req.user
  });
});

module.exports = router;