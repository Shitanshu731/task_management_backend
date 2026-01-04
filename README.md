# TaskFlow - Real-time Task Management Backend API

A robust RESTful API built with Node.js, Express, PostgreSQL, and Socket.IO for real-time task management. This backend provides comprehensive task CRUD operations with WebSocket support for live collaboration features.

![Node.js](https://img.shields.io/badge/Node.js-18.0.0+-green)
![Express](https://img.shields.io/badge/Express-4.18.2-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6.1-black)

## ✨ Features

### Task Management API

- **Create Tasks**: RESTful endpoint for task creation with validation
- **Read Tasks**: Fetch all tasks or filter by status
- **Update Tasks**: Partial updates with validation middleware
- **Delete Tasks**: Safe task deletion with confirmation
- **Status Filtering**: Query tasks by status (pending, in-progress, completed)

### Real-time Capabilities

- **WebSocket Integration**: Live updates using Socket.IO
- **User Tracking**: Track and broadcast connected users
- **Real-time Events**: Instant notifications for task changes
- **User Identification**: Automatic user color and username assignment

### Data Validation

- **Input Validation**: Middleware for request validation
- **Error Handling**: Comprehensive error handling and logging
- **Data Sanitization**: Protection against invalid data
- **Status Validation**: Strict status type checking

### Database Management

- **PostgreSQL Integration**: Efficient data storage with connection pooling
- **Query Optimization**: Parameterized queries to prevent SQL injection
- **Connection Monitoring**: Automatic connection health checks
- **Error Recovery**: Graceful database error handling

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v12.0 or higher
- **npm** or **yarn**: Latest version

### Installation

1. **Navigate to the backend directory**

   ```bash
   cd task-management-app/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**

   Create a new PostgreSQL database:

   ```bash
   psql -U postgres
   CREATE DATABASE taskflow;
   \c taskflow
   ```

4. **Create the tasks table**

   ```sql
   CREATE TABLE tasks (
     id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     status VARCHAR(20) DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Add index for status filtering
   CREATE INDEX idx_tasks_status ON tasks(status);
   CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
   ```

5. **Configure environment variables**

   Create a `.env` file in the backend directory:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=taskflow
   DB_USER=postgres
   DB_PASSWORD=your_password_here

   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:5173
   ```

6. **Start the development server**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

7. **Verify the server is running**

   ```bash
   curl http://localhost:5000/health
   ```

   Expected response:

   ```json
   {
     "status": "OK",
     "message": "Server is running"
   }
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection pool
│   │
│   ├── controllers/
│   │   └── taskController.js    # Task business logic
│   │
│   ├── middleware/
│   │   └── validation.js        # Request validation middleware
│   │
│   ├── models/
│   │   └── taskModel.js         # Task data model
│   │
│   ├── routes/
│   │   └── taskRoutes.js        # API route definitions
│   │
│   └── utils/                   # Utility functions
│
├── server.js                     # Application entry point
├── package.json                  # Dependencies and scripts
├── .env                          # Environment variables
└── README.md                     # This file
```

## 🔌 API Endpoints

### Base URL

```
http://localhost:5000/api
```

### Task Endpoints

#### 1. Create Task

```http
POST /api/tasks
```

**Request Headers:**

```
Content-Type: application/json
x-socket-id: <socket-id>  // Optional: for user tracking
```

**Request Body:**

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README files",
  "status": "pending" // Optional: defaults to "pending"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive README files",
    "status": "pending",
    "created_at": "2026-01-04T10:30:00.000Z",
    "updated_at": "2026-01-04T10:30:00.000Z",
    "created_by": "User-abc123",
    "created_by_color": "#6366f1"
  }
}
```

**Validation Rules:**

- `title`: Required, max 255 characters
- `description`: Optional
- `status`: Optional, must be one of: `pending`, `in-progress`, `completed`

---

#### 2. Get All Tasks

```http
GET /api/tasks
```

**Query Parameters:**

- `status` (optional): Filter by status (`pending`, `in-progress`, `completed`)

**Examples:**

```bash
# Get all tasks
GET /api/tasks

# Get only pending tasks
GET /api/tasks?status=pending

# Get completed tasks
GET /api/tasks?status=completed
```

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive README files",
      "status": "pending",
      "created_at": "2026-01-04T10:30:00.000Z",
      "updated_at": "2026-01-04T10:30:00.000Z"
    }
    // ... more tasks
  ]
}
```

---

#### 3. Update Task

```http
PATCH /api/tasks/:id
```

**Request Headers:**

```
Content-Type: application/json
x-socket-id: <socket-id>  // Optional: for user tracking
```

**Request Body:** (all fields optional, at least one required)

```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in-progress"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated task title",
    "description": "Updated description",
    "status": "in-progress",
    "created_at": "2026-01-04T10:30:00.000Z",
    "updated_at": "2026-01-04T11:15:00.000Z",
    "updated_by": "User-xyz789",
    "updated_by_color": "#ec4899"
  }
}
```

**Error Response:** `404 Not Found`

```json
{
  "success": false,
  "error": "Task not found"
}
```

---

#### 4. Delete Task

```http
DELETE /api/tasks/:id
```

**Request Headers:**

```
x-socket-id: <socket-id>  // Optional: for user tracking
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "id": 1,
    "title": "Deleted task",
    "description": "This task was deleted",
    "status": "completed",
    "created_at": "2026-01-04T10:30:00.000Z",
    "updated_at": "2026-01-04T10:30:00.000Z"
  }
}
```

**Error Response:** `404 Not Found`

```json
{
  "success": false,
  "error": "Task not found"
}
```

---

#### 5. Health Check

```http
GET /health
```

**Response:** `200 OK`

```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## 🔄 WebSocket Events

### Client → Server Events

#### user:identify

Sent when a user connects to identify themselves.

```javascript
socket.emit("user:identify", {
  username: "JohnDoe",
  color: "#6366f1",
});
```

### Server → Client Events

#### task:created

Emitted when a new task is created.

```javascript
socket.on("task:created", (task) => {
  console.log("New task created:", task);
});
```

**Payload:**

```json
{
  "id": 1,
  "title": "New task",
  "description": "Task description",
  "status": "pending",
  "created_at": "2026-01-04T10:30:00.000Z",
  "created_by": "User-abc123",
  "created_by_color": "#6366f1"
}
```

---

#### task:updated

Emitted when a task is updated.

```javascript
socket.on("task:updated", (task) => {
  console.log("Task updated:", task);
});
```

**Payload:**

```json
{
  "id": 1,
  "title": "Updated task",
  "description": "Updated description",
  "status": "in-progress",
  "updated_at": "2026-01-04T11:15:00.000Z",
  "updated_by": "User-xyz789",
  "updated_by_color": "#ec4899"
}
```

---

#### task:deleted

Emitted when a task is deleted.

```javascript
socket.on("task:deleted", (data) => {
  console.log("Task deleted:", data);
});
```

**Payload:**

```json
{
  "id": 1,
  "deleted_by": "User-xyz789",
  "deleted_by_color": "#ec4899"
}
```

---

#### users:list

Emitted when the list of connected users changes.

```javascript
socket.on("users:list", (users) => {
  console.log("Connected users:", users);
});
```

**Payload:**

```json
[
  {
    "socketId": "abc123xyz",
    "username": "JohnDoe",
    "color": "#6366f1",
    "connectedAt": "2026-01-04T10:00:00.000Z"
  }
  // ... more users
]
```

---

#### user:connected

Emitted when a new user connects.

```javascript
socket.on("user:connected", (user) => {
  console.log("User connected:", user);
});
```

---

#### user:disconnected

Emitted when a user disconnects.

```javascript
socket.on("user:disconnected", (user) => {
  console.log("User disconnected:", user);
});
```

## 🏗️ Architecture Overview

### MVC Pattern

The application follows the Model-View-Controller (MVC) pattern:

- **Models** (`src/models/`): Database interaction and data logic
- **Views**: Frontend application (separate repository)
- **Controllers** (`src/controllers/`): Business logic and request handling
- **Routes** (`src/routes/`): API endpoint definitions

### Request Flow

```
Client Request
    ↓
Express Router (taskRoutes.js)
    ↓
Validation Middleware (validation.js)
    ↓
Controller (taskController.js)
    ↓
Model (taskModel.js)
    ↓
PostgreSQL Database
    ↓
Response + Socket.IO Broadcast
    ↓
All Connected Clients
```

### Key Components

#### 1. Database Configuration (`src/config/database.js`)

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
```

- Connection pooling for optimal performance
- Automatic connection monitoring
- Error handling and logging

#### 2. Task Model (`src/models/taskModel.js`)

Provides database operations:

- `create(title, description, status)`: Create new task
- `findAll(status)`: Fetch all tasks, optionally filtered
- `findById(id)`: Find single task by ID
- `update(id, updates)`: Update task fields
- `delete(id)`: Delete task

#### 3. Task Controller (`src/controllers/taskController.js`)

Handles business logic:

- Request validation
- User tracking via Socket.IO
- Real-time event broadcasting
- Error handling and responses

#### 4. Validation Middleware (`src/middleware/validation.js`)

- `validateTask`: Validates task creation requests
- `validateTaskUpdate`: Validates task update requests
- Input sanitization and error aggregation

## 🔧 Available Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev
```

## 🛠️ Technologies Used

| Technology | Version | Purpose                   |
| ---------- | ------- | ------------------------- |
| Node.js    | 18.0.0+ | JavaScript runtime        |
| Express    | 4.18.2  | Web framework             |
| PostgreSQL | 8.11.3  | Database                  |
| Socket.IO  | 4.6.1   | Real-time communication   |
| CORS       | 2.8.5   | Cross-origin support      |
| dotenv     | 16.3.1  | Environment configuration |
| Nodemon    | 3.0.2   | Development auto-reload   |

## ⚙️ Configuration

### Environment Variables

| Variable     | Description           | Default               | Required |
| ------------ | --------------------- | --------------------- | -------- |
| PORT         | Server port number    | 5000                  | No       |
| NODE_ENV     | Environment mode      | development           | No       |
| DB_HOST      | PostgreSQL host       | localhost             | Yes      |
| DB_PORT      | PostgreSQL port       | 5432                  | Yes      |
| DB_NAME      | Database name         | -                     | Yes      |
| DB_USER      | Database username     | -                     | Yes      |
| DB_PASSWORD  | Database password     | -                     | Yes      |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 | No       |

### CORS Configuration

The server is configured to accept requests from the frontend:

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};
```

For production, set `FRONTEND_URL` to your deployed frontend URL.

## 🧪 Testing the API

### Using cURL

**Create a task:**

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Testing the API","status":"pending"}'
```

**Get all tasks:**

```bash
curl http://localhost:5000/api/tasks
```

**Update a task:**

```bash
curl -X PATCH http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}'
```

**Delete a task:**

```bash
curl -X DELETE http://localhost:5000/api/tasks/1
```

### Using Postman

1. Import the API endpoints into Postman
2. Set the base URL to `http://localhost:5000/api`
3. Add requests for each endpoint
4. Test with various payloads

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** `❌ Unexpected database error`

**Solution:**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Verify connection parameters
psql -h localhost -U postgres -d taskflow

# Check environment variables
cat .env
```

---

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**

```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # macOS/Linux

# Kill the process
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # macOS/Linux

# Or use different port
PORT=5001 npm run dev
```

---

### CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**

1. Verify `FRONTEND_URL` in `.env` matches your frontend URL
2. Restart the server after changing environment variables
3. Check that credentials are enabled in both frontend and backend

---

### Task Validation Errors

**Error:** `Status must be one of: pending, in-progress, completed`

**Solution:**
Ensure status values match exactly (lowercase, with hyphens):

- ✅ `pending`, `in-progress`, `completed`
- ❌ `Pending`, `in progress`, `complete`

## 🔒 Security Considerations

### Implemented Security Measures

1. **SQL Injection Prevention**: Parameterized queries using PostgreSQL's `$1, $2` syntax
2. **CORS Protection**: Whitelist-based origin validation
3. **Input Validation**: Middleware validation for all user inputs
4. **Error Handling**: Generic error messages to prevent information leakage
5. **Environment Variables**: Sensitive data stored in `.env` file

### Recommended Enhancements

- [ ] Implement authentication (JWT or session-based)
- [ ] Add rate limiting to prevent API abuse
- [ ] Implement request logging for audit trails
- [ ] Add helmet.js for HTTP header security
- [ ] Implement API versioning
- [ ] Add input sanitization library (e.g., validator.js)
- [ ] Implement HTTPS in production
- [ ] Add database migration system (e.g., Knex.js)

## 📊 Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  status          VARCHAR(20) DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

### Table Structure

| Column      | Type         | Constraints               | Description           |
| ----------- | ------------ | ------------------------- | --------------------- |
| id          | SERIAL       | PRIMARY KEY               | Auto-incrementing ID  |
| title       | VARCHAR(255) | NOT NULL                  | Task title            |
| description | TEXT         | -                         | Task description      |
| status      | VARCHAR(20)  | DEFAULT 'pending'         | Task status           |
| created_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Creation timestamp    |
| updated_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

## 📈 Performance Optimization

### Current Optimizations

1. **Connection Pooling**: PostgreSQL connection pool for efficient database access
2. **Indexing**: Database indexes on frequently queried columns
3. **Query Optimization**: Efficient SQL queries with proper filtering
4. **Event-Driven Architecture**: Socket.IO for non-blocking real-time updates

### Future Optimizations

- [ ] Implement Redis caching for frequently accessed data
- [ ] Add database query result caching
- [ ] Implement pagination for large result sets
- [ ] Add compression middleware (e.g., compression)
- [ ] Optimize Socket.IO with Redis adapter for horizontal scaling
- [ ] Implement database read replicas for scaling

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure production database (not local PostgreSQL)
- [ ] Set up error logging (e.g., Winston, Sentry)
- [ ] Implement monitoring (e.g., PM2, New Relic)
- [ ] Configure reverse proxy (e.g., Nginx)
- [ ] Set up CI/CD pipeline
- [ ] Enable rate limiting

### Deployment Platforms

**Recommended platforms:**

- **Heroku**: Easy PostgreSQL integration
- **Railway**: Modern deployment platform
- **Render**: Free tier with PostgreSQL
- **AWS EC2**: Full control and scalability
- **DigitalOcean**: App Platform or Droplets

### Example: Deploying to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create taskflow-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-url.com

# Deploy
git push heroku main

# Create database table
heroku pg:psql < schema.sql

# Check logs
heroku logs --tail
```

## 📝 API Response Standards

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "count": 5 // Optional: for list endpoints
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "errors": ["Error 1", "Error 2"] // For validation errors
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Use meaningful variable and function names
- Follow async/await pattern for asynchronous operations
- Add comments for complex logic
- Keep functions focused and single-purpose
- Use `const` for constants, `let` for variables
- Follow the existing project structure

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **Shitanshu731** - Initial work

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- Socket.IO for real-time communication capabilities
- PostgreSQL community for the robust database
- Node.js community for the ecosystem

---

**Need Help?**

For issues, bugs, or feature requests, please create an issue in the repository.

**Happy Coding! 🚀**
