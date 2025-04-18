package vm

import "github.com/gin-gonic/gin"

func Register(router *gin.Engine) {
	// 虚拟机路由组
	vmGroup := router.Group("/virtualmachines")
	{
		vmGroup.POST("/create-vm", CreateVMHandler)
		vmGroup.GET("/get-experiment-vms/:experimentId", GetExperimentVMsHandler)
		vmGroup.POST("/delete-vm", DeleteVMHandler)

		// 新增虚拟机状态回调接口
		vmGroup.POST("/vm-status-callback", VMStatusCallbackHandler)
	}
}
