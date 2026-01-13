const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadProduct } = require('../config/multer');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @route   POST /api/products/with-variants
// @desc    Add new product with color variants (Admin only)
// @access  Private/Admin
router.post('/with-variants', protect, authorize('admin'), uploadProduct.any(), async (req, res) => {
    try {
        const { name, price, category, description, colorVariants } = req.body;

        // Validate basic fields
        if (!name || !price || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, price, category, description'
            });
        }

        // Parse colorVariants if it's a string
        let variants;
        try {
            variants = typeof colorVariants === 'string' ? JSON.parse(colorVariants) : colorVariants;
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: 'Invalid color variants format'
            });
        }

        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one color variant is required'
            });
        }

        // Map uploaded files to color variants
        const processedVariants = variants.map((variant, index) => {
            // Find images for this variant
            const mainImage = req.files.find(f => f.fieldname === `mainImage_${index}`);
            const additionalImages = [
                req.files.find(f => f.fieldname === `additionalImage1_${index}`),
                req.files.find(f => f.fieldname === `additionalImage2_${index}`),
                req.files.find(f => f.fieldname === `additionalImage3_${index}`)
            ].filter(Boolean);

            if (!mainImage) {
                throw new Error(`Main image required for color variant ${variant.colorName}`);
            }

            return {
                color: variant.color,
                colorName: variant.colorName,
                colorHex: variant.colorHex,
                images: {
                    mainImage: 'uploads/products/' + mainImage.filename,
                    additionalImages: additionalImages.map(img => 'uploads/products/' + img.filename)
                },
                sizeQuantities: {
                    S: parseInt(variant.sizeS) || 0,
                    M: parseInt(variant.sizeM) || 0,
                    L: parseInt(variant.sizeL) || 0,
                    XL: parseInt(variant.sizeXL) || 0,
                    XXL: parseInt(variant.size2XL) || 0
                }
            };
        });

        // Create product with color variants
        const product = new Product({
            name,
            price: parseFloat(price),
            category: category.toLowerCase(),
            description,
            colorVariants: processedVariants,
            createdBy: req.user._id
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product with color variants added successfully',
            product
        });
    } catch (error) {
        console.error('Add Product with Variants Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   POST /api/products
// @desc    Add new product (Admin only) - Legacy format
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
            .select('name price category sizeQuantities description mainImage additionalImages colorVariants createdAt');

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

        // Delete images based on product type
        if (product.colorVariants && product.colorVariants.length > 0) {
            // Delete color variant images
            product.colorVariants.forEach(variant => {
                if (variant.images && variant.images.mainImage) {
                    const mainImagePath = path.join(__dirname, '..', variant.images.mainImage);
                    if (fs.existsSync(mainImagePath)) {
                        fs.unlinkSync(mainImagePath);
                    }
                }
                if (variant.images && variant.images.additionalImages) {
                    variant.images.additionalImages.forEach(imgPath => {
                        if (imgPath) {
                            const additionalImagePath = path.join(__dirname, '..', imgPath);
                            if (fs.existsSync(additionalImagePath)) {
                                fs.unlinkSync(additionalImagePath);
                            }
                        }
                    });
                }
            });
        } else {
            // Delete legacy images
            if (product.mainImage) {
                const mainImagePath = path.join(__dirname, '..', product.mainImage);
                if (fs.existsSync(mainImagePath)) {
                    fs.unlinkSync(mainImagePath);
                }
            }

            if (product.additionalImages) {
                if (product.additionalImages.image1) {
                    const additionalImage1Path = path.join(__dirname, '..', product.additionalImages.image1);
                    if (fs.existsSync(additionalImage1Path)) {
                        fs.unlinkSync(additionalImage1Path);
                    }
                }

                if (product.additionalImages.image2) {
                    const additionalImage2Path = path.join(__dirname, '..', product.additionalImages.image2);
                    if (fs.existsSync(additionalImage2Path)) {
                        fs.unlinkSync(additionalImage2Path);
                    }
                }

                if (product.additionalImages.image3) {
                    const additionalImage3Path = path.join(__dirname, '..', product.additionalImages.image3);
                    if (fs.existsSync(additionalImage3Path)) {
                        fs.unlinkSync(additionalImage3Path);
                    }
                }
            }
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

// @route   PUT /api/products/:id/with-variants
// @desc    Update product with color variants (Admin only)
// @access  Private/Admin
router.put('/:id/with-variants', protect, authorize('admin'), uploadProduct.any(), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const { name, price, category, description, colorVariants } = req.body;

        // Update basic fields
        if (name) product.name = name;
        if (price) product.price = parseFloat(price);
        if (category) product.category = category.toLowerCase();
        if (description) product.description = description;

        // Parse colorVariants if provided
        if (colorVariants) {
            let variants;
            try {
                variants = typeof colorVariants === 'string' ? JSON.parse(colorVariants) : colorVariants;
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid color variants format'
                });
            }

            // Process variants
            const processedVariants = variants.map((variant, index) => {
                // Check if there are new images for this variant
                const mainImage = req.files.find(f => f.fieldname === `mainImage_${index}`);
                const additionalImages = [
                    req.files.find(f => f.fieldname === `additionalImage1_${index}`),
                    req.files.find(f => f.fieldname === `additionalImage2_${index}`),
                    req.files.find(f => f.fieldname === `additionalImage3_${index}`)
                ].filter(Boolean);

                // Use existing variant images if no new ones uploaded
                const existingVariant = product.colorVariants && product.colorVariants[index];

                return {
                    color: variant.color,
                    colorName: variant.colorName,
                    colorHex: variant.colorHex,
                    images: {
                        mainImage: mainImage ? 
                            'uploads/products/' + mainImage.filename : 
                            (existingVariant && existingVariant.images ? existingVariant.images.mainImage : null),
                        additionalImages: additionalImages.length > 0 ? 
                            additionalImages.map(img => 'uploads/products/' + img.filename) :
                            (existingVariant && existingVariant.images ? existingVariant.images.additionalImages : [])
                    },
                    sizeQuantities: {
                        S: parseInt(variant.sizeS) || 0,
                        M: parseInt(variant.sizeM) || 0,
                        L: parseInt(variant.sizeL) || 0,
                        XL: parseInt(variant.sizeXL) || 0,
                        XXL: parseInt(variant.size2XL) || 0
                    }
                };
            });

            product.colorVariants = processedVariants;
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

module.exports = router;