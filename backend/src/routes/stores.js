const express = require('express');
const router = express.Router();

const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { ratingRules } = require('../middleware/validationRules');

// All store routes for normal users require auth + NORMAL_USER role
router.use(authMiddleware, requireRole('NORMAL_USER'));

// GET /api/stores
router.get('/', storeController.listStores);

// POST /api/stores/:storeId/ratings
router.post('/:storeId/ratings', ratingRules, validate, storeController.submitRating);

module.exports = router;
