import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskRound as Flask, ChevronRight, Clock, Award } from 'lucide-react';
import { ExperimentAPI } from '../../api';
import type { Experiment } from '../../types';

function LabList() {
  const navigate = useNavigate();
  const [labs, setLabs] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 从 localStorage 获取用户角色
  const userRole = localStorage.getItem('userRole') || 'student';
  const isTeacher = userRole === 'teacher';

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setLoading(true);
        const response = await ExperimentAPI.getExperiments();
        setLabs(response);
      } catch (err) {
        setError('获取实验列表失败');
        console.error('Error fetching labs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '入门级';
      case 'intermediate':
        return '进阶级';
      case 'advanced':
        return '高级';
      default:
        return '未知';
    }
  };

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
        {isTeacher && (
          <button
            onClick={() => navigate('/labs/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Flask className="h-5 w-5 mr-2" />
            创建实验
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => (
          <div 
            key={lab.experimentId} 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/labs/${lab.experimentId}`)}
          >
            <h3 className="text-lg font-medium text-gray-900">{lab.experimentName}</h3>
            <p className="text-sm text-gray-500 mt-1">{lab.description}</p>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(lab.difficultyLevel)}`}>
                  <Award className="h-4 w-4 mr-1" />
                  {getDifficultyText(lab.difficultyLevel)}
                </span>
                <span className="inline-flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {lab.duration || '45分钟'}
                </span>
              </div>

              {!isTeacher && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>完成进度</span>
                    <span>{lab.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${lab.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {isTeacher && (
              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <span>创建时间: {new Date(lab.createdAt).toLocaleDateString()}</span>
                <ChevronRight className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      {labs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无实验数据</p>
          {isTeacher && (
            <button
              onClick={() => navigate('/labs/create')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Flask className="h-5 w-5 mr-2" />
              创建第一个实验
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default LabList;