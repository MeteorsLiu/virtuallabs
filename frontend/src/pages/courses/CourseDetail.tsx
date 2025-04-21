import { Award, BarChart, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { Course, CourseChapter } from '../../types';
import GradeList from './GradeList';

function CourseDetail() {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chapters' | 'grades'>('chapters');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!courseId) return;
        const id = Number(courseId);
        const [courseResponse, chaptersResponse] = await Promise.all([
          apiClient.getCourseDetail(id),
          apiClient.getChapters(id)
        ]);
        setCourse(courseResponse);
        setChapters(chaptersResponse);
      } catch (err) {
        setError('Failed to fetch course details');
        console.error('Error fetching course details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="flex gap-6">
            <div className="w-1/3 h-48 bg-gray-200 rounded"></div>
            <div className="w-2/3 space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>{error || '课程不存在'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            返回课程列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <button
        onClick={() => navigate('/courses')}
        className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
      >
        ← 返回课程列表
      </button>

      <div className="flex gap-6 mb-8">
        <div className="w-1/3">
          <img
            src={`http://localhost:8888${course.coverUrl}` || "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=400"}
            alt={course.courseName}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
        <div className="w-2/3">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.courseName}</h2>
          <p className="text-gray-600 mb-4">
            {course.description || '本课程将带领学生深入了解容器技术和云原生应用开发，通过实践案例掌握核心概念和技能。'}
          </p>
          <div className="flex gap-4">
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-1" />
              <span>{chapters.length}课时</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Award className="h-5 w-5 mr-1" />
              <span>{course.difficultyLevel}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <BarChart className="h-5 w-5 mr-1" />
              <span>创建于 {new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('chapters')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chapters'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            课程大纲
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'grades'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            课程成绩
          </button>
        </nav>
      </div>

      {activeTab === 'chapters' ? (
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <Link
              key={chapter.chapterId}
              to={`/courses/${courseId}/chapter/${chapter.chapterId}`}
              className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">第{chapter.sortOrder}章: {chapter.chapterTitle}</h4>
              </div>
              <p className="text-gray-600 mt-2">{chapter.chapterDescription}</p>
            </Link>
          ))}

          {chapters.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">暂无章节内容</p>
              <button
                onClick={() => navigate(`/courses/${courseId}/chapters/create`)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                添加章节
              </button>
            </div>
          )}
        </div>
      ) : (
        <GradeList courseId={Number(courseId)} />
      )}
    </div>
  );
}

export default CourseDetail;
