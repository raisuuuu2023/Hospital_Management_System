const express            = require('express');
const router             = express.Router();
const { register, login } = require('../controllers/authController');
const { authMiddleware,
        roleMiddleware }   = require('../middleware/auth');

router.post('/register', register);

router.post('/login', login);

router.get('/profile', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'Profile accessed successfully',
    user: req.user   
  });
});

// This is a test route — you can delete it after Push 4
router.get('/admin-only', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.status(200).json({
    message: 'Welcome, admin!',
    user: req.user
  });
});

// This is a test route — you can delete it after Push 4
router.get('/doctor-only', authMiddleware, roleMiddleware('doctor'), (req, res) => {
  res.status(200).json({
    message: 'Welcome, doctor!',
    user: req.user
  });
});


module.exports = router;