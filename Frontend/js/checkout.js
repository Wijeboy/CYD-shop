// Checkout Page JavaScript
const API_URL = 'http://localhost:5001/api';
const DELIVERY_FEE = 350;

let cartData = null;
let orderTotal = 0;

// Load checkout data on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load user data
        const user = getAuthUser();
        if (user && user.email) {
            document.getElementById('email').value = user.email;
        }
        
        // Load cart to show summary
        await loadCartSummary();
        
        // Populate user details if available
        if (user) {
            document.getElementById('firstName').value = user.name.split(' ')[0] || '';
            if (user.phone) document.getElementById('phone').value = user.phone;
            if (user.country) document.getElementById('country').value = user.country.toLowerCase();
            if (user.address) document.getElementById('line1').value = user.address;
        }
        
        // Handle form submission
        document.getElementById('checkoutForm').addEventListener('submit', handleCheckoutSubmit);
    } catch (error) {
        console.error('Error loading checkout:', error);
    }
});

// Load cart summary
async function loadCartSummary() {
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.cart) {
            cartData = result.cart;
            displayOrderSummary();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Display order summary in checkout page
function displayOrderSummary() {
    const summaryContainer = document.querySelector('.checkout-summary');
    
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        // Show empty cart message
        if (summaryContainer) {
            summaryContainer.innerHTML = '<p>Your cart is empty. <a href="product-listing.html">Continue shopping</a></p>';
        }
        return;
    }
    
    // Calculate totals
    const subtotal = cartData.subtotal || 0;
    const deliveryFee = DELIVERY_FEE;
    const total = subtotal + deliveryFee;
    
    orderTotal = total;
    
    // Create summary HTML
    let summaryHTML = `
        <div class="order-summary">
            <h3>Order Summary</h3>
            <div class="summary-items">
    `;
    
    cartData.items.forEach(item => {
        summaryHTML += `
            <div class="summary-item">
                <div class="item-info">
                    <span class="item-name">${item.productName}</span>
                    <span class="item-qty">x${item.quantity}</span>
                </div>
                <span class="item-price">Rs ${(item.productPrice * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });
    
    summaryHTML += `
            </div>
            <div class="summary-totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>Rs ${subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Delivery Fee:</span>
                    <span>Rs ${deliveryFee.toFixed(2)}</span>
                </div>
                <div class="total-row grand-total">
                    <span>Total:</span>
                    <span>Rs ${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    
    if (summaryContainer) {
        summaryContainer.innerHTML = summaryHTML;
    }
}

// Handle checkout form submission
async function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!e.target.checkValidity()) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Collect form data
    const checkoutData = {
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        country: document.getElementById('country').value,
        state: document.getElementById('state').value,
        address: document.getElementById('line1').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        cartItems: cartData.items,
        subtotal: cartData.subtotal,
        deliveryFee: DELIVERY_FEE,
        orderTotal: orderTotal
    };
    
    // Save to localStorage for payment page
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    // Redirect to payment page
    window.location.href = 'checkout-payment.html';
}
