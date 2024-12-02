const dbPromise = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET || 'your_secret_key';

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { first_name, last_name, email, password, profile_image, banner_image, role } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await connection.execute(
            `INSERT INTO users (first_name, last_name, email, password, profile_image, banner_image, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, hashedPassword, profile_image || null, banner_image || null, role || 'User']
        );

        res.status(201).json({ 
            message: 'User created successfully',
            userId: result.insertId 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { userId } = req.params;
        
        const [users] = await connection.execute(
            'SELECT user_id, first_name, last_name, email, profile_image, banner_image, role, created_at, updated_at FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { userId } = req.params;
        const { first_name, last_name, email } = req.body;

        // Debug logging
        console.log('Received update request:', {
            userId,
            body: req.body,
            params: req.params
        });

        // Validate userId
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Validate required fields
        if (!first_name || !last_name || !email) {
            return res.status(400).json({ 
                message: 'All fields are required',
                received: { first_name, last_name, email }
            });
        }

        // Prepare update query with only defined fields
        const updateFields = [];
        const updateValues = [];

        if (first_name) {
            updateFields.push('first_name = ?');
            updateValues.push(first_name);
        }
        if (last_name) {
            updateFields.push('last_name = ?');
            updateValues.push(last_name);
        }
        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        
        // Add userId at the end of values array
        updateValues.push(userId);

        const updateQuery = `
            UPDATE users 
            SET ${updateFields.join(', ')}
            WHERE user_id = ?
        `;

        console.log('Executing query:', {
            query: updateQuery,
            values: updateValues
        });

        const [result] = await connection.execute(updateQuery, updateValues);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch updated user data
        const [updatedUser] = await connection.execute(
            'SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?',
            [userId]
        );

        if (!updatedUser[0]) {
            return res.status(404).json({ message: 'User not found after update' });
        }

        console.log('Update successful:', updatedUser[0]);

        res.json({ 
            message: 'User updated successfully',
            user: updatedUser[0]
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ 
            error: 'Failed to update user',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { userId } = req.params;

        const [result] = await connection.execute(
            'DELETE FROM users WHERE user_id = ?',
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// User login
exports.loginUser = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [users] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            secretKey,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                userId: user.user_id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Middleware to verify JWT
exports.verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1]; // Remove 'Bearer ' prefix

        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Get user order statistics
exports.getUserOrderStats = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { userId } = req.params;

        // Get order count and total spent
        const [orderStats] = await connection.execute(
            `SELECT 
                COUNT(DISTINCT o.order_id) as count,
                COALESCE(SUM(o.total_price), 0) as totalSpent
             FROM orders o
             WHERE o.user_id = ?`,
            [userId]
        );

        res.json({
            count: parseInt(orderStats[0].count) || 0,
            totalSpent: parseFloat(orderStats[0].totalSpent) || 0
        });
    } catch (error) {
        console.error('Error fetching order stats:', error);
        res.status(500).json({ error: 'Failed to fetch order statistics' });
    }
};

// Get user saved items count
exports.getUserSavedItemsStats = async (req, res) => {
    try {
        const connection = await dbPromise;
        const { userId } = req.params;

        const [savedItemsCount] = await connection.execute(
            'SELECT COUNT(*) as count FROM saved_products WHERE user_id = ?',
            [userId]
        );

        res.json({
            count: savedItemsCount[0].count
        });
    } catch (error) {
        console.error('Error fetching saved items stats:', error);
        res.status(500).json({ error: 'Failed to fetch saved items statistics' });
    }
};
