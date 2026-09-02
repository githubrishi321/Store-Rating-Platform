const express = require('express');
const router = express.Router();

const ownerController = require('../controllers/ownerController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');

// All owner routes require auth + STORE_OWNER role
router.use(authMiddleware, requireRole('STORE_OWNER'));

// GET /api/store-owner/dashboard
router.get('/dashboard', ownerController.getDashboard);

module.exports = router;
