const dbPromise = require('../config/db');

// Add to cart
const addToCart = async (req, res) => {
    const connection = await dbPromise;
    try {
        const { userId, productId, quantity = 1, size = 'M', color } = req.body;
        console.log("Received cart request:", { userId, productId, quantity, size, color });
        
        // Validate required fields
        if (!userId || !productId) {
            const error = { 
                message: 'Missing required fields', 
                missingFields: ['userId', 'productId'].filter(field => !req.body[field]),
                receivedData: req.body
            };
            console.error("Validation error:", error);
            return res.status(400).json(error);
        }

        // Check if product exists
        const [product] = await connection.query(
            'SELECT * FROM products WHERE product_id = ?',
            [productId]
        );

        if (!product.length) {
            console.error("Product not found:", productId);
            return res.status(404).json({ message: 'Product not found' });
        }

        // Add to cart table in database
        const result = await connection.query(
            'INSERT INTO cart (user_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?)',
            [userId, productId, quantity, size, color]
        );
        console.log("Database operation result:", result);

        res.status(200).json({ message: 'Item added to cart successfully', result });
    } catch (error) {
        console.error("Error in addToCart:", error);
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
};

// Get cart items
const getCartItems = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { userId } = req.params;

        console.log("Fetching cart items for userId:", userId);

        if (!userId) {
            console.error("No userId provided");
            return res.status(400).json({ error: "User ID is required" });
        }

        const [cartItems] = await connection.query(
            `SELECT c.cart_id, c.quantity, c.size, c.color, 
                    p.product_id, p.name, p.price,
                    pi.image_url
             FROM cart c
             JOIN products p ON c.product_id = p.product_id
             LEFT JOIN product_images pi ON p.product_id = pi.product_id
             WHERE c.user_id = ?`,
            [userId]
        );

        console.log("Raw cart items from DB:", cartItems);

        const formattedCartItems = cartItems.map(item => ({
            id: item.cart_id,
            product_id: item.product_id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity,
            size: item.size || 'M',
            color: item.color || 'Default',
            url: item.image_url
        }));

        console.log("Formatted cart items:", formattedCartItems);
        res.json(formattedCartItems);
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ error: error.message });
    }
};

// Update cart item
const updateCartItem = async (req, res) => {
    const connection = await dbPromise;
    try {
        const { cartId } = req.params;
        const { quantity } = req.body;

        if (!cartId || !quantity) {
            return res.status(400).json({ message: 'Cart ID and quantity are required' });
        }

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const [result] = await connection.query(
            'UPDATE cart SET quantity = ? WHERE cart_id = ?',
            [quantity, cartId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Cart item updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart item', error: error.message });
    }
};

// Remove from cart
const removeFromCart = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { cartId } = req.params;

        const [result] = await connection.query(
            'DELETE FROM cart WHERE cart_id = ?',
            [cartId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from cart', error: error.message });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { userId } = req.params;

        const [result] = await connection.query(
            'DELETE FROM cart WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart', error: error.message });
    }
};

module.exports = {
    addToCart,
    getCartItems,
    updateCartItem,
    removeFromCart,
    clearCart
};
