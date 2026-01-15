// API Configuration
const API_URL = 'http://localhost:5001/api';
const BACKEND_URL = 'http://localhost:5001';

// Global state
let currentPage = 1;
let currentStatus = 'all';
let currentSearch = '';
let allOrders = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
    loadOrders();
    
    // Add enter key listener for search
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchOrders();
        }
    });
});

// Load statistics
async function loadStatistics() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/orders/admin/statistics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch statistics');

        const data = await response.json();
        const stats = data.statistics;

        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('pendingOrders').textContent = stats.pendingOrders;
        document.getElementById('shippedOrders').textContent = stats.shippedOrders;
        document.getElementById('deliveredOrders').textContent = stats.deliveredOrders;
        document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue.toFixed(2)}`;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load orders
async function loadOrders(page = 1) {
    try {
        const token = localStorage.getItem('token');
        const skip = (page - 1) * 50;
        
        let url = `${API_URL}/orders/admin/all?limit=50&skip=${skip}`;
        if (currentStatus !== 'all') {
            url += `&status=${currentStatus}`;
        }
        if (currentSearch) {
            url += `&search=${encodeURIComponent(currentSearch)}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch orders');

        const data = await response.json();
        allOrders = data.orders;
        currentPage = page;

        displayOrders(allOrders);
        displayPagination(data.pages, page);
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersTableBody').innerHTML = `
            <tr><td colspan="8" class="error-cell">Failed to load orders. Please try again.</td></tr>
        `;
    }
}

// Display orders in table
function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="8" class="empty-cell">No orders found</td></tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const orderId = order._id.substring(0, 8).toUpperCase();
        const customerName = `${order.firstName} ${order.lastName}`;
        const itemCount = order.items.length;
        const total = `$${order.totalAmount.toFixed(2)}`;
        const statusClass = order.orderStatus.toLowerCase();

        return `
            <tr>
                <td><strong>#${orderId}</strong></td>
                <td>
                    <div class="customer-info">
                        <strong>${customerName}</strong>
                        <small>${order.email}</small>
                    </div>
                </td>
                <td>${orderDate}</td>
                <td>${itemCount} item${itemCount > 1 ? 's' : ''}</td>
                <td><strong>${total}</strong></td>
                <td><span class="status-badge ${statusClass}">${order.orderStatus}</span></td>
                <td><span class="payment-badge ${order.paymentMethod}">${order.paymentMethod.toUpperCase()}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="viewOrderDetails('${order._id}')" title="View Details">👁️</button>
                        <button class="btn-icon" onclick="openStatusModal('${order._id}')" title="Update Status">📝</button>
                        <button class="btn-icon" onclick="openDeliveryFeeModal('${order._id}')" title="Update Delivery Fee">💰</button>
                        <button class="btn-icon danger" onclick="deleteOrder('${order._id}')" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Display pagination
function displayPagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '<div class="pagination-controls">';
    
    // Previous button
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="loadOrders(${currentPage - 1})">Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="page-btn active">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn" onclick="loadOrders(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span class="page-dots">...</span>`;
        }
    }

    // Next button
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="loadOrders(${currentPage + 1})">Next</button>`;
    }

    html += '</div>';
    pagination.innerHTML = html;
}

// Filter by status
function filterByStatus(status) {
    currentStatus = status;
    currentPage = 1;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-status') === status) {
            tab.classList.add('active');
        }
    });
    
    loadOrders(1);
}

// Search orders
function searchOrders() {
    currentSearch = document.getElementById('searchInput').value.trim();
    currentPage = 1;
    loadOrders(1);
}

// Refresh orders
function refreshOrders() {
    loadStatistics();
    loadOrders(currentPage);
}

// View order details
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (!order) return;

    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const modalBody = document.getElementById('orderModalBody');
    modalBody.innerHTML = `
        <div class="order-details">
            <div class="details-section">
                <h3>Order Information</h3>
                <div class="info-grid">
                    <div><strong>Order ID:</strong> #${order._id.substring(0, 8).toUpperCase()}</div>
                    <div><strong>Date:</strong> ${orderDate}</div>
                    <div><strong>Status:</strong> <span class="status-badge ${order.orderStatus}">${order.orderStatus}</span></div>
                    <div><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</div>
                    <div><strong>Payment Status:</strong> ${order.paymentStatus}</div>
                    ${order.trackingNumber ? `<div><strong>Tracking:</strong> ${order.trackingNumber}</div>` : ''}
                </div>
            </div>

            <div class="details-section">
                <h3>Customer Information</h3>
                <div class="info-grid">
                    <div><strong>Name:</strong> ${order.firstName} ${order.lastName}</div>
                    <div><strong>Email:</strong> ${order.email}</div>
                    <div><strong>Phone:</strong> ${order.phone}</div>
                </div>
            </div>

            <div class="details-section">
                <h3>Shipping Address</h3>
                <p>${order.address}</p>
                <p>${order.city}, ${order.state} ${order.postalCode}</p>
                <p>${order.country}</p>
            </div>

            <div class="details-section">
                <h3>Order Items</h3>
                <div class="items-list">
                    ${order.items.map(item => {
                        let imageUrl = item.productImage || '';
                        if (imageUrl.startsWith('uploads/')) {
                            imageUrl = `${BACKEND_URL}/${imageUrl}`;
                        }
                        const itemTotal = (item.productPrice * item.quantity).toFixed(2);
                        return `
                            <div class="order-item-row">
                                <img src="${imageUrl}" alt="${item.productName}" class="item-thumb">
                                <div class="item-details">
                                    <strong>${item.productName}</strong>
                                    <small>Color: ${item.selectedColor} | Size: ${item.selectedSize}</small>
                                </div>
                                <div class="item-price">
                                    <span>$${item.productPrice} × ${item.quantity}</span>
                                    <strong>$${itemTotal}</strong>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="details-section">
                <h3>Order Summary</h3>
                <div class="order-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>$${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Delivery Fee:</span>
                        <span>$${order.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <strong>Total:</strong>
                        <strong>$${order.totalAmount.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modalTitle').textContent = `Order #${order._id.substring(0, 8).toUpperCase()}`;
    openModal('orderModal');
}

// Open status update modal
function openStatusModal(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (!order) return;

    document.getElementById('statusOrderId').value = orderId;
    document.getElementById('orderStatus').value = order.orderStatus;
    document.getElementById('trackingNumber').value = order.trackingNumber || '';
    document.getElementById('estimatedDelivery').value = order.estimatedDelivery ? 
        new Date(order.estimatedDelivery).toISOString().split('T')[0] : '';

    openModal('statusModal');
}

// Update order status
async function updateOrderStatus(event) {
    event.preventDefault();

    const orderId = document.getElementById('statusOrderId').value;
    const status = document.getElementById('orderStatus').value;
    const trackingNumber = document.getElementById('trackingNumber').value;
    const estimatedDelivery = document.getElementById('estimatedDelivery').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/orders/admin/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, trackingNumber, estimatedDelivery })
        });

        if (!response.ok) throw new Error('Failed to update status');

        alert('Order status updated successfully!');
        closeModal('statusModal');
        refreshOrders();
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update order status. Please try again.');
    }
}

// Open delivery fee modal
function openDeliveryFeeModal(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (!order) return;

    document.getElementById('feeOrderId').value = orderId;
    document.getElementById('currentDeliveryFee').value = `$${order.deliveryFee.toFixed(2)}`;
    document.getElementById('newDeliveryFee').value = order.deliveryFee;
    
    // Calculate new total on input
    const newFeeInput = document.getElementById('newDeliveryFee');
    newFeeInput.oninput = () => {
        const newFee = parseFloat(newFeeInput.value) || 0;
        const newTotal = order.subtotal + newFee;
        document.getElementById('newTotal').value = `$${newTotal.toFixed(2)}`;
    };
    
    document.getElementById('newTotal').value = `$${order.totalAmount.toFixed(2)}`;

    openModal('deliveryFeeModal');
}

// Update delivery fee
async function updateDeliveryFee(event) {
    event.preventDefault();

    const orderId = document.getElementById('feeOrderId').value;
    const deliveryFee = parseFloat(document.getElementById('newDeliveryFee').value);

    if (isNaN(deliveryFee) || deliveryFee < 0) {
        alert('Please enter a valid delivery fee');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/orders/admin/${orderId}/delivery-fee`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deliveryFee })
        });

        if (!response.ok) throw new Error('Failed to update delivery fee');

        alert('Delivery fee updated successfully!');
        closeModal('deliveryFeeModal');
        refreshOrders();
    } catch (error) {
        console.error('Error updating delivery fee:', error);
        alert('Failed to update delivery fee. Please try again.');
    }
}

// Delete order
async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/orders/admin/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete order');

        alert('Order deleted successfully!');
        refreshOrders();
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order. Please try again.');
    }
}

// Export orders to CSV
function exportOrders() {
    if (allOrders.length === 0) {
        alert('No orders to export');
        return;
    }

    let csv = 'Order ID,Customer Name,Email,Phone,Date,Status,Payment Method,Items,Subtotal,Delivery Fee,Total\n';
    
    allOrders.forEach(order => {
        const orderId = order._id.substring(0, 8).toUpperCase();
        const customerName = `${order.firstName} ${order.lastName}`;
        const date = new Date(order.createdAt).toLocaleDateString();
        const itemCount = order.items.length;
        
        csv += `#${orderId},"${customerName}","${order.email}","${order.phone}","${date}",${order.orderStatus},${order.paymentMethod},${itemCount},$${order.subtotal.toFixed(2)},$${order.deliveryFee.toFixed(2)},$${order.totalAmount.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
