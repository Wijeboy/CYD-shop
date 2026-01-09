const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const AdminSettings = require('../models/AdminSettings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard-stats', protect, authorize('admin'), async (req, res) => {
    try {
        const settings = await AdminSettings.getSettings();
        
        res.status(200).json({
            success: true,
            data: {
                totalCustomers: settings.totalCustomers,
                ordersPending: settings.ordersPending,
                totalRevenue: settings.totalRevenue,
                lastUpdated: settings.lastUpdated
            }
        });
    } catch (error) {
        console.error('Get Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/dashboard-stats
// @desc    Update dashboard statistics
// @access  Private/Admin
router.put('/dashboard-stats', protect, authorize('admin'), async (req, res) => {
    try {
        const { totalCustomers, ordersPending, totalRevenue } = req.body;

        // Validate input
        if (totalCustomers === undefined || ordersPending === undefined || totalRevenue === undefined) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate numbers
        if (isNaN(totalCustomers) || isNaN(ordersPending) || isNaN(totalRevenue)) {
            return res.status(400).json({
                success: false,
                message: 'All values must be valid numbers'
            });
        }

        const settings = await AdminSettings.getSettings();
        
        settings.totalCustomers = parseInt(totalCustomers);
        settings.ordersPending = parseInt(ordersPending);
        settings.totalRevenue = parseFloat(totalRevenue);
        settings.lastUpdated = Date.now();
        
        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Dashboard statistics updated successfully',
            data: {
                totalCustomers: settings.totalCustomers,
                ordersPending: settings.ordersPending,
                totalRevenue: settings.totalRevenue,
                lastUpdated: settings.lastUpdated
            }
        });
    } catch (error) {
        console.error('Update Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/verify
// @desc    Verify admin access
// @access  Private/Admin
router.get('/verify', protect, authorize('admin'), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Admin access verified',
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('Verify Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/admin/create-admin
// @desc    Create a new admin user
// @access  Private/Admin
router.post('/create-admin', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new admin user (password will be hashed by User model pre-save hook)
        const newAdmin = new User({
            name,
            email: email.toLowerCase(),
            password: password,
            role: 'admin',
            isActive: true
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully',
            admin: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });
    } catch (error) {
        console.error('Create Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/list-admins
// @desc    Get list of all admin users
// @access  Private/Admin
router.get('/list-admins', protect, authorize('admin'), async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' })
            .select('name email role createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: admins.length,
            admins
        });
    } catch (error) {
        console.error('List Admins Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;