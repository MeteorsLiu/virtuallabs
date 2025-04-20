package class

import (
	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/gin-gonic/gin"
)

func Register(router *gin.Engine) {
	// 班级路由组
	router.Use(api.JWTAuthMiddleware())

	classGroup := router.Group("/classes")
	{
		classGroup.POST("/", CreateClass)
		classGroup.GET("/", GetClasses)
		classGroup.GET("/:id", GetClass)
		classGroup.GET("/:id/students", GetClassStudents)
		classGroup.PUT("/:id", UpdateClass)
		classGroup.PUT("/:id/student", AddStudentToClass)
		classGroup.DELETE("/:id", DeleteClass)
	}
}
