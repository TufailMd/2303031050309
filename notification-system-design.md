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

---

# Stage 3 - SQL Query Performance Analysis

## Existing Query

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
  AND isRead = false
ORDER BY createdAt ASC;
```

---

# 1. Is the Query Accurate?

Yes.

The query correctly returns all unread notifications for student **1042**, sorted by the oldest notification first.

However, while the query is functionally correct, it becomes slow as the table grows to millions of records.

---

# 2. Why is the Query Slow?

With approximately:

- 50,000 students
- 5,000,000 notifications

the database may perform a large scan if appropriate indexes are not available.

Possible reasons:

- No index on `studentID`
- No index on `isRead`
- Sorting by `createdAt` requires additional work
- `SELECT *` fetches every column even when only a few are required

Without indexes, the query performs a **Full Table Scan**, resulting in approximately **O(N)** time complexity.

---

# 3. Optimized Query

Retrieve only the required columns instead of using `SELECT *`.

```sql
SELECT
    notificationID,
    title,
    message,
    notificationType,
    createdAt
FROM notifications
WHERE studentID = 1042
  AND isRead = FALSE
ORDER BY createdAt ASC;
```

---

# 4. Recommended Index

Create a composite index matching the filtering and sorting pattern.

```sql
CREATE INDEX idx_student_read_created
ON notifications(studentID, isRead, createdAt);
```

### Why this index?

- `studentID` filters notifications for one student.
- `isRead` filters unread notifications.
- `createdAt` supports sorting without an additional sort operation.

The database can directly use the index to locate matching rows in sorted order.

---

# 5. Expected Computation Cost

| Scenario | Time Complexity |
|----------|-----------------|
| No Index | O(N) |
| Index on studentID only | O(log N) + filtering |
| Composite Index (studentID, isRead, createdAt) | O(log N + K) |

Where:

- **N** = total notifications
- **K** = unread notifications returned

This significantly improves performance compared to scanning the entire table.

---

# 6. Should We Add Indexes on Every Column?

**No.**

Adding indexes to every column is not recommended.

### Reasons

- Increases storage usage.
- Slows INSERT, UPDATE, and DELETE operations because all indexes must also be updated.
- Many indexes are never used by queries.
- Extra indexes increase maintenance overhead.

Indexes should only be created for columns that are frequently used in:

- WHERE
- JOIN
- ORDER BY
- GROUP BY

---

# 7. Query to Find Students Who Received Placement Notifications in the Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
  AND createdAt >= NOW() - INTERVAL 7 DAY;
```

---

# 8. Recommended Index for This Query

```sql
CREATE INDEX idx_type_created_student
ON notifications(notificationType, createdAt, studentID);
```

This index efficiently supports:

- Filtering by `notificationType`
- Filtering by recent dates
- Returning matching `studentID` values

---

# 9. Summary

- The original query is **correct** but may become slow at scale.
- Avoid `SELECT *`; retrieve only required columns.
- Use a composite index on `(studentID, isRead, createdAt)` for the unread notifications API.
- Do **not** create indexes on every column, as they increase storage and write costs.
- Use targeted composite indexes based on common query patterns to achieve efficient performance.

---

# Stage 4 - Performance Optimization

## Problem Statement

Currently, the application fetches all notifications from the database every time a student opens a page.

With:

- 50,000+ students
- Millions of notifications

this approach puts unnecessary load on the database, increases response time, and negatively impacts the user experience.

---

# Performance Improvement Strategies

## 1. Pagination (Recommended)

### Problem

Fetching every notification on each request transfers unnecessary data.

### Solution

Return notifications in small batches.

Example API:

```http
GET /api/v1/notifications?page=1&limit=20
```

Example SQL:

```sql
SELECT notificationID,
       title,
       message,
       notificationType,
       createdAt,
       isRead
FROM notifications
WHERE studentID = 1042
ORDER BY createdAt DESC
LIMIT 20 OFFSET 0;
```

### Benefits

- Faster responses
- Lower memory usage
- Reduced database load
- Better user experience

### Trade-offs

- Multiple requests are needed to load all notifications.
- Offset-based pagination can become slower for very large page numbers (cursor-based pagination can solve this).

---

## 2. Fetch Only Unread Count

### Problem

Most users only need to know whether new notifications exist.

### Solution

Provide a lightweight API that returns only the unread notification count.

Example:

```http
GET /api/v1/notifications/unread/count
```

SQL:

```sql
SELECT COUNT(*)
FROM notifications
WHERE studentID = 1042
AND isRead = FALSE;
```

### Benefits

- Very small response
- Extremely fast
- Minimal database load

### Trade-offs

- Does not return notification details.
- A second request is required when the user opens the notification panel.

---

## 3. Redis Caching

### Problem

The same notification data is requested repeatedly.

### Solution

Store recently accessed notifications in Redis.

Flow:

```
Client
   │
   ▼
Redis Cache
   │
Cache Hit?
 ┌──┴──┐
 │ Yes │
 ▼     │
Return │
       ▼
      No
       │
       ▼
Database
       │
       ▼
Update Cache
```

### Benefits

- Very fast response times
- Reduces database traffic
- Improves scalability

### Trade-offs

- Extra infrastructure
- Cache invalidation must be handled when notifications change.

---

## 4. Real-Time Push Notifications (WebSocket)

### Problem

The client repeatedly requests notifications even when nothing has changed.

### Solution

Use WebSocket to push new notifications only when they are created.

Flow:

```
Server
   │
New Notification
   │
   ▼
WebSocket
   │
   ▼
Student Browser
```

### Benefits

- No unnecessary polling
- Instant updates
- Lower database usage
- Better user experience

### Trade-offs

- Persistent connections consume server resources.
- More complex implementation compared to REST.

---

## 5. Database Indexing

Create indexes on frequently queried columns.

```sql
CREATE INDEX idx_student_read_created
ON notifications(studentID, isRead, createdAt);
```

### Benefits

- Faster filtering
- Faster sorting
- Reduced query execution time

### Trade-offs

- Additional storage required
- Slightly slower INSERT, UPDATE, and DELETE operations

---

## 6. Read Replicas

### Problem

A single database server handles all read requests.

### Solution

Use database read replicas.

Architecture:

```
                Application
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
 Primary Database          Read Replica
     (Writes)                 (Reads)
```

### Benefits

- Distributes read traffic
- Better scalability
- Higher availability

### Trade-offs

- Replication lag may cause slightly stale data.
- Additional infrastructure cost.

---

## 7. Archive Old Notifications

### Problem

The notifications table keeps growing indefinitely.

### Solution

Move old notifications (for example, older than one year) to an archive table or cold storage.

### Benefits

- Smaller active dataset
- Faster queries
- Reduced index size

### Trade-offs

- Archived notifications require separate retrieval if needed.

---

# Recommended Overall Architecture

```
                    Student
                       │
                       ▼
                Load Balancer
                       │
                       ▼
               Application Server
                  │           │
                  │           ▼
                  │      WebSocket
                  │
                  ▼
              Redis Cache
                  │
        Cache Miss │
                  ▼
        Read Replica Database
                  │
                  ▼
          Primary Database
                  │
                  ▼
          Archive Database
```

---

# Recommended Solution

To achieve the best performance and scalability:

1. Use pagination to limit the number of notifications returned.
2. Cache frequently accessed notifications and unread counts in Redis.
3. Push new notifications using WebSocket instead of frequent polling.
4. Create composite indexes for common query patterns.
5. Use read replicas to distribute read traffic.
6. Archive old notifications to keep the active dataset small.

This combination minimizes database load, improves response times, supports real-time updates, and scales efficiently as the number of students and notifications grows.

---

# Stage 5 - Reliable Bulk Notification Delivery

## Existing Implementation

```python
function notify_all(student_ids, message):

    for student_id in student_ids:

        send_email(student_id, message)

        save_to_db(student_id, message)

        push_to_app(student_id, message)
```

---

# 1. Shortcomings of the Current Implementation

The current implementation has several issues:

### 1. Sequential Processing

Each student is processed one after another.

For 50,000 students:

- Email API call
- Database insert
- Push notification

are executed sequentially, resulting in a very slow process.

---

### 2. Single Point of Failure

If `send_email()` fails for one student, the remaining operations may stop depending on the implementation.

Example:

```
Student 1 ✓
Student 2 ✓
...
Student 200 ✓
Student 201 ❌ Email Failed

Remaining students are never processed.
```

---

### 3. No Retry Mechanism

Temporary failures (network issues, email provider downtime, rate limits) are never retried.

As a result, affected students never receive notifications.

---

### 4. No Error Tracking

The system does not record:

- Which students failed
- Why the failure occurred
- Whether the notification was retried

---

### 5. Tight Coupling

Database storage, email delivery, and push notifications are executed together.

If one service becomes slow or unavailable, the entire notification process slows down.

---

# 2. What if Email Failed for 200 Students?

The failed students should **not** be ignored.

Instead:

1. Store the notification in the database.
2. Mark email status as **Pending** or **Failed**.
3. Retry sending the email automatically.
4. Log failures for monitoring and debugging.
5. Notify administrators if repeated retries fail.

This ensures no notification is permanently lost.

---

# 3. Should Saving to the Database and Sending Email Happen Together?

**No.**

Saving the notification and sending emails should be separate operations.

## Why?

The database is the source of truth.

Once the notification is safely stored, email and push delivery can occur asynchronously.

Benefits:

- Faster API response
- Reliable delivery
- Easier retries
- Better fault tolerance

---

# 4. Improved Architecture

```
                  HR Clicks "Notify All"
                           │
                           ▼
                   Notification API
                           │
                           ▼
                  Save Notifications
                     in Database
                           │
                           ▼
                    Publish Event
                    (Message Queue)
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
   Email Worker                        Push Worker
         │                                   │
         ▼                                   ▼
 Email Service                     WebSocket / FCM
```

---

# 5. Revised Pseudocode

```python
function notify_all(student_ids, message):

    notifications = []

    for student_id in student_ids:

        notifications.append({
            "studentId": student_id,
            "message": message,
            "status": "PENDING",
            "createdAt": now()
        })

    bulk_insert_notifications(notifications)

    publish_to_queue(student_ids, message)

    return "Notification request accepted"
```

---

## Email Worker

```python
while queue.hasMessages():

    job = queue.consume()

    try:

        send_email(job.studentId, job.message)

        mark_email_status(job.studentId, "SENT")

    except:

        retry(job)

        log_error(job)
```

---

## Push Notification Worker

```python
while queue.hasMessages():

    job = queue.consume()

    push_to_app(job.studentId, job.message)
```

---

# 6. Retry Strategy

For temporary failures:

- Retry after 1 minute.
- Retry after 5 minutes.
- Retry after 15 minutes.
- Retry after 1 hour.
- Mark as permanently failed after the maximum retry limit.

This approach (exponential backoff) avoids overloading external services.

---

# 7. Benefits of the Redesigned System

- Fast response to the HR user.
- Notifications are safely stored before delivery.
- Email and push notifications are processed in parallel.
- Automatic retries improve reliability.
- Failed deliveries are tracked and can be monitored.
- Scales efficiently for tens of thousands of students.

---

# 8. Trade-offs

| Approach | Advantages | Disadvantages |
|----------|------------|---------------|
| Sequential Processing | Simple to implement | Slow, poor scalability, stops on failures |
| Asynchronous Queue-Based Processing | Fast, reliable, fault-tolerant, scalable | Requires additional infrastructure (e.g., RabbitMQ, Kafka, Redis Streams) |

---

# Final Recommendation

For a campus notification platform serving **50,000+ students**, use an **event-driven asynchronous architecture**:

1. Save all notifications to the database first (source of truth).
2. Publish notification jobs to a message queue.
3. Process email and push notifications independently using worker services.
4. Implement automatic retries with exponential backoff.
5. Track delivery status and failures for monitoring and recovery.

This design is highly scalable, fault-tolerant, and ensures reliable notification delivery even if external services experience temporary failures.