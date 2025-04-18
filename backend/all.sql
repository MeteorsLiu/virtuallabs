CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL COMMENT '存储密码哈希值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户角色表（实现多角色管理）
CREATE TABLE user_roles (
    user_id INT PRIMARY KEY,
    role ENUM('student', 'teacher') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 用户详细信息表（公共信息）
CREATE TABLE user_profiles (
    user_id INT PRIMARY KEY,
    gender ENUM('male', 'female', 'other'),
    email VARCHAR(255),
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 学生信息扩展表
CREATE TABLE student_information (
    user_id INT PRIMARY KEY,
    student_number VARCHAR(20) UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 修改后的关联表示例（保持外键约束）
CREATE TABLE student_classes (
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    enrollment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, class_id),
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES user_roles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE
);

-- 班级表
CREATE TABLE classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) UNIQUE NOT NULL,
    head_teacher_id INT,
    FOREIGN KEY (head_teacher_id) REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 教师班级关联表
CREATE TABLE teacher_classes (
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    PRIMARY KEY (teacher_id, class_id),
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES user_roles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_class_id (class_id)
);

-- 课程表
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 教师课程关联表
CREATE TABLE teacher_courses (
    teacher_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (teacher_id, course_id),
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES user_roles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    INDEX idx_teacher_course_teacher (teacher_id),
    INDEX idx_teacher_course_course (course_id)
);

-- 学生选课表
CREATE TABLE enrollments (
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES user_roles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    INDEX idx_enrollment_student (student_id),
    INDEX idx_enrollment_course (course_id)
);

-- 实验表
CREATE TABLE experiments (
    experiment_id INT AUTO_INCREMENT PRIMARY KEY,
    experiment_name VARCHAR(100) NOT NULL,
    course_id INT NOT NULL,
    description TEXT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 教师实验关联表
CREATE TABLE teacher_experiments (
    teacher_id INT NOT NULL,
    experiment_id INT NOT NULL,
    PRIMARY KEY (teacher_id, experiment_id),
    FOREIGN KEY (teacher_id) REFERENCES user_roles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id) ON DELETE CASCADE
);

-- 虚拟机表
CREATE TABLE virtual_machines (
    vm_id INT AUTO_INCREMENT PRIMARY KEY,
    vm_name VARCHAR(100) NOT NULL UNIQUE,
    experiment_id INT NOT NULL,
    vm_details TEXT,
    FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id) ON DELETE CASCADE
);

-- 学生虚拟机关联表
CREATE TABLE student_virtual_machines (
    student_id INT NOT NULL,
    vm_id INT NOT NULL,
    access_start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, vm_id),
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vm_id) REFERENCES virtual_machines(vm_id) ON DELETE CASCADE
);

-- 课程表（新增封面、描述、难度级别）
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL UNIQUE,
    cover_url VARCHAR(255) COMMENT '课程封面图URL',
    description TEXT COMMENT '课程详细描述',
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 课程章节表（新增）
CREATE TABLE course_chapters (
    chapter_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    chapter_title VARCHAR(255) NOT NULL COMMENT '章节标题',
    chapter_description TEXT COMMENT '章节描述',
    video_url VARCHAR(512) NOT NULL COMMENT '教学视频URL',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '章节排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    INDEX idx_course_sort (course_id, sort_order)
) COMMENT '课程章节管理表';

-- 课程评分项表（新增）
CREATE TABLE course_assessments (
    assessment_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    assessment_name VARCHAR(100) NOT NULL COMMENT '评分项名称（如：期末考试、实验报告）',
    assessment_type ENUM('exam', 'homework', 'experiment', 'quiz') NOT NULL DEFAULT 'exam' COMMENT '评分类型',
    max_score DECIMAL(5,2) NOT NULL COMMENT '满分分值',
    weight DECIMAL(5,2) NOT NULL DEFAULT 100 COMMENT '权重比例（百分比）',
    assessment_date DATE COMMENT '考核日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    INDEX idx_course_assessment (course_id, assessment_type)
) COMMENT '课程考核标准定义表';

-- 学生成绩表（新增）
CREATE TABLE student_grades (
    grade_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    assessment_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL COMMENT '实际得分',
    graded_by INT COMMENT '评分教师',
    grade_comment TEXT COMMENT '评分备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES course_assessments(assessment_id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CHECK (score >= 0),
    INDEX idx_student_grades (student_id, assessment_id)
) COMMENT '学生成绩记录表';
