package login

import "github.com/gin-gonic/gin"

func Register(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/register", RegisterHandler)
		auth.POST("/login", LoginHandler)
	}
}
