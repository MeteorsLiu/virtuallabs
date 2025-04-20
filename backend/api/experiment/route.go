package experiment

import (
	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/gin-gonic/gin"
)

func Register(router *gin.Engine) {
	// 实验路由组
	router.Use(api.JWTAuthMiddleware())

	experimentGroup := router.Group("/experiments")
	{
		experimentGroup.POST("/", CreateExperiment)
		experimentGroup.GET("/", GetExperiments)
		experimentGroup.GET("/:id", GetExperiment)
		experimentGroup.PUT("/:id", UpdateExperiment)
		experimentGroup.DELETE("/:id", DeleteExperiment)
	}
}
