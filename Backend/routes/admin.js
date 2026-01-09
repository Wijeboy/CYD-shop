const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const AdminSettings = require('../models/AdminSettings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile image upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = 'uploads/profiles/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'admin-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: function(req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

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

// @route   PUT /api/admin/update-admin/:id
// @desc    Update an admin user
// @access  Private/Admin
router.put('/update-admin/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const adminId = req.params.id;

        // Find the admin to update
        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check if admin role
        if (admin.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'User is not an admin'
            });
        }

        // Update fields
        if (name) admin.name = name;
        if (email) {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(), 
                _id: { $ne: adminId } 
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            admin.email = email.toLowerCase();
        }
        if (password) {
            admin.password = password; // Will be hashed by pre-save hook
        }

        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Admin updated successfully',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Update Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/delete-admin/:id
// @desc    Delete an admin user
// @access  Private/Admin
router.delete('/delete-admin/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const adminId = req.params.id;

        // Prevent deleting yourself
        if (req.user._id.toString() === adminId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own admin account'
            });
        }

        // Find and delete the admin
        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check if admin role
        if (admin.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'User is not an admin'
            });
        }

        await User.findByIdAndDelete(adminId);

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Delete Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/profile
// @desc    Get current admin's profile
// @access  Private/Admin
router.get('/profile', protect, authorize('admin'), async (req, res) => {
    try {
        const admin = await User.findById(req.user._id).select('-password');
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                profileImage: admin.profileImage
            }
        });
    } catch (error) {
        console.error('Get Admin Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/update-profile
// @desc    Update current admin's profile
// @access  Private/Admin
router.put('/update-profile', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;

        const admin = await User.findById(req.user._id).select('+password');
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Update basic info
        if (name) admin.name = name;
        
        if (email && email !== admin.email) {
            // Check if email is already taken
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(), 
                _id: { $ne: admin._id } 
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            
            admin.email = email.toLowerCase();
        }

        // Update password if provided
        if (currentPassword && newPassword) {
            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, admin.password);
            
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            
            // Validate new password
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters'
                });
            }
            
            admin.password = newPassword; // Will be hashed by pre-save hook
        }

        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                profileImage: admin.profileImage
            }
        });
    } catch (error) {
        console.error('Update Admin Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/admin/upload-profile-image
// @desc    Upload profile image for admin
// @access  Private/Admin
router.post('/upload-profile-image', protect, authorize('admin'), upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        const admin = await User.findById(req.user._id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Delete old profile image if it exists and is not the default
        if (admin.profileImage && admin.profileImage !== 'User panel images/default-avatar.png') {
            const oldImagePath = path.join(__dirname, '..', admin.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Update admin profile image
        admin.profileImage = req.file.path.replace(/\\/g, '/');
        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            profileImage: admin.profileImage
        });
    } catch (error) {
        console.error('Upload Profile Image Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/customers
// @desc    Get all customers
// @access  Private/Admin
router.get('/customers', protect, authorize('admin'), async (req, res) => {
    try {
        const customers = await User.find({ role: 'user' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: customers.length,
            customers
        });
    } catch (error) {
        console.error('Get Customers Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/customers/:id
// @desc    Get single customer details
// @access  Private/Admin
router.get('/customers/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const customer = await User.findById(req.params.id).select('-password');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (customer.role !== 'user') {
            return res.status(400).json({
                success: false,
                message: 'This is not a customer account'
            });
        }

        res.status(200).json({
            success: true,
            customer
        });
    } catch (error) {
        console.error('Get Customer Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/customers/:id
// @desc    Update customer details
// @access  Private/Admin
router.put('/customers/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, email, countryCode, phone, country, postalCode, address, isActive, password } = req.body;
        const customerId = req.params.id;

        const customer = await User.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (customer.role !== 'user') {
            return res.status(400).json({
                success: false,
                message: 'This is not a customer account'
            });
        }

        // Update fields
        if (name) customer.name = name;
        
        if (email && email !== customer.email) {
            // Check if email is already taken
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(), 
                _id: { $ne: customerId } 
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            
            customer.email = email.toLowerCase();
        }
        
        // Update password if provided (admin changing customer password)
        if (password) {
            customer.password = password; // Will be hashed by pre-save hook
        }
        
        if (countryCode !== undefined) customer.countryCode = countryCode;
        if (phone !== undefined) customer.phone = phone;
        if (country !== undefined) customer.country = country;
        if (postalCode !== undefined) customer.postalCode = postalCode;
        if (address !== undefined) customer.address = address;
        if (isActive !== undefined) customer.isActive = isActive;

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                countryCode: customer.countryCode,
                phone: customer.phone,
                country: customer.country,
                postalCode: customer.postalCode,
                address: customer.address,
                isActive: customer.isActive
            }
        });
    } catch (error) {
        console.error('Update Customer Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/admin/customers/:id/profile-image
// @desc    Upload customer profile image
// @access  Private/Admin
router.post('/customers/:id/profile-image', protect, authorize('admin'), upload.single('profileImage'), async (req, res) => {
    try {
        const customerId = req.params.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        const customer = await User.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (customer.role !== 'user') {
            return res.status(400).json({
                success: false,
                message: 'This is not a customer account'
            });
        }

        // Delete old profile image if it exists and is not default
        if (customer.profileImage && 
            customer.profileImage !== 'User panel images/default-avatar.png') {
            const oldImagePath = path.join(__dirname, '..', customer.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Update customer with new image path
        customer.profileImage = req.file.path.replace(/\\/g, '/').replace('uploads/', 'uploads/');
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            profileImage: customer.profileImage
        });
    } catch (error) {
        console.error('Upload Customer Profile Image Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/customers/:id
// @desc    Delete customer account
// @access  Private/Admin
router.delete('/customers/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const customerId = req.params.id;

        const customer = await User.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (customer.role !== 'user') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin accounts from here'
            });
        }

        // Delete customer profile image if exists
        if (customer.profileImage && customer.profileImage !== 'User panel images/default-avatar.png') {
            const imagePath = path.join(__dirname, '..', customer.profileImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await User.findByIdAndDelete(customerId);

        res.status(200).json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        console.error('Delete Customer Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;