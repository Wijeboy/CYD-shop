const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

// Create new order
router.post('/place', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            firstName, lastName, email, phone,
            address, city, state, country, postalCode,
            items, subtotal, deliveryFee, totalAmount,
            paymentMethod, paymentStatus, cardLastFour
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !address || !city || !state || !country || !postalCode) {
            return res.status(400).json({
                success: false,
                message: 'Missing required shipping information'
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Payment method is required'
            });
        }

        // Create new order
        const newOrder = new Order({
            userId,
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            state,
            country,
            postalCode,
            items,
            subtotal,
            deliveryFee: deliveryFee || 350,
            totalAmount,
            paymentMethod,
            paymentStatus: paymentStatus || 'pending',
            cardLastFour: cardLastFour || null,
            orderStatus: 'placed'
        });

        // Save order
        await newOrder.save();

        // Clear user's cart
        await Cart.findOneAndDelete({ userId });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: newOrder
        });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error placing order',
            error: error.message
        });
    }
});

// Get user's orders
router.get('/user', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, limit = 10, skip = 0 } = req.query;

        let query = { userId };
        if (status) {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            total,
            page: Math.ceil(parseInt(skip) / parseInt(limit)) + 1,
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// Get single order
router.get('/:orderId', protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order belongs to the user
        if (order.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to this order'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

// Update order status (admin only - for future use)
router.put('/:orderId/status', protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus, trackingNumber } = req.body;

        if (!orderStatus) {
            return res.status(400).json({
                success: false,
                message: 'Order status is required'
            });
        }

        const validStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                orderStatus,
                trackingNumber: trackingNumber || order.trackingNumber
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order updated successfully',
            order
        });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order',
            error: error.message
        });
    }
});

// Cancel order
router.put('/:orderId/cancel', protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order belongs to the user
        if (order.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to this order'
            });
        }

        // Check if order can be cancelled
        if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.orderStatus}`
            });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling order',
            error: error.message
        });
    }
});

// Get all orders (admin only)
router.get('/admin/all', protect, async (req, res) => {
    try {
        const { status, limit = 10, skip = 0 } = req.query;

        let query = {};
        if (status) {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            total,
            page: Math.ceil(parseInt(skip) / parseInt(limit)) + 1,
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

module.exports = router;
