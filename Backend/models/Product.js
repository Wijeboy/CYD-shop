const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['tops', 't-shirts', 'blouses', 'dresses', 'trousers', 'skirts', 'ethnic wear'],
        lowercase: true
    },
    stockQuantity: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    image: {
        type: String,
        required: [true, 'Please upload product image']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);