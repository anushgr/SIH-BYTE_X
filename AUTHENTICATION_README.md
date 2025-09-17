# Authentication System - SIH BYTE_X Platform

## Overview
Complete authentication system with user registration, login, and session management for the RTRWH (Rooftop Rainwater Harvesting) assessment platform.

## Features Implemented

### Backend (FastAPI)
- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ PostgreSQL database integration (Neon)
- ✅ User profile management
- ✅ CORS configuration for frontend integration

### Frontend (Next.js)
- ✅ User registration form with validation
- ✅ Login form with error handling
- ✅ Authentication context for state management
- ✅ Dynamic header showing user info when logged in
- ✅ Logout functionality
- ✅ Protected routes (can be extended)

### Database Schema
```sql
Users Table:
- id (Primary Key)
- email (Unique, Required)
- username (Unique, Required)
- hashed_password (Required)
- full_name (Optional)
- phone (Optional)
- organization (Optional)
- is_active (Boolean, Default: True)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## API Endpoints

### Authentication Routes (`/auth`)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user info (requires token)
- `GET /auth/health` - Health check

### Request/Response Examples

#### Signup Request
```json
{
  "email": "user@example.com",
  "username": "username123",
  "password": "securepassword",
  "full_name": "John Doe",
  "phone": "+91 9876543210",
  "organization": "Example Corp"
}
```

#### Login Request
```json
{
  "username": "username123",
  "password": "securepassword"
}
```

#### Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Setup Instructions

### Backend Setup
1. Install dependencies:
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd Frontend/byte_x
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Database Configuration
- Database: PostgreSQL (Neon Cloud)
- Connection: Configured in `Backend/app/database.py`
- Auto-migration: Tables are created automatically on server start

## Usage Flow

1. **User Registration**: 
   - Visit `/signup`
   - Fill required fields (email, username, password)
   - Optional: phone and organization
   - Account created in database

2. **User Login**:
   - Visit `/login`
   - Enter username/email and password
   - JWT token generated and stored
   - User info fetched and cached

3. **Authenticated State**:
   - Header shows user avatar and name
   - Logout button replaces login/signup buttons
   - User session persists across browser refreshes

4. **Logout**:
   - Click logout in user dropdown
   - Token cleared from storage
   - Redirected to home page

## Security Features

- Password hashing with bcrypt
- JWT token expiration (30 minutes)
- CORS protection
- Input validation and sanitization
- SQL injection protection via SQLAlchemy ORM

## File Structure

### Backend
```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── database.py          # DB connection
│   ├── models.py            # User model
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Auth utilities
│   └── routers/
│       ├── __init__.py
│       ├── auth_api.py      # Auth endpoints
│       └── rainfall_api.py  # Other APIs
├── requirements.txt
└── test_auth.py            # API test script
```

### Frontend
```
Frontend/byte_x/src/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── login/page.tsx      # Login page
│   └── signup/page.tsx     # Signup page
├── components/
│   ├── header.tsx          # Updated header with auth
│   └── ui/                 # UI components
├── contexts/
│   └── auth-context.tsx    # Authentication context
└── lib/
    └── utils.ts
```

## Testing

Run the test script to verify API functionality:
```bash
cd Backend
python test_auth.py
```

This will test:
- Health endpoints
- User registration
- User login
- Token validation

## Next Steps

Possible enhancements:
- Email verification
- Password reset functionality
- Role-based access control
- OAuth integration (Google, GitHub)
- Session management improvements
- Rate limiting for login attempts