package experiment

import "github.com/gin-gonic/gin"

func Register(router *gin.Engine) {
	// 实验路由组
	experimentGroup := router.Group("/experiments")
	{
		experimentGroup.POST("/", CreateExperiment)
		experimentGroup.GET("/", GetExperiments)
		experimentGroup.GET("/:id", GetExperiment)
		experimentGroup.PUT("/:id", UpdateExperiment)
		experimentGroup.DELETE("/:id", DeleteExperiment)
	}
}
