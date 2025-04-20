import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flask, BookOpen, Terminal } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { Course } from '../../types';

function CreateExperiment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    experimentName: '',
    description: '',
    courseId: '',
    vmName: '',
    vmDetails: ''
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiClient.getCourses();
        setCourses(response);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create experiment
      const experiment = await apiClient.createExperiment({
        experimentName: formData.experimentName,
        courseId: Number(formData.courseId),
        description: formData.description
      });

      // Create virtual machine for the experiment
      await apiClient.createVirtualMachine({
        vmName: formData.vmName,
        experimentId: experiment.experimentId,
        vmDetails: formData.vmDetails
      });

      navigate(`/experiments/${experiment.experimentId}`);
    } catch (err) {
      setError('创建实验失败，请重试');
      console.error('Error creating experiment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Flask className="h-6 w-6 mr-2" />
          创建新实验
        </h2>
        <button
          onClick={() => navigate('/experiments')}
          className="text-gray-600 hover:text-gray-900"
        >
          取消
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            实验名称
          </label>
          <input
            type="text"
            name="experimentName"
            value={formData.experimentName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="输入实验名称"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            所属课程
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">选择课程</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            实验描述
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="详细描述实验内容和目标"
            required
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">虚拟机配置</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                虚拟机名称
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Terminal className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="vmName"
                  value={formData.vmName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="输入虚拟机名称"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                配置详情
              </label>
              <textarea
                name="vmDetails"
                value={formData.vmDetails}
                onChange={handleChange}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="输入虚拟机配置信息（如：CPU、内存、存储等）"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/experiments')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '创建中...' : '创建实验'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateExperiment;