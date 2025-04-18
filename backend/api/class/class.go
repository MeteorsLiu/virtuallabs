package class

import (
	"net/http"
	"strconv"
	"time"

	"github.com/MeteorsLiu/virtuallabs/backend/api"
	"github.com/MeteorsLiu/virtuallabs/backend/models"
	"github.com/gin-gonic/gin"
)

//
// 班级接口
//

// CreateClass 新增班级
func CreateClass(c *gin.Context) {
	var input models.Class
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	input.CreatedAt = time.Now()
	if err := api.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, input)
}

// GetClasses 获取班级列表
func GetClasses(c *gin.Context) {
	var classes []models.Class
	if err := api.DB.Preload("HeadTeacher").Find(&classes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, classes)
}

// GetClass 根据 ID 获取单个班级信息
func GetClass(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var class models.Class
	if err := api.DB.Preload("HeadTeacher").Where("class_id = ?", id).First(&class).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}
	c.JSON(http.StatusOK, class)
}

// UpdateClass 更新班级信息
func UpdateClass(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var class models.Class
	if err := api.DB.Where("class_id = ?", id).First(&class).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}
	if err := c.ShouldBindJSON(&class); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := api.DB.Save(&class).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, class)
}

// DeleteClass 删除班级
func DeleteClass(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := api.DB.Delete(&models.Class{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Class deleted"})
}
