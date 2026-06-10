# Campus Notification System Design

## Stage 1: REST API Design

### Core Actions
The notification platform should support the following core actions:
1. **Fetch notifications** for a logged-in student
2. **Mark notification(s) as read**
3. **Delete notification(s)**
4. **Create/send notification** (admin action)
5. **Get notification count** (unread count)
6. **Filter notifications** by type (Placement, Event, Result)

---

### REST API Endpoints

#### 1. Get All Notifications for a Student
```http
GET /api/notifications
```

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
- `type` (optional): Filter by notification type (`Placement`, `Event`, `Result`)
- `isRead` (optional): Filter by read status (`true`, `false`)
- `limit` (optional): Number of notifications to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "type": "Placement",
      "message": "CSX Corporation hiring - Apply now!",
      "timestamp": "2026-04-22T17:51:30Z",
      "isRead": false,
      "priority": "high"
    },
    {
      "id": "81589ada-0ad3-4f77-9554-f52fb558e09d",
      "type": "Event",
      "message": "Tech Fest registration open",
      "timestamp": "2026-04-22T17:51:18Z",
      "isRead": true,
      "priority": "medium"
    }
  ],
  "total": 45,
  "unreadCount": 12
}
```

---

#### 2. Get Unread Notification Count
```http
GET /api/notifications/unread-count
```

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "unreadCount": 12
}
```

---

#### 3. Mark Notification(s) as Read
```http
PATCH /api/notifications/read
```

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "notificationIds": [
    "d146095a-0d86-4a34-9e69-3900a14576bc",
    "81589ada-0ad3-4f77-9554-f52fb558e09d"
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "markedCount": 2,
  "message": "Notifications marked as read"
}
```

---

#### 4. Mark All Notifications as Read
```http
PATCH /api/notifications/read-all
```

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "markedCount": 12,
  "message": "All notifications marked as read"
}
```

---

#### 5. Delete Notification
```http
DELETE /api/notifications/:notificationId
```

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

#### 6. Create Notification (Admin)
```http
POST /api/notifications
```

**Headers:**
```json
{
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "type": "Placement",
  "message": "Google is hiring - Apply by May 1st",
  "studentIds": [1042, 1043, 1044],
  "priority": "high"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "notificationId": "d146095a-0d86-4a34-9e69-3900a14576bc",
  "sentTo": 3,
  "message": "Notification sent successfully"
}
```

---

#### 7. Broadcast Notification to All (Admin)
```http
POST /api/notifications/broadcast
```

**Headers:**
```json
{
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "type": "Event",
  "message": "Annual Day on May 15th - All students must attend",
  "priority": "medium"
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Broadcast notification queued",
  "estimatedRecipients": 50000,
  "jobId": "broadcast-job-12345"
}
```

---

### Real-Time Notification Mechanism

**Technology Choice: WebSocket with Socket.IO**

**Why WebSocket?**
- Persistent bi-directional connection
- Low latency for real-time updates
- Efficient for push notifications
- Better than polling (reduces server load)

**WebSocket Connection:**
```javascript
// Client connects with authentication
const socket = io('wss://campus.example.com', {
  auth: {
    token: '<access_token>'
  }
});

// Listen for new notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
  // Update UI
});

// Listen for read status updates
socket.on('notification:read', (data) => {
  console.log('Notification marked as read:', data.notificationId);
});
```

**Server Events:**
1. `notification` - New notification received
2. `notification:read` - Notification marked as read
3. `notification:deleted` - Notification deleted
4. `notification:broadcast` - Broadcast notification to all connected students

**Event Payload Structure:**
```json
{
  "event": "notification",
  "data": {
    "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
    "type": "Placement",
    "message": "New job posting from Microsoft",
    "timestamp": "2026-04-22T17:51:30Z",
    "priority": "high"
  }
}
```

**Alternative: Server-Sent Events (SSE)**
- One-way communication (server to client)
- Simpler than WebSocket
- Suitable if only server needs to push updates
- Uses standard HTTP (easier to deploy)

---

### Error Responses

**400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "Invalid notification type. Must be one of: Placement, Event, Result"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to perform this action"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Notification not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please try again later."
}
```

---

### API Naming Conventions
- Use **plural nouns** for resources (`/notifications`, not `/notification`)
- Use **kebab-case** for multi-word parameters (`unread-count`, not `unreadCount`)
- Use **HTTP verbs** appropriately (GET, POST, PATCH, DELETE)
- Version the API if needed (`/api/v1/notifications`)
- Use **meaningful status codes** (200, 201, 400, 401, 403, 404, 500)

