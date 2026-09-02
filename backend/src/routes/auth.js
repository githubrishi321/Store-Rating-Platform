const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerRules,
  loginRules,
  passwordUpdateRules,
} = require('../middleware/validationRules');

// POST /api/auth/register
router.post('/register', registerRules, validate, authController.register);

// POST /api/auth/login
router.post('/login', loginRules, validate, authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// PUT /api/auth/password  (authenticated, any role)
router.put('/password', authMiddleware, passwordUpdateRules, validate, authController.updatePassword);

module.exports = router;
