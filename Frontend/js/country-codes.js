// Country codes with phone validation (195 countries)
const countryCodes = [
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫', minDigits: 9, maxDigits: 9 },
    { code: '+355', country: 'Albania', flag: '🇦🇱', minDigits: 9, maxDigits: 9 },
    { code: '+213', country: 'Algeria', flag: '🇩🇿', minDigits: 9, maxDigits: 9 },
    { code: '+376', country: 'Andorra', flag: '🇦🇩', minDigits: 6, maxDigits: 9 },
    { code: '+244', country: 'Angola', flag: '🇦🇴', minDigits: 9, maxDigits: 9 },
    { code: '+54', country: 'Argentina', flag: '🇦🇷', minDigits: 10, maxDigits: 10 },
    { code: '+374', country: 'Armenia', flag: '🇦🇲', minDigits: 8, maxDigits: 8 },
    { code: '+61', country: 'Australia', flag: '🇦🇺', minDigits: 9, maxDigits: 9 },
    { code: '+43', country: 'Austria', flag: '🇦🇹', minDigits: 10, maxDigits: 11 },
    { code: '+994', country: 'Azerbaijan', flag: '🇦🇿', minDigits: 9, maxDigits: 9 },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭', minDigits: 8, maxDigits: 8 },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩', minDigits: 10, maxDigits: 10 },
    { code: '+375', country: 'Belarus', flag: '🇧🇾', minDigits: 9, maxDigits: 9 },
    { code: '+32', country: 'Belgium', flag: '🇧🇪', minDigits: 9, maxDigits: 9 },
    { code: '+501', country: 'Belize', flag: '🇧🇿', minDigits: 7, maxDigits: 7 },
    { code: '+229', country: 'Benin', flag: '🇧🇯', minDigits: 8, maxDigits: 8 },
    { code: '+975', country: 'Bhutan', flag: '🇧🇹', minDigits: 8, maxDigits: 8 },
    { code: '+591', country: 'Bolivia', flag: '🇧🇴', minDigits: 8, maxDigits: 8 },
    { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦', minDigits: 8, maxDigits: 8 },
    { code: '+267', country: 'Botswana', flag: '🇧🇼', minDigits: 7, maxDigits: 8 },
    { code: '+55', country: 'Brazil', flag: '🇧🇷', minDigits: 10, maxDigits: 11 },
    { code: '+673', country: 'Brunei', flag: '🇧🇳', minDigits: 7, maxDigits: 7 },
    { code: '+359', country: 'Bulgaria', flag: '🇧🇬', minDigits: 9, maxDigits: 9 },
    { code: '+226', country: 'Burkina Faso', flag: '🇧🇫', minDigits: 8, maxDigits: 8 },
    { code: '+257', country: 'Burundi', flag: '🇧🇮', minDigits: 8, maxDigits: 8 },
    { code: '+855', country: 'Cambodia', flag: '🇰🇭', minDigits: 8, maxDigits: 9 },
    { code: '+237', country: 'Cameroon', flag: '🇨🇲', minDigits: 9, maxDigits: 9 },
    { code: '+1', country: 'Canada', flag: '🇨🇦', minDigits: 10, maxDigits: 10 },
    { code: '+238', country: 'Cape Verde', flag: '🇨🇻', minDigits: 7, maxDigits: 7 },
    { code: '+236', country: 'Central African Republic', flag: '🇨🇫', minDigits: 8, maxDigits: 8 },
    { code: '+235', country: 'Chad', flag: '🇹🇩', minDigits: 8, maxDigits: 8 },
    { code: '+56', country: 'Chile', flag: '🇨🇱', minDigits: 9, maxDigits: 9 },
    { code: '+86', country: 'China', flag: '🇨🇳', minDigits: 11, maxDigits: 11 },
    { code: '+57', country: 'Colombia', flag: '🇨🇴', minDigits: 10, maxDigits: 10 },
    { code: '+269', country: 'Comoros', flag: '🇰🇲', minDigits: 7, maxDigits: 7 },
    { code: '+242', country: 'Congo', flag: '🇨🇬', minDigits: 9, maxDigits: 9 },
    { code: '+506', country: 'Costa Rica', flag: '🇨🇷', minDigits: 8, maxDigits: 8 },
    { code: '+385', country: 'Croatia', flag: '🇭🇷', minDigits: 8, maxDigits: 9 },
    { code: '+53', country: 'Cuba', flag: '🇨🇺', minDigits: 8, maxDigits: 8 },
    { code: '+357', country: 'Cyprus', flag: '🇨🇾', minDigits: 8, maxDigits: 8 },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿', minDigits: 9, maxDigits: 9 },
    { code: '+243', country: 'Democratic Republic of the Congo', flag: '🇨🇩', minDigits: 9, maxDigits: 9 },
    { code: '+45', country: 'Denmark', flag: '🇩🇰', minDigits: 8, maxDigits: 8 },
    { code: '+253', country: 'Djibouti', flag: '🇩🇯', minDigits: 8, maxDigits: 8 },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨', minDigits: 9, maxDigits: 9 },
    { code: '+20', country: 'Egypt', flag: '🇪🇬', minDigits: 10, maxDigits: 10 },
    { code: '+503', country: 'El Salvador', flag: '🇸🇻', minDigits: 8, maxDigits: 8 },
    { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶', minDigits: 9, maxDigits: 9 },
    { code: '+291', country: 'Eritrea', flag: '🇪🇷', minDigits: 7, maxDigits: 7 },
    { code: '+372', country: 'Estonia', flag: '🇪🇪', minDigits: 7, maxDigits: 8 },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹', minDigits: 9, maxDigits: 9 },
    { code: '+679', country: 'Fiji', flag: '🇫🇯', minDigits: 7, maxDigits: 7 },
    { code: '+358', country: 'Finland', flag: '🇫🇮', minDigits: 9, maxDigits: 10 },
    { code: '+33', country: 'France', flag: '🇫🇷', minDigits: 9, maxDigits: 9 },
    { code: '+241', country: 'Gabon', flag: '🇬🇦', minDigits: 7, maxDigits: 8 },
    { code: '+220', country: 'Gambia', flag: '🇬🇲', minDigits: 7, maxDigits: 7 },
    { code: '+995', country: 'Georgia', flag: '🇬🇪', minDigits: 9, maxDigits: 9 },
    { code: '+49', country: 'Germany', flag: '🇩🇪', minDigits: 10, maxDigits: 11 },
    { code: '+233', country: 'Ghana', flag: '🇬🇭', minDigits: 9, maxDigits: 9 },
    { code: '+30', country: 'Greece', flag: '🇬🇷', minDigits: 10, maxDigits: 10 },
    { code: '+502', country: 'Guatemala', flag: '🇬🇹', minDigits: 8, maxDigits: 8 },
    { code: '+224', country: 'Guinea', flag: '🇬🇳', minDigits: 9, maxDigits: 9 },
    { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼', minDigits: 7, maxDigits: 7 },
    { code: '+592', country: 'Guyana', flag: '🇬🇾', minDigits: 7, maxDigits: 7 },
    { code: '+509', country: 'Haiti', flag: '🇭🇹', minDigits: 8, maxDigits: 8 },
    { code: '+504', country: 'Honduras', flag: '🇭🇳', minDigits: 8, maxDigits: 8 },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰', minDigits: 8, maxDigits: 8 },
    { code: '+36', country: 'Hungary', flag: '🇭🇺', minDigits: 9, maxDigits: 9 },
    { code: '+354', country: 'Iceland', flag: '🇮🇸', minDigits: 7, maxDigits: 7 },
    { code: '+91', country: 'India', flag: '🇮🇳', minDigits: 10, maxDigits: 10 },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩', minDigits: 10, maxDigits: 12 },
    { code: '+98', country: 'Iran', flag: '🇮🇷', minDigits: 10, maxDigits: 10 },
    { code: '+964', country: 'Iraq', flag: '🇮🇶', minDigits: 10, maxDigits: 10 },
    { code: '+353', country: 'Ireland', flag: '🇮🇪', minDigits: 9, maxDigits: 9 },
    { code: '+972', country: 'Israel', flag: '🇮🇱', minDigits: 9, maxDigits: 9 },
    { code: '+39', country: 'Italy', flag: '🇮🇹', minDigits: 10, maxDigits: 10 },
    { code: '+225', country: 'Ivory Coast', flag: '🇨🇮', minDigits: 8, maxDigits: 8 },
    { code: '+81', country: 'Japan', flag: '🇯🇵', minDigits: 10, maxDigits: 10 },
    { code: '+962', country: 'Jordan', flag: '🇯🇴', minDigits: 9, maxDigits: 9 },
    { code: '+7', country: 'Kazakhstan', flag: '🇰🇿', minDigits: 10, maxDigits: 10 },
    { code: '+254', country: 'Kenya', flag: '🇰🇪', minDigits: 9, maxDigits: 10 },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼', minDigits: 8, maxDigits: 8 },
    { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬', minDigits: 9, maxDigits: 9 },
    { code: '+856', country: 'Laos', flag: '🇱🇦', minDigits: 9, maxDigits: 10 },
    { code: '+371', country: 'Latvia', flag: '🇱🇻', minDigits: 8, maxDigits: 8 },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧', minDigits: 7, maxDigits: 8 },
    { code: '+266', country: 'Lesotho', flag: '🇱🇸', minDigits: 8, maxDigits: 8 },
    { code: '+231', country: 'Liberia', flag: '🇱🇷', minDigits: 7, maxDigits: 8 },
    { code: '+218', country: 'Libya', flag: '🇱🇾', minDigits: 9, maxDigits: 10 },
    { code: '+423', country: 'Liechtenstein', flag: '🇱🇮', minDigits: 7, maxDigits: 9 },
    { code: '+370', country: 'Lithuania', flag: '🇱🇹', minDigits: 8, maxDigits: 8 },
    { code: '+352', country: 'Luxembourg', flag: '🇱🇺', minDigits: 9, maxDigits: 9 },
    { code: '+853', country: 'Macau', flag: '🇲🇴', minDigits: 8, maxDigits: 8 },
    { code: '+389', country: 'Macedonia', flag: '🇲🇰', minDigits: 8, maxDigits: 8 },
    { code: '+261', country: 'Madagascar', flag: '🇲🇬', minDigits: 9, maxDigits: 9 },
    { code: '+265', country: 'Malawi', flag: '🇲🇼', minDigits: 8, maxDigits: 9 },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾', minDigits: 9, maxDigits: 10 },
    { code: '+960', country: 'Maldives', flag: '🇲🇻', minDigits: 7, maxDigits: 7 },
    { code: '+223', country: 'Mali', flag: '🇲🇱', minDigits: 8, maxDigits: 8 },
    { code: '+356', country: 'Malta', flag: '🇲🇹', minDigits: 8, maxDigits: 8 },
    { code: '+222', country: 'Mauritania', flag: '🇲🇷', minDigits: 8, maxDigits: 8 },
    { code: '+230', country: 'Mauritius', flag: '🇲🇺', minDigits: 7, maxDigits: 8 },
    { code: '+52', country: 'Mexico', flag: '🇲🇽', minDigits: 10, maxDigits: 10 },
    { code: '+373', country: 'Moldova', flag: '🇲🇩', minDigits: 8, maxDigits: 8 },
    { code: '+377', country: 'Monaco', flag: '🇲🇨', minDigits: 8, maxDigits: 9 },
    { code: '+976', country: 'Mongolia', flag: '🇲🇳', minDigits: 8, maxDigits: 8 },
    { code: '+382', country: 'Montenegro', flag: '🇲🇪', minDigits: 8, maxDigits: 8 },
    { code: '+212', country: 'Morocco', flag: '🇲🇦', minDigits: 9, maxDigits: 9 },
    { code: '+258', country: 'Mozambique', flag: '🇲🇿', minDigits: 9, maxDigits: 9 },
    { code: '+95', country: 'Myanmar', flag: '🇲🇲', minDigits: 8, maxDigits: 10 },
    { code: '+264', country: 'Namibia', flag: '🇳🇦', minDigits: 9, maxDigits: 10 },
    { code: '+977', country: 'Nepal', flag: '🇳🇵', minDigits: 10, maxDigits: 10 },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱', minDigits: 9, maxDigits: 9 },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿', minDigits: 9, maxDigits: 10 },
    { code: '+505', country: 'Nicaragua', flag: '🇳🇮', minDigits: 8, maxDigits: 8 },
    { code: '+227', country: 'Niger', flag: '🇳🇪', minDigits: 8, maxDigits: 8 },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬', minDigits: 10, maxDigits: 10 },
    { code: '+850', country: 'North Korea', flag: '🇰🇵', minDigits: 10, maxDigits: 10 },
    { code: '+47', country: 'Norway', flag: '🇳🇴', minDigits: 8, maxDigits: 8 },
    { code: '+968', country: 'Oman', flag: '🇴🇲', minDigits: 8, maxDigits: 8 },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰', minDigits: 10, maxDigits: 10 },
    { code: '+970', country: 'Palestine', flag: '🇵🇸', minDigits: 9, maxDigits: 9 },
    { code: '+507', country: 'Panama', flag: '🇵🇦', minDigits: 8, maxDigits: 8 },
    { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬', minDigits: 8, maxDigits: 8 },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾', minDigits: 9, maxDigits: 9 },
    { code: '+51', country: 'Peru', flag: '🇵🇪', minDigits: 9, maxDigits: 9 },
    { code: '+63', country: 'Philippines', flag: '🇵🇭', minDigits: 10, maxDigits: 10 },
    { code: '+48', country: 'Poland', flag: '🇵🇱', minDigits: 9, maxDigits: 9 },
    { code: '+351', country: 'Portugal', flag: '🇵🇹', minDigits: 9, maxDigits: 9 },
    { code: '+974', country: 'Qatar', flag: '🇶🇦', minDigits: 8, maxDigits: 8 },
    { code: '+40', country: 'Romania', flag: '🇷🇴', minDigits: 9, maxDigits: 10 },
    { code: '+7', country: 'Russia', flag: '🇷🇺', minDigits: 10, maxDigits: 10 },
    { code: '+250', country: 'Rwanda', flag: '🇷🇼', minDigits: 9, maxDigits: 9 },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', minDigits: 9, maxDigits: 9 },
    { code: '+221', country: 'Senegal', flag: '🇸🇳', minDigits: 9, maxDigits: 9 },
    { code: '+381', country: 'Serbia', flag: '🇷🇸', minDigits: 8, maxDigits: 9 },
    { code: '+248', country: 'Seychelles', flag: '🇸🇨', minDigits: 7, maxDigits: 7 },
    { code: '+232', country: 'Sierra Leone', flag: '🇸🇱', minDigits: 8, maxDigits: 8 },
    { code: '+65', country: 'Singapore', flag: '🇸🇬', minDigits: 8, maxDigits: 8 },
    { code: '+421', country: 'Slovakia', flag: '🇸🇰', minDigits: 9, maxDigits: 9 },
    { code: '+386', country: 'Slovenia', flag: '🇸🇮', minDigits: 8, maxDigits: 8 },
    { code: '+252', country: 'Somalia', flag: '🇸🇴', minDigits: 8, maxDigits: 9 },
    { code: '+27', country: 'South Africa', flag: '🇿🇦', minDigits: 9, maxDigits: 9 },
    { code: '+82', country: 'South Korea', flag: '🇰🇷', minDigits: 9, maxDigits: 10 },
    { code: '+211', country: 'South Sudan', flag: '🇸🇸', minDigits: 9, maxDigits: 9 },
    { code: '+34', country: 'Spain', flag: '🇪🇸', minDigits: 9, maxDigits: 9 },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', minDigits: 9, maxDigits: 9 },
    { code: '+249', country: 'Sudan', flag: '🇸🇩', minDigits: 9, maxDigits: 9 },
    { code: '+597', country: 'Suriname', flag: '🇸🇷', minDigits: 6, maxDigits: 7 },
    { code: '+268', country: 'Swaziland', flag: '🇸🇿', minDigits: 8, maxDigits: 8 },
    { code: '+46', country: 'Sweden', flag: '🇸🇪', minDigits: 9, maxDigits: 10 },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭', minDigits: 9, maxDigits: 9 },
    { code: '+963', country: 'Syria', flag: '🇸🇾', minDigits: 9, maxDigits: 9 },
    { code: '+886', country: 'Taiwan', flag: '🇹🇼', minDigits: 9, maxDigits: 9 },
    { code: '+992', country: 'Tajikistan', flag: '🇹🇯', minDigits: 9, maxDigits: 9 },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿', minDigits: 9, maxDigits: 9 },
    { code: '+66', country: 'Thailand', flag: '🇹🇭', minDigits: 9, maxDigits: 9 },
    { code: '+228', country: 'Togo', flag: '🇹🇬', minDigits: 8, maxDigits: 8 },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳', minDigits: 8, maxDigits: 8 },
    { code: '+90', country: 'Turkey', flag: '🇹🇷', minDigits: 10, maxDigits: 10 },
    { code: '+993', country: 'Turkmenistan', flag: '🇹🇲', minDigits: 8, maxDigits: 8 },
    { code: '+256', country: 'Uganda', flag: '🇺🇬', minDigits: 9, maxDigits: 9 },
    { code: '+380', country: 'Ukraine', flag: '🇺🇦', minDigits: 9, maxDigits: 9 },
    { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', minDigits: 9, maxDigits: 9 },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧', minDigits: 10, maxDigits: 10 },
    { code: '+1', country: 'United States', flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
    { code: '+598', country: 'Uruguay', flag: '🇺🇾', minDigits: 8, maxDigits: 8 },
    { code: '+998', country: 'Uzbekistan', flag: '🇺🇿', minDigits: 9, maxDigits: 9 },
    { code: '+678', country: 'Vanuatu', flag: '🇻🇺', minDigits: 5, maxDigits: 7 },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪', minDigits: 10, maxDigits: 10 },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳', minDigits: 9, maxDigits: 10 },
    { code: '+967', country: 'Yemen', flag: '🇾🇪', minDigits: 9, maxDigits: 9 },
    { code: '+260', country: 'Zambia', flag: '🇿🇲', minDigits: 9, maxDigits: 9 },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼', minDigits: 9, maxDigits: 9 }
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
