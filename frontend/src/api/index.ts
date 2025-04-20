import axios, { AxiosInstance } from "axios";

// 创建 Axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:8888", // 后台 API 服务器地址
  headers: {
    "Content-Type": "application/json",
  },

});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 实验相关接口
export class ExperimentAPI {
  // 创建实验
  static async createExperiment(experimentData: {
    experimentName: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: string;
    content: string;
    tasks: { title: string; }[];
    courseId?: number;
  }) {
    try {
      const response = await apiClient.post("/experiments/", experimentData);
      return response.data;
    } catch (error) {
      console.error("Create experiment error:", error);
      throw error;
    }
  }

  // 获取所有实验
  static async getExperiments() {
    try {
      const response = await apiClient.get("/experiments/");
      return response.data;
    } catch (error) {
      console.error("Get experiments error:", error);
      throw error;
    }
  }

  // 获取单个实验
  static async getExperiment(id: number) {
    try {
      const response = await apiClient.get(`/experiments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get experiment error:", error);
      throw error;
    }
  }

  // 更新实验信息
  static async updateExperiment(id: number, experimentData: {
    experimentName?: string;
    description?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    duration?: string;
    content?: string;
    tasks?: { title: string; }[];
    courseId?: number;
  }) {
    try {
      const response = await apiClient.put(`/experiments/${id}`, experimentData);
      return response.data;
    } catch (error) {
      console.error("Update experiment error:", error);
      throw error;
    }
  }

  // 删除实验
  static async deleteExperiment(id: number) {
    try {
      const response = await apiClient.delete(`/experiments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete experiment error:", error);
      throw error;
    }
  }

  // 更新任务状态
  static async updateTaskStatus(experimentId: number, taskId: string, completed: boolean) {
    try {
      const response = await apiClient.put(`/experiments/${experimentId}/tasks/${taskId}`, { completed });
      return response.data;
    } catch (error) {
      console.error("Update task status error:", error);
      throw error;
    }
  }

  // 获取虚拟机状态
  static async getVirtualMachine(experimentId: number) {
    try {
      const response = await apiClient.get(`/experiments/${experimentId}/vm`);
      return response.data;
    } catch (error) {
      console.error("Get virtual machine error:", error);
      throw error;
    }
  }

  // 创建虚拟机
  static async createVirtualMachine(vmData: {
    vmName: string;
    experimentId: number;
    vmDetails: string;
  }) {
    try {
      const response = await apiClient.post('/virtualmachines/', vmData);
      return response.data;
    } catch (error) {
      console.error("Create virtual machine error:", error);
      throw error;
    }
  }

  // 更新虚拟机
  static async updateVirtualMachine(id: number, vmData: {
    vmName?: string;
    experimentId?: number;
    vmDetails?: string;
  }) {
    try {
      const response = await apiClient.put(`/virtualmachines/${id}`, vmData);
      return response.data;
    } catch (error) {
      console.error("Update virtual machine error:", error);
      throw error;
    }
  }

  // 删除虚拟机
  static async deleteVirtualMachine(id: number) {
    try {
      const response = await apiClient.delete(`/virtualmachines/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete virtual machine error:", error);
      throw error;
    }
  }
}

export type {
  AxiosInstance
};
