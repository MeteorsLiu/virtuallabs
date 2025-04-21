package courses

import (
	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/gin-gonic/gin"
)

func Register(router *gin.Engine) {
	// 课程路由组
	course := router.Group("/courses")
	course.Use(api.JWTAuthMiddleware())
	{
		course.POST("/", api.RoleMiddleware("teacher"), CreateCourse)
		course.GET("/", GetCourses)
		course.GET("/:courseId", GetCourseDetail)
		course.PUT("/:courseId", api.RoleMiddleware("teacher"), UpdateCourse)
		course.DELETE("/:courseId", api.RoleMiddleware("teacher"), DeleteCourse)

		// 章节路由
		course.POST("/:courseId/chapters", api.RoleMiddleware("teacher"), CreateChapter)
		course.GET("/:courseId/chapters", GetChapters)

		// 评分项路由
		course.POST("/:courseId/assessments", api.RoleMiddleware("teacher"), CreateAssessment)

		course.GET("/assessments/", GetCourseAssessments)

		course.POST("/assessments/:assessmentId/submit", api.RoleMiddleware("student"), SubmitAnswer)

		course.POST("/assessments/question/", api.RoleMiddleware("teacher"), CreateQuestion)

		course.GET("/assessments/:assessmentId/questions", GetAssessmentQuestions)

		course.POST("/:courseId/enroll", api.RoleMiddleware("student"), EnrollCourse)
		course.DELETE("/:courseId/enroll", api.RoleMiddleware("student"), UnenrollCourse)
		course.GET("/enrollments", api.RoleMiddleware("student"), GetStudentEnrollments)

	}
}
