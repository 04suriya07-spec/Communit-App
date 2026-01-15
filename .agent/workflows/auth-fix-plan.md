---
description: Complete Authentication System Fix Plan
---

# Authentication System Fix - Implementation Plan

## Phase 1: Backend Core Auth Fixes

### 1.1 Add Password Hashing to Identity Service
- Install bcrypt dependency
- Implement password hashing in register flow
- Implement password verification in login flow
- Update identity service with proper password handling

### 1.2 Fix Session Persistence
- Add explicit `req.session.save()` calls after setting session data
- Implement session rotation on login
- Add proper error handling for session operations

### 1.3 Create Auth Guard/Middleware
- Create session validation guard
- Apply guard to protected endpoints (personas, posts)
- Return proper 401 responses when not authenticated

### 1.4 Add Logout Endpoint
- Create POST /auth/logout endpoint
- Destroy session properly
- Clear cookies

### 1.5 Implement Forgot/Reset Password Flow
- Create password reset token table/model
- POST /auth/forgot-password endpoint
- POST /auth/reset-password endpoint
- Email integration (or mock for MVP)

## Phase 2: Frontend Auth Fixes

### 2.1 Update Auth Pages
- Add "Forgot Password?" link to login page
- Create ForgotPasswordPage component
- Create ResetPasswordPage component

### 2.2 Fix Auth State Management
- Ensure login/register properly update auth state
- Add proper error handling
- Add loading states

### 2.3 Update API Client
- Verify CORS configuration
- Ensure cookies are sent properly
- Add proper error interceptors

## Phase 3: CORS & Cookie Configuration

### 3.1 Backend CORS Update
- Add Vercel frontend URL to CORS origins
- Ensure SameSite=None for cross-origin cookies
- Ensure Secure=true for production

### 3.2 Frontend Environment
- Update VITE_API_URL to point to Render backend
- Verify withCredentials is set

## Phase 4: Testing & Validation

### 4.1 Browser Testing
- Test registration flow
- Test login flow
- Test session persistence (refresh page)
- Test logout flow
- Test forgot/reset password
- Verify cookies in DevTools

### 4.2 Network Inspection
- Verify Set-Cookie headers
- Verify cookie is sent on subsequent requests
- Check CORS headers

## Phase 5: Production Deployment

### 5.1 Environment Variables
- Update Render with CORS_ORIGIN
- Verify all secrets are set
- Update frontend .env for production

### 5.2 Final Verification
- Test on production URLs
- Verify HTTPS cookie handling
- Test all auth flows end-to-end
