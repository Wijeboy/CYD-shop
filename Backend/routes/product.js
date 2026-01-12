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
router.post('/', protect, authorize('admin'), uploadProduct.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImage1', maxCount: 1 },
    { name: 'additionalImage2', maxCount: 1 },
    { name: 'additionalImage3', maxCount: 1 }
]), [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isIn(['tops', 't-shirts', 'blouses', 'dresses', 'trousers', 'skirts', 'ethnic wear'])
        .withMessage('Please select a valid category'),
    body('sizeS').isInt({ min: 0 }).withMessage('Size S quantity must be a non-negative integer'),
    body('sizeM').isInt({ min: 0 }).withMessage('Size M quantity must be a non-negative integer'),
    body('sizeL').isInt({ min: 0 }).withMessage('Size L quantity must be a non-negative integer'),
    body('sizeXL').isInt({ min: 0 }).withMessage('Size XL quantity must be a non-negative integer'),
    body('size2XL').isInt({ min: 0 }).withMessage('Size 2XL quantity must be a non-negative integer'),
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

        // Check if all images were uploaded
        if (!req.files || !req.files.mainImage || !req.files.additionalImage1 || 
            !req.files.additionalImage2 || !req.files.additionalImage3) {
            return res.status(400).json({
                success: false,
                message: 'Please upload main image and all 3 additional images'
            });
        }

        const { name, price, category, sizeS, sizeM, sizeL, sizeXL, size2XL, description } = req.body;

        // Create product
        const product = new Product({
            name,
            price: parseFloat(price),
            category: category.toLowerCase(),
            sizeQuantities: {
                S: parseInt(sizeS),
                M: parseInt(sizeM),
                L: parseInt(sizeL),
                XL: parseInt(sizeXL),
                XXL: parseInt(size2XL)
            },
            description,
            mainImage: 'uploads/products/' + req.files.mainImage[0].filename,
            additionalImages: {
                image1: 'uploads/products/' + req.files.additionalImage1[0].filename,
                image2: 'uploads/products/' + req.files.additionalImage2[0].filename,
                image3: 'uploads/products/' + req.files.additionalImage3[0].filename
            },
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
                sizeQuantities: product.sizeQuantities,
                description: product.description,
                mainImage: product.mainImage,
                additionalImages: product.additionalImages
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
            .select('name price category sizeQuantities description mainImage additionalImages createdAt');

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
router.put('/:id', protect, authorize('admin'), uploadProduct.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImage1', maxCount: 1 },
    { name: 'additionalImage2', maxCount: 1 },
    { name: 'additionalImage3', maxCount: 1 }
]), [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isIn(['tops', 't-shirts', 'blouses', 'dresses', 'trousers', 'skirts', 'ethnic wear'])
        .withMessage('Please select a valid category'),
    body('sizeS').isInt({ min: 0 }).withMessage('Size S quantity must be a non-negative integer'),
    body('sizeM').isInt({ min: 0 }).withMessage('Size M quantity must be a non-negative integer'),
    body('sizeL').isInt({ min: 0 }).withMessage('Size L quantity must be a non-negative integer'),
    body('sizeXL').isInt({ min: 0 }).withMessage('Size XL quantity must be a non-negative integer'),
    body('size2XL').isInt({ min: 0 }).withMessage('Size 2XL quantity must be a non-negative integer'),
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

        const { name, price, category, sizeS, sizeM, sizeL, sizeXL, size2XL, description } = req.body;

        // Update fields
        product.name = name;
        product.price = parseFloat(price);
        product.category = category.toLowerCase();
        product.sizeQuantities = {
            S: parseInt(sizeS),
            M: parseInt(sizeM),
            L: parseInt(sizeL),
            XL: parseInt(sizeXL),
            XXL: parseInt(size2XL)
        };
        product.description = description;

        // Update main image if new one uploaded
        if (req.files && req.files.mainImage) {
            // Delete old main image
            const oldImagePath = path.join(__dirname, '..', product.mainImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            product.mainImage = 'uploads/products/' + req.files.mainImage[0].filename;
        }

        // Update additional images if new ones uploaded
        if (req.files && req.files.additionalImage1) {
            const oldImagePath = path.join(__dirname, '..', product.additionalImages.image1);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            product.additionalImages.image1 = 'uploads/products/' + req.files.additionalImage1[0].filename;
        }

        if (req.files && req.files.additionalImage2) {
            const oldImagePath = path.join(__dirname, '..', product.additionalImages.image2);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            product.additionalImages.image2 = 'uploads/products/' + req.files.additionalImage2[0].filename;
        }

        if (req.files && req.files.additionalImage3) {
            const oldImagePath = path.join(__dirname, '..', product.additionalImages.image3);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            product.additionalImages.image3 = 'uploads/products/' + req.files.additionalImage3[0].filename;
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
                sizeQuantities: product.sizeQuantities,
                description: product.description,
                mainImage: product.mainImage,
                additionalImages: product.additionalImages
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

        // Delete main image
        const mainImagePath = path.join(__dirname, '..', product.mainImage);
        if (fs.existsSync(mainImagePath)) {
            fs.unlinkSync(mainImagePath);
        }

        // Delete additional images
        const additionalImage1Path = path.join(__dirname, '..', product.additionalImages.image1);
        if (fs.existsSync(additionalImage1Path)) {
            fs.unlinkSync(additionalImage1Path);
        }

        const additionalImage2Path = path.join(__dirname, '..', product.additionalImages.image2);
        if (fs.existsSync(additionalImage2Path)) {
            fs.unlinkSync(additionalImage2Path);
        }

        const additionalImage3Path = path.join(__dirname, '..', product.additionalImages.image3);
        if (fs.existsSync(additionalImage3Path)) {
            fs.unlinkSync(additionalImage3Path);
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