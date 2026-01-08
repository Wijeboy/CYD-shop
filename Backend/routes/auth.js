const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { uploadProfile } = require('../config/multer');

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
                countryCode: user.countryCode,
                profileImage: user.profileImage,
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
                profileImage: user.profileImage,
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

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private (requires JWT token)
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                countryCode: user.countryCode,
                address: user.address,
                country: user.country,
                postalCode: user.postalCode,
                profileImage: user.profileImage,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token validity
// @access  Public
router.post('/verify-token', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user exists
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user deactivated'
            });
        }

        res.status(200).json({
            success: true,
            valid: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                valid: false,
                message: 'Token has expired'
            });
        }
        
        res.status(401).json({
            success: false,
            valid: false,
            message: 'Invalid token'
        });
    }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Private (requires valid token)
router.post('/refresh-token', protect, async (req, res) => {
    try {
        // Generate new JWT token
        const token = jwt.sign(
            { 
                id: req.user._id,
                email: req.user.email,
                role: req.user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            token
        });
    } catch (error) {
        console.error('Refresh Token Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, uploadProfile.single('profileImage'), [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('countryCode').trim().notEmpty().withMessage('Country code is required'),
    body('address').optional().trim(),
    body('country').optional().trim(),
    body('postalCode').optional().trim(),
    body('oldPassword').optional(),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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

        const { name, email, phone, countryCode, address, country, postalCode, oldPassword, password } = req.body;

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ 
            email: email.toLowerCase(),
            _id: { $ne: req.user._id } // Exclude current user
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is already taken by another user' 
            });
        }

        // If changing password, verify old password
        if (password && oldPassword) {
            // Get user with password field
            const userWithPassword = await User.findById(req.user._id).select('+password');
            const isOldPasswordValid = await userWithPassword.comparePassword(oldPassword);
            
            if (!isOldPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
        } else if (password && !oldPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your current password to change password'
            });
        }

        // Update user fields
        req.user.name = name;
        req.user.email = email.toLowerCase();
        req.user.phone = phone;
        req.user.countryCode = countryCode;
        req.user.address = address || '';
        req.user.country = country || '';
        req.user.postalCode = postalCode || '';

        // Update profile image if uploaded
        if (req.file) {
            req.user.profileImage = 'uploads/profiles/' + req.file.filename;
        }

        // Update password if provided
        if (password && oldPassword) {
            req.user.password = password; // Will be hashed by pre-save hook
        }

        await req.user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                countryCode: req.user.countryCode,
                address: req.user.address,
                country: req.user.country,
                postalCode: req.user.postalCode,
                profileImage: req.user.profileImage,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, async (req, res) => {
    try {
        // In a JWT system, logout is primarily handled client-side by removing the token
        // But we can log the action or add token to a blacklist if needed
        
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
