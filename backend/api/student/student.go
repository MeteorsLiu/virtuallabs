package student

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/MeteorsLiu/virtuallabs/backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

//
// 学生接口 (User + models.StudentInformation)
//

// CreateStudent 创建学生账号（管理员权限）
func CreateStudent(c *gin.Context) {
	var input struct {
		Username      string `json:"username" binding:"required,min=3,max=50"`
		Password      string `json:"password" binding:"required,min=8"`
		Gender        string `json:"gender" binding:"omitempty,oneof=male female other"`
		Email         string `json:"email" binding:"omitempty,email"`
		Phone         string `json:"phone" binding:"omitempty,numeric"`
		StudentNumber string `json:"studentNumber" binding:"required,min=5"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 开启事务
	tx := api.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	hashedPassword, err := api.HashPassword(input.Password)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "密码处理失败"})
		return
	}

	// 创建基础用户
	user := models.User{
		Username:     input.Username,
		PasswordHash: hashedPassword,
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		handleUserError(c, err)
		return
	}

	// 添加学生角色
	if err := tx.Create(&models.UserRole{
		UserID: user.UserID,
		Role:   "student",
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建角色失败"})
		return
	}

	// 添加用户资料
	if err := tx.Create(&models.UserProfile{
		UserID: user.UserID,
		Gender: input.Gender,
		Email:  input.Email,
		Phone:  input.Phone,
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建用户资料失败"})
		return
	}

	// 添加学生信息
	if err := tx.Create(&models.StudentInformation{
		UserID:        user.UserID,
		StudentNumber: input.StudentNumber,
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusConflict, gin.H{"error": "学号已存在"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusCreated, user)
}

// GetStudents 获取学生列表（教师/管理员权限）
func GetStudents(c *gin.Context) {
	var students []models.User
	query := api.DB.Preload("Role").
		Preload("Profile").
		Preload("StudentInfo").
		Preload("StudentClasses.Class").
		Joins("JOIN user_roles ON users.user_id = user_roles.user_id").
		Where("user_roles.role = 'student'")

	// 班级过滤
	if classID := c.Query("classId"); classID != "" {
		query.Joins("JOIN student_classes ON users.user_id = student_classes.student_id").
			Where("student_classes.class_id = ?", classID)
	}

	if err := query.Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取学生列表失败"})
		return
	}

	c.JSON(http.StatusOK, students)
}

// GetStudentDetails 获取学生详细信息
func GetStudentDetails(c *gin.Context) {
	studentID, _ := strconv.Atoi(c.Param("id"))

	var student models.User
	if err := api.DB.Preload("Role").
		Preload("Profile").
		Preload("StudentInfo").
		Preload("StudentClasses.Class").
		Joins("JOIN user_roles ON users.user_id = user_roles.user_id").
		Where("users.user_id = ? AND user_roles.role = 'student'", studentID).
		First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "学生不存在"})
		return
	}

	c.JSON(http.StatusOK, student)
}

// UpdateStudent 更新学生信息（学生自己或管理员）
func UpdateStudent(c *gin.Context) {
	studentID, _ := strconv.Atoi(c.Param("id"))
	currentUserID := c.GetInt("userID")
	currentRole := c.GetString("role")

	// 权限验证：学生只能修改自己，管理员/教师可以修改所有
	if currentRole == "student" && currentUserID != studentID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无操作权限"})
		return
	}

	var input struct {
		Username      string `json:"username" binding:"omitempty,min=3,max=50"`
		Password      string `json:"password" binding:"omitempty,min=8"`
		Gender        string `json:"gender" binding:"omitempty,oneof=male female other"`
		Email         string `json:"email" binding:"omitempty,email"`
		Phone         string `json:"phone" binding:"omitempty,numeric"`
		StudentNumber string `json:"studentNumber" binding:"omitempty,min=5"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := api.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 更新基础信息
	updates := make(map[string]interface{})
	if input.Username != "" {
		updates["username"] = input.Username
	}
	if input.Password != "" {
		hashedPassword, err := api.HashPassword(input.Password)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "密码处理失败"})
			return
		}
		updates["password_hash"] = hashedPassword
	}
	if len(updates) > 0 {
		if err := tx.Model(&models.User{}).Where("user_id = ?", studentID).Updates(updates).Error; err != nil {
			tx.Rollback()
			handleUserError(c, err)
			return
		}
	}

	// 更新用户资料
	if input.Gender != "" || input.Email != "" || input.Phone != "" {
		profileUpdates := map[string]interface{}{
			"gender": input.Gender,
			"email":  input.Email,
			"phone":  input.Phone,
		}
		if err := tx.Model(&models.UserProfile{}).Where("user_id = ?", studentID).Updates(profileUpdates).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "更新资料失败"})
			return
		}
	}

	// 更新学号
	if input.StudentNumber != "" {
		if err := tx.Model(&models.StudentInformation{}).Where("user_id = ?", studentID).
			Update("student_number", input.StudentNumber).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{"error": "学号已存在"})
			return
		}
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "更新成功"})
}

// DeleteStudent 删除学生（管理员权限）
func DeleteStudent(c *gin.Context) {
	studentID, _ := strconv.Atoi(c.Param("id"))

	// 级联删除所有关联数据
	if err := api.DB.Transaction(func(tx *gorm.DB) error {
		// 删除班级关联
		if err := tx.Where("student_id = ?", studentID).Delete(&models.StudentClass{}).Error; err != nil {
			return err
		}

		// 删除学生信息
		if err := tx.Where("user_id = ?", studentID).Delete(&models.StudentInformation{}).Error; err != nil {
			return err
		}

		// 删除用户资料
		if err := tx.Where("user_id = ?", studentID).Delete(&models.UserProfile{}).Error; err != nil {
			return err
		}

		// 删除用户角色
		if err := tx.Where("user_id = ?", studentID).Delete(&models.UserRole{}).Error; err != nil {
			return err
		}

		// 删除基础用户
		return tx.Delete(&models.User{}, studentID).Error
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// 辅助函数
func handleUserError(c *gin.Context, err error) {
	if errors.Is(err, gorm.ErrDuplicatedKey) {
		c.JSON(http.StatusConflict, gin.H{"error": "用户名已存在"})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "数据库操作失败"})
	}
}
