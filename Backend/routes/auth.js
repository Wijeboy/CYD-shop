const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/auth/check-email
// @desc    Check if email already exists
// @access  Public
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is required' 
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (user) {
            return res.status(200).json({ 
                success: true,
                exists: true,
                message: 'Email is already registered' 
            });
        }

        res.status(200).json({ 
            success: true,
            exists: false,
            message: 'Email is available' 
        });

    } catch (error) {
        console.error('Check Email Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
});

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('countryCode').trim().notEmpty().withMessage('Country code is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { name, email, phone, countryCode, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists with this email' 
            });
        }
        
        // Create new user
        user = new User({
            name,
            email: email.toLowerCase(),
            phone,
            countryCode,
            password
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration',
            error: error.message 
        });
    }
});

// @route   POST /api/auth/signin
// @desc    Login user
// @access  Public
router.post('/signin', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { email, password } = req.body;

        // Check if user exists (include password field)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                success: false,
                message: 'Account is deactivated. Please contact support.' 
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                countryCode: user.countryCode,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Signin Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login',
            error: error.message 
        });
    }
});

module.exports = router;
