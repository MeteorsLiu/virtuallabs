import { Check, Search, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { User } from '../../types';

function AddStudent() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Get all students
        const response = await apiClient.getStudents();
        setStudents(response);
      } catch (err) {
        setError('获取学生列表失败');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleStudentSelect = (userId: number) => {
    setSelectedStudents(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!classId || selectedStudents.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Add each selected student to the class
      await Promise.all(
        selectedStudents.map(studentId => {
          const student = students.find(s => s.userId === studentId);
          if (student) {
            return apiClient.addStudentToClass(Number(classId), student);
          }
        })
      );

      navigate(`/classes/${classId}`);
    } catch (err) {
      setError('添加学生失败，请重试');
      console.error('Error adding students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentInfo?.studentNumber.includes(searchTerm)
  );

  if (loading && students.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <UserPlus className="h-6 w-6 mr-2" />
          添加学生
        </h2>
        <button
          onClick={() => navigate(`/classes/${classId}`)}
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

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="搜索学生姓名或学号..."
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                选择
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                学号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                姓名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                性别
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                联系方式
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr
                key={student.userId}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedStudents.includes(student.userId) ? 'bg-indigo-50' : ''
                }`}
                onClick={() => handleStudentSelect(student.userId)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`h-5 w-5 border rounded flex items-center justify-center ${
                    selectedStudents.includes(student.userId)
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedStudents.includes(student.userId) && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </div>
                </td>
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

      <div className="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate(`/classes/${classId}`)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedStudents.length === 0 || loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '添加中...' : `添加所选学生 (${selectedStudents.length})`}
        </button>
      </div>
    </div>
  );
}

export default AddStudent;
