package student

import (
	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/gin-gonic/gin"
)

func Register(router *gin.Engine) {
	student := router.Group("/students")
	{
		student.POST("", api.RoleMiddleware("admin"), CreateStudent)
		student.GET("", api.RoleMiddleware("teacher", "admin"), GetStudents)
		student.GET("/:id", api.RoleMiddleware("teacher", "admin"), GetStudentDetails)
		student.PUT("/:id", UpdateStudent) // 学生可修改自己
		student.DELETE("/:id", api.RoleMiddleware("admin"), DeleteStudent)
	}
}
