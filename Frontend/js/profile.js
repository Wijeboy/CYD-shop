// Profile page with JWT authentication
document.addEventListener('DOMContentLoaded', async function() {
    // Protect this page - require authentication
    const authenticated = await requireAuth();
    if (!authenticated) {
        return; // Will be redirected to signin by requireAuth()
    }

    // Start inactivity monitor (auto logout after 10 minutes)
    startInactivityMonitor();

    // Load user profile
    await loadUserProfile();
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Function to load user profile from JWT token
async function loadUserProfile() {
    try {
        // Always fetch fresh data from backend to get latest profile image
        const result = await fetchUserProfile();
        if (result.success) {
            const user = result.user;
            // Update localStorage with fresh data
            setAuthUser(user);
            // Display user profile
            displayUserProfile(user);
        } else {
            throw new Error('Failed to load profile');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile. Please try again.', 'error');
        setTimeout(() => window.location.href = 'index.html', 1500);
    }
}

// Function to display user profile
function displayUserProfile(user) {
    // Update user name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.name || 'User';
    }
    
    // Update email
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
        userEmailElement.textContent = user.email || 'Not provided';
    }
    
    // Update contact number with country code
    const userContactElement = document.getElementById('userContact');
    if (userContactElement) {
        const phoneDisplay = user.countryCode && user.phone 
            ? `${user.countryCode} ${user.phone}` 
            : user.phone || 'Not provided';
        userContactElement.textContent = phoneDisplay;
    }
    
    // Update address
    const userAddressElement = document.getElementById('userAddress');
    if (userAddressElement) {
        userAddressElement.textContent = user.address || 'Not provided';
    }
    
    // Update country
    const userCountryElement = document.getElementById('userCountry');
    if (userCountryElement) {
        userCountryElement.textContent = user.country || 'Not provided';
    }
    
    // Update postal code
    const userPostalCodeElement = document.getElementById('userPostalCode');
    if (userPostalCodeElement) {
        userPostalCodeElement.textContent = user.postalCode || 'Not provided';
    }
    
    // Update profile image
    const profileImage = document.getElementById('profileImage');
    if (profileImage) {
        if (user.profileImage && user.profileImage !== 'User panel images/default-avatar.png') {
            // Load from backend uploads folder with timestamp to prevent caching
            const timestamp = new Date().getTime();
            profileImage.src = 'http://localhost:5001/' + user.profileImage + '?t=' + timestamp;
        } else {
            // Use default avatar
            profileImage.src = 'User panel images/default-avatar.png';
        }
        profileImage.alt = user.name || 'Profile Picture';
    }
    
    // Password is always shown as asterisks for security
    const userPasswordElement = document.getElementById('userPassword');
    if (userPasswordElement) {
        userPasswordElement.textContent = '**********';
    }
}

// Function to handle logout
function handleLogout() {
    showConfirm('Are you sure you want to logout?', () => {
        stopInactivityMonitor(); // Stop the inactivity timer
        logout(); // From auth-utils.js - clears token and redirects to signin
    });
}

// Function to handle logout from navigation bar
function handleNavLogout() {
    handleLogout();
}

// Optional: Refresh profile data from server
async function refreshProfile() {
    const result = await fetchUserProfile();
    if (result.success) {
        displayUserProfile(result.user);
        showToast('Profile refreshed successfully!', 'success');
    } else {
        showToast('Failed to refresh profile: ' + result.message, 'error');
    }
}
