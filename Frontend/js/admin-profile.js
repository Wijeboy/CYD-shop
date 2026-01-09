// API Base URL
const API_URL = 'http://localhost:5001/api';

// Check admin authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    await verifyAdminAccess();
    await loadAdminProfile();
    
    // Dropdown toggle
    const dropdownIcon = document.getElementById('dropdownIcon');
    const dropdownContent = document.getElementById('dropdownContent');
    
    dropdownIcon.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);
    
    // Upload button handler
    const uploadBtn = document.getElementById('uploadBtn');
    const profileImageInput = document.getElementById('profileImageInput');
    
    uploadBtn.addEventListener('click', function() {
        profileImageInput.click();
    });
    
    // Profile picture container click
    const profilePictureContainer = document.querySelector('.profile-picture-container');
    profilePictureContainer.addEventListener('click', function() {
        profileImageInput.click();
    });
    
    // Image input change handler
    profileImageInput.addEventListener('change', handleImageUpload);
    
    // Form submission
    const adminProfileForm = document.getElementById('adminProfileForm');
    adminProfileForm.addEventListener('submit', handleProfileUpdate);
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function() {
        window.location.href = 'admin-dashboard.html';
    });
    
    // Listen for profile updates from other tabs/windows
    window.addEventListener('storage', function(e) {
        if (e.key === 'user' || !e.key) {
            loadAdminProfile();
        }
    });
    
    // Password validation
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    newPassword.addEventListener('input', validateNewPassword);
    confirmPassword.addEventListener('input', validateConfirmPassword);
});

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Verify admin access
async function verifyAdminAccess() {
    const token = getAuthToken();
    
    if (!token) {
        alert('Please login as admin');
        window.location.href = '../signin.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Not authorized');
        }
    } catch (error) {
        console.error('Admin verification error:', error);
        alert('You do not have admin access');
        window.location.href = '../index.html';
    }
}

// Load admin profile
async function loadAdminProfile() {
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/admin/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            populateProfileData(data.admin);
        } else {
            throw new Error(data.message || 'Failed to load profile');
        }
    } catch (error) {
        console.error('Load profile error:', error);
        alert('Failed to load profile data');
    }
}

// Populate profile data
function populateProfileData(admin) {
    document.getElementById('adminName').value = admin.name || '';
    document.getElementById('adminEmail').value = admin.email || '';
    
    // Update profile picture
    if (admin.profileImage && admin.profileImage !== 'User panel images/default-avatar.png') {
        const profilePicture = document.getElementById('profilePicture');
        const sidebarProfileImg = document.getElementById('sidebarProfileImg');
        const timestamp = new Date().getTime();
        
        profilePicture.src = `http://localhost:5001/${admin.profileImage}?t=${timestamp}`;
        sidebarProfileImg.src = `http://localhost:5001/${admin.profileImage}?t=${timestamp}`;
    }
    
    // Update sidebar name
    document.getElementById('sidebarProfileName').textContent = admin.name || 'Admin';
}

// Handle image upload
async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Image size should not exceed 2MB');
        return;
    }
    
    const formData = new FormData();
    formData.append('profileImage', file);
    
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/admin/upload-profile-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Update profile picture immediately
            const profilePicture = document.getElementById('profilePicture');
            const sidebarProfileImg = document.getElementById('sidebarProfileImg');
            const timestamp = new Date().getTime();
            
            profilePicture.src = `http://localhost:5001/${data.profileImage}?t=${timestamp}`;
            sidebarProfileImg.src = `http://localhost:5001/${data.profileImage}?t=${timestamp}`;
            
            // Update localStorage to trigger updates in other tabs
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.profileImage = data.profileImage;
            user.profileUpdateTime = timestamp;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Broadcast storage event for other tabs
            window.dispatchEvent(new Event('storage'));
            
            alert('Profile picture updated successfully!');
        } else {
            throw new Error(data.message || 'Failed to upload image');
        }
    } catch (error) {
        console.error('Upload image error:', error);
        alert(error.message || 'Failed to upload profile picture');
    }
}

// Validate new password
function validateNewPassword() {
    const newPassword = document.getElementById('newPassword');
    const newPasswordError = document.getElementById('newPasswordError');
    
    if (newPassword.value && newPassword.value.length < 6) {
        newPasswordError.textContent = 'Password must be at least 6 characters';
        newPassword.style.borderColor = '#ef4444';
        return false;
    } else {
        newPasswordError.textContent = '';
        newPassword.style.borderColor = '';
        return true;
    }
}

// Validate confirm password
function validateConfirmPassword() {
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    
    if (confirmPassword.value && confirmPassword.value !== newPassword.value) {
        confirmPasswordError.textContent = 'Passwords do not match';
        confirmPassword.style.borderColor = '#ef4444';
        return false;
    } else {
        confirmPasswordError.textContent = '';
        confirmPassword.style.borderColor = '';
        return true;
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const name = document.getElementById('adminName').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate password fields if any password field is filled
    if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) {
            alert('Please enter your current password');
            return;
        }
        
        if (!newPassword) {
            alert('Please enter a new password');
            return;
        }
        
        if (!validateNewPassword() || !validateConfirmPassword()) {
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
    }
    
    const submitBtn = document.querySelector('.btn-save');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        const token = getAuthToken();
        const updateData = { name, email };
        
        if (currentPassword && newPassword) {
            updateData.currentPassword = currentPassword;
            updateData.newPassword = newPassword;
        }
        
        const response = await fetch(`${API_URL}/admin/update-profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('Profile updated successfully!');
            
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            // Update local storage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.name = name;
            user.email = email;
            user.profileUpdateTime = new Date().getTime();
            localStorage.setItem('user', JSON.stringify(user));
            
            // Broadcast storage event for other tabs
            window.dispatchEvent(new Event('storage'));
            
            // Reload profile data
            await loadAdminProfile();
        } else {
            throw new Error(data.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        alert(error.message || 'Failed to update profile');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../signin.html';
    }
}
