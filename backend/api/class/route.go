package class

import "github.com/gin-gonic/gin"

func Register(router *gin.Engine) {
	// 班级路由组
	classGroup := router.Group("/classes")
	{
		classGroup.POST("/", CreateClass)
		classGroup.GET("/", GetClasses)
		classGroup.GET("/:id", GetClass)
		classGroup.PUT("/:id", UpdateClass)
		classGroup.DELETE("/:id", DeleteClass)
	}
}
