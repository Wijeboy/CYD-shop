// API Base URL
const API_URL = 'http://localhost:5000/api';

// Store original password to track if user changed it
let passwordChanged = false;

// Load user profile on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadUserProfile();
    
    // Form submission handler
    const editForm = document.getElementById('editProfileForm');
    editForm.addEventListener('submit', handleFormSubmit);
    
    // Cancel button handler
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function() {
        window.location.href = 'profile.html';
    });
    
    // Image upload handler
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Password change handler
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    passwordInput.addEventListener('input', function() {
        if (passwordInput.value.trim() !== '') {
            confirmPasswordInput.disabled = false;
            confirmPasswordInput.required = true;
            passwordChanged = true;
        } else {
            confirmPasswordInput.disabled = true;
            confirmPasswordInput.required = false;
            confirmPasswordInput.value = '';
            passwordChanged = false;
        }
    });
});

// Function to get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Function to load user profile
async function loadUserProfile() {
    const token = getAuthToken();
    
    if (!token) {
        alert('Please login to edit your profile');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to load profile');
        }
        
        const data = await response.json();
        
        if (data.success) {
            populateForm(data.user);
        } else {
            throw new Error('Failed to load profile data');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load profile. Please try again.');
    }
}

// Function to populate form with user data
function populateForm(user) {
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('contactNumber').value = user.contactNumber;
    
    // Update profile image
    const profileImage = document.getElementById('profileImage');
    if (user.profileImage && user.profileImage !== 'default-avatar.png') {
        profileImage.src = `http://localhost:5000/uploads/${user.profileImage}`;
    } else {
        profileImage.src = 'images/default-avatar.png';
    }
}

// Function to handle image upload
async function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
    }
    
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('profileImage', file);
    
    try {
        const response = await fetch(`${API_URL}/users/profile/upload-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to upload image');
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Update preview image
            const profileImage = document.getElementById('profileImage');
            profileImage.src = `http://localhost:5000/uploads/${data.imagePath}?t=${Date.now()}`;
            alert('Profile image updated successfully!');
        } else {
            throw new Error('Failed to upload image');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
    }
}

// Function to handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!name || !email || !contactNumber) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Validate password if changed
    if (passwordChanged) {
        if (!password) {
            alert('Please enter a new password');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
    }
    
    // Prepare update data
    const updateData = {
        name,
        email,
        contactNumber
    };
    
    // Add password only if changed
    if (passwordChanged && password) {
        updateData.password = password;
    }
    
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        
        const data = await response.json();
        
        if (data.success) {
            alert('Profile updated successfully!');
            
            // If password was changed, inform user
            if (passwordChanged) {
                alert('Your password has been updated. Please use your new password for future logins.');
            }
            
            // Redirect to profile page
            window.location.href = 'profile.html';
        } else {
            throw new Error(data.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    }
}