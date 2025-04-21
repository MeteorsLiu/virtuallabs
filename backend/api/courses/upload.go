package courses

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadMetadata struct {
	UploadType string `json:"uploadType" binding:"required,oneof=courseCover chapterVideo"`
	TargetID   int    `json:"targetId" binding:"required"`
}

// 文件上传接口
func UploadFile(c *gin.Context) {
	// 获取上传文件
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文件上传失败"})
		return
	}

	// 解析元数据
	metadataJSON := c.PostForm("metadata")
	var metadata UploadMetadata
	if err := json.Unmarshal([]byte(metadataJSON), &metadata); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "元数据格式错误"})
		return
	}

	// 创建存储目录
	savePath := getSavePath(metadata)
	if err := os.MkdirAll(savePath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建存储目录失败"})
		return
	}

	// 生成唯一文件名
	ext := filepath.Ext(file.Filename)
	fileName := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
	fullPath := filepath.Join(savePath, fileName)

	// 保存文件
	if err := c.SaveUploadedFile(file, fullPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "文件保存失败"})
		return
	}

	// 返回访问URL
	c.JSON(http.StatusOK, gin.H{
		"url": fmt.Sprintf("/uploads/%s/%d/%s",
			metadata.UploadType,
			metadata.TargetID,
			fileName),
	})
}

// 获取存储路径
func getSavePath(meta UploadMetadata) string {
	return filepath.Join("uploads", meta.UploadType, strconv.Itoa(meta.TargetID))
}
