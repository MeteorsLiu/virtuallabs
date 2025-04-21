package main

import (
	"flag"

	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/MeteorsLiu/virtuallabs/backend/api/class"
	"github.com/MeteorsLiu/virtuallabs/backend/api/courses"
	"github.com/MeteorsLiu/virtuallabs/backend/api/experiment"
	"github.com/MeteorsLiu/virtuallabs/backend/api/login"
	"github.com/MeteorsLiu/virtuallabs/backend/api/student"
	"github.com/MeteorsLiu/virtuallabs/backend/api/teacher"
	"github.com/MeteorsLiu/virtuallabs/backend/api/vm"
	"github.com/gin-gonic/gin"
)

// 程序入口，设置 Gin 路由
func main() {
	var dsn string
	flag.StringVar(&dsn, "dsn", "", "MySQL DSN")
	flag.Parse()

	api.InitDB("123456", dsn)
	router := gin.Default()

	router.Static("/uploads", "./uploads")

	router.Use(api.UseCORS())

	login.Register(router)

	vm.Register(router)
	class.Register(router)
	courses.Register(router)
	student.Register(router)
	teacher.Register(router)
	experiment.Register(router)

	router.Run(":8888")
}
