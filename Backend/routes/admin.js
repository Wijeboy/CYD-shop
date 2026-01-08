const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const AdminSettings = require('../models/AdminSettings');

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

module.exports = router;