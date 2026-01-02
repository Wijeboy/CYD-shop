// Signup form handling
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const terms = document.getElementById('terms').checked;
        
        // Validate terms acceptance
        if (!terms) {
            alert('Please accept the terms & policy');
            return;
        }
        
        // Validate password strength
        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        // Create user data object
        const userData = {
            name: name,
            phone: phone,
            email: email,
            password: password
        };
        
        try {
            // Make API call to backend (update URL when backend is ready)
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Account created successfully!');
                // Redirect to signin page or dashboard
                window.location.href = 'signin.html';
            } else {
                alert(data.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again later.');
        }
    });
});

// Google Sign In (placeholder)
document.querySelector('.btn-google').addEventListener('click', function() {
    alert('Google Sign In - Integration coming soon!');
    // Implement Google OAuth here
});

// Apple Sign In (placeholder)
document.querySelector('.btn-apple').addEventListener('click', function() {
    alert('Apple Sign In - Integration coming soon!');
    // Implement Apple OAuth here
});
