// API Base URL
const API_URL = 'http://localhost:5001/api';

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Load product on page load
document.addEventListener('DOMContentLoaded', async function() {
    if (!productId) {
        alert('Product not found');
        window.location.href = 'product-listing.html';
        return;
    }

    await loadProductDetails();
    setupEventListeners();
});

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'signin.html';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });

    // Thumbnail click
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            const index = this.dataset.index;
            changeMainImage(index);
        });
    });

    // Add to cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    addToCartBtn.addEventListener('click', handleAddToCart);

    // Policy modal
    const policyInfoBtn = document.getElementById('policyInfoBtn');
    const policyBadge = document.querySelector('.badge');
    const policyModal = document.getElementById('policyModal');
    const closePolicyModal = document.getElementById('closePolicyModal');

    if (policyModal) {
        // Open modal when clicking the badge or info button
        if (policyBadge) {
            policyBadge.addEventListener('click', function(e) {
                e.preventDefault();
                policyModal.classList.add('active');
            });
        }

        if (policyInfoBtn) {
            policyInfoBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                policyModal.classList.add('active');
            });
        }

        // Close modal
        if (closePolicyModal) {
            closePolicyModal.addEventListener('click', function() {
                policyModal.classList.remove('active');
            });
        }

        // Close on overlay click
        policyModal.addEventListener('click', function(e) {
            if (e.target === policyModal) {
                policyModal.classList.remove('active');
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && policyModal.classList.contains('active')) {
                policyModal.classList.remove('active');
            }
        });
    }
}

// Load product details from API
async function loadProductDetails() {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to load product');
        }

        currentProduct = result.product;
        displayProductDetails(currentProduct);
    } catch (error) {
        console.error('Load product error:', error);
        alert('Failed to load product details. Redirecting to shop...');
        setTimeout(() => {
            window.location.href = 'product-listing.html';
        }, 2000);
    }
}

// Display product details
function displayProductDetails(product) {
    // Set title and basic info
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productPrice').textContent = `Rs ${product.price.toFixed(2)}`;

    // Check if product has color variants
    if (product.colorVariants && product.colorVariants.length > 0) {
        // New format with color variants
        displayColors(product.colorVariants);
        
        // Display first variant by default
        const firstVariant = product.colorVariants[0];
        selectedColor = firstVariant.colorName;
        updateImagesForVariant(firstVariant);
        displaySizes(firstVariant.sizeQuantities);
    } else {
        // Legacy format without color variants
        const images = [
            `http://localhost:5001/${product.mainImage}`,
            `http://localhost:5001/${product.additionalImages.image1}`,
            `http://localhost:5001/${product.additionalImages.image2}`,
            `http://localhost:5001/${product.additionalImages.image3}`
        ];

        updateImageGallery(images);
        displaySizes(product.sizeQuantities);
        
        // Display default colors for legacy products
        displayDefaultColors();
    }

    // Display description
    document.getElementById('productDescription').innerHTML = `
        <p>${product.description}</p>
        <p><strong>Category:</strong> ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
    `;
}

// Update images for a specific color variant
function updateImagesForVariant(variant) {
    const images = [
        `http://localhost:5001/${variant.images.mainImage}`,
        ...variant.images.additionalImages.map(img => `http://localhost:5001/${img}`)
    ];
    
    // Fill remaining slots if less than 4 images
    while (images.length < 4) {
        images.push('User panel images/icons/upload-placeholder.png');
    }
    
    updateImageGallery(images);
}

// Update image gallery
function updateImageGallery(images) {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');

    mainImage.src = images[0];
    mainImage.onerror = function() {
        this.src = 'User panel images/icons/upload-placeholder.png';
    };

    thumbnails.forEach((thumb, index) => {
        if (images[index]) {
            thumb.src = images[index];
            thumb.onerror = function() {
                this.src = 'User panel images/icons/upload-placeholder.png';
            };
        }
    });
}

// Display available sizes
function displaySizes(sizeQuantities) {
    const sizeOptions = document.getElementById('sizeOptions');
    sizeOptions.innerHTML = '';

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    
    sizes.forEach(size => {
        const quantity = sizeQuantities[size] || 0;
        const sizeBtn = document.createElement('button');
        sizeBtn.className = 'size-option';
        sizeBtn.textContent = size === 'XXL' ? '2XL' : size;
        sizeBtn.dataset.size = size;

        if (quantity === 0) {
            sizeBtn.classList.add('disabled');
            sizeBtn.disabled = true;
        } else {
            sizeBtn.addEventListener('click', function() {
                selectSize(this);
            });
        }

        sizeOptions.appendChild(sizeBtn);
    });
}

// Display color options (mock data)
function displayColors(colorVariants) {
    const colorOptions = document.getElementById('colorOptions');
    colorOptions.innerHTML = '';

    if (colorVariants && colorVariants.length > 0) {
        // Display actual product color variants
        colorVariants.forEach((variant, index) => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color-option';
            colorDiv.style.backgroundColor = variant.colorHex;
            colorDiv.title = variant.colorName;
            colorDiv.dataset.color = variant.colorName;
            colorDiv.dataset.variantIndex = index;

            if (variant.colorHex === '#FFFFFF' || variant.colorHex.toLowerCase() === '#fff') {
                colorDiv.style.border = '2px solid #e0e0e0';
            }

            colorDiv.addEventListener('click', function() {
                selectColor(this, colorVariants);
            });

            colorOptions.appendChild(colorDiv);
        });

        // Select first color by default
        const firstColor = colorOptions.querySelector('.color-option');
        if (firstColor) {
            firstColor.classList.add('selected');
            selectedColor = firstColor.dataset.color;
        }
    } else {
        // Display default colors for legacy products
        displayDefaultColors();
    }
}

// Display default colors for legacy products
function displayDefaultColors() {
    const colorOptions = document.getElementById('colorOptions');
    colorOptions.innerHTML = '';

    const colors = [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Gray', hex: '#808080' },
        { name: 'Black', hex: '#000000' },
        { name: 'Mint', hex: '#98D8C8' },
        { name: 'Blue', hex: '#A5B4FC' }
    ];

    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'color-option';
        colorDiv.style.backgroundColor = color.hex;
        colorDiv.title = color.name;
        colorDiv.dataset.color = color.name;

        if (color.hex === '#FFFFFF') {
            colorDiv.style.border = '2px solid #e0e0e0';
        }

        colorDiv.addEventListener('click', function() {
            selectColor(this);
        });

        colorOptions.appendChild(colorDiv);
    });

    // Select first color by default
    const firstColor = colorOptions.querySelector('.color-option');
    if (firstColor) {
        firstColor.classList.add('selected');
        selectedColor = firstColor.dataset.color;
    }
}

// Select size
function selectSize(element) {
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedSize = element.dataset.size;
}

// Select color
function selectColor(element, colorVariants) {
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedColor = element.dataset.color;

    // If colorVariants exist, update images and sizes for selected color
    if (colorVariants && element.dataset.variantIndex !== undefined) {
        const variantIndex = parseInt(element.dataset.variantIndex);
        const variant = colorVariants[variantIndex];
        
        // Update images for this color
        updateImagesForVariant(variant);
        
        // Update sizes for this color
        displaySizes(variant.sizeQuantities);
        
        // Reset size selection
        selectedSize = null;
    }
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    if (tabName === 'size') {
        document.getElementById('sizeContent').classList.remove('hidden');
    } else if (tabName === 'info') {
        document.getElementById('infoContent').classList.remove('hidden');
    }
}

// Change main image
function changeMainImage(index) {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    // Update active thumbnail
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbnails[index].classList.add('active');

    // Update main image
    mainImage.src = thumbnails[index].src;
}

// Handle add to cart
function handleAddToCart() {
    if (!selectedSize) {
        alert('Please select a size');
        return;
    }

    if (!selectedColor) {
        alert('Please select a color');
        return;
    }

    // Here you would typically add the product to cart
    // For now, just show a confirmation
    alert(`Added to cart!\n\nProduct: ${currentProduct.name}\nSize: ${selectedSize}\nColor: ${selectedColor}\nPrice: Rs ${currentProduct.price}`);

    // You can implement actual cart functionality here
    // addToCart(currentProduct, selectedSize, selectedColor);
}

// Add to cart function (placeholder)
function addToCart(product, size, color) {
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if item already exists
    const existingItemIndex = cart.findIndex(item => 
        item.productId === product._id && 
        item.size === size && 
        item.color === color
    );

    if (existingItemIndex > -1) {
        // Increase quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cart.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            size: size,
            color: color,
            quantity: 1,
            image: product.mainImage
        });
    }

    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));
}
