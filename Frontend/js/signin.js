// Signin form handling
document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signinForm');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    
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
    
    signinForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const email = emailInput.value.trim();
        const password = document.getElementById('password').value;
        
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
        
        // Create login data object
        const loginData = {
            email: email,
            password: password
        };
        
        try {
            // Make API call to backend (update URL when backend is ready)
            const response = await fetch('http://localhost:5000/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                alert('Login successful!');
                // Redirect to dashboard or home page
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again later.');
        }
    });
});
