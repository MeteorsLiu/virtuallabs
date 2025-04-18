import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskRound as Flask, ChevronRight } from 'lucide-react';

function LabList() {
  const navigate = useNavigate();
  const isTeacher = true;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">实验管理</h2>
        {isTeacher && (
          <button
            onClick={() => navigate('/labs/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Flask className="h-5 w-5 mr-2" />
            创建实验
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['部署第一个Pod', '配置持久化存储', '实现服务发现'].map((labName) => (
          <div 
            key={labName} 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/labs/${encodeURIComponent(labName)}`)}
          >
            <h3 className="text-lg font-medium text-gray-900">{labName}</h3>
            <p className="text-sm text-gray-500 mt-1">难度: {['入门级', '进阶级', '高级'][Math.floor(Math.random() * 3)]}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">完成率: {Math.floor(Math.random() * 20) + 80}%</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LabList;