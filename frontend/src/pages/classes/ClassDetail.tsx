import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <button
        onClick={() => navigate('/classes')}
        className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
      >
        ← 返回班级列表
      </button>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{id}</h2>
        <p className="text-gray-600 mt-2">班级代码: KC-2024-001</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">总人数</h3>
          <p className="text-2xl font-bold text-blue-600">25人</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900">平均成绩</h3>
          <p className="text-2xl font-bold text-green-600">85分</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900">课程进度</h3>
          <p className="text-2xl font-bold text-purple-600">75%</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">完成实验</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均分</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024{String(i).padStart(4, '0')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">学生{i}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Math.floor(Math.random() * 5) + 5}/10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Math.floor(Math.random() * 20) + 80}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClassDetail;