const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getOrderDetails
} = require('../controllers/orderController');
const userController = require('../controllers/userController');

// All order routes are protected (authentication is handled globally)
router.post('/', createOrder);
router.get('/user/:userId', userController.verifyToken, getUserOrders);
router.get('/:orderId', getOrderDetails);

module.exports = router;
