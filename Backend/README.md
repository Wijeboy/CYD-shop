# CYD Shop Backend API

Backend API for CYD Cloth Shop built with Node.js, Express.js, and MongoDB.

## Setup Instructions

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Environment Variables
The `.env` file is already configured with your MongoDB connection.

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication Routes

#### 1. User Signup
- **URL:** `POST /api/auth/signup`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user"
  }
}
```

#### 2. User Signin
- **URL:** `POST /api/auth/signin`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user"
  }
}
```

## Features

✓ User registration with validation
✓ Password hashing with bcrypt
✓ JWT authentication
✓ Email validation
✓ Duplicate user check
✓ Secure password storage
✓ Error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
