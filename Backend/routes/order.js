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

        if (!deliveryFee && deliveryFee !== 0) {
            return res.status(400).json({
                success: false,
                message: 'Delivery fee is required'
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
            deliveryFee,
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
        if (order.userId.toString() !== userId.toString()) {
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
        if (order.userId.toString() !== userId.toString()) {
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
        const { status, limit = 50, skip = 0, search = '' } = req.query;

        let query = {};
        if (status && status !== 'all') {
            query.orderStatus = status;
        }

        // Add search functionality
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate('userId', 'name email');

        const total = await Order.countDocuments(query);

        // Get status counts
        const statusCounts = await Order.aggregate([
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            orders,
            total,
            page: Math.ceil(parseInt(skip) / parseInt(limit)) + 1,
            pages: Math.ceil(total / parseInt(limit)),
            statusCounts
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

// Update order status (admin only)
router.put('/admin/:orderId/status', protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, trackingNumber, estimatedDelivery } = req.body;

        const validStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.orderStatus = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

// Update delivery fee (admin only)
router.put('/admin/:orderId/delivery-fee', protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { deliveryFee } = req.body;

        if (deliveryFee === undefined || deliveryFee < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid delivery fee'
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const oldDeliveryFee = order.deliveryFee;
        order.deliveryFee = parseFloat(deliveryFee);
        order.totalAmount = order.subtotal + order.deliveryFee;

        await order.save();

        res.json({
            success: true,
            message: 'Delivery fee updated successfully',
            order,
            oldDeliveryFee
        });
    } catch (error) {
        console.error('Update delivery fee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating delivery fee',
            error: error.message
        });
    }
});

// Delete order (admin only)
router.delete('/admin/:orderId', protect, async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findByIdAndDelete(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: error.message
        });
    }
});

// Get order statistics (admin only)
router.get('/admin/statistics', protect, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'processing'] } });
        const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

        // Calculate total revenue (delivered orders only)
        const revenueResult = await Order.aggregate([
            { $match: { orderStatus: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            success: true,
            statistics: {
                totalOrders,
                pendingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue
            }
        });
    } catch (error) {
        console.error('Get order statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

module.exports = router;
