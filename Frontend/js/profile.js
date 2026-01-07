// API Base URL
const API_URL = 'http://localhost:5000/api';

// Load user profile on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadUserProfile();
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);
});

// Function to get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Function to load user profile
async function loadUserProfile() {
    const token = getAuthToken();
    
    if (!token) {
        // No token, redirect to login
        alert('Please login to view your profile');
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
                // Unauthorized, token might be expired
                alert('Session expired. Please login again.');
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to load profile');
        }
        
        const data = await response.json();
        
        if (data.success) {
            displayUserProfile(data.user);
        } else {
            throw new Error('Failed to load profile data');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load profile. Please try again.');
    }
}

// Function to display user profile
function displayUserProfile(user) {
    // Update user name
    document.getElementById('userName').textContent = user.name;
    
    // Update email
    document.getElementById('userEmail').textContent = user.email;
    
    // Update contact number
    document.getElementById('userContact').textContent = user.contactNumber;
    
    // Update profile image
    const profileImage = document.getElementById('profileImage');
    if (user.profileImage && user.profileImage !== 'default-avatar.png') {
        profileImage.src = `http://localhost:5000/uploads/${user.profileImage}`;
    } else {
        profileImage.src = 'images/default-avatar.png';
    }
    
    // Password is always shown as asterisks
    document.getElementById('userPassword').textContent = '**********';
}

// Function to handle logout
async function handleLogout() {
    const token = getAuthToken();
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Call logout API
        const response = await fetch(`${API_URL}/users/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Clear token regardless of response
        localStorage.removeItem('authToken');
        
        // Redirect to homepage
        alert('You have been logged out successfully');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error during logout:', error);
        // Clear token and redirect anyway
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    }
}