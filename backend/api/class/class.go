package class

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
// 班级接口
//

// CreateClass 新增班级
func CreateClass(c *gin.Context) {
	var input models.Class
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	input.CreatedAt = time.Now()
	if err := api.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, input)
}

// GetClasses 获取班级列表
func GetClasses(c *gin.Context) {
	userID := c.GetInt("userID")
	userRole := c.GetString("userRole")

	var classes []models.Class
	query := api.DB.Preload("HeadTeacher")

	// 学生只能查看自己所在的班级
	if userRole == "student" {
		query.Joins("JOIN student_classes ON student_classes.class_id = classes.class_id").
			Where("student_classes.student_id = ?", userID)
	}

	if err := query.Find(&classes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取班级列表失败"})
		return
	}

	c.JSON(http.StatusOK, classes)
}

// GetClassStudents 获取班级学生列表
func GetClassStudents(c *gin.Context) {
	classID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的班级ID"})
		return
	}

	// 验证班级存在性
	if err := api.DB.First(&models.Class{}, classID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "班级不存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "数据库错误"})
		return
	}

	// 查询班级学生
	var studentClasses []models.StudentClass
	err = api.DB.Preload("Student.Role").
		Preload("Student.Profile").
		Preload("Student.StudentInfo").
		Where("class_id = ?", classID).
		Find(&studentClasses).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取学生列表失败"})
		return
	}

	// 提取用户数据并转换时间格式
	students := make([]models.User, 0, len(studentClasses))
	for _, sc := range studentClasses {
		user := sc.Student
		// 将时间格式化为ISO8601字符串
		students = append(students, user)
	}

	c.JSON(http.StatusOK, students)
}

// GetClass 根据 ID 获取单个班级信息
func GetClass(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var class models.Class
	if err := api.DB.Preload("HeadTeacher").Where("class_id = ?", id).First(&class).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}
	c.JSON(http.StatusOK, class)
}

// UpdateClass 更新班级信息
func UpdateClass(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var class models.Class
	if err := api.DB.Where("class_id = ?", id).First(&class).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}
	if err := c.ShouldBindJSON(&class); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := api.DB.Save(&class).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, class)
}

// DeleteClass 删除班级
func DeleteClass(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := api.DB.Delete(&models.Class{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Class deleted"})
}

func AddStudentToClass(c *gin.Context) {
	// 获取路径参数
	classID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的班级ID"})
		return
	}

	// 绑定学生数据
	var student models.User
	if err := c.ShouldBindJSON(&student); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := api.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 验证班级存在
	var class models.Class
	if err := tx.First(&class, classID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "班级不存在"})
		return
	}

	// 验证学生存在且角色正确
	var user models.User
	if err := tx.Preload("Role").
		Where("user_id = ?", student.UserID).
		First(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "学生不存在"})
		return
	}

	if user.Role.Role != "student" {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "该用户不是学生"})
		return
	}

	// 检查是否已存在关联
	var exist models.StudentClass
	if err := tx.Where("student_id = ? AND class_id = ?", student.UserID, classID).
		First(&exist).Error; err == nil {
		tx.Rollback()
		c.JSON(http.StatusConflict, gin.H{"error": "学生已在班级中"})
		return
	}

	// 创建关联记录
	studentClass := models.StudentClass{
		StudentID:      student.UserID,
		ClassID:        classID,
		EnrollmentTime: time.Now(),
	}

	if err := tx.Create(&studentClass).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "添加学生失败"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusCreated, studentClass)
}
