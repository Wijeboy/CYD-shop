// API Base URL
const API_URL = 'http://localhost:5001/api';

// Check admin authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    await verifyAdminAccess();
    await loadAdmins();
    
    // Dropdown toggle
    const dropdownIcon = document.getElementById('dropdownIcon');
    const dropdownContent = document.getElementById('dropdownContent');
    
    dropdownIcon.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);
    
    // Form submission
    const addAdminForm = document.getElementById('addAdminForm');
    addAdminForm.addEventListener('submit', handleAddAdmin);
    
    // Real-time validation
    const emailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('adminPassword');
    const confirmPasswordInput = document.getElementById('adminConfirmPassword');
    
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);
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

// Validate email
function validateEmail() {
    const emailInput = document.getElementById('adminEmail');
    const emailError = document.getElementById('emailError');
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

// Validate password
function validatePassword() {
    const passwordInput = document.getElementById('adminPassword');
    const passwordError = document.getElementById('passwordError');
    const password = passwordInput.value;
    
    if (password && password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        passwordInput.style.borderColor = '#ef4444';
        return false;
    } else {
        passwordError.textContent = '';
        passwordInput.style.borderColor = '';
        return true;
    }
}

// Validate confirm password
function validateConfirmPassword() {
    const passwordInput = document.getElementById('adminPassword');
    const confirmPasswordInput = document.getElementById('adminConfirmPassword');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    
    if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
        confirmPasswordError.textContent = 'Passwords do not match';
        confirmPasswordInput.style.borderColor = '#ef4444';
        return false;
    } else {
        confirmPasswordError.textContent = '';
        confirmPasswordInput.style.borderColor = '';
        return true;
    }
}

// Handle add admin form submission
async function handleAddAdmin(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('adminName').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const confirmPassword = document.getElementById('adminConfirmPassword').value;
    
    // Validate all fields
    if (!validateEmail() || !validatePassword() || !validateConfirmPassword()) {
        return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Disable submit button
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Admin...';
    
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/admin/create-admin`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('Admin account created successfully!');
            document.getElementById('addAdminForm').reset();
            await loadAdmins(); // Reload the admin list
        } else {
            throw new Error(data.message || 'Failed to create admin');
        }
    } catch (error) {
        console.error('Create admin error:', error);
        alert(error.message || 'Failed to create admin account');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Admin Account';
    }
}

// Load all admins
async function loadAdmins() {
    const adminList = document.getElementById('adminList');
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/admin/list-admins`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            displayAdmins(data.admins);
        } else {
            throw new Error(data.message || 'Failed to load admins');
        }
    } catch (error) {
        console.error('Load admins error:', error);
        adminList.innerHTML = '<div class="no-admins-message">Failed to load admins. Please refresh the page.</div>';
    }
}

// Display admins
function displayAdmins(admins) {
    const adminList = document.getElementById('adminList');
    
    if (!admins || admins.length === 0) {
        adminList.innerHTML = '<div class="no-admins-message">No admins found.</div>';
        return;
    }
    
    adminList.innerHTML = admins.map(admin => {
        const initial = admin.name.charAt(0).toUpperCase();
        return `
            <div class="admin-card">
                <div class="admin-info">
                    <div class="admin-avatar">${initial}</div>
                    <div class="admin-details">
                        <div class="admin-name">${admin.name}</div>
                        <div class="admin-email">${admin.email}</div>
                    </div>
                </div>
                <div class="admin-badge">Admin</div>
            </div>
        `;
    }).join('');
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../signin.html';
    }
}
