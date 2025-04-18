import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Clock, Award, BarChart } from 'lucide-react';

const chapters = [
  {
    id: 1,
    title: '容器基础',
    duration: '45分钟',
    description: 'Docker的基本概念和使用方法',
  },
  {
    id: 2,
    title: '部署实践',
    duration: '45分钟',
    description: 'Kubernetes的部署流程和注意事项',
  },
  {
    id: 3,
    title: '高级特性',
    duration: '45分钟',
    description: '服务发现和负载均衡',
  },
];

function CourseDetail() {
  const navigate = useNavigate();
  const { id: courseId } = useParams();

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
            src="https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=400"
            alt={courseId}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
        <div className="w-2/3">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{courseId}</h2>
          <p className="text-gray-600 mb-4">
            本课程将带领学生深入了解容器技术和云原生应用开发，通过实践案例掌握核心概念和技能。
          </p>
          <div className="flex gap-4">
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-1" />
              <span>12课时</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Award className="h-5 w-5 mr-1" />
              <span>中级难度</span>
            </div>
            <div className="flex items-center text-gray-600">
              <BarChart className="h-5 w-5 mr-1" />
              <span>85%好评</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">课程大纲</h3>
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              to={`/courses/${encodeURIComponent(courseId!)}/chapter/${chapter.id}`}
              className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">第{chapter.id}章: {chapter.title}</h4>
                <span className="text-sm text-gray-500">{chapter.duration}</span>
              </div>
              <p className="text-gray-600 mt-2">{chapter.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;