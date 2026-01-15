// Payment/Checkout Payment Page JavaScript
const API_URL = 'http://localhost:5001/api';

let checkoutData = null;
let paymentMethod = 'cod'; // Default to Cash on Delivery

// Load payment page data
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load checkout data from localStorage
        const savedCheckoutData = localStorage.getItem('checkoutData');
        if (!savedCheckoutData) {
            alert('Checkout information not found. Please complete checkout first.');
            window.location.href = 'checkout.html';
            return;
        }
        
        checkoutData = JSON.parse(savedCheckoutData);
        displayOrderSummary();
        setupPaymentMethodToggle();
        setupFormHandlers();
        
    } catch (error) {
        console.error('Error loading payment page:', error);
        alert('Error loading payment information. Please try again.');
        window.location.href = 'checkout.html';
    }
});

// Display order summary
function displayOrderSummary() {
    const summaryContainer = document.querySelector('.payment-summary');
    
    if (!summaryContainer) return;
    
    const subtotal = checkoutData.subtotal || 0;
    const deliveryFee = checkoutData.deliveryFee || 350;
    const total = checkoutData.orderTotal || (subtotal + deliveryFee);
    
    let summaryHTML = `
        <div class="order-review">
            <h3>Order Review</h3>
            
            <div class="items-list">
    `;
    
    if (checkoutData.cartItems && checkoutData.cartItems.length > 0) {
        checkoutData.cartItems.forEach(item => {
            summaryHTML += `
                <div class="item-row">
                    <span class="item-name">${item.productName}</span>
                    <span class="item-qty">x${item.quantity}</span>
                    <span class="item-price">Rs ${(item.productPrice * item.quantity).toFixed(2)}</span>
                </div>
            `;
        });
    }
    
    summaryHTML += `
            </div>
            
            <div class="billing-address">
                <h4>Shipping To:</h4>
                <p>
                    ${checkoutData.firstName} ${checkoutData.lastName}<br>
                    ${checkoutData.address}<br>
                    ${checkoutData.city}, ${checkoutData.state} ${checkoutData.postalCode}<br>
                    ${checkoutData.country}
                </p>
            </div>
            
            <div class="price-breakdown">
                <div class="price-row">
                    <span>Subtotal</span>
                    <span>Rs ${subtotal.toFixed(2)}</span>
                </div>
                <div class="price-row">
                    <span>Delivery Fee</span>
                    <span>Rs ${deliveryFee.toFixed(2)}</span>
                </div>
                <div class="price-row total">
                    <span><strong>Total Amount</strong></span>
                    <span><strong>Rs ${total.toFixed(2)}</strong></span>
                </div>
            </div>
        </div>
    `;
    
    summaryContainer.innerHTML = summaryHTML;
}

// Setup payment method toggle
function setupPaymentMethodToggle() {
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    const cardFormSection = document.getElementById('cardFormSection');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function(e) {
            paymentMethod = e.target.value;
            
            // Show/hide card form based on selection
            if (cardFormSection) {
                if (paymentMethod === 'card') {
                    cardFormSection.style.display = 'block';
                    // Make card fields required
                    document.querySelectorAll('#cardFormSection input').forEach(input => {
                        input.required = true;
                    });
                } else {
                    cardFormSection.style.display = 'none';
                    // Remove required attribute
                    document.querySelectorAll('#cardFormSection input').forEach(input => {
                        input.required = false;
                    });
                }
            }
        });
    });
}

// Setup form handlers
function setupFormHandlers() {
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value;
        });
    }
    
    // CVV formatting
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '').slice(0, 3);
            e.target.value = value;
        });
    }
    
    // Expiry formatting
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // Form submission
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
}

// Handle payment submission and place order
async function handlePaymentSubmit(e) {
    e.preventDefault();
    
    try {
        // Validate payment method
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }
        
        // If card payment, validate card details
        if (paymentMethod === 'card') {
            if (!validateCardDetails()) {
                return;
            }
        }
        
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        // Place order
        const orderData = {
            firstName: checkoutData.firstName,
            lastName: checkoutData.lastName,
            email: checkoutData.email,
            phone: checkoutData.phone,
            address: checkoutData.address,
            city: checkoutData.city,
            state: checkoutData.state,
            country: checkoutData.country,
            postalCode: checkoutData.postalCode,
            items: checkoutData.cartItems,
            subtotal: checkoutData.subtotal,
            deliveryFee: checkoutData.deliveryFee,
            totalAmount: checkoutData.orderTotal,
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === 'card' ? 'completed' : 'pending',
            orderStatus: 'placed'
        };
        
        // Add card details if card payment
        if (paymentMethod === 'card') {
            orderData.cardLastFour = document.getElementById('cardNumber').value.slice(-4);
        }
        
        // Place order via API
        const response = await fetch(`${API_URL}/orders/place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Clear checkout data
            localStorage.removeItem('checkoutData');
            
            // Clear cart
            await clearCart();
            
            // Show success message
            showSuccessModal(result.order);
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'order.html?orderId=' + result.order._id;
            }, 3000);
        } else {
            alert('Error placing order: ' + result.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('Error processing payment. Please try again.');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Order';
    }
}

// Validate card details
function validateCardDetails() {
    const cardNumber = document.getElementById('cardNumber').value;
    const cvv = document.getElementById('cvv').value;
    const expiry = document.getElementById('expiry').value;
    const nameOnCard = document.getElementById('nameOnCard').value;
    
    // Validate card number
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 16) {
        alert('Please enter a valid card number (13-16 digits)');
        return false;
    }
    
    // Validate CVV
    if (!cvv || cvv.length !== 3) {
        alert('Please enter a valid CVV (3 digits)');
        return false;
    }
    
    // Validate expiry
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        alert('Please enter expiry in MM/YY format');
        return false;
    }
    
    // Validate name on card
    if (!nameOnCard || nameOnCard.trim().length < 3) {
        alert('Please enter name on card');
        return false;
    }
    
    return true;
}

// Clear cart after order placement
async function clearCart() {
    try {
        const token = getAuthToken();
        await fetch(`${API_URL}/cart/clear`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

// Show success modal
function showSuccessModal(order) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="success-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p>Order ID: <strong>${order._id}</strong></p>
            <p>Total Amount: <strong>Rs ${order.totalAmount.toFixed(2)}</strong></p>
            <p>Payment Method: <strong>${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</strong></p>
            <p style="font-size: 14px; color: #666; margin-top: 15px;">
                Redirecting to orders page...
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles
    const styles = `
        .success-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        
        .success-modal .modal-content {
            background: white;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        
        .success-icon {
            width: 60px;
            height: 60px;
            background: #4CAF50;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            margin: 0 auto 20px;
        }
        
        .success-modal h2 {
            color: #000;
            margin: 15px 0;
            font-size: 20px;
        }
        
        .success-modal p {
            color: #333;
            margin: 10px 0;
            font-size: 14px;
        }
    `;
    
    if (!document.querySelector('style[data-success-modal]')) {
        const styleElement = document.createElement('style');
        styleElement.setAttribute('data-success-modal', 'true');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
}
