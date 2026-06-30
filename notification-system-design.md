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
