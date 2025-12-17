
USE lab111;

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_course_name (name)
);

CREATE TABLE IF NOT EXISTS tutor_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tutor_course (tutor_id, course_id)
);
```

## Step 2: Restart Backend Server

The backend server MUST be restarted to load the new courses route:

1. Stop the current server (Ctrl+C in the terminal)
2. Navigate to the backend folder:
   ```bash
   cd my-react-app/backend
   ```
3. Start the server:
   ```bash
   node server.js
   ```

You should see: "Server running on port 5000"

## Step 3: Verify

After restarting, the courses API should be available at:
- GET http://localhost:5000/api/courses
- POST http://localhost:5000/api/courses

If you still get a 404 error, the server didn't restart properly or the route file has an issue.

