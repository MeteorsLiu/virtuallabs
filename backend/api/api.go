package api

import (
	"encoding/base64"
	"net/http"
	"strconv"
	"time"

	. "github.com/MeteorsLiu/virtuallabs/backend/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// DB 为全局数据库操作句柄
var DB *gorm.DB

// initDB 初始化数据库连接，并自动迁移所有模型
func InitDB(secret, dsn string) {
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("数据库连接失败：" + err.Error())
	}
	DB.Set("gorm:table_options", "ENGINE=InnoDB CHARSET=utf8mb4")

	// 自动迁移所有模型
	DB.AutoMigrate(
		// 第一阶段：核心独立表
		&User{},   // 用户基础信息
		&Course{}, // 必须优先于所有课程相关表

		// 第二阶段：课程体系
		&CourseChapter{},    // 依赖 Course
		&CourseAssessment{}, // 依赖 Course

		// 第三阶段：成绩和题目系统
		&StudentGrade{},   // 依赖 CourseAssessment
		&Question{},       // 依赖 Course 和 CourseChapter
		&QuestionOption{}, // 依赖 Question

		// 第四阶段：其他关联表
		&Class{},
		&StudentClass{},
		&TeacherClass{},
		&Enrollment{},
		&TeacherCourse{},
		&Experiment{},
		&TeacherExperiment{},
		&VirtualMachine{},
		&StudentVirtualMachine{},
		&StudentAnswer{},
		&StudentAnswerOption{},
	)

	JwtSecret = []byte(secret)
}

// hashPassword 对密码进行 SHA256 哈希
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(hashedPassword), nil
}

func ToTime(unixTime string) (time.Time, error) {
	i, err := strconv.ParseInt(unixTime, 10, 64)
	if err != nil {
		return time.Time{}, err
	}
	return time.Unix(i, 0), nil
}

// 修改后的角色中间件
func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "未认证用户"})
			return
		}

		for _, role := range allowedRoles {
			if role == userRole {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "权限不足"})
	}
}
