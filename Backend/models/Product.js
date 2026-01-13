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
    description: {
        type: String,
        required: [true, 'Please provide product description'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    // Color variants with their own images and sizes
    colorVariants: [{
        color: {
            type: String,
            required: true,
            enum: ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'navy', 'beige', 'maroon']
        },
        colorName: {
            type: String,
            required: true
        },
        colorHex: {
            type: String,
            required: true
        },
        images: {
            mainImage: {
                type: String,
                required: true
            },
            additionalImages: [{
                type: String
            }]
        },
        sizeQuantities: {
            S: {
                type: Number,
                min: [0, 'Quantity cannot be negative'],
                default: 0
            },
            M: {
                type: Number,
                min: [0, 'Quantity cannot be negative'],
                default: 0
            },
            L: {
                type: Number,
                min: [0, 'Quantity cannot be negative'],
                default: 0
            },
            XL: {
                type: Number,
                min: [0, 'Quantity cannot be negative'],
                default: 0
            },
            XXL: {
                type: Number,
                min: [0, 'Quantity cannot be negative'],
                default: 0
            }
        }
    }],
    // Keep old structure for backward compatibility
    sizeQuantities: {
        S: { type: Number, min: [0, 'Quantity cannot be negative'], default: 0 },
        M: { type: Number, min: [0, 'Quantity cannot be negative'], default: 0 },
        L: { type: Number, min: [0, 'Quantity cannot be negative'], default: 0 },
        XL: { type: Number, min: [0, 'Quantity cannot be negative'], default: 0 },
        XXL: { type: Number, min: [0, 'Quantity cannot be negative'], default: 0 }
    },
    mainImage: { type: String },
    additionalImages: {
        image1: { type: String },
        image2: { type: String },
        image3: { type: String }
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

// Virtual for total stock quantity
productSchema.virtual('totalStock').get(function() {
    if (this.colorVariants && this.colorVariants.length > 0) {
        return this.colorVariants.reduce((total, variant) => {
            return total + variant.sizeQuantities.S + variant.sizeQuantities.M + 
                   variant.sizeQuantities.L + variant.sizeQuantities.XL + variant.sizeQuantities.XXL;
        }, 0);
    }
    return this.sizeQuantities.S + this.sizeQuantities.M + 
           this.sizeQuantities.L + this.sizeQuantities.XL + this.sizeQuantities.XXL;
});

module.exports = mongoose.model('Product', productSchema);