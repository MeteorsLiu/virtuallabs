package teacher

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
// 教师接口 (User 模块，只区分角色为 teacher)
//

// 创建教师请求结构
type CreateTeacherRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=8"`
	Gender   string `json:"gender" binding:"omitempty,oneof=male female other"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone" binding:"omitempty,numeric,len=11"`
}

// CreateTeacher 创建教师账号（管理员权限）
func CreateTeacher(c *gin.Context) {
	var req CreateTeacherRequest
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

	hashedPassword, err := api.HashPassword(req.Password)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "密码处理失败"})
		return
	}

	// 创建基础用户
	user := models.User{
		Username:     req.Username,
		PasswordHash: hashedPassword,
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		handleUserError(c, err)
		return
	}

	// 添加教师角色
	if err := tx.Create(&models.UserRole{
		UserID: user.UserID,
		Role:   "teacher",
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建角色失败"})
		return
	}

	// 添加用户资料
	if err := tx.Create(&models.UserProfile{
		UserID: user.UserID,
		Gender: req.Gender,
		Email:  req.Email,
		Phone:  req.Phone,
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建用户资料失败"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusCreated, user)
}

// GetTeachers 获取教师列表（管理员/教师权限）
func GetTeachers(c *gin.Context) {
	var teachers []models.User
	query := api.DB.Preload("Role").
		Preload("Profile").
		Joins("JOIN user_roles ON users.user_id = user_roles.user_id").
		Where("user_roles.role = 'teacher'")

	if err := query.Find(&teachers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取教师列表失败"})
		return
	}

	c.JSON(http.StatusOK, teachers)
}

// GetTeacherDetails 获取教师详细信息
func GetTeacherDetails(c *gin.Context) {
	teacherID, _ := strconv.Atoi(c.Param("id"))

	var teacher models.User
	if err := api.DB.Preload("Role").
		Preload("Profile").
		Preload("TeacherCourses.Course"). // 预加载负责的课程
		Joins("JOIN user_roles ON users.user_id = user_roles.user_id").
		Where("users.user_id = ? AND user_roles.role = 'teacher'", teacherID).
		First(&teacher).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "教师不存在"})
		return
	}

	c.JSON(http.StatusOK, teacher)
}

// UpdateTeacher 更新教师信息（管理员或教师本人）
func UpdateTeacher(c *gin.Context) {
	teacherID, _ := strconv.Atoi(c.Param("id"))
	currentUserID := c.GetInt("userID")
	currentRole := c.GetString("userRole")

	// 权限验证：教师只能修改自己，管理员可以修改所有
	if currentRole == "teacher" && currentUserID != teacherID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无操作权限"})
		return
	}

	var req struct {
		Username string `json:"username" binding:"omitempty,min=3,max=50"`
		Password string `json:"password" binding:"omitempty,min=8"`
		Gender   string `json:"gender" binding:"omitempty,oneof=male female other"`
		Email    string `json:"email" binding:"omitempty,email"`
		Phone    string `json:"phone" binding:"omitempty,numeric,len=11"`
	}

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

	// 更新基础信息
	updates := make(map[string]interface{})
	if req.Username != "" {
		updates["username"] = req.Username
	}
	if req.Password != "" {
		hashedPassword, err := api.HashPassword(req.Password)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "密码处理失败"})
			return
		}
		updates["password_hash"] = hashedPassword
	}
	if len(updates) > 0 {
		if err := tx.Model(&models.User{}).Where("user_id = ?", teacherID).Updates(updates).Error; err != nil {
			tx.Rollback()
			handleUserError(c, err)
			return
		}
	}

	// 更新用户资料
	if req.Gender != "" || req.Email != "" || req.Phone != "" {
		profileUpdates := map[string]interface{}{
			"gender": req.Gender,
			"email":  req.Email,
			"phone":  req.Phone,
		}
		if err := tx.Model(&models.UserProfile{}).Where("user_id = ?", teacherID).Updates(profileUpdates).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "更新资料失败"})
			return
		}
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "更新成功"})
}

// DeleteTeacher 删除教师（管理员权限）
func DeleteTeacher(c *gin.Context) {
	teacherID, _ := strconv.Atoi(c.Param("id"))

	if err := api.DB.Transaction(func(tx *gorm.DB) error {
		// 删除课程关联
		if err := tx.Where("teacher_id = ?", teacherID).Delete(&models.TeacherCourse{}).Error; err != nil {
			return err
		}

		// 删除班级管理关联
		if err := tx.Model(&models.Class{}).Where("head_teacher_id = ?", teacherID).
			Update("head_teacher_id", nil).Error; err != nil {
			return err
		}

		// 删除用户资料
		if err := tx.Where("user_id = ?", teacherID).Delete(&models.UserProfile{}).Error; err != nil {
			return err
		}

		// 删除用户角色
		if err := tx.Where("user_id = ?", teacherID).Delete(&models.UserRole{}).Error; err != nil {
			return err
		}

		// 删除基础用户
		return tx.Delete(&models.User{}, teacherID).Error
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
