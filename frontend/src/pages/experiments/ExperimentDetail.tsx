import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flask, Monitor, Terminal, Play } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { Experiment, VMDetailResponse } from '../../types';

function ExperimentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [vmDetails, setVmDetails] = useState<VMDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const experimentId = Number(id);
        const [experimentResponse, vmResponse] = await Promise.all([
          apiClient.getExperiment(experimentId),
          apiClient.getVirtualMachine(experimentId)
        ]);
        setExperiment(experimentResponse);
        setVmDetails(vmResponse);
      } catch (err) {
        setError('获取实验详情失败');
        console.error('Error fetching experiment details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>{error || '实验不存在'}</p>
          <button 
            onClick={() => navigate('/experiments')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            返回实验列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <button
        onClick={() => navigate('/experiments')}
        className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
      >
        ← 返回实验列表
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Flask className="h-6 w-6 mr-2" />
          {experiment.experimentName}
        </h2>
        <p className="text-gray-600 mt-2">{experiment.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900">虚拟机状态</h3>
            <Monitor className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {vmDetails?.status || '未创建'}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-900">创建时间</h3>
            <Terminal className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {new Date(experiment.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-purple-900">实验进度</h3>
            <Play className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">进行中</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">虚拟机配置</h3>
        <div className="bg-gray-50 rounded-lg p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
            {vmDetails?.vmDetails || '暂无配置信息'}
          </pre>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => navigate(`/experiments/${experiment.experimentId}/edit`)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          编辑实验
        </button>
        <button
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          启动实验
        </button>
      </div>
    </div>
  );
}

export default ExperimentDetail;