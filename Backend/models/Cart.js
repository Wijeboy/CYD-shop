const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    productImage: {
        type: String,
        required: true
    },
    selectedColor: {
        type: String,
        required: true
    },
    selectedColorHex: {
        type: String,
        required: true
    },
    selectedSize: {
        type: String,
        required: true,
        enum: ['S', 'M', 'L', 'XL', 'XXL']
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    availableQuantity: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate total price
cartSchema.virtual('totalPrice').get(function() {
    return this.items.reduce((total, item) => {
        return total + (item.productPrice * item.quantity);
    }, 0);
});

// Calculate subtotal (before shipping)
cartSchema.virtual('subtotal').get(function() {
    return this.totalPrice;
});

module.exports = mongoose.model('Cart', cartSchema);