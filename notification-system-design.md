# Notification System Design

# Stage 1 - Notification System REST API Design

## Overview

This document defines the REST API design for a Campus Notification Platform. The platform allows students to receive real-time notifications related to Placements, Events, and Results.

**Base URL**

```
/api/v1
```

**Content Type**

```
Content-Type: application/json
```

**Authentication**

Authentication is assumed to be pre-configured.

```
Authorization: Bearer <access_token>
```

---

# Notification JSON Schema

```json
{
  "id": "string",
  "title": "string",
  "message": "string",
  "type": "placement | event | result",
  "priority": "low | medium | high",
  "isRead": false,
  "createdAt": "2026-06-30T10:30:00Z",
  "updatedAt": "2026-06-30T10:30:00Z"
}
```

---

# Standard Response Format

## Success Response

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

## Error Response

```json
{
  "success": false,
  "message": "Resource not found",
  "error": {}
}
```

---

# API Endpoints

---

## 1. Get All Notifications

### Endpoint

```
GET /api/v1/notifications
```

### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "n101",
      "title": "Amazon Internship",
      "message": "Applications are now open.",
      "type": "placement",
      "priority": "high",
      "isRead": false,
      "createdAt": "2026-06-30T10:00:00Z"
    }
  ]
}
```

---

## 2. Get Notification By ID

### Endpoint

```
GET /api/v1/notifications/{id}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "n101",
    "title": "Amazon Internship",
    "message": "Applications are now open.",
    "type": "placement",
    "priority": "high",
    "isRead": false,
    "createdAt": "2026-06-30T10:00:00Z"
  }
}
```

---

## 3. Get Unread Notifications

### Endpoint

```
GET /api/v1/notifications/unread
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "n101",
      "title": "Amazon Internship",
      "message": "Applications are now open.",
      "type": "placement",
      "priority": "high",
      "isRead": false
    }
  ]
}
```

---

## 4. Mark Notification as Read

### Endpoint

```
PATCH /api/v1/notifications/{id}/read
```

### Request Body

```json
{}
```

### Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 5. Mark All Notifications as Read

### Endpoint

```
PATCH /api/v1/notifications/read-all
```

### Request Body

```json
{}
```

### Response

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 6. Delete Notification

### Endpoint

```
DELETE /api/v1/notifications/{id}
```

### Response

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 7. Create Notification

### Endpoint

```
POST /api/v1/notifications
```

### Request Body

```json
{
  "title": "Microsoft Hiring",
  "message": "Registration closes tomorrow.",
  "type": "placement",
  "priority": "high"
}
```

### Response

```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": "n105"
  }
}
```

---

# HTTP Status Codes

| Status Code | Meaning |
|-------------|----------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

---

# Real-Time Notification Design

The application supports instant notification delivery using **WebSocket**.

## Connection Endpoint

```
ws://localhost:3000/api/v1/notifications/stream
```

## Flow

```
+-------------+
|   Student   |
+-------------+
       |
       | Connect
       |
+--------------------+
|   WebSocket API    |
+--------------------+
       |
       | New Notification
       |
+--------------------+
| Notification Server|
+--------------------+
       |
       | Push Event
       |
+-------------+
| Frontend UI |
+-------------+
```

## WebSocket Event

```json
{
  "event": "NEW_NOTIFICATION",
  "data": {
    "id": "n120",
    "title": "Semester Result",
    "message": "Your result has been published.",
    "type": "result",
    "priority": "high",
    "isRead": false,
    "createdAt": "2026-06-30T14:00:00Z"
  }
}
```

---

# Supported Notification Types

- Placement
- Event
- Result

---

# Priority Levels

- Low
- Medium
- High

---

# Assumptions

- Authentication is already implemented.
- Users are pre-authorized.
- Responses are returned in JSON format.
- All timestamps use ISO 8601 format.
- Notifications are delivered instantly using WebSocket.
- Logging is handled through the custom Logging Middleware as required by the assessment.


---

# Stage 2 - Persistent Storage Design

## Database Selection

### Chosen Database: MongoDB (NoSQL)

### Why MongoDB?

The notification system stores flexible and high-volume notification data. MongoDB is suitable because:

- Schema is flexible and easy to extend.
- Handles large amounts of data efficiently.
- Stores JSON-like documents naturally.
- Supports indexing for fast queries.
- Easily scalable using sharding.
- Well suited for real-time applications.

---

# Notifications Collection Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  message: String,
  type: "placement" | "event" | "result",
  priority: "low" | "medium" | "high",
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

# Suggested Indexes

```javascript
db.notifications.createIndex({ userId: 1 });

db.notifications.createIndex({ isRead: 1 });

db.notifications.createIndex({ createdAt: -1 });

db.notifications.createIndex({ type: 1 });

db.notifications.createIndex({
    userId: 1,
    isRead: 1
});
```

These indexes improve the performance of:

- Fetching notifications for a user
- Fetching unread notifications
- Sorting by latest notifications
- Filtering by notification type

---

# Collection Structure

```
notifications
|
|-- _id
|-- userId
|-- title
|-- message
|-- type
|-- priority
|-- isRead
|-- createdAt
|-- updatedAt
```

---

# MongoDB Queries

## 1. Create Notification

```javascript
db.notifications.insertOne({
    userId: ObjectId("USER_ID"),
    title: "Amazon Internship",
    message: "Applications are now open.",
    type: "placement",
    priority: "high",
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
});
```

---

## 2. Get All Notifications

```javascript
db.notifications.find({
    userId: ObjectId("USER_ID")
}).sort({
    createdAt: -1
});
```

---

## 3. Get Notification by ID

```javascript
db.notifications.findOne({
    _id: ObjectId("NOTIFICATION_ID")
});
```

---

## 4. Get Unread Notifications

```javascript
db.notifications.find({
    userId: ObjectId("USER_ID"),
    isRead: false
});
```

---

## 5. Mark Notification as Read

```javascript
db.notifications.updateOne(
{
    _id: ObjectId("NOTIFICATION_ID")
},
{
    $set: {
        isRead: true,
        updatedAt: new Date()
    }
});
```

---

## 6. Mark All Notifications as Read

```javascript
db.notifications.updateMany(
{
    userId: ObjectId("USER_ID"),
    isRead: false
},
{
    $set: {
        isRead: true,
        updatedAt: new Date()
    }
});
```

---

## 7. Delete Notification

```javascript
db.notifications.deleteOne({
    _id: ObjectId("NOTIFICATION_ID")
});
```

---

# Mapping REST APIs to Database Operations

| REST API | MongoDB Operation |
|----------|-------------------|
| GET /notifications | find() |
| GET /notifications/:id | findOne() |
| GET /notifications/unread | find() |
| POST /notifications | insertOne() |
| PATCH /notifications/:id/read | updateOne() |
| PATCH /notifications/read-all | updateMany() |
| DELETE /notifications/:id | deleteOne() |

---

# Challenges as Data Volume Increases

## 1. Slow Query Performance

**Problem**

Searching millions of notifications becomes slower.

**Solution**

- Create indexes.
- Use pagination.
- Query only required fields.

---

## 2. Large Collection Size

**Problem**

Storage grows rapidly.

**Solution**

- Archive old notifications.
- Apply retention policies.
- Delete expired notifications automatically.

---

## 3. High Concurrent Users

**Problem**

Many students may access notifications simultaneously.

**Solution**

- Horizontal scaling using MongoDB Sharding.
- Load balancing across application servers.

---

## 4. Increased Memory Usage

**Problem**

Frequently accessed data increases database load.

**Solution**

- Use Redis caching for recent or unread notifications.
- Cache notification counts.

---

## 5. Real-Time Notification Load

**Problem**

Thousands of simultaneous WebSocket connections.

**Solution**

- Use WebSocket clustering.
- Employ a message broker (e.g., Redis Pub/Sub or RabbitMQ) to distribute events across servers.

---

# Scalability Strategy

```
Clients
    │
    ▼
Load Balancer
    │
    ▼
Application Servers
    │
    ├──────────────► Redis Cache
    │
    ├──────────────► WebSocket Server
    │
    ▼
MongoDB Cluster
    │
    ├── Replica Set
    └── Sharding
```

---

# Summary

- **Database:** MongoDB
- **Storage Model:** Document-based collection
- **Indexes:** userId, isRead, type, createdAt
- **Queries:** CRUD operations matching REST APIs
- **Scalability:** Indexing, Pagination, Redis Cache, Replica Set, Sharding, WebSocket clustering
- **High Availability:** MongoDB Replica Sets