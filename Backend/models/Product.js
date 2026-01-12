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
    sizeQuantities: {
        S: {
            type: Number,
            required: [true, 'Please provide size S quantity'],
            min: [0, 'Quantity cannot be negative'],
            default: 0
        },
        M: {
            type: Number,
            required: [true, 'Please provide size M quantity'],
            min: [0, 'Quantity cannot be negative'],
            default: 0
        },
        L: {
            type: Number,
            required: [true, 'Please provide size L quantity'],
            min: [0, 'Quantity cannot be negative'],
            default: 0
        },
        XL: {
            type: Number,
            required: [true, 'Please provide size XL quantity'],
            min: [0, 'Quantity cannot be negative'],
            default: 0
        },
        XXL: {
            type: Number,
            required: [true, 'Please provide size 2XL quantity'],
            min: [0, 'Quantity cannot be negative'],
            default: 0
        }
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    mainImage: {
        type: String,
        required: [true, 'Please upload main product image']
    },
    additionalImages: {
        image1: {
            type: String,
            required: [true, 'Please upload additional image 1']
        },
        image2: {
            type: String,
            required: [true, 'Please upload additional image 2']
        },
        image3: {
            type: String,
            required: [true, 'Please upload additional image 3']
        }
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
    return this.sizeQuantities.S + this.sizeQuantities.M + 
           this.sizeQuantities.L + this.sizeQuantities.XL + this.sizeQuantities.XXL;
});

module.exports = mongoose.model('Product', productSchema);