// Signin form handling with JWT session management
document.addEventListener('DOMContentLoaded', function() {
    // Redirect if already authenticated
    redirectIfAuthenticated('index.html');

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
            showToast('Please fill in all fields', 'warning');
            return;
        }
        
        // Validate email format
        if (!validateEmail()) {
            showToast('Please enter a valid email address', 'warning');
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            showToast('Password must be at least 6 characters long', 'warning');
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
                showToast(`Welcome back, ${data.user.name}!`, 'success');
                
                // Redirect to home page
                setTimeout(() => window.location.href = 'index.html', 1000);
            } else {
                // Show error message
                showToast(data.message || 'Login failed. Please check your credentials.', 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Sign In';
            }
        } catch (error) {
            console.error('Login Error:', error);
            showToast('Network error. Please check your connection and try again.', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Sign In';
        }
    });

    // Password toggle functionality
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            const svgPath = this.querySelector('svg path');
            const svgCircle = this.querySelector('svg circle');
            
            if (type === 'text') {
                // Eye-off icon (password visible)
                svgPath.setAttribute('d', 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z');
                if (svgCircle) svgCircle.style.display = 'none';
            } else {
                // Eye icon (password hidden)
                svgPath.setAttribute('d', 'M12 5C5.636 5 2 12 2 12s3.636 7 10 7 10-7 10-7-3.636-7-10-7z');
                if (svgCircle) svgCircle.style.display = '';
            }
        });
    }
});

// Google Sign In (placeholder)
document.addEventListener('DOMContentLoaded', function() {
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Google Sign In - Integration coming soon!', 'info');
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
            showToast('Apple Sign In - Integration coming soon!', 'info');
            // Implement Apple OAuth here
        });
    }
});
