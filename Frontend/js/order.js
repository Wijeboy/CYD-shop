// API Configuration
const API_URL = 'http://localhost:5001/api';
const BACKEND_URL = 'http://localhost:5001';

// Global state
let currentFilter = 'all';
let orders = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupFilterTabs();
    loadOrders();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/signin.html';
        return;
    }
}

// Setup filter tabs
function setupFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Get filter value
            currentFilter = tab.getAttribute('data-filter');
            
            // Filter and display orders
            filterOrders();
        });
    });
}

// Load orders from API
async function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '<div class="loading-message">Loading your orders...</div>';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/orders/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        orders = data.orders || [];
        
        // Display orders
        displayOrders(orders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersList.innerHTML = '<div class="loading-message">Failed to load orders. Please try again.</div>';
    }
}

// Filter orders based on current filter
function filterOrders() {
    let filteredOrders = orders;
    
    if (currentFilter !== 'all') {
        filteredOrders = orders.filter(order => {
            // Map filter to order status
            const statusMapping = {
                'processing': ['placed', 'confirmed', 'processing'],
                'shipped': ['shipped'],
                'delivered': ['delivered'],
                'cancelled': ['cancelled']
            };
            
            return statusMapping[currentFilter]?.includes(order.orderStatus.toLowerCase());
        });
    }
    
    displayOrders(filteredOrders);
}

// Display orders
function displayOrders(ordersToDisplay) {
    const ordersList = document.getElementById('ordersList');
    const emptyOrders = document.querySelector('.empty-orders');
    
    if (!ordersToDisplay || ordersToDisplay.length === 0) {
        ordersList.style.display = 'none';
        emptyOrders.style.display = 'block';
        return;
    }
    
    ordersList.style.display = 'flex';
    emptyOrders.style.display = 'none';
    
    ordersList.innerHTML = ordersToDisplay.map(order => createOrderCard(order)).join('');
    
    // Attach event listeners to action buttons
    attachActionListeners();
}

// Create order card HTML
function createOrderCard(order) {
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const totalAmount = order.totalAmount ? `$${order.totalAmount.toFixed(2)}` : '$0.00';
    
    const statusClass = order.orderStatus.toLowerCase();
    const canCancel = ['placed', 'confirmed', 'processing'].includes(order.orderStatus.toLowerCase());
    
    return `
        <div class="order-card" data-order-id="${order._id}">
            <div class="order-header">
                <div class="order-info">
                    <div class="order-info-item">
                        <span class="info-label">Order Placed</span>
                        <span class="info-value">${orderDate}</span>
                    </div>
                    <div class="order-info-item">
                        <span class="info-label">Order Number</span>
                        <span class="info-value">#${order._id.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <div class="order-info-item">
                        <span class="info-label">Total</span>
                        <span class="info-value">${totalAmount}</span>
                    </div>
                </div>
                <div class="order-status">
                    <span class="status-badge ${statusClass}">${order.orderStatus}</span>
                </div>
            </div>
            
            <div class="order-items">
                ${order.items.map(item => createOrderItem(item)).join('')}
            </div>
            
            <div class="order-footer">
                <div class="order-total">
                    <span class="total-label">Order Total</span>
                    <span class="total-value">${totalAmount}</span>
                </div>
                <div class="order-actions">
                    <button class="action-btn primary view-details-btn" data-order-id="${order._id}">
                        View Details
                    </button>
                    ${canCancel ? `
                        <button class="action-btn cancel-order-btn" data-order-id="${order._id}">
                            Cancel Order
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Create order item HTML
function createOrderItem(item) {
    // Handle image URL - prepend backend URL if it starts with 'uploads/'
    let imageUrl = item.productImage || '';
    
    if (!imageUrl) {
        imageUrl = 'https://via.placeholder.com/80x80?text=No+Image';
    } else if (imageUrl.startsWith('uploads/')) {
        imageUrl = `${BACKEND_URL}/${imageUrl}`;
    }
    
    const productName = item.productName || 'Product';
    const price = item.productPrice ? `$${item.productPrice.toFixed(2)}` : '$0.00';
    const colorName = item.selectedColor || 'N/A';
    const size = item.selectedSize || 'N/A';
    const quantity = item.quantity || 1;
    
    // Generate color dot style
    let colorDotStyle = 'background-color: #ccc;';
    if (colorName !== 'N/A') {
        // Try to use the color name as a CSS color
        colorDotStyle = `background-color: ${colorName.toLowerCase()};`;
    }
    
    return `
        <div class="order-item">
            <img src="${imageUrl}" 
                 alt="${productName}" 
                 class="item-image" 
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/80x80?text=No+Image';">
            <div class="item-details">
                <div class="item-name">${productName}</div>
                <div class="item-attributes">
                    <div class="item-attribute">
                        <span class="color-dot" style="${colorDotStyle}"></span>
                        <span>Color: ${colorName}</span>
                    </div>
                    <div class="item-attribute">
                        <span>Size: ${size}</span>
                    </div>
                </div>
            </div>
            <div class="item-price">
                <div class="price-value">${price}</div>
                <div class="item-quantity">Qty: ${quantity}</div>
            </div>
        </div>
    `;
}

// Attach event listeners to action buttons
function attachActionListeners() {
    // View Details buttons
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    viewDetailsButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.getAttribute('data-order-id');
            viewOrderDetails(orderId);
        });
    });
    
    // Cancel Order buttons
    const cancelButtons = document.querySelectorAll('.cancel-order-btn');
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.getAttribute('data-order-id');
            cancelOrder(orderId);
        });
    });
}

// View order details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o._id === orderId);
    if (!order) {
        alert('Order not found');
        return;
    }
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const orderNumber = order._id.substring(0, 8).toUpperCase();
    const statusClass = order.orderStatus.toLowerCase();
    
    // Build the modal content
    let modalContent = `
        <!-- Order Status & Info -->
        <div class="modal-section">
            <div class="modal-info-grid">
                <div class="modal-info-item">
                    <span class="modal-info-label">Order Number</span>
                    <span class="modal-info-value">#${orderNumber}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Order Date</span>
                    <span class="modal-info-value">${orderDate}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Status</span>
                    <span class="status-badge ${statusClass}">${order.orderStatus}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Payment Method</span>
                    <span class="modal-info-value">${order.paymentMethod.toUpperCase()}</span>
                </div>
            </div>
        </div>

        <!-- Shipping Address -->
        <div class="modal-section">
            <h3 class="modal-section-title">Shipping Address</h3>
            <div class="modal-address-box">
                <p><strong>${order.firstName} ${order.lastName}</strong></p>
                <p>${order.address}</p>
                <p>${order.city}, ${order.state} ${order.postalCode}</p>
                <p>${order.country}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Email:</strong> ${order.email}</p>
            </div>
        </div>

        <!-- Order Items -->
        <div class="modal-section">
            <h3 class="modal-section-title">Order Items</h3>
            <div class="modal-items-list">
                ${order.items.map(item => {
                    let imageUrl = item.productImage || '';
                    if (!imageUrl) {
                        imageUrl = 'https://via.placeholder.com/80x80?text=No+Image';
                    } else if (imageUrl.startsWith('uploads/')) {
                        imageUrl = `${BACKEND_URL}/${imageUrl}`;
                    }
                    
                    const price = item.productPrice ? `$${item.productPrice.toFixed(2)}` : '$0.00';
                    const itemTotal = item.productPrice && item.quantity 
                        ? `$${(item.productPrice * item.quantity).toFixed(2)}` 
                        : '$0.00';
                    
                    return `
                        <div class="modal-item">
                            <img src="${imageUrl}" alt="${item.productName}" class="modal-item-image">
                            <div class="modal-item-details">
                                <div class="modal-item-name">${item.productName}</div>
                                <div class="modal-item-attributes">
                                    ${item.selectedColor ? `<span>Color: ${item.selectedColor}</span>` : ''}
                                    ${item.selectedSize ? `<span>Size: ${item.selectedSize}</span>` : ''}
                                </div>
                            </div>
                            <div class="modal-item-price">
                                <div class="modal-item-price-value">${itemTotal}</div>
                                <div class="modal-item-qty">${price} × ${item.quantity}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- Order Summary -->
        <div class="modal-section">
            <h3 class="modal-section-title">Order Summary</h3>
            <div class="modal-summary">
                <div class="modal-summary-row">
                    <span class="modal-summary-label">Subtotal</span>
                    <span class="modal-summary-value">$${order.subtotal.toFixed(2)}</span>
                </div>
                <div class="modal-summary-row">
                    <span class="modal-summary-label">Delivery Fee</span>
                    <span class="modal-summary-value">$${order.deliveryFee.toFixed(2)}</span>
                </div>
                <div class="modal-summary-row total">
                    <span class="modal-summary-label">Total Amount</span>
                    <span class="modal-summary-value">$${order.totalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    
    // Update modal content
    document.getElementById('modalOrderNumber').textContent = `Order #${orderNumber}`;
    document.getElementById('modalBody').innerHTML = modalContent;
    
    // Show modal
    document.getElementById('orderDetailsModal').style.display = 'block';
}

// Close order modal
function closeOrderModal() {
    document.getElementById('orderDetailsModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('orderDetailsModal');
    if (event.target === modal) {
        closeOrderModal();
    }
}

// Cancel order
async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to cancel order');
        }
        
        const data = await response.json();
        
        // Show success message
        alert('Order cancelled successfully');
        
        // Reload orders
        await loadOrders();
        
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert(error.message || 'Failed to cancel order. Please try again.');
    }
}

// Handle logout
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        window.location.href = '/signin.html';
    });
}
