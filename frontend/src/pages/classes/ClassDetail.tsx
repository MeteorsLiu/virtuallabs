import { UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { Class, User } from '../../types';

function ClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole') || 'student';
  const isTeacher = userRole === 'teacher';

  console.log(userRole)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const classId = Number(id);
        const [classResponse, studentsResponse] = await Promise.all([
          apiClient.getClass(classId),
          apiClient.getStudentsByClass(classId)
        ]);
        setClassData(classResponse);
        setStudents(studentsResponse);
      } catch (err) {
        setError('Failed to fetch class details');
        console.error('Error fetching class details:', err);
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

  if (error || !classData) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>{error || '班级不存在'}</p>
          <button
            onClick={() => navigate('/classes')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            返回班级列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <button
        onClick={() => navigate('/classes')}
        className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
      >
        ← 返回班级列表
      </button>

      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{classData.className}</h2>
          {isTeacher && (
            <button
              onClick={() => navigate(`/classes/${id}/students/add`)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              添加学生
            </button>
          )}
        </div>
        <p className="text-gray-600 mt-2">创建时间: {new Date(classData.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">总人数</h3>
          <p className="text-2xl font-bold text-blue-600">{students.length}人</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900">平均成绩</h3>
          <p className="text-2xl font-bold text-green-600">计算中</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900">课程进度</h3>
          <p className="text-2xl font-bold text-purple-600">计算中</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">学生列表</h3>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">性别</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系方式</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.userId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.studentInfo?.studentNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.profile.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.profile.phone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {students.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">暂无学生数据</p>
          {isTeacher && (
            <button
              onClick={() => navigate(`/classes/${id}/students/add`)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              添加学生
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ClassDetail;
