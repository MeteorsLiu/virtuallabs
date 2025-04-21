import { Award, Clock, Edit, Loader, Play, Terminal, Trash2, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExperimentAPI } from '../../api';
import { apiClient } from '../../api/client';
import type { Experiment, VMDetailResponse } from '../../types';

function LabDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lab, setLab] = useState<Experiment | null>(null);
  const [vmDetails, setVmDetails] = useState<VMDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingVM, setIsCreatingVM] = useState(false);
  const [vmStatusPolling, setVmStatusPolling] = useState<ReturnType<typeof setInterval> | null>(null);

  const userRole = localStorage.getItem('userRole') || 'student';
  const isTeacher = userRole === 'teacher';

  const pollVMStatus = useCallback(async (experimentId: number) => {
    try {
      const response = await apiClient.getVirtualMachine(experimentId);
      setVmDetails(response[0]);

      // If VM is still being created, continue polling
      if (response[0].status === 'pending') {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error polling VM status:', err);
      return false;
    }
  }, []);

  const startVMStatusPolling = useCallback((experimentId: number) => {
    const intervalId = setInterval(async () => {
      const shouldContinue = await pollVMStatus(experimentId);
      if (!shouldContinue) {
        clearInterval(intervalId);
        setVmStatusPolling(null);
      }
    }, 5000); // Poll every 5 seconds

    setVmStatusPolling(intervalId);
    return intervalId;
  }, [pollVMStatus]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const experimentId = Number(id);
        const [experimentResponse, vmResponse] = await Promise.all([
          ExperimentAPI.getExperiment(experimentId),
          apiClient.getVirtualMachine(experimentId).catch(() => null)
        ]);
        setLab(experimentResponse);
        setVmDetails(vmResponse ? vmResponse[0] : null);

        // If VM exists and is still being created, start polling
        if (vmResponse && vmResponse?.[0]?.status === 'pending') {
          startVMStatusPolling(experimentId);
        }
      } catch (err) {
        setError('获取实验详情失败');
        console.error('Error fetching experiment details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (vmStatusPolling) {
        clearInterval(vmStatusPolling);
      }
    };
  }, [id, startVMStatusPolling]);

  const handleCreateVM = async () => {
    if (!lab) return;

    try {
      setIsCreatingVM(true);
      const response = await apiClient.createVirtualMachine({
        experimentId: lab.experimentId,
        vmDetails: 'Standard Lab Environment'
      });
      setVmDetails(response);
      startVMStatusPolling(lab.experimentId);
    } catch (err) {
      console.error('Error creating VM:', err);
      setError('创建虚拟机失败');
    } finally {
      setIsCreatingVM(false);
    }
  };

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

  const renderVMStatus = () => {
    if (!vmDetails) {
      return (
        <button
          onClick={handleCreateVM}
          disabled={isCreatingVM}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isCreatingVM ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
              创建虚拟机中...
            </>
          ) : (
            <>
              <Terminal className="h-5 w-5 mr-2" />
              创建虚拟机
            </>
          )}
        </button>
      );
    }

    if (vmDetails.status === 'pending') {
      return (
        <div className="text-center py-4">
          <Loader className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-2" />
          <p className="text-gray-600">虚拟机创建中，请稍候...</p>
        </div>
      );
    }

    if (vmDetails.status === 'running') {
      return (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-2 bg-gray-800">
            <div className="flex space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-gray-400 text-sm">终端</span>
          </div>
          <iframe
            src={`http://localhost:${6080+vmDetails.vmId}`}
            className="w-full h-96 border-0"
            title="Lab Terminal"
          />
        </div>
      );
    }

    return (
      <div className="text-center py-4">
        <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">虚拟机创建失败</p>
        <button
          onClick={handleCreateVM}
          className="mt-2 text-indigo-600 hover:text-indigo-800"
        >
          重试
        </button>
      </div>
    );
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
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(lab.Course.difficultyLevel)}`}>
            <Award className="h-4 w-4 mr-1" />
            {getDifficultyText(lab.Course.difficultyLevel)}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-4 w-4 mr-1" />
            预计时间: 45分钟
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">实验说明</h3>
            <div className="prose max-w-none">
              {lab.description.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          </div>

          {!isTeacher && (
            <div>
              <h3 className="text-lg font-semibold mb-4">实验环境</h3>
              {renderVMStatus()}
            </div>
          )}
        </div>

        <div>
          {!isTeacher ? (
            <>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">实验进度</h3>
                <div className="space-y-4">
                    <div  className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{lab.experimentName}</span>
                      <XCircle className="h-5 w-5 text-gray-300" />

                    </div>
                </div>
              </div>

              <button
                className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                disabled={!vmDetails || vmDetails.status !== 'running'}
              >
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
