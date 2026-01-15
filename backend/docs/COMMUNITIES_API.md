# Phase 1 - Community System API Documentation

## Base URL
- **Local:** `http://localhost:3000/api/v1`
- **Production:** `https://community-app-render.onrender.com/api/v1`

---

## Endpoints

### 1. Create Community

**POST** `/communities`

Creates a new community. The creator is automatically assigned as the owner.

**Authentication:** Required (session cookie)

**Request Body:**
```json
{
  "name": "My Awesome Community",
  "description": "A community for awesome people",
  "type": "public_open",
  "slug": "my-awesome-community",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bannerUrl": "https://example.com/banner.jpg"
}
```

**Fields:**
- `name` (required): Community name (3-100 characters)
- `description` (optional): Community description (max 500 characters)
- `type` (required): One of `private`, `public_restricted`, `public_open`
- `slug` (optional): URL-friendly identifier (auto-generated from name if not provided)
- `avatarUrl` (optional): Community avatar image URL
- `bannerUrl` (optional): Community banner image URL

**Response:** `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "slug": "my-awesome-community",
  "name": "My Awesome Community",
  "description": "A community for awesome people",
  "type": "public_open",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bannerUrl": "https://example.com/banner.jpg",
  "memberCount": 1,
  "followerCount": 0,
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-01-15T08:00:00.000Z",
  "userRole": "owner",
  "isFollowing": false,
  "isMember": true
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/communities \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -d '{
    "name": "Tech Enthusiasts",
    "description": "A community for technology lovers",
    "type": "public_open"
  }'
```

---

### 2. List Communities

**GET** `/communities`

Lists communities with optional filtering and pagination.

**Authentication:** Optional (affects visibility)

**Query Parameters:**
- `type` (optional): Filter by type (`private`, `public_restricted`, `public_open`)
- `search` (optional): Search by name or description
- `limit` (optional): Number of results per page (1-100, default: 20)
- `cursor` (optional): Cursor for pagination (community ID)

**Response:** `200 OK`
```json
{
  "communities": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "slug": "tech-enthusiasts",
      "name": "Tech Enthusiasts",
      "description": "A community for technology lovers",
      "type": "public_open",
      "avatarUrl": null,
      "bannerUrl": null,
      "memberCount": 42,
      "followerCount": 15,
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-01-15T08:00:00.000Z",
      "userRole": "member",
      "isFollowing": false,
      "isMember": true
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "cursor": null,
    "hasMore": false
  }
}
```

**cURL Examples:**
```bash
# List all public communities
curl http://localhost:3000/api/v1/communities

# Search for communities
curl "http://localhost:3000/api/v1/communities?search=tech"

# Filter by type
curl "http://localhost:3000/api/v1/communities?type=public_open"

# With pagination
curl "http://localhost:3000/api/v1/communities?limit=10&cursor=123e4567-e89b-12d3-a456-426614174000"

# Authenticated request (shows private communities you're a member of)
curl http://localhost:3000/api/v1/communities \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

---

### 3. Get Community by ID

**GET** `/communities/:id`

Retrieves a specific community by ID.

**Authentication:** Optional (affects visibility)

**Path Parameters:**
- `id`: Community UUID

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "slug": "tech-enthusiasts",
  "name": "Tech Enthusiasts",
  "description": "A community for technology lovers",
  "type": "public_open",
  "avatarUrl": null,
  "bannerUrl": null,
  "memberCount": 42,
  "followerCount": 15,
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-01-15T08:00:00.000Z",
  "userRole": "member",
  "isFollowing": false,
  "isMember": true
}
```

**Error Responses:**
- `404 Not Found`: Community doesn't exist or user doesn't have permission to view it

**cURL Example:**
```bash
curl http://localhost:3000/api/v1/communities/123e4567-e89b-12d3-a456-426614174000

# Authenticated request
curl http://localhost:3000/api/v1/communities/123e4567-e89b-12d3-a456-426614174000 \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

---

## Visibility Rules

### Public Open (`public_open`)
- **Listing:** Visible to everyone
- **Viewing:** Anyone can view details
- **Joining:** Anyone can join (Phase 2)

### Public Restricted (`public_restricted`)
- **Listing:** Visible to everyone
- **Viewing:** Anyone can view details
- **Joining:** Requires approval (Phase 2)

### Private (`private`)
- **Listing:** Only visible to members
- **Viewing:** Only members can view details
- **Joining:** Invite-only (Phase 2)

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["name must be at least 3 characters"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Authentication required",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Community not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Community slug already exists",
  "error": "Conflict"
}
```

---

## Phase 2 Endpoints (Coming Soon)

- `PUT /communities/:id` - Update community
- `DELETE /communities/:id` - Delete community
- `POST /communities/:id/follow` - Follow community
- `DELETE /communities/:id/follow` - Unfollow community
- `POST /communities/:id/join` - Join/request to join
- `POST /communities/:id/leave` - Leave community
- `GET /communities/:id/members` - List members
- `POST /communities/:id/members/:userId/role` - Change member role
- `GET /communities/:id/requests` - List join requests
- `POST /communities/:id/requests/:requestId/approve` - Approve request
- `POST /communities/:id/requests/:requestId/reject` - Reject request

---

## Testing Workflow

### 1. Register/Login
```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "initialDisplayName": "Test User"
  }' \
  -c cookies.txt

# Login (if already registered)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

### 2. Create a Community
```bash
curl -X POST http://localhost:3000/api/v1/communities \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "My First Community",
    "description": "Testing the community system",
    "type": "public_open"
  }'
```

### 3. List Communities
```bash
curl http://localhost:3000/api/v1/communities -b cookies.txt
```

### 4. Get Community Details
```bash
# Replace COMMUNITY_ID with actual ID from create response
curl http://localhost:3000/api/v1/communities/COMMUNITY_ID -b cookies.txt
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are version 4 (random)
- Session cookies are HttpOnly and secure in production
- Rate limiting: 5 community creations per hour per user
- Maximum 100 results per page for list endpoint
