import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Terminal } from 'lucide-react';

function LabDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <button
        onClick={() => navigate('/labs')}
        className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
      >
        ← 返回实验列表
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{id}</h2>
        <div className="flex gap-4 mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            入门级
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            预计时间: 45分钟
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">实验说明</h3>
            <p className="text-gray-600 mb-4">
              本实验将指导你完成Kubernetes中Pod的创建和管理，包括以下内容：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>创建基本的Pod配置文件</li>
              <li>使用kubectl命令行工具</li>
              <li>查看Pod状态和日志</li>
              <li>排查常见问题</li>
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">终端环境</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <Terminal className="h-5 w-5 text-gray-400" />
              </div>
              <div className="font-mono text-sm text-gray-300">
                <p>$ kubectl version</p>
                <p className="text-gray-500">Client Version: v1.28.0</p>
                <p className="text-gray-500">Server Version: v1.28.0</p>
                <p>$ _</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">实验进度</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>环境准备</span>
                  <span>100%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Pod创建</span>
                  <span>60%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>状态检查</span>
                  <span>0%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-gray-300 rounded-full" style={{width: '0%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <button className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            继续实验
          </button>
        </div>
      </div>
    </div>
  );
}

export default LabDetail;