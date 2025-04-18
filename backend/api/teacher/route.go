package teacher

import (
	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/gin-gonic/gin"
)

func Register(router *gin.Engine) {
	// 教师路由组
	teacher := router.Group("/teachers")
	{
		teacher.POST("", api.RoleMiddleware("admin"), CreateTeacher)
		teacher.GET("", api.RoleMiddleware("admin", "teacher"), GetTeachers)
		teacher.GET("/:id", api.RoleMiddleware("admin", "teacher"), GetTeacherDetails)
		teacher.PUT("/:id", UpdateTeacher) // 教师可修改自己
		teacher.DELETE("/:id", api.RoleMiddleware("admin"), DeleteTeacher)
	}
}
