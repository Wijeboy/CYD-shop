// API Base URL
const API_URL = 'http://localhost:5001/api';
let productId = null;
let imageChanged = false;

// Get product ID from URL and load product data
document.addEventListener('DOMContentLoaded', async function() {
    await verifyAdminAccess();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    productId = urlParams.get('id');
    
    if (!productId) {
        alert('Invalid product ID');
        window.location.href = 'product-management.html';
        return;
    }
    
    await loadProductData();
    
    // Image upload handlers
    const imagePreview = document.getElementById('imagePreview');
    const productImageInput = document.getElementById('productImage');
    const uploadLabel = document.querySelector('.upload-label');
    
    imagePreview.addEventListener('click', () => productImageInput.click());
    uploadLabel.addEventListener('click', () => productImageInput.click());
    
    productImageInput.addEventListener('change', handleImagePreview);
    
    // Cancel button handler
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', () => {
        window.location.href = 'product-management.html';
    });
    
    // Form submission handler
    const editProductForm = document.getElementById('editProductForm');
    editProductForm.addEventListener('submit', handleUpdateProduct);
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
            throw new Error(data.message || 'Not authorized');
        }
        
        console.log('Admin verified:', data.user.name);
    } catch (error) {
        console.error('Admin verification error:', error);
        alert('You do not have admin access');
        window.location.href = '../index.html';
    }
}

// Load product data
async function loadProductData() {
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to load product');
        }
        
        if (result.success) {
            populateForm(result.product);
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        console.error('Load product error:', error);
        alert('Failed to load product data');
        window.location.href = 'product-management.html';
    }
}

// Populate form with product data
function populateForm(product) {
    document.getElementById('productName').value = product.name;
    document.getElementById('price').value = product.price;
    document.getElementById('category').value = product.category;
    document.getElementById('stockQuantity').value = product.stockQuantity;
    document.getElementById('description').value = product.description;
    
    // Display current product image
    const previewImg = document.getElementById('previewImg');
    previewImg.src = `http://localhost:5001/${product.image}`;
}

// Handle image preview
function handleImagePreview(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            event.target.value = '';
            return;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            event.target.value = '';
            return;
        }
        
        imageChanged = true;
        
        // Preview image
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('previewImg');
            previewImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Handle update product form submission
async function handleUpdateProduct(event) {
    event.preventDefault();
    
    const token = getAuthToken();
    const formData = new FormData();
    
    // Get form values
    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value;
    const stockQuantity = document.getElementById('stockQuantity').value;
    const description = document.getElementById('description').value.trim();
    
    // Validate inputs
    if (!name || !price || !category || !stockQuantity || !description) {
        alert('Please fill in all fields');
        return;
    }
    
    // Validate product name (text only)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
        alert('Product name should contain only letters and spaces');
        return;
    }
    
    // Validate price
    if (parseFloat(price) < 0) {
        alert('Price must be a positive number');
        return;
    }
    
    // Validate stock quantity
    if (parseInt(stockQuantity) < 0) {
        alert('Stock quantity must be a non-negative number');
        return;
    }
    
    // Append data to FormData
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('stockQuantity', stockQuantity);
    formData.append('description', description);
    
    // Append image only if changed
    if (imageChanged) {
        const productImage = document.getElementById('productImage').files[0];
        if (productImage) {
            formData.append('productImage', productImage);
        }
    }
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to update product');
        }
        
        if (result.success) {
            alert('Product updated successfully!');
            window.location.href = 'product-management.html';
        } else {
            throw new Error(result.message || 'Failed to update product');
        }
    } catch (error) {
        console.error('Update product error:', error);
        alert('Failed to update product: ' + error.message);
    }
}