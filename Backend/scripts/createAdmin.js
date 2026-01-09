const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Admin credentials
const adminData = {
    name: 'Admin CYD',
    email: 'admin@cyd.com',
    password: 'admin123456',
    phone: '+94771234567',
    countryCode: '+94',
    address: 'CYD Headquarters',
    country: 'Sri Lanka',
    postalCode: '10100',
    role: 'admin',
    isActive: true
};

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ MongoDB Connected');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('⚠️  Admin already exists with this email');
            console.log('\nAdmin Login Credentials:');
            console.log('========================');
            console.log('Email:', adminData.email);
            console.log('Password:', adminData.password);
            console.log('Role:', existingAdmin.role);
            console.log('========================\n');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create(adminData);
        
        console.log('✓ Admin created successfully!');
        console.log('\n================================');
        console.log('🔐 Admin Login Credentials');
        console.log('================================');
        console.log('Email:    ', adminData.email);
        console.log('Password: ', adminData.password);
        console.log('Role:     ', admin.role);
        console.log('Name:     ', admin.name);
        console.log('================================');
        console.log('\n✓ Use these credentials to login at the signin page');
        console.log('✓ Admin will be redirected to admin dashboard after login\n');

        process.exit(0);
    } catch (error) {
        console.error('✗ Error creating admin:', error.message);
        process.exit(1);
    }
}

createAdmin();
