import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskRound as Flask, Plus, Trash2, Upload, FileCode, Container } from 'lucide-react';

interface DockerConfig {
  type: 'image' | 'dockerfile';
  image?: string;
  dockerfile?: string;
  customImage?: string;
}

function CreateLab() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [duration, setDuration] = useState('');
  const [dockerConfig, setDockerConfig] = useState<DockerConfig>({
    type: 'image',
    image: 'ubuntu:latest'
  });

  const commonImages = [
    'ubuntu:latest',
    'nginx:latest',
    'mysql:8',
    'node:18',
    'python:3.9',
    'golang:1.21'
  ];

  const handleDockerfileChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDockerConfig({
      type: 'dockerfile',
      dockerfile: e.target.value
    });
  };

  const handleImageSelect = (image: string) => {
    setDockerConfig({
      type: 'image',
      image
    });
  };

  const handleCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDockerConfig({
      type: 'image',
      image: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log({
      title,
      description,
      difficulty,
      duration,
      dockerConfig
    });
    navigate('/labs');
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              实验名称
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="beginner">入门级</option>
            <option value="intermediate">进阶级</option>
            <option value="advanced">高级</option>
          </select>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">容器配置</h3>
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setDockerConfig({ type: 'image', image: 'ubuntu:latest' })}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  dockerConfig.type === 'image'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Container className="h-5 w-5 mx-auto mb-2" />
                使用现有镜像
              </button>
              <button
                type="button"
                onClick={() => setDockerConfig({ type: 'dockerfile', dockerfile: '' })}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  dockerConfig.type === 'dockerfile'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileCode className="h-5 w-5 mx-auto mb-2" />
                自定义 Dockerfile
              </button>
            </div>

            {dockerConfig.type === 'image' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {commonImages.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => handleImageSelect(image)}
                      className={`p-4 rounded-lg border text-left ${
                        dockerConfig.image === image
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Container className={`h-5 w-5 mb-2 ${
                        dockerConfig.image === image ? 'text-indigo-500' : 'text-gray-400'
                      }`} />
                      <div className="font-medium">{image}</div>
                    </button>
                  ))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自定义镜像
                  </label>
                  <input
                    type="text"
                    value={dockerConfig.image}
                    onChange={handleCustomImage}
                    placeholder="输入镜像名称和标签，如：python:3.9-slim"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dockerfile 内容
                </label>
                <textarea
                  value={dockerConfig.dockerfile}
                  onChange={handleDockerfileChange}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="FROM ubuntu:latest&#10;&#10;RUN apt-get update && \&#10;    apt-get install -y python3"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/labs')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            创建实验
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateLab;