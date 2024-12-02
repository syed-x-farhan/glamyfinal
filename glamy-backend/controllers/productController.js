const dbPromise = require('../config/db');

// Helper function to format price
const formatPrice = (price) => {
    // Remove any currency symbols and whitespace
    const cleanPrice = String(price).replace(/[^0-9.-]+/g, '');
    const numPrice = parseFloat(cleanPrice);
    // Return number with 2 decimal places
    return isNaN(numPrice) ? 0 : Number(numPrice.toFixed(2));
};

// Save a product for a user
const saveProduct = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { userId, productId } = req.body;
        
        if (!userId || !productId) {
            return res.status(400).json({ error: "userId and productId are required." });
        }

        // Check if already saved
        const [existing] = await connection.execute(
            'SELECT * FROM saved_products WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length) {
            return res.status(200).json({ message: 'Product already saved' });
        }

        // Save the product
        await connection.execute(
            'INSERT INTO saved_products (user_id, product_id) VALUES (?, ?)',
            [userId, productId]
        );

        res.status(201).json({ message: 'Product saved successfully' });
    } catch (error) {
        console.error("Error in saveProduct:", error);
        res.status(400).json({ error: error.message });
    }
};

// Search products
const searchProducts = async (req, res) => {
    try {
        const query = req.query.query;
        const connection = await dbPromise;

        if (!query) {
            return res.status(400).json({ error: "Search query is required." });
        }

        const [products] = await connection.query(
            `SELECT p.product_id, p.name, p.price, p.description, pi.image_url
             FROM products p
             LEFT JOIN product_images pi ON p.product_id = pi.product_id
             WHERE p.name LIKE ? OR p.description LIKE ?`,
            [`%${query}%`, `%${query}%`]
        );

        const formattedProducts = products.map(product => ({
            id: product.product_id,
            name: product.name,
            price: formatPrice(product.price),
            description: product.description,
            url: product.image_url || 'placeholder-image-url'
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({ error: "An error occurred while searching for products." });
    }
};

// Get featured products for homepage
const getHomepageProducts = async (req, res) => {
    try {
        const connection = await dbPromise;
        const [products] = await connection.query(
            `SELECT p.product_id, p.name, p.price, pi.image_url
             FROM products p
             LEFT JOIN product_images pi ON p.product_id = pi.product_id
             WHERE p.is_featured = true`
        );

        const formattedProducts = products.map(product => ({
            id: product.product_id,
            name: product.name,
            price: formatPrice(product.price),
            url: product.image_url || 'placeholder-image-url'
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error("Error fetching homepage products:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get saved products for a user
const getSavedProducts = async (req, res) => {
    try {
        const { userId } = req.params;
        const connection = await dbPromise;
        
        const [savedProducts] = await connection.query(
            `SELECT p.product_id, p.name, p.price, pi.image_url
             FROM saved_products sp
             JOIN products p ON sp.product_id = p.product_id
             LEFT JOIN product_images pi ON p.product_id = pi.product_id
             WHERE sp.user_id = ?
             GROUP BY p.product_id, p.name, p.price, pi.image_url`,
            [userId]
        );

        const formattedProducts = savedProducts.map(product => ({
            id: product.product_id,
            name: product.name,
            price: formatPrice(product.price),
            url: product.image_url || 'placeholder-image-url'
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error("Error fetching saved products:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get product details by ID
const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log('Fetching product with ID:', productId, 'Type:', typeof productId);
        
        const connection = await dbPromise;
        const numericProductId = parseInt(productId, 10);
        
        if (isNaN(numericProductId)) {
            return res.status(400).json({ 
                error: "Invalid product ID",
                message: "Product ID must be a number"
            });
        }

        const query = `
            SELECT p.product_id, p.name, p.price, p.description, pi.image_url
            FROM products p
            LEFT JOIN product_images pi ON p.product_id = pi.product_id
            WHERE p.product_id = ?
        `;
        
        console.log('Executing query with ID:', numericProductId);
        const [products] = await connection.query(query, [numericProductId]);
        console.log('Query result:', products);

        if (!products.length) {
            console.log('No product found with ID:', numericProductId);
            return res.status(404).json({ 
                error: "Product not found",
                message: `No product exists with ID: ${numericProductId}`
            });
        }

        const product = {
            id: products[0].product_id,
            name: products[0].name,
            price: formatPrice(products[0].price),
            description: products[0].description || "No description available",
            url: products[0].image_url || 'placeholder-image-url'
        };
        
        console.log('Sending response:', product);
        res.json(product);
    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).json({ 
            error: "Database error",
            message: "Failed to fetch product details",
            details: error.message 
        });
    }
};

module.exports = {
    saveProduct,
    searchProducts,
    getHomepageProducts,
    getSavedProducts,
    getProductById
};