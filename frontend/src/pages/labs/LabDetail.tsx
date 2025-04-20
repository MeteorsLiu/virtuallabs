import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Terminal, Award, Clock, Play, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { ExperimentAPI } from '../../api';
import type { Experiment } from '../../types';

function LabDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lab, setLab] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '$ kubectl version',
    'Client Version: v1.28.0',
    'Server Version: v1.28.0',
    '$ _'
  ]);

  // 从 localStorage 获取用户角色
  const userRole = localStorage.getItem('userRole') || 'student';
  const isTeacher = userRole === 'teacher';

  useEffect(() => {
    const fetchLab = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const response = await ExperimentAPI.getExperiment(Number(id));
        setLab(response);
      } catch (err) {
        setError('获取实验详情失败');
        console.error('Error fetching lab:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLab();
  }, [id]);

  const handleDelete = async () => {
    if (!lab || !window.confirm('确定要删除这个实验吗？')) return;
    
    try {
      await ExperimentAPI.deleteExperiment(lab.experimentId);
      navigate('/labs');
    } catch (err) {
      console.error('Error deleting lab:', err);
    }
  };

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
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>{error || '实验不存在'}</p>
          <button 
            onClick={() => navigate('/labs')}
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
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={() => navigate('/labs')}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
        >
          ← 返回实验列表
        </button>

        {isTeacher && (
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/labs/${lab.experimentId}/edit`)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              编辑
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              删除
            </button>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{lab.experimentName}</h2>
        <div className="flex gap-4 mt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(lab.difficultyLevel)}`}>
            <Award className="h-4 w-4 mr-1" />
            {getDifficultyText(lab.difficultyLevel)}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-4 w-4 mr-1" />
            预计时间: {lab.duration}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">实验说明</h3>
            <div className="prose max-w-none">
              {lab.content.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          </div>

          {!isTeacher && (
            <div>
              <h3 className="text-lg font-semibold mb-4">终端环境</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <Terminal className="h-5 w-5 text-gray-400" />
                </div>
                <div className="font-mono text-sm text-gray-300">
                  {terminalOutput.map((line, index) => (
                    <p key={index} className={index < 2 ? 'text-gray-500' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          {!isTeacher ? (
            <>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">实验进度</h3>
                <div className="space-y-4">
                  {lab.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{task.title}</span>
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
                <Play className="h-5 w-5 mr-2" />
                继续实验
              </button>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">实验统计</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">学生参与数</span>
                  <span className="font-medium">12人</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">平均完成时间</span>
                  <span className="font-medium">38分钟</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">完成率</span>
                  <span className="font-medium">85%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LabDetail;