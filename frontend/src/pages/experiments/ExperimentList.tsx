import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskRound as Flask, ChevronRight } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { Experiment } from '../../types';

function ExperimentList() {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const response = await apiClient.getExperiments();
        setExperiments(response);
      } catch (err) {
        setError('获取实验列表失败');
        console.error('Error fetching experiments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">实验管理</h2>
        <button
          onClick={() => navigate('/experiments/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Flask className="h-5 w-5 mr-2" />
          创建实验
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experiments.map((experiment) => (
          <div 
            key={experiment.experimentId} 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/experiments/${experiment.experimentId}`)}
          >
            <h3 className="text-lg font-medium text-gray-900">{experiment.experimentName}</h3>
            <p className="text-sm text-gray-500 mt-1">{experiment.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                创建时间: {new Date(experiment.createdAt).toLocaleDateString()}
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {experiments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无实验数据</p>
          <button
            onClick={() => navigate('/experiments/create')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Flask className="h-5 w-5 mr-2" />
            创建第一个实验
          </button>
        </div>
      )}
    </div>
  );
}

export default ExperimentList;