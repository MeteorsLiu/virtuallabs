import { BookOpen, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { Course, Enrollment } from '../../types';

function CourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole') || 'student';
  const isTeacher = userRole === 'teacher';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, enrollmentsResponse] = await Promise.all([
          apiClient.getCourses(),
          !isTeacher ? apiClient.getEnrollments() : Promise.resolve([])
        ]);
        setCourses(coursesResponse);
        setEnrollments(enrollmentsResponse);
      } catch (err) {
        setError('获取课程列表失败');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isTeacher]);

  const handleEnroll = async (courseId: number) => {
    try {
      await apiClient.enroll(courseId);
      // Refresh enrollments after successful enrollment
      const updatedEnrollments = await apiClient.getEnrollments();
      setEnrollments(updatedEnrollments);
    } catch (err) {
      console.error('Error enrolling in course:', err);
    }
  };

  const handleUnenroll = async (courseId: number) => {
    if (!window.confirm('确定要退出这门课程吗？')) {
      return;
    }

    try {
      await apiClient.unenroll(courseId);
      // Refresh enrollments after successful unenrollment
      const updatedEnrollments = await apiClient.getEnrollments();
      setEnrollments(updatedEnrollments);
    } catch (err) {
      console.error('Error unenrolling from course:', err);
    }
  };

  const isEnrolled = (courseId: number) => {
    return enrollments.some(enrollment => enrollment.courseId === courseId);
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
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
        <h2 className="text-2xl font-bold text-gray-900">课程管理</h2>
        {isTeacher && (
          <button
            onClick={() => navigate('/courses/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            创建课程
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.courseId}
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div
              onClick={() => navigate(`/courses/${course.courseId}`)}
              className="cursor-pointer"
            >
              <div className="h-40 bg-gray-100">
                <img
                  src={course.coverUrl || `https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=400`}
                  alt={course.courseName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{course.courseName}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {course.description || '暂无描述'}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    难度: {course.difficultyLevel}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            {!isTeacher && (
              <div className="px-4 py-3 bg-gray-50 border-t">
                {isEnrolled(course.courseId) ? (
                  <button
                    onClick={() => handleUnenroll(course.courseId)}
                    className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                  >
                    退出课程
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.courseId)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    加入课程
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无课程数据</p>
          {isTeacher && (
            <button
              onClick={() => navigate('/courses/create')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              创建第一个课程
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CourseList;
