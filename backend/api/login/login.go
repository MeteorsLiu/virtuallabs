package login

import (
	"errors"
	"net/http"
	"time"

	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/MeteorsLiu/virtuallabs/backend/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// 请求结构体
type RegisterRequest struct {
	Username  string `json:"username" binding:"required,min=5,max=50"`
	Password  string `json:"password" binding:"required,min=8,max=50"`
	Role      string `json:"role" binding:"required,oneof=student teacher"`
	StudentNo string `json:"studentNo,omitempty"` // 仅学生需要
	Gender    string `json:"gender" binding:"oneof=male female other"`
	Email     string `json:"email" binding:"required,email"`
	Phone     string `json:"phone" binding:"omitempty,e164"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// 响应结构体
type AuthResponse struct {
	UserID    int    `json:"userId"`
	Username  string `json:"username"`
	Role      string `json:"role"`
	Token     string `json:"token"`
	ExpiresAt int64  `json:"expiresAt"`
}

// 注册处理器
func RegisterHandler(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
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

	// 密码哈希
	hashedPassword, err := api.HashPassword(req.Password)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "密码处理失败"})
		return
	}

	// 创建用户
	user := models.User{
		Username:     req.Username,
		PasswordHash: hashedPassword,
		CreatedAt:    time.Now(),
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			c.JSON(http.StatusConflict, gin.H{"error": "用户名已存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "用户创建失败"})
		return
	}

	// 创建角色
	userRole := models.UserRole{
		UserID: user.UserID,
		Role:   req.Role,
	}
	if err := tx.Create(&userRole).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "角色分配失败"})
		return
	}

	// 创建用户资料
	profile := models.UserProfile{
		UserID: user.UserID,
		Gender: req.Gender,
		Email:  req.Email,
		Phone:  req.Phone,
	}
	if err := tx.Create(&profile).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "资料保存失败"})
		return
	}

	// 学生特殊处理
	if req.Role == "student" {
		if req.StudentNo == "" {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "学号必填"})
			return
		}
		studentInfo := models.StudentInformation{
			UserID:        user.UserID,
			StudentNumber: req.StudentNo,
		}
		if err := tx.Create(&studentInfo).Error; err != nil {
			tx.Rollback()
			if errors.Is(err, gorm.ErrDuplicatedKey) {
				c.JSON(http.StatusConflict, gin.H{"error": "学号已存在"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "学生信息保存失败"})
			return
		}
	}

	tx.Commit()
	c.JSON(http.StatusCreated, gin.H{"message": "注册成功"})
}

// 登录处理器
func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 获取用户
	var user models.User
	err := api.DB.Preload("Role").
		Where("username = ?", req.Username).
		First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户不存在"})
		return
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(req.Password),
	); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "密码错误"})
		return
	}

	// 生成JWT
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &api.Claims{
		UserID: user.UserID,
		Role:   user.Role.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(api.JwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "令牌生成失败"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		UserID:    user.UserID,
		Username:  user.Username,
		Role:      user.Role.Role,
		Token:     tokenString,
		ExpiresAt: expirationTime.Unix(),
	})
}
