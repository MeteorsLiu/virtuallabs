package vm

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/MeteorsLiu/virtuallabs/backend/models"
	"github.com/MeteorsLiu/virtuallabs/backend/queue"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

//
// 虚拟机接口
//

// 请求结构体
type CreateVMRequest struct {
	ExperimentID int    `json:"experimentId" binding:"required"`
	VMDetails    string `json:"vmDetails"`
}

type DeleteVMRequest struct {
	VMName string `json:"vmName" binding:"required"`
}

// 响应结构体
type VMDetailResponse struct {
	VMName       string    `json:"vmName"`
	ExperimentID int       `json:"experimentId"`
	VMDetails    string    `json:"vmDetails"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"createdAt"`
}

// 创建虚拟机（学生）
func CreateVMHandler(c *gin.Context) {
	// 从JWT获取用户信息
	userID := c.GetInt("userID")
	userRole := c.GetString("userRole")

	// 仅允许学生操作
	if userRole != "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "仅限学生操作"})
		return
	}

	var req CreateVMRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 检查是否已存在实验关联的VM
	var existVM models.VirtualMachine
	err := api.DB.
		Joins("JOIN student_virtual_machines ON virtual_machines.vm_id = student_virtual_machines.vm_id").
		Where("student_virtual_machines.student_id = ? AND virtual_machines.experiment_id = ?", userID, req.ExperimentID).
		First(&existVM).Error

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "每个实验只能创建一个虚拟机"})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "数据库查询失败"})
		return
	}

	tx := api.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 生成UUID作为业务ID
	vmUUID := uuid.New().String()
	newVM := models.VirtualMachine{
		VMName:       vmUUID,
		ExperimentID: req.ExperimentID,
		VMDetails:    req.VMDetails,
	}

	if err := tx.Create(&newVM).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建虚拟机失败"})
		return
	}

	// 建立学生与虚拟机的永久关联
	svm := models.StudentVirtualMachine{
		StudentID:       userID,
		VMID:            newVM.VMID,
		AccessStartTime: time.Now(),
	}

	if err := tx.Create(&svm).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "关联学生失败"})
		return
	}

	// 发送创建请求
	if err := queue.CreateVM(newVM.VMID, newVM.VMName); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "请求处理失败"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusCreated, VMDetailResponse{
		VMName:       newVM.VMName,
		ExperimentID: newVM.ExperimentID,
		VMDetails:    newVM.VMDetails,
		Status:       "初始化中",
		CreatedAt:    time.Now(),
	})
}

// 获取实验虚拟机列表
func GetExperimentVMsHandler(c *gin.Context) {
	experimentID, _ := strconv.Atoi(c.Param("experimentId"))
	userRole := c.GetString("userRole")

	query := api.DB.Model(&models.VirtualMachine{}).
		Where("experiment_id = ?", experimentID)

	// 学生只能查看自己的虚拟机
	if userRole == "student" {
		userID := c.GetInt("userID")
		query = query.
			Joins("JOIN student_virtual_machines ON virtual_machines.vm_id = student_virtual_machines.vm_id").
			Where("student_virtual_machines.student_id = ?", userID)
	}

	var vms []models.VirtualMachine
	if err := query.Find(&vms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	response := make([]VMDetailResponse, 0, len(vms))
	for _, vm := range vms {
		response = append(response, VMDetailResponse{
			VMName:       vm.VMName,
			ExperimentID: vm.ExperimentID,
			VMDetails:    vm.VMDetails,
			Status:       "运行中", // 实际应从业务系统获取
		})
	}

	c.JSON(http.StatusOK, response)
}

// 删除虚拟机
func DeleteVMHandler(c *gin.Context) {
	userID := c.GetInt("userID")
	userRole := c.GetString("userRole")

	var req DeleteVMRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 查询虚拟机信息
	var vm models.VirtualMachine
	if err := api.DB.Where("vm_name = ?", req.VMName).First(&vm).Error; err != nil {
		handleVMError(c, err)
		return
	}

	// 权限验证（学生只能删除自己的）
	if userRole == "student" {
		var count int64
		api.DB.Model(&models.StudentVirtualMachine{}).
			Where("student_id = ? AND vm_id = ?", userID, vm.VMID).
			Count(&count)

		if count == 0 {
			c.JSON(http.StatusForbidden, gin.H{"error": "无权操作该虚拟机"})
			return
		}
	}

	tx := api.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 删除虚拟机（级联删除关联关系）
	if err := tx.Delete(&vm).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	// 发送删除请求
	if err := queue.DeleteVM(vm.VMID, vm.VMName); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除请求发送失败"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "删除操作已提交"})
}

func handleVMError(c *gin.Context, err error) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "虚拟机不存在"})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "数据库错误"})
	}
}

// 状态回调请求结构
type VMStatusCallbackRequest struct {
	VMName    string    `json:"vmName" binding:"required"`
	Status    string    `json:"status" binding:"required,oneof=creating running stopped error"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

// 状态回调处理器
func VMStatusCallbackHandler(c *gin.Context) {
	var req VMStatusCallbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 查找虚拟机
	var vm models.VirtualMachine
	if err := api.DB.Where("vm_name = ?", req.VMName).First(&vm).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "虚拟机不存在"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "数据库查询失败"})
		return
	}

	// 更新状态
	updateData := map[string]interface{}{
		"status":       req.Status,
		"status_msg":   req.Message,
		"last_updated": req.Timestamp,
	}

	if err := api.DB.Model(&vm).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "状态更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "状态更新成功"})
}
