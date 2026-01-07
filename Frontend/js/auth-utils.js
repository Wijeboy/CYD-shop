// Authentication utility functions for JWT session management

// Store authentication data
function setAuthToken(token) {
    localStorage.setItem('token', token);
}

function setAuthUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Get authentication data
function getAuthToken() {
    return localStorage.getItem('token');
}

function getAuthUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getAuthToken();
}

// Clear authentication data (logout)
function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Verify token validity with backend
async function verifyToken() {
    const token = getAuthToken();
    
    if (!token) {
        return { valid: false, message: 'No token found' };
    }

    try {
        const response = await fetch('http://localhost:5001/api/auth/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();
        
        if (!data.success || !data.valid) {
            clearAuth();
            return { valid: false, message: data.message };
        }

        return { valid: true, user: data.user };
    } catch (error) {
        console.error('Token verification error:', error);
        return { valid: false, message: 'Network error' };
    }
}

// Refresh token
async function refreshToken() {
    const token = getAuthToken();
    
    if (!token) {
        return { success: false, message: 'No token found' };
    }

    try {
        const response = await fetch('http://localhost:5001/api/auth/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            setAuthToken(data.token);
            return { success: true, token: data.token };
        }

        clearAuth();
        return { success: false, message: data.message };
    } catch (error) {
        console.error('Token refresh error:', error);
        return { success: false, message: 'Network error' };
    }
}

// Logout user
async function logout() {
    const token = getAuthToken();
    
    if (token) {
        try {
            await fetch('http://localhost:5001/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    clearAuth();
    window.location.href = 'signin.html';
}

// Fetch authenticated user profile
async function fetchUserProfile() {
    const token = getAuthToken();
    
    if (!token) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const response = await fetch('http://localhost:5001/api/auth/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            setAuthUser(data.user);
            return { success: true, user: data.user };
        }

        if (response.status === 401) {
            clearAuth();
        }

        return { success: false, message: data.message };
    } catch (error) {
        console.error('Fetch profile error:', error);
        return { success: false, message: 'Network error' };
    }
}

// Make authenticated API request
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    // If unauthorized, clear auth and redirect to login
    if (response.status === 401) {
        clearAuth();
        window.location.href = 'signin.html';
        throw new Error('Session expired. Please login again.');
    }

    return response;
}

// Protect page - redirect if not authenticated
async function requireAuth() {
    const token = getAuthToken();
    
    if (!token) {
        window.location.href = 'signin.html';
        return false;
    }

    const verification = await verifyToken();
    
    if (!verification.valid) {
        window.location.href = 'signin.html';
        return false;
    }

    return true;
}

// Redirect if already authenticated (for login/signup pages)
function redirectIfAuthenticated(redirectTo = 'index.html') {
    if (isAuthenticated()) {
        window.location.href = redirectTo;
    }
}

// Inactivity timeout - auto logout after 10 minutes of inactivity
let inactivityTimer;
let lastActivityTime;
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const WARNING_TIME = 9 * 60 * 1000; // Show warning at 9 minutes (1 minute before logout)

function resetInactivityTimer() {
    // Clear existing timer
    clearTimeout(inactivityTimer);
    
    // Update last activity time
    lastActivityTime = Date.now();
    
    // Set new timer
    inactivityTimer = setTimeout(() => {
        if (typeof showToast === 'function') {
            showToast('You have been logged out due to 10 minutes of inactivity.', 'warning', 3000);
        }
        setTimeout(() => logout(), 1000);
    }, INACTIVITY_TIMEOUT);
}

function startInactivityMonitor() {
    // Only start if user is authenticated
    if (!isAuthenticated()) {
        return;
    }
    
    // Events that count as user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Reset timer on any activity
    activityEvents.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    
    // Start the initial timer
    resetInactivityTimer();
    
    console.log('✓ Inactivity monitor started - Auto logout after 10 minutes of inactivity');
}

function stopInactivityMonitor() {
    clearTimeout(inactivityTimer);
    
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
    });
}
