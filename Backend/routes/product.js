const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadProduct } = require('../config/multer');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @route   POST /api/products
// @desc    Add new product (Admin only)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), uploadProduct.single('productImage'), [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isIn(['tops', 't-shirts', 'blouses', 'dresses', 'trousers', 'skirts', 'ethnic wear'])
        .withMessage('Please select a valid category'),
    body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
    body('description').trim().notEmpty().withMessage('Product description is required')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Check if image was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a product image'
            });
        }

        const { name, price, category, stockQuantity, description } = req.body;

        // Create product
        const product = new Product({
            name,
            price: parseFloat(price),
            category: category.toLowerCase(),
            stockQuantity: parseInt(stockQuantity),
            description,
            image: 'uploads/products/' + req.file.filename,
            createdBy: req.user._id
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            product: {
                id: product._id,
                name: product.name,
                price: product.price,
                category: product.category,
                stockQuantity: product.stockQuantity,
                description: product.description,
                image: product.image
            }
        });
    } catch (error) {
        console.error('Add Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/products
// @desc    Get all products (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search } = req.query;
        
        let filter = { isActive: true };

        // Category filter
        if (category) {
            const categories = category.split(',').map(cat => cat.toLowerCase());
            filter.category = { $in: categories };
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .select('name price category stockQuantity description image createdAt');

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Get Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), uploadProduct.single('productImage'), [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isIn(['tops', 't-shirts', 'blouses', 'dresses', 'trousers', 'skirts', 'ethnic wear'])
        .withMessage('Please select a valid category'),
    body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
    body('description').trim().notEmpty().withMessage('Product description is required')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const { name, price, category, stockQuantity, description } = req.body;

        // Update fields
        product.name = name;
        product.price = parseFloat(price);
        product.category = category.toLowerCase();
        product.stockQuantity = parseInt(stockQuantity);
        product.description = description;

        // Update image if new one uploaded
        if (req.file) {
            // Delete old image
            const oldImagePath = path.join(__dirname, '..', product.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            
            product.image = 'uploads/products/' + req.file.filename;
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product: {
                id: product._id,
                name: product.name,
                price: product.price,
                category: product.category,
                stockQuantity: product.stockQuantity,
                description: product.description,
                image: product.image
            }
        });
    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete product image
        const imagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Delete product from database
        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;