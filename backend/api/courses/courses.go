package courses

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/MeteorsLiu/virtuallabs/backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

//
// 课程接口
//
// 课程相关接口
//

type CourseCreateRequest struct {
	CourseName      string `json:"courseName" binding:"required,min=3,max=100"`
	CoverURL        string `json:"coverUrl" binding:"omitempty,url"`
	Description     string `json:"description"`
	DifficultyLevel string `json:"difficultyLevel" binding:"oneof=beginner intermediate advanced"`
}

// 创建课程（教师权限）
func CreateCourse(c *gin.Context) {
	teacherID := c.GetInt("userID")
	var req CourseCreateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := api.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	course := models.Course{
		CourseName:      req.CourseName,
		CoverURL:        req.CoverURL,
		Description:     req.Description,
		DifficultyLevel: req.DifficultyLevel,
	}

	if err := tx.Create(&course).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, gin.H{"error": "课程名称已存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建课程失败"})
		return
	}

	// 关联教师和课程
	if err := tx.Create(&models.TeacherCourse{
		TeacherID: teacherID,
		CourseID:  course.CourseID,
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "关联教师失败"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusCreated, course)
}

// 获取课程列表
func GetCourses(c *gin.Context) {
	var courses []models.Course
	query := api.DB.Preload("CourseChapters", func(db *gorm.DB) *gorm.DB {
		return api.DB.Order("sort_order ASC")
	}).Preload("CourseAssessments")

	if err := query.Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取课程失败"})
		return
	}

	c.JSON(http.StatusOK, courses)
}

// 获取课程详情
func GetCourseDetail(c *gin.Context) {
	courseID, _ := strconv.Atoi(c.Param("courseId"))

	var course models.Course
	if err := api.DB.Preload("CourseChapters", func(db *gorm.DB) *gorm.DB {
		return api.DB.Order("sort_order ASC")
	}).Preload("CourseAssessments").
		First(&course, courseID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "课程不存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取课程失败"})
		return
	}

	c.JSON(http.StatusOK, course)
}

// 更新课程（教师权限）
func UpdateCourse(c *gin.Context) {
	teacherID := c.GetInt("userID")
	courseID, _ := strconv.Atoi(c.Param("courseId"))

	// 验证教师课程权限
	if !isCourseTeacher(teacherID, courseID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "无操作权限"})
		return
	}

	var req CourseCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var course models.Course
	if err := api.DB.First(&course, courseID).Error; err != nil {
		handleCourseError(c, err)
		return
	}

	updates := map[string]interface{}{
		"course_name":      req.CourseName,
		"cover_url":        req.CoverURL,
		"description":      req.Description,
		"difficulty_level": req.DifficultyLevel,
	}

	if err := api.DB.Model(&course).Updates(updates).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, gin.H{"error": "课程名称已存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, course)
}

// 删除课程（教师权限）
func DeleteCourse(c *gin.Context) {
	teacherID := c.GetInt("userID")
	courseID, _ := strconv.Atoi(c.Param("courseId"))

	if !isCourseTeacher(teacherID, courseID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "无操作权限"})
		return
	}

	if err := api.DB.Delete(&models.Course{}, courseID).Error; err != nil {
		handleCourseError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "课程已删除"})
}

// 章节管理
type ChapterRequest struct {
	ChapterTitle       string `json:"chapterTitle" binding:"required,min=3,max=255"`
	ChapterDescription string `json:"chapterDescription" binding:"max=1000"`
	VideoURL           string `json:"videoUrl"`
	SortOrder          int    `json:"sortOrder" binding:"min=0"`
}

// 创建章节（教师权限）
func CreateChapter(c *gin.Context) {
	teacherID := c.GetInt("userID")
	courseID, _ := strconv.Atoi(c.Param("courseId"))

	if !isCourseTeacher(teacherID, courseID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "无操作权限"})
		return
	}

	var req ChapterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	chapter := models.CourseChapter{
		CourseID:           courseID,
		ChapterTitle:       req.ChapterTitle,
		ChapterDescription: req.ChapterDescription,
		VideoURL:           req.VideoURL,
		SortOrder:          req.SortOrder,
	}

	if err := api.DB.Create(&chapter).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建章节失败"})
		return
	}

	c.JSON(http.StatusCreated, chapter)
}

// 评分项管理
type AssessmentRequest struct {
	AssessmentName string  `json:"assessmentName" binding:"required,min=3,max=100"`
	AssessmentType string  `json:"assessmentType" binding:"oneof=exam homework experiment quiz"`
	MaxScore       float64 `json:"maxScore" binding:"required,min=0,max=1000"`
	Weight         float64 `json:"weight" binding:"min=0,max=100"`
	AssessmentDate string  `json:"assessmentDate" binding:"required"`
}

// 创建评分项（教师权限）
func CreateAssessment(c *gin.Context) {
	teacherID := c.GetInt("userID")
	courseID, _ := strconv.Atoi(c.Param("courseId"))

	if !isCourseTeacher(teacherID, courseID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "无操作权限"})
		return
	}

	var req AssessmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parsedTime, _ := api.ToTime(req.AssessmentDate)
	assessment := models.CourseAssessment{
		CourseID:       courseID,
		AssessmentName: req.AssessmentName,
		AssessmentType: req.AssessmentType,
		MaxScore:       req.MaxScore,
		Weight:         req.Weight,
		AssessmentDate: parsedTime,
	}

	if err := api.DB.Create(&assessment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建评分项失败"})
		return
	}

	c.JSON(http.StatusCreated, assessment)
}

// 提交答案并自动计算成绩
func SubmitAnswer(c *gin.Context) {
	studentID := c.GetInt("userID")
	assessmentID, _ := strconv.Atoi(c.Param("assessmentId"))

	var req struct {
		QuestionID int   `json:"questionId" binding:"required"`
		OptionIDs  []int `json:"optionIds" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证题目属于当前assessment
	var question models.Question
	if err := api.DB.First(&question, req.QuestionID).Error; err != nil || question.AssessmentID != assessmentID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效题目或评分项"})
		return
	}

	tx := api.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 保存答题记录
	answer := models.StudentAnswer{
		StudentID:  studentID,
		QuestionID: req.QuestionID,
	}

	if err := tx.Create(&answer).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存答案失败"})
		return
	}

	// 保存选中选项
	for _, optID := range req.OptionIDs {
		if err := tx.Create(&models.StudentAnswerOption{
			AnswerID: answer.AnswerID,
			OptionID: optID,
		}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "保存选项失败"})
			return
		}
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "提交事务失败"})
		return
	}

	// 异步触发分数计算
	go func() {
		calculateAndSaveGrade(studentID, assessmentID)
	}()

	c.JSON(http.StatusCreated, answer)
}

// 计算并保存成绩
func calculateAndSaveGrade(studentID, assessmentID int) {
	var assessment models.CourseAssessment
	if err := api.DB.First(&assessment, assessmentID).Error; err != nil {
		return
	}

	// 获取所有题目
	var questions []models.Question
	if err := api.DB.Where("assessment_id = ?", assessmentID).Find(&questions).Error; err != nil || len(questions) == 0 {
		return
	}

	// 计算得分
	correctCount := 0
	for _, q := range questions {
		var answer models.StudentAnswer
		if err := api.DB.Preload("Selections").
			Where("student_id = ? AND question_id = ?", studentID, q.QuestionID).
			First(&answer).Error; err != nil {
			continue
		}

		// 获取正确答案
		var correctOptions []int
		api.DB.Model(&models.QuestionOption{}).
			Where("question_id = ? AND is_correct = true", q.QuestionID).
			Pluck("option_id", &correctOptions)

		// 获取学生选择
		var selectedOptions []int
		for _, sel := range answer.Selections {
			selectedOptions = append(selectedOptions, sel.OptionID)
		}

		// 判断正确性
		if isAnswerCorrect(q.QuestionType, selectedOptions, correctOptions) {
			correctCount++
		}
	}

	// 计算最终分数
	score := (float64(correctCount) / float64(len(questions))) * assessment.MaxScore

	// 更新或创建成绩记录
	grade := models.StudentGrade{
		StudentID:    studentID,
		AssessmentID: assessmentID,
		Score:        score,
		GradedBy:     nil, // 标记为自动评分
	}

	api.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "student_id"}, {Name: "assessment_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"score", "updated_at"}),
	}).Create(&grade)
}

// 判断答案正确性
func isAnswerCorrect(questionType string, selected, correct []int) bool {
	selectedSet := make(map[int]bool)
	for _, s := range selected {
		selectedSet[s] = true
	}

	correctSet := make(map[int]bool)
	for _, c := range correct {
		correctSet[c] = true
	}

	if questionType == "single" {
		return len(selected) == 1 && len(correct) == 1 && selected[0] == correct[0]
	}

	// 多选题必须完全匹配
	if len(selectedSet) != len(correctSet) {
		return false
	}
	for k := range correctSet {
		if !selectedSet[k] {
			return false
		}
	}
	return true
}

// 获取课程章节列表
func GetChapters(c *gin.Context) {
	courseID, err := strconv.Atoi(c.Param("courseId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的课程ID"})
		return
	}

	// 验证课程是否存在
	var course models.Course
	if err := api.DB.First(&course, courseID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "课程不存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询课程失败"})
		return
	}

	var chapters []models.CourseChapter
	if err := api.DB.Where("course_id = ?", courseID).
		Order("sort_order ASC").
		Find(&chapters).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取章节失败"})
		return
	}

	c.JSON(http.StatusOK, chapters)
}

// 创建题目请求结构
type CreateQuestionRequest struct {
	CourseID     int                 `json:"courseId" binding:"required"`
	ChapterID    *int                `json:"chapterId,omitempty"` // 可选章节
	QuestionType string              `json:"questionType" binding:"required,oneof=single multiple"`
	Content      string              `json:"content" binding:"required,min=5,max=1000"`
	Explanation  string              `json:"explanation,omitempty" binding:"max=2000"`
	Options      []QuestionOptionReq `json:"options" binding:"required,min=2,max=6,dive"`
	AssessmentID int                 `json:"assessmentId" binding:"required"` // 关联评分项
}

// 题目选项请求结构
type QuestionOptionReq struct {
	Content   string `json:"content" binding:"required,max=500"`
	IsCorrect bool   `json:"isCorrect"`
	SortOrder int    `json:"sortOrder" binding:"min=0"`
}

// 创建题目（教师权限）
func CreateQuestion(c *gin.Context) {
	teacherID := c.GetInt("userID")
	var req CreateQuestionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证教师课程权限
	if !isCourseTeacher(teacherID, req.CourseID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "无课程操作权限"})
		return
	}

	// 验证评分项属于课程
	var assessment models.CourseAssessment
	if err := api.DB.First(&assessment, req.AssessmentID).Error; err != nil || assessment.CourseID != req.CourseID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的评分项"})
		return
	}

	// 校验选项正确性
	if err := validateQuestionOptions(req.QuestionType, req.Options); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := api.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 创建题目
	question := models.Question{
		CourseID:     req.CourseID,
		ChapterID:    req.ChapterID,
		QuestionType: req.QuestionType,
		Content:      req.Content,
		Explanation:  req.Explanation,
		AssessmentID: req.AssessmentID,
	}

	if err := tx.Create(&question).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建题目失败"})
		return
	}

	// 创建选项
	for _, optReq := range req.Options {
		option := models.QuestionOption{
			QuestionID: question.QuestionID,
			Content:    optReq.Content,
			IsCorrect:  optReq.IsCorrect,
			SortOrder:  optReq.SortOrder,
		}
		if err := tx.Create(&option).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "创建选项失败"})
			return
		}
	}

	tx.Commit()

	// 重新加载关联数据
	api.DB.Preload("Options").First(&question, question.QuestionID)

	c.JSON(http.StatusCreated, question)
}

func GetCourseAssessments(c *gin.Context) {
	// 参数解析
	courseID, _ := strconv.Atoi(c.Query("courseId"))

	// 构建查询
	query := api.DB
	if courseID > 0 {
		query = query.Where("course_id = ?", courseID)
	}

	// 获取评分项
	var assessments []models.CourseAssessment
	if err := query.Order("assessment_date ASC").Find(&assessments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取评分项失败"})
		return
	}

	c.JSON(http.StatusOK, assessments)
}

func GetAssessmentQuestions(c *gin.Context) {
	// 获取当前用户信息
	currentUserID := c.GetInt("userID")
	userRole := c.GetString("role")

	// 解析参数
	assessmentID, err := strconv.Atoi(c.Param("assessmentId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的评分项ID"})
		return
	}

	// 验证评分项存在性
	var assessment models.CourseAssessment
	if err := api.DB.Preload("Course").
		First(&assessment, assessmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "评分项不存在"})
		return
	}

	// 权限验证
	if userRole == "student" {
		// 验证学生是否属于该课程
		var enrollment models.Enrollment
		if err := api.DB.Where("student_id = ? AND course_id = ?",
			currentUserID, assessment.CourseID).First(&enrollment).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "无课程访问权限"})
			return
		}
	} else if userRole == "teacher" {
		// 验证教师是否负责该课程
		if !isCourseTeacher(currentUserID, assessment.CourseID) {
			c.JSON(http.StatusForbidden, gin.H{"error": "无课程操作权限"})
			return
		}
	}

	// 获取题目列表
	var questions []models.Question
	if err := api.DB.Preload("Options").
		Where("assessment_id = ?", assessmentID).
		Order("question_id ASC"). // 按创建顺序排序
		Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取题目失败"})
		return
	}

	// 学生访问时隐藏正确答案
	if userRole == "student" {
		for i := range questions {
			for j := range questions[i].Options {
				questions[i].Options[j].IsCorrect = false // 清空正确答案标记
			}
		}
	}

	c.JSON(http.StatusOK, questions)
}

// 校验题目选项逻辑
func validateQuestionOptions(qType string, options []QuestionOptionReq) error {
	// 检查至少有一个正确选项
	correctCount := 0
	for _, opt := range options {
		if opt.IsCorrect {
			correctCount++
		}
	}

	if correctCount == 0 {
		return errors.New("至少需要一个正确选项")
	}

	// 单选题校验
	if qType == "single" && correctCount > 1 {
		return errors.New("单选题只能有一个正确选项")
	}

	// 多选题校验
	if qType == "multiple" && correctCount < 2 {
		return errors.New("多选题需要至少两个正确选项")
	}

	return nil
}

func isCourseTeacher(teacherID, courseID int) bool {
	var count int64
	api.DB.Model(&models.TeacherCourse{}).
		Where("teacher_id = ? AND course_id = ?", teacherID, courseID).
		Count(&count)
	return count > 0
}

func handleCourseError(c *gin.Context, err error) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "课程不存在"})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "数据库操作失败"})
	}
}

func handleNotFound(c *gin.Context, resource string) {
	c.JSON(http.StatusNotFound, gin.H{"error": resource + "不存在"})
}

// 新增处理函数
func EnrollCourse(c *gin.Context) {
	studentID := c.GetInt("userID")
	courseID, _ := strconv.Atoi(c.Param("courseId"))

	// 1. 检查用户是否存在
	var user models.User
	if err := api.DB.First(&user, studentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 2. 检查课程是否存在
	var course models.Course
	if err := api.DB.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	var enrollment models.Enrollment
	if err := api.DB.Where("student_id = ? AND course_id = ?", studentID, courseID).First(&enrollment).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Already enrolled in this course"})
		return
	}

	newEnrollment := models.Enrollment{
		StudentID:      studentID,
		CourseID:       courseID,
		EnrollmentTime: time.Now(),
	}

	if err := api.DB.Create(&newEnrollment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enroll"})
		return
	}

	c.JSON(http.StatusCreated, newEnrollment)
}

func UnenrollCourse(c *gin.Context) {
	studentID := c.GetInt("userID")
	courseID := c.Param("courseId")

	result := api.DB.Where("student_id = ? AND course_id = ?", studentID, courseID).Delete(&models.Enrollment{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Enrollment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    http.StatusOK,
		"message": "Unenrollment successful",
	})
}

func GetStudentEnrollments(c *gin.Context) {
	studentID := c.GetInt("userID")

	var enrollments []models.Enrollment
	if err := api.DB.Preload("Course").Where("student_id = ?", studentID).Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get enrollments"})
		return
	}

	c.JSON(http.StatusOK, enrollments)
}
