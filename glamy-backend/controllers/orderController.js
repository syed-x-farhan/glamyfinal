const dbPromise = require('../config/db');

// Create Order
const createOrder = async (req, res) => {
    const connection = await dbPromise;
    // Start a transaction
    await connection.beginTransaction();

    try {
        const {
            userId,
            totalPrice,
            shippingAddress,
            city,
            country,
            postalCode,
            phoneNumber,
            paymentMethod,
            shippingFirstName,
            shippingLastName,
            shippingEmail,
            products
        } = req.body;

        // Debug logging
        console.log('Creating order with data:', {
            userId,
            totalPrice,
            products
        });

        // Validate required fields
        if (!userId || !products || !totalPrice || !shippingAddress || !city || 
            !country || !postalCode || !phoneNumber || !paymentMethod || 
            !shippingFirstName || !shippingLastName || !shippingEmail) {
            return res.status(400).json({ error: "All order details are required." });
        }

        // Verify all products exist
        for (const product of products) {
            const [productExists] = await connection.execute(
                'SELECT product_id FROM products WHERE product_id = ?',
                [product.productId]
            );
            
            if (productExists.length === 0) {
                await connection.rollback();
                return res.status(400).json({ 
                    error: `Product with ID ${product.productId} does not exist.`
                });
            }
        }

        // Set order status based on payment method
        const orderStatus = paymentMethod === 'card' ? 'Paid' : 'Pending';

        // Insert order into the orders table
        const [orderResult] = await connection.execute(
            `INSERT INTO orders (
                user_id, total_price, shipping_address, city, country, 
                postal_code, phone_number, payment_method, status,
                shipping_first_name, shipping_last_name, shipping_email
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, totalPrice, shippingAddress, city, country,
                postalCode, phoneNumber, paymentMethod, orderStatus,
                shippingFirstName, shippingLastName, shippingEmail
            ]
        );

        const orderId = orderResult.insertId;

        // Insert each product into the order_products table
        for (const product of products) {
            try {
                await connection.execute(
                    'INSERT INTO order_products (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, product.productId, product.quantity, product.price]
                );
            } catch (error) {
                console.error('Error inserting product:', error);
                await connection.rollback();
                throw error;
            }
        }

        // If everything is successful, commit the transaction
        await connection.commit();

        res.status(201).json({ 
            message: 'Order created successfully', 
            orderId,
            status: orderStatus 
        });
    } catch (error) {
        // If there's an error, rollback the transaction
        await connection.rollback();
        console.error("Error creating order:", error);
        res.status(500).json({ 
            error: 'Failed to create order',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get User Orders
const getUserOrders = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { userId } = req.params;

        // Get all orders for the user, ordered by date
        const [orders] = await connection.execute(
            `SELECT 
                order_id, 
                total_price, 
                status, 
                created_at,
                payment_method
            FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC`,
            [userId]
        );

        res.status(200).json({ 
            orders: orders.map(order => ({
                ...order,
                total_price: parseFloat(order.total_price)
            }))
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ 
            message: 'Error fetching orders', 
            error: error.message 
        });
    }
};

// Get Order Details
const getOrderDetails = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { orderId } = req.params;
        const [order] = await connection.execute(
            `SELECT o.*, op.* 
             FROM orders o 
             LEFT JOIN order_products op ON o.order_id = op.order_id 
             WHERE o.order_id = ?`,
            [orderId]
        );
        
        if (!order.length) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.status(200).json({ order: order[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order details', error: error.message });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderDetails
};
