// API Base URL
const API_URL = 'http://localhost:5001/api';

// Check admin authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    await verifyAdminAccess();
    await loadAdminProfile();
    await loadDashboardStats();
    
    // Dropdown toggle
    const dropdownIcon = document.getElementById('dropdownIcon');
    const dropdownContent = document.getElementById('dropdownContent');
    
    dropdownIcon.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);
    
    // Change button handler
    const changeBtn = document.getElementById('changeBtn');
    changeBtn.addEventListener('click', openChangeModal);
    
    // Listen for profile updates from other tabs/windows
    window.addEventListener('storage', function(e) {
        if (e.key === 'user' || !e.key) {
            loadAdminProfile();
        }
    });
    
    // Modal handlers
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    cancelModalBtn.addEventListener('click', closeChangeModal);
    
    const changeStatsForm = document.getElementById('changeStatsForm');
    changeStatsForm.addEventListener('submit', handleUpdateStats);
    
    // Close modal when clicking outside
    const modal = document.getElementById('changeModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeChangeModal();
        }
    });
});

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// Verify admin access
async function verifyAdminAccess() {
    const token = getAuthToken();
    
    if (!token) {
        alert('Please login as admin to access this page');
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
        
        if (!response.ok) {
            throw new Error('Not authorized');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Admin verification failed');
        }
        
        // Update admin name in sidebar if needed
        console.log('Admin verified:', data.user.name);
        
    } catch (error) {
        console.error('Admin verification error:', error);
        alert('You do not have admin access');
        window.location.href = '../index.html';
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/admin/dashboard-stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard stats');
        }
        
        const result = await response.json();
        
        if (result.success) {
            updateDashboardUI(result.data);
        }
    } catch (error) {
        console.error('Load stats error:', error);
        alert('Failed to load dashboard statistics');
    }
}

// Update dashboard UI with stats
function updateDashboardUI(data) {
    document.getElementById('totalCustomers').textContent = data.totalCustomers;
    document.getElementById('ordersPending').textContent = data.ordersPending;
    document.getElementById('totalRevenue').textContent = `$${data.totalRevenue}`;
}

// Open change modal with current values
function openChangeModal() {
    const currentCustomers = document.getElementById('totalCustomers').textContent;
    const currentOrders = document.getElementById('ordersPending').textContent;
    const currentRevenue = document.getElementById('totalRevenue').textContent.replace('$', '');
    
    // Populate modal inputs with current values
    document.getElementById('modalTotalCustomers').value = currentCustomers;
    document.getElementById('modalOrdersPending').value = currentOrders;
    document.getElementById('modalTotalRevenue').value = currentRevenue;
    
    // Show modal
    const modal = document.getElementById('changeModal');
    modal.classList.add('show');
}

// Close change modal
function closeChangeModal() {
    const modal = document.getElementById('changeModal');
    modal.classList.remove('show');
}

// Handle update stats form submission
async function handleUpdateStats(event) {
    event.preventDefault();
    
    const totalCustomers = document.getElementById('modalTotalCustomers').value;
    const ordersPending = document.getElementById('modalOrdersPending').value;
    const totalRevenue = document.getElementById('modalTotalRevenue').value;
    
    // Validate inputs
    if (!totalCustomers || !ordersPending || !totalRevenue) {
        alert('Please fill in all fields');
        return;
    }
    
    if (isNaN(totalCustomers) || isNaN(ordersPending) || isNaN(totalRevenue)) {
        alert('Please enter valid numbers');
        return;
    }
    
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/admin/dashboard-stats`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                totalCustomers: parseInt(totalCustomers),
                ordersPending: parseInt(ordersPending),
                totalRevenue: parseFloat(totalRevenue)
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update stats');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Update UI with new values
            updateDashboardUI(result.data);
            
            // Close modal
            closeChangeModal();
            
            alert('Dashboard statistics updated successfully!');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Update stats error:', error);
        alert('Failed to update dashboard statistics. Please try again.');
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
            // Update sidebar profile picture and name
            const profileIcon = document.querySelector('.profile-icon');
            const profileName = document.querySelector('.profile-name');
            
            if (data.admin.profileImage && data.admin.profileImage !== 'User panel images/default-avatar.png') {
                const timestamp = new Date().getTime();
                profileIcon.src = `http://localhost:5001/${data.admin.profileImage}?t=${timestamp}`;
            }
            
            if (profileName) {
                profileName.textContent = data.admin.name;
            }
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to signin page
        window.location.href = '../signin.html';
    }
}