// Verify Reset Code
document.addEventListener('DOMContentLoaded', function() {
    const codeForm = document.getElementById('codeForm');
    const codeInput = document.getElementById('resetCode');
    const codeError = document.getElementById('codeError');
    
    // Get email from sessionStorage
    const userEmail = sessionStorage.getItem('resetEmail');
    
    // If no email found, redirect back to forgot password
    if (!userEmail) {
        window.location.href = 'forgot-password.html';
        return;
    }
    
    // Display email
    document.getElementById('sentEmail').textContent = userEmail;
    
    // Only allow numbers in code input
    codeInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    codeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const code = codeInput.value.trim();
        
        if (code.length !== 6) {
            codeError.textContent = 'Please enter a valid 6-digit code';
            return;
        }
        
        // Store code in sessionStorage and redirect to reset password page
        sessionStorage.setItem('resetCode', code);
        window.location.href = 'reset-password.html';
    });
    
    // Resend code
    document.getElementById('resendCode').addEventListener('click', function(e) {
        e.preventDefault();
        
        // For frontend testing - just show message
        alert('Reset code sent again to ' + userEmail);
        codeInput.value = '';
        codeError.textContent = '';
    });
});
