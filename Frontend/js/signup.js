// Signup form handling with real-time validation
document.addEventListener('DOMContentLoaded', function() {
    // Redirect if already authenticated
    redirectIfAuthenticated('index.html');

    const signupForm = document.getElementById('signupForm');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const countryCodeSelect = document.getElementById('countryCode');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');
    
    // Populate country codes dropdown
    countryCodes.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = `${country.flag} ${country.code} ${country.country}`;
        countryCodeSelect.appendChild(option);
    });

    // Set default country (United States)
    countryCodeSelect.value = '+1';

    // Real-time email validation and existence check
    let emailCheckTimeout;
    emailInput.addEventListener('input', function() {
        clearTimeout(emailCheckTimeout);
        emailError.textContent = '';
        emailError.style.color = '';

        const email = this.value.trim();
        
        if (!email) {
            return;
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailError.style.color = '#ff4444';
            return;
        }

        // Check email existence after user stops typing (500ms delay)
        emailCheckTimeout = setTimeout(async () => {
            try {
                const response = await fetch('http://localhost:5001/api/auth/check-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                
                if (data.success && data.exists) {
                    emailError.textContent = '⚠️ This email is already registered';
                    emailError.style.color = '#ff4444';
                } else if (data.success && !data.exists) {
                    emailError.textContent = '✓ Email is available';
                    emailError.style.color = '#4CAF50';
                }
            } catch (error) {
                console.error('Email check error:', error);
                // Don't show error to user - may be offline/testing
            }
        }, 500);
    });

    // Phone number validation based on country code
    phoneInput.addEventListener('input', function() {
        phoneError.textContent = '';
        
        const phoneNumber = this.value.trim();
        const selectedCountryCode = countryCodeSelect.value;

        if (!phoneNumber || !selectedCountryCode) {
            return;
        }

        const validation = validatePhoneNumber(selectedCountryCode, phoneNumber);
        
        if (!validation.valid) {
            phoneError.textContent = validation.message;
            phoneError.style.color = '#ff4444';
        } else {
            phoneError.textContent = '✓ Valid phone number';
            phoneError.style.color = '#4CAF50';
        }
    });

    // Revalidate phone when country code changes
    countryCodeSelect.addEventListener('change', function() {
        if (phoneInput.value.trim()) {
            phoneInput.dispatchEvent(new Event('input'));
        }
    });

    // Password toggle functionality
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            const icon = this.querySelector('svg path');
            if (type === 'password') {
                // Eye icon
                icon.setAttribute('d', 'M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
            } else {
                // Eye-off icon
                icon.setAttribute('d', 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z');
            }
        });
    }
    
    // Form submission
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const phone = phoneInput.value.trim();
        const countryCode = countryCodeSelect.value;
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const terms = document.getElementById('terms').checked;
        
        // Validate terms acceptance
        if (!terms) {
            alert('Please accept the terms & policy');
            return;
        }

        // Validate all fields are filled
        if (!name || !email || !phone || !countryCode || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Validate phone number
        const phoneValidation = validatePhoneNumber(countryCode, phone);
        if (!phoneValidation.valid) {
            alert(phoneValidation.message);
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
            countryCode: countryCode,
            email: email,
            password: password
        };
        
        try {
            // Make API call to backend
            const response = await fetch('http://localhost:5001/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Account created successfully!');
                // Store authentication data using utility functions
                if (data.token) {
                    setAuthToken(data.token);
                    setAuthUser(data.user);
                }
                // Redirect to home page
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please check your connection and try again.');
        }
    });
});

// Google Sign In (placeholder)
document.querySelector('.btn-google')?.addEventListener('click', function() {
    alert('Google Sign In - Integration coming soon!');
    // Implement Google OAuth here
});

// Apple Sign In (placeholder)
document.querySelector('.btn-apple')?.addEventListener('click', function() {
    alert('Apple Sign In - Integration coming soon!');
    // Implement Apple OAuth here
});
