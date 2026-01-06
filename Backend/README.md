# CYD Shop Backend API

Node.js + Express.js backend with MongoDB for the CYD Shop e-commerce platform.

## Features

- ✅ User authentication with JWT (JSON Web Tokens)
- ✅ Password hashing with bcrypt
- ✅ Email validation and availability checking
- ✅ Protected routes with JWT middleware
- ✅ Session management with token refresh
- ✅ MongoDB database integration
- ✅ Country code phone validation
- ✅ Real-time email checking

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Check Email Availability
**POST** `/api/auth/check-email`

Check if an email is already registered.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "exists": false,
  "message": "Email is available"
}
```

---

#### 2. User Signup
**POST** `/api/auth/signup`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "countryCode": "+1",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user"
  }
}
```

---

#### 3. User Signin (Login)
**POST** `/api/auth/signin`

Login with email and password. Returns JWT token for session management.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "countryCode": "+1",
    "role": "user"
  }
}
```

---

#### 4. Get Current User Profile
**GET** `/api/auth/me`

Get the currently authenticated user's profile. **Requires JWT token**.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "countryCode": "+1",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-01-06T10:30:00.000Z"
  }
}
```

---

#### 5. Verify Token
**POST** `/api/auth/verify-token`

Verify if a JWT token is valid and not expired.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Valid):**
```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Response (Invalid):**
```json
{
  "success": false,
  "valid": false,
  "message": "Token has expired"
}
```

---

#### 6. Refresh Token
**POST** `/api/auth/refresh-token`

Generate a new JWT token for the authenticated user. **Requires JWT token**.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 7. Logout
**POST** `/api/auth/logout`

Logout the user. **Requires JWT token**. 

Note: JWT is stateless, so logout is primarily handled client-side by removing the token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Authentication & Authorization

### JWT Token Security

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### How JWT Session Works

1. **Login/Signup**: User provides credentials → Server validates → Returns JWT token
2. **Store Token**: Client stores token in `localStorage` or `sessionStorage`
3. **Authenticated Requests**: Client includes token in Authorization header
4. **Token Verification**: Server verifies token signature and expiration
5. **Access Granted**: If valid, request proceeds; if invalid, returns 401 error

### Token Expiration

Tokens expire after the duration specified in `JWT_EXPIRE` environment variable (default: 30 days).

When a token expires:
- Client receives 401 error with "Token has expired" message
- Client should redirect user to login page
- Or use refresh token endpoint to get a new token

### Protected Routes

Routes using the `protect` middleware require valid JWT authentication:
- `/api/auth/me` - Get user profile
- `/api/auth/refresh-token` - Refresh JWT token
- `/api/auth/logout` - Logout user

---

## Environment Variables

Create a `.env` file in the Backend directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyd-shop

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRE=30d

# Server Configuration
PORT=5001
NODE_ENV=development
```

**Important**: 
- Change `JWT_SECRET` to a random secure string in production
- Never commit `.env` file to version control

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Configure Environment

Create `.env` file with your MongoDB URI and JWT secret (see above).

### 3. Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5001`

---

## Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  phone: String (required),
  countryCode: String (required),
  password: String (required, hashed with bcrypt),
  role: String (default: 'user'),
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Password Security:**
- Passwords are hashed using bcrypt before storage
- Original passwords are never stored in the database
- Minimum password length: 6 characters

---

## Error Responses

All endpoints return consistent error responses:

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Please provide a valid email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details here"
}
```

---

## HTTP Status Codes

- `200` - Success
- `201` - Created (signup)
- `400` - Bad Request (validation errors, user already exists)
- `401` - Unauthorized (invalid credentials or expired token)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal Server Error

---

## Security Best Practices

✅ **Implemented:**
- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication
- CORS enabled for cross-origin requests
- Email validation and sanitization
- Sensitive fields excluded from responses (password)
- Environment variables for secrets

🔒 **Recommended for Production:**
- Enable HTTPS/SSL
- Add rate limiting to prevent brute force attacks
- Implement refresh token rotation
- Add token blacklist for logout
- Use helmet.js for security headers
- Enable MongoDB encryption at rest
- Add input sanitization for XSS prevention
- Implement CSRF protection

---

## Testing the API

### Using cURL

**Signup:**
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "countryCode": "+1",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Profile (with token):**
```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Dependencies

```json
{
  "bcryptjs": "^2.4.3",       // Password hashing
  "cors": "^2.8.5",            // Cross-origin requests
  "dotenv": "^16.3.1",         // Environment variables
  "express": "^4.18.2",        // Web framework
  "express-validator": "^7.0.1", // Input validation
  "jsonwebtoken": "^9.0.2",    // JWT tokens
  "mongoose": "^8.0.3"         // MongoDB ODM
}
```

---

## Project Structure

```
Backend/
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── models/
│   └── User.js           # User schema and model
├── routes/
│   └── auth.js           # Authentication routes
├── .env                  # Environment variables (not in git)
├── .gitignore           # Git ignore file
├── package.json         # Dependencies and scripts
├── server.js            # Main server file
└── README.md            # This file
```

---

## License

Proprietary - CYD Shop

## Support

For issues or questions, contact the development team.
