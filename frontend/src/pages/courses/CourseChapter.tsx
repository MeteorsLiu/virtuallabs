import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, CheckCircle, XCircle, Send } from 'lucide-react';

const mockQuestions = [
  {
    id: 1,
    question: '以下哪个命令用于查看所有运行中的容器？',
    options: [
      'docker ps',
      'docker list',
      'docker show',
      'docker containers',
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: 'Kubernetes中，Pod的重启策略默认值是什么？',
    options: [
      'Never',
      'OnFailure',
      'Always',
      'Restart',
    ],
    correctAnswer: 2,
  },
];

function CourseChapter() {
  const navigate = useNavigate();
  const { courseId, chapterId } = useParams();
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [teacherComment, setTeacherComment] = useState('');
  const isTeacher = true; // 这里应该从用户状态中获取

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

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
          第{chapterId}章 课程内容
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* 课程内容 */}
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">课程视频</h3>
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg mb-6">
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-500">课程视频播放区域</span>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4">章节内容</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="mb-4">
                本章节将介绍容器技术的核心概念和基本使用方法。通过实践练习，你将掌握：
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>容器化应用的基本概念</li>
                <li>Docker的安装和配置</li>
                <li>容器的生命周期管理</li>
                <li>镜像的创建和使用</li>
              </ul>
            </div>
          </div>

          {/* 练习题 */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">课后练习</h3>
            <div className="space-y-6">
              {mockQuestions.map((q, qIndex) => (
                <div key={q.id} className="bg-gray-50 rounded-lg p-6">
                  <p className="font-medium mb-4">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => (
                      <label
                        key={oIndex}
                        className={`flex items-center p-3 rounded-lg cursor-pointer ${
                          selectedAnswers[qIndex] === oIndex
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'bg-white border'
                        } ${
                          submitted
                            ? oIndex === q.correctAnswer
                              ? 'border-green-500'
                              : selectedAnswers[qIndex] === oIndex
                              ? 'border-red-500'
                              : 'border-gray-200'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={oIndex}
                          checked={selectedAnswers[qIndex] === oIndex}
                          onChange={() => handleAnswerSelect(qIndex, oIndex)}
                          disabled={submitted}
                          className="mr-3"
                        />
                        <span>{option}</span>
                        {submitted && (
                          oIndex === q.correctAnswer ? (
                            <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                          ) : selectedAnswers[qIndex] === oIndex ? (
                            <XCircle className="ml-auto h-5 w-5 text-red-500" />
                          ) : null
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!submitted && (
              <button
                onClick={handleSubmit}
                className="mt-6 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                提交答案
              </button>
            )}
          </div>
        </div>

        {/* 教师评分区域 */}
        <div className="border-l pl-6">
          <h3 className="text-xl font-semibold mb-4">教师评分</h3>
          {isTeacher ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">学生完成情况</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>答题正确率</span>
                    <span className="font-medium text-green-600">80%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>完成时间</span>
                    <span>2024-03-15 14:30</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评语
                </label>
                <textarea
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="请输入评语..."
                ></textarea>
              </div>

              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Send className="h-4 w-4 mr-2" />
                提交评分
              </button>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              等待教师评分...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseChapter;