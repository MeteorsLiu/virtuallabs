import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';

function CourseList() {
  const navigate = useNavigate();
  const isTeacher = true;

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
        {['Kubernetes入门实践', 'Docker容器化部署', '微服务架构实战'].map((courseName) => (
          <div 
            key={courseName} 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/courses/${encodeURIComponent(courseName)}`)}
          >
            <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              <img
                src={`https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=400`}
                alt={courseName}
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{courseName}</h3>
            <p className="text-sm text-gray-500 mt-1">课时: {Math.floor(Math.random() * 10) + 8}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">授课教师: {['张老师', '李老师', '王老师'][Math.floor(Math.random() * 3)]}</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseList;