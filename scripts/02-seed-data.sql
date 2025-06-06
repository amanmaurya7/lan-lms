-- Insert sample data
USE lms_db;

-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES
('admin', 'admin@lms.local', '$2b$10$rQZ9QmjlhF5h5h5h5h5h5uOYl.Vh9HdHpyLfQcHdHpyLfQcHdHpyL', 'admin', 'System', 'Administrator');

-- Insert sample teacher (password: teacher123)
INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES
('teacher1', 'teacher1@lms.local', '$2b$10$rQZ9QmjlhF5h5h5h5h5h5uOYl.Vh9HdHpyLfQcHdHpyLfQcHdHpyL', 'teacher', 'John', 'Smith');

-- Insert sample students (password: student123)
INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES
('student1', 'student1@lms.local', '$2b$10$rQZ9QmjlhF5h5h5h5h5h5uOYl.Vh9HdHpyLfQcHdHpyLfQcHdHpyL', 'student', 'Alice', 'Johnson'),
('student2', 'student2@lms.local', '$2b$10$rQZ9QmjlhF5h5h5h5h5h5uOYl.Vh9HdHpyLfQcHdHpyLfQcHdHpyL', 'student', 'Bob', 'Wilson'),
('student3', 'student3@lms.local', '$2b$10$rQZ9QmjlhF5h5h5h5h5h5uOYl.Vh9HdHpyLfQcHdHpyLfQcHdHpyL', 'student', 'Carol', 'Davis');

-- Insert sample courses
INSERT INTO courses (title, description, course_code, teacher_id, category) VALUES
('Introduction to Computer Science', 'Basic concepts of computer science and programming', 'CS101', 2, 'Computer Science'),
('Web Development Fundamentals', 'Learn HTML, CSS, and JavaScript basics', 'WEB101', 2, 'Web Development'),
('Database Systems', 'Introduction to database design and SQL', 'DB101', 2, 'Database');

-- Enroll students in courses
INSERT INTO enrollments (course_id, student_id) VALUES
(1, 3), (1, 4), (1, 5),
(2, 3), (2, 4),
(3, 4), (3, 5);

-- Insert sample quiz
INSERT INTO quizzes (course_id, title, description, time_limit, attempts_allowed, seb_required) VALUES
(1, 'Programming Basics Quiz', 'Test your knowledge of basic programming concepts', 30, 2, TRUE);

-- Insert quiz questions
INSERT INTO quiz_questions (quiz_id, question_text, question_type, points, order_num) VALUES
(1, 'What is a variable in programming?', 'multiple_choice', 2, 1),
(1, 'Python is a compiled language.', 'true_false', 1, 2),
(1, 'What does HTML stand for?', 'short_answer', 2, 3);

-- Insert quiz question options
INSERT INTO quiz_question_options (question_id, option_text, is_correct, order_num) VALUES
(1, 'A container for storing data values', TRUE, 1),
(1, 'A type of loop', FALSE, 2),
(1, 'A function parameter', FALSE, 3),
(1, 'A programming language', FALSE, 4),
(2, 'True', FALSE, 1),
(2, 'False', TRUE, 2);

-- Insert sample assignment
INSERT INTO assignments (course_id, title, description, due_date, max_file_size) VALUES
(1, 'Programming Assignment 1', 'Write a simple calculator program', DATE_ADD(NOW(), INTERVAL 7 DAY), 5242880);
