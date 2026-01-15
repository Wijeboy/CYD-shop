const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // User info
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Shipping info
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    
    // Order items
    items: [{
        productId: mongoose.Schema.Types.ObjectId,
        productName: String,
        productPrice: Number,
        selectedColor: String,
        selectedSize: String,
        quantity: Number,
        productImage: String
    }],
    
    // Pricing
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 350
    },
    totalAmount: {
        type: Number,
        required: true
    },
    
    // Payment
    paymentMethod: {
        type: String,
        enum: ['cod', 'card'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    cardLastFour: String, // Last 4 digits of card if card payment
    
    // Order status
    orderStatus: {
        type: String,
        enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'placed'
    },
    
    // Tracking
    trackingNumber: String,
    estimatedDelivery: Date,
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Order', orderSchema);
