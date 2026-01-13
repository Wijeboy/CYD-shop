require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function deleteAllProducts() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to database');
        
        console.log('Deleting all products...');
        const result = await Product.deleteMany({});
        
        console.log(`\n✅ Successfully deleted ${result.deletedCount} products`);
        
        await mongoose.connection.close();
        console.log('✓ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

deleteAllProducts();
