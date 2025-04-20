package models

import (
	"time"
)

type User struct {
	UserID       int       `gorm:"primaryKey;autoIncrement" json:"userId"`
	Username     string    `gorm:"unique;not null;size:50" json:"username"`
	PasswordHash string    `gorm:"not null;size:100;comment:存储密码哈希值" json:"-"`
	CreatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"createdAt"`

	// 关联关系
	Role        UserRole           `gorm:"foreignKey:UserID" json:"role"`
	Profile     UserProfile        `gorm:"foreignKey:UserID" json:"profile"`
	StudentInfo StudentInformation `gorm:"foreignKey:UserID" json:"studentInfo,omitempty"`
}

type UserRole struct {
	UserID int    `gorm:"primaryKey" json:"userId"`
	Role   string `gorm:"type:ENUM('student', 'teacher');not null" json:"role"`
}

type UserProfile struct {
	UserID int    `gorm:"primaryKey" json:"userId"`
	Gender string `gorm:"type:ENUM('male', 'female', 'other')" json:"gender"`
	Email  string `gorm:"size:255" json:"email"`
	Phone  string `gorm:"size:20" json:"phone"`
}

type StudentInformation struct {
	UserID        int    `gorm:"primaryKey" json:"userId"`
	StudentNumber string `gorm:"unique;size:20" json:"studentNumber"`
}

type Class struct {
	ClassID       int       `gorm:"primaryKey;autoIncrement" json:"classId"`
	ClassName     string    `gorm:"unique;not null;size:50" json:"className"`
	HeadTeacherID *int      `json:"headTeacherId"`
	CreatedAt     time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"createdAt"`

	HeadTeacher *User `gorm:"foreignKey:HeadTeacherID;constraint:OnDelete:SET NULL"`
}

type StudentClass struct {
	StudentID      int       `gorm:"primaryKey" json:"studentId"`
	ClassID        int       `gorm:"primaryKey" json:"classId"`
	EnrollmentTime time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"enrollmentTime"`

	Student User  `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student"`
	Class   Class `gorm:"foreignKey:ClassID;constraint:OnDelete:CASCADE" json:"class"`
}

type TeacherClass struct {
	TeacherID int `gorm:"primaryKey" json:"teacherId"`
	ClassID   int `gorm:"primaryKey" json:"classId"`

	Teacher User  `gorm:"foreignKey:TeacherID;constraint:OnDelete:CASCADE" json:"teacher"`
	Class   Class `gorm:"foreignKey:ClassID;constraint:OnDelete:CASCADE" json:"class"`
}

type Course struct {
	CourseID        int       `gorm:"primaryKey;autoIncrement" json:"courseId"`
	CourseName      string    `gorm:"unique;not null;size:100" json:"courseName"`
	CoverURL        string    `gorm:"size:255" json:"coverUrl"`
	Description     string    `gorm:"type:TEXT" json:"description"`
	DifficultyLevel string    `gorm:"type:ENUM('beginner', 'intermediate', 'advanced');default:'beginner'" json:"difficultyLevel"`
	CreatedAt       time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"createdAt"`

	CourseChapters    []CourseChapter    `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"chapters,omitempty"`
	CourseAssessments []CourseAssessment `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"assessments,omitempty"`
}

type CourseChapter struct {
	ChapterID          int       `gorm:"primaryKey;autoIncrement" json:"chapterId"`
	CourseID           int       `json:"courseId"`
	ChapterTitle       string    `gorm:"not null;size:255" json:"chapterTitle"`
	ChapterDescription string    `gorm:"type:TEXT" json:"chapterDescription"`
	VideoURL           string    `json:"videoUrl,omitempty" binding:"omitempty,url"`
	SortOrder          int       `gorm:"default:0" json:"sortOrder"`
	CreatedAt          time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"createdAt"`

	Course Course `gorm:"foreignKey:CourseID;references:CourseID;-:migration" json:"course"`
}

type CourseAssessment struct {
	AssessmentID   int       `gorm:"primaryKey;autoIncrement" json:"assessmentId"`
	CourseID       int       `json:"courseId"`
	AssessmentName string    `gorm:"not null;size:100" json:"assessmentName"`
	AssessmentType string    `gorm:"type:ENUM('exam', 'homework', 'experiment', 'quiz');default:'exam'" json:"assessmentType"`
	MaxScore       float64   `gorm:"type:decimal(5,2);not null" json:"maxScore"`
	Weight         float64   `gorm:"type:decimal(5,2);default:100" json:"weight"`
	AssessmentDate time.Time `json:"assessmentDate"`
	CreatedAt      time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"createdAt"`

	Course Course `gorm:"foreignKey:CourseID;references:CourseID;-:migration" json:"course"`
}

type StudentGrade struct {
	GradeID      int       `gorm:"primaryKey;autoIncrement" json:"gradeId"`
	StudentID    int       `json:"studentId"`
	AssessmentID int       `json:"assessmentId"`
	Score        float64   `gorm:"type:decimal(5,2);not null" json:"score"`
	GradedBy     *int      `json:"gradedBy,omitempty"`
	GradeComment string    `gorm:"type:TEXT" json:"gradeComment"`
	CreatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"updatedAt"`

	Student    User             `gorm:"foreignKey:StudentID" json:"student"`
	Assessment CourseAssessment `gorm:"foreignKey:AssessmentID;references:AssessmentID;-:migration"`
	Grader     *User            `gorm:"foreignKey:GradedBy" json:"grader,omitempty"`
}

type TeacherCourse struct {
	TeacherID int `gorm:"primaryKey" json:"teacherId"`
	CourseID  int `gorm:"primaryKey" json:"courseId"`

	Teacher User   `gorm:"foreignKey:TeacherID;constraint:OnDelete:CASCADE" json:"teacher"`
	Course  Course `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"course"`
}

type Enrollment struct {
	StudentID      int       `gorm:"primaryKey" json:"studentId"`
	CourseID       int       `gorm:"primaryKey" json:"courseId"`
	EnrollmentTime time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"enrollmentTime"`

	Student User   `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student"`
	Course  Course `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"course"`
}

type Experiment struct {
	ExperimentID   int       `gorm:"primaryKey;autoIncrement" json:"experimentId"`
	ExperimentName string    `gorm:"not null;size:100" json:"experimentName"`
	CourseID       int       `gorm:"not null" json:"courseId"`
	Description    string    `gorm:"type:TEXT" json:"description"`
	CreatedAt      time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"createdAt"`

	Course Course `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE;-:migration"`
}

type TeacherExperiment struct {
	TeacherID    int `gorm:"primaryKey" json:"teacherId"`
	ExperimentID int `gorm:"primaryKey" json:"experimentId"`

	Teacher    User       `gorm:"foreignKey:TeacherID;constraint:OnDelete:CASCADE;-:migration" json:"teacher"`
	Experiment Experiment `gorm:"foreignKey:ExperimentID;constraint:OnDelete:CASCADE;-:migration" json:"experiment"`
}

type VirtualMachine struct {
	VMID         int       `gorm:"primaryKey;autoIncrement" json:"vmId"`
	VMName       string    `gorm:"unique;not null;size:100" json:"vmName"`
	ExperimentID int       `gorm:"not null" json:"experimentId"`
	VMDetails    string    `gorm:"type:TEXT" json:"vmDetails"`
	CreatorID    int       `gorm:"not null" json:"-"` // 添加创建者ID
	Status       string    `gorm:"type:ENUM('pending', 'creating', 'running', 'stopped', 'error');default:'pending'" json:"status"`
	StatusMsg    string    `gorm:"size:255" json:"statusMsg"`
	LastUpdated  time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"lastUpdated"`

	Experiment Experiment `gorm:"foreignKey:ExperimentID;constraint:OnDelete:CASCADE;-:migration" json:"experiment"`
}

type StudentVirtualMachine struct {
	StudentID       int       `gorm:"primaryKey" json:"studentId"`
	VMID            int       `gorm:"primaryKey" json:"vmId"`
	AccessStartTime time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"accessStartTime"`

	Student        User           `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE;-:migration" json:"student"`
	VirtualMachine VirtualMachine `gorm:"foreignKey:VMID;constraint:OnDelete:CASCADE;-:migration" json:"virtualMachine"`
}

type Question struct {
	QuestionID   int       `gorm:"primaryKey;autoIncrement" json:"questionId"`
	CourseID     int       `json:"courseId"` // 所属课程
	QuestionType string    `gorm:"type:ENUM('single','multiple');not null" json:"questionType"`
	Content      string    `gorm:"type:TEXT;not null" json:"content"`      // 题目内容
	Explanation  string    `gorm:"type:TEXT" json:"explanation,omitempty"` // 解析
	CreatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"createdAt"`
	AssessmentID int       `json:"assessmentId"` // 新增字段，关联评分项

	// 关联关系
	Course    Course           `gorm:"foreignKey:CourseID;-:migration" json:"course,omitempty"`
	ChapterID *int             `gorm:"column:chapter_id;default:null" json:"chapterId,omitempty"`
	Chapter   CourseChapter    `gorm:"foreignKey:ChapterID;references:ChapterID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;-:migration" json:"chapter,omitempty"`
	Options   []QuestionOption `gorm:"foreignKey:QuestionID" json:"options,omitempty"` // 题目选项
}

type QuestionOption struct {
	OptionID   int    `gorm:"primaryKey;autoIncrement" json:"optionId"`
	QuestionID int    `json:"questionId"`                        // 所属题目
	Content    string `gorm:"type:TEXT;not null" json:"content"` // 选项内容
	IsCorrect  bool   `gorm:"default:false" json:"isCorrect"`    // 是否正确答案
	SortOrder  int    `gorm:"default:0" json:"sortOrder"`        // 选项排序

	Question Question `gorm:"foreignKey:QuestionID;-:migration" json:"-"` // 反向关联
}

type StudentAnswer struct {
	AnswerID   int       `gorm:"primaryKey;autoIncrement" json:"answerId"`
	StudentID  int       `json:"studentId"`  // 答题学生
	QuestionID int       `json:"questionId"` // 对应题目
	AnswerTime time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;not null" json:"answerTime"`

	// 关联关系
	Student    User                  `gorm:"foreignKey:StudentID" json:"student"`
	Question   Question              `gorm:"foreignKey:QuestionID;-:migration" json:"question"`
	Selections []StudentAnswerOption `gorm:"foreignKey:AnswerID" json:"selections,omitempty"` // 选中选项
}

type StudentAnswerOption struct {
	AnswerOptionID int `gorm:"primaryKey;autoIncrement" json:"answerOptionId"`
	AnswerID       int `json:"answerId"` // 所属答题记录
	OptionID       int `json:"optionId"` // 被选选项

	// 关联关系
	Answer StudentAnswer  `gorm:"foreignKey:AnswerID;-:migration" json:"-"`
	Option QuestionOption `gorm:"foreignKey:OptionID;-:migration" json:"option"`
}
