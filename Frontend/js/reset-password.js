// Reset Password
document.addEventListener('DOMContentLoaded', function() {
    const resetForm = document.getElementById('resetForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const passwordMatch = document.getElementById('passwordMatch');
    
    // Get email and code from sessionStorage
    const userEmail = sessionStorage.getItem('resetEmail');
    const resetCode = sessionStorage.getItem('resetCode');
    
    // If no email or code found, redirect back to forgot password
    if (!userEmail || !resetCode) {
        window.location.href = 'forgot-password.html';
        return;
    }
    
    // Real-time password validation
    newPasswordInput.addEventListener('input', function() {
        validatePasswords();
    });
    
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswords();
    });
    
    function validatePasswords() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validate new password length
        if (newPassword.length > 0 && newPassword.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters';
            newPasswordInput.style.borderColor = '#ef4444';
        } else {
            passwordError.textContent = '';
            newPasswordInput.style.borderColor = '';
        }
        
        // Check if passwords match
        if (confirmPassword.length > 0) {
            if (newPassword !== confirmPassword) {
                confirmPasswordError.textContent = 'Passwords do not match';
                confirmPasswordInput.style.borderColor = '#ef4444';
                passwordMatch.textContent = '';
                return false;
            } else if (newPassword.length >= 6) {
                confirmPasswordError.textContent = '';
                confirmPasswordInput.style.borderColor = '#10b981';
                passwordMatch.textContent = '✓ Passwords match';
                return true;
            }
        } else {
            confirmPasswordError.textContent = '';
            confirmPasswordInput.style.borderColor = '';
            passwordMatch.textContent = '';
        }
        
        return false;
    }
    
    resetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (newPassword.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters';
            return;
        }
        
        if (newPassword !== confirmPassword) {
            confirmPasswordError.textContent = 'Passwords do not match';
            return;
        }
        
        // Clear sessionStorage
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetCode');
        
        // Show success and redirect to signin
        alert('Password reset successfully! You can now sign in with your new password.');
        window.location.href = 'signin.html';
    });
});

// Toggle password visibility
function togglePasswordField(fieldId) {
    const passwordInput = document.getElementById(fieldId);
    const toggleBtn = event.currentTarget;
    const eyeIcon = toggleBtn.querySelector('.eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = '<path d="M2 2l20 20M9.88 9.88a3 3 0 104.24 4.24m-4.24-4.24A10.07 10.07 0 0112 9c6.364 0 10 7 10 7s-.912 1.75-2.573 3.457M9.88 9.88L2 2m7.88 7.88l4.24 4.24m0 0L22 22M9.88 9.88c-.82.82-1.36 1.95-1.36 3.12 0 .28.03.56.08.82m4.4 4.4a3.007 3.007 0 01-3.32-3.32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = '<path d="M12 5C5.636 5 2 12 2 12s3.636 7 10 7 10-7 10-7-3.636-7-10-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }
}
