CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

-- Courses/Subjects table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_course_name (name)
);

-- Junction table to link tutors with courses (many-to-many relationship)
CREATE TABLE IF NOT EXISTS tutor_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tutor_course (tutor_id, course_id)
);


-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NULL,
  grade_value VARCHAR(20) NOT NULL,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);



-- Tutors table (used by tutors API)
CREATE TABLE IF NOT EXISTS tutors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    description TEXT,
    rate DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Availability per tutor per weekday (0=Sun..6=Sat)
CREATE TABLE IF NOT EXISTS tutor_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    day_of_week TINYINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_tutor_day_time (tutor_id, day_of_week, start_time, end_time)
);

-- Bookings between students and tutors
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    lesson_date DATE NOT NULL,
    lesson_time TIME NOT NULL,
    duration INT DEFAULT 60,
    notes TEXT,
    status ENUM('pending','confirmed','cancelled','completed') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_slot (tutor_id, lesson_date, lesson_time)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_bookings_student ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor ON bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_tutor_courses_tutor ON tutor_courses(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_courses_course ON tutor_courses(course_id);

-- Optional seed data
-- INSERT INTO tutors (first_name, last_name, description, rate) VALUES ('Alice','Smith','Math tutor',40.00);
-- INSERT INTO courses (name, description, category) VALUES ('Algebra I','Introductory algebra','Math');
-- INSERT INTO students (first_name, last_name, email) VALUES ('John','Doe','john@example.com');
-- INSERT INTO tutor_courses (tutor_id, course_id) VALUES (1,1);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method VARCHAR(50) DEFAULT 'manual',
    status VARCHAR(20) DEFAULT 'paid',
    reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);



-- Find the existing FK name
SELECT CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'lab111'
  AND TABLE_NAME = 'grades'
  AND COLUMN_NAME = 'course_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Then replace <FK_NAME> below with the name returned
ALTER TABLE grades DROP FOREIGN KEY <FK_NAME>;
ALTER TABLE grades
  ADD CONSTRAINT fk_grades_course
  FOREIGN KEY (course_id) REFERENCES courses(id)
  ON DELETE SET NULL;