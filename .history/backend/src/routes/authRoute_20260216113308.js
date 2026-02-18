const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userModels = require('../models/userModels');

// Sirf check karo, create mat karo agar exist karta hai to
const initializeAdmin = async () => {
    try {
        const adminExists = await userModels.findOne({ email: process.env.ADMIN_EMAIL });
        if (!adminExists) {
            await userModels.create({
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin'
            });
            console.log('✅ Admin user created successfully');
        } else {
            console.log('✅ Admin user already exists');
        }
    } catch (error) {
        // Agar duplicate key error hai to ignore karo
        if (error.code === 11000) {
            console.log('✅ Admin already exists (duplicate ignored)');
        } else {
            console.error('Error creating admin:', error);
        }
    }
};

// Call this when server starts
initializeAdmin();

// Login route - SIMPLE VERSION (bina comparePassword ke)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await userModels.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Direct password compare karo (bcrypt already model mein hash ho jata hai)
        const bcrypt = require('bcryptjs');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Login successful', 
            token,
            user: { email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;