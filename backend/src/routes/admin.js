const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { createUserRules, createStoreRules } = require('../middleware/validationRules');

// All admin routes require auth + ADMIN role
router.use(authMiddleware, requireRole('ADMIN'));

// GET /api/admin/dashboard
router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', createUserRules, validate, adminController.createUser);
router.delete('/users/:id', adminController.deleteUser);

// Stores
router.get('/stores', adminController.listStores);
router.post('/stores', createStoreRules, validate, adminController.createStore);
router.delete('/stores/:id', adminController.deleteStore);

module.exports = router;
