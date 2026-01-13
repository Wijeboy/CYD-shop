// Constants
const API_URL = 'http://localhost:5001/api';

const AVAILABLE_COLORS = [
    { name: 'Black', value: 'black', hex: '#000000' },
    { name: 'White', value: 'white', hex: '#FFFFFF' },
    { name: 'Red', value: 'red', hex: '#FF0000' },
    { name: 'Blue', value: 'blue', hex: '#0000FF' },
    { name: 'Green', value: 'green', hex: '#008000' },
    { name: 'Yellow', value: 'yellow', hex: '#FFFF00' },
    { name: 'Pink', value: 'pink', hex: '#FFC0CB' },
    { name: 'Purple', value: 'purple', hex: '#800080' },
    { name: 'Orange', value: 'orange', hex: '#FFA500' },
    { name: 'Brown', value: 'brown', hex: '#A52A2A' },
    { name: 'Gray', value: 'gray', hex: '#808080' },
    { name: 'Navy', value: 'navy', hex: '#000080' },
    { name: 'Beige', value: 'beige', hex: '#F5F5DC' },
    { name: 'Maroon', value: 'maroon', hex: '#800000' }
];

let variantCount = 0;

// Verify admin access on page load
document.addEventListener('DOMContentLoaded', async () => {
    await verifyAdminAccess();
    // Add first color variant by default
    addColorVariant();
});

async function verifyAdminAccess() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Please login as admin');
        window.location.href = '../signin.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!data.success || data.user.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = '../signin.html';
        }
    } catch (error) {
        console.error('Verification error:', error);
        alert('Failed to verify admin access');
        window.location.href = '../signin.html';
    }
}

function addColorVariant() {
    const container = document.getElementById('variantsContainer');
    const variantId = variantCount++;
    
    const variantHTML = `
        <div class="variant-item" id="variant-${variantId}">
            <div class="variant-header">
                <h3 class="variant-title">Color Variant ${variantId + 1}</h3>
                ${variantId > 0 ? `<button type="button" class="remove-variant-btn" onclick="removeVariant(${variantId})">Remove</button>` : ''}
            </div>

            <div class="color-selector-group">
                <label class="form-label">Select Color *</label>
                <select class="color-selector" id="color-${variantId}" required>
                    <option value="">Choose a color</option>
                    ${AVAILABLE_COLORS.map(color => `
                        <option value="${color.value}" data-hex="${color.hex}">${color.name}</option>
                    `).join('')}
                </select>
            </div>

            <div class="variant-images-section">
                <div class="variant-image-box">
                    <div class="variant-image-preview" onclick="document.getElementById('mainImage-${variantId}').click()">
                        <img id="mainImagePreview-${variantId}" src="../User panel images/icons/upload-placeholder.png" alt="Main Image">
                    </div>
                    <div class="variant-image-label">Main Image *</div>
                    <input type="file" id="mainImage-${variantId}" accept="image/*" style="display: none;" 
                           onchange="previewImage(this, 'mainImagePreview-${variantId}')" required>
                </div>

                <div class="variant-image-box">
                    <div class="variant-image-preview" onclick="document.getElementById('additionalImage1-${variantId}').click()">
                        <img id="additionalImage1Preview-${variantId}" src="../User panel images/icons/upload-placeholder.png" alt="Additional 1">
                    </div>
                    <div class="variant-image-label">Additional 1</div>
                    <input type="file" id="additionalImage1-${variantId}" accept="image/*" style="display: none;" 
                           onchange="previewImage(this, 'additionalImage1Preview-${variantId}')">
                </div>

                <div class="variant-image-box">
                    <div class="variant-image-preview" onclick="document.getElementById('additionalImage2-${variantId}').click()">
                        <img id="additionalImage2Preview-${variantId}" src="../User panel images/icons/upload-placeholder.png" alt="Additional 2">
                    </div>
                    <div class="variant-image-label">Additional 2</div>
                    <input type="file" id="additionalImage2-${variantId}" accept="image/*" style="display: none;" 
                           onchange="previewImage(this, 'additionalImage2Preview-${variantId}')">
                </div>

                <div class="variant-image-box">
                    <div class="variant-image-preview" onclick="document.getElementById('additionalImage3-${variantId}').click()">
                        <img id="additionalImage3Preview-${variantId}" src="../User panel images/icons/upload-placeholder.png" alt="Additional 3">
                    </div>
                    <div class="variant-image-label">Additional 3</div>
                    <input type="file" id="additionalImage3-${variantId}" accept="image/*" style="display: none;" 
                           onchange="previewImage(this, 'additionalImage3Preview-${variantId}')">
                </div>
            </div>

            <div class="variant-sizes-grid">
                <div class="size-input-group">
                    <label>Size S</label>
                    <input type="number" id="sizeS-${variantId}" min="0" value="0" required>
                </div>
                <div class="size-input-group">
                    <label>Size M</label>
                    <input type="number" id="sizeM-${variantId}" min="0" value="0" required>
                </div>
                <div class="size-input-group">
                    <label>Size L</label>
                    <input type="number" id="sizeL-${variantId}" min="0" value="0" required>
                </div>
                <div class="size-input-group">
                    <label>Size XL</label>
                    <input type="number" id="sizeXL-${variantId}" min="0" value="0" required>
                </div>
                <div class="size-input-group">
                    <label>Size 2XL</label>
                    <input type="number" id="size2XL-${variantId}" min="0" value="0" required>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', variantHTML);
}

function removeVariant(variantId) {
    const variant = document.getElementById(`variant-${variantId}`);
    if (variant) {
        variant.remove();
    }
}

function previewImage(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            document.getElementById(previewId).src = e.target.result;
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Form submission
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding Product...';
    
    try {
        // Get basic product info
        const name = document.getElementById('productName').value.trim();
        const price = document.getElementById('price').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();
        
        // Collect all variant data
        const variants = [];
        const formData = new FormData();
        
        const variantElements = document.querySelectorAll('.variant-item');
        
        for (let i = 0; i < variantElements.length; i++) {
            const variantId = variantElements[i].id.split('-')[1];
            const colorSelect = document.getElementById(`color-${variantId}`);
            const selectedOption = colorSelect.options[colorSelect.selectedIndex];
            
            if (!selectedOption.value) {
                alert(`Please select a color for variant ${i + 1}`);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Add Product';
                return;
            }
            
            const mainImage = document.getElementById(`mainImage-${variantId}`);
            if (!mainImage.files[0]) {
                alert(`Please upload main image for ${selectedOption.text} variant`);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Add Product';
                return;
            }
            
            // Add variant data
            const variant = {
                color: selectedOption.value,
                colorName: selectedOption.text,
                colorHex: selectedOption.dataset.hex,
                sizeS: document.getElementById(`sizeS-${variantId}`).value,
                sizeM: document.getElementById(`sizeM-${variantId}`).value,
                sizeL: document.getElementById(`sizeL-${variantId}`).value,
                sizeXL: document.getElementById(`sizeXL-${variantId}`).value,
                size2XL: document.getElementById(`size2XL-${variantId}`).value
            };
            
            variants.push(variant);
            
            // Add images to formData
            formData.append(`mainImage_${i}`, mainImage.files[0]);
            
            const additionalImage1 = document.getElementById(`additionalImage1-${variantId}`);
            const additionalImage2 = document.getElementById(`additionalImage2-${variantId}`);
            const additionalImage3 = document.getElementById(`additionalImage3-${variantId}`);
            
            if (additionalImage1.files[0]) formData.append(`additionalImage1_${i}`, additionalImage1.files[0]);
            if (additionalImage2.files[0]) formData.append(`additionalImage2_${i}`, additionalImage2.files[0]);
            if (additionalImage3.files[0]) formData.append(`additionalImage3_${i}`, additionalImage3.files[0]);
        }
        
        // Add basic info to formData
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('colorVariants', JSON.stringify(variants));
        
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/products/with-variants`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Product added successfully with color variants!');
            window.location.href = 'product-management.html';
        } else {
            alert('Error: ' + (data.message || 'Failed to add product'));
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Product';
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Product';
    }
});
