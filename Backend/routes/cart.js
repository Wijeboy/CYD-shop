const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        
        res.status(200).json({
            success: true,
            cart: {
                items: cart.items,
                subtotal: cart.subtotal,
                totalItems: cart.items.length
            }
        });
    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', protect, async (req, res) => {
    try {
        const { productId, selectedColor, selectedColorHex, selectedSize, quantity } = req.body;
        
        // Validate input
        if (!productId || !selectedColor || !selectedSize || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }
        
        // Get product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Get available quantity for selected color and size
        let availableQuantity = 0;
        let productImage = '';
        
        if (product.colorVariants && product.colorVariants.length > 0) {
            const colorVariant = product.colorVariants.find(v => v.colorName === selectedColor);
            if (!colorVariant) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected color not available'
                });
            }
            availableQuantity = colorVariant.sizeQuantities[selectedSize] || 0;
            productImage = colorVariant.images.mainImage;
        } else {
            availableQuantity = product.sizeQuantities[selectedSize] || 0;
            productImage = product.mainImage;
        }
        
        // Check if quantity available
        if (quantity > availableQuantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${availableQuantity} items available`,
                availableQuantity
            });
        }
        
        // Get or create cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        
        // Check if item already exists
        const existingItemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
        );
        
        if (existingItemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (newQuantity > availableQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${availableQuantity} items available`,
                    availableQuantity
                });
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                productName: product.name,
                productPrice: product.price,
                productImage: productImage,
                selectedColor,
                selectedColorHex: selectedColorHex || '#000000',
                selectedSize,
                quantity,
                availableQuantity
            });
        }
        
        await cart.save();
        
        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            cart: {
                items: cart.items,
                subtotal: cart.subtotal,
                totalItems: cart.items.length
            }
        });
    } catch (error) {
        console.error('Add to Cart Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/cart/update/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/update/:itemId', protect, async (req, res) => {
    try {
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }
        
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }
        
        // Check available quantity
        const product = await Product.findById(item.product);
        let availableQuantity = 0;
        
        if (product.colorVariants && product.colorVariants.length > 0) {
            const colorVariant = product.colorVariants.find(v => v.colorName === item.selectedColor);
            if (colorVariant) {
                availableQuantity = colorVariant.sizeQuantities[item.selectedSize] || 0;
            }
        } else {
            availableQuantity = product.sizeQuantities[item.selectedSize] || 0;
        }
        
        if (quantity > availableQuantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${availableQuantity} items available`,
                availableQuantity
            });
        }
        
        item.quantity = quantity;
        item.availableQuantity = availableQuantity;
        
        await cart.save();
        
        res.status(200).json({
            success: true,
            message: 'Cart updated',
            cart: {
                items: cart.items,
                subtotal: cart.subtotal,
                totalItems: cart.items.length
            }
        });
    } catch (error) {
        console.error('Update Cart Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:itemId', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        cart.items.pull(req.params.itemId);
        await cart.save();
        
        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            cart: {
                items: cart.items,
                subtotal: cart.subtotal,
                totalItems: cart.items.length
            }
        });
    } catch (error) {
        console.error('Remove from Cart Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        cart.items = [];
        await cart.save();
        
        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            cart: {
                items: [],
                subtotal: 0,
                totalItems: 0
            }
        });
    } catch (error) {
        console.error('Clear Cart Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;