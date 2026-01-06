// Signin form handling with JWT session management
document.addEventListener('DOMContentLoaded', function() {
    // Redirect if already authenticated
    redirectIfAuthenticated('dashboard.html');

    const signinForm = document.getElementById('signinForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const submitButton = signinForm.querySelector('button[type="submit"]');
    
    // Real-time email validation
    emailInput.addEventListener('input', function() {
        validateEmail();
    });
    
    emailInput.addEventListener('blur', function() {
        validateEmail();
    });
    
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailInput.style.borderColor = '#ef4444';
            return false;
        } else {
            emailError.textContent = '';
            emailInput.style.borderColor = '';
            return true;
        }
    }
    
    // Form submission
    signinForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('remember')?.checked || false;
        
        // Validate inputs
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        // Validate email format
        if (!validateEmail()) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        // Disable submit button during request
        submitButton.disabled = true;
        submitButton.textContent = 'Signing in...';
        
        try {
            // Make API call to backend
            const response = await fetch('http://localhost:5001/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Store authentication data using utility functions
                setAuthToken(data.token);
                setAuthUser(data.user);
                
                // Show success message
                alert(`Welcome back, ${data.user.name}!`);
                
                // Redirect to dashboard or home page
                window.location.href = 'dashboard.html';
            } else {
                // Show error message
                alert(data.message || 'Login failed. Please check your credentials.');
                submitButton.disabled = false;
                submitButton.textContent = 'Sign In';
            }
        } catch (error) {
            console.error('Login Error:', error);
            alert('Network error. Please check your connection and try again.');
            submitButton.disabled = false;
            submitButton.textContent = 'Sign In';
        }
    });
});

// Google Sign In (placeholder)
document.addEventListener('DOMContentLoaded', function() {
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Google Sign In - Integration coming soon!');
            // Implement Google OAuth here
        });
    }
});

// Apple Sign In (placeholder)
document.addEventListener('DOMContentLoaded', function() {
    const appleBtn = document.querySelector('.btn-apple');
    if (appleBtn) {
        appleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Apple Sign In - Integration coming soon!');
            // Implement Apple OAuth here
        });
    }
});
