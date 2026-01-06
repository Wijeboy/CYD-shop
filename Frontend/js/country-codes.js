// Country codes with phone validation
const countryCodes = [
    { code: '+1', country: 'United States', flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
    { code: '+1', country: 'Canada', flag: '🇨🇦', minDigits: 10, maxDigits: 10 },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧', minDigits: 10, maxDigits: 10 },
    { code: '+91', country: 'India', flag: '🇮🇳', minDigits: 10, maxDigits: 10 },
    { code: '+86', country: 'China', flag: '🇨🇳', minDigits: 11, maxDigits: 11 },
    { code: '+81', country: 'Japan', flag: '🇯🇵', minDigits: 10, maxDigits: 10 },
    { code: '+49', country: 'Germany', flag: '🇩🇪', minDigits: 10, maxDigits: 11 },
    { code: '+33', country: 'France', flag: '🇫🇷', minDigits: 9, maxDigits: 9 },
    { code: '+39', country: 'Italy', flag: '🇮🇹', minDigits: 10, maxDigits: 10 },
    { code: '+34', country: 'Spain', flag: '🇪🇸', minDigits: 9, maxDigits: 9 },
    { code: '+61', country: 'Australia', flag: '🇦🇺', minDigits: 9, maxDigits: 9 },
    { code: '+55', country: 'Brazil', flag: '🇧🇷', minDigits: 10, maxDigits: 11 },
    { code: '+52', country: 'Mexico', flag: '🇲🇽', minDigits: 10, maxDigits: 10 },
    { code: '+7', country: 'Russia', flag: '🇷🇺', minDigits: 10, maxDigits: 10 },
    { code: '+82', country: 'South Korea', flag: '🇰🇷', minDigits: 9, maxDigits: 10 },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱', minDigits: 9, maxDigits: 9 },
    { code: '+46', country: 'Sweden', flag: '🇸🇪', minDigits: 9, maxDigits: 10 },
    { code: '+47', country: 'Norway', flag: '🇳🇴', minDigits: 8, maxDigits: 8 },
    { code: '+45', country: 'Denmark', flag: '🇩🇰', minDigits: 8, maxDigits: 8 },
    { code: '+358', country: 'Finland', flag: '🇫🇮', minDigits: 9, maxDigits: 10 },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭', minDigits: 9, maxDigits: 9 },
    { code: '+43', country: 'Austria', flag: '🇦🇹', minDigits: 10, maxDigits: 11 },
    { code: '+32', country: 'Belgium', flag: '🇧🇪', minDigits: 9, maxDigits: 9 },
    { code: '+351', country: 'Portugal', flag: '🇵🇹', minDigits: 9, maxDigits: 9 },
    { code: '+30', country: 'Greece', flag: '🇬🇷', minDigits: 10, maxDigits: 10 },
    { code: '+48', country: 'Poland', flag: '🇵🇱', minDigits: 9, maxDigits: 9 },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿', minDigits: 9, maxDigits: 9 },
    { code: '+36', country: 'Hungary', flag: '🇭🇺', minDigits: 9, maxDigits: 9 },
    { code: '+40', country: 'Romania', flag: '🇷🇴', minDigits: 9, maxDigits: 10 },
    { code: '+90', country: 'Turkey', flag: '🇹🇷', minDigits: 10, maxDigits: 10 },
    { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', minDigits: 9, maxDigits: 9 },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', minDigits: 9, maxDigits: 9 },
    { code: '+20', country: 'Egypt', flag: '🇪🇬', minDigits: 10, maxDigits: 10 },
    { code: '+27', country: 'South Africa', flag: '🇿🇦', minDigits: 9, maxDigits: 9 },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬', minDigits: 10, maxDigits: 10 },
    { code: '+254', country: 'Kenya', flag: '🇰🇪', minDigits: 9, maxDigits: 10 },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰', minDigits: 10, maxDigits: 10 },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩', minDigits: 10, maxDigits: 10 },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', minDigits: 9, maxDigits: 9 },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾', minDigits: 9, maxDigits: 10 },
    { code: '+65', country: 'Singapore', flag: '🇸🇬', minDigits: 8, maxDigits: 8 },
    { code: '+66', country: 'Thailand', flag: '🇹🇭', minDigits: 9, maxDigits: 9 },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳', minDigits: 9, maxDigits: 10 },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩', minDigits: 10, maxDigits: 12 },
    { code: '+63', country: 'Philippines', flag: '🇵🇭', minDigits: 10, maxDigits: 10 },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿', minDigits: 9, maxDigits: 10 },
    { code: '+54', country: 'Argentina', flag: '🇦🇷', minDigits: 10, maxDigits: 10 },
    { code: '+56', country: 'Chile', flag: '🇨🇱', minDigits: 9, maxDigits: 9 },
    { code: '+57', country: 'Colombia', flag: '🇨🇴', minDigits: 10, maxDigits: 10 },
    { code: '+51', country: 'Peru', flag: '🇵🇪', minDigits: 9, maxDigits: 9 }
];

// Get country by code
function getCountryByCode(code) {
    return countryCodes.find(c => c.code === code);
}

// Validate phone number for selected country
function validatePhoneNumber(countryCode, phoneNumber) {
    const country = getCountryByCode(countryCode);
    
    if (!country) {
        return {
            valid: false,
            message: 'Invalid country code'
        };
    }
    
    // Remove spaces, dashes, and other formatting
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Check if only digits
    if (!/^\d+$/.test(cleanNumber)) {
        return {
            valid: false,
            message: 'Phone number should contain only digits'
        };
    }
    
    // Check length
    if (cleanNumber.length < country.minDigits) {
        return {
            valid: false,
            message: `Phone number should be at least ${country.minDigits} digits for ${country.country}`
        };
    }
    
    if (cleanNumber.length > country.maxDigits) {
        return {
            valid: false,
            message: `Phone number should be at most ${country.maxDigits} digits for ${country.country}`
        };
    }
    
    return {
        valid: true,
        message: 'Valid phone number',
        cleanNumber: cleanNumber
    };
}
