const express = require('express');
const router = express.Router();
const dbPromise = require('../config/db');
const {
    saveProduct,
    searchProducts,
    getHomepageProducts,
    getSavedProducts,
    getProductById
} = require('../controllers/productController');

// Debug middleware for this router
router.use((req, res, next) => {
    console.log('Product Route accessed:', {
        method: req.method,
        path: req.path,
        url: req.url,
        baseUrl: req.baseUrl
    });
    next();
});

// Test route
router.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Product routes are working' });
});

// List all products
router.get('/all', async (req, res) => {
    console.log('All products route hit');
    try {
        const connection = await dbPromise;
        const [products] = await connection.query(
            `SELECT product_id, name, price 
             FROM products`
        );
        res.json(products);
    } catch (error) {
        console.error('Error in /all route:', error);
        res.status(500).json({ error: error.message });
    }
});

// Public routes
router.get('/search', searchProducts);
router.get('/featured', getHomepageProducts);
router.get('/saved/:userId', getSavedProducts);
router.post('/save', saveProduct);

// Product detail route - make sure this comes last
router.get('/product/:productId', getProductById);

module.exports = router;
