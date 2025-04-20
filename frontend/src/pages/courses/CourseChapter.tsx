import { BookOpen, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { CourseChapter } from '../../types';
import AssessmentManager from './AssessmentManager';
import StudentAssessmentView from './StudentAssessmentView';

function CourseChapterView() {
  const navigate = useNavigate();
  const { courseId, chapterId } = useParams();
  const [chapter, setChapter] = useState<CourseChapter | null>(null);
  const [teacherComment, setTeacherComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole') || 'student';
  const isTeacher = userRole === 'teacher';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!courseId || !chapterId) return;
        const chapters = await apiClient.getChapters(Number(courseId));
        const currentChapter = chapters.find(c => c.chapterId === Number(chapterId));
        if (currentChapter) {
          setChapter(currentChapter);
        } else {
          throw new Error('Chapter not found');
        }
      } catch (err) {
        setError('Failed to fetch chapter details');
        console.error('Error fetching chapter details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, chapterId]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>{error || '章节不存在'}</p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            返回课程详情
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
      >
        ← 返回课程详情
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BookOpen className="h-6 w-6 mr-2" />
          第{chapter.sortOrder}章 {chapter.chapterTitle}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* 课程内容 */}
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">课程视频</h3>
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg mb-6">
              {chapter.videoUrl ? (
                <video src={chapter.videoUrl} controls className="w-full h-full rounded-lg" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-500">暂无视频内容</span>
                </div>
              )}
            </div>

            <h3 className="text-xl font-semibold mb-4">章节内容</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="prose max-w-none">
                {chapter.chapterDescription}
              </div>
            </div>
          </div>

          {/* 试题管理/练习区域 */}
          <div className="border-t pt-6">
            {isTeacher ? (
              <AssessmentManager
                courseId={Number(courseId)}
                chapterId={Number(chapterId)}
              />
            ) : (
              <StudentAssessmentView
                courseId={Number(courseId)}
                chapterId={Number(chapterId)}
              />
            )}
          </div>
        </div>

        {/* 右侧边栏 */}
        <div className="border-l pl-6">
          <h3 className="text-xl font-semibold mb-4">学习进度</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">完成情况</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>视频观看</span>
                  <span className="font-medium text-green-600">已完成</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>练习完成</span>
                  <span className="font-medium text-yellow-600">进行中</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学习笔记
              </label>
              <textarea
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
                rows={4}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="记录你的学习心得..."
              ></textarea>
            </div>

            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              <Send className="h-4 w-4 mr-2" />
              保存笔记
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseChapterView;
