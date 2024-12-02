const express = require('express');
const router = express.Router();
const {
    addToCart,
    getCartItems,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');

// All cart routes are protected (authentication is handled globally)
router.post('/', addToCart);
router.get('/:userId', getCartItems);
router.put('/:cartId', updateCartItem);
router.delete('/:cartId', removeFromCart);
router.delete('/user/:userId', clearCart);

module.exports = router;
