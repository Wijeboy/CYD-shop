// API Base URL
const API_URL = 'http://localhost:5000/api';

// Check admin authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    await verifyAdminAccess();
    
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
        window.location.href = 'admin-dashboard.html';
    });
    
    // Form submission handler
    const addProductForm = document.getElementById('addProductForm');
    addProductForm.addEventListener('submit', handleAddProduct);
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
        
        // Preview image
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('previewImg');
            previewImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Handle add product form submission
async function handleAddProduct(event) {
    event.preventDefault();
    
    const token = getAuthToken();
    const form = event.target;
    const formData = new FormData();
    
    // Get form values
    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value;
    const stockQuantity = document.getElementById('stockQuantity').value;
    const description = document.getElementById('description').value.trim();
    const productImage = document.getElementById('productImage').files[0];
    
    // Validate inputs
    if (!name || !price || !category || !stockQuantity || !description || !productImage) {
        alert('Please fill in all fields and upload an image');
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
    formData.append('productImage', productImage);
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to add product');
        }
        
        if (result.success) {
            alert('Product added successfully!');
            window.location.href = 'product-management.html';
        } else {
            throw new Error(result.message || 'Failed to add product');
        }
    } catch (error) {
        console.error('Add product error:', error);
        alert('Failed to add product: ' + error.message);
    }
}