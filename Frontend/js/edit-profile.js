// Edit Profile page with JWT authentication
document.addEventListener('DOMContentLoaded', async function() {
    // Protect this page - require authentication
    const authenticated = await requireAuth();
    if (!authenticated) {
        return; // Will be redirected to signin by requireAuth()
    }

    // Start inactivity monitor (auto logout after 10 minutes)
    startInactivityMonitor();

    // Populate country codes dropdown
    populateCountryCodes();

    // Populate countries dropdown
    populateCountries();

    // Load user profile data
    await loadUserData();

    // Setup event listeners
    setupEventListeners();
});

// Populate country codes dropdown
function populateCountryCodes() {
    const countryCodeSelect = document.getElementById('countryCode');
    
    countryCodes.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = `${country.flag} ${country.code} ${country.country}`;
        countryCodeSelect.appendChild(option);
    });
}

// Populate countries dropdown
function populateCountries() {
    const countrySelect = document.getElementById('country');
    
    // Get unique countries (some countries share phone codes)
    const uniqueCountries = [];
    const countryNames = new Set();
    
    countryCodes.forEach(country => {
        if (!countryNames.has(country.country)) {
            countryNames.add(country.country);
            uniqueCountries.push(country);
        }
    });
    
    // Sort alphabetically
    uniqueCountries.sort((a, b) => a.country.localeCompare(b.country));
    
    // Add options
    uniqueCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.country;
        option.textContent = `${country.flag} ${country.country}`;
        countrySelect.appendChild(option);
    });
}

// Load user data from JWT token
async function loadUserData() {
    try {
        // Get user from localStorage
        let user = getAuthUser();
        
        // If no user in localStorage, fetch from backend
        if (!user) {
            const result = await fetchUserProfile();
            if (result.success) {
                user = result.user;
            } else {
                throw new Error('Failed to load profile');
            }
        }
        
        // Populate form with user data
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('countryCode').value = user.countryCode || '';
        document.getElementById('contactNumber').value = user.phone || '';
        document.getElementById('address').value = user.address || '';
        document.getElementById('country').value = user.country || '';
        document.getElementById('postalCode').value = user.postalCode || '';
        
        // Update profile image
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            if (user.profileImage && user.profileImage !== 'User panel images/default-avatar.png') {
                // Add timestamp to prevent caching
                const timestamp = new Date().getTime();
                profileImage.src = 'http://localhost:5001/' + user.profileImage + '?t=' + timestamp;
            } else {
                profileImage.src = 'User panel images/default-avatar.png';
            }
            profileImage.alt = user.name || 'Profile Picture';
        }
        
        console.log('User data loaded successfully');
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Failed to load profile data. Please try again.', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('editProfileForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const oldPasswordInput = document.getElementById('oldPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const imageUpload = document.getElementById('imageUpload');
    const phoneInput = document.getElementById('contactNumber');
    const countryCodeSelect = document.getElementById('countryCode');

    // Enable new password field when old password is entered
    oldPasswordInput.addEventListener('input', function() {
        if (this.value) {
            passwordInput.disabled = false;
        } else {
            passwordInput.disabled = true;
            passwordInput.value = '';
            confirmPasswordInput.disabled = true;
            confirmPasswordInput.value = '';
        }
    });

    // Enable/disable confirm password based on new password field
    passwordInput.addEventListener('input', function() {
        if (this.value) {
            confirmPasswordInput.disabled = false;
            confirmPasswordInput.required = true;
        } else {
            confirmPasswordInput.disabled = true;
            confirmPasswordInput.required = false;
            confirmPasswordInput.value = '';
        }
    });

    // Phone number validation
    phoneInput.addEventListener('input', function() {
        const phoneError = document.getElementById('phoneError');
        const phoneNumber = this.value.trim();
        const selectedCountryCode = countryCodeSelect.value;

        if (!phoneNumber || !selectedCountryCode) {
            phoneError.textContent = '';
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

    // Image upload preview
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profileImage').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Cancel button - go back to profile page
    cancelBtn.addEventListener('click', function() {
        showConfirm('Are you sure you want to cancel? Any unsaved changes will be lost.', () => {
            window.location.href = 'profile.html';
        });
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveProfile();
    });
}

// Save profile updates
async function saveProfile() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('contactNumber').value.trim();
    const countryCode = document.getElementById('countryCode').value;
    const address = document.getElementById('address').value.trim();
    const country = document.getElementById('country').value.trim();
    const postalCode = document.getElementById('postalCode').value.trim();
    const oldPassword = document.getElementById('oldPassword').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const imageUpload = document.getElementById('imageUpload');

    // Validation
    if (!name || !email || !phone || !countryCode) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'warning');
        return;
    }

    // Phone validation
    const phoneValidation = validatePhoneNumber(countryCode, phone);
    if (!phoneValidation.valid) {
        showToast(phoneValidation.message, 'warning');
        return;
    }

    // Password validation if old password is provided
    if (oldPassword) {
        if (!password) {
            showToast('Please enter a new password', 'warning');
            return;
        }
        if (password.length < 6) {
            showToast('New password must be at least 6 characters long', 'warning');
            return;
        }
        if (password !== confirmPassword) {
            showToast('New passwords do not match', 'warning');
            return;
        }
    }

    // If new password is entered without old password
    if (password && !oldPassword) {
        showToast('Please enter your current password to change your password', 'warning');
        return;
    }

    try {
        const token = getAuthToken();
        
        if (!token) {
            showToast('Session expired. Please login again.', 'error');
            setTimeout(() => window.location.href = 'signin.html', 1500);
            return;
        }

        // Use FormData to send file along with other data
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('countryCode', countryCode);
        formData.append('address', address);
        formData.append('country', country);
        formData.append('postalCode', postalCode);

        // Add passwords only if changing password
        if (oldPassword && password) {
            formData.append('oldPassword', oldPassword);
            formData.append('password', password);
        }

        // Add profile image if selected
        if (imageUpload.files && imageUpload.files[0]) {
            formData.append('profileImage', imageUpload.files[0]);
        }

        // Call API to update profile
        const response = await fetch('http://localhost:5001/api/auth/update-profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type header - browser will set it with boundary for FormData
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Update stored user data with fresh data from backend
            setAuthUser(data.user);
            
            // Clear any cached profile data and force reload
            localStorage.removeItem('lastProfileRefresh');
            
            showToast('Profile updated successfully!', 'success');
            setTimeout(() => window.location.href = 'profile.html', 1500);
        } else {
            showToast(data.message || 'Failed to update profile. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Network error. Please check your connection and try again.', 'error');
    }
}

// Logout function
function handleLogout() {
    showConfirm('Are you sure you want to logout?', () => {
        stopInactivityMonitor();
        logout();
    });
}
