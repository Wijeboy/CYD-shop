// API Base URL
const API_URL = 'http://localhost:5000/api';

// Check admin authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    await verifyAdminAccess();
    
    // Main image upload handlers
    const mainImagePreview = document.getElementById('mainImagePreview');
    const mainImageInput = document.getElementById('mainImage');
    const uploadLabel = document.querySelector('.upload-label');
    
    mainImagePreview.addEventListener('click', () => mainImageInput.click());
    uploadLabel.addEventListener('click', () => mainImageInput.click());
    mainImageInput.addEventListener('change', (e) => handleImagePreview(e, 'mainPreviewImg'));
    
    // Additional images upload handlers
    setupAdditionalImageUpload('additionalPreview1', 'additionalImage1', 'additionalImg1');
    setupAdditionalImageUpload('additionalPreview2', 'additionalImage2', 'additionalImg2');
    setupAdditionalImageUpload('additionalPreview3', 'additionalImage3', 'additionalImg3');
    
    // Cancel button handler
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', () => {
        window.location.href = 'admin-dashboard.html';
    });
    
    // Form submission handler
    const addProductForm = document.getElementById('addProductForm');
    addProductForm.addEventListener('submit', handleAddProduct);
});

// Setup additional image upload
function setupAdditionalImageUpload(previewId, inputId, imgId) {
    const preview = document.getElementById(previewId);
    const input = document.getElementById(inputId);
    const uploadText = preview.nextElementSibling;
    
    preview.addEventListener('click', () => input.click());
    uploadText.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => handleImagePreview(e, imgId));
}

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
function handleImagePreview(event, imgElementId) {
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
            const previewImg = document.getElementById(imgElementId);
            previewImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Handle add product form submission
async function handleAddProduct(event) {
    event.preventDefault();
    
    const token = getAuthToken();
    const formData = new FormData();
    
    // Get form values
    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value.trim();
    const sizeS = document.getElementById('sizeS').value;
    const sizeM = document.getElementById('sizeM').value;
    const sizeL = document.getElementById('sizeL').value;
    const sizeXL = document.getElementById('sizeXL').value;
    const size2XL = document.getElementById('size2XL').value;
    
    // Get images
    const mainImage = document.getElementById('mainImage').files[0];
    const additionalImage1 = document.getElementById('additionalImage1').files[0];
    const additionalImage2 = document.getElementById('additionalImage2').files[0];
    const additionalImage3 = document.getElementById('additionalImage3').files[0];
    
    // Validate inputs
    if (!name || !price || !category || !description || 
        !sizeS || !sizeM || !sizeL || !sizeXL || !size2XL) {
        alert('Please fill in all fields');
        return;
    }
    
    // Validate all images are uploaded
    if (!mainImage || !additionalImage1 || !additionalImage2 || !additionalImage3) {
        alert('Please upload main image and all 3 additional images');
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
    
    // Validate size quantities
    if (parseInt(sizeS) < 0 || parseInt(sizeM) < 0 || parseInt(sizeL) < 0 || 
        parseInt(sizeXL) < 0 || parseInt(size2XL) < 0) {
        alert('Size quantities must be non-negative numbers');
        return;
    }
    
    // Append data to FormData
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('sizeS', sizeS);
    formData.append('sizeM', sizeM);
    formData.append('sizeL', sizeL);
    formData.append('sizeXL', sizeXL);
    formData.append('size2XL', size2XL);
    formData.append('mainImage', mainImage);
    formData.append('additionalImage1', additionalImage1);
    formData.append('additionalImage2', additionalImage2);
    formData.append('additionalImage3', additionalImage3);
    
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