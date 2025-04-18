import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight } from 'lucide-react';

function ClassList() {
  const navigate = useNavigate();
  const isTeacher = true;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">班级管理</h2>
        {isTeacher && (
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <UserPlus className="h-5 w-5 mr-2" />
            添加学生
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['K8s基础班', 'Docker进阶班', 'Cloud Native实践班'].map((className) => (
          <div 
            key={className} 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" 
            onClick={() => navigate(`/classes/${encodeURIComponent(className)}`)}
          >
            <h3 className="text-lg font-medium text-gray-900">{className}</h3>
            <p className="text-sm text-gray-500 mt-1">学生数量: {Math.floor(Math.random() * 30) + 10}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">班主任: {['张老师', '李老师', '王老师'][Math.floor(Math.random() * 3)]}</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClassList;