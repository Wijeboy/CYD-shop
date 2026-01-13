// Handle logout functionality
function handleLogout() {
    // Add your logout logic here
    if (confirm('Are you sure you want to logout?')) {
        // Redirect to login page or home page
        window.location.href = 'index.html';
    }
}

// Handle search functionality
document.getElementById('searchBtn').addEventListener('click', function() {
    const searchInput = document.getElementById('searchInput').value;
    if (searchInput.trim() !== '') {
        // Add your search logic here
        console.log('Searching for:', searchInput);
        // You can redirect to a search results page
        // window.location.href = `search.html?q=${encodeURIComponent(searchInput)}`;
    }
});

// Allow search on Enter key press
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

// Handle contact form submission
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Basic validation
    if (name.trim() === '' || email.trim() === '' || message.trim() === '') {
        alert('Please fill in all fields');
        return;
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Here you would typically send the data to a server
    console.log('Form submitted:', { name, email, message });
    
    // Show success message
    alert('Thank you for contacting us! We will get back to you soon.');
    
    // Reset form
    this.reset();
});