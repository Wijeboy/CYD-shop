// Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Store original content for filtering
    const allProducts = document.querySelectorAll('.product-card');
    const allCategories = document.querySelectorAll('.category-item');
    
    searchBtn.addEventListener('click', function() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Show all content when search is cleared
            showAllContent();
            return;
        }
        
        // Filter products
        let hasResults = false;
        
        allProducts.forEach(function(product) {
            const productName = product.querySelector('.product-name').textContent.toLowerCase();
            
            if (productName.includes(searchTerm)) {
                product.style.display = 'block';
                hasResults = true;
            } else {
                product.style.display = 'none';
            }
        });
        
        // Filter categories
        allCategories.forEach(function(category) {
            const categoryName = category.querySelector('.category-name').textContent.toLowerCase();
            
            if (categoryName.includes(searchTerm)) {
                category.style.display = 'block';
                hasResults = true;
            } else {
                category.style.display = 'none';
            }
        });
        
        // Show message if no results 
        if (!hasResults) {
            console.log('No results found for: ' + searchTerm);
            
        }
    });
    
    // Clear search on input clear
    searchInput.addEventListener('input', function() {
        if (searchInput.value === '') {
            showAllContent();
        }
    });
    
    // Allow search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    function showAllContent() {
        allProducts.forEach(function(product) {
            product.style.display = 'block';
        });
        
        allCategories.forEach(function(category) {
            category.style.display = 'block';
        });
    }
});

// Promotional Image Slider
document.addEventListener('DOMContentLoaded', function() {
    const promoImages = document.querySelectorAll('.promo-image');
    let currentImageIndex = 0;
    
    if (promoImages.length > 0) {
        // Change image every 4 seconds
        setInterval(function() {
            // Remove active class from current image
            promoImages[currentImageIndex].classList.remove('active');
            
            // Move to next image
            currentImageIndex = (currentImageIndex + 1) % promoImages.length;
            
            // Add active class to new current image
            promoImages[currentImageIndex].classList.add('active');
        }, 4000);
    }
});