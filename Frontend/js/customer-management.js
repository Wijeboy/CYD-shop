// API Base URL
const API_URL = 'http://localhost:5001/api';
let allCustomers = [];

// Check admin authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await verifyAdminAccess();
        await loadAdminProfile();
        await loadCustomers();
    } catch (error) {
        console.error('Initialization error:', error);
    }
    
    // Dropdown toggle
    const dropdownIcon = document.getElementById('dropdownIcon');
    const dropdownContent = document.getElementById('dropdownContent');
    
    dropdownIcon.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Edit form submission
    const editCustomerForm = document.getElementById('editCustomerForm');
    editCustomerForm.addEventListener('submit', handleEditCustomer);
    
    // Phone validation
    const phoneInput = document.getElementById('editCustomerPhone');
    const countryCodeSelect = document.getElementById('editCustomerCountryCode');
    
    phoneInput.addEventListener('input', validatePhone);
    phoneInput.addEventListener('blur', validatePhone);
    countryCodeSelect.addEventListener('change', validatePhone);
    
    // Email validation
    const emailInput = document.getElementById('editCustomerEmail');
    emailInput.addEventListener('blur', validateEmail);
    
    // Password validation
    const passwordInput = document.getElementById('editCustomerPassword');
    passwordInput.addEventListener('input', validatePassword);
    passwordInput.addEventListener('blur', validatePassword);
    
    // Cancel buttons
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const cancelViewBtn = document.getElementById('cancelViewBtn');
    
    cancelEditBtn.addEventListener('click', closeEditModal);
    cancelViewBtn.addEventListener('click', closeViewModal);
    
    // Close modals when clicking outside
    const editModal = document.getElementById('editCustomerModal');
    const viewModal = document.getElementById('viewCustomerModal');
    
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    viewModal.addEventListener('click', function(e) {
        if (e.target === viewModal) {
            closeViewModal();
        }
    });
    
    // Listen for profile updates
    window.addEventListener('storage', function(e) {
        if (e.key === 'user' || !e.key) {
            loadAdminProfile();
        }
    });
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

// Populate country codes dropdown
function populateCountryCodes() {
    const countryCodeSelect = document.getElementById('editCustomerCountryCode');
    
    if (!countryCodeSelect) {
        console.log('Country code select not found');
        return;
    }
    
    // Check if countryCodes is defined
    if (typeof countryCodes === 'undefined') {
        console.error('countryCodes is not defined. Make sure country-codes.js is loaded.');
        return;
    }
    
    // Clear existing options except first one
    countryCodeSelect.innerHTML = '<option value="">Select country code</option>';
    
    countryCodes.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = `${country.flag} ${country.code} ${country.country}`;
        countryCodeSelect.appendChild(option);
    });
}

// Populate countries dropdown
function populateCountries() {
    const countrySelect = document.getElementById('editCustomerCountry');
    
    if (!countrySelect) {
        console.log('Country select not found');
        return;
    }
    
    // Check if countryCodes is defined
    if (typeof countryCodes === 'undefined') {
        console.error('countryCodes is not defined. Make sure country-codes.js is loaded.');
        return;
    }
    
    // Get unique countries
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
    
    // Clear existing options except first one
    countrySelect.innerHTML = '<option value="">Select country</option>';
    
    uniqueCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.country;
        option.textContent = `${country.flag} ${country.country}`;
        countrySelect.appendChild(option);
    });
}

// Validate phone number with country-specific rules
function validatePhone() {
    const phoneInput = document.getElementById('editCustomerPhone');
    const phoneError = document.getElementById('phoneError');
    const countryCodeSelect = document.getElementById('editCustomerCountryCode');
    const phone = phoneInput.value.trim();
    const selectedCountryCode = countryCodeSelect.value;
    
    // If no phone entered, clear error
    if (!phone) {
        phoneError.textContent = '';
        phoneInput.style.borderColor = '';
        return true;
    }
    
    // Check for valid characters
    if (!/^[\d\s\-\(\)\+]+$/.test(phone)) {
        phoneError.textContent = 'Phone number can only contain digits, spaces, +, -, (, )';
        phoneInput.style.borderColor = '#ef4444';
        return false;
    }
    
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    // If country code is selected, validate against that country's rules
    if (selectedCountryCode && typeof countryCodes !== 'undefined') {
        const selectedCountry = countryCodes.find(c => c.code === selectedCountryCode);
        
        if (selectedCountry) {
            const minDigits = selectedCountry.minDigits || 7;
            const maxDigits = selectedCountry.maxDigits || 15;
            
            if (digitsOnly.length < minDigits || digitsOnly.length > maxDigits) {
                phoneError.textContent = `${selectedCountry.country} requires ${minDigits}-${maxDigits} digits`;
                phoneInput.style.borderColor = '#ef4444';
                return false;
            }
        }
    } else {
        // Generic validation if no country code selected
        if (digitsOnly.length < 7 || digitsOnly.length > 15) {
            phoneError.textContent = 'Please enter a valid phone number (7-15 digits)';
            phoneInput.style.borderColor = '#ef4444';
            return false;
        }
    }
    
    phoneError.textContent = '';
    phoneInput.style.borderColor = '';
    return true;
}

// Validate email availability
async function validateEmail() {
    const emailInput = document.getElementById('editCustomerEmail');
    const emailError = document.getElementById('emailError');
    const customerId = document.getElementById('editCustomerId').value;
    const email = emailInput.value.trim().toLowerCase();
    const token = getAuthToken();
    
    // Clear previous error
    emailError.textContent = '';
    emailInput.style.borderColor = '';
    
    if (!email) {
        return true;
    }
    
    try {
        // Check if email is already in use by another customer
        const response = await fetch(`${API_URL}/admin/customers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            const existingCustomer = data.customers.find(c => 
                c.email.toLowerCase() === email && c._id !== customerId
            );
            
            if (existingCustomer) {
                emailError.textContent = 'This email is already in use';
                emailInput.style.borderColor = '#ef4444';
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Email validation error:', error);
        return true; // Don't block if validation fails
    }
}

// Validate password strength
function validatePassword() {
    const passwordInput = document.getElementById('editCustomerPassword');
    const passwordError = document.getElementById('passwordError');
    const password = passwordInput.value;
    
    // Clear error if empty (password is optional)
    if (!password) {
        passwordError.textContent = '';
        passwordInput.style.borderColor = '';
        return true;
    }
    
    // Check minimum length
    if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        passwordInput.style.borderColor = '#ef4444';
        return false;
    }
    
    // Check for at least one letter and one number
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        passwordError.textContent = 'Password must contain at least one letter and one number';
        passwordInput.style.borderColor = '#ef4444';
        return false;
    }
    
    passwordError.textContent = '';
    passwordInput.style.borderColor = '#10b981';
    return true;
}

// Load all customers
async function loadCustomers() {
    const tableBody = document.getElementById('customersTableBody');
    const token = getAuthToken();
    
    console.log('Loading customers...');
    
    try {
        const response = await fetch(`${API_URL}/admin/customers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Customers response:', data);
        
        if (response.ok && data.success) {
            allCustomers = data.customers;
            displayCustomers(allCustomers);
        } else {
            throw new Error(data.message || 'Failed to load customers');
        }
    } catch (error) {
        console.error('Load customers error:', error);
        tableBody.innerHTML = '<tr><td colspan="8" class="no-customers-message">Failed to load customers. Please refresh the page.</td></tr>';
    }
}

// Display customers in table
function displayCustomers(customers) {
    const tableBody = document.getElementById('customersTableBody');
    
    if (!customers || customers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="no-customers-message">No customers found.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = customers.map(customer => {
        const profileImage = customer.profileImage && customer.profileImage !== 'User panel images/default-avatar.png' 
            ? `http://localhost:5001/${customer.profileImage}` 
            : '../User panel images/default-avatar.png';
        
        const statusClass = customer.isActive ? 'status-active' : 'status-inactive';
        const statusText = customer.isActive ? 'Active' : 'Inactive';
        
        const joinDate = new Date(customer.createdAt).toLocaleDateString();
        
        return `
            <tr>
                <td><img src="${profileImage}" alt="${customer.name}" class="customer-avatar"></td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.countryCode || ''} ${customer.phone || 'N/A'}</td>
                <td>${customer.country || 'N/A'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${joinDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" onclick="viewCustomer('${customer._id}')">View</button>
                        <button class="btn-edit" onclick="openEditModal('${customer._id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteCustomer('${customer._id}', '${customer.name.replace(/'/g, "\\'")}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Handle search
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayCustomers(allCustomers);
        return;
    }
    
    const filteredCustomers = allCustomers.filter(customer => {
        return customer.name.toLowerCase().includes(searchTerm) ||
               customer.email.toLowerCase().includes(searchTerm) ||
               (customer.phone && customer.phone.includes(searchTerm));
    });
    
    displayCustomers(filteredCustomers);
}

// View customer details
async function viewCustomer(customerId) {
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_URL}/admin/customers/${customerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            displayCustomerDetails(data.customer);
            document.getElementById('viewCustomerModal').classList.add('show');
        } else {
            throw new Error(data.message || 'Failed to load customer details');
        }
    } catch (error) {
        console.error('View customer error:', error);
        alert('Failed to load customer details');
    }
}

// Display customer details in modal
function displayCustomerDetails(customer) {
    const container = document.getElementById('customerDetailsContainer');
    
    const profileImage = customer.profileImage && customer.profileImage !== 'User panel images/default-avatar.png' 
        ? `http://localhost:5001/${customer.profileImage}` 
        : '../User panel images/default-avatar.png';
    
    const statusText = customer.isActive ? 'Active' : 'Inactive';
    const joinDate = new Date(customer.createdAt).toLocaleDateString();
    
    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${profileImage}" alt="${customer.name}" class="detail-avatar">
        </div>
        <div class="detail-section">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${customer.name}</span>
        </div>
        <div class="detail-section">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${customer.email}</span>
        </div>
        <div class="detail-section">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${customer.countryCode || ''} ${customer.phone || 'N/A'}</span>
        </div>
        <div class="detail-section">
            <span class="detail-label">Address:</span>
            <span class="detail-value">${customer.address || 'N/A'}</span>
        </div>
        <div class="detail-section">
            <span class="detail-label">Country:</span>
            <span class="detail-value">${customer.country || 'N/A'}</span>
        </div>
        <div class="detail-section">
            <span class="detail-label">Postal Code:</span>
            <span class="detail-value">${customer.postalCode || 'N/A'}</span>
        </div>
        <div class="detail-section">
            <span class="detail-label">Status:</span>
            <span class="detail-value">${statusText}</span>
        </div>
        <div class="detail-section">
            <span class="detail-label">Joined Date:</span>
            <span class="detail-value">${joinDate}</span>
        </div>
    `;
}

// Open edit modal
async function openEditModal(customerId) {
    const token = getAuthToken();
    
    // Populate dropdowns before opening modal
    populateCountryCodes();
    populateCountries();
    
    try {
        const response = await fetch(`${API_URL}/admin/customers/${customerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            const customer = data.customer;
            
            document.getElementById('editCustomerId').value = customer._id;
            document.getElementById('editCustomerName').value = customer.name;
            document.getElementById('editCustomerEmail').value = customer.email;
            document.getElementById('editCustomerCountryCode').value = customer.countryCode || '';
            document.getElementById('editCustomerPhone').value = customer.phone || '';
            document.getElementById('editCustomerCountry').value = customer.country || '';
            document.getElementById('editCustomerPostalCode').value = customer.postalCode || '';
            document.getElementById('editCustomerAddress').value = customer.address || '';
            document.getElementById('editCustomerStatus').value = customer.isActive.toString();
            
            // Set profile picture preview
            const profilePreview = document.getElementById('editCustomerProfilePreview');
            if (customer.profileImage && customer.profileImage !== 'User panel images/default-avatar.png') {
                profilePreview.src = `http://localhost:5001/${customer.profileImage}`;
            } else {
                profilePreview.src = '../User panel images/default-avatar.png';
            }
            
            // Setup profile picture click handler
            profilePreview.onclick = () => document.getElementById('editCustomerProfileImage').click();
            
            // Setup file input change handler
            const fileInput = document.getElementById('editCustomerProfileImage');
            fileInput.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        profilePreview.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            };
            
            document.getElementById('editCustomerModal').classList.add('show');
        } else {
            throw new Error(data.message || 'Failed to load customer');
        }
    } catch (error) {
        console.error('Open edit modal error:', error);
        alert('Failed to load customer data');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editCustomerModal').classList.remove('show');
    document.getElementById('editCustomerForm').reset();
}

// Close view modal
function closeViewModal() {
    document.getElementById('viewCustomerModal').classList.remove('show');
}

// Handle edit customer
async function handleEditCustomer(e) {
    e.preventDefault();
    
    // Validate phone number
    if (!validatePhone()) {
        alert('Please enter a valid phone number');
        return;
    }
    
    // Validate email
    const emailValid = await validateEmail();
    if (!emailValid) {
        alert('Please use a different email address');
        return;
    }
    
    // Validate password if entered
    const passwordInput = document.getElementById('editCustomerPassword');
    if (passwordInput.value && !validatePassword()) {
        alert('Please enter a valid password');
        return;
    }
    
    const customerId = document.getElementById('editCustomerId').value;
    const name = document.getElementById('editCustomerName').value.trim();
    const email = document.getElementById('editCustomerEmail').value.trim();
    const countryCode = document.getElementById('editCustomerCountryCode').value;
    const phone = document.getElementById('editCustomerPhone').value.trim();
    const country = document.getElementById('editCustomerCountry').value;
    const postalCode = document.getElementById('editCustomerPostalCode').value.trim();
    const address = document.getElementById('editCustomerAddress').value.trim();
    const isActive = document.getElementById('editCustomerStatus').value === 'true';
    const password = passwordInput.value.trim();
    const profileImageFile = document.getElementById('editCustomerProfileImage').files[0];
    
    const submitBtn = document.querySelector('.save-modal-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    try {
        const token = getAuthToken();
        
        // First, upload profile image if selected
        if (profileImageFile) {
            const formData = new FormData();
            formData.append('profileImage', profileImageFile);
            formData.append('customerId', customerId);
            
            const uploadResponse = await fetch(`${API_URL}/admin/customers/${customerId}/profile-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const uploadData = await uploadResponse.json();
            
            if (!uploadResponse.ok || !uploadData.success) {
                throw new Error(uploadData.message || 'Failed to upload profile image');
            }
        }
        
        // Prepare update data
        const updateData = {
            name,
            email,
            countryCode,
            phone,
            country,
            postalCode,
            address,
            isActive
        };
        
        // Only include password if provided
        if (password) {
            updateData.password = password;
        }
        
        // Then update customer details
        const response = await fetch(`${API_URL}/admin/customers/${customerId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('Customer updated successfully!');
            closeEditModal();
            await loadCustomers();
        } else {
            throw new Error(data.message || 'Failed to update customer');
        }
    } catch (error) {
        console.error('Update customer error:', error);
        alert(error.message || 'Failed to update customer');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Customer';
    }
}

// Delete customer
async function deleteCustomer(customerId, customerName) {
    if (!confirm(`Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/admin/customers/${customerId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('Customer deleted successfully!');
            await loadCustomers();
        } else {
            throw new Error(data.message || 'Failed to delete customer');
        }
    } catch (error) {
        console.error('Delete customer error:', error);
        alert(error.message || 'Failed to delete customer');
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
