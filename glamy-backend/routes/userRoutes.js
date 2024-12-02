const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public routes
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);

// Protected routes (require authentication)
router.get('/:userId', userController.verifyToken, userController.getUserById);
router.put('/:userId', userController.verifyToken, userController.updateUser);
router.delete('/:userId', userController.verifyToken, userController.deleteUser);

// Add these new routes
router.get('/:userId/stats/orders', userController.verifyToken, userController.getUserOrderStats);
router.get('/:userId/stats/saved-items', userController.verifyToken, userController.getUserSavedItemsStats);

module.exports = router;