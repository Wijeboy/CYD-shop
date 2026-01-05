// Forgot Password - Step 1: Enter Email
document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('emailForm');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    
    // Real-time email validation
    emailInput.addEventListener('input', function() {
        validateEmail();
    });
    
    function validateEmail() {
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
    
    emailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email || !validateEmail()) {
            emailError.textContent = 'Please enter a valid email address';
            return;
        }
        
        // Store email in sessionStorage and redirect to verify-code page
        sessionStorage.setItem('resetEmail', email);
        window.location.href = 'verify-code.html';
    });
});