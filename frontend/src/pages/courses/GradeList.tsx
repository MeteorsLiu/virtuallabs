import { Award, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import type { StudentGrade } from '../../types';

interface GradeListProps {
  courseId: number;
}

function GradeList({ courseId }: GradeListProps) {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRole = localStorage.getItem('userRole') || 'student';
  const isTeacher = userRole === 'teacher';

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await apiClient.getStudentGrade(courseId);
        setGrades(response);
      } catch (err) {
        setError('获取成绩失败');
        console.error('Error fetching grades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [courseId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">暂无成绩数据</p>
      </div>
    );
  }

  const calculateTotalScore = (grade: StudentGrade) => {
    return (grade.score / grade.Assessment.maxScore) * 100;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">课程成绩</h3>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isTeacher && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  学生
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                考核项目
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                得分/满分
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                权重
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                评语
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                考核日期
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {grades.map((grade) => (
              <tr key={grade.gradeId}>
                {isTeacher && grade.student && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {grade.student.username}
                      </div>
                      <div className="ml-2 text-sm text-gray-500">
                        {grade.student.studentInfo?.studentNumber}
                      </div>
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{grade.Assessment.assessmentName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{grade.Assessment.assessmentType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Award className="h-4 w-4 mr-1" />
                    {grade.score}/{grade.Assessment.maxScore}
                    <span className="ml-1 text-gray-500">
                      ({calculateTotalScore(grade).toFixed(1)}%)
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{grade.Assessment.weight}x</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{grade.gradeComment || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(grade.Assessment.assessmentDate).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GradeList;
