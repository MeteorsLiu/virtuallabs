import { ChevronRight, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { Class } from '../../types';

function ClassList() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole') || 'student';
  const isTeacher = userRole === 'teacher';

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiClient.getClasses();
        setClasses(response);
      } catch (err) {
        setError('Failed to fetch classes');
        console.error('Error fetching classes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
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
        <h2 className="text-2xl font-bold text-gray-900">班级管理</h2>
        {isTeacher && (
          <button
            onClick={() => navigate('/classes/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            创建班级
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <div
            key={classItem.classId}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/classes/${classItem.classId}`)}
          >
            <h3 className="text-lg font-medium text-gray-900">{classItem.className}</h3>
            <p className="text-sm text-gray-500 mt-1">创建时间: {new Date(classItem.createdAt).toLocaleDateString()}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {classItem.headTeacherId ? `班主任: ${classItem.HeadTeacher?.username}` : '暂无班主任'}
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无班级数据</p>
          {isTeacher ? (
            <button
              onClick={() => navigate('/classes/create')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              创建第一个班级
            </button>
          ) : (
            <p className="mt-2 text-sm text-gray-500">请等待教师创建班级并邀请你加入</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ClassList;
