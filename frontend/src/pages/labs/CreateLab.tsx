import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskRound as Flask, Plus, FileCode } from 'lucide-react';
import { ExperimentAPI } from '../../api';

function CreateLab() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    experimentName: '',
    description: '',
    difficulty: 'beginner' as const,
    duration: '',
    content: '',
    tasks: [{ title: '环境准备' }, { title: '实验操作' }, { title: '结果验证' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ExperimentAPI.createExperiment(formData);
      navigate('/labs');
    } catch (err) {
      setError('创建实验失败，请重试');
      console.error('Error creating lab:', err);
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
          onClick={() => navigate('/labs')}
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
        <div className="grid grid-cols-2 gap-6">
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
              预计时长
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="如：45分钟"
              required
            />
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            难度级别
          </label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="beginner">入门级</option>
            <option value="intermediate">进阶级</option>
            <option value="advanced">高级</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            实验内容
          </label>
          <div className="bg-gray-50 rounded-lg p-4 mb-2">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <FileCode className="h-4 w-4 mr-2" />
              支持 Markdown 格式
            </div>
          </div>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="# 实验指南

## 实验目标

## 实验步骤

1. 
2. 
3. 

## 注意事项"
            required
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/labs')}
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

export default CreateLab;