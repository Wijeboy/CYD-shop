// API Base URL
const API_URL = 'http://localhost:5000/api';
let productToDelete = null;

// Check admin authentication and load products
document.addEventListener('DOMContentLoaded', async function() {
    await verifyAdminAccess();
    await loadProducts();
    
    // Dropdown toggle
    const dropdownIcon = document.getElementById('dropdownIcon');
    const dropdownContent = document.getElementById('dropdownContent');
    
    dropdownIcon.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });
});

// Get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
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
        
        if (!response.ok) {
            throw new Error('Not authorized');
        }
    } catch (error) {
        console.error('Admin verification error:', error);
        alert('You do not have admin access');
        window.location.href = '../index.html';
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
            <img src="http://localhost:5000/${product.image}" alt="${product.name}" class="product-image">
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
            <p class="product-price">$${product.price}</p>
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