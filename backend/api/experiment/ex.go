package experiment

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/MeteorsLiu/virtuallabs/backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

//
// 实验接口
//

// CreateExperiment 创建实验（仅限教师）
func CreateExperiment(c *gin.Context) {
	// 获取用户身份
	userID := c.GetInt("userID")
	userRole := c.GetString("userRole")

	// 权限验证
	if userRole != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{"error": "仅限教师创建实验"})
		return
	}

	// 绑定输入数据
	var input struct {
		ExperimentName string `json:"experimentName" binding:"required,min=2,max=100"`
		CourseID       int    `json:"courseId" binding:"required"`
		Description    string `json:"description" binding:"max=500"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证课程有效性
	var course models.Course
	if err := api.DB.First(&course, input.CourseID).Error; err != nil {
		handleCourseError(c, err)
		return
	}

	// 验证教师课程权限
	if !isCourseTeacher(userID, input.CourseID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "未授权访问该课程"})
		return
	}

	// 创建实验记录
	experiment := models.Experiment{
		ExperimentName: input.ExperimentName,
		CourseID:       input.CourseID,
		Description:    input.Description,
		CreatedAt:      time.Now(),
	}

	tx := api.DB.Begin()
	if err := tx.Create(&experiment).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "实验创建失败"})
		return
	}

	// 创建教师-实验关联
	teacherExp := models.TeacherExperiment{
		TeacherID:    userID,
		ExperimentID: experiment.ExperimentID,
	}

	if err := tx.Create(&teacherExp).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "教师关联失败"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusCreated, experiment)
}

// GetExperiments 获取实验列表（带权限过滤）
func GetExperiments(c *gin.Context) {
	userID := c.GetInt("userID")
	userRole := c.GetString("userRole")

	query := api.DB.Preload("Course").Model(&models.Experiment{})

	switch userRole {
	case "student":
		// 获取学生已选课程的实验
		query = query.Joins("JOIN enrollments ON experiments.course_id = enrollments.course_id").
			Where("enrollments.student_id = ?", userID)
	case "teacher":
		// 获取教师负责课程的实验
		query = query.Joins("JOIN teacher_courses ON experiments.course_id = teacher_courses.course_id").
			Where("teacher_courses.teacher_id = ?", userID)
	case "admin":
		// 管理员获取全部
	default:
		c.JSON(http.StatusForbidden, gin.H{"error": "未授权访问"})
		return
	}

	var experiments []models.Experiment
	if err := query.Find(&experiments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, experiments)
}

// GetExperiment 获取实验详情
func GetExperiment(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	userID := c.GetInt("userID")
	userRole := c.GetString("userRole")

	var experiment models.Experiment
	if err := api.DB.Preload("Course").First(&experiment, id).Error; err != nil {
		handleExperimentError(c, err)
		return
	}

	// 访问权限验证
	if !hasExperimentAccess(userID, userRole, experiment.CourseID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "未授权访问该实验"})
		return
	}

	c.JSON(http.StatusOK, experiment)
}

// UpdateExperiment 更新实验信息（仅限负责教师）
func UpdateExperiment(c *gin.Context) {
	userID := c.GetInt("userID")
	userRole := c.GetString("userRole")
	id, _ := strconv.Atoi(c.Param("id"))

	// 获取现有实验
	var experiment models.Experiment
	if err := api.DB.First(&experiment, id).Error; err != nil {
		handleExperimentError(c, err)
		return
	}

	// 权限验证
	if userRole != "teacher" || !isCourseTeacher(userID, experiment.CourseID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "未授权修改该实验"})
		return
	}

	// 绑定更新数据
	var input struct {
		ExperimentName string `json:"experimentName" binding:"omitempty,min=2,max=100"`
		Description    string `json:"description" binding:"omitempty,max=500"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 应用更新
	updates := make(map[string]interface{})
	if input.ExperimentName != "" {
		updates["experiment_name"] = input.ExperimentName
	}
	if input.Description != "" {
		updates["description"] = input.Description
	}

	if err := api.DB.Model(&experiment).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, experiment)
}

// DeleteExperiment 删除实验（级联删除关联数据）
func DeleteExperiment(c *gin.Context) {
	userID := c.GetInt("userID")
	userRole := c.GetString("userRole")
	id, _ := strconv.Atoi(c.Param("id"))

	var experiment models.Experiment
	if err := api.DB.First(&experiment, id).Error; err != nil {
		handleExperimentError(c, err)
		return
	}

	// 权限验证
	if userRole != "teacher" || !isCourseTeacher(userID, experiment.CourseID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "未授权删除该实验"})
		return
	}

	tx := api.DB.Begin()

	// 删除关联的虚拟机
	if err := tx.Where("experiment_id = ?", id).Delete(&models.VirtualMachine{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除关联资源失败"})
		return
	}

	// 删除教师关联
	if err := tx.Where("experiment_id = ?", id).Delete(&models.TeacherExperiment{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除教师关联失败"})
		return
	}

	// 删除主记录
	if err := tx.Delete(&experiment).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除实验失败"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "实验删除成功"})
}

// 辅助函数
func isCourseTeacher(teacherID, courseID int) bool {
	var count int64
	api.DB.Model(&models.TeacherCourse{}).
		Where("teacher_id = ? AND course_id = ?", teacherID, courseID).
		Count(&count)
	return count > 0
}

func hasExperimentAccess(userID int, userRole string, courseID int) bool {
	switch userRole {
	case "admin":
		return true
	case "teacher":
		return isCourseTeacher(userID, courseID)
	case "student":
		var count int64
		api.DB.Model(&models.Enrollment{}).
			Where("student_id = ? AND course_id = ?", userID, courseID).
			Count(&count)
		return count > 0
	default:
		return false
	}
}

func handleCourseError(c *gin.Context, err error) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "课程不存在"})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "课程查询失败"})
	}
}

func handleExperimentError(c *gin.Context, err error) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "实验不存在"})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "实验查询失败"})
	}
}
