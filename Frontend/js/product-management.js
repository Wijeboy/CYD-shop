// API Base URL
const API_URL = 'http://localhost:5001/api';
let productToDelete = null;

// Check admin authentication and load products
document.addEventListener('DOMContentLoaded', async function() {
    await verifyAdminAccess();
    await loadAdminProfile();
    await loadProducts();
    
    // Check for redirect messages
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'color-variant-edit-not-supported') {
        showMessage('⚠️ This product has color variants and cannot be edited yet. Please delete and recreate the product if changes are needed.', 'warning');
    } else if (message === 'missing-data') {
        showMessage('⚠️ This product is missing required data and cannot be edited.', 'error');
    } else if (message === 'load-failed') {
        showMessage('❌ Failed to load product data.', 'error');
    } else if (message === 'invalid-id') {
        showMessage('❌ Invalid product ID.', 'error');
    }
    
    // Dropdown toggle
    const dropdownIcon = document.getElementById('dropdownIcon');
    const dropdownContent = document.getElementById('dropdownContent');
    
    dropdownIcon.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Show message to user
function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'warning' ? '#fff3cd' : type === 'error' ? '#f8d7da' : '#d1e7dd'};
        color: ${type === 'warning' ? '#856404' : type === 'error' ? '#721c24' : '#0f5132'};
        border: 1px solid ${type === 'warning' ? '#ffc107' : type === 'error' ? '#f5c6cb' : '#badbcc'};
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-size: 14px;
        line-height: 1.5;
    `;
    messageDiv.textContent = text;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.5s';
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 500);
    }, 5000);
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Verify admin access
async function verifyAdminAccess() {
    const token = getAuthToken();
    
    if (!token) {
        alert('Please login as admin');
        window.location.href = '../signin.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            console.error('Admin verification failed:', data);
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Session expired or invalid. Please login again as admin.');
            window.location.href = '../signin.html';
            return;
        }
        
        // Verify the user role is admin
        if (data.user && data.user.role !== 'admin') {
            alert('You do not have admin access');
            window.location.href = '../index.html';
            return;
        }
        
        console.log('Admin verified:', data.user.name);
        
    } catch (error) {
        console.error('Admin verification error:', error);
        // Clear potentially invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Unable to verify admin access. Please login again.');
        window.location.href = '../signin.html';
    }
}

// Load admin profile
async function loadAdminProfile() {
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/admin/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Update sidebar profile picture and name
            const profileIcon = document.querySelector('.profile-icon');
            const profileName = document.querySelector('.profile-name');
            
            if (profileIcon && data.admin.profileImage && data.admin.profileImage !== 'User panel images/default-avatar.png') {
                const timestamp = new Date().getTime();
                profileIcon.src = `http://localhost:5001/${data.admin.profileImage}?t=${timestamp}`;
            }
            
            if (profileName && data.admin.name) {
                profileName.textContent = data.admin.name;
            }
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

// Load all products
async function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to load products');
        }
        
        if (result.success && result.products.length > 0) {
            displayProducts(result.products);
        } else {
            productsGrid.innerHTML = '<div class="no-products-message">No products available. Add your first product!</div>';
        }
    } catch (error) {
        console.error('Load products error:', error);
        productsGrid.innerHTML = '<div class="no-products-message">Failed to load products. Please try again.</div>';
    }
}

// Display products in grid
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Get image - prioritize colorVariants if available
    let imageUrl;
    console.log('Product:', product.name, 'colorVariants:', product.colorVariants);
    
    if (product.colorVariants && product.colorVariants.length > 0 && product.colorVariants[0].images && product.colorVariants[0].images.mainImage) {
        // Use first color variant's main image
        const imagePath = product.colorVariants[0].images.mainImage;
        imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:5001/${imagePath}`;
        console.log('Using color variant image:', imageUrl);
    } else if (product.mainImage) {
        // Use legacy main image
        const imagePath = product.mainImage;
        imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:5001/${imagePath}`;
        console.log('Using legacy image:', imageUrl);
    } else {
        // Fallback to placeholder
        imageUrl = '../User panel images/icons/upload-placeholder.png';
        console.log('Using placeholder image');
    }
    
    // Format price with proper decimal places
    const formattedPrice = typeof product.price === 'number' ? product.price.toFixed(2) : product.price;
    
    // Check if product has color variants
    const hasColorVariants = product.colorVariants && product.colorVariants.length > 0;
    const colorBadge = hasColorVariants ? `<span class="color-badge">${product.colorVariants.length} Colors</span>` : '';
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='../User panel images/icons/upload-placeholder.png'">
            <div class="action-icons">
                <div class="action-icon edit-icon" onclick="editProduct('${product._id}', ${hasColorVariants})">
                    <img src="../User panel images/icons/edit-icon.png" alt="Edit">
                </div>
                <div class="action-icon delete-icon" onclick="confirmDelete('${product._id}')">
                    <img src="../User panel images/icons/delete-icon.png" alt="Delete">
                </div>
            </div>
            ${colorBadge}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">Rs ${formattedPrice}</p>
            <p class="product-category">${product.category}</p>
        </div>
    `;
    
    return card;
}

// Edit product
function editProduct(productId, hasColorVariants) {
    if (hasColorVariants) {
        // Redirect to edit-product-variant page
        window.location.href = `edit-product-variant.html?id=${productId}`;
    } else {
        // Redirect to legacy edit product page
        window.location.href = `edit-product.html?id=${productId}`;
    }
}

// Confirm delete product
function confirmDelete(productId) {
    productToDelete = productId;
    
    // Create and show delete modal
    const modal = document.createElement('div');
    modal.className = 'delete-modal show';
    modal.id = 'deleteModal';
    
    modal.innerHTML = `
        <div class="delete-modal-content">
            <h2 class="delete-modal-title">Confirm Deletion</h2>
            <p class="delete-modal-text">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div class="delete-modal-buttons">
                <button class="delete-cancel-btn" onclick="closeDeleteModal()">Cancel</button>
                <button class="delete-confirm-btn" onclick="deleteProduct()">Delete</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close delete modal
function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.remove();
    }
    productToDelete = null;
}

// Delete product
async function deleteProduct() {
    if (!productToDelete) return;
    
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/products/${productToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete product');
        }
        
        if (result.success) {
            alert('Product deleted successfully!');
            closeDeleteModal();
            await loadProducts(); // Reload products
        } else {
            throw new Error(result.message || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Delete product error:', error);
        alert('Failed to delete product: ' + error.message);
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to signin page
        window.location.href = '../signin.html';
    }
}