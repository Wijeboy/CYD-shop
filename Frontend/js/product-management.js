// API Base URL
const API_URL = 'http://localhost:5001/api';
let productToDelete = null;

// Check admin authentication and load products
document.addEventListener('DOMContentLoaded', async function() {
    await verifyAdminAccess();
    await loadAdminProfile();
    await loadProducts();
    
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
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="http://localhost:5001/${product.mainImage}" alt="${product.name}" class="product-image" onerror="this.src='../User panel images/icons/upload-placeholder.png'">
            <div class="action-icons">
                <div class="action-icon edit-icon" onclick="editProduct('${product._id}')">
                    <img src="../User panel images/icons/edit-icon.png" alt="Edit">
                </div>
                <div class="action-icon delete-icon" onclick="confirmDelete('${product._id}')">
                    <img src="../User panel images/icons/delete-icon.png" alt="Delete">
                </div>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">Rs ${product.price}</p>
        </div>
    `;
    
    return card;
}

// Edit product
function editProduct(productId) {
    window.location.href = `edit-product.html?id=${productId}`;
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