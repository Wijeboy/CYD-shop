// API Base URL
const API_URL = 'http://localhost:5001/api';

const SHIPPING_COST = 300;
let cartData = null;
let stockIssues = [];

// Load cart on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadCart();
    
    // Continue button
    const continueBtn = document.getElementById('continueBtn');
    continueBtn.addEventListener('click', handleContinueToCheckout);
});

// Load cart from API
async function loadCart() {
    const token = getAuthToken();
    
    if (!token) {
        window.location.href = 'signin.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to load cart');
        }
        
        cartData = result.cart;
        displayCart(cartData);
    } catch (error) {
        console.error('Load cart error:', error);
        document.getElementById('cartItemsGrid').innerHTML = 
            '<div class="loading-message">Failed to load cart. Please refresh the page.</div>';
    }
}

// Display cart items
function displayCart(cart) {
    const cartItemsGrid = document.getElementById('cartItemsGrid');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    
    if (!cart.items || cart.items.length === 0) {
        cartItemsGrid.style.display = 'none';
        emptyCartMessage.style.display = 'block';
        updateOrderSummary(0);
        return;
    }
    
    cartItemsGrid.style.display = 'grid';
    emptyCartMessage.style.display = 'none';
    cartItemsGrid.innerHTML = '';
    stockIssues = [];
    
    cart.items.forEach((item, index) => {
        const itemCard = createCartItemCard(item, index);
        cartItemsGrid.appendChild(itemCard);
    });
    
    updateOrderSummary(cart.subtotal);
    validateCartStock();
}

// Create cart item card
function createCartItemCard(item, index) {
    const card = document.createElement('div');
    card.className = 'cart-item-card';
    card.dataset.itemId = item._id;
    
    const imageUrl = `http://localhost:5001/${item.productImage}`;
    
    // Check stock availability
    const hasStockIssue = item.quantity > item.availableQuantity;
    if (hasStockIssue) {
        stockIssues.push({
            itemId: item._id,
            name: item.productName,
            available: item.availableQuantity
        });
    }
    
    card.innerHTML = `
        <button class="delete-btn" onclick="removeItem('${item._id}')" title="Remove from cart">
            ×
        </button>
        
        <div class="item-image-container">
            <img src="${imageUrl}" alt="${item.productName}" class="item-image" 
                 onerror="this.src='User panel images/icons/upload-placeholder.png'">
        </div>
        
        <div class="item-details">
            <h3 class="item-name">${item.productName}</h3>
            <p class="item-price">Rs ${item.productPrice.toFixed(2)}</p>
            
            <div class="item-options">
                <div class="option-row">
                    <span class="option-label">Color:</span>
                    <div class="color-display" style="background-color: ${item.selectedColorHex}; ${
                        item.selectedColorHex === '#FFFFFF' ? 'border: 2px solid #ddd;' : ''
                    }" title="${item.selectedColor}"></div>
                    <span>${item.selectedColor}</span>
                </div>
                
                <div class="option-row">
                    <span class="option-label">Size:</span>
                    <span class="size-display">${item.selectedSize === 'XXL' ? '2XL' : item.selectedSize}</span>
                </div>
                
                <div class="option-row">
                    <span class="option-label">Qty:</span>
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="updateQuantity('${item._id}', ${item.quantity + 1})" 
                                ${item.quantity >= item.availableQuantity ? 'disabled' : ''}>
                            +
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item._id}', ${item.quantity - 1})" 
                                ${item.quantity <= 1 ? 'disabled' : ''}>
                            −
                        </button>
                    </div>
                </div>
                
                ${hasStockIssue ? `
                    <div class="stock-message">Only ${item.availableQuantity} available</div>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Update order summary
function updateOrderSummary(subtotal) {
    const subtotalAmount = document.getElementById('subtotalAmount');
    const totalAmount = document.getElementById('totalAmount');
    const continueBtn = document.getElementById('continueBtn');
    
    subtotalAmount.textContent = `Rs ${subtotal.toFixed(2)}`;
    
    const total = subtotal + SHIPPING_COST;
    totalAmount.textContent = `Rs ${total.toFixed(2)}`;
    
    // Enable/disable continue button based on cart items and stock
    if (subtotal > 0 && stockIssues.length === 0) {
        continueBtn.disabled = false;
    } else {
        continueBtn.disabled = true;
    }
}

// Validate cart stock and show warnings
function validateCartStock() {
    const stockWarning = document.getElementById('stockWarning');
    const stockWarningText = document.getElementById('stockWarningText');
    const continueBtn = document.getElementById('continueBtn');
    
    if (stockIssues.length > 0) {
        const itemNames = stockIssues.map(issue => 
            `${issue.name} (${issue.available} available)`
        ).join(', ');
        
        stockWarningText.textContent = `Please adjust quantities: ${itemNames}`;
        stockWarning.style.display = 'flex';
        continueBtn.disabled = true;
    } else {
        stockWarning.style.display = 'none';
        if (cartData && cartData.items && cartData.items.length > 0) {
            continueBtn.disabled = false;
        }
    }
}

// Update item quantity
async function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return;
    
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/cart/update/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: newQuantity })
        });
        
        const result = await response.json();
        
        if (result.success) {
            cartData = result.cart;
            displayCart(cartData);
        } else {
            alert(result.message || 'Failed to update quantity');
            if (result.availableQuantity !== undefined) {
                await loadCart(); // Reload to get latest stock info
            }
        }
    } catch (error) {
        console.error('Update quantity error:', error);
        alert('Failed to update quantity. Please try again.');
    }
}

// Remove item from cart
async function removeItem(itemId) {
    if (!confirm('Remove this item from cart?')) {
        return;
    }
    
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            cartData = result.cart;
            displayCart(cartData);
        } else {
            alert(result.message || 'Failed to remove item');
        }
    } catch (error) {
        console.error('Remove item error:', error);
        alert('Failed to remove item. Please try again.');
    }
}

// Handle continue to checkout
function handleContinueToCheckout() {
    if (stockIssues.length > 0) {
        alert('Please adjust quantities before proceeding to checkout');
        return;
    }
    
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Navigate to checkout page
    window.location.href = 'checkout.html';
}