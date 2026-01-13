// API Base URL
const API_URL = 'http://localhost:5001/api';

let allProducts = [];
let filteredProducts = [];

// Load products on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadProducts();
    
    // Filter button toggle
    const filterBtn = document.getElementById('filterBtn');
    const filterSidebar = document.getElementById('filterSidebar');
    const productsGrid = document.getElementById('productsGrid');
    
    filterBtn.addEventListener('click', function() {
        filterSidebar.classList.toggle('active');
        productsGrid.classList.toggle('filter-active');
    });
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    searchInput.addEventListener('input', function() {
        if (searchInput.value === '') {
            displayProducts(allProducts);
        }
    });
    
    // Filter checkboxes
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
});

// Load all products
async function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to load products');
        }
        
        if (result.success && result.products.length > 0) {
            allProducts = result.products;
            filteredProducts = allProducts;
            displayProducts(allProducts);
        } else {
            productsGrid.innerHTML = '<div class="no-products-message">No products available at the moment.</div>';
        }
    } catch (error) {
        console.error('Load products error:', error);
        productsGrid.innerHTML = '<div class="no-products-message">Failed to load products. Please try again.</div>';
    }
}

// Display products in grid
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    const productCount = document.getElementById('productCount');
    
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<div class="no-products-message">No products match your search or filters.</div>';
        productCount.textContent = '0 products';
        return;
    }
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    // Update product count
    productCount.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('a');
    card.className = 'product-card';
    card.href = `product-details.html?id=${product._id}`;
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="http://localhost:5001/${product.mainImage}" alt="${product.name}" class="product-image" onerror="this.src='User panel images/icons/upload-placeholder.png'">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">Rs ${product.price}</p>
        </div>
    `;
    
    return card;
}

// Handle search
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayProducts(allProducts);
        return;
    }
    
    const searchResults = allProducts.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) ||
               product.description.toLowerCase().includes(searchTerm) ||
               product.category.toLowerCase().includes(searchTerm);
    });
    
    displayProducts(searchResults);
}

// Apply filters
function applyFilters() {
    const categoryCheckboxes = document.querySelectorAll('.filter-checkbox[data-filter="category"]:checked');
    const priceCheckboxes = document.querySelectorAll('.filter-checkbox[data-filter="price"]:checked');
    
    let filtered = allProducts;
    
    // Apply category filters
    if (categoryCheckboxes.length > 0) {
        const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value.toLowerCase());
        filtered = filtered.filter(product => 
            selectedCategories.includes(product.category.toLowerCase())
        );
    }
    
    // Apply price filters
    if (priceCheckboxes.length > 0) {
        const priceRanges = Array.from(priceCheckboxes).map(cb => {
            const [min, max] = cb.value.split('-').map(Number);
            return { min, max };
        });
        
        filtered = filtered.filter(product => {
            return priceRanges.some(range => 
                product.price >= range.min && product.price <= range.max
            );
        });
    }
    
    filteredProducts = filtered;
    displayProducts(filtered);
}