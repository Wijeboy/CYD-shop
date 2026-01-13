// API Base URL
const API_URL = 'http://localhost:5001/api';
let productId = null;
let imagesChanged = {
    main: false,
    additional1: false,
    additional2: false,
    additional3: false
};

// Get product ID from URL and load product data
document.addEventListener('DOMContentLoaded', async function() {
    await verifyAdminAccess();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'product-management.html?message=invalid-id';
        return;
    }
    
    // Load product data first - will redirect if it's a color variant product
    const productLoaded = await loadProductData();
    
    // Only setup UI if product loaded successfully (not redirected)
    if (!productLoaded) {
        return;
    }
    
    // Main image upload handlers
    const mainImagePreview = document.getElementById('mainImagePreview');
    const mainImageInput = document.getElementById('mainImage');
    const uploadLabel = document.querySelector('.upload-label');
    
    if (mainImagePreview && mainImageInput && uploadLabel) {
        mainImagePreview.addEventListener('click', () => mainImageInput.click());
        uploadLabel.addEventListener('click', () => mainImageInput.click());
        mainImageInput.addEventListener('change', (e) => {
            handleImagePreview(e, 'mainPreviewImg');
            imagesChanged.main = true;
        });
    }
    
    // Additional images upload handlers
    setupAdditionalImageUpload('additionalPreview1', 'additionalImage1', 'additionalImg1', 'additional1');
    setupAdditionalImageUpload('additionalPreview2', 'additionalImage2', 'additionalImg2', 'additional2');
    setupAdditionalImageUpload('additionalPreview3', 'additionalImage3', 'additionalImg3', 'additional3');
    
    // Cancel button handler
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'product-management.html';
        });
    }
    
    // Form submission handler
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleUpdateProduct);
    }
});

// Setup additional image upload
function setupAdditionalImageUpload(previewId, inputId, imgId, imageKey) {
    const preview = document.getElementById(previewId);
    const input = document.getElementById(inputId);
    
    if (!preview || !input) return;
    
    const uploadText = preview.nextElementSibling;
    
    preview.addEventListener('click', () => input.click());
    if (uploadText) {
        uploadText.addEventListener('click', () => input.click());
    }
    input.addEventListener('change', (e) => {
        handleImagePreview(e, imgId);
        imagesChanged[imageKey] = true;
    });
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Session expired or invalid. Please login again as admin.');
            window.location.href = '../signin.html';
            return;
        }
        
        if (data.user && data.user.role !== 'admin') {
            alert('You do not have admin access');
            window.location.href = '../index.html';
            return;
        }
        
    } catch (error) {
        console.error('Admin verification error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Unable to verify admin access. Please login again.');
        window.location.href = '../signin.html';
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
        console.log('Product data received:', result);
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to load product');
        }
        
        if (result.success && result.product) {
            // Check if product has color variants
            if (result.product.colorVariants && result.product.colorVariants.length > 0) {
                // Redirect immediately without alert
                console.log('Product has color variants, redirecting...');
                window.location.href = 'product-management.html?message=color-variant-edit-not-supported';
                return false;
            }
            
            // Check if product has required fields for legacy editing
            if (!result.product.mainImage || !result.product.additionalImages) {
                console.log('Product missing required fields, redirecting...');
                window.location.href = 'product-management.html?message=missing-data';
                return false;
            }
            
            populateForm(result.product);
            return true;
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        console.error('Load product error:', error);
        window.location.href = 'product-management.html?message=load-failed';
        return false;
    }
}

// Populate form with product data
function populateForm(product) {
    console.log('Populating form with product:', product);
    
    try {
        // Basic info
        document.getElementById('productName').value = product.name || '';
        document.getElementById('price').value = product.price || '';
        document.getElementById('category').value = product.category || '';
        document.getElementById('description').value = product.description || '';
        
        // Handle both legacy and new size structure
        const sizeQuantities = product.sizeQuantities || {};
        document.getElementById('sizeS').value = sizeQuantities.S || 0;
        document.getElementById('sizeM').value = sizeQuantities.M || 0;
        document.getElementById('sizeL').value = sizeQuantities.L || 0;
        document.getElementById('sizeXL').value = sizeQuantities.XL || 0;
        document.getElementById('size2XL').value = sizeQuantities.XXL || 0;
        
        // Display current product images with error handling
        const mainImg = document.getElementById('mainPreviewImg');
        const img1 = document.getElementById('additionalImg1');
        const img2 = document.getElementById('additionalImg2');
        const img3 = document.getElementById('additionalImg3');
        
        // Handle main image
        if (product.mainImage) {
            const mainImageUrl = product.mainImage.startsWith('http') ? product.mainImage : `http://localhost:5001/${product.mainImage}`;
            mainImg.src = mainImageUrl;
            mainImg.onerror = function() {
                this.src = '../User panel images/icons/upload-placeholder.png';
                console.error('Failed to load main image:', product.mainImage);
            };
        }
        
        // Handle additional images
        if (product.additionalImages) {
            if (product.additionalImages.image1) {
                const img1Url = product.additionalImages.image1.startsWith('http') ? product.additionalImages.image1 : `http://localhost:5001/${product.additionalImages.image1}`;
                img1.src = img1Url;
                img1.onerror = function() {
                    this.src = '../User panel images/icons/upload-placeholder.png';
                };
            }
            
            if (product.additionalImages.image2) {
                const img2Url = product.additionalImages.image2.startsWith('http') ? product.additionalImages.image2 : `http://localhost:5001/${product.additionalImages.image2}`;
                img2.src = img2Url;
                img2.onerror = function() {
                    this.src = '../User panel images/icons/upload-placeholder.png';
                };
            }
            
            if (product.additionalImages.image3) {
                const img3Url = product.additionalImages.image3.startsWith('http') ? product.additionalImages.image3 : `http://localhost:5001/${product.additionalImages.image3}`;
                img3.src = img3Url;
                img3.onerror = function() {
                    this.src = '../User panel images/icons/upload-placeholder.png';
                };
            }
        }
        
        console.log('Form populated successfully');
    } catch (error) {
        console.error('Error populating form:', error);
        alert('Error loading product details: ' + error.message);
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

// Handle update product form submission
async function handleUpdateProduct(event) {
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
    
    // Validate inputs
    if (!name || !price || !category || !description) {
        alert('Please fill in all required fields');
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
    
    // Append images only if changed
    if (imagesChanged.main) {
        const mainImage = document.getElementById('mainImage').files[0];
        if (mainImage) {
            formData.append('mainImage', mainImage);
        }
    }
    
    if (imagesChanged.additional1) {
        const additionalImage1 = document.getElementById('additionalImage1').files[0];
        if (additionalImage1) {
            formData.append('additionalImage1', additionalImage1);
        }
    }
    
    if (imagesChanged.additional2) {
        const additionalImage2 = document.getElementById('additionalImage2').files[0];
        if (additionalImage2) {
            formData.append('additionalImage2', additionalImage2);
        }
    }
    
    if (imagesChanged.additional3) {
        const additionalImage3 = document.getElementById('additionalImage3').files[0];
        if (additionalImage3) {
            formData.append('additionalImage3', additionalImage3);
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